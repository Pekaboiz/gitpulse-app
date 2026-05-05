import React from 'react'

type Props = {
    onClick: () => void;
    label : string;
}

function Button({onClick, label} : Props) {
  return (
    <button onClick={onClick}>{label}</button>
  )
}

export default Button