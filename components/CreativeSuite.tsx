
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Sparkles, Image as ImageIcon, Wand2, Paintbrush, Download, Upload, Loader2, Maximize2 } from 'lucide-react';

const CreativeSuite: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'simulator' | 'lab' | 'material'>('simulator');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const contents = {
        parts: [
          { text: activeSubTab === 'simulator' 
            ? `As an architectural visualizer, create a highly realistic 3D render based on: ${prompt}. Professional lighting, 8k resolution, photorealistic.`
            : `AI Image Editor: Modify this uploaded image according to these instructions: ${prompt}`
          }
        ]
      };

      // Adding image if in lab mode and image exists
      if (activeSubTab === 'lab' && uploadedImage) {
        contents.parts.push({
          inlineData: {
            data: uploadedImage.split(',')[1],
            mimeType: 'image/jpeg'
          }
        } as any);
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: contents as any,
      });

      for (const part of (response as any).candidates[0].content.parts) {
        if (part.inlineData) {
          setGeneratedImageUrl(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (error) {
      console.error('Generation failed:', error);
      alert('AI 影像生成暫時無法使用，請檢查 API 金鑰或網路。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col h-full space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Creative Suite</h2>
          <p className="text-sm font-medium text-gray-400 mt-1 uppercase tracking-widest">Nano Banana AI 影像與模擬核心</p>
        </div>
        
        <div className="segmented-control flex p-1 bg-gray-200/50 rounded-2xl">
          {[
            { id: 'simulator', label: '空間模擬', icon: Wand2 },
            { id: 'lab', label: '影像精修', icon: Paintbrush },
            { id: 'material', label: '材質生成', icon: Sparkles },
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
        {/* Input Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="apple-card p-8 h-full flex flex-col">
            <h3 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-2">
              <Sparkles className="text-[#007AFF]" size={20} />
              AI 指令中心
            </h3>
            
            <div className="flex-1 space-y-8">
              {activeSubTab === 'lab' && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative h-48 border-2 border-dashed rounded-[24px] flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                    uploadedImage ? 'border-[#007AFF] bg-blue-50/10' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                  {uploadedImage ? (
                    <img src={uploadedImage} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Upload preview" />
                  ) : (
                    <>
                      <Upload className="text-gray-300 mb-2" size={32} />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">點擊或拖放照片</span>
                    </>
                  )}
                </div>
              )}

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">
                  {activeSubTab === 'simulator' ? '描述您想要的空間風格' : '修改指令'}
                </label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={activeSubTab === 'simulator' ? "例如: 北歐極簡風格客廳, 落地窗, 橡木地板, 柔和夕陽光..." : "例如: 將牆面改為深灰色石材, 並在地板加上一塊波西米亞地毯..."}
                  className="w-full h-40 bg-gray-50 border border-gray-100 rounded-[20px] p-5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#007AFF] outline-none transition-all resize-none"
                />
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className={`mt-8 w-full py-4 rounded-[18px] font-bold flex items-center justify-center gap-3 transition-all ${
                isGenerating || !prompt ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#007AFF] text-white shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95'
              }`}
            >
              {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
              {isGenerating ? 'AI 正在思考與生成...' : '啟動 AI 模擬與渲染'}
            </button>
          </div>
        </div>

        {/* Output Display */}
        <div className="lg:col-span-8">
          <div className="apple-card h-full bg-[#1C1C1E] relative flex flex-col items-center justify-center overflow-hidden p-4">
             {generatedImageUrl ? (
               <div className="relative w-full h-full group animate-in zoom-in-95 duration-700">
                  <img src={generatedImageUrl} className="w-full h-full object-contain rounded-[18px]" alt="Generated" />
                  <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition shadow-xl">
                      <Download size={20} />
                    </button>
                    <button className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition shadow-xl">
                      <Maximize2 size={20} />
                    </button>
                  </div>
               </div>
             ) : (
               <div className="text-center space-y-6 max-w-sm">
                  <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center mx-auto border border-white/10">
                    <ImageIcon className="text-gray-700" size={40} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-xl mb-2 tracking-tight">等待生成預覽</h4>
                    <p className="text-gray-500 text-sm">輸入指令並點擊按鈕，AI 將在此為您模擬高品質的設計方案。</p>
                  </div>
               </div>
             )}

             <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center pointer-events-none">
                <div className="px-4 py-2 bg-black/40 backdrop-blur border border-white/10 rounded-full text-[10px] font-bold text-white/60 tracking-widest">
                  RENDER ENGINE: GEMINI 2.5 FLASH
                </div>
                {generatedImageUrl && (
                  <div className="px-4 py-2 bg-green-500/20 backdrop-blur border border-green-500/30 rounded-full text-[10px] font-bold text-green-400 tracking-widest">
                    AI OUTPUT READY
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreativeSuite;
