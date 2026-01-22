
import React from 'react';

interface SettingsProps {
  remoteBrainUrl: string;
  onUpdateUrl: (url: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ remoteBrainUrl, onUpdateUrl }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-500">
      <header>
        <h2 className="text-4xl font-black tracking-tighter text-white">SYSTEM PARAMETERS</h2>
        <p className="text-gray-400 mt-2">Configure the infrastructure bridge and security protocols.</p>
      </header>

      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
          <span className="text-2xl">🔗</span>
          <h3 className="font-bold uppercase tracking-widest text-sm text-gray-500">Remote Brain Connection</h3>
        </div>

        <div className="glass p-8 rounded-3xl border border-gray-800 space-y-4">
          <label className="text-xs font-black tracking-widest text-cyan-400 uppercase">Gradio / RunPod Endpoint URL</label>
          <input
            type="text"
            value={remoteBrainUrl}
            onChange={(e) => onUpdateUrl(e.target.value)}
            placeholder="https://xxxxxx.gradio.live or https://api.runpod.ai/v2/..."
            className="w-full bg-black/40 border border-gray-800 rounded-xl p-4 text-sm focus:border-cyan-500 outline-none transition-all"
          />
          <p className="text-[10px] text-gray-500 italic leading-relaxed">
            This URL connects this dashboard to your high-performance compute instance (Google Colab or RunPod). Ensure the instance is running and the tunnel is active before initiating a Studio project.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
          <span className="text-2xl">🛡️</span>
          <h3 className="font-bold uppercase tracking-widest text-sm text-gray-500">Security & Sovereignty</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SecurityToggle label="VOICE LOCK" active description="Hardcoded reference audio prevents external spoofing." />
          <SecurityToggle label="AUDIOSEAL" active description="Invisible Meta watermarks embedded in all exports." />
          <SecurityToggle label="LOCAL ENCRYPTION" active description="Scripts and project metadata stored on-device only." />
          <SecurityToggle label="ZERO OPEX MODE" active description="Prioritize free tier compute where available." />
        </div>
      </section>

      <div className="pt-8 opacity-20 hover:opacity-100 transition-opacity">
        <div className="glass p-6 rounded-2xl border border-gray-800 text-center">
          <p className="text-[10px] mono text-gray-500 uppercase tracking-[0.4em]">Operation Mirror v1.0.4-SOVEREIGN</p>
        </div>
      </div>
    </div>
  );
};

const SecurityToggle: React.FC<{ label: string; active: boolean; description: string }> = ({ label, active, description }) => (
  <div className="glass p-6 rounded-2xl border border-gray-800 flex gap-4">
    <div className={`mt-1 w-4 h-4 rounded-full ${active ? 'bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-gray-800'}`}></div>
    <div className="space-y-1">
      <p className="text-xs font-black tracking-widest text-white uppercase">{label}</p>
      <p className="text-[10px] text-gray-500 leading-tight">{description}</p>
    </div>
  </div>
);

export default Settings;
