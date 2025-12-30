import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Sparkles, Image as ImageIcon, Wand2, Paintbrush, Download, Upload, Loader2, Maximize2, Video, PlayCircle, Key } from 'lucide-react';

const CreativeSuite: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'simulator' | 'lab' | 'veo'>('simulator');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkAndOpenKey = async () => {
    // @ts-ignore
    if (typeof window.aistudio !== 'undefined') {
      // @ts-ignore
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
      }
    }
  };

  const handleGenerateVideo = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setGeneratedVideoUrl(null);
    setStatusMessage('正在初始化 Veo 影片引擎...');

    try {
      await checkAndOpenKey();
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `Architectural flythrough: ${prompt}. Professional cinematography, smooth drone movement, cinematic lighting.`,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: '16:9'
        }
      });

      const messages = [
        "正在構建三維幾何體...",
        "正在計算全局光照...",
        "正在模擬材質反射...",
        "AI 正在進行最後的影格渲染...",
        "正在優化影片壓縮編碼..."
      ];
      let msgIdx = 0;

      while (!operation.done) {
        setStatusMessage(messages[msgIdx % messages.length]);
        msgIdx++;
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await videoResponse.blob();
        setGeneratedVideoUrl(URL.createObjectURL(blob));
      }
    } catch (error) {
      console.error('Video generation failed:', error);
      alert('影片生成失敗，請確認是否已在 AISTUDIO 選擇付費 API Key。');
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setStatusMessage('AI 正在構思您的設計...');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const contents = {
        parts: [{ text: `High-end design render: ${prompt}. Photorealistic, 8k.` }]
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: contents as any,
        config: {
          imageConfig: { aspectRatio: "16:9", imageSize: "1K" }
        }
      });

      for (const part of (response as any).candidates[0].content.parts) {
        if (part.inlineData) {
          setGeneratedImageUrl(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col h-full space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Creative Suite</h2>
          <p className="text-sm font-medium text-gray-400 mt-1 uppercase tracking-widest">Nano Banana & Veo 智慧影像核心</p>
        </div>
        
        <div className="segmented-control flex p-1 bg-gray-200/50 rounded-2xl">
          {[
            { id: 'simulator', label: '設計渲染', icon: Wand2 },
            { id: 'veo', label: 'Veo 影片', icon: Video },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === tab.id ? 'bg-white shadow-sm text-[#007AFF]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        <div className="lg:col-span-4 space-y-6">
          <div className="apple-card p-8 h-full flex flex-col">
            <h3 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-2">
              <Sparkles className="text-[#007AFF]" size={20} />
              AI 創意中心
            </h3>
            
            <div className="flex-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">
                {activeSubTab === 'veo' ? '建築漫遊腳本描述' : '空間風格描述'}
              </label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={activeSubTab === 'veo' ? "例如: 穿越一座現代極簡的湖邊別墅，陽光透過百葉窗，照向大理石地板..." : "例如: 工業風咖啡廳, 裸露紅磚牆, 鎢絲燈光..."}
                className="w-full h-48 bg-gray-50 border border-gray-100 rounded-[20px] p-5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
              />
              
              {activeSubTab === 'veo' && (
                <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="flex gap-2 text-amber-700">
                    <Key size={14} className="shrink-0 mt-1" />
                    <p className="text-[10px] font-bold leading-tight">使用 Veo 需要選擇付費專案 API Key。影片生成約需 2-5 分鐘。</p>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={activeSubTab === 'veo' ? handleGenerateVideo : handleGenerateImage}
              disabled={isGenerating || !prompt}
              className={`mt-8 w-full py-4 rounded-[18px] font-bold flex items-center justify-center gap-3 transition-all ${
                isGenerating || !prompt ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white shadow-xl hover:bg-black active:scale-95'
              }`}
            >
              {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <PlayCircle size={20} />}
              {isGenerating ? 'AI 正在處理中...' : (activeSubTab === 'veo' ? '生成建築漫遊影片' : '渲染設計圖')}
            </button>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="apple-card h-full bg-[#1C1C1E] relative flex flex-col items-center justify-center overflow-hidden">
             {isGenerating && (
               <div className="text-center z-10">
                 <Loader2 size={48} className="text-blue-500 animate-spin mx-auto mb-6" />
                 <p className="text-white font-bold tracking-tight animate-pulse">{statusMessage}</p>
                 <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">請勿關閉視窗</p>
               </div>
             )}

             {!isGenerating && activeSubTab === 'veo' && generatedVideoUrl && (
                <video src={generatedVideoUrl} controls className="w-full h-full object-contain" autoPlay loop />
             )}

             {!isGenerating && activeSubTab !== 'veo' && generatedImageUrl && (
                <img src={generatedImageUrl} className="w-full h-full object-contain" alt="Generated" />
             )}

             {!isGenerating && !generatedImageUrl && !generatedVideoUrl && (
               <div className="text-center space-y-4 opacity-30">
                  <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto">
                    {activeSubTab === 'veo' ? <Video className="text-white" size={32} /> : <ImageIcon className="text-white" size={32} />}
                  </div>
                  <p className="text-white text-xs font-bold uppercase tracking-widest">等待生成靈感</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreativeSuite;