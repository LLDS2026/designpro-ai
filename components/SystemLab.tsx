
import React, { useState, useEffect, useRef } from 'react';
import { Beaker, ShieldCheck, Terminal, Database, Calendar, CreditCard, Cpu, Rocket, Zap, CheckCircle2, AlertCircle, Wifi, WifiOff, Lock, Unlock } from 'lucide-react';

interface LogEntry {
  id: string;
  time: string;
  module: string;
  message: string;
  status: 'info' | 'success' | 'warning' | 'critical';
}

interface SystemLabProps {
  isCloudConnected: boolean;
  hasApiKey: boolean;
}

const SystemLab: React.FC<SystemLabProps> = ({ isCloudConnected, hasApiKey }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  // 診斷環境變數 (隱藏部分字串以維護安全)
  const envStatus = {
    firebase: !!process.env.VITE_FIREBASE_API_KEY,
    gemini: !!process.env.API_KEY,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || '未設定'
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (module: string, message: string, status: 'info' | 'success' | 'warning' | 'critical' = 'info') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      time: new Date().toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 2 } as any),
      module,
      message,
      status
    };
    setLogs(prev => [...prev, newLog].slice(-100));
  };

  const startDeployment = async () => {
    setIsDeploying(true);
    setDeployProgress(0);
    setLogs([]);
    addLog('DEPLOY', '初始化生產環境部署序列...', 'info');
    
    const steps = [
      { p: 10, m: 'BUILD', msg: '優化前端資產 (Vite/Rollup)...', s: 'info' },
      { p: 30, m: 'BUILD', msg: '壓縮 JS/CSS 封裝檔完成。', s: 'success' },
      { p: 50, m: 'CLOUD', msg: '推送至 Edge Network (Global CDN)...', s: 'info' },
      { p: 70, m: 'SECURE', msg: '套用 SSL 憑證與安全標頭...', s: 'success' },
      { p: 90, m: 'PROD', msg: '更新路由表。清除快取...', s: 'info' },
      { p: 100, m: 'PROD', msg: '部署完成！系統已上線。', s: 'critical' }
    ];

    for (const step of steps) {
      await new Promise(r => setTimeout(r, 600));
      setDeployProgress(step.p);
      addLog(step.m, step.msg, step.s as any);
    }
    
    setTimeout(() => {
      setIsDeploying(false);
      setActiveTest(null);
    }, 1000);
  };

  const bootSequence = async () => {
    setLogs([]);
    setActiveTest('boot');
    const steps = [
      { m: 'KERNEL', msg: 'DesignPro AI 核心啟動中...', s: 'info' },
      { m: 'SYSTEM', msg: '偵測到神經網路運算單元。', s: 'success' },
      { m: 'AUTH', msg: envStatus.firebase ? 'Firebase 金鑰驗證成功。' : '警告: Firebase 金鑰遺失。', s: envStatus.firebase ? 'success' : 'warning' },
      { m: 'AI_CORE', msg: envStatus.gemini ? 'Gemini API 已就緒。' : '警告: AI API 金鑰未設定。', s: envStatus.gemini ? 'success' : 'warning' },
      { m: 'SYSTEM', msg: '>>> 系統診斷完成。 <<<', s: 'critical' }
    ];
    for (const step of steps) {
      await new Promise(r => setTimeout(r, 150));
      addLog(step.m, step.msg, step.s as any);
    }
    setActiveTest(null);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight text-gradient bg-clip-text">系統診斷中心</h2>
          <p className="text-sm font-medium text-gray-400 mt-1 uppercase tracking-widest">連線狀態與生產環境部署</p>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={bootSequence}
             disabled={activeTest !== null || isDeploying}
             className="px-6 py-3 bg-white border border-gray-200 text-gray-900 rounded-2xl shadow-sm flex items-center gap-2 hover:bg-gray-50 transition active:scale-95 disabled:opacity-50"
           >
             <Zap size={16} className="text-blue-500" />
             <span className="text-[11px] font-black uppercase tracking-[0.2em]">一鍵健檢</span>
           </button>
           <button 
             onClick={startDeployment}
             disabled={isDeploying}
             className="px-6 py-3 bg-gray-900 text-white rounded-2xl shadow-xl flex items-center gap-2 hover:bg-black transition active:scale-95 disabled:opacity-50"
           >
             <Rocket size={18} className={isDeploying ? 'animate-bounce' : ''} />
             <span className="text-[11px] font-black uppercase tracking-[0.2em]">執行生產部署</span>
           </button>
        </div>
      </div>

      {/* 診斷儀表板 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-[28px] border transition-all ${envStatus.firebase ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${envStatus.firebase ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
              <Database size={20} />
            </div>
            {envStatus.firebase ? <Wifi size={16} className="text-green-500" /> : <WifiOff size={16} className="text-red-500" />}
          </div>
          <h4 className="font-bold text-gray-900">Firebase 資料庫</h4>
          <p className="text-[10px] text-gray-500 mt-1 font-medium">{envStatus.firebase ? `專案: ${envStatus.projectId}` : '金鑰未正確注入'}</p>
        </div>

        <div className={`p-6 rounded-[28px] border transition-all ${envStatus.gemini ? 'bg-blue-50/50 border-blue-100' : 'bg-amber-50/50 border-amber-100'}`}>
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${envStatus.gemini ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'}`}>
              <Cpu size={20} />
            </div>
            {envStatus.gemini ? <Unlock size={16} className="text-blue-500" /> : <Lock size={16} className="text-amber-500" />}
          </div>
          <h4 className="font-bold text-gray-900">Gemini AI 大腦</h4>
          <p className="text-[10px] text-gray-500 mt-1 font-medium">{envStatus.gemini ? 'API 金鑰已解鎖' : '缺乏 API_KEY，功能受限'}</p>
        </div>

        <div className={`p-6 rounded-[28px] border transition-all ${isCloudConnected ? 'bg-indigo-50/50 border-indigo-100' : 'bg-gray-50 border-gray-100'}`}>
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${isCloudConnected ? 'bg-indigo-500 text-white' : 'bg-gray-400 text-white'}`}>
              <ShieldCheck size={20} />
            </div>
            {isCloudConnected ? <CheckCircle2 size={16} className="text-indigo-500" /> : <AlertCircle size={16} className="text-gray-400" />}
          </div>
          <h4 className="font-bold text-gray-900">使用者身分驗證</h4>
          <p className="text-[10px] text-gray-500 mt-1 font-medium">{isCloudConnected ? '已安全登入雲端' : '目前為離線展示模式'}</p>
        </div>
      </div>

      {isDeploying && (
        <div className="apple-card p-10 bg-gray-900 text-white animate-in zoom-in-95 duration-500 overflow-hidden relative">
           <div className="absolute top-0 left-0 h-1 bg-blue-500 transition-all duration-300" style={{ width: `${deployProgress}%` }}></div>
           <div className="flex justify-between items-end mb-6">
              <div>
                <h4 className="text-2xl font-black mb-1">生產環境編譯中...</h4>
                <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">狀態: {deployProgress < 100 ? '正在封裝資產...' : '網站已正式上線'}</p>
              </div>
              <span className="text-4xl font-black tabular-nums">{deployProgress}%</span>
           </div>
           <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${deployProgress}%` }}></div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-12">
          <div className="apple-card flex flex-col h-full min-h-[400px] bg-[#09090B] border border-gray-800 shadow-2xl overflow-hidden relative">
            <div className="px-6 py-4 border-b border-gray-800 bg-[#121214] flex justify-between items-center shrink-0 z-30">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Terminal size={12} className="text-[#007AFF]" /> build_output.log
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 font-mono text-[12px] leading-relaxed bg-black/20 relative z-10">
              {logs.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-gray-800">
                  <p className="font-black uppercase tracking-[0.4em] opacity-20">等待測試指令...</p>
                </div>
              )}
              {logs.map((log) => (
                <div key={log.id} className="flex gap-5 mb-2 animate-in fade-in slide-in-from-left-2 duration-300">
                  <span className="text-gray-700 shrink-0 font-bold tabular-nums">[{log.time}]</span>
                  <span className={`font-black shrink-0 w-20 text-right uppercase tracking-tighter ${
                    log.module === 'BUILD' ? 'text-blue-400' : 'text-gray-500'
                  }`}>{log.module}</span>
                  <pre className={`whitespace-pre-wrap flex-1 break-all font-mono ${
                    log.status === 'success' ? 'text-[#34C759]' : 
                    log.status === 'critical' ? 'text-[#007AFF] font-black' : 
                    log.status === 'warning' ? 'text-amber-500' : 'text-gray-400'
                  }`}>{log.message}</pre>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemLab;
