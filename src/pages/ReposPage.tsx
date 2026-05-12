import { useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { parseGitStatus } from "../features/git/model/gitStatusParser";
import { GitFileStatus, Repository } from "../features/git/model/gitTypes";
import GitFileList from "../features/git/components/GitFileList";
import GitCommit from "../features/git/components/GitCommit";
import Button from "../shared/components/UI/Button";
import GitProjectsList from "../features/git/components/GitProjectsList";
import GitSnapshot from "../features/git/components/GitSnapshot";
import { useLoading } from "../features/git/hooks/LoaderStates";
import { useGitApi } from "../features/git/api";

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

const ReposPage = () => {
  const [files, setFiles] = useState<GitFileStatus[]>([]);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [repoPath, setRepoPath] = useState("");
  const [repoError, setRepoError] = useState("");
  const [repoCommitMsg, setRepoCommitMsg] = useState<string>("");
  const {isAnyLoading, isLoading} = useLoading();
  const { getGitStatus, gitSnapshot, getRepoConfig, gitCommit, isGitIgnored, verifyRepo, saveRepo} = useGitApi();

  useEffect(() => {
    loadRepositories();
  }, []);

  const hasRepository = Boolean(repoPath);
  const isCommitDisabled =
    !hasRepository ||
    isLoading("git.commit");

  const isSnapshotDisabled =
    !hasRepository ||
    isLoading("git.snapshot");

  const isStatusDisabled =
    !hasRepository ||
    isLoading("git.status");

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

  const selectSavedRepository = (repository: Repository) => {
    setRepoPath(repository.path);
    resetRepositoryData();
  };

  const resetRepositoryData = () => {
    setFiles([]);
    setRepoError("")
    setRepoCommitMsg("");
  };

  const clearRepository = (error: unknown) => {
    setRepoPath("");
    setFiles([]);
    setRepoCommitMsg("");
    setRepoError(getErrorMessage(error));
  };

  const handleGitStatus = async () => {
    if (!repoPath) {
      setRepoError("Сначала выбери Git-репозиторий");
      return;
    }

    try {
      const output = await getGitStatus(repoPath);
      const parsedFiles = parseGitStatus(output);

      const visibleFiles = [];
      for (const file of parsedFiles) {
        const ignored = await isGitIgnored(repoPath, file);

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

  const selectRepo = async () => {
    const selectedPath = await open({
      directory: true,
      multiple: false,
      title: "Выбери Git-репозиторий",
    });

    if (typeof selectedPath !== "string") {
      return;
    }

    try {
      const verifiedPath = await verifyRepo(selectedPath);

      await saveRepo(verifiedPath);

      setRepoPath(verifiedPath);
      resetRepositoryData();
    } catch (error) {
      setRepoCommitMsg("");
      clearRepository(error);
    }
  };

  const commitSnapshot = async () => {
    if (!repoPath) {
      setRepoError("Сначала выбери Git-репозиторий");
      return;
    }

    try {
      setRepoCommitMsg(await gitSnapshot(repoPath));

      setRepoError("");
      await handleGitStatus();
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

      setRepoError("");
      await handleGitStatus();
    } catch (error) {
      setRepoCommitMsg("");
      setRepoError(getErrorMessage(error));
    }
  };

  return (
    <div>
      <h1>Git Pulse</h1>
      {isAnyLoading && <p>loading</p>}
      <div>
        <input
          id="git_input"
          className="git_input"
          value={repoPath ? `~${repoPath}` : ""}
          placeholder="~/chosen_path"
          readOnly
        />

        <Button onClick={selectRepo} label="Choose repository" />
      </div>

      <GitProjectsList
        repositories={repos}
        onSelect={selectSavedRepository}
      />

      {hasRepository && (
        <div className="repo_item">
          <p>Actions</p>

          <GitSnapshot  onClick={commitSnapshot}/>
          <GitCommit onClick={commitRepo}/>
          <Button disabled={isStatusDisabled} onClick={handleGitStatus} label="Git Status"/>
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
      )}

      {repoError && (
        <p style={{ color: "red" }}>
          {repoError}
        </p>
      )}
    </div>
  );
};

export default ReposPage;