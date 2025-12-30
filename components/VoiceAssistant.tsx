
import React, { useState, useRef, useCallback } from 'react';
// Fix: Use correct import format for GoogleGenAI as per guidelines
import { GoogleGenAI, Modality, Type, LiveServerMessage, FunctionDeclaration, Blob } from "@google/genai";

// Audio decoding and encoding helpers as per Gemini API guidelines
function decode(base64: string) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Tool declarations for the model to interact with the app
const toolDeclarations: FunctionDeclaration[] = [
  {
    name: 'manage_calendar',
    parameters: {
      type: Type.OBJECT,
      description: 'Schedule a project event in the calendar.',
      properties: {
        projectName: { type: Type.STRING, description: 'The name of the project.' },
        eventTitle: { type: Type.STRING, description: 'The title of the event.' }
      },
      required: ['projectName', 'eventTitle']
    }
  },
  {
    name: 'organize_photos',
    parameters: {
      type: Type.OBJECT,
      description: 'Archive photos to a specific project folder.',
      properties: {
        count: { type: Type.NUMBER, description: 'Number of photos to archive.' },
        path: { type: Type.STRING, description: 'Destination folder path.' }
      },
      required: ['count', 'path']
    }
  },
  {
    name: 'connect_cloud',
    parameters: {
      type: Type.OBJECT,
      description: 'Connect to Google Workspace cloud services.',
      properties: {}
    }
  }
];

interface VoiceAssistantProps {
  onToolCall: (tool: string, args: any) => any;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onToolCall }) => {
  const [isListening, setIsListening] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponseText, setAiResponseText] = useState('');
  
  const audioContextsRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Function to stop the session and cleanup resources
  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsListening(false);
    setIsConnecting(false);
    
    // Stop all active audio playback
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  }, []);

  // Main function to start the Live API session
  const startSession = async () => {
    try {
      setIsConnecting(true);
      setAiResponseText('');
      setTranscript('正在啟動助理...');

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Setup Audio Contexts
      if (!audioContextsRef.current) {
        audioContextsRef.current = {
          input: new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 }),
          output: new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 })
        };
      }
      
      const { input: inputAudioContext, output: outputAudioContext } = audioContextsRef.current;
      const outputNode = outputAudioContext.createGain();
      outputNode.connect(outputAudioContext.destination);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsListening(true);
            setTranscript('請說話，我在聽...');
            
            // Stream audio from the microphone
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };

              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle output transcription
            if (message.serverContent?.outputTranscription) {
              setAiResponseText(prev => prev + message.serverContent!.outputTranscription!.text);
            } else if (message.serverContent?.inputTranscription) {
              setTranscript(prev => (prev === '請說話，我在聽...' ? '' : prev) + message.serverContent!.inputTranscription!.text);
            }

            // Handle audio output
            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), outputAudioContext, 24000, 1);
              const source = outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            // Handle interruptions
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            // Handle function calls (Tools)
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                const result = onToolCall(fc.name, fc.args);
                sessionPromise.then((session) => {
                  session.sendToolResponse({
                    functionResponses: {
                      id: fc.id,
                      name: fc.name,
                      response: { result: result || 'ok' },
                    }
                  });
                });
              }
            }
          },
          onerror: (e) => {
            console.error('Gemini Live error:', e);
            stopSession();
          },
          onclose: () => {
            stopSession();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
          },
          tools: [{ functionDeclarations: toolDeclarations }],
          systemInstruction: `
            你是一個具備深度學習能力的專業設計助理。
            你的核心目標：除了執行指令，更要主動分析使用者的工作習慣並提出優化建議。
            
            規則：
            1. 參考歷史：如果使用者要求排程，請主動思考過去類似案件是否延遲，並提出：「根據上次經驗，這次我們是否要多預留兩天？」
            2. 自動化建議：發現使用者重複性動作時，詢問是否要將其設為自動化腳本。
            3. 語氣：專業、像老練的合夥人、主動、簡短。
            4. 決策權：在進行關鍵操作（如發送請款單）前，引用歷史數據作為建議基礎。
          `,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to start Gemini Live:', err);
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
      <div className={`bg-white/90 backdrop-blur-xl border border-blue-100 shadow-2xl rounded-3xl p-4 transition-all duration-500 ${isListening ? 'ring-4 ring-blue-500/10 scale-105' : ''}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={isListening ? stopSession : startSession}
            disabled={isConnecting}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
              isListening 
              ? 'bg-red-500 text-white shadow-lg shadow-red-200' 
              : 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700'
            }`}
          >
            {isConnecting ? (
              <Loader2 size={24} className="animate-spin" />
            ) : isListening ? (
              <MicOff size={24} />
            ) : (
              <Mic size={24} />
            )}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {isConnecting ? '初始化中' : isListening ? '正在聽取您的指令' : '點擊與 AI 協作助理對話'}
              </span>
            </div>
            <p className={`text-sm font-medium truncate ${isListening ? 'text-gray-800' : 'text-gray-400'}`}>
              {transcript || '「幫我把昨天的監工照片歸檔」'}
            </p>
          </div>

          {(transcript || aiResponseText) && isListening && (
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <MessageSquare size={16} />
            </div>
          )}
        </div>

        {aiResponseText && isListening && (
          <div className="mt-4 pt-4 border-t border-blue-50">
            <div className="bg-blue-50/50 p-3 rounded-2xl">
              <p className="text-xs text-blue-800 leading-relaxed font-medium">
                {aiResponseText}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Simplified SVG Mocks to match the app style
const Mic = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
);
const MicOff = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
);
const MessageSquare = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);
const Loader2 = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);

export default VoiceAssistant;
