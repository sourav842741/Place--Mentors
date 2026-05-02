import { useSelector } from "react-redux";
import useSettings from "../hooks/useSettings";
import MaintenancePage from "../pages/MaintenancePage";

export default function MaintenanceGuard() {
  const { user, loading } = useSelector((state) => state.user);
  const { data, isLoading, isFetching } = useSettings();

  /* REAL-TIME MAINTENANCE STATE */
  const maintenanceRealtime = useSelector((state) => state.maintenance);

  if (loading || isLoading || isFetching) {
    return null;
  }

  // Combine: real-time socket state takes priority, fallback to API data
  const active =
    maintenanceRealtime?.maintenanceMode !== null
      ? maintenanceRealtime.maintenanceMode
      : data?.data?.maintenanceMode;

  if (active && user?.role !== "admin" && user?.role !== "superadmin") {
    return <MaintenancePage />;
  }

  return null;
}
