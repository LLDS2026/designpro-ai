
import React, { useState } from 'react';
import { Project } from '../types';
import DrawingCanvas from './DrawingCanvas';
import WorkflowMindMap from './WorkflowMindMap';
// Fix: Added missing import for TrendingUp icon
import { TrendingUp } from 'lucide-react';

interface ProjectDetailsProps {
  project: Project;
  onBack: () => void;
  onUpdateWorkflow: (phases: string[]) => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, onBack, onUpdateWorkflow }) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'files' | 'finance' | 'sketch' | 'flow'>('flow');

  const tabs = [
    { id: 'flow', label: '流程地圖' },
    { id: 'timeline', label: '任務列表' },
    { id: 'files', label: '文件庫' },
    { id: 'sketch', label: '圖面標註' },
    { id: 'finance', label: '收支明細' }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-gray-400 hover:text-[#007AFF] transition-all duration-300"
        >
          <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center group-hover:border-[#007AFF]/30 group-hover:bg-blue-50">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </div>
          <span className="text-sm font-bold">返回主頁</span>
        </button>

        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white border border-gray-200 rounded-[14px] text-gray-600 text-xs font-bold hover:bg-gray-50 transition shadow-sm">
            專案設定
          </button>
          <button className="px-5 py-2.5 bg-[#007AFF] text-white rounded-[14px] text-xs font-bold hover:bg-[#0062cc] transition shadow-lg shadow-blue-100">
            導出 PDF 報告
          </button>
        </div>
      </div>

      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 bg-blue-50 text-[#007AFF] rounded-md text-[10px] font-black uppercase tracking-tighter border border-blue-100/50">
              {project.type} 專案
            </span>
            <span className="text-[11px] font-bold text-gray-300 tracking-widest">NO. {project.id.padStart(4, '0')}</span>
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none">{project.name}</h2>
        </div>
        
        <div className="text-right">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">完成進度</p>
           <div className="flex items-center gap-3">
             <span className="text-2xl font-black text-gray-900">{project.progress}%</span>
             <div className="w-32 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#007AFF]" style={{ width: `${project.progress}%` }}></div>
             </div>
           </div>
        </div>
      </div>

      <div className="apple-card flex-1 flex flex-col overflow-hidden">
        {/* iOS style Segmented Control */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="segmented-control flex max-w-2xl mx-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-1.5 text-[12px] font-bold segmented-item ${
                  activeTab === tab.id 
                  ? 'segmented-item-active text-gray-900' 
                  : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-[#FBFBFD]">
          {activeTab === 'flow' && (
            <div className="h-[600px] rounded-[24px] border border-gray-200 overflow-hidden shadow-inner bg-white">
              <WorkflowMindMap 
                phases={project.phases} 
                progress={project.progress} 
                onUpdate={onUpdateWorkflow}
              />
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              {project.phases.map((phase, idx) => {
                const isCompleted = idx < project.phases.length * (project.progress / 100);
                const isCurrent = !isCompleted && idx === Math.floor(project.phases.length * (project.progress / 100));
                
                return (
                  <div key={idx} className={`apple-card p-6 border-2 transition-all ${
                    isCurrent ? 'border-[#007AFF] scale-[1.02] shadow-xl' : 'border-transparent'
                  }`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black ${
                        isCompleted ? 'bg-green-100 text-green-600' : isCurrent ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {idx + 1}
                      </div>
                      {isCompleted && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">已完工</span>}
                      {isCurrent && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">當前重點</span>}
                    </div>
                    <h4 className={`font-bold text-lg ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>{phase}</h4>
                    <p className="text-xs text-gray-400 mt-2">點擊查看此階段詳情或廠商資訊</p>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 animate-in fade-in duration-500">
              {['合約_V1.pdf', '平面圖_Final.dwg', '施工進度表.xlsx', '監工照片', '材料選樣', '報價清單'].map((f, i) => (
                <div key={i} className="apple-card p-6 flex flex-col items-center hover:scale-105 group">
                  <div className="w-14 h-14 bg-[#F5F5F7] rounded-[16px] flex items-center justify-center mb-4 text-[#007AFF] group-hover:bg-blue-50 transition">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  </div>
                  <span className="text-[11px] font-bold text-gray-700 truncate w-full text-center">{f}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'sketch' && (
            <div className="h-[600px] rounded-[24px] overflow-hidden border border-gray-200">
               <DrawingCanvas />
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="p-8 rounded-[28px] bg-gray-900 text-white shadow-2xl">
                    <p className="text-gray-400 text-[10px] font-black uppercase mb-2 tracking-widest">預計總毛利</p>
                    <h4 className="text-3xl font-black">NT$ 1,245,000</h4>
                    <div className="mt-6 flex items-center gap-2 text-green-400 text-[11px] font-bold">
                       <TrendingUp size={14} /> +12.4% 較預期
                    </div>
                 </div>
                 <div className="apple-card p-8">
                    <p className="text-gray-400 text-[10px] font-black uppercase mb-2 tracking-widest">已結清</p>
                    <h4 className="text-3xl font-black text-gray-900">NT$ 850,000</h4>
                 </div>
                 <div className="apple-card p-8">
                    <p className="text-gray-400 text-[10px] font-black uppercase mb-2 tracking-widest">應付帳款</p>
                    <h4 className="text-3xl font-black text-red-500">NT$ 420,000</h4>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
