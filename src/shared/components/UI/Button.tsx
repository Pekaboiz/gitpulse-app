type Props = {
    onClick: () => void;
    label : string;
    disabled? : boolean;
}

function Button({onClick, label, disabled} : Props) {
  return (
    <button disabled={disabled} onClick={onClick}>{label}</button>
  )
}

export default Button