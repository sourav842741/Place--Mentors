import "./sentry.js";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store.js";

import { getTracker } from "./observability/openreplay/openReplay";
import { attachRouteTracking } from "./observability/openreplay/routeTracking";

// OpenReplay tracker init (fail silently)
try {
  getTracker();
  attachRouteTracking();
} catch {
  // fail silently
}

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { initializePWA, registerSW } from "./lib/pwa.js";

initializePWA();

// 🔥 React Query setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // cache 2 min
      refetchOnWindowFocus: false,
    },
  },
});

// 🔥 TEMP ENABLE SW IN DEV
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    registerSW();
  });
}

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </QueryClientProvider>
);
