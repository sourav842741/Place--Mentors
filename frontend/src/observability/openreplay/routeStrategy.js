import { OPENREPLAY_CONFIG } from "./config";

function normalizeRoute(pathname) {
  if (!pathname) return "";
  return pathname.split("?")[0];
}

export function getReplayRouteKey(pathname) {
  const path = normalizeRoute(pathname);

  if (path === "/login") return "auth.login";
  if (path.startsWith("/verify-otp")) return "auth.verifyOtp";
  if (path.startsWith("/forgot-password")) return "auth.forgotPassword";
  if (path.startsWith("/reset-password")) return "auth.resetPassword";

  if (path.startsWith("/resume-analyzer")) return "resume.analyzer";
  if (path.startsWith("/resume-generator")) return "resume.generator";

  if (path.startsWith("/payments")) return "payments";
  if (path.startsWith("/doubts")) return "community.doubts";
  if (path.startsWith("/support")) return "support";

  if (path.startsWith("/admin/dashboard")) return "admin.dashboard";
  if (path.startsWith("/admin/users")) return "admin.users";
  if (path.startsWith("/admin/email-center")) return "admin.emailCenter";
  if (path.startsWith("/admin/maintenance-manager")) return "admin.maintenanceManager";
  if (path.startsWith("/admin/tickets")) return "admin.tickets";
  if (path.startsWith("/admin/payments")) return "admin.payments";

  if (path.startsWith("/")) return "app.other";

  return "unknown";
}

export function isReplayRouteAllowed(pathname) {
  try {
    const path = normalizeRoute(pathname);

    for (const allowed of OPENREPLAY_CONFIG.routing.replayRouteAllowList) {
      if (allowed.endsWith("/ticket")) {
        if (path.startsWith(allowed.replace("/ticket", ""))) return true;
        continue;
      }

      if (path === allowed) return true;
      if (allowed !== "/support" && allowed !== "/support/ticket" && path.startsWith(allowed + "/"))
        return true;
      if (allowed === "/support" && path.startsWith("/support")) return true;
    }

    return false;
  } catch {
    return false;
  }
}
