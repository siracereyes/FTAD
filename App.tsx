import React, { useState, useEffect, useMemo } from 'react';
import { fetchFTADData } from './services/dataService';
import { getAIInsights } from './services/geminiService';
import { TARecord, FTADStats } from './types';
import StatCard from './components/StatCard';
import DataTable from './components/DataTable';
import { 
  RefreshCw, BrainCircuit, Database, Activity, 
  TrendingUp, ClipboardCheck
} from 'lucide-react';

const LOGO_URL = "https://depedcaloocan.com/wp-content/uploads/2025/07/webtap.png";

const App: React.FC = () => {
  const [data, setData] = useState<TARecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [insights, setInsights] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const records = await fetchFTADData();
      setData(records);
    } catch (err) {
      console.error(err);
      setError("Failed to sync with FTAD database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadData(); 
  }, []);

  const stats: FTADStats = useMemo(() => {
    if (data.length === 0) return { totalTA: 0, completionRate: 0, activeMonitoring: 0, pendingRequests: 0 };
    
    // Calculate targets based on extracted data
    const allTargets = data.flatMap(d => d.targets).filter(t => t.objective);
    const completedTargets = allTargets.filter(t => {
      const s = t.status?.toLowerCase() || "";
      return s.includes('complete') || s.includes('done') || s.includes('met') || s.includes('yes');
    });
    const pending = allTargets.filter(t => t.status?.toLowerCase().includes('pending'));
    
    return {
      totalTA: data.length,
      completionRate: allTargets.length > 0 ? (completedTargets.length / allTargets.length) * 100 : 0,
      activeMonitoring: allTargets.length - completedTargets.length,
      pendingRequests: pending.length
    };
  }, [data]);

  const topDivisions = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(r => {
      if (r.divisionSchool) {
        counts[r.divisionSchool] = (counts[r.divisionSchool] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [data]);

  const topCategories = useMemo(() => {
    return [
      { name: 'Access', count: data.reduce((acc, r) => acc + r.access.length, 0) },
      { name: 'Equity', count: data.reduce((acc, r) => acc + r.equity.length, 0) },
      { name: 'Quality', count: data.reduce((acc, r) => acc + r.quality.length, 0) },
      { name: 'Resilience', count: data.reduce((acc, r) => acc + r.resilience.length, 0) },
      { name: 'Enabling', count: data.reduce((acc, r) => acc + r.enabling.length, 0) },
    ].sort((a, b) => b.count - a.count);
  }, [data]);

  const triggerAI = async () => {
    if (data.length === 0) return;
    setAiLoading(true);
    const result = await getAIInsights(stats, topDivisions, topCategories);
    setInsights(result);
    setAiLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-6 text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Synchronizing Registry...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-20">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-100 px-10 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white p-1 rounded-2xl shadow-xl shadow-indigo-600/10 border border-slate-100 overflow-hidden">
              <img src={LOGO_URL} alt="FTAD Logo" className="h-10 w-auto object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none uppercase">Field Technical Assistance Division</h1>
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1 block">
                Regional Technical Assistance Monitoring Dashboard
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button onClick={loadData} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all" title="Refresh Data">
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-10 mt-12">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 mb-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Live Registry Stream</span>
              <span className="text-slate-200">/</span>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Field Monitoring Intelligence</span>
            </div>
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Regional Monitoring Overview</h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Real-time synchronization of Technical Assistance activities across all reporting offices.
            </p>
          </div>
          <button 
            onClick={triggerAI}
            disabled={aiLoading || data.length === 0}
            className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/20 flex items-center gap-3 disabled:opacity-70 group"
          >
            <BrainCircuit size={24} className="group-hover:rotate-12 transition-transform text-teal-400" />
            {aiLoading ? 'SYNTHESIZING...' : 'GENERATE STRATEGIC REPORT'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <StatCard 
            title="Total Registry Entries" 
            value={stats.totalTA.toLocaleString()} 
            icon={<Database size={24} />}
          />
          <StatCard 
            title="Registry Success Rate" 
            value={`${stats.completionRate.toFixed(1)}%`}
            isPositive={stats.completionRate > 75}
            icon={<TrendingUp size={24} />}
          />
          <StatCard 
            title="Active Operations" 
            value={stats.activeMonitoring.toString()}
            icon={<Activity size={24} />}
          />
          <StatCard 
            title="Pending Requests" 
            value={stats.pendingRequests.toString()}
            isPositive={stats.pendingRequests < 5}
            icon={<ClipboardCheck size={24} />}
          />
        </div>

        {insights && (
          <div className="mb-16 bg-indigo-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-3xl shadow-indigo-900/20 animate-in zoom-in duration-500">
             <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                    <BrainCircuit size={32} className="text-teal-400" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">AI Executive Summary</h3>
                </div>
                <div className="columns-1 md:columns-2 gap-12 text-indigo-50 text-base leading-relaxed font-medium">
                  {insights.split('\n').filter(l => l.trim()).map((line, i) => (
                    <p key={i} className="mb-6 border-l-4 border-teal-500/30 pl-6 py-2 bg-white/5 rounded-r-2xl">
                      {line.replace(/^[*-]\s*/, '')}
                    </p>
                  ))}
                </div>
             </div>
          </div>
        )}

        <div className="mb-20">
          {data.length > 0 ? (
            <DataTable records={data} />
          ) : (
            <div className="bg-white p-32 rounded-[3rem] border border-slate-100 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-8">
                <Database size={48} />
              </div>
              <h4 className="text-2xl font-black text-slate-900 mb-2">Registry Void</h4>
              <p className="text-slate-400 font-medium max-w-sm">No operational records found in the current synchronization cycle.</p>
            </div>
          )}
        </div>
      </main>

      <style>{`
        body { background-color: #FDFDFF; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}</style>
    </div>
  );
};

export default App;