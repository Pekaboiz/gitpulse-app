import { useEffect, useState } from "react";
import { useGitApi } from "../../../features/git/api";
import { useActiveRepo } from "../../../features/git/hooks/ActiveRepository";
import { useActiveTab } from "../../../features/git/hooks/ActiveTabContext";
import { Repository, Tab, TABS } from "../../../features/git/model/gitTypes";

type Props = {
  onClick: (tab_name : Tab) => void;
};

function Sidebar({onClick} : Props) {
  const {activeTab} = useActiveTab();
  const {activeRepo, setActiveRepo} = useActiveRepo();
  const { getRepoConfig } = useGitApi();
  const [repositories, setRepositories] = useState<Repository[]>([]);

  useEffect(() => {
    const loadRepositories = async () => {
      try {
        const config = await getRepoConfig();
        const sortedRepos = config.repositories
          .filter((repo) => repo.updated_at)
          .sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at));

        setRepositories(sortedRepos);

        if (!activeRepo && sortedRepos[0]) {
          setActiveRepo(sortedRepos[0]);
        }
      } catch (error) {
        console.log(error);
      }
    };

    loadRepositories();
  }, []);

  const handleSelectRepository = (repository: Repository) => {
    setActiveRepo(repository);
    onClick(TABS.DASHBOARD_PAGE);
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand_mark" />
        <span>GITPulse</span>
      </div>

      <div className="repo_nav_header">
        <span>Repositories</span>
        <button className="icon_button" type="button" onClick={() => onClick(TABS.REPOS_PAGE)}>+</button>
      </div>

      <div className="repo_nav_list">
        {repositories.length === 0 ? (
          <div className="empty_repo">No saved repos yet</div>
        ) : repositories.slice(0, 5).map((repository, index) => {
          const isSelected = activeRepo?.path === repository.path;
          const clean = index % 3 === 1;
          const badge = clean ? "clean" : index === 0 ? "3 staged" : "modified";

          return (
            <button
              className={`repo_nav_item ${isSelected ? "selected" : ""}`}
              key={repository.path}
              type="button"
              onClick={() => handleSelectRepository(repository)}
            >
              <span className="repo_nav_title">
                <strong>{repository.name}</strong>
                <span className={`repo_badge ${clean ? "clean" : ""}`}>{clean ? "0" : index + 2}</span>
              </span>
              <span className="repo_nav_path">~{repository.path}</span>
              <span className="repo_nav_meta">{badge}</span>
            </button>
          );
        })}
      </div>

      <nav className="sidebar_footer">
        <button className={activeTab === TABS.DASHBOARD_PAGE ? "active" : ""} 
                onClick={() => onClick(TABS.DASHBOARD_PAGE)}>Dashboard</button>
        <button className={activeTab === TABS.HISTORY_PAGE ? "active" : ""} 
                onClick={() => onClick(TABS.HISTORY_PAGE)}>History</button>
        <button className={activeTab === TABS.SETTING_PAGE ? "active" : ""} 
                onClick={() => onClick(TABS.SETTING_PAGE)}>Settings</button>
        <span>GITPulse 0.4.0</span>
        <span className="local_pill">Local only</span>
      </nav>
    </aside>
  )
}

export default Sidebar
