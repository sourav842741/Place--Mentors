import { safeTrack } from "./events";
import { getReplayRouteKey } from "./routeStrategy";

let lastPath = null;

export function attachRouteTracking() {
  try {
    if (typeof window === "undefined") return;

    const handler = () => {
      const path = window.location.pathname;
      if (!path) return;
      if (path === lastPath) return;
      lastPath = path;

      safeTrack("route_change", {
        routePath: path,
        routeKey: getReplayRouteKey(path),
      });
    };

    window.addEventListener("popstate", handler);
  } catch {
    // fail silently
  }
}
