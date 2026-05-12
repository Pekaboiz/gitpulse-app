import Button from "../../../shared/components/UI/Button";

type Props = {
  onClick: () => void | Promise<void>;
  disabled? : boolean;
};

function GitSnapshot({ disabled, onClick }: Props) {

  return (
      <Button disabled={disabled} onClick={onClick} label="Snapshot" />
  );
}

export default GitSnapshot;