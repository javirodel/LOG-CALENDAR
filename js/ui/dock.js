(() => {
  window.App = window.App || {};
  window.App.Dock = {};

  const dockExportBtn = document.getElementById("dockExportBtn");
  const dockImportInput = document.getElementById("dockImportInput");
  const dockImportTriggerBtn = document.getElementById("dockImportTriggerBtn");
  const tabCalendar = document.getElementById("tabCalendar");
  const tabChecklist = document.getElementById("tabChecklist");
  const tabProfile = document.getElementById("tabProfile");

  if (tabCalendar) {
    tabCalendar.addEventListener("click", () => {
      if (App.Tracker && typeof App.Tracker.switchView === "function") {
        App.Tracker.switchView("calendar");
      }
    });
  }

  if (tabChecklist) {
    tabChecklist.addEventListener("click", () => {
      if (App.Tracker && typeof App.Tracker.switchView === "function") {
        App.Tracker.switchView("checklist");
      }
    });
  }

  if (tabProfile) {
    tabProfile.addEventListener("click", () => {
      if (App.Tracker && typeof App.Tracker.switchView === "function") {
        App.Tracker.switchView("profile");
      }
    });
  }

  if (dockExportBtn) {
    dockExportBtn.addEventListener("click", () => {
      App.Storage.exportData();
    });
  }

  if (dockImportTriggerBtn && dockImportInput) {
    dockImportTriggerBtn.addEventListener("click", () => {
      dockImportInput.click();
    });
  }

  if (dockImportInput) {
    dockImportInput.addEventListener("change", (e) => {
      App.Storage.importData(e);
    });
  }

  const darkModeToggleSettings = document.getElementById("darkModeToggleSettings");
  if (darkModeToggleSettings) {
    darkModeToggleSettings.checked = App.Storage.getDarkMode();
    darkModeToggleSettings.addEventListener("change", (e) => {
      const enabled = e.target.checked;
      if (App.Theme && typeof App.Theme.setTheme === "function") {
        App.Theme.setTheme(enabled ? "dark" : "light");
      } else {
        if (enabled) {
          document.documentElement.setAttribute("data-theme", "dark");
          App.Storage.setDarkMode(true);
        } else {
          document.documentElement.removeAttribute("data-theme");
          App.Storage.setDarkMode(false);
        }
        App.Settings.applyProfile();
      }
    });
  }

  // Iluminación exclusiva al pasar el ratón entre botones del dock (Calendario, Tracker, Perfil):
  // Al pasar el ratón sobre cualquier botón inactivo, los demás se apagan y solo brilla el señalado.
  const liquidGlassDock = document.querySelector(".liquid-glass-dock");
  const allDockTabs = document.querySelectorAll(".liquid-glass-dock .dock-tab");

  if (liquidGlassDock && allDockTabs.length) {
    allDockTabs.forEach((tab) => {
      tab.addEventListener("mouseenter", () => {
        allDockTabs.forEach(t => t.classList.remove("preview-active"));
        if (!tab.classList.contains("active")) {
          liquidGlassDock.classList.add("dock-previewing");
          tab.classList.add("preview-active");
        } else {
          liquidGlassDock.classList.remove("dock-previewing");
        }
      });

      tab.addEventListener("click", () => {
        allDockTabs.forEach(t => t.classList.remove("preview-active"));
        liquidGlassDock.classList.remove("dock-previewing");
      });
    });

    liquidGlassDock.addEventListener("mouseleave", () => {
      allDockTabs.forEach(t => t.classList.remove("preview-active"));
      liquidGlassDock.classList.remove("dock-previewing");
    });
  }

})();
