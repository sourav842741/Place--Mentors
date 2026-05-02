let deferredPrompt = null;
let isPWAInstalled = false;

// 🔥 Initialize PWA
export const initializePWA = (setShowInstall) => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();

    deferredPrompt = e;

    console.log('🔥 Install available');

    // 👉 UI ko bolo button show kare
    if (setShowInstall) setShowInstall(true);
  });

  window.addEventListener('appinstalled', () => {
    isPWAInstalled = true;
    deferredPrompt = null;

    console.log('✅ PWA Installed Successfully');

    if (setShowInstall) setShowInstall(false);
  });
};

// ✅ Check install availability
export const canInstall = () => {
  return !!deferredPrompt && !isPWAInstalled;
};

// 🚀 Trigger install
export const installApp = async () => {
  if (!deferredPrompt) {
    console.log('❌ Install not available yet');
    return;
  }

  deferredPrompt.prompt(); // 🔥 MAIN FIX

  const choice = await deferredPrompt.userChoice;

  if (choice.outcome === 'accepted') {
    console.log('✅ User installed the app');
    isPWAInstalled = true;
  } else {
    console.log('❌ User dismissed install');
  }

  deferredPrompt = null;
};

// ⚙️ Register SW
export const registerSW = async () => {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
      console.log('✅ SW Registered');
    } catch (error) {
      console.log('❌ SW Failed:', error);
    }
  }
};
