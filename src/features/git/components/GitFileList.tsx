import { GitFileStatus } from '../model/gitTypes';
import { formatStatus } from '../model/gitStatusParser';

type Props = {
  files: GitFileStatus[];
  onToggle : (fileName : string) => void;
  onClick : (fileName : string) => void;
  renderExpanded?: (file: GitFileStatus) => React.ReactNode;
};

function GitFileList( {files, renderExpanded, onToggle, onClick} : Props ) {
  if (files.length === 0) {
    return <p>Working tree clean</p>;
  }
  
  return (
    <ul>
        {files.map((file) => {
          
          const meta = formatStatus(file.status);
          return (
            <li onClick={() => onClick(file.file)} key={`${file.status}-${file.file}`}>
              <input
                type="checkbox"
                checked={file.checked}
                onClick={(event) => event.stopPropagation()}
                onChange={() => onToggle(file.file)}
              />
              <span className={`status ${meta.className}`}>{meta.label}</span> ~{file.file}
              {file.expanded && renderExpanded?.(file)}
            </li>)
      })}
    </ul>
  )
}

export default GitFileList