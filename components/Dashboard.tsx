import React, { useState } from 'react';
import { Project, ToolAction, AIInsight } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BrainCircuit, Zap, TrendingUp, Lightbulb, ChevronRight, Activity, ShieldCheck, Cpu, Globe, Mic, ImageIcon, FolderKanban, Loader2, Check, Search, ExternalLink } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{text: string, links: {uri: string, title: string}[]} | null>(null);
  
  const hasApiKey = !!process.env.API_KEY;

  const handleGlobalSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: searchQuery,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.filter(chunk => chunk.web)
        .map(chunk => ({ uri: chunk.web!.uri, title: chunk.web!.title || '參考連結' })) || [];

      setSearchResult({
        text: response.text || '',
        links: links
      });
    } catch (error) {
      console.error("Search grounding failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30'];
  const data = [
    { name: '建築', value: projects.filter(p => p.type === 'Architectural').length },
    { name: '室內', value: projects.filter(p => p.type === 'Interior').length },
    { name: '平面', value: projects.filter(p => p.type === 'Graphic').length },
    { name: '影像', value: projects.filter(p => p.type === 'Media').length },
  ];

  return (
    <div className="space-y-10 pb-10 animate-in fade-in duration-1000">
      {/* Search Grounding Section */}
      <section className="apple-card p-1">
        <div className="bg-gray-900 rounded-[22px] p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Search size={18} className="text-blue-400" />
              設計情報站 <span className="text-[10px] text-blue-400/50 uppercase tracking-widest font-black ml-2">Google Search Live</span>
            </h3>
            <div className="flex gap-3 mb-6">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGlobalSearch()}
                placeholder="詢問有關建材、趨勢或法規的最新資訊..."
                className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              <button 
                onClick={handleGlobalSearch}
                disabled={isSearching}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition flex items-center gap-2"
              >
                {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                尋找靈感
              </button>
            </div>

            {searchResult && (
              <div className="bg-white/5 border border-white/5 rounded-2xl p-6 animate-in slide-in-from-top-2">
                <p className="text-gray-300 text-sm leading-relaxed mb-4">{searchResult.text}</p>
                <div className="flex flex-wrap gap-2">
                  {searchResult.links.map((link, i) => (
                    <a 
                      key={i} 
                      href={link.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[10px] font-bold text-blue-400 hover:bg-blue-500/20 transition"
                    >
                      <ExternalLink size={10} />
                      {link.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Dynamic AI Insights Hero */}
      <section className="relative p-10 rounded-[40px] overflow-hidden shadow-2xl shadow-indigo-100/50">
        <div className="absolute inset-0 bg-gradient-to-br from-[#09090B] via-[#1D1D21] to-[#09090B]"></div>
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
                onClick={(e) => { e.stopPropagation(); onInsightAction(insight); }}
                className="text-xs font-black py-4 px-6 rounded-2xl bg-white text-gray-950 hover:bg-blue-400 hover:text-white transition-all w-full flex items-center justify-center gap-2"
              >
                {insight.actionLabel}
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Other sections remain... */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <div className="apple-card p-10">
            <h3 className="font-black text-gray-900 text-xl tracking-tight flex items-center gap-3 mb-10">
              <Cpu size={22} className="text-[#007AFF]" />
              近期自動化任務
            </h3>
            <div className="space-y-3">
              {recentActions.map((action, idx) => (
                <div key={idx} className="flex items-center gap-6 p-5 rounded-[24px] hover:bg-[#F5F5F7] transition-all group border border-transparent hover:border-gray-100">
                   <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-xl">
                     {action.type === 'calendar' ? '📅' : '⚡'}
                   </div>
                   <div className="flex-1">
                      <p className="text-[14px] font-bold text-gray-900">{action.action}</p>
                      <p className="text-[12px] text-gray-400 mt-1">{action.details}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="apple-card p-10 h-full flex flex-col items-center">
            <h3 className="font-bold text-gray-900 mb-8 uppercase tracking-widest text-xs">專案類型佔比</h3>
            <div className="flex-1 w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;