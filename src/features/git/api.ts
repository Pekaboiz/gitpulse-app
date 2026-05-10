import { invoke } from "@tauri-apps/api/core";
import { GitFileStatus, LoadingKey, RepositoriesConfig } from "./model/gitTypes";
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

  return {
    getGitStatus,
    getRepoConfig,
    verifyRepo,
    saveRepo,
    isGitIgnored,
  };
}