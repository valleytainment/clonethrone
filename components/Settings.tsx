
import React, { useState } from 'react';
import { testRemoteLink } from '../services/remoteBrain';

interface SettingsProps {
  remoteBrainUrl: string;
  onUpdateUrl: (url: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ remoteBrainUrl, onUpdateUrl }) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'fail' | null>(null);

  const handleTest = async () => {
    if (!remoteBrainUrl) return;
    setTesting(true);
    setTestResult(null);
    const ok = await testRemoteLink(remoteBrainUrl);
    setTestResult(ok ? 'success' : 'fail');
    setTesting(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-500 pb-24">
      <header>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-black rounded-lg">M</div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">System Parameters</h2>
        </div>
        <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.3em]">Operational OS v1.1.0 // SOVEREIGN_CORE</p>
      </header>

      {/* Backend Connection */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">📡</span>
            <h3 className="font-black uppercase tracking-widest text-sm text-gray-400">Remote Brain Interface</h3>
          </div>
          {remoteBrainUrl && (
            <button 
              onClick={handleTest}
              disabled={testing}
              className={`text-[9px] font-black px-4 py-1.5 rounded-full border transition-all uppercase tracking-[0.2em] ${
                testResult === 'success' ? 'bg-green-500/20 border-green-500 text-green-400' : 
                testResult === 'fail' ? 'bg-red-500/20 border-red-500 text-red-400' :
                'border-white/10 text-gray-500 hover:text-white hover:border-white/30'
              }`}
            >
              {testing ? 'PINGING...' : testResult === 'success' ? 'SIGNAL_STABLE' : testResult === 'fail' ? 'SIGNAL_LOST' : 'TEST_BRIDGE'}
            </button>
          )}
        </div>

        <div className="glass p-8 rounded-[40px] border border-white/5 space-y-8 bg-black/40 shadow-2xl">
          <div className="space-y-4">
            <label className="text-[10px] font-black tracking-[0.3em] text-cyan-400 uppercase block">Gradio / RunPod Endpoint URL</label>
            <div className="relative">
               <input
                type="text"
                value={remoteBrainUrl}
                onChange={(e) => onUpdateUrl(e.target.value)}
                placeholder="https://xxxxxx.gradio.live"
                className="w-full bg-black border border-white/10 rounded-2xl p-6 text-sm font-mono text-gray-300 focus:border-cyan-500 outline-none transition-all shadow-inner placeholder:text-gray-800"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                 <span className="text-xl">🔗</span>
              </div>
            </div>
          </div>
          
          <div className="p-8 bg-cyan-500/5 border border-cyan-500/10 rounded-3xl space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-5 h-5 bg-cyan-500 text-black flex items-center justify-center font-bold rounded-full text-[10px]">!</div>
               <p className="text-[10px] font-black text-cyan-300 uppercase tracking-widest">Backend Deployment Protocol</p>
            </div>
            <p className="text-[11px] text-gray-500 italic leading-relaxed uppercase tracking-tight">
              1. Copy the `mirror_backend.py` payload from the repository.<br/>
              2. Launch a GPU-enabled Google Colab or RunPod session.<br/>
              3. Execute the payload and copy the public `*.gradio.live` link generated in the terminal.<br/>
              4. Paste the link above to bridge the Command Center to the GPU cluster.
            </p>
          </div>
        </div>
      </section>

      {/* Security Modules */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <span className="text-xl">🛡️</span>
          <h3 className="font-black uppercase tracking-widest text-sm text-gray-400">Security & Privacy</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SecurityCard label="VOICE_LOCK" active description="Hardcoded voice signatures prevent unauthorized Principal cloning." />
          <SecurityCard label="STEALTH_MODE" active description="Invisible watermarks (AudioSeal) embedded in all generated media." />
          <SecurityCard label="DATA_SOVEREIGNTY" active description="Assets and intel payloads remain in local encrypted storage." />
          <SecurityCard label="ZERO_COST_ARCH" active description="Optimized for free-tier GPU nodes via Gradio Tunneling." />
        </div>
      </section>

      <div className="pt-16 text-center">
        <div className="h-px w-16 bg-white/5 mx-auto mb-6"></div>
        <p className="text-[9px] font-mono text-gray-700 uppercase tracking-[0.8em]">Mirror_Sovereign_OS_v1.1.0 // ROOT</p>
      </div>
    </div>
  );
};

const SecurityCard: React.FC<{ label: string; active: boolean; description: string }> = ({ label, active, description }) => (
  <div className="glass p-8 rounded-[32px] border border-white/5 flex gap-6 bg-black/40 hover:border-cyan-500/20 transition-all duration-500 shadow-xl group">
    <div className="mt-1">
      <div className={`w-4 h-4 rounded-full transition-all duration-700 ${active ? 'bg-cyan-500 shadow-[0_0_15px_#22d3ee]' : 'bg-gray-800'}`}></div>
    </div>
    <div className="space-y-2">
      <p className="text-xs font-black tracking-[0.2em] text-white uppercase group-hover:text-cyan-300 transition-colors">{label}</p>
      <p className="text-[10px] text-gray-600 leading-relaxed uppercase font-mono tracking-tight">{description}</p>
    </div>
  </div>
);

export default Settings;
