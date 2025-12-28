
import React, { useState } from 'react';

interface WorkflowMindMapProps {
  phases: string[];
  progress: number;
  onUpdate: (newPhases: string[]) => void;
}

const WorkflowMindMap: React.FC<WorkflowMindMapProps> = ({ phases, progress, onUpdate }) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const handleAddPhase = (idx: number) => {
    const name = window.prompt('請輸入新流程名稱：');
    if (name) {
      const newPhases = [...phases];
      newPhases.splice(idx + 1, 0, name);
      onUpdate(newPhases);
    }
  };

  const handleRemovePhase = (idx: number) => {
    if (phases.length <= 1) return;
    if (window.confirm(`確定要刪除「${phases[idx]}」流程節點嗎？`)) {
      const newPhases = phases.filter((_, i) => i !== idx);
      onUpdate(newPhases);
    }
  };

  const handleRenamePhase = (idx: number) => {
    const name = window.prompt('修改流程名稱：', phases[idx]);
    if (name && name !== phases[idx]) {
      const newPhases = [...phases];
      newPhases[idx] = name;
      onUpdate(newPhases);
    }
  };

  return (
    <div className="w-full h-full relative bg-white flex items-center justify-center overflow-auto p-32">
      {/* Soft Blueprint Grid */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ 
        backgroundImage: 'linear-gradient(#007AFF 1px, transparent 1px), linear-gradient(90deg, #007AFF 1px, transparent 1px)', 
        backgroundSize: '40px 40px' 
      }}></div>

      <div className="flex items-center gap-16 relative z-10">
        {phases.map((phase, idx) => {
          const isCompleted = idx < phases.length * (progress / 100);
          const isCurrent = !isCompleted && idx === Math.floor(phases.length * (progress / 100));
          
          return (
            <React.Fragment key={idx}>
              {/* Refined Node */}
              <div 
                className="relative group flex flex-col items-center"
                onMouseEnter={() => setHoverIdx(idx)}
                onMouseLeave={() => setHoverIdx(null)}
              >
                <div 
                  onClick={() => handleRenamePhase(idx)}
                  className={`
                    w-52 p-6 rounded-[24px] border transition-all duration-500 cursor-pointer text-center relative
                    ${isCompleted ? 'bg-[#007AFF] border-[#007AFF] text-white shadow-xl shadow-blue-100' : 
                      isCurrent ? 'bg-white border-blue-500 ring-[12px] ring-blue-50 text-gray-900 scale-110 shadow-2xl' : 
                      'bg-white border-gray-100 text-gray-400 hover:border-gray-300 hover:text-gray-600 shadow-sm'}
                  `}
                >
                  <div className={`text-[9px] font-black uppercase tracking-[0.1em] mb-2 ${isCompleted ? 'text-white/60' : 'text-gray-300'}`}>
                    PHASE {idx + 1}
                  </div>
                  <div className="font-bold text-sm leading-tight tracking-tight">{phase}</div>
                  
                  {isCurrent && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] px-3 py-1 rounded-full font-black shadow-lg">
                      進行中
                    </div>
                  )}

                  {/* Actions Bubble */}
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRemovePhase(idx); }}
                      className="w-8 h-8 bg-red-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-600 transition"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3}/></svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Connector */}
              {idx < phases.length - 1 && (
                <div className="relative flex items-center">
                  <div className={`h-1.5 w-16 rounded-full transition-all duration-1000 ${isCompleted ? 'bg-[#007AFF]' : 'bg-gray-100'}`}></div>
                  
                  <button 
                    onClick={() => handleAddPhase(idx)}
                    className="absolute left-1/2 -translate-x-1/2 w-8 h-8 bg-white border border-gray-200 text-blue-600 rounded-full flex items-center justify-center hover:scale-125 hover:border-blue-500 hover:bg-blue-600 hover:text-white transition shadow-lg z-20 group"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeWidth={3}/></svg>
                  </button>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 apple-glass border border-gray-200/50 rounded-full text-[11px] font-bold text-gray-500 shadow-xl flex gap-8">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#007AFF] rounded-full shadow-sm"></div>
          <span>點擊卡片編輯名稱</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-white border-2 border-blue-100 rounded-full"></div>
          <span>使用 「+」 插入彈性流程</span>
        </div>
      </div>
    </div>
  );
};

export default WorkflowMindMap;
