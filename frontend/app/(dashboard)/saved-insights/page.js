import SectionPage from "../../../components/SectionPage";
import { SavedInsightsWorkspace } from "../../../components/dashboard/SidebarWorkspaces";

export default function Page() {
  return <SectionPage title="Saved Insights" description="Access bookmarked and reusable findings from the research knowledge base."><SavedInsightsWorkspace /></SectionPage>;
}
