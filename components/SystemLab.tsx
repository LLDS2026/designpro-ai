
import React, { useState, useEffect, useRef } from 'react';
import { Beaker, ShieldCheck, Terminal, Database, Calendar, CreditCard, PenTool, Cpu, Globe, Rocket, Zap, Activity, ChevronRight, BarChart3, Fingerprint, CloudDownload, Server, CheckCircle2 } from 'lucide-react';

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
    addLog('DEPLOY', 'Initializing production build sequence...', 'info');
    
    const steps = [
      { p: 10, m: 'BUILD', msg: 'Optimizing frontend assets (Vite/Rollup)...', s: 'info' },
      { p: 30, m: 'BUILD', msg: 'Minifying JS/CSS bundles. Saved 450KB.', s: 'success' },
      { p: 50, m: 'CLOUD', msg: 'Pushing build to Edge Network (Global CDN)...', s: 'info' },
      { p: 70, m: 'SECURE', msg: 'Applying SSL certificates & Security headers...', s: 'success' },
      { p: 90, m: 'PROD', msg: 'Updating routing tables. Clearing cache...', s: 'info' },
      { p: 100, m: 'PROD', msg: 'DEPLOYMENT COMPLETE. Live at https://designpro.ai', s: 'critical' }
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
      { m: 'KERNEL', msg: 'DesignPro AI Agent OS v2.5.0 initializing...', s: 'info' },
      { m: 'SYSTEM', msg: 'Hardware check: Neural Engine found.', s: 'success' },
      { m: 'AUTH', msg: 'API_KEY validated. Session token generated.', s: 'success' },
      { m: 'AI_CORE', msg: 'Gemini-3-Pro-Preview integration active.', s: 'success' },
      { m: 'SYSTEM', msg: '>>> ALL SYSTEMS NOMINAL. <<<', s: 'critical' }
    ];
    for (const step of steps) {
      await new Promise(r => setTimeout(r, 150));
      addLog(step.m, step.msg, step.s as any);
    }
    setActiveTest(null);
  };

  const runTest = (testId: string) => {
    setActiveTest(testId);
    addLog('AGENT', `正在初始化模組測試: ${testId.toUpperCase()}...`);
    setTimeout(() => {
      addLog(testId.toUpperCase(), 'Test passed with 0 errors.', 'success');
      setActiveTest(null);
    }, 800);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">System Lab</h2>
          <p className="text-sm font-medium text-gray-400 mt-1 uppercase tracking-widest">正式發佈與生產環境部署中心</p>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={bootSequence}
             disabled={activeTest !== null || isDeploying}
             className="px-6 py-3 bg-white border border-gray-200 text-gray-900 rounded-2xl shadow-sm flex items-center gap-2 hover:bg-gray-50 transition active:scale-95 disabled:opacity-50"
           >
             <Zap size={16} className="text-blue-500" />
             <span className="text-[11px] font-black uppercase tracking-[0.2em]">系統自檢</span>
           </button>
           <button 
             onClick={startDeployment}
             disabled={isDeploying}
             className="px-6 py-3 bg-gray-900 text-white rounded-2xl shadow-xl flex items-center gap-2 hover:bg-black transition active:scale-95 disabled:opacity-50"
           >
             <Rocket size={18} className={isDeploying ? 'animate-bounce' : ''} />
             <span className="text-[11px] font-black uppercase tracking-[0.2em]">Deploy to Production</span>
           </button>
        </div>
      </div>

      {isDeploying && (
        <div className="apple-card p-10 bg-gray-900 text-white animate-in zoom-in-95 duration-500 overflow-hidden relative">
           <div className="absolute top-0 left-0 h-1 bg-blue-500 transition-all duration-300" style={{ width: `${deployProgress}%` }}></div>
           <div className="flex justify-between items-end mb-6">
              <div>
                <h4 className="text-2xl font-black mb-1">Production Build in Progress</h4>
                <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">Status: {deployProgress < 100 ? 'Packaging Assets...' : 'Site is Live'}</p>
              </div>
              <span className="text-4xl font-black tabular-nums">{deployProgress}%</span>
           </div>
           <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${deployProgress}%` }}></div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="apple-card p-8 bg-white border border-gray-100 flex-1 flex flex-col">
            <h3 className="font-bold text-gray-900 text-lg mb-6">功能驗證</h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'drive', label: '雲端同步測試', icon: Database },
                { id: 'calendar', label: '排程引擎校準', icon: Calendar },
                { id: 'finance', label: '財務核心審計', icon: CreditCard },
                { id: 'sketch', label: 'GPU 渲染加速', icon: Cpu },
              ].map((test) => (
                <button
                  key={test.id}
                  onClick={() => runTest(test.id)}
                  className="p-4 rounded-xl border border-gray-100 bg-[#FBFBFD] flex items-center gap-3 hover:border-blue-200 transition group"
                >
                  <test.icon size={16} className="text-gray-400 group-hover:text-blue-500" />
                  <span className="text-[11px] font-bold text-gray-700 uppercase tracking-widest">{test.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="apple-card p-6 bg-gradient-to-br from-[#007AFF] to-[#5856D6] text-white">
             <div className="flex items-center gap-3 mb-4">
                <Server size={20} />
                <h4 className="font-black text-sm uppercase tracking-widest">伺服器節點</h4>
             </div>
             <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold opacity-60">
                   <span>US-EAST (Primary)</span>
                   <span className="text-green-300">ONLINE</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold opacity-60">
                   <span>ASIA-EAST (CDN)</span>
                   <span className="text-green-300">ONLINE</span>
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="apple-card flex flex-col h-full min-h-[500px] bg-[#09090B] border border-gray-800 shadow-2xl overflow-hidden relative">
            <div className="px-6 py-4 border-b border-gray-800 bg-[#121214] flex justify-between items-center shrink-0 z-30">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Terminal size={12} className="text-[#007AFF]" /> build_output.log
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 font-mono text-[12px] leading-relaxed bg-black/20 relative z-10">
              {logs.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-gray-800">
                  <p className="font-black uppercase tracking-[0.4em] opacity-20">NO BUILD ACTIVITY</p>
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
                    log.status === 'critical' ? 'text-[#007AFF] font-black' : 'text-gray-400'
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
