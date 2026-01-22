
import React from 'react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: View.DASHBOARD, label: 'COMMAND', icon: '📡' },
    { id: View.REFINERY, label: 'REFINERY', icon: '🧪' },
    { id: View.STUDIO, label: 'STUDIO', icon: '🎬' },
    { id: View.ARCHIVE, label: 'VAULT', icon: '🔒' },
    { id: View.SETTINGS, label: 'SYSTEM', icon: '⚙️' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 glass border-r border-gray-800 p-6 gap-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center font-black text-black text-xl shadow-[0_0_20px_rgba(34,211,238,0.3)]">
          M
        </div>
        <div>
          <h1 className="font-extrabold tracking-tighter text-lg leading-none">OPERATION</h1>
          <p className="text-cyan-400 text-xs font-bold tracking-[0.2em] mt-1">MIRROR</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group ${
              currentView === item.id 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' 
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
            <span className="font-bold tracking-tight text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="glass p-4 rounded-xl border border-gray-800">
          <p className="text-[10px] text-gray-500 font-bold mb-2 uppercase tracking-widest">Arsenal Status</p>
          <div className="space-y-2">
            <StatusItem label="KOKORO-82M" active />
            <StatusItem label="F5-TTS" active />
            <StatusItem label="LIVEPORTRAIT" active />
            <StatusItem label="LLAMA-3.2" active />
          </div>
        </div>
      </div>
    </aside>
  );
};

const StatusItem: React.FC<{ label: string; active: boolean }> = ({ label, active }) => (
  <div className="flex items-center justify-between">
    <span className="text-[10px] mono text-gray-400">{label}</span>
    <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-500' : 'bg-red-500'} shadow-[0_0_5px_rgba(34,197,94,0.5)]`}></div>
  </div>
);

export default Sidebar;
