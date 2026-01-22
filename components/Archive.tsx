
import React, { useState, useRef } from 'react';
import { Project, Script, VoiceEngine } from '../types';
import { decodeBase64, decodeAudioData, playBuffer } from '../utils';

interface ArchiveProps {
  projects: Project[];
  scripts: Script[];
  onDeleteProject: (id: string) => void;
  onDeleteScript: (id: string) => void;
}

const Archive: React.FC<ArchiveProps> = ({ projects, scripts, onDeleteProject, onDeleteScript }) => {
  const [activeTab, setActiveTab] = useState<'videos' | 'scripts'>('videos');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const handleDeploy = (id: string) => {
    alert(`SIGNAL_BOOSTED: Propagation sequence initiated for ASSET_${id.split('-')[0]}.`);
  };

  const handlePlayAudio = async (audioUrl: string) => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    try {
      const base64Data = audioUrl.split(',')[1];
      const bytes = decodeBase64(base64Data);
      const buffer = await decodeAudioData(bytes, audioCtxRef.current);
      playBuffer(buffer, audioCtxRef.current);
    } catch (e) {
      alert("AUDIO_DECODE_ERROR: Asset might be corrupted or in an incompatible format.");
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-white/10 pb-12">
        <div>
          <h2 className="text-6xl font-black tracking-tighter text-white uppercase italic glow-cyan">The Vault</h2>
          <p className="text-gray-500 mt-2 font-mono text-[10px] tracking-[0.4em] uppercase">Sovereign Asset & Intel Repository</p>
        </div>
        <div className="flex bg-black border border-white/10 p-2 rounded-[32px] shadow-2xl">
          <TabButton active={activeTab === 'videos'} onClick={() => setActiveTab('videos')} label="Weaponized Assets" />
          <TabButton active={activeTab === 'scripts'} onClick={() => setActiveTab('scripts')} label="Intelligence" />
        </div>
      </header>

      {activeTab === 'videos' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {projects.filter(p => p.status === 'completed').map(project => (
            <div key={project.id} className="glass rounded-[50px] overflow-hidden border border-white/5 hover:border-cyan-500/40 transition-all group flex flex-col shadow-2xl">
              <div className="aspect-[9/16] bg-black relative group cursor-pointer overflow-hidden">
                {project.sourceImage && <img src={project.sourceImage} className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-1000" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm bg-black/40">
                   <button 
                     onClick={() => setSelectedVideo(project.videoUrl || null)}
                     className="w-24 h-24 bg-white text-black rounded-full flex items-center justify-center text-4xl shadow-[0_0_50px_rgba(255,255,255,0.4)] hover:scale-110 transition-transform"
                   >
                     ▶
                   </button>
                   {project.audioUrl && (
                     <button 
                        onClick={() => handlePlayAudio(project.audioUrl!)}
                        className="text-[10px] font-black text-cyan-400 uppercase tracking-widest hover:underline"
                     >
                       Play RAW Synthesis
                     </button>
                   )}
                </div>

                <div className="absolute top-8 left-8">
                   <span className="text-[10px] font-black uppercase tracking-widest bg-cyan-500 text-black px-4 py-1.5 rounded-full">Active_Asset</span>
                </div>
                
                <div className="absolute top-8 right-8">
                   <button onClick={() => onDeleteProject(project.id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-125 p-2 bg-black/60 rounded-full">🗑️</button>
                </div>
              </div>

              <div className="p-10 space-y-6 flex-1">
                <div>
                   <h4 className="font-black text-xl truncate uppercase tracking-tighter text-white">{project.title}</h4>
                   <p className="text-[11px] text-gray-600 font-mono mt-2 uppercase tracking-widest">TS: {new Date(project.createdAt).toLocaleString()}</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                   <span className="text-[9px] font-black bg-white/5 border border-white/10 text-gray-400 px-3 py-1.5 rounded-xl uppercase tracking-widest">{project.voiceEngine}</span>
                   <span className="text-[9px] font-black bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-3 py-1.5 rounded-xl uppercase tracking-widest">DeepAnim_v2</span>
                </div>

                <button 
                  onClick={() => handleDeploy(project.id)}
                  className="w-full py-5 bg-white text-black hover:bg-cyan-400 transition-all rounded-3xl font-black text-[11px] uppercase tracking-[0.4em] shadow-xl"
                >
                  Deploy to Network
                </button>
              </div>
            </div>
          ))}
          {projects.filter(p => p.status === 'completed').length === 0 && (
            <div className="col-span-full py-40 text-center glass rounded-[60px] border-dashed border-2 border-white/5">
               <div className="text-8xl mb-8 opacity-10">🕳️</div>
               <p className="text-gray-600 font-black uppercase tracking-[0.6em] text-sm">The Vault is empty.</p>
               <p className="text-gray-700 text-[11px] mt-4 italic uppercase tracking-widest">Execute Studio projects to weaponize likeness intel.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 max-w-5xl mx-auto">
          {scripts.map(script => (
            <div key={script.id} className="glass p-10 rounded-[40px] border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center group gap-8 hover:border-cyan-500/30 transition-all bg-gradient-to-r from-transparent to-white/[0.02]">
              <div className="space-y-5 flex-1 min-w-0">
                <div className="flex items-center gap-4">
                  <span className="bg-cyan-500 text-black px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest">Refined Intel</span>
                  <span className="text-[11px] text-gray-600 font-mono italic">{new Date(script.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-lg text-gray-200 leading-relaxed font-mono italic">"{script.refinedText}"</p>
                {script.sourceUrl && (
                  <div className="flex items-center gap-3 pt-2">
                     <span className="text-[9px] text-gray-700 uppercase font-black tracking-widest">Source Bridge:</span>
                     <p className="text-[11px] text-cyan-600 truncate hover:text-cyan-400 transition-colors cursor-pointer">{script.sourceUrl}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-6 items-center">
                 <button className="text-[11px] font-black text-gray-500 hover:text-white uppercase tracking-[0.3em] transition-colors">Clone Intel</button>
                 <button onClick={() => onDeleteScript(script.id)} className="text-red-500 opacity-20 group-hover:opacity-100 transition-opacity hover:scale-125 p-2 hover:bg-red-500/10 rounded-full">🗑️</button>
              </div>
            </div>
          ))}
          {scripts.length === 0 && (
             <p className="text-center py-32 text-gray-800 text-sm font-black italic uppercase tracking-[0.5em]">No intelligence cataloged in local buffer.</p>
          )}
        </div>
      )}

      {selectedVideo && (
        <div className="fixed inset-0 z-[200] bg-black/98 flex items-center justify-center p-6 md:p-24 animate-flicker backdrop-blur-2xl" onClick={() => setSelectedVideo(null)}>
          <div className="max-w-2xl w-full aspect-[9/16] glass rounded-[60px] overflow-hidden shadow-[0_0_200px_rgba(34,211,238,0.3)] border border-white/10 relative" onClick={e => e.stopPropagation()}>
            <video src={selectedVideo} controls autoPlay className="w-full h-full object-cover" />
            <button 
              onClick={() => setSelectedVideo(null)} 
              className="absolute top-10 right-10 w-14 h-14 bg-white/10 hover:bg-white hover:text-black transition-all rounded-full flex items-center justify-center text-xl font-bold z-[210] border border-white/10"
            >
              ✕
            </button>
            <div className="absolute bottom-10 left-10 pointer-events-none z-[210] opacity-40">
               <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em]">Tactical Playback // V1.0.4</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
  <button 
    onClick={onClick}
    className={`px-10 py-3 rounded-[24px] text-[11px] font-black transition-all uppercase tracking-widest ${active ? 'bg-white text-black shadow-2xl scale-105' : 'text-gray-600 hover:text-gray-300'}`}
  >
    {label}
  </button>
);

export default Archive;
