export type GitFileStatus = {
  status: string;
  file: string;
  checked: boolean;
  expanded: boolean;
  diff?: GitDiff;
};

export type GitDiff = {
  oldFile?: string;
  newFile?: string;
  hunks: GitDiffHunk[];
};

export type GitDiffHunk = {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  header?: string;
  lines: GitDiffLine[];
};

export type GitDiffLine = {
  type: "context" | "added" | "removed";
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
};

export const TABS = {
  DASHBOARD_PAGE: "/",
  REPOS_PAGE: "repositories",
  HISTORY_PAGE: "history",
  SETTING_PAGE: "settings",
  USER_PAGE: "user",
} as const;

export type Tab = typeof TABS[keyof typeof TABS];

export type ActiveTabContextValue = {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
};

export type ActiveRepositoryValue = {
  activeRepo: Repository | null;
  setActiveRepo: (repo: Repository) => void;
};

export type Repository = {
  path: string;
  name: string;
  updated_at: string;
};

export type RepositoriesConfig = {
  repositories: Repository[];
};

export type LoadingKey = "hist.load" | "repos.load" | "repos.save" | "repos.verfy" | "git.status" | "git.commit" | "git.snapshot" | "git.diff";

export type LoadingContextValue = {
    loading : Partial<Record<LoadingKey, boolean>>
    setLoading : (key : LoadingKey, value : boolean) => void;
    isLoading : (key : LoadingKey) => boolean;
    isAnyLoading : boolean;
}

// history

enum ActionType {
  Commit,
  Snapshot,
  StatusCheck,
}

type HistoryItem = {
  actionType  : ActionType;
  repoPath    : string;
  message     : string;
  fileCount   : number;
  createdAt   : Date;
}

export type HistoryConfig = {
  histConfig : HistoryItem[];
}