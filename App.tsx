
import React, { useState, useEffect, useCallback } from 'react';
import { Project, ProjectType, ToolAction, AIInsight } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import VoiceAssistant from './components/VoiceAssistant';
import ProjectDetails from './components/ProjectDetails';
import SystemLab from './components/SystemLab';
import CreativeSuite from './components/CreativeSuite';
import { Key, Globe2, BellRing, X, ShieldCheck, Info, Loader2, AlertTriangle, ExternalLink, RefreshCw, PartyPopper, Rocket, CheckCircle2, Circle } from 'lucide-react';
import { auth, db, googleProvider, hasValidConfig, firebaseConfig } from './firebase';
// Fix: Separate type and value imports for Firebase Auth to resolve compilation errors
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
// Fix: Use correct modular imports for Firestore and separate types if needed
import { collection, onSnapshot, query, doc, setDoc, addDoc, orderBy, limit } from 'firebase/firestore';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'files' | 'finance' | 'lab' | 'creative'>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [actions, setActions] = useState<ToolAction[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  
  const hasGeminiKey = !!process.env.API_KEY && process.env.API_KEY !== '';
  const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname.includes('aistudio.google.com');

  useEffect(() => {
    if (!auth || !db) return;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsDemoMode(false);
        const qProjects = query(collection(db, `users/${currentUser.uid}/projects`));
        const unsubProjects = onSnapshot(qProjects, (snapshot) => {
          const projs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
          setProjects(projs);
          if (projs.length === 0) initializeUserFirstProject(currentUser.uid);
        });

        const qActions = query(
          collection(db, `users/${currentUser.uid}/activity_logs`),
          orderBy('timestamp', 'desc'),
          limit(10)
        );
        const unsubActions = onSnapshot(qActions, (snapshot) => {
          setActions(snapshot.docs.map(doc => doc.data() as ToolAction));
        });

        return () => {
          unsubProjects();
          unsubActions();
        };
      }
    });
    return () => unsubscribe();
  }, []);

  const initializeUserFirstProject = async (uid: string) => {
    if (!db) return;
    const firstProject = {
      name: '新設計案 (歡迎使用)',
      type: ProjectType.INTERIOR,
      status: '規劃中',
      progress: 0,
      lastUpdate: new Date().toISOString().split('T')[0],
      efficiencyScore: 100,
      phases: ['案場丈量', '平面配置', '設計提案']
    };
    await addDoc(collection(db, `users/${uid}/projects`), firstProject);
  };

  const handleLogin = async () => {
    if (!hasValidConfig || !auth) {
      showNotification("金鑰偵測失敗，請檢查 GitHub Secrets。", "warning");
      return;
    }
    
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
      showNotification("連線成功！歡迎進入雲端 OS。", "success");
    } catch (error: any) {
      console.error("Login Error:", error);
      if (error.code === 'auth/unauthorized-domain') {
        showNotification("網域未授權！請至 Firebase 設定 Authorized Domains。", "warning");
      } else {
        showNotification("登入失敗，請確認 Firebase 設定或網路連線。", "warning");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const showNotification = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const githubPagesUrl = `https://${window.location.pathname.split('/')[1]}.github.io/designpro-ai/`;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F7]">
      {/* Notifications */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[400] flex flex-col gap-3 w-full max-w-md pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className={`flex items-center justify-between p-5 rounded-2xl shadow-2xl border backdrop-blur-2xl animate-in slide-in-from-top-4 duration-500 pointer-events-auto ${
            n.type === 'success' ? 'bg-[#34C759] border-green-300 text-white' :
            n.type === 'warning' ? 'bg-[#FF9500] border-amber-300 text-white' :
            'bg-[#007AFF] border-blue-300 text-white'
          }`}>
            <div className="flex items-center gap-4">
              {n.type === 'success' ? <PartyPopper size={20} className="animate-bounce" /> : <BellRing size={20} />}
              <span className="text-sm font-black tracking-tight">{n.message}</span>
            </div>
            <button onClick={() => setNotifications(prev => prev.filter(i => i.id !== n.id))}>
              <X size={16} className="opacity-60 hover:opacity-100" />
            </button>
          </div>
        ))}
      </div>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => { setActiveTab(tab); setSelectedProjectId(null); }} 
        isCloudConnected={!!user}
        isDemoMode={isDemoMode}
        onConnect={handleLogin}
        onLogout={() => auth && signOut(auth)}
        onEnableDemo={() => { setIsDemoMode(true); setUser(null); }}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {!isDemoMode && !user && (
          <div className="absolute inset-0 z-[100] bg-white/60 backdrop-blur-xl flex items-center justify-center p-10 overflow-y-auto">
             <div className="bg-white rounded-[48px] shadow-2xl p-14 max-w-2xl w-full border border-gray-100 flex flex-col items-center animate-in zoom-in-95 duration-500 my-auto relative overflow-hidden">
               {hasValidConfig && (
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500"></div>
               )}
               
               <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center text-white mb-10 shadow-2xl ring-8 transition-all duration-700 ${hasValidConfig ? 'bg-blue-600 shadow-blue-200 ring-blue-50 rotate-0' : 'bg-amber-500 shadow-amber-200 ring-amber-50 rotate-12'}`}>
                 {hasValidConfig ? <ShieldCheck size={48} /> : <AlertTriangle size={48} />}
               </div>
               
               <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tighter uppercase text-center">
                 {hasValidConfig ? '雲端環境已就緒' : '系統待命中'}
               </h2>
               <p className="text-gray-500 mb-10 font-medium leading-relaxed max-w-md text-center">
                 {hasValidConfig 
                   ? '您的專屬 Firebase 雲端空間已成功連線。' 
                   : '請先在 GitHub Secrets 設定金鑰，否則將無法保存專案。'}
               </p>

               {/* 系統診斷面板 */}
               <div className="w-full bg-gray-50 rounded-[32px] p-8 border border-gray-100 mb-10 text-left">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                    <RefreshCw size={12} className={hasValidConfig ? "" : "animate-spin"} /> 系統診斷報告
                  </h4>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-600">Firebase API Key</span>
                        {firebaseConfig.apiKey ? <CheckCircle2 size={16} className="text-green-500" /> : <AlertTriangle size={16} className="text-amber-500" />}
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-600">Gemini AI 大腦</span>
                        {hasGeminiKey ? <CheckCircle2 size={16} className="text-green-500" /> : <Circle size={16} className="text-gray-200" />}
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-600">專案 ID 讀取</span>
                        <span className="text-[10px] font-mono bg-gray-200 px-2 py-1 rounded text-gray-600">{firebaseConfig.projectId || 'N/A'}</span>
                     </div>
                  </div>

                  {!hasValidConfig && isLocalDev && (
                    <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                      <p className="text-blue-700 text-[11px] leading-relaxed flex items-center gap-2 font-bold mb-3">
                         <Info size={14} /> 偵測到您正在使用開發環境
                      </p>
                      <a 
                        href={githubPagesUrl} 
                        target="_blank" 
                        className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-200"
                      >
                        開啟正式部署網址 <ExternalLink size={12} />
                      </a>
                    </div>
                  )}

                  {!hasValidConfig && !isLocalDev && (
                     <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                        <p className="text-amber-800 text-[11px] leading-relaxed flex items-center gap-2 font-bold mb-2">
                          <AlertTriangle size={14} /> 金鑰未生效？
                        </p>
                        <p className="text-amber-700 text-[10px] leading-relaxed">
                          請確認 GitHub Actions 的 <b>Build</b> 步驟是否有出現紅色錯誤。若顯示成功，請按下 <b>Ctrl+F5</b> 強制刷新網頁。
                        </p>
                     </div>
                  )}
               </div>

               <div className="flex flex-col gap-4 w-full">
                 <button 
                   onClick={handleLogin}
                   disabled={!hasValidConfig || isLoggingIn}
                   className={`w-full py-6 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl ${
                     hasValidConfig ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                   }`}
                 >
                   {isLoggingIn ? <Loader2 size={24} className="animate-spin" /> : hasValidConfig ? '使用 Google 帳號登入' : '金鑰部署中...'}
                 </button>
                 <button 
                   onClick={() => { setIsDemoMode(true); showNotification("進入展示模式，資料將不會被儲存。", "info"); }}
                   className="w-full py-5 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all text-sm"
                 >
                   暫不登入，使用訪客展示模式
                 </button>
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
                {user ? 'Cloud Live' : (isDemoMode ? 'Demo Sandbox' : 'Disconnected')}
               </span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">AI Engine</p>
              <p className={`text-[12px] font-black ${hasGeminiKey ? 'text-[#34C759]' : 'text-orange-500'}`}>
                {hasGeminiKey ? 'READY' : 'SIMULATED'}
              </p>
            </div>
            {user ? (
               <div className="flex items-center gap-3 bg-white border border-gray-100 p-1.5 pr-4 rounded-2xl shadow-sm">
                  <img src={user.photoURL || ''} className="w-8 h-8 rounded-xl border border-gray-100" alt="profile" />
                  <span className="text-xs font-bold text-gray-700">{user.displayName}</span>
               </div>
            ) : (
               <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white text-[11px] font-black shadow-lg">JD</div>
            )}
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
                onInsightAction={() => showNotification("自動化腳本已更新至雲端", "success")}
              />
            )}
            {activeTab === 'lab' && <SystemLab isCloudConnected={!!user} hasApiKey={hasGeminiKey} />}
            {activeTab === 'creative' && <CreativeSuite />}
            {activeTab === 'projects' && selectedProject && (
              <ProjectDetails 
                project={selectedProject} 
                onBack={() => { setSelectedProjectId(null); setActiveTab('dashboard'); }}
                onUpdateWorkflow={async (phases) => {
                  if (user && db) {
                    await setDoc(doc(db, `users/${user.uid}/projects`, selectedProject.id), { phases }, { merge: true });
                    showNotification("流程地圖已同步至雲端", "success");
                  }
                }}
              />
            )}
          </div>
        </div>

        <VoiceAssistant onToolCall={(tool, args) => showNotification(`AI 指令執行: ${tool}`, "info")} />
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
