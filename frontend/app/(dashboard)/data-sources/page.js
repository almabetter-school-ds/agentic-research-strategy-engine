import SectionPage from "../../../components/SectionPage";
import { DataSourcesWorkspace } from "../../../components/dashboard/SidebarWorkspaces";

export default function Page() {
  return <SectionPage title="Data Sources" description="Configure research providers and data-source connectivity."><DataSourcesWorkspace /></SectionPage>;
}
