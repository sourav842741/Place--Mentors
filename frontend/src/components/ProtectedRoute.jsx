import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import { safeTrack, startCriticalReplay } from "../observability/openreplay/events";

export default function ProtectedRoute() {
  const { user, loading } = useSelector((state) => state.user);

  const location = useLocation();

  if (loading) {
    return <div className="text-white p-10">Loading...</div>;
  }

  if (!user) {
    // Track redirect
    safeTrack("protected_redirect", {
      from: location.pathname,
      reason: "no_user",
    });

    // Redirect loop detection
    const loopKey = `redirect_loop:${location.pathname}`;

    const prev = Number(sessionStorage.getItem(loopKey) || "0");

    sessionStorage.setItem(loopKey, String(prev + 1));

    if (prev >= 1) {
      safeTrack("protected_redirect_loop", {
        from: location.pathname,
      });

      startCriticalReplay("protected_redirect_loop", {
        from: location.pathname,
      });
    }

    return <Navigate to="/login" />;
  }

  // Banned users cannot access protected routes
  if (user?.isBanned) {
    safeTrack("protected_redirect", {
      from: location.pathname,
      reason: "banned_user",
    });

    startCriticalReplay("protected_redirect_loop", {
      from: location.pathname,
      reason: "banned_user",
    });

    return <Navigate to="/login" />;
  }

  // Cleanup redirect loop state after successful auth
  try {
    sessionStorage.removeItem(`redirect_loop:${location.pathname}`);
  } catch {
    // fail silently
  }

  return <Outlet />;
}
