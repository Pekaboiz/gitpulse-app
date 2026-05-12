import { useState } from "react";
import Button from "../../../shared/components/UI/Button";

type Props = {
  onClick: (commitMsg: string) => void | Promise<void>;
  disabled? : boolean;
};

function GitCommit({ disabled, onClick }: Props) {
  const [commitMsg, setCommitMsg] = useState("");

  const handleCommit = async () => {
    const message = commitMsg.trim();

    if (!message) {
      return;
    }

    await onClick(message);
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

      <Button disabled={disabled} onClick={handleCommit} label="Commit changes" />
    </div>
  );
}

export default GitCommit;