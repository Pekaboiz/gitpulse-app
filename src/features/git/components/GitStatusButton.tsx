type Props = {
  onClick: () => void;
};

export function GitStatusButton({ onClick }: Props) {
  return <button onClick={onClick}>Git Status</button>;
}