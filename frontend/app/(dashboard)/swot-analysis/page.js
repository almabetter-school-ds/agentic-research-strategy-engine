import SectionPage from "../../../components/SectionPage";
import { SWOTWorkspace } from "../../../components/dashboard/SidebarWorkspaces";

export default function Page() {
  return <SectionPage title="SWOT Analysis" description="Structure validated findings into strengths, weaknesses, opportunities, and threats."><SWOTWorkspace /></SectionPage>;
}
