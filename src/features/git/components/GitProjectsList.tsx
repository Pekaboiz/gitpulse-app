import { Repository } from '../model/gitTypes'
import Button from './UI/Button';

type Props = {
  repositories: Repository[];
  onSelect: (repository: Repository) => void;
};

function GitProjectsList({repositories, onSelect} : Props) {
  if (repositories.length == 0) {
    return <p>No saved repos yet</p>
  }

  return (
    <div>
      <h2>Repositories</h2>

      {repositories.map((el) => (
        <div className="repo_item" key={el.path}>
          <div>
            <strong>{el.name}</strong>
            <p>{el.path}</p>
          </div>

          <Button onClick={() => onSelect(el)} label='Open'/>
        </div>
      ))}

    </div>
  )
}

export default GitProjectsList