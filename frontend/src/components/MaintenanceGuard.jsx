import { useSelector } from "react-redux";
import useSettings from "../hooks/useSettings";
import MaintenancePage from "../pages/MaintenancePage";

export default function MaintenanceGuard() {
  const { user, loading } = useSelector(
    (state) => state.user
  );

  const {
    data,
    isLoading,
    isFetching,
  } = useSettings();

  if (loading || isLoading || isFetching) {
    return null;
  }

  const active =
    data?.data?.maintenanceMode;

  if (
    active &&
    user?.role !== "admin"
  ) {
    return <MaintenancePage />;
  }

  return null;
}