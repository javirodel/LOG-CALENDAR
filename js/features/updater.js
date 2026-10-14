(() => {
  window.App = window.App || {};
  window.App.Updater = window.App.Updater || {};

  function getLocalVersion() {
    return (window.App && window.App.Constants && window.App.Constants.APP_VERSION) || "4.0.3";
  }
  const GITHUB_RAW_VERSION_URL = "https://raw.githubusercontent.com/javirodel/LOG-CALENDAR/main/assets/version.json";
  const GITHUB_RELEASES_URL = "https://github.com/javirodel/LOG-CALENDAR/releases/latest";

  let deferredInstallPrompt = null;
  let hasCheckedThisSession = false;

  function isGitHubPages() {
    return typeof window !== "undefined" && window.location.hostname.endsWith("github.io");
  }

  function isStandalone() {
    return (
      (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      (typeof navigator !== "undefined" && navigator.standalone === true)
    );
  }

  function compareVersions(v1, v2) {
    const parts1 = String(v1).replace(/^v/i, "").split(".").map(n => parseInt(n, 10) || 0);
    const parts2 = String(v2).replace(/^v/i, "").split(".").map(n => parseInt(n, 10) || 0);
    const len = Math.max(parts1.length, parts2.length);
    for (let i = 0; i < len; i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }
    return 0;
  }

  async function checkForUpdates(isManual = false) {
    const isEn = App.I18n?.getCurrentLanguage() === "en";
    const checkBtn = document.getElementById("checkUpdatesBtn");
    if (checkBtn && isManual) {
      checkBtn.disabled = true;
      checkBtn.textContent = isEn ? "Checking..." : "Comprobando...";
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(`${GITHUB_RAW_VERSION_URL}?_t=${Date.now()}`, {
        signal: controller.signal,
        cache: "no-store"
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data && typeof data.version === "string") {
        const localVer = getLocalVersion();
        const isNewer = compareVersions(data.version, localVer) > 0;

        updateVersionBadgeUI(isNewer, data.version);

        if (isNewer) {
          if (!isGitHubPages() || isManual) {
            showUpdateModal(data);
          }
          return { hasUpdate: true, version: data.version, releaseUrl: data.releaseUrl };
        } else {
          if (isManual) {
            App.Utils?.showToast(isEn ? `You are on the latest version (v${localVer}).` : `Tienes la versión más reciente (v${localVer}).`);
          }
          return { hasUpdate: false, version: localVer };
        }
      }
    } catch (err) {
      // Passive check fails silently without throwing uncaught errors
      if (isManual) {
        App.Utils?.showToast(
          isEn
            ? "Could not verify updates (offline or server unreachable)."
            : "No se pudo comprobar actualizaciones (sin conexión o servidor inaccesible)."
        );
      }
      return null;
    } finally {
      if (checkBtn && isManual) {
        checkBtn.disabled = false;
        checkBtn.textContent = isEn ? "🔄 Check for updates" : "🔄 Comprobar actualizaciones";
      }
    }
  }

  function updateVersionBadgeUI(hasUpdate, remoteVersion) {
    const badge = document.getElementById("aboutVersionStatusBadge");
    const isEn = App.I18n?.getCurrentLanguage() === "en";

    if (badge) {
      if (hasUpdate) {
        badge.textContent = isEn ? `🚀 v${remoteVersion} Available` : `🚀 v${remoteVersion} Disponible`;
        badge.className = "version-status-badge badge-update-available";
      } else {
        badge.textContent = isEn ? "✓ Up to date" : "✓ Al día";
        badge.className = "version-status-badge badge-up-to-date";
      }
    }
  }

  function showUpdateModal(data) {
    const modal = document.getElementById("updateNotificationModal");
    if (!modal) return;

    const isEn = App.I18n?.getCurrentLanguage() === "en";
    const titleEl = document.getElementById("updateModalTitle");
    const summaryEl = document.getElementById("updateModalSummary");
    const downloadBtn = document.getElementById("updateModalDownloadBtn");

    const newVersion = data.version || "Nueva";
    const releaseUrl = data.releaseUrl || GITHUB_RELEASES_URL;
    const summary = data.changelogSummary || (isEn ? "New performance and stability improvements." : "Nuevas mejoras de rendimiento y estabilidad.");

    if (titleEl) {
      titleEl.textContent = isEn ? `🚀 New Version Available (v${newVersion})` : `🚀 Nueva versión disponible (v${newVersion})`;
    }
    if (summaryEl) {
      summaryEl.textContent = summary;
    }
    if (downloadBtn) {
      downloadBtn.onclick = () => {
        window.open(releaseUrl, "_blank", "noopener,noreferrer");
      };
    }

    modal.hidden = false;
  }

  function closeUpdateModal() {
    const modal = document.getElementById("updateNotificationModal");
    if (modal) modal.hidden = true;
  }

  // ==========================================
  // PWA INSTALLATION LOGIC
  // ==========================================

  function initPWA() {
    // 1. Register Service Worker on supported secure origins
    if (
      "serviceWorker" in navigator &&
      (window.location.protocol === "https:" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1")
    ) {
      navigator.serviceWorker
        .register("./service-worker.js")
        .then((reg) => {
          // Listen for worker updates
          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // New content is available
                  const isEn = App.I18n?.getCurrentLanguage() === "en";
                  App.Utils?.showToast(
                    isEn
                      ? "New update cached! Refresh to apply latest version."
                      : "¡Nueva actualización en caché! Recarga para aplicar la última versión."
                  );
                }
              };
            }
          };
        })
        .catch((err) => {
          console.warn("[PWA] Service Worker registration failed:", err);
        });
    }

    // 2. Listen to beforeinstallprompt
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      updateInstallUI();
    });

    // 3. Listen to appinstalled
    window.addEventListener("appinstalled", () => {
      deferredInstallPrompt = null;
      updateInstallUI();
      const isEn = App.I18n?.getCurrentLanguage() === "en";
      App.Utils?.showToast(
        isEn ? "✓ LOG Calendar successfully installed as Desktop App!" : "✓ ¡LOG Calendar instalado como aplicación de escritorio!"
      );
    });

    // 4. Update UI state on load
    updateInstallUI();
  }

  function updateInstallUI() {
    const installBtn = document.getElementById("pwaInstallBtn");
    const installedBadge = document.getElementById("pwaInstalledBadge");
    const isEn = App.I18n?.getCurrentLanguage() === "en";

    if (isStandalone()) {
      if (installBtn) installBtn.style.display = "none";
      if (installedBadge) {
        installedBadge.style.display = "inline-flex";
        installedBadge.textContent = isEn ? "✓ Running as Desktop App" : "✓ Modo aplicación de escritorio activo";
      }
    } else if (deferredInstallPrompt) {
      if (installBtn) {
        installBtn.style.display = "inline-flex";
        installBtn.textContent = isEn ? "📲 Install as Desktop App" : "📲 Instalar como aplicación de escritorio";
      }
      if (installedBadge) installedBadge.style.display = "none";
    } else {
      // Not standalone and prompt not fired yet (or unsupported protocol like file://)
      if (installBtn) {
        if (window.location.protocol === "file:") {
          installBtn.style.display = "none";
        } else {
          installBtn.style.display = "none";
        }
      }
      if (installedBadge) installedBadge.style.display = "none";
    }
  }

  async function promptInstall() {
    if (!deferredInstallPrompt) {
      const isEn = App.I18n?.getCurrentLanguage() === "en";
      alert(
        isEn
          ? "To install, open this app in Chrome, Edge, or Safari over HTTPS (e.g. GitHub Pages) and click the browser install icon."
          : "Para instalar como aplicación, abre la app en Chrome, Edge o Safari mediante HTTPS (ej. GitHub Pages) y pulsa el icono de instalar del navegador."
      );
      return;
    }

    try {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === "accepted") {
        deferredInstallPrompt = null;
        updateInstallUI();
      }
    } catch (err) {
      console.warn("PWA install error:", err);
    }
  }

  function init() {
    initPWA();

    // Check updates once after initial load (delayed to never block rendering)
    if (!hasCheckedThisSession) {
      hasCheckedThisSession = true;
      setTimeout(() => {
        checkForUpdates(false);
      }, 2500);
    }

    // Modal close listeners
    const closeBtn = document.getElementById("updateModalCloseBtn");
    const backdrop = document.getElementById("updateModalBackdrop");
    const laterBtn = document.getElementById("updateModalLaterBtn");
    if (closeBtn) closeBtn.addEventListener("click", closeUpdateModal);
    if (backdrop) backdrop.addEventListener("click", closeUpdateModal);
    if (laterBtn) laterBtn.addEventListener("click", closeUpdateModal);

    // Settings manual check button
    const checkBtn = document.getElementById("checkUpdatesBtn");
    if (checkBtn) {
      checkBtn.addEventListener("click", () => checkForUpdates(true));
    }

    // Settings install button
    const installBtn = document.getElementById("pwaInstallBtn");
    if (installBtn) {
      installBtn.addEventListener("click", promptInstall);
    }
  }

  Object.defineProperties(window.App.Updater, {
    LOCAL_VERSION: { get: () => getLocalVersion(), enumerable: true },
    checkForUpdates: { get: () => checkForUpdates, set: (v) => checkForUpdates = v, enumerable: true },
    showUpdateModal: { get: () => showUpdateModal, set: (v) => showUpdateModal = v, enumerable: true },
    closeUpdateModal: { get: () => closeUpdateModal, set: (v) => closeUpdateModal = v, enumerable: true },
    promptInstall: { get: () => promptInstall, set: (v) => promptInstall = v, enumerable: true },
    isStandalone: { get: () => isStandalone, enumerable: true },
    isGitHubPages: { get: () => isGitHubPages, enumerable: true }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
