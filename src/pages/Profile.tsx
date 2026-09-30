import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { Commit } from '../types';

const HEATMAP_COLORS = [
  '#161b22', // 0 min
  '#0e4429', // 1-30 min
  '#006d32', // 30-90 min
  '#26a641', // 90-180 min
  '#39d353', // 180+ min
];

const getHeatmapColor = (durationSec: number) => {
  const min = durationSec / 60;
  if (min === 0) return HEATMAP_COLORS[0];
  if (min <= 30) return HEATMAP_COLORS[1];
  if (min <= 90) return HEATMAP_COLORS[2];
  if (min <= 180) return HEATMAP_COLORS[3];
  return HEATMAP_COLORS[4];
};

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

export default function Profile() {
  const { commits, repositories } = useStore();
  const [tooltip, setTooltip] = useState<{ x: number, y: number, text: React.ReactNode } | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const { heatmapData, totalYearCommits } = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364);

    const commitMap = new Map<string, { duration: number, count: number }>();
    commits.forEach(c => {
      if (c.timestamp >= startDate.getTime()) {
        const d = new Date(c.timestamp);
        d.setHours(0,0,0,0);
        const k = d.toDateString();
        const existing = commitMap.get(k) || { duration: 0, count: 0 };
        commitMap.set(k, { duration: existing.duration + c.duration, count: existing.count + 1 });
      }
    });

    const data = [];
    let cur = new Date(startDate);
    while (cur <= today) {
      const k = cur.toDateString();
      const stats = commitMap.get(k) || { duration: 0, count: 0 };
      data.push({
        date: new Date(cur),
        dateStr: k,
        duration: stats.duration,
        count: stats.count,
        color: getHeatmapColor(stats.duration)
      });
      cur.setDate(cur.getDate() + 1);
    }

    return { heatmapData: data, totalYearCommits: commits.length };
  }, [commits]);

  const weeks: typeof heatmapData[] = [];
  let currentWeek: typeof heatmapData = [];
  
  heatmapData.forEach((day, i) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || i === heatmapData.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const selectedDateCommits = useMemo(() => {
    if (!selectedDateStr) return [];
    return commits.filter(c => {
      const d = new Date(c.timestamp);
      d.setHours(0,0,0,0);
      return d.toDateString() === selectedDateStr;
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, [selectedDateStr, commits]);

  return (
    <div className="space-y-8 text-[#c9d1d9] relative">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-[#30363d] flex items-center justify-center text-2xl font-bold">
        🔥
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="text-[#8b949e]">If you're going through hell, keep going!</p>
        </div>
      </div>

      <div className="border border-[#30363d] rounded-lg p-6 bg-[#0d1117] relative">
        <h2 className="mb-4 text-sm font-medium">{totalYearCommits} contributions in the last year</h2>
        
        <div className="flex justify-center w-full overflow-x-auto pb-4">
          <div className="flex gap-[3px]" onMouseLeave={() => setTooltip(null)}>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day, di) => (
                  <div 
                    key={di}
                    className="w-[10px] h-[10px] rounded-[2px] transition-all hover:ring-1 ring-[#c9d1d9] cursor-pointer"
                    style={{ backgroundColor: day.color }}
                    onClick={() => {
                      if (day.count > 0) setSelectedDateStr(day.dateStr);
                    }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        x: rect.left + window.scrollX + 5,
                        y: rect.top + window.scrollY - 10,
                        text: (
                          <>
                            <span className="font-semibold">{day.count} contributions</span>
                            <span className="text-[#8b949e] ml-1">on {day.dateStr}</span>
                            <br/>
                            <span className="text-[#8b949e]">Total time: {formatDuration(day.duration)}</span>
                          </>
                        )
                      });
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-end mt-2 space-x-2 text-xs text-[#8b949e]">
          <span>Less</span>
          <div className="flex gap-1">
            {HEATMAP_COLORS.map(c => (
              <div key={c} className="w-[10px] h-[10px] rounded-[2px]" style={{ backgroundColor: c }}></div>
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      {tooltip && (
        <div 
          className="fixed pointer-events-none z-[100] transform -translate-x-1/2 -translate-y-full mb-2 p-2 text-xs bg-gray-900 text-white rounded whitespace-nowrap shadow-lg border border-[#30363d]"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-[#30363d]"></div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-[2px] border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}

      {selectedDateStr && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 w-full max-w-md shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-white">Activity on {selectedDateStr}</h2>
              <button 
                onClick={() => setSelectedDateStr(null)}
                className="text-[#8b949e] hover:text-[#c9d1d9]"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {selectedDateCommits.map(commit => {
                const repo = repositories.find(r => r.id === commit.repoId);
                return (
                  <div key={commit.id} className="p-4 bg-[#0d1117] border border-[#30363d] rounded-md">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: repo?.color || '#58a6ff' }}></span>
                      <span className="text-[#58a6ff] font-medium text-sm">
                        {repo?.name || 'Unknown Repo'}
                      </span>
                    </div>
                    <div className="font-semibold text-[#c9d1d9] text-base">{commit.topic}</div>
                    {commit.description && (
                      <p className="text-[#8b949e] text-sm mt-1">{commit.description}</p>
                    )}
                    <div className="text-xs text-[#8b949e] mt-2">
                      Duration: {formatDuration(commit.duration)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-white">Activity Overview</h2>
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
            <ul className="space-y-3">
              {repositories.map(repo => {
                const repoCommits = commits.filter(c => c.repoId === repo.id);
                const repoTime = repoCommits.reduce((acc, c) => acc + c.duration, 0);
                return (
                  <li key={repo.id} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: repo.color }}></span>
                      <span className="font-medium">{repo.name}</span>
                    </div>
                    <span className="text-[#8b949e] text-sm">{Math.floor(repoTime / 3600)}h {Math.floor((repoTime % 3600) / 60)}m</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-white">Contribution Activity</h2>
          <div className="space-y-4">
            {commits.slice().sort((a,b) => b.timestamp - a.timestamp).slice(0, 10).map(commit => {
              const repo = repositories.find(r => r.id === commit.repoId);
              return (
                <div key={commit.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#161b22] border border-[#30363d] rounded-md">
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <span className="text-[#58a6ff] font-medium text-sm">
                        {repo?.name || 'Unknown Repo'}
                      </span>
                      <span className="text-[#8b949e]">/</span>
                      <span className="font-semibold text-[#c9d1d9] text-base">{commit.topic}</span>
                    </div>
                    <span className="text-[#8b949e] text-xs mt-1">
                      {new Date(commit.timestamp).toDateString()} • {Math.floor(commit.duration / 60)} mins
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
