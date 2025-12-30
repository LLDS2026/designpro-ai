
import React, { useState, useEffect, useCallback } from 'react';
import { Project, ProjectType, ToolAction, AIInsight } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import VoiceAssistant from './components/VoiceAssistant';
import ProjectDetails from './components/ProjectDetails';
import SystemLab from './components/SystemLab';
import CreativeSuite from './components/CreativeSuite';
import { Globe2, BellRing, X, ShieldCheck, Loader2, AlertTriangle, RefreshCw, PartyPopper, CheckCircle2, Circle, Copy, Check, Info, Rocket } from 'lucide-react';
import { auth, db, googleProvider, hasValidConfig, firebaseConfig } from './firebase';

import { onAuthStateChanged, signOut, type User } from '@firebase/auth';
import { collection, onSnapshot, query, setDoc, doc, addDoc } from '@firebase/firestore';

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
  const [actions] = useState<ToolAction[]>([]);
  const [insights] = useState<AIInsight[]>([]);
  
  const isProduction = window.location.hostname.includes('github.io');
  
  // Gemini API Key 讀取
  const finalApiKey = (typeof process !== 'undefined' ? process.env.API_KEY : '') || import.meta.env.VITE_API_KEY || '';
  const hasGeminiKey = finalApiKey.length > 5;

  // 診斷清單：必須與 firebase.ts 中的 firebaseConfig 同步
  const requiredSecrets = [
    { name: 'API_KEY', value: finalApiKey, label: 'Gemini AI 大腦' },
    { name: 'FIREBASE_API_KEY', value: firebaseConfig.apiKey, label: 'Firebase 金鑰' },
    { name: 'FIREBASE_PROJECT_ID', value: firebaseConfig.projectId, label: '專案 ID' },
  ];

  const readyCount = requiredSecrets.filter(s => !!s.value && s.value.length > 2).length;
  const isAllReady = readyCount === requiredSecrets.length;

  useEffect(() => {
    if (!auth || !db) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser as User | null);
      if (currentUser) {
        setIsDemoMode(false);
        const qProjects = query(collection(db, `users/${currentUser.uid}/projects`));
        const unsubProjects = onSnapshot(qProjects, (snapshot) => {
          const projs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
          setProjects(projs);
          if (projs.length === 0) initializeUserFirstProject(currentUser.uid);
        });
        return () => { unsubProjects(); };
      }
    });
    return () => unsubscribe();
  }, []);

  const initializeUserFirstProject = async (uid: string) => {
    if (!db) return;
    const firstProject = {
      name: '我的第一個設計案',
      type: ProjectType.INTERIOR,
      status: '規劃中',
      progress: 0,
      lastUpdate: new Date().toISOString().split('T')[0],
      efficiencyScore: 100,
      phases: ['案場丈量', '平面配置', '材料選樣', '正式報價']
    };
    await addDoc(collection(db, `users/${uid}/projects`), firstProject);
  };

  const handleLogin = async () => {
    if (!hasValidConfig || !auth) {
      showNotification("Firebase 配置不完整，無法啟動連線。", "warning");
      return;
    }
    setIsLoggingIn(true);
    try {
      const { signInWithPopup } = await import('@firebase/auth');
      await signInWithPopup(auth, googleProvider);
      showNotification("雲端連線成功！", "success");
    } catch (error: any) {
      console.error("Login failed:", error);
      showNotification("登入失敗，請確認 Firebase Console 授權網域設定。", "warning");
    } finally { setIsLoggingIn(false); }
  };

  const showNotification = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => { setNotifications(prev => prev.filter(n => n.id !== id)); }, 5000);
  }, []);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F7]">
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[400] flex flex-col gap-3 w-full max-w-md pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className={`flex items-center justify-between p-5 rounded-2xl shadow-2xl border backdrop-blur-2xl animate-in slide-in-from-top-4 duration-500 pointer-events-auto ${
            n.type === 'success' ? 'bg-[#34C759] border-green-300 text-white' :
            n.type === 'warning' ? 'bg-[#FF9500] border-amber-300 text-white' :
            'bg-[#007AFF] border-blue-300 text-white'
          }`}>
            <div className="flex items-center gap-4">
              {n.type === 'success' ? <PartyPopper size={20} /> : <Info size={20} />}
              <span className="text-sm font-black tracking-tight">{n.message}</span>
            </div>
            <button onClick={() => setNotifications(prev => prev.filter(i => i.id !== n.id))} className="p-1 hover:bg-white/20 rounded-lg transition">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <Sidebar 
        activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setSelectedProjectId(null); }} 
        isCloudConnected={!!user} isDemoMode={isDemoMode} onConnect={handleLogin} onLogout={() => auth && signOut(auth)} onEnableDemo={() => { setIsDemoMode(true); setUser(null); }}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {!isDemoMode && !user && (
          <div className="absolute inset-0 z-[100] bg-white/60 backdrop-blur-xl flex items-center justify-center p-10 overflow-y-auto">
             <div className="bg-white rounded-[48px] shadow-2xl p-14 max-w-2xl w-full border border-gray-100 flex flex-col items-center animate-in zoom-in-95 duration-500 my-auto relative">
               
               <div className="absolute top-0 right-0 p-8">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest ${isProduction ? 'bg-green-50 border-green-100 text-green-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                    {isProduction ? <Globe2 size={12} /> : <Rocket size={12} />}
                    {isProduction ? '正式環境 (GitHub)' : '預覽環境 (Studio)'}
                  </div>
               </div>

               <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center text-white mb-10 shadow-2xl ring-8 transition-all duration-700 ${isAllReady ? 'bg-blue-600 shadow-blue-200 ring-blue-50' : 'bg-amber-500 shadow-amber-200 ring-amber-50 animate-pulse'}`}>
                 {isAllReady ? <ShieldCheck size={48} /> : <AlertTriangle size={48} />}
               </div>
               
               <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tighter uppercase text-center">
                 {isAllReady ? '核心配置已解鎖' : '配置等待中'}
               </h2>
               <p className="text-gray-500 mb-8 font-medium leading-relaxed max-w-md text-center">
                 {isAllReady ? '您的 GitHub Secrets 已成功注入編譯檔！' : `請在 GitHub Repository 設定 Secrets。目前進度：${readyCount}/${requiredSecrets.length}`}
               </p>

               <div className="w-full bg-gray-50 rounded-[32px] p-8 border border-gray-100 mb-10 text-left">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <RefreshCw size={12} className={isAllReady ? "" : "animate-spin"} /> 變數同步狀態
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {requiredSecrets.map((s) => (
                      <div key={s.name} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
                        <div className="flex items-center gap-3">
                           {s.value && s.value.length > 2 ? <CheckCircle2 size={16} className="text-green-500" /> : <Circle size={16} className="text-gray-200" />}
                           <span className="text-xs font-bold text-gray-700">{s.label}</span>
                        </div>
                        {s.value && s.value.length > 2 ? (
                          <span className="text-[10px] font-mono bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100">DETECTED</span>
                        ) : (
                          <span className="text-[10px] font-mono bg-gray-100 text-gray-400 px-2 py-1 rounded">MISSING</span>
                        )}
                      </div>
                    ))}
                  </div>
               </div>

               <div className="flex flex-col gap-4 w-full">
                 <button onClick={handleLogin} disabled={!isAllReady || isLoggingIn} className={`w-full py-6 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl ${isAllReady ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                   {isLoggingIn ? <Loader2 size={24} className="animate-spin" /> : '登入系統'}
                 </button>
                 <button onClick={() => setIsDemoMode(true)} className="w-full py-5 bg-white text-blue-600 rounded-2xl font-black hover:bg-blue-50 transition-all text-sm border border-blue-100 active:scale-95">
                   進入訪客演示模式
                 </button>
               </div>
             </div>
          </div>
        )}

        <header className="h-[72px] apple-glass border-b border-gray-200/50 flex items-center justify-between px-10 z-20 shrink-0">
          <div className="flex items-center gap-5">
            <h1 className="text-[18px] font-bold text-gray-900 tracking-tight">
              {activeTab === 'dashboard' ? '設計戰略台' : activeTab === 'lab' ? '核心診斷' : activeTab === 'creative' ? 'AI 實驗室' : selectedProject ? `專案: ${selectedProject.name}` : '主管理'}
            </h1>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-900 rounded-full">
               <Globe2 size={10} className={`text-blue-400 ${isDemoMode ? '' : 'animate-spin-slow'}`} />
               <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">{user ? 'Cloud Sync' : 'Sandbox'}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          <div className="max-w-7xl mx-auto h-full">
            {activeTab === 'dashboard' && <Dashboard projects={projects} recentActions={actions} insights={insights} onProjectSelect={(p) => { setSelectedProjectId(p.id); setActiveTab('projects'); }} onInsightAction={() => {}} />}
            {activeTab === 'lab' && <SystemLab isCloudConnected={!!user} hasApiKey={hasGeminiKey} />}
            {activeTab === 'creative' && <CreativeSuite />}
            {activeTab === 'projects' && selectedProject && <ProjectDetails project={selectedProject} onBack={() => { setSelectedProjectId(null); setActiveTab('dashboard'); }} onUpdateWorkflow={async (phases) => { if (user && db) { await setDoc(doc(db, `users/${user.uid}/projects`, selectedProject.id), { phases }, { merge: true }); showNotification("同步成功", "success"); } }} />}
          </div>
        </div>
        <VoiceAssistant onToolCall={(tool) => showNotification(`執行指令: ${tool}`, "info")} />
      </main>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .animate-spin-slow { animation: spin-slow 12s linear infinite; } .apple-glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: saturate(180%) blur(20px); }`}} />
    </div>
  );
};

export default App;
