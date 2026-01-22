
import React from 'react';
import { Project } from '../types';

interface DashboardProps {
  projects: Project[];
  stats: { scripts: number };
}

const Dashboard: React.FC<DashboardProps> = ({ projects, stats }) => {
  const completed = projects.filter(p => p.status === 'completed').length;
  const active = projects.filter(p => p.status === 'processing').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="relative overflow-hidden glass rounded-3xl p-10 border border-cyan-500/20">
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(var(--cyan) 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
        
        <header className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-cyan-500 text-black px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">Sovereign Node</span>
              <span className="text-[10px] mono text-gray-500 italic">V1.0.4-SOVEREIGN</span>
            </div>
            <h2 className="text-5xl font-black tracking-tighter text-white glow-cyan italic">MIRROR COMMAND</h2>
            <p className="text-gray-400 mt-2 font-mono text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Principal: MIRROR_ROOT // STATUS: ONLINE
            </p>
          </div>
          
          <div className="flex gap-1">
            {[...Array(12)].map((_, i) => (
              <div key={i} className={`w-1.5 h-6 rounded-full transition-all duration-1000 ${i < 4 ? 'bg-cyan-500' : 'bg-gray-800'}`}></div>
            ))}
          </div>
        </header>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="INTEL REFINED" value={stats.scripts.toString()} unit="PAYLOADS" trend="+4 VS LAST_BOOT" color="cyan" />
        <StatCard title="ACTIVE TASKS" value={active.toString()} unit="GENS" trend="SYSTEM_STABLE" color="red" />
        <StatCard title="DEPLOYED ASSETS" value={completed.toString()} unit="VIDEOS" trend="PEAKING" color="white" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h3 className="font-bold tracking-widest text-xs text-gray-500 uppercase flex items-center gap-2 mb-4">
             Tactical Activity Log
          </h3>
          <div className="space-y-3">
            {projects.slice(0, 4).map(p => (
              <div key={p.id} className="glass p-5 rounded-2xl border border-gray-800 flex items-center gap-4 hover:border-cyan-500/40 transition-all cursor-pointer group">
                <div className="w-14 h-14 rounded-xl bg-black border border-gray-800 flex items-center justify-center text-2xl overflow-hidden relative">
                  {p.sourceImage && <img src={p.sourceImage} className="w-full h-full object-cover opacity-60" />}
                  {!p.sourceImage && "🎬"}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black truncate group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{p.title}</h4>
                  <p className="text-[10px] text-gray-500 font-mono">ID: {p.id.split('-')[0]} // {p.status.toUpperCase()}</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${p.status === 'completed' ? 'bg-green-500' : 'bg-cyan-500 animate-pulse'}`}></div>
              </div>
            ))}
            {projects.length === 0 && <p className="text-center py-12 text-gray-800 text-xs italic uppercase tracking-widest">Buffer Empty</p>}
          </div>
        </section>

        <section className="glass rounded-[40px] p-10 border border-gray-800 relative overflow-hidden flex flex-col justify-center min-h-[340px]">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
             <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M0,70 Q25,30 50,70 T100,70" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-500" />
                <path d="M0,50 Q25,80 50,50 T100,50" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-cyan-300" />
             </svg>
          </div>
          <div className="text-center relative z-10 space-y-6">
             <h4 className="text-xs font-black tracking-[0.5em] text-gray-500 uppercase">Global Propagation Force</h4>
             <p className="text-6xl font-black text-white glow-cyan tracking-tighter">{(completed * 12.4).toFixed(1)}k</p>
             <p className="text-[10px] text-gray-500 font-mono tracking-widest">ESTIMATED NETWORK IMPRESSIONS</p>
             <div className="pt-6">
                <button className="bg-white text-black px-10 py-3 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-cyan-400 transition-all shadow-2xl">
                  Boost Global Signal
                </button>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; unit: string; trend: string; color: 'cyan' | 'red' | 'white' }> = ({ title, value, unit, trend, color }) => {
  const colors = {
    cyan: 'text-cyan-400 glow-cyan',
    red: 'text-red-500 glow-red',
    white: 'text-white'
  };
  
  return (
    <div className="glass p-8 rounded-[32px] border border-gray-800 relative group overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent"></div>
      <p className="text-[10px] text-gray-500 font-black tracking-[0.3em] mb-6 uppercase">{title}</p>
      <div className="flex items-baseline gap-3">
        <span className={`text-6xl font-black tracking-tighter ${colors[color]}`}>{value}</span>
        <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">{unit}</span>
      </div>
      <p className="text-[10px] font-mono text-gray-700 mt-6 border-t border-gray-800 pt-4">{trend}</p>
    </div>
  );
};

export default Dashboard;
