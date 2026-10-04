import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function AdminRoute() {
  const { user, loading } = useSelector((state) => state.user);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-text">
        <div className="text-lg font-medium text-text-muted animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Banned users blocked
  if (user?.isBanned) {
    return <Navigate to="/login" replace />;
  }

  // Only admin / super admin allowed
  const isAdminAccess = user?.role === "admin" || user?.role === "superadmin" || user?.isSuperAdmin;

  if (!isAdminAccess) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
