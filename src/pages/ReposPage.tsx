import { useState } from 'react'
import { parseGitStatus } from '../features/git/model/gitStatusParser';
import GitFileList from '../features/git/components/GitFileList';
import { GitFileStatus } from '../features/git/model/gitTypes';
import { getGitStatus } from '../features/git/api';
import { GitStatusButton } from '../features/git/components/GitStatusButton';

const ReposPage = () => {

  const [files, setFiles] = useState<GitFileStatus[]>([]);

  const repoPath = "/Users/kostapolin/Pet-Projects/GITPulse/gitpulse-app";

  async function handleGitStatus() {
    const output = await getGitStatus(repoPath);
    const parsed = parseGitStatus(output);
    setFiles(parsed);
  }


  return (
    <div>
      <h1>Git Pulse</h1>

      <GitStatusButton onClick={handleGitStatus}/>

      <GitFileList files={files}/>
    </div>
  )
}

export default ReposPage