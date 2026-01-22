
import React, { useState, useEffect } from 'react';
import { View, VoiceEngine, Script, Project } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Refinery from './components/Refinery';
import Studio from './components/Studio';
import Settings from './components/Settings';
import Archive from './components/Archive';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [remoteBrainUrl, setRemoteBrainUrl] = useState<string>('');
  
  useEffect(() => {
    const savedScripts = localStorage.getItem('mirror_scripts');
    const savedProjects = localStorage.getItem('mirror_projects');
    const savedUrl = localStorage.getItem('mirror_remote_brain');
    
    if (savedScripts) setScripts(JSON.parse(savedScripts));
    if (savedProjects) setProjects(JSON.parse(savedProjects));
    if (savedUrl) setRemoteBrainUrl(savedUrl);
  }, []);

  useEffect(() => {
    localStorage.setItem('mirror_scripts', JSON.stringify(scripts));
  }, [scripts]);

  useEffect(() => {
    localStorage.setItem('mirror_projects', JSON.stringify(projects));
  }, [projects]);

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const deleteScript = (id: string) => {
    setScripts(prev => prev.filter(s => s.id !== id));
  };

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard projects={projects} stats={{ scripts: scripts.length }} />;
      case View.REFINERY:
        return <Refinery onSaveScript={(s) => setScripts([s, ...scripts])} />;
      case View.STUDIO:
        return <Studio 
          scripts={scripts} 
          onStartProject={(p) => setProjects([p, ...projects])}
          updateProject={updateProject}
          remoteBrainUrl={remoteBrainUrl}
        />;
      case View.ARCHIVE:
        return <Archive 
          projects={projects} 
          scripts={scripts}
          onDeleteProject={deleteProject}
          onDeleteScript={deleteScript}
        />;
      case View.SETTINGS:
        return <Settings 
          remoteBrainUrl={remoteBrainUrl} 
          onUpdateUrl={(url) => {
            setRemoteBrainUrl(url);
            localStorage.setItem('mirror_remote_brain', url);
          }} 
        />;
      default:
        return <Dashboard projects={projects} stats={{ scripts: scripts.length }} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-gray-100 selection:bg-cyan-500/30 overflow-hidden">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8 pt-20 md:pt-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          {renderView()}
        </div>
      </main>

      <div className="md:hidden fixed top-0 left-0 right-0 glass h-16 flex items-center px-4 justify-between z-50">
        <div className="flex items-center gap-2" onClick={() => setCurrentView(View.DASHBOARD)}>
          <div className="w-8 h-8 bg-cyan-600 rounded flex items-center justify-center font-bold text-black shadow-[0_0_10px_cyan]">M</div>
          <span className="font-bold tracking-tighter">MIRROR</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentView(View.REFINERY)} className="text-xl">🧪</button>
          <button onClick={() => setCurrentView(View.STUDIO)} className="text-xl">🎬</button>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${remoteBrainUrl ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
