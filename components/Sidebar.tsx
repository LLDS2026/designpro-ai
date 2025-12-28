
import React from 'react';
import { LayoutDashboard, FolderKanban, Files, BadgeDollarSign, Settings, Beaker, Sparkles, ShieldAlert, CheckCircle2, UserRound } from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'projects' | 'files' | 'finance' | 'lab' | 'creative';
  setActiveTab: (tab: 'dashboard' | 'projects' | 'files' | 'finance' | 'lab' | 'creative') => void;
  isCloudConnected: boolean;
  isDemoMode: boolean;
  onConnect: () => void;
  onEnableDemo: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isCloudConnected, isDemoMode, onConnect, onEnableDemo }) => {
  const menuItems = [
    { id: 'dashboard', label: '總覽', icon: LayoutDashboard },
    { id: 'projects', label: '專案管理', icon: FolderKanban },
    { id: 'creative', label: '創意實驗室', icon: Sparkles },
    { id: 'files', label: '雲端檔案', icon: Files },
    { id: 'finance', label: '財務中心', icon: BadgeDollarSign },
    { id: 'lab', label: '系統測試中心', icon: Beaker },
  ];

  return (
    <aside className="w-[260px] apple-glass border-r border-gray-200/50 flex flex-col h-full z-30">
      <div className="pt-10 px-6 pb-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-[#007AFF] rounded-[12px] flex items-center justify-center shadow-lg shadow-blue-200">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 4L4 8L12 12L20 8L12 4Z" />
              <path d="M4 12L12 16L20 12" />
              <path d="M4 16L12 20L20 16" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-tight text-gray-900 leading-tight">DesignPro</h2>
            <p className="text-[10px] font-black text-[#007AFF] uppercase tracking-[0.15em]">AI Agent OS</p>
          </div>
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-[12px] transition-all duration-300 group ${
                  isActive 
                  ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] ring-1 ring-black/5 text-[#007AFF]' 
                  : 'text-gray-500 hover:bg-black/5'
                }`}
              >
                <div className={`${isActive ? 'text-[#007AFF]' : 'text-gray-400 group-hover:text-gray-600'}`}>
                   <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[13px] ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-5">
        <div className={`p-4 rounded-[22px] transition-all border ${
          isCloudConnected ? (isDemoMode ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200') : 'bg-gray-100 border-gray-200'
        }`}>
          <div className="flex items-center gap-2.5 mb-2">
            {isCloudConnected ? (
              isDemoMode ? <ShieldAlert size={12} className="text-amber-500" /> : <CheckCircle2 size={12} className="text-green-500" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            )}
            <span className="text-[11px] font-bold text-gray-800 tracking-tight">
              {isCloudConnected ? (isDemoMode ? 'Visitor Mode' : 'Cloud Bridge Active') : 'Cloud Integration'}
            </span>
          </div>
          <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
            {isCloudConnected 
              ? (isDemoMode ? '目前以訪客模式運行，AI 已解鎖模擬雲端能力。' : 'Google Workspace 已成功同步。') 
              : '建議先嘗試「Google 登入」，若失敗可切換至「展示模式」。'}
          </p>
          
          {!isCloudConnected && (
            <div className="mt-3 flex flex-col gap-2">
              <button 
                onClick={onConnect}
                className="w-full py-2 bg-[#007AFF] text-white text-[10px] font-bold rounded-[10px] hover:bg-[#0062cc] transition shadow-lg shadow-blue-100 active:scale-95"
              >
                Google 登入
              </button>
              <button 
                onClick={onEnableDemo}
                className="w-full py-2 bg-white border border-gray-200 text-gray-600 text-[10px] font-bold rounded-[10px] hover:bg-gray-50 transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <UserRound size={12} />
                以訪客模式啟動 (展示用)
              </button>
            </div>
          )}
        </div>

        <button className="flex items-center gap-3.5 text-gray-400 hover:text-gray-900 transition-all w-full px-3 py-2 active:scale-95">
          <Settings size={18} />
          <span className="text-[13px] font-medium tracking-tight">個人與偏好設定</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
