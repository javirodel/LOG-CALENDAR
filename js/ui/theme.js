(() => {
  window.App = window.App || {};
  window.App.Theme = window.App.Theme || {};

  let systemMediaQueryAttached = false;

  function getSystemResolvedTheme() {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  function resolveEffectiveTheme(themeName) {
    if (themeName === "system") {
      return getSystemResolvedTheme();
    }
    const validThemes = ["light", "dark", "oled", "sepia"];
    return validThemes.includes(themeName) ? themeName : "light";
  }

  function getCurrentTheme() {
    return document.documentElement.getAttribute("data-theme") || (App.State?.state?.settings?.theme || "light");
  }

  function triggerThemeRerender() {
    if (App.Settings && typeof App.Settings.applyProfile === "function") {
      App.Settings.applyProfile();
    }
    if (App.Calendar && typeof App.Calendar.renderCalendar === "function") {
      App.Calendar.renderCalendar();
    }
    if (App.Stats && typeof App.Stats.renderStats === "function") {
      App.Stats.renderStats();
    }
    if (App.Tracker && typeof App.Tracker.renderRoutineTracker === "function") {
      App.Tracker.renderRoutineTracker();
    }
    if (App.Insights && typeof App.Insights.renderInsightsDashboard === "function") {
      App.Insights.renderInsightsDashboard();
    }
  }

  const THEME_META_COLORS = {
    light: "#f7f8fb",
    dark: "#111116",
    oled: "#000000",
    sepia: "#f5ecd7"
  };

  function updateThemeMetaColor(effectiveTheme) {
    const metaTag = document.querySelector('meta[name="theme-color"]');
    if (metaTag) {
      metaTag.setAttribute("content", THEME_META_COLORS[effectiveTheme] || "#f7f8fb");
    }
  }

  function ensureSystemListener() {
    if (systemMediaQueryAttached || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      if (App.State?.state?.settings?.theme === "system") {
        const resolved = e.matches ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", resolved);
        document.documentElement.setAttribute("data-theme-mode", "system");
        App.Storage.setDarkMode(e.matches);
        syncThemeControls("system");
        updateThemeMetaColor(resolved);
        triggerThemeRerender();
      }
    };
    if (mq.addEventListener) {
      mq.addEventListener("change", handler);
    } else if (mq.addListener) {
      mq.addListener(handler);
    }
    systemMediaQueryAttached = true;
  }

  function setTheme(themeName) {
    const validThemes = ["system", "light", "dark", "oled", "sepia"];
    const target = validThemes.includes(themeName) ? themeName : "light";

    ensureSystemListener();

    if (App.State?.state?.settings) {
      App.State.state.settings.theme = target;
    }

    const effective = resolveEffectiveTheme(target);
    document.documentElement.setAttribute("data-theme", effective);
    if (target === "system") {
      document.documentElement.setAttribute("data-theme-mode", "system");
    } else {
      document.documentElement.removeAttribute("data-theme-mode");
    }

    const isDarkLike = effective === "dark" || effective === "oled";
    App.Storage.setDarkMode(isDarkLike);
    syncThemeControls(target);
    updateThemeMetaColor(effective);

    triggerThemeRerender();
  }

  function toggleDarkMode(enabled) {
    if (typeof enabled === "boolean") {
      setTheme(enabled ? "dark" : "light");
    } else {
      const current = getCurrentTheme();
      setTheme((current === "dark" || current === "oled") ? "light" : "dark");
    }
  }

  function syncThemeControls(theme) {
    const effective = resolveEffectiveTheme(theme);
    const isDarkLike = effective === "dark" || effective === "oled";
    const popoverToggle = document.getElementById("darkModeTogglePopover");
    const settingsToggle = document.getElementById("darkModeToggleSettings");
    const themeSelect = document.getElementById("appThemeSelect");

    if (popoverToggle) popoverToggle.checked = isDarkLike;
    if (settingsToggle) settingsToggle.checked = isDarkLike;
    if (themeSelect && themeSelect.value !== theme) {
      themeSelect.value = theme;
    }
  }

  function initDarkMode() {
    ensureSystemListener();

    const savedTheme = App.State?.state?.settings?.theme;
    const isDarkStored = App.Storage.getDarkMode();

    let initialTheme = "system";
    if (savedTheme && ["system", "light", "dark", "oled", "sepia"].includes(savedTheme)) {
      initialTheme = savedTheme;
    } else if (isDarkStored !== null && isDarkStored !== undefined) {
      initialTheme = isDarkStored ? "dark" : "light";
    }

    setTheme(initialTheme);

    const popoverToggle = document.getElementById("darkModeTogglePopover");
    const settingsToggle = document.getElementById("darkModeToggleSettings");
    const themeSelect = document.getElementById("appThemeSelect");

    if (popoverToggle) {
      popoverToggle.addEventListener("change", (e) => toggleDarkMode(e.target.checked));
    }
    if (settingsToggle) {
      settingsToggle.addEventListener("change", (e) => toggleDarkMode(e.target.checked));
    }
    if (themeSelect) {
      themeSelect.addEventListener("change", (e) => setTheme(e.target.value));
    }
  }

  Object.defineProperties(window.App.Theme, {
    getCurrentTheme: { get: () => getCurrentTheme, enumerable: true },
    setTheme: { get: () => setTheme, set: (v) => setTheme = v, enumerable: true },
    toggleDarkMode: { get: () => toggleDarkMode, set: (v) => toggleDarkMode = v, enumerable: true },
    syncDarkModeToggles: { get: () => syncThemeControls, set: (v) => syncThemeControls = v, enumerable: true },
    initDarkMode: { get: () => initDarkMode, set: (v) => initDarkMode = v, enumerable: true }
  });
})();
