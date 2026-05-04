import { GitFileStatus } from '../model/gitTypes';
import { formatStatus } from '../model/gitStatusParser';

type Props = {
  files: GitFileStatus[];
};

function GitFileList( {files} : Props ) {
  if (files.length === 0) {
    return <p>No changes</p>;
  }
  
  return (
    <ul>
        {files.map((file) => {
          const meta = formatStatus(file.status);
          return (
            <li key={`${file.status}-${file.file}`}>
              <span className={`status ${meta.className}`}>{meta.label}</span> ~{file.file}
            </li>)
      })}
    </ul>
  )
}

export default GitFileList