import { useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import GitProjectsList from "../features/git/components/GitProjectsList";
import { useActiveTab } from "../features/git/hooks/ActiveTabContext";
import { TABS } from "../features/git/model/gitTypes";
import { Repository } from "../features/git/model/gitTypes";
import { useGitApi } from "../features/git/api";
import { useActiveRepo } from "../features/git/hooks/ActiveRepository";
import Button from "../shared/components/UI/Button";

const Dashboard = () => {
  const [_, setRepoPath] = useState("");
  const [repos, setRepos] = useState<Repository[]>([]);
  const {activeRepo, setActiveRepo} = useActiveRepo();
  const {setActiveTab} = useActiveTab();
  const { getRepoConfig, verifyRepo, saveRepo} = useGitApi();
  
  useEffect(() => {
      loadRepositories();``
    }, []);
  
  const loadRepositories = async () => {
    try {
      const configRaw = await getRepoConfig();

      const config = configRaw.repositories.filter((el) => el.updated_at).sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at));

      setRepos(config);
    } catch (error) {
      console.log(error);
    }
  };

  const selectRepo = async () => {
    const selectedPath = await open({
      directory: true,
      multiple: false,
      title: "Выбери Git-репозиторий",
    });

    if (typeof selectedPath !== "string") {
      return;
    }

    try {
      const verifiedPath = await verifyRepo(selectedPath);

      await saveRepo(verifiedPath);

      setRepoPath(verifiedPath);
      //resetRepositoryData();
      //await handleGitStatus(verifiedPath);
    } catch (error) {
      console.log(error)
    }
  };

  const selectSavedRepository = async (repo: Repository) => {
    if (repo.path != activeRepo?.path) {
      console.log(repo);
      setActiveRepo(repo);
    }
    setActiveTab(TABS.REPOS_PAGE);
  };
    
  return (
    <div>
      <div>
        <input
          id="git_input"
          className="git_input"
          value={activeRepo?.path ? `~${activeRepo.path}` : ""}
          placeholder="~/chosen_path"
          readOnly
        />

        <Button onClick={selectRepo} label="Choose repository" />
      </div>

      <div className="repo_container">
        <h1>Your active repositories: {repos.length}</h1>
        <GitProjectsList
          repositories={repos}
          onSelect={selectSavedRepository}
        />
      </div>
    </div>
  )
}

export default Dashboard