import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store.js";
import { initializePWA, registerSW } from "./lib/pwa.js";

initializePWA();

// 🔥 TEMP ENABLE SW IN DEV
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    registerSW();
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);