import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute() {
  const { user, loading } = useSelector((state) => state.user);

  if (loading) {
    return <div className="text-white p-10">Loading...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" />;
}
