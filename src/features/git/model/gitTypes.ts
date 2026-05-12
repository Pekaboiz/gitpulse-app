export type GitFileStatus = {
    status : string,
    file : string,
    checked : boolean,
}

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

};

export type RepositoriesConfig = {
  repositories: Repository[];
};

export type LoadingKey = "repos.load" | "repos.save" | "repos.verfy" | "git.status" | "git.commit" | "git.snapshot";

export type LoadingContextValue = {
    loading : Partial<Record<LoadingKey, boolean>>
    setLoading : (key : LoadingKey, value : boolean) => void;
    isLoading : (key : LoadingKey) => boolean;
    isAnyLoading : boolean;
}