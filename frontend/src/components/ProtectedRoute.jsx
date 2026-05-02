import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute() {
  const { user, loading } = useSelector((state) => state.user);

  if (loading) {
    return <div className="text-white p-10">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Banned users cannot access protected routes
  if (user?.isBanned) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
}
