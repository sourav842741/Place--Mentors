import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const { user, isAuth, loading } = useSelector((state) => state.user);

  if (loading) return <p>Loading...</p>;

  if (!isAuth) return <Navigate to="/" />;

  if (role && user.role !== role) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}