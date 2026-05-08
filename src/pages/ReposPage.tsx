//test
import { useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";

import { getGitStatus } from "../features/git/api";
import { parseGitStatus } from "../features/git/model/gitStatusParser";
import { GitFileStatus, Repository, RepositoriesConfig } from "../features/git/model/gitTypes";

import GitFileList from "../features/git/components/GitFileList";
import GitCommit from "../features/git/components/GitCommit";
import { GitStatusButton } from "../features/git/components/GitStatusButton";
import Button from "../features/git/components/UI/Button";
import GitProjectsList from "../features/git/components/GitProjectsList";

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

const ReposPage = () => {
  const [files, setFiles] = useState<GitFileStatus[]>([]);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [repoPath, setRepoPath] = useState("");
  const [repoError, setRepoError] = useState("");
  const [repoCommitMsg, setRepoCommitMsg] = useState<string>("");

  useEffect(() => {
    loadRepositories();
  }, []);

  const hasRepository = Boolean(repoPath);

  const loadRepositories = async () => {
    try {
      const config = await invoke<RepositoriesConfig>("get_repositories");
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

      setFiles(parsedFiles);
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
      const verifiedPath = await invoke<string>("verify_repository", {
        path: selectedPath,
      });

      await invoke("save_repository", {
        repositoryPath: verifiedPath,
      });

      setRepoPath(verifiedPath);
      resetRepositoryData();
    } catch (error) {
      setRepoCommitMsg("");
      clearRepository(error);
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
      setRepoCommitMsg(await invoke("git_commit", {
        repositoryPath: repoPath,
        message: commitMessage.trim(),
        files : files,
      }));

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

          <GitCommit onClick={commitRepo}/>
          <GitStatusButton onClick={handleGitStatus} />
          {repoCommitMsg ? 
            (
              <p>
                {repoCommitMsg}
              </p>
            ) 
            : 
            <GitFileList files={files} />
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