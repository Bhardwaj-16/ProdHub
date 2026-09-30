import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Commit, Repository } from './types';

interface AppState {
  repositories: Repository[];
  commits: Commit[];
  addRepository: (repo: Repository) => void;
  deleteRepository: (id: string) => void;
  addCommit: (commit: Commit) => void;
  deleteCommit: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      repositories: [
        { id: '1', name: 'Physics', color: '#f9826c' },
        { id: '2', name: 'Mathematics', color: '#2b7489' },
      ],
      commits: [],
      addRepository: (repo) =>
        set((state) => ({ repositories: [...state.repositories, repo] })),
      deleteRepository: (id) =>
        set((state) => ({
          repositories: state.repositories.filter((r) => r.id !== id),
          commits: state.commits.filter((c) => c.repoId !== id),
        })),
      addCommit: (commit) =>
        set((state) => ({ commits: [...state.commits, commit] })),
      deleteCommit: (id) =>
        set((state) => ({
          commits: state.commits.filter((c) => c.id !== id),
        })),
    }),
    {
      name: 'productivity-hub-storage',
    }
  )
);
