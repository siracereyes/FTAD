import React, { useState, useEffect, useMemo } from 'react';
import { fetchFTADData } from './services/dataService';
import { TARecord, FTADStats } from './types';
import StatCard from './components/StatCard';
import DataTable from './components/DataTable';
import { 
  RefreshCw, Database, Activity, 
  Target, Building2, Info
} from 'lucide-react';

const LOGO_URL = "https://depedcaloocan.com/wp-content/uploads/2025/07/webtap.png";

const App: React.FC = () => {
  const [data, setData] = useState<TARecord[]>([]);
  const [loading, setLoading] = useState(true);
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
    if (data.length === 0) return { totalInterventions: 0, resolutionRate: 0, totalObjectives: 0, uniqueEntities: 0 };
    
    // 1. Total interventions is just the record count
    const totalInterventions = data.length;

    // 2. Resolution Rate: check all MATATAG pillars for Met/Complete status
    const allPillarItems = data.flatMap(d => [
      ...d.access, ...d.equity, ...d.quality, ...d.resilience, ...d.enabling
    ]);
    const resolvedItems = allPillarItems.filter(item => {
      const s = item.status?.toLowerCase() || "";
      return s.includes('met') || s.includes('complete') || s.includes('done') || s.includes('yes');
    });
    const resolutionRate = allPillarItems.length > 0 ? (resolvedItems.length / allPillarItems.length) * 100 : 0;

    // 3. Total Objectives: count all defined technical targets
    const totalObjectives = data.reduce((acc, d) => acc + d.targets.filter(t => t.objective).length, 0);

    // 4. Unique Entities: number of unique schools/divisions
    const uniqueEntities = new Set(data.map(d => d.divisionSchool.trim()).filter(Boolean)).size;
    
    return {
      totalInterventions,
      resolutionRate,
      totalObjectives,
      uniqueEntities
    };
  }, [data]);

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
            <div className="hidden lg:flex flex-col items-end mr-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</span>
              <span className="text-[12px] font-black text-emerald-600 leading-tight flex items-center gap-2 uppercase">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                Live Monitoring
              </span>
            </div>
            <div className="h-8 w-px bg-slate-100 mx-2 hidden lg:block"></div>
            <button onClick={loadData} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all" title="Refresh Data">
              <RefreshCw size={20} className={loading ? 'animate-spin text-indigo-600' : ''} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-10 mt-12">
        {error && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 font-bold uppercase text-xs">
            <Info size={18} />
            {error}
          </div>
        )}

        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 mb-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Regional Hub</span>
              <span className="text-slate-200">/</span>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Technical Analytics</span>
            </div>
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Regional Monitoring Overview</h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Analyzing Technical Assistance interventions across {stats.uniqueEntities} unique institutional entities.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <StatCard 
            title="Registry Volume" 
            value={stats.totalInterventions.toLocaleString()} 
            icon={<Database size={24} />}
          />
          <StatCard 
            title="Strategic Resolution" 
            value={`${stats.resolutionRate.toFixed(1)}%`}
            isPositive={stats.resolutionRate > 70}
            icon={<Activity size={24} />}
          />
          <StatCard 
            title="Support Objectives" 
            value={stats.totalObjectives.toString()}
            icon={<Target size={24} />}
          />
          <StatCard 
            title="Institutional Reach" 
            value={stats.uniqueEntities.toString()}
            icon={<Building2 size={24} />}
          />
        </div>

        <div className="mb-20">
          {data.length > 0 ? (
            <DataTable records={data} />
          ) : (
            <div className="bg-white p-32 rounded-[3rem] border border-slate-100 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-8">
                <Database size={48} />
              </div>
              {loading ? (
                <div className="animate-pulse">
                  <h4 className="text-2xl font-black text-slate-900 mb-2">Syncing Data...</h4>
                  <p className="text-slate-400 font-medium">Connecting to regional technical assistance records.</p>
                </div>
              ) : (
                <>
                  <h4 className="text-2xl font-black text-slate-900 mb-2">Registry Void</h4>
                  <p className="text-slate-400 font-medium max-w-sm">No operational records found in the current synchronization cycle.</p>
                </>
              )}
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