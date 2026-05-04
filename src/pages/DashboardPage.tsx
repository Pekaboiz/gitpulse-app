import { useActiveTab } from "../features/git/hooks/ActiveTabContext";
import { TABS } from "../features/git/model/gitTypes";

const Dashboard = () => {
  const {setActiveTab} = useActiveTab();

  return (
    <div>
      <div className="repo_container">
        <h1>Your active repositories: 5</h1>
        <div className="repo_item">my_repo_1</div>
        <div className="repo_item">my_repo_2</div>
        <div className="repo_item">my_repo_3</div>
        <button onClick={() => {setActiveTab(TABS.REPOS_PAGE)}}>show more..</button>
      </div>
    </div>
  )
}

export default Dashboard