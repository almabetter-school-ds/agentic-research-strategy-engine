import SectionPage from "../../../components/SectionPage";
import { PortersWorkspace } from "../../../components/dashboard/SidebarWorkspaces";

export default function Page() {
  return <SectionPage title="Porter's Five Forces" description="Assess industry rivalry, supplier power, buyer power, substitutes, and entry threat."><PortersWorkspace /></SectionPage>;
}
