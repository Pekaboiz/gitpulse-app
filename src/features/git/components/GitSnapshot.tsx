import Button from "../../../shared/components/UI/Button";

type Props = {
  onClick: () => void | Promise<void>;
};

function GitSnapshot({ onClick }: Props) {

  const handleCommit = async () => {
    await onClick();
  };

  return (
    <div>
      <Button onClick={handleCommit} label="Snapshot" />
    </div>
  );
}

export default GitSnapshot;