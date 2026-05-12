import { Repository } from '../model/gitTypes'
import Button from '../../../shared/components/UI/Button';

type Props = {
  repositories: Repository[];
  onSelect: (repository: Repository) => void;
  limit? : number;
};

function GitProjectsList({repositories, onSelect, limit} : Props) {
  if (repositories.length == 0) {
    return <p>No saved repos yet</p>
  }

  const visibleRepos = typeof limit === 'number' ? repositories.slice(0, limit) : repositories;

  return (
    <div>
      <h2>Repositories</h2>

      {visibleRepos.map((el) => (
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