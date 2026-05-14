import { HistoryConfig } from '../model/gitTypes'

type Props = {
    config? : HistoryConfig;
}

function HistoryContainer({config} : Props) {
  return (
    <div className="history_container">
        {
            config?.histConfig
                .sort((a,b) => {return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()})
                .map((el, index) => (
                <div className="history_item" key={index}>
                    <div className="status">{el.actionType}</div>
                    <div className="message">{el.message}</div>
                    <div className="repo_path">{el.repoPath}</div>
                    <div className="file_cnt">{el.fileCount}</div>
                </div>
            ))
        }
    </div>
  )
}

export default HistoryContainer