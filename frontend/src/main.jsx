import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store.js";

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
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </QueryClientProvider>
  </StrictMode>
);
