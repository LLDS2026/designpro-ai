
import React, { useState, useEffect, useCallback } from 'react';
import { Project, ProjectType, ToolAction, AIInsight } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import VoiceAssistant from './components/VoiceAssistant';
import ProjectDetails from './components/ProjectDetails';
import SystemLab from './components/SystemLab';
import CreativeSuite from './components/CreativeSuite';
import { Globe2, BellRing, X, ShieldCheck, Loader2, AlertTriangle, RefreshCw, PartyPopper, Rocket, CheckCircle2, Circle, Copy, Check, Info } from 'lucide-react';
import { auth, db, googleProvider, hasValidConfig, firebaseConfig } from './firebase';

// Fix: Use scoped @firebase packages and combined type imports to resolve resolution errors in this environment
import { signInWithPopup, onAuthStateChanged, signOut, type User } from '@firebase/auth';
import { collection, onSnapshot, query, doc, setDoc, addDoc } from '@firebase/firestore';

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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [actions] = useState<ToolAction[]>([]);
  const [insights] = useState<AIInsight[]>([]);
  
  const hasGeminiKey = !!process.env.API_KEY && process.env.API_KEY !== '';

  const requiredSecrets = [
    { name: 'API_KEY', value: process.env.API_KEY, label: 'Gemini AI 大腦' },
    { name: 'FIREBASE_API_KEY', value: firebaseConfig.apiKey, label: 'Firebase 金鑰' },
    { name: 'FIREBASE_PROJECT_ID', value: firebaseConfig.projectId, label: '專案 ID' },
    { name: 'FIREBASE_AUTH_DOMAIN', value: firebaseConfig.authDomain, label: '授權網域' },
    { name: 'FIREBASE_APP_ID', value: firebaseConfig.appId, label: '應用程式 ID' },
    { name: 'FIREBASE_STORAGE_BUCKET', value: firebaseConfig.storageBucket, label: '存儲桶' },
    { name: 'FIREBASE_MESSAGING_SENDER_ID', value: firebaseConfig.messagingSenderId, label: '發送者 ID' },
  ];

  const readyCount = requiredSecrets.filter(s => !!s.value && s.value !== '').length;
  const isAllReady = readyCount === 7;

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
      showNotification("配置未生效，請使用正式網址或先進入展示模式。", "warning");
      return;
    }
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
      showNotification("雲端連線成功！", "success");
    } catch (error: any) {
      console.error("Login failed:", error);
      showNotification("登入失敗，請檢查 Firebase 設定。", "warning");
    } finally { setIsLoggingIn(false); }
  };

  const showNotification = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => { setNotifications(prev => prev.filter(n => n.id !== id)); }, 5000);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
    showNotification(`已複製變數: ${text}`, "info");
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F7]">
      {/* Notifications Portal */}
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
        {/* Setup / Login Overlay */}
        {!isDemoMode && !user && (
          <div className="absolute inset-0 z-[100] bg-white/60 backdrop-blur-xl flex items-center justify-center p-10 overflow-y-auto">
             <div className="bg-white rounded-[48px] shadow-2xl p-14 max-w-2xl w-full border border-gray-100 flex flex-col items-center animate-in zoom-in-95 duration-500 my-auto relative overflow-hidden">
               {isAllReady && <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 animate-pulse"></div>}
               
               <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center text-white mb-10 shadow-2xl ring-8 transition-all duration-700 ${isAllReady ? 'bg-blue-600 shadow-blue-200 ring-blue-50 rotate-0 scale-110' : 'bg-amber-500 shadow-amber-200 ring-amber-50 rotate-12'}`}>
                 {isAllReady ? <ShieldCheck size={48} className="animate-in zoom-in duration-500" /> : <AlertTriangle size={48} />}
               </div>
               
               <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tighter uppercase text-center">
                 {isAllReady ? '系統核心已啟動' : '系統正在等待配置'}
               </h2>
               <p className="text-gray-500 mb-6 font-medium leading-relaxed max-w-md text-center">
                 {isAllReady ? '偵測到完整雲端金鑰。請使用 Google 帳號正式登入。' : `GitHub Secrets 已設定？目前偵測：${readyCount}/7。`}
               </p>

               <div className="w-full bg-blue-50 border border-blue-100 p-5 rounded-3xl mb-8 flex gap-4">
                  <Info className="text-blue-500 shrink-0" size={24} />
                  <div className="text-left">
                    <p className="text-[12px] font-black text-blue-900 mb-1">提示：為什麼這裡目前顯示未配置？</p>
                    <p className="text-[10px] text-blue-700 leading-normal">
                      GitHub Secrets 僅供部署後的網址使用。AI Studio 預覽環境無法直接存取您的 GitHub 秘密。
                      <br /><b>正式驗證請前往部署網址</b>，或點擊下方藍色按鈕先進入訪客模式。
                    </p>
                  </div>
               </div>

               <div className="w-full bg-gray-50 rounded-[32px] p-8 border border-gray-100 mb-10 text-left">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <RefreshCw size={12} className={isAllReady ? "" : "animate-spin"} /> 環境變數診斷
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {requiredSecrets.map((s) => (
                      <div key={s.name} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
                        <div className="flex items-center gap-3">
                           {s.value ? <CheckCircle2 size={16} className="text-green-500" /> : <Circle size={16} className="text-gray-200" />}
                           <span className="text-xs font-bold text-gray-700">{s.label}</span>
                        </div>
                        {s.value ? (
                          <span className="text-[10px] font-mono bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100">DETECTED</span>
                        ) : (
                          <button onClick={() => copyToClipboard(s.name)} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black hover:bg-amber-200 transition">
                             {copiedKey === s.name ? <Check size={10} /> : <Copy size={10} />} 複製變數名
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
               </div>

               <div className="flex flex-col gap-4 w-full">
                 <button onClick={handleLogin} disabled={!isAllReady || isLoggingIn} className={`w-full py-6 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl ${isAllReady ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                   {isLoggingIn ? <Loader2 size={24} className="animate-spin" /> : '使用 Google 帳號正式登入'}
                 </button>
                 <button onClick={() => { setIsDemoMode(true); showNotification("進入訪客展示模式", "info"); }} className="w-full py-5 bg-blue-50 text-blue-600 rounded-2xl font-black hover:bg-blue-100 transition-all text-sm shadow-sm active:scale-95">
                   進入訪客展示模式 (測試功能)
                 </button>
               </div>
             </div>
          </div>
        )}

        <header className="h-[72px] apple-glass border-b border-gray-200/50 flex items-center justify-between px-10 z-20 shrink-0">
          <div className="flex items-center gap-5">
            <h1 className="text-[18px] font-bold text-gray-900 tracking-tight">
              {activeTab === 'dashboard' ? '設計戰略台' : activeTab === 'lab' ? '系統診斷' : activeTab === 'creative' ? 'AI 實驗室' : selectedProject ? `專案: ${selectedProject.name}` : '主管理介面'}
            </h1>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-900 rounded-full">
               <Globe2 size={10} className={`text-blue-400 ${isDemoMode ? '' : 'animate-spin-slow'}`} />
               <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">{user ? 'Live' : 'Sandbox'}</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {user ? (
               <div className="flex items-center gap-3 bg-white border border-gray-100 p-1.5 pr-4 rounded-2xl shadow-sm">
                  <img src={user.photoURL || ''} className="w-8 h-8 rounded-xl border border-gray-100" alt="profile" />
                  <span className="text-xs font-bold text-gray-700">{user.displayName}</span>
               </div>
            ) : <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white text-[11px] font-black shadow-lg">DP</div>}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          <div className="max-w-7xl mx-auto h-full">
            {activeTab === 'dashboard' && <Dashboard projects={projects} recentActions={actions} insights={insights} onProjectSelect={(p) => { setSelectedProjectId(p.id); setActiveTab('projects'); }} onInsightAction={() => {}} />}
            {activeTab === 'lab' && <SystemLab isCloudConnected={!!user} hasApiKey={hasGeminiKey} />}
            {activeTab === 'creative' && <CreativeSuite />}
            {activeTab === 'projects' && selectedProject && <ProjectDetails project={selectedProject} onBack={() => { setSelectedProjectId(null); setActiveTab('dashboard'); }} onUpdateWorkflow={async (phases) => { if (user && db) { await setDoc(doc(db, `users/${user.uid}/projects`, selectedProject.id), { phases }, { merge: true }); showNotification("雲端工作流已同步", "success"); } }} />}
          </div>
        </div>
        <VoiceAssistant onToolCall={(tool) => showNotification(`執行指令: ${tool}`, "info")} />
      </main>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .animate-spin-slow { animation: spin-slow 12s linear infinite; } .apple-glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: saturate(180%) blur(20px); }`}} />
    </div>
  );
};

export default App;
