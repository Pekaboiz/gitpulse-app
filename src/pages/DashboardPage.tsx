import { useEffect, useState } from "react";
import GitProjectsList from "../features/git/components/GitProjectsList";
import { useActiveTab } from "../features/git/hooks/ActiveTabContext";
import { TABS } from "../features/git/model/gitTypes";
import { Repository } from "../features/git/model/gitTypes";
import { useGitApi } from "../features/git/api";
import { useActiveRepo } from "../features/git/hooks/ActiveRepository";

const Dashboard = () => {
  const {setActiveTab} = useActiveTab();
  const [repos, setRepos] = useState<Repository[]>([]);
  const {activeRepo, setActiveRepo} = useActiveRepo();
  const {getRepoConfig} = useGitApi();
  
  useEffect(() => {
      loadRepositories();
    }, []);

  const loadRepositories = async () => {
    try {
      const config = await getRepoConfig();
      setRepos(config.repositories);
    } catch (error) {
      console.log(error);
    }
  };

  const selectSavedRepository = async (repo: Repository) => {
    if (repo.path != activeRepo?.path) {
      setActiveRepo(repo);
    }
    setActiveTab(TABS.REPOS_PAGE);
  };
    
  return (
    <div>
      <div className="repo_container">
        <h1>Your active repositories: 5</h1>
        <GitProjectsList
          repositories={repos}
          onSelect={selectSavedRepository}
        />
      </div>
    </div>
  )
}

export default Dashboard