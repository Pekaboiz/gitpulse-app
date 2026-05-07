import { useState } from "react";
import Button from "./UI/Button";

type Props = {
  onClick: (commitMsg: string) => void;
};

function GitCommit({ onClick }: Props) {
  const [commitMsg, setCommitMsg] = useState("");

  const handleCommit = () => {
    onClick(commitMsg);
    setCommitMsg("");
  };

  return (
    <div>
      <input
        value={commitMsg}
        onChange={(e) => setCommitMsg(e.target.value)}
        type="text"
        placeholder="commit message"
      />

      <Button onClick={handleCommit} label="Commit changes" />
    </div>
  );
}

export default GitCommit;