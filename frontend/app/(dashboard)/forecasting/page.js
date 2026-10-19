import SectionPage from "../../../components/SectionPage";
import { ForecastingWorkspace } from "../../../components/dashboard/SidebarWorkspaces";

export default function Page() {
  return <SectionPage title="Forecasting" description="Review trend direction and market signals produced by completed research workflows."><ForecastingWorkspace /></SectionPage>;
}
