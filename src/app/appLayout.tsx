import Sidebar from "../features/git/components/Sidebar";
import { useActiveTab } from "../features/git/hooks/ActiveTabContext";
import { renderTab } from "../features/git/model/gitRenderTab";

function AppLayout() {
  const { activeTab, setActiveTab } = useActiveTab();

  return (
    <div className="app_layout">
        <Sidebar onClick={setActiveTab} />
        {renderTab(activeTab) /* main contents */}
    </div>
  );
}

export default AppLayout;