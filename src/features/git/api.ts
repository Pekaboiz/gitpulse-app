import { invoke } from "@tauri-apps/api/core";
import { GitFileStatus, HistoryConfig, LoadingKey, RepositoriesConfig } from "./model/gitTypes";
import { useLoading } from "./hooks/LoaderStates";

export function useGitApi() {
  const { setLoading } = useLoading();

  async function withLoading<T>(
    key: LoadingKey,
    action: () => Promise<T>
  ): Promise<T> {
    setLoading(key, true);

    try {
      return await action();
    } finally {
      setLoading(key, false);
    }
  }

  async function getGitStatus(path: string): Promise<string> {
    return await withLoading("git.status", () =>
      invoke<string>("git_status", {
        repositoryPath: path,
      })
    );
  }

  async function getGitDiff(path: string, filePath: string): Promise<string>  {
    console.log("api.rs::path - ", path, " api.rs::filePath - ", filePath);

    return await withLoading("git.diff", () =>
      invoke<string>("git_diff", {
        repositoryPath: path,
        filePath: filePath,
      })
    );
  }

  async function getRepoConfig(): Promise<RepositoriesConfig> {
    return await withLoading("repos.load", () =>
      invoke<RepositoriesConfig>("get_repositories")
    );
  }

  async function verifyRepo(path: string): Promise<string> {
    return await withLoading("repos.verfy", () =>
      invoke<string>("verify_repository", {
        path,
      })
    );
  }

  async function gitSnapshot(path: string): Promise<string> {
    return await withLoading("git.snapshot", () =>
      invoke<string>("git_snapshot", {
        repositoryPath : path,
      })
    );
  }

  async function gitCommit(path: string, commitMessage : string, files : GitFileStatus[]): Promise<string> {
    return await withLoading("git.commit", () =>
      invoke("git_commit", {
        repositoryPath: path,
        message: commitMessage.trim(),
        files : files,
      })
    );
  }

  async function saveRepo(path: string): Promise<string> {
    return await withLoading("repos.save", () =>
      invoke<string>("save_repository", {
        repositoryPath: path,
      })
    );
  }

  async function isGitIgnored(
    repoPath: string,
    fileCfg: GitFileStatus
  ): Promise<boolean> {
    return await invoke<boolean>("is_git_ignored", {
      repositoryPath: repoPath,
      filePath: fileCfg.file,
    });
  }

  async function getHistory(): Promise<HistoryConfig> {
    return await invoke<HistoryConfig>("get_hist_cfg");
  }

  return {
    getGitStatus,
    gitSnapshot,
    getGitDiff,
    gitCommit,
    getRepoConfig,
    verifyRepo,
    saveRepo,
    isGitIgnored,
    getHistory,
  };
}