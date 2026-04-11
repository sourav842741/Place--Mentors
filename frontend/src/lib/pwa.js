let deferredPrompt = null;
let isPWAInstalled = false;

// 🔥 Initialize PWA
export const initializePWA = () => {
  // Capture install event
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log("🔥 Install available");
  });

  // When app installed
  window.addEventListener("appinstalled", () => {
    isPWAInstalled = true;
    deferredPrompt = null;
    console.log("✅ PWA Installed Successfully");
  });
};

// ✅ Check if install available
export const canInstall = () => {
  return !!deferredPrompt && !isPWAInstalled;
};

// 🚀 Trigger install
export const installApp = async () => {
  if (!deferredPrompt) {
    console.log("❌ Install not available yet");
    return;
  }

  deferredPrompt.prompt();

  const choice = await deferredPrompt.userChoice;

  if (choice.outcome === "accepted") {
    console.log("✅ User installed the app");
    isPWAInstalled = true;
  } else {
    console.log("❌ User dismissed install");
  }

  deferredPrompt = null;
};

// ⚙️ Register Service Worker
export const registerSW = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      console.log("✅ SW Registered:", reg);
    } catch (error) {
      console.log("❌ SW Failed:", error);
    }
  }
};

