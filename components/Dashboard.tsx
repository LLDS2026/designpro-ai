
import React, { useState } from 'react';
import { Project, ToolAction, AIInsight } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BrainCircuit, Zap, TrendingUp, Lightbulb, ChevronRight, Activity, ShieldCheck, Cpu, Power, Globe, Mic, ImageIcon, FolderKanban, Loader2, Check } from 'lucide-react';

interface DashboardProps {
  projects: Project[];
  recentActions: ToolAction[];
  insights: AIInsight[];
  onProjectSelect: (p: Project) => void;
  onInsightAction: (insight: AIInsight) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, recentActions, insights, onProjectSelect, onInsightAction }) => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const hasApiKey = !!process.env.API_KEY;

  const handleActionClick = async (e: React.MouseEvent, insight: AIInsight) => {
    e.stopPropagation();
    if (processingId || successId) return;
    
    setProcessingId(insight.id);
    // 模擬 AI 處理延遲
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onInsightAction(insight);
    
    setProcessingId(null);
    setSuccessId(insight.id);
    
    setTimeout(() => setSuccessId(null), 3000);
  };

  const data = [
    { name: '建築', value: projects.filter(p => p.type === 'Architectural').length },
    { name: '室內', value: projects.filter(p => p.type === 'Interior').length },
    { name: '平面', value: projects.filter(p => p.type === 'Graphic').length },
    { name: '影像', value: projects.filter(p => p.type === 'Media').length },
  ];

  const COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30'];

  const modules = [
    { id: 'v_ai', label: 'Gemini Voice', icon: Mic, status: hasApiKey ? 'Active' : 'Missing Key', color: 'blue' },
    { id: 'i_gen', label: 'Image Engine', icon: ImageIcon, status: hasApiKey ? 'Active' : 'Missing Key', color: 'purple' },
    { id: 'p_flow', label: 'Workflow', icon: FolderKanban, status: 'Operational', color: 'green' },
    { id: 'c_sync', label: 'Cloud Bridge', icon: Globe, status: 'Connected', color: 'orange' },
  ];

  return (
    <div className="space-y-10 pb-10 animate-in fade-in duration-1000">
      {/* Dynamic AI Insights Hero */}
      <section className="relative p-10 rounded-[40px] overflow-hidden shadow-2xl shadow-indigo-100/50">
        <div className="absolute inset-0 bg-gradient-to-br from-[#09090B] via-[#1D1D21] to-[#09090B]"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 flex items-center justify-between mb-12 border-b border-white/5 pb-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
              <BrainCircuit className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">Neural Interface</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1.5 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                  <Activity size={10} className="animate-pulse" /> Active Monitoring
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {modules.map((mod) => (
            <div key={mod.id} className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-4 group hover:bg-white/10 transition-all">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                mod.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                mod.color === 'green' ? 'bg-green-500/20 text-green-400' :
                mod.color === 'purple' ? 'bg-purple-500/20 text-purple-400' : 'bg-orange-500/20 text-orange-400'
              }`}>
                <mod.icon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">{mod.label}</p>
                <p className={`text-[11px] font-black uppercase ${
                  mod.status === 'Active' || mod.status === 'Operational' || mod.status === 'Connected' ? 'text-green-400' : 'text-orange-500'
                }`}>{mod.status}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map((insight) => (
            <div key={insight.id} className="group relative bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-8 rounded-[32px] hover:bg-white/[0.06] transition-all duration-500">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${insight.type === 'optimization' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'} ring-1 ring-white/10`}>
                     {insight.type === 'optimization' ? <Zap size={18} /> : <Lightbulb size={18} />}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-white/40 tracking-widest block">{insight.type}</span>
                    <span className="text-[9px] font-bold text-[#34C759] uppercase tracking-tighter">Impact: {insight.impact}</span>
                  </div>
                </div>
              </div>
              <h4 className="font-bold text-white text-xl mb-3 tracking-tight group-hover:text-blue-400 transition-colors">{insight.title}</h4>
              <p className="text-sm text-gray-400 mb-8 leading-relaxed font-medium line-clamp-2">{insight.description}</p>
              
              <button 
                onClick={(e) => handleActionClick(e, insight)}
                disabled={!!processingId || !!successId}
                className={`text-xs font-black py-4 px-6 rounded-2xl transition-all w-full flex items-center justify-center gap-2 ${
                  successId === insight.id 
                    ? 'bg-[#34C759] text-white shadow-lg shadow-green-500/20' 
                    : processingId === insight.id
                      ? 'bg-blue-500 text-white animate-pulse cursor-wait'
                      : 'bg-white text-gray-950 hover:bg-blue-400 hover:text-white group-hover:shadow-blue-500/20'
                }`}
              >
                {processingId === insight.id ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    指令寫入與部署中...
                  </>
                ) : successId === insight.id ? (
                  <>
                    <Check size={14} />
                    已成功啟動自動化流
                  </>
                ) : (
                  <>
                    {insight.actionLabel}
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Action Logs & Project Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <div className="apple-card p-10 bg-white/80 backdrop-blur-md">
            <h3 className="font-black text-gray-900 text-xl tracking-tight flex items-center gap-3 mb-10">
              <Cpu size={22} className="text-[#007AFF]" />
              系統自動化流
            </h3>
            
            <div className="space-y-3">
              {recentActions.length > 0 ? recentActions.map((action, idx) => (
                <div key={idx} className="flex items-center gap-6 p-5 rounded-[24px] hover:bg-[#F5F5F7] transition-all border border-transparent hover:border-gray-100 group animate-in slide-in-from-left-4">
                   <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                     {action.type === 'calendar' ? '📅' : action.type === 'photos' ? '🖼️' : action.type === 'workflow' ? '⚡' : '⚙️'}
                   </div>
                   <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                          action.type === 'workflow' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
                        }`}>{action.type}</span>
                        <span className="text-[10px] font-bold text-gray-300">{action.timestamp}</span>
                      </div>
                      <p className="text-[15px] font-bold text-gray-900 leading-tight">{action.action}</p>
                      <p className="text-[12px] text-gray-500 mt-1 font-medium">{action.details}</p>
                   </div>
                </div>
              )) : (
                <div className="py-20 flex flex-col items-center justify-center text-gray-300 space-y-4">
                  <Activity size={24} className="opacity-20" />
                  <p className="text-sm font-bold uppercase tracking-widest">等待 AI 執行指令...</p>
                </div>
              )}
            </div>
          </div>

          <div className="apple-card p-10 bg-white">
            <h3 className="font-black text-gray-900 text-xl tracking-tight flex items-center gap-3 mb-10">
              <ShieldCheck size={22} className="text-[#34C759]" />
              專案健康度評估
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.map((p) => (
                <div key={p.id} className="group cursor-pointer p-6 rounded-3xl hover:bg-[#F5F5F7] transition-all border border-gray-50" onClick={() => onProjectSelect(p)}>
                  <div className="flex justify-between items-end mb-4">
                    <h5 className="font-bold text-gray-900">{p.name}</h5>
                    <span className="text-xl font-black text-[#007AFF]">{p.efficiencyScore}%</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 ring-1 ring-gray-100">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${p.efficiencyScore}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 h-full">
          <div className="apple-card p-10 flex flex-col bg-white h-full">
            <h3 className="font-black text-gray-900 text-lg mb-8 text-center uppercase tracking-widest">Domain Matrix</h3>
            <div className="flex-1 min-h-[350px] relative">
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-4xl font-black text-gray-900">{projects.length}</span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Active</span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} innerRadius={95} outerRadius={125} paddingAngle={10} dataKey="value">
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '16px 24px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4">
               {data.map((item, idx) => (
                 <div key={item.name} className="flex flex-col p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-2 mb-1">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.name}</span>
                    </div>
                    <span className="text-xl font-black text-gray-900">{item.value}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
