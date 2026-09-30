import React, { useState, useEffect } from 'react';
import { Play, Square, Save, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { Commit } from '../types';
import { formatDistanceToNow } from 'date-fns';

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

export default function Dashboard() {
  const { repositories, commits, addCommit, addRepository, deleteRepository } = useStore();
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [timerInterval, setTimerInterval] = useState<number | null>(null);

  const [showCommitModal, setShowCommitModal] = useState(false);
  const [repoId, setRepoId] = useState(repositories[0]?.id || '');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');

  const [showRepoModal, setShowRepoModal] = useState(false);
  const [newRepoName, setNewRepoName] = useState('');
  
  useEffect(() => {
    if (isRunning) {
      const id = window.setInterval(() => setElapsed(e => e + 1), 1000);
      setTimerInterval(id);
    } else {
      if (timerInterval) clearInterval(timerInterval);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [isRunning]);

  const toggleTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      setShowCommitModal(true);
    } else {
      setIsRunning(true);
    }
  };

  const handleCommit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoId || !topic) return;
    
    const commit: Commit = {
      id: crypto.randomUUID(),
      repoId,
      topic,
      description,
      duration: elapsed,
      timestamp: Date.now()
    };
    addCommit(commit);
    
    setElapsed(0);
    setTopic('');
    setDescription('');
    setShowCommitModal(false);
  };

  const handleCreateRepo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepoName) return;
    addRepository({
      id: crypto.randomUUID(),
      name: newRepoName,
      color: '#' + Math.floor(Math.random()*16777215).toString(16)
    });
    setNewRepoName('');
    setShowRepoModal(false);
  };

  const todayCommits = commits.filter(c => new Date(c.timestamp).toDateString() === new Date().toDateString());
  const todayTotal = todayCommits.reduce((acc, c) => acc + c.duration, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        
        {/* Timer Section */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="text-6xl font-mono text-white mb-8 tracking-wider z-10">
            {String(Math.floor(elapsed / 3600)).padStart(2, '0')}:
            {String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0')}:
            {String(elapsed % 60).padStart(2, '0')}
          </div>
          <button
            onClick={toggleTimer}
            className={`z-10 flex items-center space-x-2 px-8 py-3 rounded-full font-semibold transition-all ${
              isRunning 
                ? 'bg-[#da3633] hover:bg-[#b62324] text-white' 
                : 'bg-[#238636] hover:bg-[#2ea043] text-white'
            }`}
          >
            {isRunning ? <Square size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-1" />}
            <span>{isRunning ? 'Stop & Commit' : 'Start Working'}</span>
          </button>
          
          {isRunning && (
            <div className="absolute inset-0 border-t-2 border-[#238636] opacity-20 animate-pulse"></div>
          )}
        </div>

        {/* Recent Commits */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-white">Recent Activity</h2>
          <div className="space-y-4">
            {commits.slice().sort((a,b) => b.timestamp - a.timestamp).slice(0, 5).map(commit => {
              const repo = repositories.find(r => r.id === commit.repoId);
              return (
                <div key={commit.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#161b22] border border-[#30363d] rounded-md hover:bg-[#1c2128] transition-colors">
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <span className="text-[#58a6ff] font-medium text-sm">
                        {repo?.name || 'Unknown Repo'}
                      </span>
                      <span className="text-[#8b949e]">/</span>
                      <span className="font-semibold text-[#c9d1d9] text-base">{commit.topic}</span>
                    </div>
                    {commit.description && (
                      <p className="text-[#8b949e] text-sm mt-1">{commit.description}</p>
                    )}
                  </div>
                  <div className="flex sm:flex-col items-end justify-between mt-2 sm:mt-0">
                    <span className="text-sm font-medium text-[#c9d1d9] bg-[#30363d] px-2 py-1 rounded">
                      {formatDuration(commit.duration)}
                    </span>
                    <span className="text-xs text-[#8b949e] mt-2">
                      {formatDistanceToNow(commit.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                </div>
              );
            })}
            {commits.length === 0 && (
              <div className="text-center py-10 border border-dashed border-[#30363d] rounded-md text-[#8b949e]">
                No commits yet. Start the timer to log your first session!
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="space-y-6">
        {/* Stats */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
          <h3 className="text-sm font-semibold text-[#8b949e] mb-2 uppercase tracking-wide">Today</h3>
          <p className="text-3xl font-bold text-white">{formatDuration(todayTotal)}</p>
          <p className="text-sm text-[#8b949e] mt-1">{todayCommits.length} commits</p>
        </div>

        {/* Repositories */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Repositories</h3>
            <button 
              onClick={() => setShowRepoModal(true)}
              className="text-[#58a6ff] hover:text-[#79c0ff] flex items-center space-x-1 text-sm bg-[#1f2428] hover:bg-[#30363d] px-2 py-1 rounded-md transition-colors"
            >
              <Plus size={14} />
              <span>New</span>
            </button>
          </div>
          <ul className="space-y-2">
            {repositories.map(repo => (
              <li key={repo.id} className="flex items-center justify-between text-sm group">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: repo.color }}></span>
                  <span className="text-[#c9d1d9] font-medium">{repo.name}</span>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${repo.name}" and all its commits?`)) {
                      deleteRepository(repo.id);
                    }
                  }}
                  className="text-[#8b949e] hover:text-[#da3633] opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete Repository"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Commit Modal */}
      {showCommitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-1">Commit Work</h2>
            <p className="text-[#8b949e] text-sm mb-5">Time logged: {formatDuration(elapsed)}</p>
            <form onSubmit={handleCommit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#c9d1d9] mb-1">Repository</label>
                <select 
                  value={repoId}
                  onChange={e => setRepoId(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]"
                  required
                >
                  {repositories.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#c9d1d9] mb-1">Topic / Title</label>
                <input 
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g., Electrostatics chapter 1"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#c9d1d9] mb-1">Description (optional)</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Notes on what you accomplished..."
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] h-24 resize-none"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowCommitModal(false)}
                  className="px-4 py-2 text-sm font-medium text-[#c9d1d9] bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#238636] border border-[rgba(240,246,252,0.1)] hover:bg-[#2ea043] rounded-md transition-colors flex items-center space-x-1.5"
                >
                  <Save size={16} />
                  <span>Commit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Repo Modal */}
      {showRepoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-5">Create a new repository</h2>
            <form onSubmit={handleCreateRepo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#c9d1d9] mb-1">Repository Name</label>
                <input 
                  type="text"
                  value={newRepoName}
                  onChange={e => setNewRepoName(e.target.value)}
                  placeholder="e.g., JEE Advanced"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowRepoModal(false)}
                  className="px-4 py-2 text-sm font-medium text-[#c9d1d9] bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#238636] border border-[rgba(240,246,252,0.1)] hover:bg-[#2ea043] rounded-md transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
