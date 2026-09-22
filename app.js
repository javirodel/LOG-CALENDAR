// Compatibility entry point for integrations that still reference app.js.
(() => {
  const core = document.createElement("script");
  core.src = "js/legacy/app-core.js";
  core.async = false;
  document.currentScript.after(core);
})();
