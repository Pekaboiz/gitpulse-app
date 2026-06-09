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
    return <p className="empty_state">Working tree clean</p>;
  }
  
  return (
    <div className="file_table">
        {files.map((file) => {
          const meta = formatStatus(file.status);
          const additions = file.diff?.hunks.reduce((count, hunk) => (
            count + hunk.lines.filter((line) => line.type === "added").length
          ), 0) ?? 0;
          const removals = file.diff?.hunks.reduce((count, hunk) => (
            count + hunk.lines.filter((line) => line.type === "removed").length
          ), 0) ?? 0;

          return (
            <div
              className={`file_row ${file.checked ? "selected" : ""}`}
              onClick={() => onClick(file.file)}
              key={`${file.status}-${file.file}`}
            >
              <input
                type="checkbox"
                checked={file.checked}
                onClick={(event) => event.stopPropagation()}
                onChange={() => onToggle(file.file)}
              />
              <span className="file_name">{file.file}</span>
              <span className={`status ${meta.className}`}>{meta.label.toLowerCase()}</span>
              <span className="line_delta">+{additions} / -{removals}</span>
              {file.expanded && <div className="diff_info">{renderExpanded?.(file)}</div>}
            </div>)
      })}
    </div>
  )
}

export default GitFileList
