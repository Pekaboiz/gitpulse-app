import { useState } from 'react'
import { parseGitStatus } from '../features/git/model/gitStatusParser';
import GitFileList from '../features/git/components/GitFileList';
import { GitFileStatus } from '../features/git/model/gitTypes';
import { getGitStatus } from '../features/git/api';
import { GitStatusButton } from '../features/git/components/GitStatusButton';
import Button from '../features/git/components/UI/Button';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from "@tauri-apps/api/core";

const ReposPage = () => {

  const [files, setFiles] = useState<GitFileStatus[]>([]);
  const [repoPath, setRepoPath] = useState<string>("");
  const [repoError, setRepoError] = useState<string>("");

  async function handleGitStatus() {
    if (!repoPath) {
      setRepoError("Сначала выбери Git-репозиторий");
      return;
    }

    try {
      const output = await getGitStatus(repoPath);
      const parsed = parseGitStatus(output);
      setFiles(parsed);
      setRepoError("");
    } catch (error) {
      setRepoError(String(error));
    }
  }

  const selectRepo = async () => {
    const path = await open({
      directory: true,
      multiple: false,
      title: "Выбери Git репозиторий",
    });
    
    if (typeof path !== "string") {
      return;
    }

    try {
      const verifiedPath = await invoke<string>("verify_repository", {
        path,
      });

      setRepoPath(verifiedPath);
      setRepoError("");
      setFiles([]);
    } catch (error) {
      setRepoPath("");
      setRepoError(String(error));
      setFiles([]);
    }
};

  return (
    <div>
      <h1>Git Pulse</h1>

      <Button onClick={selectRepo} label='Choose file'/>

      {repoPath.length > 0 &&
      <div className="repo_item">
        <p>Selected repo: {repoPath}</p>
        <GitStatusButton onClick={handleGitStatus}/>
        <GitFileList files={files}/>
      </div>
      }

      {repoError && (
        <p style={{ color: "red" }}>
          {repoError}
        </p>
      )}
    </div>
  )
}

export default ReposPage