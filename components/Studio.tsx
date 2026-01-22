import React, { useState, useRef, useEffect } from 'react';
import { VoiceEngine, Script, Project } from '../types';
import { synthesizeVoice } from '../services/gemini';
import { triggerMirrorEngine } from '../services/remoteBrain';

interface StudioProps {
  scripts: Script[];
  onStartProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  remoteBrainUrl: string;
  remoteBrainKey: string;
}

const Studio: React.FC<StudioProps> = ({ scripts, onStartProject, updateProject, remoteBrainUrl, remoteBrainKey }) => {
  const [selectedScriptId, setSelectedScriptId] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceEngine>(VoiceEngine.KOKORO);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genLogs, setGenLogs] = useState<string[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const logEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

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
      addLog("OPTICS_INIT: Camera active. Targeting Likeness.");
    } catch (err) {
      addLog("OPTICS_FAILURE: Access denied.");
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
        addLog("BIOMETRIC: Likeness captured.");
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setVoiceBlob(blob);
        addLog(`VOICE_CAPTURED: Biometric signature secured (${recordingTime}s).`);
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000);
      addLog("AUDIO_INIT: Microphone live. Analyzing Principal voice DNA...");
    } catch (err) {
      addLog("AUDIO_FAILURE: Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleStartGeneration = async () => {
    const script = scripts.find(s => s.id === selectedScriptId);
    
    // Validate prerequisites
    const needsRemote = selectedVoice !== VoiceEngine.GEMINI_TTS;
    if (!script || !sourceImage || (needsRemote && (!remoteBrainUrl || !voiceBlob))) {
      alert('CRITICAL FAILURE: Missing Biometric Data. Ensure Likeness (Photo) and Voice (Recording) are captured.');
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

      if (selectedVoice === VoiceEngine.GEMINI_TTS) {
        addLog("GEMINI_CORE: Synthesizing authority-grade audio stream...");
        finalAudioUrl = await synthesizeVoice(script.refinedText);
      } else {
        addLog(`UPLINK: Transmitting voice DNA to ${remoteBrainUrl}...`);
        
        // We must convert the voiceBlob back to base64 for triggerMirrorEngine if it expects a string,
        // but our updated service handles formData properly.
        const response = await triggerMirrorEngine(remoteBrainUrl, remoteBrainKey, {
          script: script.refinedText,
          image: sourceImage, // used for LivePortrait
          voice: selectedVoice
        });

        // RE-INTEGRATION: If triggerMirrorEngine expects the audio blob specifically
        // we'll tweak the call to pass the recorded voice sample.
        const formData = new FormData();
        formData.append('text', script.refinedText);
        formData.append('voice_sample', voiceBlob!);
        formData.append('speed', "1.0");

        const authResponse = await fetch(`${remoteBrainUrl.replace(/\/$/, '')}/clone_audio`, {
          method: 'POST',
          headers: { 'X-MIRROR-KEY': remoteBrainKey || 'MIRROR_DEFAULT_KEY_99' },
          body: formData
        });

        if (!authResponse.ok) throw new Error("REMOTE_NODE_REJECTION: Check API Key or Hardware status.");
        
        const audioBlob = await authResponse.blob();
        finalAudioUrl = URL.createObjectURL(audioBlob);
        addLog("SIGNAL_SYNC: Zero-Shot Cloning successful.");
        
        const previewAudio = new Audio(finalAudioUrl);
        previewAudio.play().catch(() => addLog("AUDIO: Playback restricted by environment."));
      }

      updateProject(projectId, { 
        status: 'completed', 
        videoUrl: sourceImage, 
        audioUrl: finalAudioUrl,
        log: [...genLogs, "> SUCCESS: Asset finalized."]
      });
      addLog("OPERATION_MIRROR: Content weaponized successfully.");
      
    } catch (error: any) {
      addLog(`FATAL_ERROR: ${error.message || 'Bridge collapse.'}`);
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
          <div className={`w-3 h-3 rounded-full ${remoteBrainUrl ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-200">
            Node: {remoteBrainUrl ? 'ACTIVE' : 'OFFLINE'}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Likeness Section */}
            <section className="glass rounded-[40px] p-8 border border-white/5 relative group bg-black/40 overflow-hidden">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Likeness Template</h3>
                  {cameraActive && <span className="text-[10px] text-red-500 font-bold animate-pulse">OPTICS_LIVE</span>}
               </div>
               
               <div className="relative aspect-square w-full rounded-3xl bg-black border border-white/10 flex items-center justify-center overflow-hidden">
                  {cameraActive ? (
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  ) : sourceImage ? (
                    <img src={sourceImage} className="w-full h-full object-cover" alt="Target" />
                  ) : (
                    <div className="text-center opacity-5">
                      <span className="text-9xl block">👤</span>
                    </div>
                  )}

                  <div className="absolute inset-x-8 bottom-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-500">
                    {!cameraActive ? (
                      <button onClick={startCamera} className="flex-1 bg-white text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Optics On</button>
                    ) : (
                      <button onClick={capturePhoto} className="flex-1 bg-cyan-500 text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Capture</button>
                    )}
                  </div>
               </div>
               <canvas ref={canvasRef} className="hidden" />
            </section>

            {/* Voice Section */}
            <section className="glass rounded-[40px] p-8 border border-white/5 space-y-4 bg-black/40 flex flex-col justify-between">
               <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Voice DNA Capture</h3>
                
                <div className="p-8 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center space-y-6 min-h-[200px] relative overflow-hidden">
                    {isRecording && (
                      <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>
                    )}
                    
                    {voiceBlob && !isRecording ? (
                      <div className="text-center space-y-2">
                        <span className="text-3xl">🎙️</span>
                        <p className="text-[10px] text-green-400 font-black uppercase">Sample Secured</p>
                      </div>
                    ) : (
                      <span className={`text-4xl ${isRecording ? 'animate-bounce text-red-500' : 'opacity-20'}`}>🎙️</span>
                    )}

                    <div className="text-center">
                       {isRecording ? (
                         <div className="space-y-1">
                           <p className="text-2xl font-mono text-white">00:{recordingTime.toString().padStart(2, '0')}</p>
                           <p className="text-[9px] text-gray-500 uppercase tracking-widest">Speak naturally for 10s</p>
                         </div>
                       ) : (
                         <button 
                           onClick={startRecording}
                           className="px-8 py-3 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-cyan-400 transition-colors"
                         >
                           {voiceBlob ? 'Record New Sample' : 'Start Capture'}
                         </button>
                       )}
                    </div>

                    {isRecording && (
                      <button onClick={stopRecording} className="mt-4 px-10 py-2 bg-red-600 rounded-full font-black text-[9px] uppercase tracking-[0.2em] animate-flicker">Terminate & Save</button>
                    )}
                </div>
               </div>

               <div className="pt-6 border-t border-white/5 space-y-3">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Backbone: {selectedVoice}</p>
                  <div className="flex gap-2">
                    {Object.values(VoiceEngine).map(v => (
                      <button 
                        key={v}
                        onClick={() => setSelectedVoice(v)}
                        className={`flex-1 py-2 rounded-xl text-[8px] font-black border uppercase tracking-widest transition-all ${selectedVoice === v ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'border-white/5 text-gray-600 hover:text-white'}`}
                      >
                        {v.split('-')[0]}
                      </button>
                    ))}
                  </div>
               </div>
            </section>
          </div>

          <section className="glass rounded-[40px] p-8 border border-white/5 bg-black/80 font-mono text-[11px] text-gray-500 h-48 overflow-y-auto custom-scrollbar">
            {genLogs.length === 0 ? <p className="opacity-10 italic">Awaiting tactical initialization...</p> : genLogs.map((l, i) => <div key={i}>{l}</div>)}
            <div ref={logEndRef} />
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <section className="glass rounded-[60px] p-12 border border-white/10 flex flex-col h-full shadow-2xl relative overflow-hidden bg-gradient-to-br from-transparent to-red-600/5">
              <div className="mb-10">
                <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-500 mb-3">Weaponized Execution</h3>
                <div className="h-1 w-20 bg-red-600"></div>
              </div>

              <div className="flex-1 space-y-8">
                 <select 
                   value={selectedScriptId} 
                   onChange={(e) => setSelectedScriptId(e.target.value)}
                   className="w-full bg-black border border-white/10 rounded-[24px] p-6 text-xs font-bold text-gray-300 outline-none"
                 >
                   <option value="">-- NO PAYLOAD --</option>
                   {scripts.map(s => <option key={s.id} value={s.id}>{s.refinedText.substring(0, 30)}...</option>)}
                 </select>
                 
                 <div className="p-8 bg-black/60 border border-white/5 rounded-[32px] text-[11px] text-gray-400 italic font-serif">
                    {selectedScriptId ? `"${scripts.find(s => s.id === selectedScriptId)?.refinedText}"` : "Awaiting intellectual upload..."}
                 </div>
              </div>

              <button
                onClick={handleStartGeneration}
                disabled={isGenerating || !selectedScriptId || !sourceImage || (!voiceBlob && selectedVoice !== VoiceEngine.GEMINI_TTS)}
                className="mt-12 w-full py-12 bg-red-700 hover:bg-red-600 disabled:bg-gray-900 transition-all rounded-[50px] font-black text-white tracking-[0.7em] uppercase shadow-2xl"
              >
                {isGenerating ? 'PROCESSING...' : 'INITIALIZE MIRROR'}
              </button>
           </section>
        </div>
      </div>
    </div>
  );
};

export default Studio;