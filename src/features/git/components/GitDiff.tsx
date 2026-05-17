import { GitDiff } from '../model/gitTypes';

type Props = {
    diffChild : GitDiff;
}

function GitDiffContainer({diffChild} : Props) {
  return (
    <div>
        <h3>{diffChild.newFile}</h3>
        <h3>{diffChild.oldFile}</h3>
    </div>
  )
}

export default GitDiffContainer