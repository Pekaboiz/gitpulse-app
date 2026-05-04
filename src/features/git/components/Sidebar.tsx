import { useActiveTab } from "../hooks/ActiveTabContext";
import { Tab, TABS } from "../model/gitTypes";

type Props = {
  onClick: (tab_name : Tab) => void;
};

function Sidebar({onClick} : Props) {
  const {activeTab} = useActiveTab();

  return (
    <div>
        <button className={activeTab === TABS.DASHBOARD_PAGE ? "active" : ""} 
                onClick={() => onClick(TABS.DASHBOARD_PAGE)}>Dashboard</button>
        <button className={activeTab === TABS.REPOS_PAGE ? "active" : ""} 
                onClick={() => onClick(TABS.REPOS_PAGE)}>Repositories</button>
        <button className={activeTab === TABS.HISTORY_PAGE ? "active" : ""} 
                onClick={() => onClick(TABS.HISTORY_PAGE)}>History</button>
        <button className={activeTab === TABS.SETTING_PAGE ? "active" : ""} 
                onClick={() => onClick(TABS.SETTING_PAGE)}>Settings</button>
    </div>
  )
}

export default Sidebar