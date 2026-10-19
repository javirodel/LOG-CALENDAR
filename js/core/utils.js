(() => {
  window.App = window.App || {};
  window.App.Utils = window.App.Utils || {};


function getTodayYearMonth() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function formatRelativeTime(ts) {
  if (!ts) return "";
  const now = Date.now();
  const isEn = App.I18n?.getCurrentLanguage ? App.I18n.getCurrentLanguage() === "en" : false;
  const diffSec = Math.max(0, Math.floor((now - ts) / 1000));
  if (diffSec < 20) return isEn ? "just now" : "hace un momento";
  if (diffSec < 60) return isEn ? `${diffSec}s ago` : `hace ${diffSec} s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin === 1) return isEn ? "1m ago" : "hace 1 min";
  if (diffMin < 60) return isEn ? `${diffMin}m ago` : `hace ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours === 1) return isEn ? "1h ago" : "hace 1 h";
  if (diffHours < 6) return isEn ? `${diffHours}h ago` : `hace ${diffHours} h`;

  const d = new Date(ts);
  const nowDate = new Date(now);
  const isToday = d.toDateString() === nowDate.toDateString();
  const timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

  if (isToday) {
    return isEn ? `today at ${timeStr}` : `hoy a las ${timeStr}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(nowDate.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if (isYesterday) {
    return isEn ? `yesterday at ${timeStr}` : `ayer a las ${timeStr}`;
  }

  const locale = App.I18n?.getLocale ? App.I18n.getLocale() : "es-ES";
  const dayMonth = d.toLocaleDateString(locale, { day: "numeric", month: "short" });
  return isEn ? `${dayMonth} at ${timeStr}` : `${dayMonth} a las ${timeStr}`;
}

function normalizeSearchText(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getTodayDateKey() {
  return toDateKey(new Date());
}

function getTimeEntryMode() {
  return App.State.state.settings.timeEntryMode === "hours-minutes" ? "hours-minutes" : "decimal";
}

function getTimeInputType() {
  return getTimeEntryMode() === "hours-minutes" || getTimeAdditionsEnabled() ? "text" : "number";
}

function getTimeInputAttributes() {
  return getTimeEntryMode() === "hours-minutes"
    ? 'inputmode="numeric" pattern=".*" title="Usa 0:40 +:45 o +:45 para sumar tiempo"'
    : 'inputmode="decimal" pattern=".*" title="Usa 0.67 +0.75 o +0.75 para sumar tiempo"';
}

function getTimeInputPlaceholder() {
  return getTimeAdditionsEnabled()
    ? (getTimeEntryMode() === "hours-minutes" ? "0:00 o +0:45" : "0 o +0.75")
    : (getTimeEntryMode() === "hours-minutes" ? "0:00" : "0");
}

function parseTimeInput(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return 0;
  if (getTimeEntryMode() !== "hours-minutes") return normalizeHours(raw);

  const match = raw.match(/^(\d{1,2})\s*:\s*(\d{0,2})$/);
  if (match) {
    const hours = Number(match[1]);
    const minutes = Number(match[2] || 0);
    if (minutes < 60) return Math.min(24, Math.round((hours + minutes / 60) * 60) / 60);
    return 0;
  }
  return normalizeHours(raw);
}

function getTimeAdditionsEnabled() {
  return App.State.state?.settings?.timeAdditionsEnabled !== false;
}

function parseTimeAddition(value) {
  const raw = String(value ?? "").trim();
  if (!getTimeAdditionsEnabled() || !raw.startsWith("+")) return null;
  let incrementRaw = raw.slice(1).trim();
  if (getTimeEntryMode() === "hours-minutes" && incrementRaw.startsWith(":")) {
    incrementRaw = `0${incrementRaw}`;
  }
  const increment = parseTimeInput(incrementRaw);
  return incrementRaw && increment > 0 ? increment : null;
}

function parseTimeExpression(value, currentParts = []) {
  const raw = String(value ?? "").trim();
  if (!raw) return [];
  if (!getTimeAdditionsEnabled() && raw.includes("+")) return [];

  const additionOnly = parseTimeAddition(raw);
  if (additionOnly !== null) return [...currentParts, additionOnly];

  const tokens = raw.split("+").map((token) => token.trim()).filter(Boolean);
  if (tokens.length === 0) return [];
  if (tokens.length === 1) {
    const total = parseTimeInput(tokens[0]);
    return total > 0 ? [total] : [];
  }

  const parts = tokens.map((token) => {
    const normalizedToken = getTimeEntryMode() === "hours-minutes" && token.startsWith(":")
      ? `0${token}`
      : token;
    return parseTimeInput(normalizedToken);
  });
  return parts.every((part) => part > 0) ? parts : [];
}

function formatTimeBreakdown(values) {
  return values
    .map((value) => getTimeEntryMode() === "hours-minutes" ? formatTimeInput(value) : formatNumber(value))
    .filter((value) => Number(value) > 0 || value !== "0")
    .join(" + ");
}

function getTimeEntryParts(day, collection, key) {
  const entries = day?.[collection]?.[key];
  if (Array.isArray(entries)) {
    return entries.map(Number).filter((value) => Number.isFinite(value) && value > 0);
  }
  const total = Number(day?.[collection === "subjectTimeEntries" ? "subjects" : "extra"]?.[key]) || 0;
  return total > 0 ? [total] : [];
}

function setTimeEntryParts(day, collection, key, values) {
  if (!day[collection] || typeof day[collection] !== "object") day[collection] = {};
  const normalized = values.map((value) => {
    if (getTimeEntryMode() === "hours-minutes") {
      return Math.min(24, Math.round((Number(value) || 0) * 60) / 60);
    }
    return normalizeHours(value);
  }).filter((value) => value > 0);
  if (normalized.length > 1) day[collection][key] = normalized;
  else delete day[collection][key];
}

function updateTimeInputDisplay(input, values) {
  if (!input) return;
  const total = values.reduce((sum, value) => sum + (Number(value) || 0), 0);
  input.value = total ? formatTimeInput(total) : "";
  const wrapper = input.closest(".time-entry-control");
  if (!wrapper) return;
  const breakdown = values.length > 1 ? formatTimeBreakdown(values) : "";
  wrapper.dataset.breakdown = breakdown;
  wrapper.classList.toggle("has-breakdown", Boolean(breakdown));
  const breakdownEl = wrapper.querySelector(".time-entry-breakdown");
  if (breakdownEl) breakdownEl.textContent = breakdown;
}

function formatTimeInput(hours) {
  if (getTimeEntryMode() !== "hours-minutes") return String(hours);
  const totalMinutes = Math.round((Number(hours) || 0) * 60);
  return `${Math.floor(totalMinutes / 60)}:${String(totalMinutes % 60).padStart(2, "0")}`;
}

function formatTime(hours) {
  if (getTimeEntryMode() !== "hours-minutes") return `${formatNumber(hours)} h`;
  const totalMinutes = Math.round((Number(hours) || 0) * 60);
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes ? `${wholeHours} h ${minutes} min` : `${wholeHours} h`;
}

function formatShortTime(hours) {
  if (getTimeEntryMode() !== "hours-minutes") return `${formatNumber(hours)} h`;
  const totalMinutes = Math.round((Number(hours) || 0) * 60);
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!minutes) return `${wholeHours}h`;
  if (!wholeHours) return `${minutes}'`;
  return `${wholeHours}h ${minutes}'`;
}

function parseKey(key) {
  if (!key || typeof key !== "string") {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  const parts = key.split("-").map(Number);
  const y = Number.isFinite(parts[0]) ? parts[0] : 2026;
  const m = Number.isFinite(parts[1]) ? parts[1] - 1 : 0;
  const d = Number.isFinite(parts[2]) ? parts[2] : 1;
  return new Date(y, m, d);
}

function toDateKey(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateLong(key) {
  if (!key) return "—";
  const locale = App.I18n?.getLocale ? App.I18n.getLocale() : "es-ES";
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(parseKey(key));
}

function formatShortDate(key) {
  if (!key) return "—";
  const locale = App.I18n?.getLocale ? App.I18n.getLocale() : "es-ES";
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(parseKey(key));
}

function formatWeekday(key) {
  if (!key) return "—";
  const locale = App.I18n?.getLocale ? App.I18n.getLocale() : "es-ES";
  return new Intl.DateTimeFormat(locale, { weekday: "long" }).format(parseKey(key));
}

function formatNumber(number) {
  const locale = App.I18n?.getLocale ? App.I18n.getLocale() : "es-ES";
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(Number(number) || 0);
}

function isValidDateKey(key) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(key))) return false;
  const date = parseKey(key);
  return toDateKey(date) === key;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function addYears(date, amount) {
  return new Date(date.getFullYear() + amount, date.getMonth(), date.getDate());
}

function getMonthLabel(date) {
  const locale = App.I18n?.getLocale ? App.I18n.getLocale() : "es-ES";
  const month = new Intl.DateTimeFormat(locale, { month: "long" }).format(date);
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${date.getFullYear()}`;
}

function normalizeColor(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value)) ? String(value) : "#0f766e";
}

function hexToSoftBackground(hex) {
  const normalized = normalizeColor(hex).slice(1);
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  return `rgba(${r}, ${g}, ${b}, ${isDark ? 0.18 : 0.1})`;
}

function mixColor(hex, targetHex, targetRatio) {
  const a = hexToRgb(normalizeColor(hex));
  const b = hexToRgb(normalizeColor(targetHex));
  const mix = (x, y) => Math.round(x * (1 - targetRatio) + y * targetRatio);
  return rgbToHex(mix(a.r, b.r), mix(a.g, b.g), mix(a.b, b.b));
}

function darkenColor(hex, ratio) {
  return mixColor(hex, "#000000", ratio);
}

function lightenColor(hex, ratio) {
  return mixColor(hex, "#ffffff", ratio);
}

function isDarkMode() {
  return document.documentElement.getAttribute("data-theme") === "dark";
}

// Returns a color readable on the current theme background
function readableColor(hex) {
  if (!isDarkMode()) return hex;
  return lightenColor(hex, 0.4);
}

function needsLightText(colorStr) {
  if (!colorStr) return isDarkMode();
  const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
  const isDarkTheme = currentTheme === "dark" || currentTheme === "oled";

  const rgbaMatch = String(colorStr).match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\)/);
  if (rgbaMatch) {
    const r = Number(rgbaMatch[1]);
    const g = Number(rgbaMatch[2]);
    const b = Number(rgbaMatch[3]);
    const a = rgbaMatch[4] !== undefined ? Number(rgbaMatch[4]) : 1;
    const bgLum = isDarkTheme ? 0.05 : 0.95;
    const fgLum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const effectiveLum = fgLum * a + bgLum * (1 - a);
    return effectiveLum < 0.48;
  }

  const { r, g, b } = hexToRgb(normalizeColor(colorStr));
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.48;
}

function hexToRgb(hex) {
  const normalized = normalizeColor(hex).slice(1);
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16)
  };
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function getShortLabel(label) {
  const words = String(label).trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return words.map((word) => word[0]).join("").slice(0, 3).toUpperCase();
  return String(label).slice(0, 3).toUpperCase();
}

function createUniqueKey(base, existingKeys) {
  let key = base;
  let counter = 2;
  while (existingKeys.includes(key)) {
    key = `${base}-${counter}`;
    counter += 1;
  }
  return key;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function slugifyCategory(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function showToast(message) {
  App.Constants.toastEl.textContent = message;
  App.Constants.toastEl.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => App.Constants.toastEl.classList.remove("show"), 2200);
}

function resetAllData() {
  if (confirm(App.I18n?.text(
    "Se borrarán todas las asignaturas, notas y eventos guardados hasta el momento. Se pondrá todo a cero.\n\nSe recomienda exportar una copia de seguridad antes.\n\n¿Estás seguro de que quieres continuar?",
    "All saved subjects, notes, and events will be cleared. Everything will be reset.\n\nExporting a backup first is recommended.\n\nAre you sure you want to continue?"
  ))) {
    App.Storage.clearState();
    location.reload();
  }
}

  function normalizeHours(value) {
  const n = Number.parseFloat(String(value).replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(24, Math.round(n * 4) / 4);
}

function normalizeIntensityLevels(values) {
  const normalized = values.map((value) => normalizeHours(value)).filter((value) => value > 0);
  while (normalized.length < 4) normalized.push(App.Constants.DEFAULT_PROFILE.intensityLevels[normalized.length]);
  return normalized.slice(0, 4).sort((a, b) => a - b);
}

  Object.defineProperties(window.App.Utils, {
    normalizeHours: { get: () => normalizeHours, enumerable: true },
    normalizeIntensityLevels: { get: () => normalizeIntensityLevels, enumerable: true },
    getTodayYearMonth: { get: () => getTodayYearMonth, set: (v) => getTodayYearMonth = v, enumerable: true },
    formatRelativeTime: { get: () => formatRelativeTime, set: (v) => formatRelativeTime = v, enumerable: true },
    normalizeSearchText: { get: () => normalizeSearchText, set: (v) => normalizeSearchText = v, enumerable: true },
    getTodayDateKey: { get: () => getTodayDateKey, set: (v) => getTodayDateKey = v, enumerable: true },
    getTimeEntryMode: { get: () => getTimeEntryMode, set: (v) => getTimeEntryMode = v, enumerable: true },
    getTimeInputType: { get: () => getTimeInputType, set: (v) => getTimeInputType = v, enumerable: true },
    getTimeInputAttributes: { get: () => getTimeInputAttributes, set: (v) => getTimeInputAttributes = v, enumerable: true },
    getTimeInputPlaceholder: { get: () => getTimeInputPlaceholder, set: (v) => getTimeInputPlaceholder = v, enumerable: true },
    parseTimeInput: { get: () => parseTimeInput, set: (v) => parseTimeInput = v, enumerable: true },
    getTimeAdditionsEnabled: { get: () => getTimeAdditionsEnabled, set: (v) => getTimeAdditionsEnabled = v, enumerable: true },
    parseTimeAddition: { get: () => parseTimeAddition, set: (v) => parseTimeAddition = v, enumerable: true },
    parseTimeExpression: { get: () => parseTimeExpression, set: (v) => parseTimeExpression = v, enumerable: true },
    formatTimeBreakdown: { get: () => formatTimeBreakdown, set: (v) => formatTimeBreakdown = v, enumerable: true },
    getTimeEntryParts: { get: () => getTimeEntryParts, set: (v) => getTimeEntryParts = v, enumerable: true },
    setTimeEntryParts: { get: () => setTimeEntryParts, set: (v) => setTimeEntryParts = v, enumerable: true },
    updateTimeInputDisplay: { get: () => updateTimeInputDisplay, set: (v) => updateTimeInputDisplay = v, enumerable: true },
    formatTimeInput: { get: () => formatTimeInput, set: (v) => formatTimeInput = v, enumerable: true },
    formatTime: { get: () => formatTime, set: (v) => formatTime = v, enumerable: true },
    formatShortTime: { get: () => formatShortTime, set: (v) => formatShortTime = v, enumerable: true },
    parseKey: { get: () => parseKey, set: (v) => parseKey = v, enumerable: true },
    toDateKey: { get: () => toDateKey, set: (v) => toDateKey = v, enumerable: true },
    formatDateLong: { get: () => formatDateLong, set: (v) => formatDateLong = v, enumerable: true },
    formatShortDate: { get: () => formatShortDate, set: (v) => formatShortDate = v, enumerable: true },
    formatWeekday: { get: () => formatWeekday, set: (v) => formatWeekday = v, enumerable: true },
    formatNumber: { get: () => formatNumber, set: (v) => formatNumber = v, enumerable: true },
    isValidDateKey: { get: () => isValidDateKey, set: (v) => isValidDateKey = v, enumerable: true },
    startOfMonth: { get: () => startOfMonth, set: (v) => startOfMonth = v, enumerable: true },
    endOfMonth: { get: () => endOfMonth, set: (v) => endOfMonth = v, enumerable: true },
    addMonths: { get: () => addMonths, set: (v) => addMonths = v, enumerable: true },
    addYears: { get: () => addYears, set: (v) => addYears = v, enumerable: true },
    getMonthLabel: { get: () => getMonthLabel, set: (v) => getMonthLabel = v, enumerable: true },
    normalizeColor: { get: () => normalizeColor, set: (v) => normalizeColor = v, enumerable: true },
    hexToSoftBackground: { get: () => hexToSoftBackground, set: (v) => hexToSoftBackground = v, enumerable: true },
    mixColor: { get: () => mixColor, set: (v) => mixColor = v, enumerable: true },
    darkenColor: { get: () => darkenColor, set: (v) => darkenColor = v, enumerable: true },
    lightenColor: { get: () => lightenColor, set: (v) => lightenColor = v, enumerable: true },
    isDarkMode: { get: () => isDarkMode, set: (v) => isDarkMode = v, enumerable: true },
    readableColor: { get: () => readableColor, set: (v) => readableColor = v, enumerable: true },
    needsLightText: { get: () => needsLightText, set: (v) => needsLightText = v, enumerable: true },
    hexToRgb: { get: () => hexToRgb, set: (v) => hexToRgb = v, enumerable: true },
    rgbToHex: { get: () => rgbToHex, set: (v) => rgbToHex = v, enumerable: true },
    getShortLabel: { get: () => getShortLabel, set: (v) => getShortLabel = v, enumerable: true },
    createUniqueKey: { get: () => createUniqueKey, set: (v) => createUniqueKey = v, enumerable: true },
    escapeHtml: { get: () => escapeHtml, set: (v) => escapeHtml = v, enumerable: true },
    slugifyCategory: { get: () => slugifyCategory, set: (v) => slugifyCategory = v, enumerable: true },
    showToast: { get: () => showToast, set: (v) => showToast = v, enumerable: true },
    resetAllData: { get: () => resetAllData, set: (v) => resetAllData = v, enumerable: true }
  });
})();
