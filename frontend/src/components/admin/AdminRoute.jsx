import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AlertTriangle } from 'lucide-react';

export default function AdminRoute() {
  const { user, loading } = useSelector((state) => state.user);
  const navigate = useNavigate();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-lg font-medium text-gray-700 dark:text-gray-200 animate-pulse">
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
  const isAdminAccess = user?.role === 'admin' || user?.role === 'superadmin' || user?.isSuperAdmin;

  if (!isAdminAccess) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      {/* 2FA Warning Banner */}
      {user?.twoFactorWarning && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2.5 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm font-medium text-center">
            <AlertTriangle className="w-4 h-4 shrink-0" />

            <span>
              Enable 2FA recommended for privileged accounts.{' '}
              <button
                type="button"
                onClick={() => navigate('/admin/security')}
                className="underline font-bold hover:text-amber-100 transition"
              >
                Set up now →
              </button>
            </span>
          </div>
        </div>
      )}

      {/* Route Content */}
      <div className={user?.twoFactorWarning ? 'pt-10' : ''}>
        <Outlet />
      </div>
    </>
  );
}
