import Button from "../../../shared/components/UI/Button";

type Props = {
  onClick: () => void | Promise<void>;
};

function GitSnapshot({ onClick }: Props) {

  return (
    <div>
      <Button onClick={onClick} label="Snapshot" />
    </div>
  );
}

export default GitSnapshot;