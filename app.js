const STORAGE_KEY = "LOG-calendar-local-state-v1";

const INITIAL_START_DATE = "2026-01-01";
const INITIAL_END_DATE = "2026-12-31";
const TODAY_DATE = getTodayDateKey();

const DEFAULT_PROFILE = {
  title: "LOG CALENDAR",
  accentColor: "#0f766e",
  intensityLevels: [1, 3, 7, 10]
};

const DEFAULT_SUBJECTS = [];

const DEFAULT_EXTRA_TRACKS = [];

let subjects = DEFAULT_SUBJECTS.map((subject) => ({ ...subject }));
let EXTRA_TRACKS = DEFAULT_EXTRA_TRACKS.map((track) => ({ ...track }));

const events = {};

const EVENT_CATEGORIES = {
  exam: { label: "Examen", className: "exam-note" },
  deadline: { label: "Entrega", className: "deadline-note" },
  review: { label: "Repaso clave", className: "review-note" },
  personal: { label: "Aviso", className: "personal-note" },
  academic: { label: "Académico", className: "academic-note" },
  holiday: { label: "Festivo", className: "holiday-note" },
  project: { label: "Proyecto", className: "project-note" },
  sport: { label: "Deporte", className: "sport-note" },
  community: { label: "Comunidad", className: "community-note" },
  weekend: { label: "Fin de semana", className: "" }
};

const EVENT_PRIORITY = ["exam", "deadline", "holiday", "academic", "review", "project", "sport", "community", "personal", "weekend"];
const NEW_CATEGORY_VALUE = "__new__";

const RATING_LABELS = [
  "Sin valorar",
  "Muy mal día",
  "Poco productivo",
  "Día normal",
  "Productivo",
  "¡Excelente día!"
];

let state = loadState();
syncConfigFromState();
let selectedDate = getInitialSelectedDate();
let visibleMonth = getInitialVisibleMonth();
let calendarAnimated = false;
let statsRenderTimer = null;
let pendingRangeExtension = "next";
let latestStats = null;
let editingEventTarget = null;

const eventLegendEl = document.getElementById("eventLegend");
const monthsEl = document.getElementById("months");
const calendarTitleEl = document.getElementById("calendarTitle");
const calendarSubtitleEl = document.getElementById("calendarSubtitle");
const visibleRangeLabelEl = document.getElementById("visibleRangeLabel");
const visibleMonthPairTitleEl = document.getElementById("visibleMonthPairTitle");
const prevMonthsBtn = document.getElementById("prevMonthsBtn");
const nextMonthsBtn = document.getElementById("nextMonthsBtn");
const selectedWeekdayEl = document.getElementById("selectedWeekday");
const selectedDateEl = document.getElementById("selectedDate");
const selectedTotalEl = document.getElementById("selectedTotal");
const selectedStudyEl = document.getElementById("selectedStudy");
const daySplitEl = document.getElementById("daySplit");
const noticeListEl = document.getElementById("noticeList");
const openEventModalBtn = document.getElementById("openEventModalBtn");
const eventEntryModalEl = document.getElementById("eventEntryModal");
const eventEntryTitleEl = document.getElementById("eventEntryTitle");
const eventEntryCloseBtn = document.getElementById("eventEntryCloseBtn");
const eventFormEl = document.getElementById("eventForm");
const eventTypeEl = document.getElementById("eventType");
const eventTextEl = document.getElementById("eventText");
const customCategoryFieldsEl = document.getElementById("customCategoryFields");
const customCategoryNameEl = document.getElementById("customCategoryName");
const customCategoryColorEl = document.getElementById("customCategoryColor");
const eventSubjectFieldsEl = document.getElementById("eventSubjectFields");
const eventSubjectEl = document.getElementById("eventSubject");
const eventNewSubjectFieldsEl = document.getElementById("eventNewSubjectFields");
const eventNewSubjectNameEl = document.getElementById("eventNewSubjectName");
const eventNewSubjectDescriptionEl = document.getElementById("eventNewSubjectDescription");
const eventNewSubjectColorEl = document.getElementById("eventNewSubjectColor");
const eventNewSubjectDifficultyEl = document.getElementById("eventNewSubjectDifficulty");
const eventSubmitBtn = document.getElementById("eventSubmitBtn");
const subjectFormEl = document.getElementById("subjectForm");
const focusTracksEl = document.getElementById("focusTracks");
const dayNotesEl = document.getElementById("dayNotes");
const clearDayBtn = document.getElementById("clearDayBtn");
const exportBtn = document.getElementById("exportBtn");
const importInput = document.getElementById("importInput");
const settingsBtn = document.getElementById("settingsBtn");
const settingsModalEl = document.getElementById("settingsModal");
const settingsCloseBtn = document.getElementById("settingsCloseBtn");
const openSubjectModalBtn = document.getElementById("openSubjectModalBtn");
const openTrackModalBtn = document.getElementById("openTrackModalBtn");
const subjectEntryModalEl = document.getElementById("subjectEntryModal");
const trackEntryModalEl = document.getElementById("trackEntryModal");
const rangeEntryModalEl = document.getElementById("rangeEntryModal");
const subjectEntryCloseBtn = document.getElementById("subjectEntryCloseBtn");
const trackEntryCloseBtn = document.getElementById("trackEntryCloseBtn");
const rangeEntryCloseBtn = document.getElementById("rangeEntryCloseBtn");
const rangeEntryTextEl = document.getElementById("rangeEntryText");
const rangeEntryConfirmBtn = document.getElementById("rangeEntryConfirmBtn");
const profileFormEl = document.getElementById("profileForm");
const profileTitleEl = document.getElementById("profileTitle");
const profileAccentEl = document.getElementById("profileAccent");
const profileLevel1El = document.getElementById("profileLevel1");
const profileLevel2El = document.getElementById("profileLevel2");
const profileLevel3El = document.getElementById("profileLevel3");
const profileLevel4El = document.getElementById("profileLevel4");
const subjectsSettingsListEl = document.getElementById("subjectsSettingsList");
const subjectSettingsFormEl = document.getElementById("subjectSettingsForm");
const newSubjectNameEl = document.getElementById("newSubjectName");
const newSubjectDescriptionEl = document.getElementById("newSubjectDescription");
const newSubjectColorEl = document.getElementById("newSubjectColor");
const newSubjectDifficultyEl = document.getElementById("newSubjectDifficulty");
const tracksSettingsListEl = document.getElementById("tracksSettingsList");
const trackSettingsFormEl = document.getElementById("trackSettingsForm");
const newTrackNameEl = document.getElementById("newTrackName");
const newTrackDescriptionEl = document.getElementById("newTrackDescription");
const newTrackColorEl = document.getElementById("newTrackColor");
const grandTotalEl = document.getElementById("grandTotal");
const weightedLoadEl = document.getElementById("weightedLoad");
const avgPerDayEl = document.getElementById("avgPerDay");
const avgActiveDayEl = document.getElementById("avgActiveDay");
const bestDayEl = document.getElementById("bestDay");
const streakEl = document.getElementById("streak");
const avgRatingEl = document.getElementById("avgRating");
const studyFocusEl = document.getElementById("studyFocus");
const hobbyFocusEl = document.getElementById("hobbyFocus");
const topSubjectEl = document.getElementById("topSubject");
const topTrackEl = document.getElementById("topTrack");
const moreStatsBtn = document.getElementById("moreStatsBtn");
const subjectChartEl = document.getElementById("subjectChart");
const ratingsChartEl = document.getElementById("ratingsChart");
const balanceChartEl = document.getElementById("balanceChart");
const advancedStatsModalEl = document.getElementById("advancedStatsModal");
const advancedStatsCloseBtn = document.getElementById("advancedStatsCloseBtn");
const advancedStatsContentEl = document.getElementById("advancedStatsContent");
const toastEl = document.getElementById("toast");
const starsContainerEl = document.getElementById("starsContainer");
const ratingHintEl = document.getElementById("ratingHint");
const autoSaveEl = document.getElementById("autoSaveIndicator");
const resetDataBtn = document.getElementById("resetDataBtn");

renderEventTypeOptions();
renderEventSubjectOptions();
updateEventEntryFields();
applyProfile();
renderSubjectInputs();
renderTrackInputs();
renderCalendar();
renderSelectedDay();
renderStats();
renderSettings();
renderEventLegend();

clearDayBtn.addEventListener("click", clearSelectedDay);
exportBtn.addEventListener("click", exportData);
importInput.addEventListener("change", importData);
settingsBtn.addEventListener("click", openSettings);
if (resetDataBtn) resetDataBtn.addEventListener("click", resetAllData);
prevMonthsBtn.addEventListener("click", () => moveVisibleMonths(-2));
nextMonthsBtn.addEventListener("click", () => moveVisibleMonths(2));
moreStatsBtn.addEventListener("click", openAdvancedStats);
advancedStatsCloseBtn.addEventListener("click", closeAdvancedStats);
advancedStatsModalEl.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-advanced-stats")) closeAdvancedStats();
});
settingsCloseBtn.addEventListener("click", closeSettings);
settingsModalEl.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-settings")) closeSettings();
});
openSubjectModalBtn.addEventListener("click", openSubjectEntry);
openTrackModalBtn.addEventListener("click", openTrackEntry);
openEventModalBtn.addEventListener("click", () => openEventEntry());
eventEntryCloseBtn.addEventListener("click", closeEventEntry);
eventEntryModalEl.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-event")) closeEventEntry();
});
subjectEntryCloseBtn.addEventListener("click", closeSubjectEntry);
trackEntryCloseBtn.addEventListener("click", closeTrackEntry);
subjectEntryModalEl.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-entry")) closeSubjectEntry();
});
trackEntryModalEl.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-entry")) closeTrackEntry();
});
rangeEntryCloseBtn.addEventListener("click", closeRangeEntry);
rangeEntryConfirmBtn.addEventListener("click", extendCalendarRange);
rangeEntryModalEl.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-range")) closeRangeEntry();
});
eventFormEl.addEventListener("submit", addCustomEvent);
eventTypeEl.addEventListener("change", updateEventEntryFields);
eventSubjectEl.addEventListener("change", updateEventEntryFields);
profileFormEl.addEventListener("submit", saveProfileSettings);
subjectSettingsFormEl.addEventListener("submit", addSubjectFromSettings);
trackSettingsFormEl.addEventListener("submit", addTrackFromSettings);
subjectsSettingsListEl.addEventListener("click", handleSubjectSettingsClick);
tracksSettingsListEl.addEventListener("click", handleTrackSettingsClick);

subjectFormEl.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  if (!target.dataset.subject) return;
  const day = ensureDay(selectedDate);
  day.subjects[target.dataset.subject] = normalizeHours(target.value);
  onDayDataUpdated();
});

focusTracksEl.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  if (!target.dataset.track) return;
  const day = ensureDay(selectedDate);
  day.extra[target.dataset.track] = normalizeHours(target.value);
  onDayDataUpdated();
});

dayNotesEl.addEventListener("input", () => {
  ensureDay(selectedDate).notes = dayNotesEl.value;
  saveState();
  refreshDayCell(selectedDate);
  flashAutoSave();
});

starsContainerEl.addEventListener("click", (event) => {
  const star = event.target.closest(".star");
  if (!star) return;
  const value = Number(star.dataset.value);
  const day = ensureDay(selectedDate);
  day.rating = day.rating === value ? 0 : value;
  saveState();
  renderRating(day.rating);
  refreshDayCell(selectedDate);
  renderStats();
  flashAutoSave();
});

starsContainerEl.addEventListener("mouseover", (event) => {
  const star = event.target.closest(".star");
  if (!star) return;
  const val = Number(star.dataset.value);
  highlightStars(val);
  ratingHintEl.textContent = RATING_LABELS[val];
  ratingHintEl.dataset.level = val;
});

starsContainerEl.addEventListener("mouseleave", () => {
  const rating = state.days[selectedDate]?.rating || 0;
  renderRating(rating);
});

function onDayDataUpdated() {
  selectedTotalEl.textContent = formatNumber(getDayTotal(selectedDate));
  selectedStudyEl.textContent = `Estudio: ${formatNumber(getStudyTotal(selectedDate))} h`;
  renderDaySplit();
  saveState();
  flashAutoSave();
  refreshDayCell(selectedDate);
  scheduleStatsRender();
  renderNotices();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function persist() {
  saveState();
  renderCalendar();
  renderStats();
}

function flashAutoSave() {
  autoSaveEl.classList.add("visible");
  clearTimeout(flashAutoSave._t);
  flashAutoSave._t = setTimeout(() => autoSaveEl.classList.remove("visible"), 2000);
}

function loadState() {
  const fallback = createFallbackState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return normalizeState(parsed);
  } catch {
    return fallback;
  }
}

function createFallbackState() {
  return {
    settings: {
      subjectDifficulty: getDefaultDifficultyMap(),
      profile: { ...DEFAULT_PROFILE },
      calendarRange: { start: INITIAL_START_DATE, end: INITIAL_END_DATE },
      subjects: DEFAULT_SUBJECTS.map((subject) => ({ ...subject })),
      tracks: DEFAULT_EXTRA_TRACKS.map((track) => ({ ...track }))
    },
    days: {},
    dismissedEvents: {},
    customEventCategories: {}
  };
}

function normalizeState(candidate) {
  const normalized = createFallbackState();
  if (!candidate || typeof candidate !== "object") return normalized;

  if (candidate.days && typeof candidate.days === "object") {
    normalized.days = candidate.days;
  }

  if (candidate.settings && typeof candidate.settings === "object") {
    normalized.settings = {
      ...normalized.settings,
      ...candidate.settings,
      subjectDifficulty: {
        ...normalized.settings.subjectDifficulty,
        ...(candidate.settings.subjectDifficulty || {})
      },
      profile: normalizeProfile(candidate.settings.profile),
      calendarRange: normalizeCalendarRange(candidate.settings.calendarRange),
      subjects: normalizeSubjects(candidate.settings.subjects),
      tracks: normalizeTracks(candidate.settings.tracks)
    };
  }

  if (candidate.dismissedEvents && typeof candidate.dismissedEvents === "object") {
    normalized.dismissedEvents = candidate.dismissedEvents;
  }

  if (candidate.customEventCategories && typeof candidate.customEventCategories === "object") {
    normalized.customEventCategories = candidate.customEventCategories;
  }

  return normalized;
}

function getDefaultDifficultyMap() {
  return Object.fromEntries(DEFAULT_SUBJECTS.map((subject) => [subject.name, subject.defaultDifficulty]));
}

function getSubjectDifficulty(subjectName) {
  return clampDifficulty(state.settings.subjectDifficulty[subjectName]);
}

function syncConfigFromState() {
  subjects = normalizeSubjects(state.settings.subjects);
  EXTRA_TRACKS = normalizeTracks(state.settings.tracks);
  state.settings.subjects = subjects;
  state.settings.tracks = EXTRA_TRACKS;
  state.settings.profile = normalizeProfile(state.settings.profile);
  state.settings.calendarRange = normalizeCalendarRange(state.settings.calendarRange);

  for (const subject of subjects) {
    if (typeof state.settings.subjectDifficulty[subject.name] !== "number") {
      state.settings.subjectDifficulty[subject.name] = subject.defaultDifficulty || 3;
    }
  }
}

function normalizeProfile(profile) {
  const source = profile && typeof profile === "object" ? profile : {};
  const levels = Array.isArray(source.intensityLevels) ? source.intensityLevels : DEFAULT_PROFILE.intensityLevels;
  return {
    title: typeof source.title === "string" && source.title.trim() ? source.title.trim() : DEFAULT_PROFILE.title,
    accentColor: normalizeColor(source.accentColor || DEFAULT_PROFILE.accentColor),
    intensityLevels: normalizeIntensityLevels(levels)
  };
}

function normalizeCalendarRange(range) {
  const start = range?.start && isValidDateKey(range.start) ? range.start : INITIAL_START_DATE;
  const end = range?.end && isValidDateKey(range.end) ? range.end : INITIAL_END_DATE;
  return start <= end ? { start, end } : { start: INITIAL_START_DATE, end: INITIAL_END_DATE };
}

function normalizeSubjects(source) {
  const list = Array.isArray(source) && source.length ? source : DEFAULT_SUBJECTS;
  const seen = new Set();
  return list
    .map((subject) => {
      if (typeof subject === "string") {
        const defaultSubject = DEFAULT_SUBJECTS.find((item) => item.name === subject);
        return {
          name: subject.trim(),
          description: defaultSubject?.description || "Asignatura creada desde importación.",
          color: normalizeColor(defaultSubject?.color),
          defaultDifficulty: clampDifficulty(defaultSubject?.defaultDifficulty ?? 3)
        };
      }

      return {
        name: String(subject.name || "").trim(),
        description: String(subject.description || "").trim(),
        color: normalizeColor(subject.color),
        defaultDifficulty: clampDifficulty(subject.defaultDifficulty ?? subject.difficulty ?? 3)
      };
    })
    .filter((subject) => subject.name && !seen.has(subject.name) && seen.add(subject.name));
}

function normalizeTracks(source) {
  const list = Array.isArray(source) && source.length ? source : DEFAULT_EXTRA_TRACKS;
  const seen = new Set();
  return list
    .map((track) => {
      const label = String(track.label || "").trim();
      const key = track.key ? String(track.key) : (slugifyCategory(label) || "hobby");
      return {
        key,
        label,
        description: String(track.description || "").trim(),
        shortLabel: String(track.shortLabel || getShortLabel(label)).slice(0, 4).toUpperCase(),
        color: normalizeColor(track.color),
        className: `track-${slugifyCategory(label) || "custom"}`
      };
    })
    .filter((track) => track.key && track.label && !seen.has(track.key) && seen.add(track.key));
}

function clampDifficulty(value) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return 3;
  if (n < 1) return 1;
  if (n > 5) return 5;
  return n;
}

function ensureDay(dateKey) {
  if (!state.days[dateKey]) {
    state.days[dateKey] = { subjects: {}, notes: "", rating: 0, customEvents: [], extra: {} };
  }

  const day = state.days[dateKey];
  if (typeof day.notes !== "string") day.notes = "";
  if (typeof day.rating !== "number") day.rating = 0;
  if (!Array.isArray(day.customEvents)) day.customEvents = [];

  if (!day.extra || typeof day.extra !== "object") day.extra = {};

  for (const track of EXTRA_TRACKS) {
    if (typeof day.extra[track.key] !== "number") {
      day.extra[track.key] = normalizeHours(day[track.key] || 0);
    }
  }

  for (const subject of subjects) {
    if (typeof day.subjects?.[subject.name] !== "number") {
      if (!day.subjects || typeof day.subjects !== "object") day.subjects = {};
      day.subjects[subject.name] = 0;
    }
  }

  return day;
}

function renderEventTypeOptions(selectedValue = eventTypeEl.value) {
  const customCategories = getCustomEventCategories();
  eventTypeEl.querySelectorAll('option[value^="custom-"]').forEach((option) => option.remove());
  const newCategoryOption = eventTypeEl.querySelector(`option[value="${NEW_CATEGORY_VALUE}"]`);

  for (const category of customCategories) {
    const option = document.createElement("option");
    option.value = category.type;
    option.textContent = category.label;
    eventTypeEl.insertBefore(option, newCategoryOption);
  }

  if (selectedValue && Array.from(eventTypeEl.options).some((option) => option.value === selectedValue)) {
    eventTypeEl.value = selectedValue;
  }
}

function renderEventSubjectOptions(selectedValue = eventSubjectEl.value) {
  eventSubjectEl.innerHTML = "";
  for (const subject of subjects) {
    const option = document.createElement("option");
    option.value = subject.name;
    option.textContent = subject.name;
    eventSubjectEl.appendChild(option);
  }

  const createOption = document.createElement("option");
  createOption.value = "__new_subject__";
  createOption.textContent = "Crear nueva asignatura";
  eventSubjectEl.appendChild(createOption);

  if (selectedValue && Array.from(eventSubjectEl.options).some((option) => option.value === selectedValue)) {
    eventSubjectEl.value = selectedValue;
  } else if (subjects.length) {
    eventSubjectEl.value = subjects[0].name;
  } else {
    eventSubjectEl.value = "__new_subject__";
  }
}

function updateEventEntryFields() {
  toggleCustomCategoryFields();
  toggleEventSubjectFields();
}

function toggleCustomCategoryFields() {
  const isCreatingCategory = eventTypeEl.value === NEW_CATEGORY_VALUE;
  customCategoryFieldsEl.hidden = !isCreatingCategory;
  customCategoryNameEl.required = isCreatingCategory;
}

function toggleEventSubjectFields() {
  const isExam = eventTypeEl.value === "exam";
  const isCreatingSubject = eventSubjectEl.value === "__new_subject__";
  eventSubjectFieldsEl.hidden = !isExam;
  eventSubjectEl.required = isExam;
  eventNewSubjectFieldsEl.hidden = !isExam || !isCreatingSubject;
  eventNewSubjectNameEl.required = isExam && isCreatingSubject;
  eventNewSubjectDescriptionEl.required = isExam && isCreatingSubject;
  eventNewSubjectDifficultyEl.required = false;
}

function getCustomEventCategories() {
  if (!state.customEventCategories || typeof state.customEventCategories !== "object") {
    state.customEventCategories = {};
  }

  return Object.entries(state.customEventCategories)
    .map(([type, category]) => ({
      type,
      label: typeof category.label === "string" ? category.label : "Otro",
      color: normalizeColor(category.color)
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));
}

function getEventCategory(type) {
  if (EVENT_CATEGORIES[type]) return EVENT_CATEGORIES[type];

  const custom = state.customEventCategories?.[type];
  if (custom) {
    return {
      label: custom.label || "Otro",
      className: "custom-note",
      color: normalizeColor(custom.color)
    };
  }

  return EVENT_CATEGORIES.personal;
}

function applyProfile() {
  const profile = state.settings.profile;
  const rgb = hexToRgb(profile.accentColor);
  document.documentElement.style.setProperty("--accent", profile.accentColor);
  document.documentElement.style.setProperty("--accent-rgb", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
  document.documentElement.style.setProperty("--accent-dark", darkenColor(profile.accentColor, 0.22));
  document.documentElement.style.setProperty("--accent-soft", hexToSoftBackground(profile.accentColor));
  document.documentElement.style.setProperty("--level-1", getIntensityColor(profile.intensityLevels[0]));
  document.documentElement.style.setProperty("--level-2", getIntensityColor(profile.intensityLevels[1]));
  document.documentElement.style.setProperty("--level-3", getIntensityColor(profile.intensityLevels[2]));
  document.documentElement.style.setProperty("--level-4", getIntensityColor(profile.intensityLevels[3]));
  calendarTitleEl.textContent = profile.title;
  calendarSubtitleEl.textContent = "LOG is LOG Of Growth";
  calendarSubtitleEl.hidden = false;
}

function renderSubjectInputs() {
  subjectFormEl.innerHTML = "";
  if (!subjects.length) {
    subjectFormEl.innerHTML = `<div class="empty-state">Sin asignaturas configuradas.</div>`;
    return;
  }

  for (const subject of subjects) {
    const row = document.createElement("label");
    row.className = "subject-row";
    row.innerHTML = `
      <span class="subject-name">
        <span class="color-dot" style="background:${subject.color}"></span>
        <span>${escapeHtml(subject.name)}</span>
      </span>
      <input type="number" min="0" max="24" step="0.25" inputmode="decimal" data-subject="${escapeHtml(subject.name)}" aria-label="Horas de ${escapeHtml(subject.name)}">
    `;
    subjectFormEl.appendChild(row);
  }

  for (const input of subjectFormEl.querySelectorAll("input[data-subject]")) {
    const value = ensureDay(selectedDate).subjects[input.dataset.subject] || 0;
    input.value = value ? String(value) : "";
  }
}

function renderCalendar() {
  const selected = selectedDate;
  const noAnim = calendarAnimated;
  monthsEl.innerHTML = "";

  const months = [0, 1].map((offset) => {
    const date = addMonths(visibleMonth, offset);
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
      label: getMonthLabel(date)
    };
  });

  for (const monthInfo of months) {
    const monthEl = document.createElement("section");
    monthEl.className = "month";
    monthEl.innerHTML = `
      <div class="month-title">
        <strong>${monthInfo.label}</strong>
        <span>${monthInfo.year}</span>
      </div>
      <div class="weekday-row" aria-hidden="true">
        <span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span>
      </div>
    `;

    const grid = document.createElement("div");
    grid.className = "day-grid";
    const first = new Date(monthInfo.year, monthInfo.month, 1);
    const blanks = (first.getDay() + 6) % 7;
    for (let i = 0; i < blanks; i++) {
      grid.appendChild(Object.assign(document.createElement("div"), { className: "blank-cell" }));
    }

    const daysInMonth = new Date(monthInfo.year, monthInfo.month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const key = toDateKey(new Date(monthInfo.year, monthInfo.month, day));
      if (key < getCalendarStart() || key > getCalendarEnd()) {
        grid.appendChild(Object.assign(document.createElement("div"), { className: "blank-cell" }));
        continue;
      }
      grid.appendChild(createDayCell(key, selected, noAnim));
    }

    monthEl.appendChild(grid);
    monthsEl.appendChild(monthEl);
  }

  if (!calendarAnimated) calendarAnimated = true;
  renderCalendarNavigation();
}

function renderCalendarNavigation() {
  const visibleStart = toDateKey(startOfMonth(visibleMonth));
  const visibleEnd = toDateKey(endOfMonth(addMonths(visibleMonth, 1)));
  const firstLabel = getMonthLabel(visibleMonth);
  const secondLabel = getMonthLabel(addMonths(visibleMonth, 1));
  visibleRangeLabelEl.textContent = `Mostrando ${firstLabel.toLowerCase()} y ${secondLabel.toLowerCase()}.`;
  visibleMonthPairTitleEl.textContent = `${firstLabel} · ${secondLabel}`;
  prevMonthsBtn.title = visibleStart <= getCalendarStart() ? "Precargar meses anteriores" : "Ver dos meses anteriores";
  nextMonthsBtn.title = visibleEnd >= getCalendarEnd() ? "Precargar meses siguientes" : "Ver dos meses siguientes";
}

function moveVisibleMonths(offset) {
  const target = addMonths(visibleMonth, offset);
  if (offset < 0 && toDateKey(startOfMonth(target)) < getCalendarStart()) {
    openRangeEntry("prev");
    return;
  }

  if (offset > 0 && toDateKey(endOfMonth(addMonths(target, 1))) > getCalendarEnd()) {
    openRangeEntry("next");
    return;
  }

  visibleMonth = target;
  renderCalendar();
}

function createDayCell(key, selected, noAnim) {
  const date = parseKey(key);
  const total = getStudyTotal(key);
  const cell = document.createElement("button");
  const classNames = ["day-cell", getIntensityClass(total)];
  if (key === selected) classNames.push("selected");
  if (key === TODAY_DATE) classNames.push("today");
  if ([0, 6].includes(date.getDay())) classNames.push("weekend");
  addEventClasses(classNames, key);
  addTrackClasses(classNames, key);
  if (needsLightText(getIntensityColor(total))) classNames.push("dark-day");
  cell.className = classNames.join(" ");
  cell.type = "button";
  cell.dataset.date = key;
  cell.style.backgroundColor = getIntensityColor(total);
  applyEventColorToCell(cell, key);

  if (noAnim) {
    cell.style.animation = "none";
    cell.style.opacity = "1";
    cell.style.transform = "translateY(0)";
  } else {
    cell.style.animationDelay = `${Math.min(date.getDate() * 16, 360)}ms`;
  }

  cell.setAttribute("aria-label", `${formatDateLong(key)}, ${formatNumber(total)} horas de estudio`);
  cell.innerHTML = getDayCellMarkup(key);

  cell.addEventListener("click", () => {
    selectedDate = key;
    renderCalendar();
    renderSelectedDay();
  });
  return cell;
}

function refreshDayCell(key) {
  const cell = monthsEl.querySelector(`[data-date="${key}"]`);
  if (!cell) return;
  const date = parseKey(key);
  const total = getStudyTotal(key);
  const classNames = ["day-cell", getIntensityClass(total)];
  if (key === selectedDate) classNames.push("selected");
  if (key === TODAY_DATE) classNames.push("today");
  if ([0, 6].includes(date.getDay())) classNames.push("weekend");
  addEventClasses(classNames, key);
  addTrackClasses(classNames, key);
  if (needsLightText(getIntensityColor(total))) classNames.push("dark-day");
  cell.className = classNames.join(" ");
  cell.style.backgroundColor = getIntensityColor(total);
  applyEventColorToCell(cell, key);
  cell.setAttribute("aria-label", `${formatDateLong(key)}, ${formatNumber(total)} horas de estudio`);
  cell.innerHTML = getDayCellMarkup(key);
}

function applyEventColorToCell(cell, key) {
  for (let i = 1; i <= 4; i++) cell.style.removeProperty(`--event-color-${i}`);
  getEventBorderColors(getDayEvents(key)).forEach((color, index) => {
    cell.style.setProperty(`--event-color-${index + 1}`, color);
  });
}

function renderTrackInputs() {
  focusTracksEl.innerHTML = "";
  if (!EXTRA_TRACKS.length) {
    focusTracksEl.innerHTML = `<div class="empty-state">Sin hobbies configurados.</div>`;
    return;
  }

  const day = ensureDay(selectedDate);
  for (const track of EXTRA_TRACKS) {
    const article = document.createElement("article");
    article.className = "focus-track";
    article.style.setProperty("--track-color", track.color);
    article.innerHTML = `
      <h3>${escapeHtml(track.label)}</h3>
      <p>${escapeHtml(track.description || "Tiempo dedicado a este hobby.")}</p>
      <label for="track-${escapeHtml(track.key)}">Horas del día</label>
      <input id="track-${escapeHtml(track.key)}" type="number" min="0" max="24" step="0.25" inputmode="decimal" placeholder="0" data-track="${escapeHtml(track.key)}">
    `;
    const input = article.querySelector("input");
    input.value = day.extra[track.key] ? String(day.extra[track.key]) : "";
    focusTracksEl.appendChild(article);
  }
}

function addTrackClasses(classNames, key) {
  const day = ensureDay(key);
  if (EXTRA_TRACKS.some((track) => day.extra[track.key] > 0)) classNames.push("has-track");
}

function getDayCellMarkup(key) {
  const date = parseKey(key);
  const total = getStudyTotal(key);
  const day = ensureDay(key);

  const dots = subjects
    .filter((subject) => (day.subjects[subject.name] || 0) > 0)
    .map((subject) => `<span style="background:${subject.color}"></span>`)
    .join("");

  const chips = EXTRA_TRACKS
    .filter((track) => day.extra[track.key] > 0)
    .map((track) => `<span class="track-chip" style="--chip-color:${track.color}">${escapeHtml(track.shortLabel)} ${formatNumber(day.extra[track.key])}h</span>`)
    .join("");
  const noteDot = day.notes.trim() ? `<span class="note-dot" title="Tiene nota"></span>` : "";

  return `
    <span class="day-topline">
      <span class="day-number">${date.getDate()}</span>
      ${noteDot}
    </span>
    <span class="day-body">
      <span class="day-hours">${formatNumber(total)} h</span>
    </span>
    <span class="subject-dots" aria-hidden="true">${dots}</span>
    <span class="track-chips" aria-hidden="true">${chips}</span>
  `;
}

function scheduleStatsRender() {
  clearTimeout(statsRenderTimer);
  statsRenderTimer = setTimeout(renderStats, 300);
}

function renderSelectedDay() {
  const day = ensureDay(selectedDate);
  selectedWeekdayEl.textContent = formatWeekday(selectedDate);
  selectedDateEl.textContent = formatDateLong(selectedDate);
  selectedTotalEl.textContent = formatNumber(getDayTotal(selectedDate));
  selectedStudyEl.textContent = `Estudio: ${formatNumber(getStudyTotal(selectedDate))} h`;
  renderDaySplit();
  dayNotesEl.value = day.notes || "";
  renderTrackInputs();
  renderRating(day.rating);

  for (const input of subjectFormEl.querySelectorAll("input[data-subject]")) {
    const value = day.subjects[input.dataset.subject] || 0;
    input.value = value ? String(value) : "";
  }

  renderNotices();
}

function renderDaySplit() {
  daySplitEl.querySelectorAll("[data-track-summary]").forEach((node) => node.remove());
  const day = ensureDay(selectedDate);
  for (const track of EXTRA_TRACKS) {
    const item = document.createElement("span");
    item.dataset.trackSummary = track.key;
    item.textContent = `${track.label}: ${formatNumber(day.extra[track.key])} h`;
    daySplitEl.appendChild(item);
  }
}

function renderRating(rating) {
  starsContainerEl.querySelectorAll(".star").forEach((star, i) => {
    star.classList.toggle("active", i < rating);
    star.classList.remove("hover");
  });
  ratingHintEl.textContent = RATING_LABELS[rating];
  ratingHintEl.dataset.level = rating;
}

function highlightStars(upTo) {
  starsContainerEl.querySelectorAll(".star").forEach((star, i) => {
    star.classList.remove("active");
    star.classList.toggle("hover", i < upTo);
  });
}

function renderNotices() {
  noticeListEl.innerHTML = "";
  const day = ensureDay(selectedDate);
  const list = [
    ...getVisibleStaticEvents(selectedDate).map(({ event, index }) => ({ ...event, source: "static", index })),
    ...day.customEvents.map((event, index) => ({ ...event, source: "custom", index }))
  ];

  for (const track of EXTRA_TRACKS) {
    if (day.extra[track.key] > 0) {
      list.push({ type: "track", text: `${formatNumber(day.extra[track.key])} h en ${track.label}`, source: "auto", color: track.color, label: track.label });
    }
  }

  const date = parseKey(selectedDate);
  if ([0, 6].includes(date.getDay())) {
    list.push({ type: "weekend", text: "Fin de semana.", source: "auto" });
  }

  if (!list.length) {
    const clean = document.createElement("div");
    clean.className = "notice";
    clean.textContent = "Sin eventos marcados para este día.";
    noticeListEl.appendChild(clean);
    return;
  }

  for (const ev of list) {
    const item = document.createElement("div");
    const category = ev.type === "track" ? { label: ev.label, className: "custom-note", color: ev.color } : getEventCategory(ev.type);
    item.className = `notice ${category.className}`;
    if (category.color) {
      item.style.borderLeftColor = category.color;
      item.style.background = hexToSoftBackground(category.color);
      item.style.color = category.color;
    }
    const text = document.createElement("span");
    const subjectSuffix = ev.type === "exam" && ev.subjectName ? ` · ${ev.subjectName}` : "";
    text.textContent = `${category.label}: ${ev.text}${subjectSuffix}`;
    item.appendChild(text);
    if (ev.source === "static" || ev.source === "custom") {
      const actions = document.createElement("span");
      actions.className = "notice-actions";
      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "notice-action";
      edit.textContent = "✎";
      edit.title = ev.source === "static" ? "Editar evento predefinido" : "Editar evento creado";
      edit.setAttribute("aria-label", edit.title);
      edit.addEventListener("click", () => openEventEntry(ev));
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "notice-action";
      remove.textContent = "🗑";
      remove.title = ev.source === "static" ? "Eliminar evento predefinido" : "Eliminar evento creado";
      remove.setAttribute("aria-label", remove.title);
      remove.addEventListener("click", () => {
        if (ev.source === "static") {
          removeStaticEvent(ev.index);
        } else {
          removeCustomEvent(ev.index);
        }
      });
      actions.append(edit, remove);
      item.appendChild(actions);
    }
    noticeListEl.appendChild(item);
  }
}

function openEventEntry(target = null) {
  editingEventTarget = target ? { source: target.source, index: target.index } : null;
  const sourceEvent = target || { type: "personal", text: "", subjectName: "" };
  eventEntryTitleEl.textContent = target ? "Editar evento" : "Añadir evento";
  eventSubmitBtn.textContent = target ? "Guardar cambios" : "Guardar evento";
  renderEventTypeOptions(sourceEvent.type);
  renderEventSubjectOptions(sourceEvent.subjectName);
  eventTextEl.value = sourceEvent.text || "";
  customCategoryNameEl.value = "";
  customCategoryColorEl.value = getEventCategory(sourceEvent.type).color || "#0f766e";
  eventNewSubjectNameEl.value = "";
  eventNewSubjectDescriptionEl.value = "";
  eventNewSubjectColorEl.value = "#0f766e";
  eventNewSubjectDifficultyEl.value = "";
  updateEventEntryFields();
  eventEntryModalEl.hidden = false;
  eventTextEl.focus();
}

function closeEventEntry() {
  editingEventTarget = null;
  eventEntryModalEl.hidden = true;
  eventFormEl.reset();
  customCategoryColorEl.value = "#0f766e";
  eventNewSubjectColorEl.value = "#0f766e";
  renderEventTypeOptions();
  renderEventSubjectOptions();
  updateEventEntryFields();
}

function addCustomEvent(event) {
  event.preventDefault();
  const text = eventTextEl.value.trim();
  if (!text) {
    showToast("Escribe el evento antes de añadirlo.");
    return;
  }

  const type = resolveEventTypeForSubmit();
  if (!type) return;
  const subjectName = resolveEventSubjectForSubmit(type);
  if (type === "exam" && !subjectName) return;

  const day = ensureDay(selectedDate);
  const payload = {
    type,
    text,
    ...(type === "exam" ? { subjectName } : {}),
    createdAt: new Date().toISOString()
  };

  const wasEditing = Boolean(editingEventTarget);
  if (editingEventTarget) {
    if (editingEventTarget.source === "custom") {
      day.customEvents[editingEventTarget.index] = {
        ...day.customEvents[editingEventTarget.index],
        ...payload,
        updatedAt: new Date().toISOString()
      };
    } else if (editingEventTarget.source === "static") {
      dismissStaticEventByIndex(editingEventTarget.index);
      day.customEvents.push({
        ...payload,
        createdAt: new Date().toISOString(),
        editedFromStatic: true
      });
    }
  } else {
    day.customEvents.push(payload);
  }

  closeEventEntry();
  saveState();
  refreshDayCell(selectedDate);
  renderNotices();
  renderStats();
  renderEventLegend();
  flashAutoSave();
  showToast(wasEditing ? "Evento actualizado." : "Evento añadido.");
}

function resolveEventTypeForSubmit() {
  if (eventTypeEl.value !== NEW_CATEGORY_VALUE) return eventTypeEl.value;

  const label = customCategoryNameEl.value.trim();
  if (!label) {
    showToast("Escribe el nombre de la categoría.");
    customCategoryNameEl.focus();
    return "";
  }

  const type = createCustomEventCategory(label, customCategoryColorEl.value);
  renderEventTypeOptions(type);
  return type;
}

function resolveEventSubjectForSubmit(type) {
  if (type !== "exam") return "";

  if (eventSubjectEl.value !== "__new_subject__") {
    return eventSubjectEl.value;
  }

  const name = eventNewSubjectNameEl.value.trim();
  const description = eventNewSubjectDescriptionEl.value.trim();
  if (!name || !description) {
    showToast("Para un examen, crea o elige una asignatura.");
    eventNewSubjectNameEl.focus();
    return "";
  }

  const existing = subjects.find((subject) => subject.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    renderEventSubjectOptions(existing.name);
    return existing.name;
  }

  state.settings.subjects.push({
    name,
    description,
    color: normalizeColor(eventNewSubjectColorEl.value),
    defaultDifficulty: clampDifficulty(eventNewSubjectDifficultyEl.value)
  });
  state.settings.subjectDifficulty[name] = clampDifficulty(eventNewSubjectDifficultyEl.value);
  syncConfigFromState();
  renderEventSubjectOptions(name);
  renderSubjectInputs();
  renderSettings();
  return name;
}

function createCustomEventCategory(label, color) {
  if (!state.customEventCategories || typeof state.customEventCategories !== "object") {
    state.customEventCategories = {};
  }

  const existing = Object.entries(state.customEventCategories).find(([, category]) => {
    return String(category.label || "").trim().toLowerCase() === label.toLowerCase();
  });

  if (existing) {
    const [type] = existing;
    state.customEventCategories[type].color = normalizeColor(color);
    return type;
  }

  const base = slugifyCategory(label) || "categoria";
  let type = `custom-${base}`;
  let counter = 2;
  while (state.customEventCategories[type]) {
    type = `custom-${base}-${counter}`;
    counter += 1;
  }

  state.customEventCategories[type] = {
    label,
    color: normalizeColor(color)
  };

  return type;
}

function removeCustomEvent(index) {
  const day = ensureDay(selectedDate);
  day.customEvents.splice(index, 1);
  saveState();
  refreshDayCell(selectedDate);
  renderNotices();
  renderEventLegend();
  flashAutoSave();
  showToast("Evento eliminado.");
}

function removeStaticEvent(index) {
  dismissStaticEventByIndex(index);
  saveState();
  refreshDayCell(selectedDate);
  renderNotices();
  renderEventLegend();
  flashAutoSave();
  showToast("Evento eliminado.");
}

function dismissStaticEventByIndex(index) {
  const staticEvents = events[selectedDate] || [];
  const event = staticEvents[index];
  if (!event) return;

  if (!state.dismissedEvents || typeof state.dismissedEvents !== "object") {
    state.dismissedEvents = {};
  }

  const dismissedForDay = Array.isArray(state.dismissedEvents[selectedDate])
    ? state.dismissedEvents[selectedDate]
    : [];
  const eventId = getStaticEventId(event, index);

  if (!dismissedForDay.includes(eventId)) {
    dismissedForDay.push(eventId);
  }

  state.dismissedEvents[selectedDate] = dismissedForDay;
}

function getDayEvents(key) {
  return [...getVisibleStaticEvents(key).map(({ event }) => event), ...(state.days[key]?.customEvents || [])];
}

function getVisibleStaticEvents(key) {
  const dismissedForDay = Array.isArray(state.dismissedEvents?.[key]) ? state.dismissedEvents[key] : [];
  return (events[key] || [])
    .map((event, index) => ({ event, index }))
    .filter(({ event, index }) => !dismissedForDay.includes(getStaticEventId(event, index)));
}

function getStaticEventId(event, index) {
  return `${index}:${event.type}:${event.text}`;
}

function addEventClasses(classNames, key) {
  const dayEvents = getDayEvents(key);
  if (dayEvents.some((ev) => ev.type === "holiday")) classNames.push("holiday");
  const colors = getEventBorderColors(dayEvents);
  if (colors.length > 0) classNames.push("has-event", `event-count-${colors.length}`);
}

function getEventBorderColors(dayEvents) {
  const colors = [];
  for (const event of dayEvents) {
    if (event.type === "weekend") continue;
    const category = getEventCategory(event.type);
    const color = category.color || getDefaultEventColor(event.type);
    if (color && !colors.includes(color)) colors.push(color);
    if (colors.length === 4) break;
  }
  return colors;
}

function getDefaultEventColor(type) {
  const map = {
    exam: "#dc2626",
    deadline: "#7c3aed",
    review: "#0891b2",
    personal: "#2563eb",
    academic: "#b45309",
    holiday: "#b91c1c",
    project: "#d97706",
    sport: "#0284c7",
    community: "#7e22ce"
  };
  return map[type] || state.settings.profile.accentColor;
}

function getPrimaryEventType(dayEvents) {
  if (!dayEvents.length) return "";
  return EVENT_PRIORITY.find((type) => dayEvents.some((event) => event.type === type)) || dayEvents[0].type;
}

function clearSelectedDay() {
  const existingEvents = ensureDay(selectedDate).customEvents;
  state.days[selectedDate] = {
    subjects: Object.fromEntries(subjects.map((subject) => [subject.name, 0])),
    notes: "",
    rating: 0,
    customEvents: existingEvents,
    extra: Object.fromEntries(EXTRA_TRACKS.map((track) => [track.key, 0]))
  };
  persist();
  renderSelectedDay();
  showToast("Día vaciado.");
}

function renderStats() {
  const keys = getStatsRangeKeys();
  const totalsBySubject = Object.fromEntries(subjects.map((subject) => [subject.name, 0]));
  const totalsByTrack = Object.fromEntries(EXTRA_TRACKS.map((track) => [track.key, 0]));

  let totalHours = 0;
  let totalStudy = 0;
  let totalTracks = 0;
  let weightedLoad = 0;
  let activeDays = 0;
  let best = { key: null, total: 0 };
  let ratedDays = 0;
  let totalRating = 0;

  for (const key of keys) {
    const day = ensureDay(key);
    const studyTotal = getStudyTotal(key);
    const trackTotal = getTrackTotal(key);
    const dayTotal = studyTotal + trackTotal;

    totalHours += dayTotal;
    totalStudy += studyTotal;
    totalTracks += trackTotal;

    if (dayTotal > 0) activeDays++;
    if (studyTotal > best.total) best = { key, total: studyTotal };

    for (const track of EXTRA_TRACKS) {
      totalsByTrack[track.key] += day.extra[track.key] || 0;
    }

    for (const subject of subjects) {
      const subjectHours = day.subjects[subject.name] || 0;
      totalsBySubject[subject.name] += subjectHours;
      weightedLoad += subjectHours * getSubjectDifficulty(subject.name);
    }

    const rating = day.rating || 0;
    if (rating > 0) {
      ratedDays++;
      totalRating += rating;
    }
  }

  const topSubject = subjects
    .map((subject) => ({ name: subject.name, total: totalsBySubject[subject.name] }))
    .sort((a, b) => b.total - a.total)[0];
  const topTrack = EXTRA_TRACKS
    .map((track) => ({ label: track.label, total: totalsByTrack[track.key], activeDays: countActiveTrackDays(keys, track.key) }))
    .sort((a, b) => b.total - a.total || b.activeDays - a.activeDays)[0];
  const currentStreak = calculateCurrentStreak(keys, getTodayDateKey());
  const averageRating = ratedDays > 0 ? totalRating / ratedDays : 0;
  const elapsedDays = Math.max(1, keys.length);

  grandTotalEl.textContent = `${formatNumber(totalHours)} h`;
  weightedLoadEl.textContent = `${formatNumber(weightedLoad)}`;
  avgPerDayEl.textContent = `${formatNumber(totalHours / elapsedDays)} h`;
  avgActiveDayEl.textContent = activeDays ? `${formatNumber(totalHours / activeDays)} h` : "0 h";
  bestDayEl.textContent = best.key ? `${formatShortDate(best.key)} (${formatNumber(best.total)} h)` : "-";
  streakEl.textContent = `${currentStreak} días`;
  studyFocusEl.textContent = totalHours ? `${formatNumber((totalStudy / totalHours) * 100)}%` : "0%";
  hobbyFocusEl.textContent = totalHours ? `${formatNumber((totalTracks / totalHours) * 100)}%` : "0%";
  topSubjectEl.textContent = topSubject && topSubject.total > 0 ? `${topSubject.name} (${formatNumber(topSubject.total)} h)` : "-";
  topTrackEl.textContent = topTrack && topTrack.total > 0 ? `${topTrack.label} (${formatNumber(topTrack.total)} h)` : "-";

  if (ratedDays > 0) {
    const full = Math.round(averageRating);
    avgRatingEl.textContent = `${"★".repeat(full)}${"☆".repeat(5 - full)}  ${formatNumber(averageRating)}`;
  } else {
    avgRatingEl.textContent = "—";
  }

  latestStats = {
    keys,
    rangeStart: keys[0] || null,
    rangeEnd: keys[keys.length - 1] || null,
    elapsedDays,
    totalsBySubject,
    totalsByTrack,
    totalHours,
    totalStudy,
    totalTracks,
    weightedLoad,
    activeDays,
    inactiveDays: elapsedDays - activeDays,
    best,
    ratedDays,
    averageRating,
    topSubject,
    topTrack,
    currentStreak
  };

  renderSubjectChart(totalsBySubject);
  renderRatingsChart(keys);
  renderBalanceChart(totalStudy, totalsByTrack, totalHours);
}

function renderSubjectChart(totalsBySubject) {
  subjectChartEl.innerHTML = "";
  const ranking = subjects
    .map((subject) => ({ ...subject, total: totalsBySubject[subject.name] }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, "es-ES"));
  const max = Math.max(1, ...ranking.map((subject) => subject.total));

  for (const [index, subject] of ranking.entries()) {
    const total = subject.total;
      const difficulty = getSubjectDifficulty(subject.name);
      const row = document.createElement("div");
      row.className = "bar-row";
      row.innerHTML = `
      <span class="bar-label"><span class="bar-rank">#${index + 1}</span><span>${subject.name}</span><small>Dif. ${difficulty}</small></span>
      <span class="bar-track"><span class="bar-fill" style="background:${subject.color}; width:${(total / max) * 100}%"></span></span>
      <span class="bar-value">${formatNumber(total)} h</span>
    `;
    subjectChartEl.appendChild(row);
  }
}

function renderRatingsChart(keys) {
  ratingsChartEl.innerHTML = "";
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let maxCount = 0;

  for (const key of keys) {
    const rating = state.days[key]?.rating || 0;
    if (rating >= 1 && rating <= 5) {
      counts[rating]++;
    }
  }

  for (let i = 1; i <= 5; i++) {
    if (counts[i] > maxCount) {
      maxCount = counts[i];
    }
  }

  maxCount = Math.max(1, maxCount);

  // We can render this as horizontal bars for simplicity and clarity matching the rest, 
  // or a series of circular elements if we style it as circles. 
  // Given user asked for "circulitos", we can do a row of flex items where each is a circle or we can do bars with star icons.
  // The user said: "lo de los circulitos que dices puede estar bien".
  // Let's create small horizontal bars but with a nice style, or circles.
  // Actually, horizontal bars with the stars on the left and a track with a colored fill looks great.
  // Let's use the .bar-row style used in subject chart, but adapt it.
  
  const colors = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"];

  for (let i = 5; i >= 1; i--) {
    const count = counts[i];
    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <span class="bar-label" style="display: flex; gap: 4px; color: ${colors[i-1]}; font-size: 1.1rem; min-width: 80px;">${"★".repeat(i)}</span>
      <span class="bar-track"><span class="bar-fill" style="background:${colors[i-1]}; width:${(count / maxCount) * 100}%"></span></span>
      <span class="bar-value">${count} ${count === 1 ? 'día' : 'días'}</span>
    `;
    ratingsChartEl.appendChild(row);
  }
}

function renderBalanceChart(totalStudy, totalsByTrack, totalHours) {
  balanceChartEl.innerHTML = "";

  const parts = [
    { label: "Estudio", value: totalStudy, color: state.settings.profile.accentColor },
    ...EXTRA_TRACKS.map((track) => ({ label: track.label, value: totalsByTrack[track.key] || 0, color: track.color }))
  ];

  for (const part of parts) {
    const value = part.value;
    const ratio = totalHours > 0 ? (value / totalHours) * 100 : 0;
    const row = document.createElement("div");
    row.className = "balance-row";
    row.innerHTML = `
      <span class="balance-label">${part.label}</span>
      <span class="balance-track"><span class="balance-fill" style="width:${ratio}%; background:${part.color}"></span></span>
      <span class="balance-value">${formatNumber(value)} h (${formatNumber(ratio)}%)</span>
    `;
    balanceChartEl.appendChild(row);
  }
}

function openAdvancedStats() {
  if (!latestStats) renderStats();
  renderAdvancedStats();
  advancedStatsModalEl.hidden = false;
}

function closeAdvancedStats() {
  advancedStatsModalEl.hidden = true;
}

function renderAdvancedStats() {
  const stats = latestStats;
  if (!stats) return;

  const subjectRanking = subjects
    .map((subject) => ({
      name: subject.name,
      total: stats.totalsBySubject[subject.name] || 0,
      difficulty: getSubjectDifficulty(subject.name)
    }))
    .sort((a, b) => b.total - a.total || b.difficulty - a.difficulty);

  const trackRanking = EXTRA_TRACKS
    .map((track) => ({
      label: track.label,
      total: stats.totalsByTrack[track.key] || 0,
      activeDays: countActiveTrackDays(stats.keys, track.key)
    }))
    .sort((a, b) => b.total - a.total || b.activeDays - a.activeDays);

  const topSubjectShare = stats.totalStudy && subjectRanking[0] ? (subjectRanking[0].total / stats.totalStudy) * 100 : 0;
  const studyShare = stats.totalHours ? (stats.totalStudy / stats.totalHours) * 100 : 0;
  const trackShare = stats.totalHours ? (stats.totalTracks / stats.totalHours) * 100 : 0;
  const activeRatio = (stats.activeDays / stats.elapsedDays) * 100;
  const weekdayStats = getWeekdayStats(stats.keys);
  const weekdayStudyRanking = weekdayStats
    .slice()
    .sort((a, b) => b.studyActiveDays - a.studyActiveDays || b.study - a.study || b.total - a.total);
  const bestWeekday = weekdayStats.slice().sort((a, b) => b.total - a.total)[0];
  const mostActiveWeekday = weekdayStats.slice().sort((a, b) => b.activeDays - a.activeDays || b.total - a.total)[0];
  const weightedSubjectRanking = subjectRanking
    .map((item) => ({ ...item, weighted: item.total * item.difficulty }))
    .sort((a, b) => b.weighted - a.weighted || b.total - a.total);
  const riskRanking = buildSubjectRiskRanking(subjectRanking);
  const highestRisk = riskRanking[0];
  const bestCovered = riskRanking
    .slice()
    .sort((a, b) => a.score - b.score || b.coverage - a.coverage)[0];
  const highRiskCount = riskRanking.filter((item) => item.score >= 70).length;
  const neglectedSubjects = subjectRanking.filter((item) => item.total === 0).length;
  const studiedSubjects = subjectRanking.filter((item) => item.total > 0).length;
  const usefulRatedDays = stats.ratedDays ? `${stats.ratedDays} días (${formatNumber((stats.ratedDays / Math.max(1, stats.activeDays)) * 100)}% de los activos)` : "sin valoraciones";

  advancedStatsContentEl.innerHTML = `
    <div class="advanced-grid">
      ${renderAdvancedCard("Ritmo", [
        `Has registrado ${formatNumber(stats.totalHours)} h en ${stats.activeDays} días activos.`,
        `Media real: ${formatNumber(stats.totalHours / stats.elapsedDays)} h/día. Media cuando haces algo: ${stats.activeDays ? formatNumber(stats.totalHours / stats.activeDays) : "0"} h.`,
        `Días sin actividad registrada: ${stats.inactiveDays}; racha académica actual: ${stats.currentStreak} días.`
      ])}
      ${renderAdvancedCard("Estudio y hobbies", [
        `Estudio: ${formatNumber(stats.totalStudy)} h (${formatNumber(studyShare)}%).`,
        `Hobbies: ${formatNumber(stats.totalTracks)} h (${formatNumber(trackShare)}%).`,
        `Actividad en ${formatNumber(activeRatio)}% de los días transcurridos.`
      ])}
      ${renderAdvancedCard("Asignaturas", subjectRanking.length ? [
        `Dominante: ${subjectRanking[0]?.total > 0 ? `${escapeHtml(subjectRanking[0].name)} con ${formatNumber(subjectRanking[0].total)} h` : "todavía sin horas"}.`,
        `Concentración principal: ${formatNumber(topSubjectShare)}% del estudio; ${studiedSubjects}/${subjectRanking.length} asignaturas tocadas.`,
        `Carga ponderada acumulada: ${formatNumber(stats.weightedLoad)}.`
      ] : ["No hay asignaturas configuradas."])}
      ${renderAdvancedCard("Hobbies", trackRanking.length ? [
        `Hobby dominante: ${trackRanking[0]?.total > 0 ? `${escapeHtml(trackRanking[0].label)} con ${formatNumber(trackRanking[0].total)} h` : "todavía sin horas"}.`,
        `Mayor constancia: ${getMostConsistentTrackText(trackRanking)}.`,
        `${trackRanking.length} hobbies configurados.`
      ] : ["No hay hobbies configurados."])}
      ${renderAdvancedCard("Semana", [
        `Día con más horas: ${bestWeekday ? `${bestWeekday.label} (${formatNumber(bestWeekday.total)} h)` : "-"}.`,
        `Día más constante: ${mostActiveWeekday ? `${mostActiveWeekday.label} (${mostActiveWeekday.activeDays} días activos)` : "-"}.`,
        `Valoraciones registradas: ${usefulRatedDays}.`
      ])}
      ${renderAdvancedCard("Riesgos", [
        highestRisk ? `Mayor riesgo: ${escapeHtml(highestRisk.name)} (${formatNumber(highestRisk.score)}/100), ${highestRisk.examText}.` : "No hay asignaturas para evaluar.",
        bestCovered ? `Mejor cubierta: ${escapeHtml(bestCovered.name)} (${formatNumber(bestCovered.coverage)}% del objetivo estimado).` : `Asignaturas sin tocar: ${neglectedSubjects}.`,
        `${highRiskCount} asignaturas en riesgo alto; ${neglectedSubjects} asignaturas sin tocar.`
      ])}
    </div>
    <div class="advanced-lists">
      ${renderRankingList("Ranking de asignaturas", subjectRanking.map((item) => ({
        label: item.name,
        meta: `Dif. ${item.difficulty}`,
        value: `${formatNumber(item.total)} h`
      })))}
      ${renderRankingList("Ranking de hobbies", trackRanking.map((item) => ({
        label: item.label,
        meta: `${item.activeDays} días`,
        value: `${formatNumber(item.total)} h`
      })))}
      ${renderRankingList("Días de la semana", weekdayStudyRanking.map((item) => ({
        label: item.label,
        meta: `${item.studyActiveDays} con estudio`,
        value: `${formatNumber(item.total)} h`
      })))}
      ${renderRankingList("Asignaturas por carga ponderada", weightedSubjectRanking
        .map((item) => ({
          label: item.name,
          meta: `Dif. ${item.difficulty}`,
          value: `${formatNumber(item.weighted)} carga`
        })))}
      ${renderRankingList("Riesgo académico", riskRanking.map((item) => ({
        label: item.name,
        meta: `Dif. ${item.difficulty} · ${item.examText} · ${formatNumber(item.total)} h`,
        value: `${formatNumber(item.score)}/100`
      })))}
    </div>
    <div class="advanced-card advanced-wide">
      <h3>Lectura rápida</h3>
      <ul>${buildImprovementTips(stats, subjectRanking, trackRanking, studyShare).map((tip) => `<li>${tip}</li>`).join("")}</ul>
    </div>
  `;
}

function renderAdvancedCard(title, lines) {
  return `
    <article class="advanced-card">
      <h3>${title}</h3>
      ${lines.map((line) => `<p>${line}</p>`).join("")}
    </article>
  `;
}

function renderRankingList(title, rows) {
  const content = rows.length
    ? rows.map((row, index) => `
        <li>
          <span><b>#${index + 1}</b> ${escapeHtml(row.label)} <small>${escapeHtml(row.meta)}</small></span>
          <strong>${escapeHtml(row.value)}</strong>
        </li>
      `).join("")
    : `<li><span>Sin datos configurados</span><strong>-</strong></li>`;

  return `
    <article class="advanced-card">
      <h3>${title}</h3>
      <ol class="advanced-ranking">${content}</ol>
    </article>
  `;
}

function getMostConsistentTrackText(trackRanking) {
  const best = trackRanking.slice().sort((a, b) => b.activeDays - a.activeDays || b.total - a.total)[0];
  if (!best || best.activeDays <= 0) return "todavía no hay constancia registrada";
  return `${escapeHtml(best.label)} (${best.activeDays} días)`;
}

function buildSubjectRiskRanking(subjectRanking) {
  const todayKey = getTodayDateKey();
  return subjectRanking
    .map((subject) => {
      const exam = getNextSubjectExam(subject.name, todayKey);
      const targetHours = Math.max(4, subject.difficulty * 4);
      const coverage = Math.min(140, (subject.total / targetHours) * 100);
      const missingRatio = Math.max(0, 1 - subject.total / targetHours);
      const urgency = getExamUrgency(exam?.daysUntil);
      const score = Math.min(100, Math.max(0, subject.difficulty * 10 + missingRatio * 45 + urgency * 35));

      return {
        ...subject,
        score,
        targetHours,
        coverage,
        exam,
        examText: formatRiskExamText(exam)
      };
    })
    .sort((a, b) => {
      const aDays = a.exam ? a.exam.daysUntil : Number.POSITIVE_INFINITY;
      const bDays = b.exam ? b.exam.daysUntil : Number.POSITIVE_INFINITY;
      return b.score - a.score || aDays - bDays || b.difficulty - a.difficulty;
    });
}

function getNextSubjectExam(subjectName, fromKey) {
  const matches = [];
  const allEventDates = new Set([...Object.keys(events), ...Object.keys(state.days || {})]);
  for (const key of allEventDates) {
    if (key < fromKey) continue;
    const dayEvents = [
      ...getVisibleStaticEvents(key).map(({ event }) => event),
      ...(state.days[key]?.customEvents || [])
    ];
    for (const event of dayEvents) {
      if (event.type === "exam" && eventMatchesSubjectEvent(event, subjectName)) {
        matches.push({
          key,
          text: event.text,
          daysUntil: Math.max(0, Math.round((parseKey(key) - parseKey(fromKey)) / 86400000))
        });
      }
    }
  }

  return matches.sort((a, b) => a.key.localeCompare(b.key))[0] || null;
}

function eventMatchesSubjectEvent(event, subjectName) {
  if (event.subjectName) {
    return normalizeSearchText(event.subjectName) === normalizeSearchText(subjectName);
  }
  return eventMatchesSubject(event.text, subjectName);
}

function eventMatchesSubject(text, subjectName) {
  const normalizedText = normalizeSearchText(text);
  return getSubjectSearchTerms(subjectName).some((term) => normalizedText.includes(term));
}

function getSubjectSearchTerms(subjectName) {
  const normalizedName = normalizeSearchText(subjectName);
  const aliases = {
    "sistemas de bases de datos": ["sbd", "bases de datos", "sistemas de bases de datos"],
    "sistemas operativos ii": ["ssooii", "sistemas operativos 2", "sistemas operativos ii"],
    "inf teorica": ["it", "informatica teorica", "inf teorica"],
    "eda ii": ["eda ii", "estructura de datos", "algoritmos 2"],
    "calculo": ["calculo"],
    "inso i": ["inso", "ingenieria del software"]
  };
  if (aliases[normalizedName]) return aliases[normalizedName];

  const fallbackTerms = normalizedName.split(" ").filter((word) => word.length > 3);
  return [normalizedName, ...fallbackTerms].filter(Boolean);
}

function getExamUrgency(daysUntil) {
  if (typeof daysUntil !== "number") return 0.2;
  if (daysUntil <= 2) return 1;
  if (daysUntil <= 7) return 0.85;
  if (daysUntil <= 14) return 0.65;
  if (daysUntil <= 30) return 0.45;
  return 0.25;
}

function formatRiskExamText(exam) {
  if (!exam) return "sin examen próximo";
  if (exam.daysUntil === 0) return "examen hoy";
  if (exam.daysUntil === 1) return "examen mañana";
  return `examen en ${exam.daysUntil} días`;
}

function normalizeSearchText(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getWeekdayStats(keys) {
  const labels = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const stats = labels.map((label) => ({ label, total: 0, study: 0, hobbies: 0, activeDays: 0, studyActiveDays: 0 }));

  for (const key of keys) {
    const index = parseKey(key).getDay();
    const study = getStudyTotal(key);
    const hobbies = getTrackTotal(key);
    const total = study + hobbies;
    stats[index].total += total;
    stats[index].study += study;
    stats[index].hobbies += hobbies;
    if (total > 0) stats[index].activeDays++;
    if (study > 0) stats[index].studyActiveDays++;
  }

  return [stats[1], stats[2], stats[3], stats[4], stats[5], stats[6], stats[0]];
}

function buildImprovementTips(stats, subjectRanking, trackRanking, studyShare) {
  const tips = [];
  const lowSubjects = subjectRanking.filter((item) => item.total === 0).slice(0, 2);
  const topSubject = subjectRanking[0];
  const topTrack = trackRanking[0];
  const touchedSubjects = subjectRanking.filter((item) => item.total > 0).length;
  const heavyDifficultyWithoutTime = subjectRanking
    .filter((item) => item.difficulty >= 4 && item.total < Math.max(1, stats.totalStudy / Math.max(1, subjectRanking.length) * 0.5))
    .slice(0, 2);

  if (lowSubjects.length) {
    tips.push(`Asignaturas sin horas: ${lowSubjects.map((item) => escapeHtml(item.name)).join(", ")}. Conviene meterles aunque sea un bloque corto para que no desaparezcan del radar.`);
  }

  if (heavyDifficultyWithoutTime.length) {
    tips.push(`Hay asignaturas difíciles con poco peso (${heavyDifficultyWithoutTime.map((item) => escapeHtml(item.name)).join(", ")}). Priorízalas antes de que se acumulen.`);
  }

  if (topSubject && stats.totalStudy > 0 && topSubject.total / stats.totalStudy > 0.45) {
    tips.push(`${escapeHtml(topSubject.name)} concentra demasiado estudio. Si no es por un examen cercano, reparte algo más para evitar abandonar el resto.`);
  }

  if (subjectRanking.length && touchedSubjects / subjectRanking.length < 0.6) {
    tips.push(`Solo has tocado ${touchedSubjects}/${subjectRanking.length} asignaturas. Un reparto mínimo semanal puede darte mejor control del calendario.`);
  }

  if (studyShare < 60 && stats.totalHours > 0) {
    tips.push(`El peso de estudio está por debajo del 60%. Si estás en periodo fuerte, sube el foco académico o separa mejor hobbies de días de estudio.`);
  } else if (studyShare > 90 && stats.totalTracks > 0) {
    tips.push(`El calendario está muy cargado hacia estudio. Mantener algo de hobbies puede ayudar a sostener ritmo sin quemarte.`);
  }

  if (topTrack && topTrack.total > 0) {
    tips.push(`Tu hobby más presente es ${escapeHtml(topTrack.label)}. Úsalo como indicador de equilibrio: muchas horas ahí pueden ser descanso útil o una fuga, según la semana.`);
  }

  if (stats.inactiveDays > stats.activeDays && stats.totalHours > 0) {
    tips.push(`Hay más días sin actividad que activos. Una meta mínima diaria de 25-30 minutos puede mejorar continuidad sin depender de días enormes.`);
  }

  if (stats.ratedDays < Math.max(3, stats.activeDays / 4)) {
    tips.push(`Hay pocas valoraciones del día. Puntuar más días ayuda a cruzar horas con sensación real de rendimiento.`);
  }

  if (!tips.length) {
    tips.push("El reparto está razonablemente equilibrado. El siguiente paso útil es comparar valoración diaria con horas para detectar qué tipo de día te funciona mejor.");
  }

  return tips;
}

function openSettings() {
  renderSettings();
  settingsModalEl.hidden = false;
}

function closeSettings() {
  settingsModalEl.hidden = true;
  closeSubjectEntry();
  closeTrackEntry();
  closeEventEntry();
  closeRangeEntry();
  closeAdvancedStats();
}

function openSubjectEntry() {
  subjectSettingsFormEl.reset();
  newSubjectColorEl.value = "#0f766e";
  subjectEntryModalEl.hidden = false;
  newSubjectNameEl.focus();
}

function closeSubjectEntry() {
  subjectEntryModalEl.hidden = true;
}

function openTrackEntry() {
  trackSettingsFormEl.reset();
  newTrackColorEl.value = "#d97706";
  trackEntryModalEl.hidden = false;
  newTrackNameEl.focus();
}

function closeTrackEntry() {
  trackEntryModalEl.hidden = true;
}

function openRangeEntry(direction) {
  pendingRangeExtension = direction;
  const isPrevious = direction === "prev";
  rangeEntryTextEl.textContent = isPrevious
    ? `Has llegado a ${formatDateLong(getCalendarStart())}. Puedes precargar un año anterior para seguir navegando.`
    : `Has llegado a ${formatDateLong(getCalendarEnd())}. Puedes precargar un año siguiente para seguir navegando.`;
  rangeEntryConfirmBtn.textContent = isPrevious ? "Precargar año anterior" : "Precargar año siguiente";
  rangeEntryModalEl.hidden = false;
}

function closeRangeEntry() {
  rangeEntryModalEl.hidden = true;
}

function extendCalendarRange() {
  const range = state.settings.calendarRange;
  if (pendingRangeExtension === "prev") {
    const newStart = addYears(parseKey(range.start), -1);
    range.start = toDateKey(newStart);
  } else {
    const newEnd = addYears(parseKey(range.end), 1);
    range.end = toDateKey(newEnd);
  }

  state.settings.calendarRange = normalizeCalendarRange(range);
  saveState();
  applyProfile();
  closeRangeEntry();
  renderCalendar();
  renderStats();
  showToast("Rango ampliado.");
}

function renderSettings() {
  const profile = state.settings.profile;
  profileTitleEl.value = profile.title;
  profileAccentEl.value = profile.accentColor;
  [profileLevel1El, profileLevel2El, profileLevel3El, profileLevel4El].forEach((input, index) => {
    input.value = profile.intensityLevels[index];
  });
  renderSubjectsSettings();
  renderTracksSettings();
}

function renderSubjectsSettings() {
  subjectsSettingsListEl.innerHTML = "";
  if (!subjects.length) {
    subjectsSettingsListEl.innerHTML = `<div class="empty-state">Vacío.</div>`;
    return;
  }

  for (const subject of subjects) {
    const item = document.createElement("div");
    item.className = "settings-item";
    item.innerHTML = `
      <span class="settings-color" style="background:${subject.color}"></span>
      <span><strong>${escapeHtml(subject.name)}</strong><small>${escapeHtml(subject.description || "Sin descripción")} · Dif. ${getSubjectDifficulty(subject.name)}</small></span>
      <button type="button" class="notice-delete" data-delete-subject="${escapeHtml(subject.name)}">Eliminar</button>
    `;
    subjectsSettingsListEl.appendChild(item);
  }
}

function renderTracksSettings() {
  tracksSettingsListEl.innerHTML = "";
  if (!EXTRA_TRACKS.length) {
    tracksSettingsListEl.innerHTML = `<div class="empty-state">Vacío.</div>`;
    return;
  }

  for (const track of EXTRA_TRACKS) {
    const item = document.createElement("div");
    item.className = "settings-item";
    item.innerHTML = `
      <span class="settings-color" style="background:${track.color}"></span>
      <span><strong>${escapeHtml(track.label)}</strong><small>${escapeHtml(track.description || "Sin descripción")}</small></span>
      <button type="button" class="notice-delete" data-delete-track="${track.key}">Eliminar</button>
    `;
    tracksSettingsListEl.appendChild(item);
  }
}

function saveProfileSettings(event) {
  event.preventDefault();
  state.settings.profile = normalizeProfile({
    title: profileTitleEl.value,
    accentColor: profileAccentEl.value,
    intensityLevels: [profileLevel1El.value, profileLevel2El.value, profileLevel3El.value, profileLevel4El.value]
  });
  syncConfigFromState();
  applyProfile();
  persist();
  renderCalendar();
  showToast("Perfil guardado.");
}

function addSubjectFromSettings(event) {
  event.preventDefault();
  const name = newSubjectNameEl.value.trim();
  const description = newSubjectDescriptionEl.value.trim();
  if (!name || !description) return;
  if (subjects.some((subject) => subject.name.toLowerCase() === name.toLowerCase())) {
    showToast("Esa asignatura ya existe.");
    return;
  }

  state.settings.subjects.push({
    name,
    description,
    color: normalizeColor(newSubjectColorEl.value),
    defaultDifficulty: clampDifficulty(newSubjectDifficultyEl.value)
  });
  state.settings.subjectDifficulty[name] = clampDifficulty(newSubjectDifficultyEl.value);
  subjectSettingsFormEl.reset();
  newSubjectColorEl.value = "#0f766e";
  newSubjectDifficultyEl.value = "";
  closeSubjectEntry();
  refreshAfterConfigChange("Asignatura añadida.");
}

function addTrackFromSettings(event) {
  event.preventDefault();
  const label = newTrackNameEl.value.trim();
  const description = newTrackDescriptionEl.value.trim();
  if (!label) return;
  const key = createUniqueKey(slugifyCategory(label) || "hobby", EXTRA_TRACKS.map((track) => track.key));
  state.settings.tracks.push({
    key,
    label,
    description,
    shortLabel: getShortLabel(label),
    color: normalizeColor(newTrackColorEl.value)
  });
  trackSettingsFormEl.reset();
  newTrackColorEl.value = "#d97706";
  closeTrackEntry();
  refreshAfterConfigChange("Hobby añadido.");
}

function handleSubjectSettingsClick(event) {
  const button = event.target.closest("[data-delete-subject]");
  if (!button) return;
  const name = button.dataset.deleteSubject;
  const ok = confirm(`¿Estás seguro de que quieres eliminar toda la info de "${name}"? El paso no será reversible.`);
  if (!ok) return;
  state.settings.subjects = state.settings.subjects.filter((subject) => subject.name !== name);
  delete state.settings.subjectDifficulty[name];
  for (const day of Object.values(state.days)) {
    if (day.subjects) delete day.subjects[name];
  }
  refreshAfterConfigChange("Asignatura eliminada.");
}

function handleTrackSettingsClick(event) {
  const button = event.target.closest("[data-delete-track]");
  if (!button) return;
  const key = button.dataset.deleteTrack;
  const track = EXTRA_TRACKS.find((item) => item.key === key);
  const ok = confirm(`¿Estás seguro de que quieres eliminar toda la info de "${track?.label || key}"? El paso no será reversible.`);
  if (!ok) return;
  state.settings.tracks = state.settings.tracks.filter((item) => item.key !== key);
  for (const day of Object.values(state.days)) {
    if (day.extra) delete day.extra[key];
  }
  refreshAfterConfigChange("Hobby eliminado.");
}

function refreshAfterConfigChange(message) {
  syncConfigFromState();
  saveState();
  renderEventSubjectOptions();
  updateEventEntryFields();
  renderSubjectInputs();
  renderTrackInputs();
  renderSelectedDay();
  renderCalendar();
  renderStats();
  renderSettings();
  flashAutoSave();
  showToast(message);
}

function exportData() {
  const payload = {
    exportedAt: new Date().toISOString(),
    version: "v3-layout",
    range: { start: getCalendarStart(), end: getCalendarEnd() },
    subjects: subjects.map((subject) => ({ ...subject, difficulty: getSubjectDifficulty(subject.name) })),
    tracks: EXTRA_TRACKS,
    data: state
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "study-tracker-backup.json";
  link.click();
  URL.revokeObjectURL(url);
  showToast("Copia exportada.");
}

function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const importedState = parsed.data || parsed;
      if (!importedState.days || typeof importedState.days !== "object") {
        throw new Error("Formato no válido");
      }

      if (parsed.data && Array.isArray(parsed.subjects) && !Array.isArray(importedState.settings?.subjects)) {
        importedState.settings = importedState.settings || {};
        importedState.settings.subjects = parsed.subjects;
      }

      if (parsed.data && Array.isArray(parsed.tracks) && !Array.isArray(importedState.settings?.tracks)) {
        importedState.settings = importedState.settings || {};
        importedState.settings.tracks = parsed.tracks;
      }

      // Migrate static events from old exports into dynamic customEvents
      if (parsed.events && typeof parsed.events === "object") {
        for (const [date, eventsArray] of Object.entries(parsed.events)) {
          if (Array.isArray(eventsArray)) {
            importedState.days[date] = importedState.days[date] || {};
            importedState.days[date].customEvents = importedState.days[date].customEvents || [];
            
            for (const ev of eventsArray) {
              const exists = importedState.days[date].customEvents.some(e => e.text === ev.text && e.type === ev.type);
              if (!exists) {
                importedState.days[date].customEvents.push({
                  type: ev.type,
                  text: ev.text,
                  createdAt: new Date().toISOString()
                });
              }
            }
          }
        }
      }

      state = normalizeState(importedState);
      syncConfigFromState();
      applyProfile();
      renderEventTypeOptions();
      renderEventSubjectOptions();
      updateEventEntryFields();
      persist();
      renderSubjectInputs();
      renderTrackInputs();
      renderSettings();
      renderSelectedDay();
      showToast("Datos importados.");
    } catch {
      showToast("No se pudo importar el archivo.");
    } finally {
      importInput.value = "";
    }
  };

  reader.readAsText(file);
}

function getDayTotal(key) {
  return getStudyTotal(key) + getTrackTotal(key);
}

function getStudyTotal(key) {
  const day = ensureDay(key);
  return subjects.reduce((sum, subject) => sum + (Number(day.subjects[subject.name]) || 0), 0);
}

function getTrackTotal(key) {
  const day = ensureDay(key);
  return EXTRA_TRACKS.reduce((sum, track) => sum + (Number(day.extra[track.key]) || 0), 0);
}

function countActiveTrackDays(keys, trackKey) {
  if (!trackKey) return 0;
  return keys.filter((key) => (ensureDay(key).extra[trackKey] || 0) > 0).length;
}

function calculateCurrentStreak(keys, endKey = getTodayDateKey()) {
  const todayIndex = keys.indexOf(endKey);
  let endIndex = todayIndex >= 0 ? todayIndex : keys.length - 1;
  if (todayIndex >= 0 && getStudyTotal(endKey) <= 0) {
    endIndex = todayIndex - 1;
  }
  let streak = 0;
  for (let i = endIndex; i >= 0; i--) {
    if (getStudyTotal(keys[i]) <= 0) break;
    streak++;
  }
  return streak;
}

function getStatsRangeKeys() {
  const todayKey = getTodayDateKey();
  const rangeKeys = getDateRangeKeys().filter((key) => key <= todayKey);
  const firstRecordedKey = rangeKeys.find(hasRecordedDayData);
  if (!firstRecordedKey) return [];
  return rangeKeys.filter((key) => key >= firstRecordedKey);
}

function hasRecordedDayData(key) {
  const day = state.days[key];
  if (!day || typeof day !== "object") return false;

  const hasStudy = subjects.some((subject) => Number(day.subjects?.[subject.name]) > 0);
  const hasTrack = EXTRA_TRACKS.some((track) => Number(day.extra?.[track.key]) > 0 || Number(day[track.key]) > 0);
  const hasNotes = typeof day.notes === "string" && day.notes.trim().length > 0;
  const hasRating = Number(day.rating) > 0;
  const hasCustomEvents = Array.isArray(day.customEvents) && day.customEvents.length > 0;

  return hasStudy || hasTrack || hasNotes || hasRating || hasCustomEvents;
}

function getDateRangeKeys() {
  const keys = [];
  for (let date = parseKey(getCalendarStart()); toDateKey(date) <= getCalendarEnd(); date.setDate(date.getDate() + 1)) {
    keys.push(toDateKey(date));
  }
  return keys;
}

function getInitialSelectedDate() {
  if (TODAY_DATE < getCalendarStart()) return getCalendarStart();
  if (TODAY_DATE > getCalendarEnd()) return getCalendarEnd();
  return TODAY_DATE;
}

function getInitialVisibleMonth() {
  return startOfMonth(parseKey(selectedDate));
}

function getCalendarStart() {
  return state.settings.calendarRange.start;
}

function getCalendarEnd() {
  return state.settings.calendarRange.end;
}

function getTodayDateKey() {
  return toDateKey(new Date());
}

function normalizeHours(value) {
  const n = Number.parseFloat(String(value).replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(24, Math.round(n * 4) / 4);
}

function getIntensityClass(total) {
  const [l1, l2, l3, l4] = state.settings.profile.intensityLevels;
  if (total >= l4) return "level-4";
  if (total >= l3) return "level-3";
  if (total >= l2) return "level-2";
  if (total >= l1) return "level-1";
  return "";
}

function getIntensityColor(total) {
  const [l1, l2, l3, l4] = state.settings.profile.intensityLevels;
  const accent = state.settings.profile.accentColor;
  if (total >= l4) return accent;
  if (total >= l3) return mixColor(accent, "#ffffff", 0.38);
  if (total >= l2) return mixColor(accent, "#ffffff", 0.68);
  if (total >= l1) return mixColor(accent, "#ffffff", 0.86);
  return "#f9fafb";
}

function parseKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateLong(key) {
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(parseKey(key));
}

function formatShortDate(key) {
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(parseKey(key));
}

function formatWeekday(key) {
  return new Intl.DateTimeFormat("es-ES", { weekday: "long" }).format(parseKey(key));
}

function formatNumber(number) {
  return new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 }).format(Number(number) || 0);
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
  const month = new Intl.DateTimeFormat("es-ES", { month: "long" }).format(date);
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${date.getFullYear()}`;
}

function normalizeColor(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value)) ? String(value) : "#0f766e";
}

function normalizeIntensityLevels(values) {
  const normalized = values.map((value) => normalizeHours(value)).filter((value) => value > 0);
  while (normalized.length < 4) normalized.push(DEFAULT_PROFILE.intensityLevels[normalized.length]);
  return normalized.slice(0, 4).sort((a, b) => a - b);
}

function hexToSoftBackground(hex) {
  const normalized = normalizeColor(hex).slice(1);
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, 0.1)`;
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

function needsLightText(hex) {
  const { r, g, b } = hexToRgb(normalizeColor(hex));
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.42;
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
    .replace(/"/g, "&quot;");
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
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toastEl.classList.remove("show"), 2200);
}

function resetAllData() {
  if (confirm("Se borrarán todas las asignaturas, notas y eventos guardados hasta el momento. Se pondrá todo a cero.\n\nSe recomienda exportar una copia de seguridad antes.\n\n¿Estás seguro de que quieres continuar?")) {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
}

function renderEventLegend() {
  if (!eventLegendEl) return;
  const usedTypes = new Set();
  
  for (const day of Object.values(state.days)) {
    for (const ev of (day.customEvents || [])) {
      usedTypes.add(ev.type);
    }
  }
  for (const dateKey of Object.keys(events)) {
    for (const ev of getVisibleStaticEvents(dateKey)) {
      usedTypes.add(ev.event.type);
    }
  }
  
  if (state.customEventCategories) {
    for (const type of Object.keys(state.customEventCategories)) {
      usedTypes.add(type);
    }
  }

  eventLegendEl.innerHTML = "";
  for (const type of usedTypes) {
    if (type === "weekend") continue;
    const category = getEventCategory(type);
    const color = category.color || getDefaultEventColor(type);
    
    let bg = color;
    if (typeof hexToSoftBackground === "function" && color.startsWith("#")) {
      bg = hexToSoftBackground(color);
    } else {
      bg = "rgba(180, 83, 9, 0.12)";
    }
    
    const span = document.createElement("span");
    span.innerHTML = `<b class="event-line" style="border-left-color: ${color}; background: ${bg};"></b> ${escapeHtml(category.label.toLowerCase())}`;
    eventLegendEl.appendChild(span);
  }
}
