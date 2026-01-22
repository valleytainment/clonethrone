
import React from 'react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  remoteBrainActive: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, remoteBrainActive }) => {
  const navItems = [
    { id: View.DASHBOARD, label: 'COMMAND', icon: '📡' },
    { id: View.REFINERY, label: 'REFINERY', icon: '🧪' },
    { id: View.STUDIO, label: 'STUDIO', icon: '🎬' },
    { id: View.ARCHIVE, label: 'VAULT', icon: '🔒' },
    { id: View.SETTINGS, label: 'SYSTEM', icon: '⚙️' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-72 glass border-r border-white/5 p-8 gap-10">
      <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setView(View.DASHBOARD)}>
        <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center font-black text-2xl shadow-[0_0_30px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform duration-500">
          M
        </div>
        <div>
          <h1 className="font-black tracking-tighter text-xl leading-none text-white italic">MIRROR</h1>
          <p className="text-cyan-500 text-[10px] font-black tracking-[0.4em] mt-1.5 uppercase">Command</p>
        </div>
      </div>

      <nav className="flex flex-col gap-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex items-center gap-5 px-6 py-4 rounded-2xl transition-all duration-500 group border ${
              currentView === item.id 
                ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.1)] scale-[1.05]' 
                : 'text-gray-500 hover:text-white hover:bg-white/5 border-transparent'
            }`}
          >
            <span className={`text-xl transition-transform duration-500 ${currentView === item.id ? 'scale-110' : 'group-hover:scale-110 opacity-50'}`}>{item.icon}</span>
            <span className="font-black tracking-widest text-[11px] uppercase">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-6">
        <div className="glass p-6 rounded-3xl border border-white/5 bg-black/40 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
             <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Signal Integrity</p>
             <div className={`w-2 h-2 rounded-full ${remoteBrainActive ? 'bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`}></div>
          </div>
          <div className="space-y-3">
            <StatusItem label="KOKORO_V1" active />
            <StatusItem label="F5_MATCH" active />
            <StatusItem label="PORTRAIT_X" active />
            <StatusItem label="GEMINI_API" active />
          </div>
        </div>
        
        <div className="px-2">
           <p className="text-[9px] font-mono text-gray-700 uppercase tracking-widest">Sovereign_OS v1.1.0</p>
        </div>
      </div>
    </aside>
  );
};

const StatusItem: React.FC<{ label: string; active: boolean }> = ({ label, active }) => (
  <div className="flex items-center justify-between group">
    <span className="text-[9px] font-mono text-gray-600 uppercase tracking-tighter group-hover:text-gray-400 transition-colors">{label}</span>
    <span className="text-[8px] font-black text-gray-800 uppercase tracking-widest">OK</span>
  </div>
);

export default Sidebar;
