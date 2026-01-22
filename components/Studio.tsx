import React, { useState, useRef, useEffect } from 'react';
import { VoiceEngine, Script, Project } from '../types';
import { synthesizeVoice } from '../services/gemini';
import { triggerMirrorEngine } from '../services/remoteBrain';
import { decodeBase64, decodeAudioData, playBuffer } from '../utils';

interface StudioProps {
  scripts: Script[];
  onStartProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  remoteBrainUrl: string;
}

const Studio: React.FC<StudioProps> = ({ scripts, onStartProject, updateProject, remoteBrainUrl }) => {
  const [selectedScriptId, setSelectedScriptId] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceEngine>(VoiceEngine.KOKORO);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genLogs, setGenLogs] = useState<string[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  
  const logEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [genLogs]);

  const addLog = (msg: string) => {
    setGenLogs(prev => [...prev, `[${new Date().toLocaleTimeString('en-GB')}] > ${msg}`]);
  };

  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
      addLog("OPTICS_INIT: Camera active. Targeting Principal likeness.");
    } catch (err) {
      addLog("OPTICS_FAILURE: Access denied. System fallback to static upload.");
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        setSourceImage(canvasRef.current.toDataURL('image/png'));
        stopCamera();
        addLog("BIOMETRIC_CAPTURED: DNA marker extracted.");
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleStartGeneration = async () => {
    const script = scripts.find(s => s.id === selectedScriptId);
    if (!script || !sourceImage || (!remoteBrainUrl && selectedVoice !== VoiceEngine.GEMINI_TTS)) {
      alert('CRITICAL FAILURE: Insufficient payload data. Check Likeness, Script, and Remote Node Link.');
      return;
    }

    setIsGenerating(true);
    setGenLogs(["SESSION_INIT: Operation MIRROR Engaging..."]);
    
    const projectId = crypto.randomUUID();
    onStartProject({
      id: projectId,
      title: `Op: ${script.refinedText.substring(0, 20)}...`,
      scriptId: selectedScriptId,
      voiceEngine: selectedVoice,
      sourceImage: sourceImage,
      status: 'processing',
      log: [],
      createdAt: Date.now()
    });

    try {
      addLog(`ENGINE_LOCK: Protocol ${selectedVoice} selected.`);
      let finalAudioUrl = '';
      let finalVideoUrl = '';

      if (selectedVoice === VoiceEngine.GEMINI_TTS) {
        addLog("GEMINI_CORE: Synthesizing authority-grade audio stream...");
        finalAudioUrl = await synthesizeVoice(script.refinedText);
        addLog("SYNTH_SUCCESS: Voice buffer secured.");
      } else {
        addLog(`UPLINK: Transmitting likeness to ${remoteBrainUrl}...`);
        const response = await triggerMirrorEngine(remoteBrainUrl, {
          script: script.refinedText,
          image: sourceImage,
          voice: selectedVoice
        });

        if (response.error) throw new Error(response.error);
        if (response.logs) response.logs.forEach(l => addLog(`REMOTE: ${l}`));

        if (response.audioBlob) {
          finalAudioUrl = URL.createObjectURL(response.audioBlob);
          addLog("SIGNAL_SYNC: Audio cloning successful.");
          
          // Tactical feedback: Play the clone
          const previewAudio = new Audio(finalAudioUrl);
          previewAudio.play().catch(() => addLog("AUDIO: Playback blocked by host browser."));
        }
        
        finalVideoUrl = response.video_url || '';
      }

      addLog("POST_PROCESS: Neutralizing artifacts. Finalizing asset.");
      
      updateProject(projectId, { 
        status: 'completed', 
        videoUrl: finalVideoUrl || sourceImage, // Fallback to static if video gen skipped
        audioUrl: finalAudioUrl,
        log: [...genLogs, "> SUCCESS: Asset finalized."]
      });
      addLog("OPERATION_MIRROR: Content successfully weaponized.");
      
    } catch (error: any) {
      addLog(`FATAL_MALFUNCTION: ${error.message || 'System bridge collapse.'}`);
      updateProject(projectId, { status: 'failed' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-8">
        <div>
          <h2 className="text-6xl font-black tracking-tighter text-white uppercase italic glow-cyan">Studio Command</h2>
          <p className="text-gray-500 mt-2 font-mono text-[10px] tracking-[0.4em] uppercase">Likeness & Narrative Fusion Protocol</p>
        </div>
        <div className="flex items-center gap-3 glass px-8 py-3 rounded-full border border-cyan-500/30">
          <div className={`w-3 h-3 rounded-full ${remoteBrainUrl ? 'bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`}></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-200">
            Node: {remoteBrainUrl ? 'ACTIVE' : 'OFFLINE'}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="glass rounded-[40px] p-8 border border-white/5 relative group overflow-hidden shadow-2xl bg-black/40">
               {sourceImage && !cameraActive && <div className="scanner-line"></div>}
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Biometric Template</h3>
                  {cameraActive && <span className="text-[10px] text-red-500 font-bold animate-pulse">OPTICS_LIVE</span>}
               </div>
               
               <div className="relative aspect-square w-full rounded-3xl bg-black border border-white/10 flex items-center justify-center overflow-hidden">
                  {cameraActive ? (
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  ) : sourceImage ? (
                    <img src={sourceImage} className="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105" alt="Target" />
                  ) : (
                    <div className="text-center space-y-6 opacity-5">
                      <span className="text-9xl block">👤</span>
                      <p className="text-[12px] font-black uppercase tracking-[0.5em]">Initialize Optics</p>
                    </div>
                  )}

                  <div className="absolute inset-x-8 bottom-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-500">
                    {!cameraActive ? (
                      <button onClick={startCamera} className="flex-1 bg-white text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-cyan-400 transition-colors shadow-2xl">Capture Live</button>
                    ) : (
                      <button onClick={capturePhoto} className="flex-1 bg-cyan-500 text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-[0_0_30px_rgba(34,211,238,0.5)]">Engage</button>
                    )}
                    <label className="flex-1 bg-gray-900 border border-white/10 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center cursor-pointer hover:bg-gray-800 transition-colors">
                      Upload
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => setSourceImage(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }} />
                    </label>
                  </div>
               </div>
               <canvas ref={canvasRef} className="hidden" />
            </section>

            <section className="glass rounded-[40px] p-8 border border-white/5 space-y-4 shadow-2xl bg-black/40">
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6">Synthesis Backbone</h3>
               <VoiceSelector active={selectedVoice === VoiceEngine.KOKORO} title="KOKORO-82M" sub="LIGHT // FREE" onClick={() => setSelectedVoice(VoiceEngine.KOKORO)} />
               <VoiceSelector active={selectedVoice === VoiceEngine.F5_TTS} title="F5-TTS" sub="EMOTION // GPU" onClick={() => setSelectedVoice(VoiceEngine.F5_TTS)} />
               <VoiceSelector active={selectedVoice === VoiceEngine.GEMINI_TTS} title="GEMINI-GEN" sub="AUTHORITY // HD" onClick={() => setSelectedVoice(VoiceEngine.GEMINI_TTS)} />
               
               <div className="pt-8 border-t border-white/5 space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="w-3 h-3 bg-red-600 rounded-full shadow-[0_0_10px_#dc2626]"></div>
                     <p className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Principal Verified</p>
                  </div>
                  <p className="text-[10px] font-mono text-gray-600 uppercase leading-relaxed italic">
                    Mirror Protocol V1.1.0. All outputs watermarked for sovereign accountability.
                  </p>
               </div>
            </section>
          </div>

          <section className="glass rounded-[40px] p-8 border border-white/5 bg-black/80 font-mono text-[11px] text-gray-500 h-56 overflow-y-auto custom-scrollbar shadow-inner">
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
               <span className="font-black text-cyan-500 uppercase tracking-widest animate-pulse">Telemetry Buffer</span>
               <span className="text-[9px] opacity-30">SECURE_STREAM_01</span>
            </div>
            {genLogs.length === 0 ? <p className="opacity-10 italic">Awaiting tactical initialization...</p> : genLogs.map((l, i) => <div key={i} className={i === genLogs.length - 1 ? "text-cyan-400 font-bold" : ""}>{l}</div>)}
            <div ref={logEndRef} />
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <section className="glass rounded-[60px] p-12 border border-white/10 flex flex-col h-full shadow-2xl relative overflow-hidden bg-gradient-to-br from-transparent to-red-600/5">
              <div className="mb-10">
                <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-500 mb-3">Weaponized Execution</h3>
                <div className="h-1 w-20 bg-red-600 shadow-[0_0_15px_#dc2626]"></div>
              </div>

              <div className="flex-1 space-y-8">
                 <select 
                   value={selectedScriptId} 
                   onChange={(e) => setSelectedScriptId(e.target.value)}
                   className="w-full bg-black border border-white/10 rounded-[24px] p-6 text-xs font-bold text-gray-300 outline-none focus:border-cyan-500 hover:bg-white/5 transition-all cursor-pointer"
                 >
                   <option value="">-- NO PAYLOAD --</option>
                   {scripts.map(s => <option key={s.id} value={s.id}>{s.refinedText.substring(0, 35)}...</option>)}
                 </select>
                 
                 {selectedScriptId ? (
                   <div className="p-8 bg-black/60 border border-white/5 rounded-[32px] text-[11px] leading-loose text-gray-400 italic font-serif shadow-inner">
                      "{scripts.find(s => s.id === selectedScriptId)?.refinedText}"
                   </div>
                 ) : (
                    <div className="p-16 border-2 border-dashed border-white/5 rounded-[32px] flex items-center justify-center opacity-10">
                       <p className="text-[11px] text-white font-black uppercase tracking-widest text-center">Awaiting intellectual upload</p>
                    </div>
                 )}
              </div>

              <button
                onClick={handleStartGeneration}
                disabled={isGenerating || !selectedScriptId || !sourceImage}
                className="mt-12 w-full py-12 bg-red-700 hover:bg-red-600 disabled:bg-gray-900 transition-all rounded-[50px] font-black text-white tracking-[0.7em] uppercase shadow-[0_0_80px_rgba(239,68,68,0.3)] group overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[2000ms]"></div>
                <span className="relative z-10 text-sm">{isGenerating ? 'PROCESSING_PAYLOAD...' : 'INITIALIZE MIRROR'}</span>
              </button>
           </section>
        </div>
      </div>
    </div>
  );
};

const VoiceSelector: React.FC<{ active: boolean; title: string; sub: string; onClick: () => void }> = ({ active, title, sub, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full p-6 rounded-[28px] border flex items-center justify-between transition-all duration-500 ${active ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 shadow-[inset_0_0_40px_rgba(34,211,238,0.1)] scale-[1.02]' : 'bg-black border-white/5 text-gray-600 hover:border-white/10'}`}
  >
    <div className="text-left">
      <p className="text-[14px] font-black uppercase tracking-widest">{title}</p>
      <p className="text-[10px] font-mono mt-1 opacity-40">{sub}</p>
    </div>
    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${active ? 'border-cyan-400 shadow-[0_0_15px_cyan]' : 'border-gray-800'}`}>
       {active && <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full"></div>}
    </div>
  </button>
);

export default Studio;