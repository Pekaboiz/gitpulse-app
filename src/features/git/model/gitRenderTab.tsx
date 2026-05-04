import Dashboard from "../../../pages/DashboardPage";
import { NotFound } from "../../../pages/not_found";
import ReposPage from "../../../pages/ReposPage";
import { Tab, TABS } from "./gitTypes";

export function renderTab(tab: Tab) {
    if (tab === TABS.DASHBOARD_PAGE) return <Dashboard />;
    if (tab === TABS.REPOS_PAGE) return <ReposPage/>;
    if (tab === TABS.HISTORY_PAGE) return <NotFound/>;
    if (tab === TABS.SETTING_PAGE) return <NotFound/>;

    return null;
  }