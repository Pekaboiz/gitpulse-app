import { GitFileStatus } from '../model/gitTypes';
import { formatStatus } from '../model/gitStatusParser';

type Props = {
  files: GitFileStatus[];
  onToggle : (file_name : string) => void;
};

function GitFileList( {files, onToggle} : Props ) {
  if (files.length === 0) {
    return <p>Working tree clean</p>;
  }
  
  return (
    <ul>
        {files.map((file) => {
          
          const meta = formatStatus(file.status);
          return (
            <li key={`${file.status}-${file.file}`}>
              <input
                type="checkbox"
                checked={file.checked}
                onChange={() => onToggle(file.file)}
              />
              <span className={`status ${meta.className}`}>{meta.label}</span> ~{file.file}
            </li>)
      })}
    </ul>
  )
}

export default GitFileList