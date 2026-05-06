import React, { useState } from 'react'
import Button from './UI/Button';

function GitCommit() {
  const [commitMsg, setCommitMsg] = useState<string>("");

  return (
    <div>
        <input onChange={(e) => {setCommitMsg(e.target.value)}} 
                type="text" placeholder='commit message'/>
        <Button onClick={() => {}} label='Commit changes'/>
    </div>
  )
}

export default GitCommit