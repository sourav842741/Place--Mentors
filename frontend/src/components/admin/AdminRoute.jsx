import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminRoute() {
  const { user, loading } = useSelector((state) => state.user);
  const navigate = useNavigate();

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

  if (user.role !== "admin" && user.role !== "superadmin" && !user.isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      {/* 2FA Warning Banner — soft enforcement */}
      {user.twoFactorWarning && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2.5 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm font-medium">
            <AlertTriangle className="w-4 h-4" />
            <span>
              Enable 2FA recommended for privileged accounts.{" "}
              <button
                onClick={() => navigate("/admin/security")}
                className="underline font-bold hover:text-amber-100 transition"
              >
                Set up now →
              </button>
            </span>
          </div>
        </div>
      )}
      <div className={user.twoFactorWarning ? "pt-10" : ""}>
        <Outlet />
      </div>
    </>
  );
}

