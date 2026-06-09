import { useActiveTab } from "../features/git/hooks/ActiveTabContext";
import { useActiveRepo } from "../features/git/hooks/ActiveRepository";
import { renderTab } from "../features/git/model/gitRenderTab";
import Sidebar from "../shared/components/UI/Sidebar";

function AppLayout() {
  const { activeTab, setActiveTab } = useActiveTab();
  const { activeRepo } = useActiveRepo();

  return (
    <div className="app_layout">
      <Sidebar onClick={setActiveTab} />
      <div className="app_workspace">
        <header className="app_topbar">
          <div className="topbar_repo">
            <span className="repo_path">
              {activeRepo?.path ? `~${activeRepo.path}` : "~/Dev/gitpulse-app"}
            </span>
            <span className="branch_pill">feature/snapshot-flow</span>
            <span className="local_pill">Local only</span>
          </div>
          <div className="topbar_status">
            <span className="status_dot" />
            <span>Last checked 18s ago</span>
            <button className="status_button" type="button">Git status</button>
          </div>
        </header>
        {renderTab(activeTab)}
      </div>
    </div>
  );
}

export default AppLayout;
