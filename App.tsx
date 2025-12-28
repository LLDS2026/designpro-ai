
import React, { useState, useEffect, useCallback } from 'react';
import { Project, ProjectType, ToolAction, AIInsight } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import VoiceAssistant from './components/VoiceAssistant';
import ProjectDetails from './components/ProjectDetails';
import SystemLab from './components/SystemLab';
import CreativeSuite from './components/CreativeSuite';
import { Key, Globe2, BellRing, X, ShieldCheck, Info } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'files' | 'finance' | 'lab' | 'creative'>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [userProfile, setUserProfile] = useState<{name?: string, email?: string} | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const hasApiKey = !!process.env.API_KEY;
  
  const [projects, setProjects] = useState<Project[]>([
    { 
      id: '1', 
      name: '藍潭案', 
      type: ProjectType.INTERIOR, 
      status: '施工中', 
      progress: 65, 
      lastUpdate: '2023-10-25', 
      efficiencyScore: 82,
      phases: ['案場丈量', '平面配置', '3D渲染', '施工報價', '進場施工', '軟裝驗收']
    },
    { 
      id: '2', 
      name: '台北商辦總部', 
      type: ProjectType.ARCHITECTURAL, 
      status: '規畫設計', 
      progress: 30, 
      lastUpdate: '2023-10-24', 
      efficiencyScore: 95,
      phases: ['開發評估', '法規檢討', '規畫設計', '請照繪製', '建照申請', '施工營造', '使照申請']
    },
  ]);

  const [actions, setActions] = useState<ToolAction[]>([]);
  const [insights] = useState<AIInsight[]>([
    {
      id: 'i1',
      type: 'optimization',
      title: '流程自動化建議',
      description: '分析過去 3 次室內設計案，您在「進場施工」後通常會立刻搜尋「石材圖庫」。是否設定為自動執行？',
      impact: '預計節省 15 分鐘',
      actionLabel: '啟用智慧工作流'
    }
  ]);

  const showNotification = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  const addAction = useCallback((action: ToolAction) => {
    setActions(prev => [action, ...prev].slice(0, 10));
  }, []);

  const handleInsightAction = useCallback((insight: AIInsight) => {
    const timestamp = new Date().toLocaleTimeString();
    setProjects(prev => prev.map(p => {
      if (p.id === '1' && !p.phases.includes('AI 自動化：石材圖庫預選')) {
        const newPhases = [...p.phases];
        const insertIdx = newPhases.indexOf('進場施工') + 1;
        newPhases.splice(insertIdx, 0, 'AI 自動化：石材圖庫預選');
        return { ...p, phases: newPhases, efficiencyScore: 94 };
      }
      return p;
    }));
    addAction({
      type: 'workflow',
      action: `自動化任務已部署: ${insight.title}`,
      details: 'AI 已在「藍潭案」流程中動態插入了自動化石材預選決策點。',
      timestamp
    });
    showNotification("智慧工作流部署成功！專案流程已動態更新。", "success");
  }, [addAction, showNotification]);

  const handleUpdateWorkflow = (projectId: string, newPhases: string[]) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, phases: newPhases } : p));
    showNotification("專案流程地圖已儲存並同步", "success");
  };

  const enableDemoCloud = useCallback(() => {
    const timestamp = new Date().toLocaleTimeString();
    setIsCloudConnected(true);
    setIsDemoMode(true);
    setUserProfile({ name: 'Guest Designer', email: 'guest@designpro.ai' });
    addAction({ 
      type: 'system', 
      action: '啟動展示環境', 
      details: '系統已進入沙盒模式，模擬所有雲端數據同步與 AI 回饋。', 
      timestamp 
    });
    showNotification("已切換至展示模式：雲端功能模擬中", "warning");
  }, [addAction, showNotification]);

  const initCloudConnection = useCallback(() => {
    enableDemoCloud();
  }, [enableDemoCloud]);

  const handleToolCall = useCallback((tool: string, args: any) => {
    const timestamp = new Date().toLocaleTimeString();
    if (tool === 'connect_cloud') {
      initCloudConnection();
      return { status: 'ok', provider: 'google_workspace' };
    }
    if (tool === 'manage_calendar') {
      addAction({ type: 'calendar', action: '建立排程', details: `${args.eventTitle} (專案: ${args.projectName})`, timestamp });
      showNotification(`已建立日曆事件：${args.eventTitle}`, "success");
      return { status: 'scheduled' };
    }
    return { status: 'success' };
  }, [initCloudConnection, addAction, showNotification]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F7]">
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className={`flex items-center justify-between p-4 rounded-2xl shadow-2xl border backdrop-blur-xl animate-in slide-in-from-top-4 duration-500 pointer-events-auto ${
            n.type === 'success' ? 'bg-[#34C759]/90 border-green-200 text-white' :
            n.type === 'warning' ? 'bg-[#FF9500]/90 border-amber-200 text-white' :
            'bg-[#007AFF]/90 border-blue-200 text-white'
          }`}>
            <div className="flex items-center gap-3">
              <BellRing size={16} />
              <span className="text-sm font-bold tracking-tight">{n.message}</span>
            </div>
            <button onClick={() => setNotifications(prev => prev.filter(i => i.id !== n.id))}>
              <X size={14} className="opacity-60 hover:opacity-100" />
            </button>
          </div>
        ))}
      </div>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => { setActiveTab(tab); setSelectedProjectId(null); }} 
        isCloudConnected={isCloudConnected}
        isDemoMode={isDemoMode}
        onConnect={initCloudConnection}
        onEnableDemo={enableDemoCloud}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {!hasApiKey && !isDemoMode && (
          <div className="absolute inset-0 z-[100] bg-white/60 backdrop-blur-lg flex items-center justify-center p-10">
            <div className="bg-white rounded-[48px] shadow-2xl p-14 max-w-xl w-full border border-gray-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-blue-600 rounded-[28px] flex items-center justify-center text-white mb-10 shadow-2xl shadow-blue-200 ring-8 ring-blue-50">
                <Key size={36} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter uppercase">系統部署準備就緒</h2>
              <p className="text-gray-500 mb-10 font-medium leading-relaxed max-w-md">
                DesignPro 已準備好為您的設計工作賦能。請先在 GitHub Secrets 設定金鑰，或直接使用 **訪客展示模式** 搶先體驗所有介面與流程。
              </p>
              
              <div className="w-full bg-gray-50 p-7 rounded-3xl border border-gray-100 text-left mb-10 group hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <Info size={14} className="text-blue-500" />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">GitHub Secret 名稱</p>
                </div>
                <code className="text-sm font-mono text-blue-600 font-bold block bg-white p-4 rounded-xl border border-gray-200 shadow-inner group-hover:text-blue-700">API_KEY = "您的 Gemini 金鑰"</code>
              </div>

              <div className="flex flex-col gap-4 w-full">
                <button 
                  onClick={enableDemoCloud}
                  className="w-full py-5 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95 shadow-xl"
                >
                  <ShieldCheck size={20} />
                  進入訪客展示模式
                </button>
                <p className="text-[11px] text-gray-400 font-medium">※ 展示模式將自動模擬 AI 語音與影像生成之邏輯</p>
              </div>
            </div>
          </div>
        )}

        <header className="h-[72px] apple-glass border-b border-gray-200/50 flex items-center justify-between px-10 z-20 shrink-0">
          <div className="flex items-center gap-5">
            <h1 className="text-[18px] font-bold text-gray-900 tracking-tight">
              {activeTab === 'dashboard' ? '智慧工作台' : 
               activeTab === 'lab' ? '系統診斷中心' :
               activeTab === 'creative' ? 'AI 創意套件' :
               selectedProject ? `專案管理: ${selectedProject.name}` : '管理中心'}
            </h1>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-900 rounded-full">
               <Globe2 size={10} className={`text-blue-400 ${isDemoMode ? '' : 'animate-spin-slow'}`} />
               <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">
                {isDemoMode ? 'Sandbox' : 'Production'}
               </span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">AI Engine</p>
              <p className={`text-[12px] font-black ${hasApiKey ? 'text-[#34C759]' : 'text-orange-500'}`}>
                {hasApiKey ? 'LIVE' : (isDemoMode ? 'SIMULATED' : 'OFFLINE')}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white text-[11px] font-black shadow-lg">
              {userProfile?.name?.substring(0, 2).toUpperCase() || 'JD'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          <div className="max-w-7xl mx-auto h-full">
            {activeTab === 'dashboard' && (
              <Dashboard 
                projects={projects} 
                recentActions={actions} 
                insights={insights}
                onProjectSelect={(p) => { setSelectedProjectId(p.id); setActiveTab('projects'); }}
                onInsightAction={handleInsightAction}
              />
            )}
            {activeTab === 'lab' && <SystemLab isCloudConnected={isCloudConnected} hasApiKey={hasApiKey} />}
            {activeTab === 'creative' && <CreativeSuite />}
            {activeTab === 'projects' && selectedProject && (
              <ProjectDetails 
                project={selectedProject} 
                onBack={() => { setSelectedProjectId(null); setActiveTab('dashboard'); }}
                onUpdateWorkflow={(phases) => handleUpdateWorkflow(selectedProject.id, phases)}
              />
            )}
            {(activeTab === 'files' || activeTab === 'finance') && (
               <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-white rounded-[40px] border border-gray-100">
                  <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6 text-gray-300">
                     <Globe2 size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">雲端數據連線中</h3>
                  <p className="text-gray-400 text-sm max-w-sm font-medium">
                    正在同步您的 Google Workspace 與財務報表。在展示模式下，此區塊將會呈現預設的模擬檔案。
                  </p>
               </div>
            )}
          </div>
        </div>

        <VoiceAssistant onToolCall={handleToolCall} />
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
        .apple-glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: saturate(180%) blur(20px); }
      `}} />
    </div>
  );
};

export default App;
