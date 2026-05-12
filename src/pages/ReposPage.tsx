import { useEffect, useState } from "react";
import { parseGitStatus } from "../features/git/model/gitStatusParser";
import { GitFileStatus, Repository } from "../features/git/model/gitTypes";
import GitFileList from "../features/git/components/GitFileList";
import GitCommit from "../features/git/components/GitCommit";
import GitSnapshot from "../features/git/components/GitSnapshot";
import { useLoading } from "../features/git/hooks/LoaderStates";
import { useGitApi } from "../features/git/api";
import { useActiveRepo } from "../features/git/hooks/ActiveRepository";

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

const ReposPage = () => {
  const [files, setFiles] = useState<GitFileStatus[]>([]);
  const [_, setRepos] = useState<Repository[]>([]);
  const [repoPath, setRepoPath] = useState("");
  const [repoError, setRepoError] = useState("");
  const [repoCommitMsg, setRepoCommitMsg] = useState<string>("");
  const {isAnyLoading, isLoading} = useLoading();
  const {activeRepo} = useActiveRepo();
  const { getGitStatus, gitSnapshot, getRepoConfig, gitCommit, isGitIgnored, saveRepo} = useGitApi();

  useEffect(() => {
    loadRepositories();
  }, [files]);

  useEffect(() => {
    if (repoPath.length == 0) {
      if (activeRepo) {
        saveRepo(activeRepo.path)
        setRepoPath(activeRepo.path);
        handleGitStatus(activeRepo.path);
        resetRepositoryData();
      }
    }
  }, [activeRepo]);

  const hasRepository = Boolean(repoPath);
  
  const isCommitDisabled =
    !hasRepository ||
    isLoading("git.commit");

  const isSnapshotDisabled =
    !hasRepository ||
    isLoading("git.snapshot");

  // const isStatusDisabled =
  //   !hasRepository ||
  //   isLoading("git.status");

  const toggleFile = (fileName : string) => {
    setFiles((currentFiles) => 
      currentFiles.map((file) => 
        file.file === fileName 
    ? {...file, checked: !file.checked} 
    : file))
  }

  const loadRepositories = async () => {
    try {
      const config = await getRepoConfig();
      setRepos(config.repositories);
    } catch (error) {
      setRepoError(getErrorMessage(error));
    }
  };

  const resetRepositoryData = () => {
    setFiles([]);
    setRepoError("")
    setRepoCommitMsg("");
  };

  const handleGitStatus = async (path = repoPath) => {
    if (!path) {
      setRepoError("Сначала выбери Git-репозиторий");
      return;
    }

    try {
      const output = await getGitStatus(path);
      const parsedFiles = parseGitStatus(output);

      const visibleFiles: GitFileStatus[] = [];

      for (const file of parsedFiles) {
        const ignored = await isGitIgnored(path, file);

        if (!ignored) {
          visibleFiles.push(file);
        }
      }

      setFiles(visibleFiles);
      setRepoError("");
    } catch (error) {
      setRepoCommitMsg("");
      setRepoError(getErrorMessage(error));
    }
  };
  
  const commitSnapshot = async () => {
    if (!repoPath) {
      setRepoError("Сначала выбери Git-репозиторий");
      return;
    }

    try {
      setRepoCommitMsg(await gitSnapshot(repoPath));
      setRepoPath(repoPath);
      setRepoError("");
      //await handleGitStatus(repoPath);
    } catch (error) {
      setRepoCommitMsg("");
      setRepoError(getErrorMessage(error));
    }
  };

  const commitRepo = async (commitMessage: string) => {
    if (!repoPath) {
      setRepoError("Сначала выбери Git-репозиторий");
      return;
    }

    if (!commitMessage.trim()) {
      setRepoError("Введите commit message");
      return;
    }

    try {
      setRepoCommitMsg(await gitCommit(repoPath, commitMessage, files));
      setRepoPath(repoPath);
      setRepoError("");
      //await handleGitStatus(repoPath);
    } catch (error) {
      setRepoCommitMsg("");
      setRepoError(getErrorMessage(error));
    }
  };

  return (
    <div>
      <h1>Git Pulse</h1>
      {isAnyLoading && <p>loading</p>}
      <div className="repo_item">
        <p>Actions</p>

        <GitSnapshot disabled={isSnapshotDisabled} onClick={commitSnapshot}/>
        <GitCommit disabled={isCommitDisabled} onClick={commitRepo}/>
        {repoCommitMsg ? 
          (
            <p>
              {repoCommitMsg}
            </p>
          ) 
          : 
          <GitFileList onToggle={toggleFile} files={files} />
        }
        
      </div>

      {repoError && (
        <p style={{ color: "red" }}>
          {repoError}
        </p>
      )}
    </div>
  );
};

export default ReposPage;