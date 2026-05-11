import Button from "../../../shared/components/UI/Button";

type Props = {
  onClick: () => void;
};

export function GitStatusButton({ onClick }: Props) {
  return <Button onClick={onClick} label="Git Status"/>;
}