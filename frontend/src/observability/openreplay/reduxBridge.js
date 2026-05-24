import { safeTrack } from "./events";
import { startCriticalReplay } from "./events";

function getActionType(action) {
  return action?.type;
}

export function createReplayMiddleware() {
  // Additive middleware; never breaks Redux.
  return () => (next) => (action) => {
    try {
      const type = getActionType(action);

      // Auth / resume critical async failures
      if (
        type === "resume/uploadResumeAndAnalyze/rejected" ||
        type === "payment/list/rejected" ||
        type === "user/logoutUser" ||
        type?.includes("/rejected")
      ) {
        // Keep payload minimal to avoid sensitive request data
        safeTrack("redux_async", {
          actionType: type,
          error: typeof action?.payload === "string" ? action.payload.slice(0, 120) : undefined,
        });
      }

      if (type === "resume/uploadResumeAndAnalyze/rejected") {
        startCriticalReplay("resume_analyzer_failed", { actionType: type });
      }
    } catch {
      // fail silently
    }

    return next(action);
  };
}
