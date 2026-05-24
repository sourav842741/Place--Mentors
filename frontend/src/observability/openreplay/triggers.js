import { OPENREPLAY_CONFIG } from "./config";
import { isReplayRouteAllowed } from "./routeStrategy";
import { openReplayWindow, closeReplayWindow } from "./session";
import {
  safeStartReplayWindow,
  safeStopReplayWindow,
  getTracker,
  safeSetSessionMetadata,
} from "./openReplay";

export function startReplayOnStage({ stage, metadata = {}, routePath } = {}) {
  try {
    const pathname = routePath || (typeof window !== "undefined" ? window.location.pathname : "");
    if (!isReplayRouteAllowed(pathname)) {
      // degrade to only tracking
      return false;
    }

    if (!OPENREPLAY_CONFIG.replayTriggers.replayStages.has(stage)) {
      return false;
    }

    const didOpen = openReplayWindow({
      stage,
      route: pathname,
      metadata,
      startFn: () => {
        safeSetSessionMetadata({ stage, route: pathname, ...metadata });
        safeStartReplayWindow();
      },
      stopFn: () => {
        safeStopReplayWindow();
        safeSetSessionMetadata({ replayStopReason: stage });
      },
    });

    return didOpen;
  } catch {
    return false;
  }
}

export function stopReplayOnSuccess({ stage } = {}) {
  try {
    closeReplayWindow({ reason: "success" });
    safeStopReplayWindow();
    safeSetSessionMetadata({ replayStopReason: "success", stage });
    return true;
  } catch {
    return false;
  }
}

export function startReplayOnEvent({ eventName, stage, metadata = {}, routePath } = {}) {
  try {
    if (!OPENREPLAY_CONFIG.replayTriggers.criticalEvents.has(eventName)) {
      return false;
    }

    const stageToUse = stage || eventName;
    return startReplayOnStage({ stage: stageToUse, metadata, routePath });
  } catch {
    return false;
  }
}
