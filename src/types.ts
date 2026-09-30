export interface Commit {
  id: string;
  repoId: string;
  topic: string;
  description?: string;
  duration: number; // in seconds
  timestamp: number; // ms timestamp when session ended
}

export interface Repository {
  id: string;
  name: string;
  color: string;
}
