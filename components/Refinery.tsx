
import React, { useState } from 'react';
import { refineScript, ScriptTone } from '../services/gemini';
import { Script } from '../types';

interface RefineryProps {
  onSaveScript: (script: Script) => void;
}

const Refinery: React.FC<RefineryProps> = ({ onSaveScript }) => {
  const [input, setInput] = useState('');
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [tone, setTone] = useState<ScriptTone>('viral');
  const [refined, setRefined] = useState('');
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<any[]>([]);

  const handleRefine = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setSources([]);
    try {
      const result = await refineScript(input, isUrlMode, tone);
      setRefined(result.text);
      if (result.sources) setSources(result.sources);
    } catch (error) {
      console.error(error);
      alert('REFINERY MALFUNCTION: Check system telemetry.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    const newScript: Script = {
      id: crypto.randomUUID(),
      originalText: input,
      refinedText: refined,
      sourceUrl: isUrlMode ? input : undefined,
      timestamp: Date.now()
    };
    onSaveScript(newScript);
    setInput('');
    setRefined('');
    alert('INTEL ARCHIVED: Script stored in local buffer.');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in slide-in-from-bottom-6 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-gray-800 pb-8">
        <div>
          <h2 className="text-5xl font-black tracking-tighter text-white uppercase italic">The Refinery</h2>
          <p className="text-gray-500 mt-2 font-mono text-[10px] tracking-widest uppercase">Phase 2: Narrative Optimization Protocol</p>
        </div>
        
        <div className="flex gap-2">
          {(['aggressive', 'viral', 'informative', 'stoic'] as ScriptTone[]).map(t => (
            <button 
              key={t}
              onClick={() => setTone(t)}
              className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border transition-all ${tone === t ? 'bg-red-500 border-red-500 text-white' : 'border-gray-800 text-gray-500 hover:text-gray-300'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <div className="flex gap-4">
               <button onClick={() => setIsUrlMode(false)} className={`text-[10px] font-black uppercase tracking-[0.2em] ${!isUrlMode ? 'text-cyan-400 underline decoration-2 underline-offset-8' : 'text-gray-600'}`}>Raw Payload</button>
               <button onClick={() => setIsUrlMode(true)} className={`text-[10px] font-black uppercase tracking-[0.2em] ${isUrlMode ? 'text-cyan-400 underline decoration-2 underline-offset-8' : 'text-gray-600'}`}>URL Bridge</button>
            </div>
          </div>
          
          <div className="relative group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isUrlMode ? "https://target-intel.com/article-path" : "Input raw data for distillation..."}
              className={`w-full glass rounded-3xl p-8 border border-gray-800 focus:border-cyan-500 outline-none transition-all resize-none text-sm leading-relaxed custom-scrollbar ${isUrlMode ? 'h-24' : 'h-[400px]'}`}
            />
            {!input && <div className="absolute top-8 left-8 pointer-events-none opacity-20 text-xs font-mono uppercase">Awaiting Input...</div>}
          </div>

          <button
            onClick={handleRefine}
            disabled={loading || !input.trim()}
            className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-900 disabled:text-gray-700 transition-all rounded-2xl font-black text-black tracking-[0.4em] uppercase shadow-[0_0_30px_rgba(34,211,238,0.2)]"
          >
            {loading ? 'DISTILLING NARRATIVE...' : 'EXECUTE REFINEMENT'}
          </button>

          {sources.length > 0 && (
            <div className="glass p-6 rounded-2xl border border-gray-800 space-y-3">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Grounding Sources</p>
              <div className="space-y-1">
                {sources.map((s, i) => (
                  <a key={i} href={s.web?.uri} target="_blank" className="flex items-center gap-2 text-[10px] text-cyan-400 hover:text-white transition-colors truncate">
                    <span className="opacity-30">[{i+1}]</span> {s.web?.title || s.web?.uri}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
           <label className="text-[10px] font-black tracking-widest text-red-500 uppercase px-2 block">Optimized Script Output</label>
           <div className="relative h-[400px]">
              <div className={`w-full h-full glass rounded-3xl p-8 border border-gray-800 overflow-y-auto text-sm leading-loose custom-scrollbar font-mono ${!refined && 'flex items-center justify-center italic text-gray-800'}`}>
                {loading ? (
                  <div className="space-y-4 w-full">
                    <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-white/5 rounded w-1/2 animate-pulse"></div>
                    <div className="h-4 bg-white/5 rounded w-5/6 animate-pulse"></div>
                    <div className="h-4 bg-white/5 rounded w-2/3 animate-pulse"></div>
                  </div>
                ) : (
                  refined || "SCRAPER STATUS: IDLE"
                )}
              </div>
              {refined && <div className="absolute top-4 right-8 text-[10px] font-black text-cyan-500 uppercase tracking-tighter">Verified</div>}
           </div>

           {refined && (
            <button
              onClick={handleSave}
              className="w-full py-5 bg-white hover:bg-gray-200 transition-all rounded-2xl font-black text-black tracking-[0.4em] uppercase"
            >
              VAULT INTEL
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Refinery;
