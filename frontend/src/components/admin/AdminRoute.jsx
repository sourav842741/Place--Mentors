import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function AdminRoute() {
  const { user, loading } = useSelector((state) => state.user);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

