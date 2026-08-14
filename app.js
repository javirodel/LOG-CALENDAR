const APP_VERSION = "1.2.0";
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
let academicPeriods = [];

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

// Default clean configuration for new users
function getDefaultRoutineHabits() {
  return [];
}

if (!localStorage.getItem(STORAGE_KEY)) {
  if (!state.settings.subjects) {
    state.settings.subjects = [];
    state.settings.subjectDifficulty = {};
  }
  if (!state.settings.tracks) {
    state.settings.tracks = [];
  }
  if (!state.routineTracker) {
    state.routineTracker = { habits: [], monthlyChecks: {} };
  }
  saveState();
}

syncConfigFromState();
let selectedDate = getInitialSelectedDate();
let visibleMonth = getInitialVisibleMonth();
let calendarAnimated = false;
let statsRenderTimer = null;
let pendingRangeExtension = "next";
let latestStats = null;
let editingEventTarget = null;
let editingSubjectTarget = null;
let editingTrackTarget = null;
let editingTaskTarget = null;
let selectedStatsPeriodId = "all";
let editingPeriodTarget = null;
let selectedPreviewDateFilter = null;
function getTodayYearMonth() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

let routineActiveMonth = getTodayYearMonth();
let editingHabitTarget = null;

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

const openPeriodModalBtn = document.getElementById("openPeriodModalBtn");
const periodEntryModalEl = document.getElementById("periodEntryModal");
const periodEntryTitleEl = document.getElementById("periodEntryTitle");
const periodEntryCloseBtn = document.getElementById("periodEntryCloseBtn");
const periodSettingsFormEl = document.getElementById("periodSettingsForm");
const newPeriodNameEl = document.getElementById("newPeriodName");
const newPeriodStartEl = document.getElementById("newPeriodStart");
const newPeriodEndEl = document.getElementById("newPeriodEnd");
const periodSubjectsCheckboxesEl = document.getElementById("periodSubjectsCheckboxes");
const periodTracksCheckboxesEl = document.getElementById("periodTracksCheckboxes");
const periodsSettingsListEl = document.getElementById("periodsSettingsList");
const statsPeriodSelectEl = document.getElementById("statsPeriodSelect");
const generateReportBtn = document.getElementById("generateReportBtn");
const periodReportModalEl = document.getElementById("periodReportModal");
const periodReportCloseBtn = document.getElementById("periodReportCloseBtn");
const periodReportDoneBtn = document.getElementById("periodReportDoneBtn");
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
const grandTotalLabel = document.getElementById("grandTotalLabel");
const weightedLoadLabel = document.getElementById("weightedLoadLabel");
const avgPerDayLabel = document.getElementById("avgPerDayLabel");
const avgActiveDayLabel = document.getElementById("avgActiveDayLabel");
const bestDayLabel = document.getElementById("bestDayLabel");
const streakLabel = document.getElementById("streakLabel");
const studyFocusLabel = document.getElementById("studyFocusLabel");
const hobbyFocusLabel = document.getElementById("hobbyFocusLabel");
const topSubjectLabel = document.getElementById("topSubjectLabel");
const topTrackLabel = document.getElementById("topTrackLabel");
const avgRatingLabel = document.getElementById("avgRatingLabel");
const moreStatsBtn = document.getElementById("moreStatsBtn");
const subjectChartEl = document.getElementById("subjectChart");
const subjectChartPanel = document.getElementById("subjectChartPanel");
const hobbyFrequencyPanel = document.getElementById("hobbyFrequencyPanel");
const hobbyFrequencyChart = document.getElementById("hobbyFrequencyChart");
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

// Checklist DOM selectors
const tabCalendar = document.getElementById("tabCalendar");
const tabChecklist = document.getElementById("tabChecklist");
const paneCalendar = document.getElementById("paneCalendar");
const paneChecklistSelectedDay = document.getElementById("paneChecklistSelectedDay");
const paneCalendarDayDetails = document.getElementById("paneCalendarDayDetails");
const paneChecklistMain = document.getElementById("paneChecklistMain");
const checklistSelectedWeekdayEl = document.getElementById("checklistSelectedWeekday");
const checklistSelectedDateEl = document.getElementById("checklistSelectedDate");
const checklistAddFormEl = document.getElementById("checklistAddForm");
const checklistTaskTextEl = document.getElementById("checklistTaskText");
const checklistTaskLinkEl = document.getElementById("checklistTaskLink");
const checklistTaskDueDateEl = document.getElementById("checklistTaskDueDate");
const checklistTaskDifficultyEl = document.getElementById("checklistTaskDifficulty");
const checklistDayTasksListEl = document.getElementById("checklistDayTasksList");
const workspaceEl = document.querySelector(".workspace");
const addNewTaskBtn = document.getElementById("addNewTaskBtn");
const taskEntryModalEl = document.getElementById("taskEntryModal");
const taskEntryCloseBtn = document.getElementById("taskEntryCloseBtn");
const taskEntryTitleEl = document.getElementById("taskEntryTitle");
const taskFormEl = document.getElementById("taskForm");
const taskTextEl = document.getElementById("taskText");
const taskLinkEl = document.getElementById("taskLink");
const taskDueDateEl = document.getElementById("taskDueDate");
const taskDifficultyEl = document.getElementById("taskDifficulty");
const taskSubmitBtn = document.getElementById("taskSubmitBtn");
const checklistListEl = document.getElementById("checklistList");
const taskSearchInputEl = document.getElementById("taskSearchInput");
const filterSubjectEl = document.getElementById("filterSubject");
const filterStatusEl = document.getElementById("filterStatus");
const filterSortEl = document.getElementById("filterSort");
const totalTasksCountEl = document.getElementById("totalTasksCount");
const pendingTasksCountEl = document.getElementById("pendingTasksCount");
const completedTasksCountEl = document.getElementById("completedTasksCount");
const overdueTasksCountEl = document.getElementById("overdueTasksCount");
const completedPercentageEl = document.getElementById("completedPercentage");
const taskStatsChartEl = document.getElementById("taskStatsChart");
const dayTasksListEl = document.getElementById("dayTasksList");
const addDayTaskBtn = document.getElementById("addDayTaskBtn");

// Nuevos selectores del mini-calendario y filtros superpuestos
const checklistFiltersDropdown = document.getElementById("checklistFiltersDropdown");
const calendarPreviewGrid = document.getElementById("calendarPreviewGrid");
const dayFilterIndicator = document.getElementById("dayFilterIndicator");
const clearDayFilterBtn = document.getElementById("clearDayFilterBtn");
const prevPreviewMonthBtn = document.getElementById("prevPreviewMonthBtn");
const nextPreviewMonthBtn = document.getElementById("nextPreviewMonthBtn");

// Selectores para la descripción y el modal de detalles
const settingsTitleEl = document.getElementById("settingsTitle");
const checklistTaskDescriptionEl = document.getElementById("checklistTaskDescription");
const taskDescriptionEl = document.getElementById("taskDescription");
const settingsVersionIndicatorEl = document.getElementById("settingsVersionIndicator");

const taskDetailsModalEl = document.getElementById("taskDetailsModal");
const taskDetailsCloseBtn = document.getElementById("taskDetailsCloseBtn");
const taskDetailsTitleEl = document.getElementById("taskDetailsTitle");
const taskDetailsDescEl = document.getElementById("taskDetailsDesc");
const taskDetailsLinkEl = document.getElementById("taskDetailsLink");
const taskDetailsDifficultyEl = document.getElementById("taskDetailsDifficulty");
const taskDetailsDueDateEl = document.getElementById("taskDetailsDueDate");
const taskDetailsStatusTextEl = document.getElementById("taskDetailsStatusText");
const taskDetailsCheckboxEl = document.getElementById("taskDetailsCheckbox");
const taskDetailsDeleteBtn = document.getElementById("taskDetailsDeleteBtn");
const taskDetailsEditBtn = document.getElementById("taskDetailsEditBtn");
const taskDetailsOkBtn = document.getElementById("taskDetailsOkBtn");

let currentViewingTaskId = null;

// Mostrar versión en la esquina inferior derecha de los ajustes
if (settingsVersionIndicatorEl) {
  settingsVersionIndicatorEl.textContent = `LOG of growth • Versión ${APP_VERSION}`;
}

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
updateDynamicLabels();
if (typeof initRoutineTrackerEvents === "function") {
  initRoutineTrackerEvents();
}
if (typeof renderRoutineTracker === "function") {
  renderRoutineTracker();
}

if (statsPeriodSelectEl) {
  statsPeriodSelectEl.addEventListener("change", () => {
    selectedStatsPeriodId = statsPeriodSelectEl.value;
    renderStats();
  });
}

// Eventos del modal de detalles
if (taskDetailsCloseBtn) taskDetailsCloseBtn.addEventListener("click", closeTaskDetailsModal);
if (taskDetailsOkBtn) taskDetailsOkBtn.addEventListener("click", closeTaskDetailsModal);
if (taskDetailsModalEl) {
  taskDetailsModalEl.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-close-task-details")) closeTaskDetailsModal();
  });
}
if (taskDetailsCheckboxEl) {
  taskDetailsCheckboxEl.addEventListener("change", () => {
    if (currentViewingTaskId) {
      toggleTaskCompletion(currentViewingTaskId);
      const updatedTask = state.checklistTasks.find(t => t.id === currentViewingTaskId);
      if (updatedTask) {
        taskDetailsCheckboxEl.checked = updatedTask.completed;
        taskDetailsStatusTextEl.textContent = updatedTask.completed ? "Completada" : "Pendiente";
        taskDetailsStatusTextEl.style.color = updatedTask.completed ? "#16a34a" : "var(--muted)";
      }
    }
  });
}
if (taskDetailsDeleteBtn) {
  taskDetailsDeleteBtn.addEventListener("click", () => {
    if (currentViewingTaskId) {
      const taskId = currentViewingTaskId;
      deleteTask(taskId);
      if (!state.checklistTasks.some(t => t.id === taskId)) {
        closeTaskDetailsModal();
      }
    }
  });
}
if (taskDetailsEditBtn) {
  taskDetailsEditBtn.addEventListener("click", () => {
    if (currentViewingTaskId) {
      const task = state.checklistTasks.find(t => t.id === currentViewingTaskId);
      if (task) {
        closeTaskDetailsModal();
        openTaskEntry(task);
      }
    }
  });
}

if (typeof renderChecklistFilters === "function") {
  renderChecklistFilters();
}
if (typeof refreshChecklistAll === "function") {
  refreshChecklistAll();
}

const subjectsHeaderLabelEl = document.getElementById("subjectsHeaderLabel");
const settingsSubjectsTitleEl = document.getElementById("settingsSubjectsTitle");
const settingsTracksTitleEl = document.getElementById("settingsTracksTitle");

if (subjectsHeaderLabelEl) {
  subjectsHeaderLabelEl.addEventListener("dblclick", renameSubjectsPrompt);
}
if (settingsSubjectsTitleEl) {
  settingsSubjectsTitleEl.addEventListener("dblclick", renameSubjectsPrompt);
}
if (settingsTracksTitleEl) {
  settingsTracksTitleEl.addEventListener("dblclick", renameTracksPrompt);
}

clearDayBtn.addEventListener("click", clearSelectedDay);
if (exportBtn) exportBtn.addEventListener("click", exportData);
if (importInput) importInput.addEventListener("change", importData);
if (settingsBtn) settingsBtn.addEventListener("click", openSettings);
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
if (openPeriodModalBtn) openPeriodModalBtn.addEventListener("click", () => openPeriodEntry());
openEventModalBtn.addEventListener("click", () => openEventEntry());
eventEntryCloseBtn.addEventListener("click", closeEventEntry);
eventEntryModalEl.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-event")) closeEventEntry();
});
subjectEntryCloseBtn.addEventListener("click", closeSubjectEntry);
trackEntryCloseBtn.addEventListener("click", closeTrackEntry);
if (periodEntryCloseBtn) periodEntryCloseBtn.addEventListener("click", closePeriodEntry);
subjectEntryModalEl.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-entry")) closeSubjectEntry();
});
trackEntryModalEl.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-entry")) closeTrackEntry();
});
if (periodEntryModalEl) {
  periodEntryModalEl.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-close-period-modal")) closePeriodEntry();
  });
}
if (generateReportBtn) generateReportBtn.addEventListener("click", openPeriodReportModal);
if (periodReportCloseBtn) periodReportCloseBtn.addEventListener("click", closePeriodReportModal);
if (periodReportDoneBtn) periodReportDoneBtn.addEventListener("click", closePeriodReportModal);
if (periodReportModalEl) {
  periodReportModalEl.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-close-report-modal")) closePeriodReportModal();
  });
}
const tabSummary = document.getElementById("tabReportSummary");
const tabSubjects = document.getElementById("tabReportSubjects");
const tabInsights = document.getElementById("tabReportInsights");
const tabBadges = document.getElementById("tabReportBadges");
if (tabSummary) tabSummary.addEventListener("click", () => switchReportTab("Summary"));
if (tabSubjects) tabSubjects.addEventListener("click", () => switchReportTab("Subjects"));
if (tabInsights) tabInsights.addEventListener("click", () => switchReportTab("Insights"));
if (tabBadges) tabBadges.addEventListener("click", () => switchReportTab("Badges"));
const sortRepHours = document.getElementById("sortRepSubjectsHours");
const sortRepName = document.getElementById("sortRepSubjectsName");
if (sortRepHours) sortRepHours.addEventListener("click", () => {
  sortRepHours.classList.add("active");
  sortRepName.classList.remove("active");
  renderReportSubjectsBreakdown("hours");
});
if (sortRepName) sortRepName.addEventListener("click", () => {
  sortRepName.classList.add("active");
  sortRepHours.classList.remove("active");
  renderReportSubjectsBreakdown("name");
});
rangeEntryCloseBtn.addEventListener("click", closeRangeEntry);
rangeEntryConfirmBtn.addEventListener("click", extendCalendarRange);
rangeEntryModalEl.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-range")) closeRangeEntry();
});
eventFormEl.addEventListener("submit", addCustomEvent);
eventTypeEl.addEventListener("change", () => {
  if (eventTypeEl.value === "exam" && eventSubjectEl.value === "") {
    if (subjects.length) {
      eventSubjectEl.value = subjects[0].name;
    } else {
      eventSubjectEl.value = "__new_subject__";
    }
  }
  updateEventEntryFields();
});
eventSubjectEl.addEventListener("change", updateEventEntryFields);
profileFormEl.addEventListener("submit", saveProfileSettings);
subjectSettingsFormEl.addEventListener("submit", addSubjectFromSettings);
trackSettingsFormEl.addEventListener("submit", addTrackFromSettings);
if (periodSettingsFormEl) periodSettingsFormEl.addEventListener("submit", saveAcademicPeriod);
subjectsSettingsListEl.addEventListener("click", handleSubjectSettingsClick);
tracksSettingsListEl.addEventListener("click", handleTrackSettingsClick);
if (periodsSettingsListEl) periodsSettingsListEl.addEventListener("click", handlePeriodSettingsClick);

// Checklist View and Form Listeners
if (tabCalendar && tabChecklist) {
  tabCalendar.addEventListener("click", () => switchView("calendar"));
  tabChecklist.addEventListener("click", () => switchView("checklist"));
}
if (addNewTaskBtn) addNewTaskBtn.addEventListener("click", () => openTaskEntry());
if (addDayTaskBtn) addDayTaskBtn.addEventListener("click", () => openTaskEntry(null, selectedDate));
if (taskEntryCloseBtn) taskEntryCloseBtn.addEventListener("click", closeTaskEntry);
if (taskEntryModalEl) {
  taskEntryModalEl.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-close-task")) closeTaskEntry();
  });
}
if (taskFormEl) taskFormEl.addEventListener("submit", saveTask);
if (taskSearchInputEl) taskSearchInputEl.addEventListener("input", renderChecklist);
if (filterSubjectEl) filterSubjectEl.addEventListener("change", renderChecklist);
if (filterStatusEl) filterStatusEl.addEventListener("change", renderChecklist);
if (filterSortEl) filterSortEl.addEventListener("change", renderChecklist);
if (checklistListEl) checklistListEl.addEventListener("click", handleChecklistClick);
if (dayTasksListEl) dayTasksListEl.addEventListener("click", handleDayTasksClick);
if (checklistAddFormEl) checklistAddFormEl.addEventListener("submit", saveChecklistInPageTask);
if (checklistDayTasksListEl) checklistDayTasksListEl.addEventListener("click", handleDayTasksClick);

// Control de apertura del panel de filtros superpuesto y clicks fuera
if (taskSearchInputEl && checklistFiltersDropdown) {
  taskSearchInputEl.addEventListener("focus", () => {
    checklistFiltersDropdown.style.display = "flex";
  });
  const closeFiltersBtn = document.getElementById("closeFiltersBtn");
  if (closeFiltersBtn) {
    closeFiltersBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      checklistFiltersDropdown.style.display = "none";
      renderChecklist();
    });
  }
  if (typeof document.addEventListener === "function") {
    document.addEventListener("click", (event) => {
      const isClickInside = taskSearchInputEl.contains(event.target) || checklistFiltersDropdown.contains(event.target);
      if (!isClickInside) {
        checklistFiltersDropdown.style.display = "none";
      }
    });
  }
}

// Botón para limpiar filtro de día
if (clearDayFilterBtn) {
  clearDayFilterBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    selectedPreviewDateFilter = null;
    renderChecklistCalendarPreview();
    renderChecklist();
  });
}

// Botones de navegación del mini-calendario
if (prevPreviewMonthBtn) {
  prevPreviewMonthBtn.addEventListener("click", () => {
    previewVisibleMonth = addMonths(previewVisibleMonth, -1);
    renderChecklistCalendarPreview();
  });
}
if (nextPreviewMonthBtn) {
  nextPreviewMonthBtn.addEventListener("click", () => {
    previewVisibleMonth = addMonths(previewVisibleMonth, 1);
    renderChecklistCalendarPreview();
  });
}


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
  selectedStudyEl.textContent = `${state.settings.subjectsLabelPlural || "Asignaturas"}: ${formatNumber(getStudyTotal(selectedDate))} h`;
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

function renameSubjectsPrompt() {
  const oldPlural = state.settings.subjectsLabelPlural || "Asignaturas";
  const oldSingular = state.settings.subjectsLabelSingular || "Asignatura";
  const newPlural = prompt(`Introduce el nombre en PLURAL para reemplazar "${oldPlural}" (ej. Proyectos, Tareas):`, oldPlural);
  if (!newPlural || !newPlural.trim()) return;
  const newSingular = prompt(`Introduce el nombre en SINGULAR para reemplazar "${oldSingular}" (ej. Proyecto, Tarea):`, oldSingular);
  if (!newSingular || !newSingular.trim()) return;

  state.settings.subjectsLabelPlural = newPlural.trim();
  state.settings.subjectsLabelSingular = newSingular.trim();
  
  saveState();
  syncConfigFromState();
  updateDynamicLabels();
  renderSettings();
  renderSelectedDay();
  renderStats();
  showToast("Nombres actualizados.");
}

function renameTracksPrompt() {
  const oldPlural = state.settings.hobbiesLabelPlural || "Hobbies";
  const oldSingular = state.settings.hobbiesLabelSingular || "Hobby";
  const newPlural = prompt(`Introduce el nombre de Hobbies en PLURAL para reemplazar "${oldPlural}" (ej. Pasatiempos, Actividades):`, oldPlural);
  if (!newPlural || !newPlural.trim()) return;
  const newSingular = prompt(`Introduce el nombre de Hobbies en SINGULAR para reemplazar "${oldSingular}" (ej. Pasatiempo, Actividad):`, oldSingular);
  if (!newSingular || !newSingular.trim()) return;

  state.settings.hobbiesLabelPlural = newPlural.trim();
  state.settings.hobbiesLabelSingular = newSingular.trim();

  saveState();
  syncConfigFromState();
  updateDynamicLabels();
  renderSettings();
  renderSelectedDay();
  renderStats();
  showToast("Nombres actualizados.");
}

function updateDynamicLabels() {
  const subPlural = state.settings.subjectsLabelPlural || "Asignaturas";
  const subSingular = state.settings.subjectsLabelSingular || "Asignatura";
  const hobPlural = state.settings.hobbiesLabelPlural || "Hobbies";
  const hobSingular = state.settings.hobbiesLabelSingular || "Hobby";

  // Main Page elements
  const studyFocusLabelEl = document.getElementById("studyFocusLabel");
  if (studyFocusLabelEl) studyFocusLabelEl.textContent = `foco en ${subPlural.toLowerCase()}`;
  
  const hobbyFocusLabelEl = document.getElementById("hobbyFocusLabel");
  if (hobbyFocusLabelEl) hobbyFocusLabelEl.textContent = `foco en ${hobPlural.toLowerCase()}`;

  const topSubjectLabelEl = document.getElementById("topSubjectLabel");
  if (topSubjectLabelEl) topSubjectLabelEl.textContent = `${subSingular.toLowerCase()} dominante`;

  const topTrackLabelEl = document.getElementById("topTrackLabel");
  if (topTrackLabelEl) topTrackLabelEl.textContent = `${hobSingular.toLowerCase()} dominante`;

  const subjectChartTitleEl = document.getElementById("subjectChartTitle");
  if (subjectChartTitleEl) subjectChartTitleEl.textContent = `Horas por ${subSingular.toLowerCase()}`;

  const subjectsHeaderLabelEl = document.getElementById("subjectsHeaderLabel");
  if (subjectsHeaderLabelEl) {
    subjectsHeaderLabelEl.textContent = subPlural;
    subjectsHeaderLabelEl.title = `Doble click para renombrar las ${subPlural.toLowerCase()}`;
  }

  const streakLabelEl = document.getElementById("streakLabel");
  if (streakLabelEl) {
    streakLabelEl.textContent = `racha de días seguidos con ${subPlural.toLowerCase()}`;
  }

  // Settings elements
  const settingsSubjectsTitleEl = document.getElementById("settingsSubjectsTitle");
  if (settingsSubjectsTitleEl) {
    settingsSubjectsTitleEl.textContent = subPlural;
    settingsSubjectsTitleEl.title = `Doble click para renombrar las ${subPlural.toLowerCase()}`;
  }

  const settingsTracksTitleEl = document.getElementById("settingsTracksTitle");
  if (settingsTracksTitleEl) {
    settingsTracksTitleEl.textContent = hobPlural;
    settingsTracksTitleEl.title = `Doble click para renombrar los ${hobPlural.toLowerCase()}`;
  }

  const openSubjectModalBtnEl = document.getElementById("openSubjectModalBtn");
  if (openSubjectModalBtnEl) openSubjectModalBtnEl.textContent = `Añadir ${subSingular.toLowerCase()}`;

  const openTrackModalBtnEl = document.getElementById("openTrackModalBtn");
  if (openTrackModalBtnEl) openTrackModalBtnEl.textContent = `Añadir ${hobSingular.toLowerCase()}`;

  // Subject Entry Modal
  const subjectEntryEyebrowEl = document.getElementById("subjectEntryEyebrow");
  if (subjectEntryEyebrowEl) subjectEntryEyebrowEl.textContent = subPlural;

  const subjectEntryTitleEl = document.getElementById("subjectEntryTitle");
  if (subjectEntryTitleEl) {
    const isEditing = subjectEntryTitleEl.textContent.startsWith("Editar");
    subjectEntryTitleEl.textContent = isEditing ? `Editar ${subSingular.toLowerCase()}` : `Añadir ${subSingular.toLowerCase()}`;
  }

  const newSubjectNameEl = document.getElementById("newSubjectName");
  if (newSubjectNameEl) newSubjectNameEl.placeholder = `Nombre de la ${subSingular.toLowerCase()}`;

  const newSubjectDifficultyEl = document.getElementById("newSubjectDifficulty");
  if (newSubjectDifficultyEl) {
    newSubjectDifficultyEl.placeholder = `Añadir dificultad de la ${subSingular.toLowerCase()}`;
    newSubjectDifficultyEl.setAttribute("aria-label", `Dificultad de la ${subSingular.toLowerCase()}`);
  }

  const subjectSettingsFormSubmitBtn = document.querySelector('#subjectSettingsForm button[type="submit"]');
  if (subjectSettingsFormSubmitBtn) subjectSettingsFormSubmitBtn.textContent = `Añadir ${subSingular.toLowerCase()}`;

  // Track Entry Modal
  const trackEntryEyebrowEl = document.getElementById("trackEntryEyebrow");
  if (trackEntryEyebrowEl) trackEntryEyebrowEl.textContent = hobPlural;

  const trackEntryTitleEl = document.getElementById("trackEntryTitle");
  if (trackEntryTitleEl) {
    const isEditing = trackEntryTitleEl.textContent.startsWith("Editar");
    trackEntryTitleEl.textContent = isEditing ? `Editar ${hobSingular.toLowerCase()}` : `Añadir ${hobSingular.toLowerCase()}`;
  }

  const newTrackNameEl = document.getElementById("newTrackName");
  if (newTrackNameEl) newTrackNameEl.placeholder = `Nombre del ${hobSingular.toLowerCase()}`;

  const trackSettingsFormSubmitBtn = document.querySelector('#trackSettingsForm button[type="submit"]');
  if (trackSettingsFormSubmitBtn) trackSettingsFormSubmitBtn.textContent = `Añadir ${hobSingular.toLowerCase()}`;

  // Event Form elements
  const eventSubjectLabelEl = document.getElementById("eventSubjectLabel");
  if (eventSubjectLabelEl) eventSubjectLabelEl.textContent = `${subSingular} del evento`;

  const eventSubjectEl = document.getElementById("eventSubject");
  if (eventSubjectEl) eventSubjectEl.setAttribute("aria-label", `${subSingular} del evento`);

  const eventNewSubjectNameEl = document.getElementById("eventNewSubjectName");
  if (eventNewSubjectNameEl) eventNewSubjectNameEl.placeholder = `Nombre de la ${subSingular.toLowerCase()}`;
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

function getDefaultRoutineHabits() {
  return [];
}

function createFallbackState() {
  return {
    settings: {
      subjectsLabelPlural: "Asignaturas",
      subjectsLabelSingular: "Asignatura",
      hobbiesLabelPlural: "Hobbies",
      hobbiesLabelSingular: "Hobby",
      subjectDifficulty: getDefaultDifficultyMap(),
      profile: { ...DEFAULT_PROFILE },
      calendarRange: { start: INITIAL_START_DATE, end: INITIAL_END_DATE },
      subjects: DEFAULT_SUBJECTS.map((subject) => ({ ...subject })),
      tracks: DEFAULT_EXTRA_TRACKS.map((track) => ({ ...track })),
      academicPeriods: []
    },
    days: {},
    dismissedEvents: {},
    customEventCategories: {},
    checklistTasks: [],
    routineTracker: {
      habits: getDefaultRoutineHabits(),
      monthlyChecks: {}
    }
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
      subjectsLabelPlural: typeof candidate.settings.subjectsLabelPlural === "string" && candidate.settings.subjectsLabelPlural.trim() ? candidate.settings.subjectsLabelPlural.trim() : "Asignaturas",
      subjectsLabelSingular: typeof candidate.settings.subjectsLabelSingular === "string" && candidate.settings.subjectsLabelSingular.trim() ? candidate.settings.subjectsLabelSingular.trim() : "Asignatura",
      hobbiesLabelPlural: typeof candidate.settings.hobbiesLabelPlural === "string" && candidate.settings.hobbiesLabelPlural.trim() ? candidate.settings.hobbiesLabelPlural.trim() : "Hobbies",
      hobbiesLabelSingular: typeof candidate.settings.hobbiesLabelSingular === "string" && candidate.settings.hobbiesLabelSingular.trim() ? candidate.settings.hobbiesLabelSingular.trim() : "Hobby",
      subjectDifficulty: {
        ...normalized.settings.subjectDifficulty,
        ...(candidate.settings.subjectDifficulty || {})
      },
      profile: normalizeProfile(candidate.settings.profile),
      calendarRange: normalizeCalendarRange(candidate.settings.calendarRange),
      subjects: normalizeSubjects(candidate.settings.subjects),
      tracks: normalizeTracks(candidate.settings.tracks),
      academicPeriods: normalizeAcademicPeriods(candidate.settings.academicPeriods)
    };
  }

  if (candidate.dismissedEvents && typeof candidate.dismissedEvents === "object") {
    normalized.dismissedEvents = candidate.dismissedEvents;
  }

  if (candidate.customEventCategories && typeof candidate.customEventCategories === "object") {
    normalized.customEventCategories = candidate.customEventCategories;
  }

  if (Array.isArray(candidate.checklistTasks)) {
    normalized.checklistTasks = candidate.checklistTasks.map(normalizeTask).filter(Boolean);
  } else if (candidate.settings && Array.isArray(candidate.settings.checklistTasks)) {
    normalized.checklistTasks = candidate.settings.checklistTasks.map(normalizeTask).filter(Boolean);
  } else {
    normalized.checklistTasks = [];
  }

  if (candidate.routineTracker && typeof candidate.routineTracker === "object") {
    normalized.routineTracker = {
      habits: Array.isArray(candidate.routineTracker.habits) && candidate.routineTracker.habits.length > 0
        ? candidate.routineTracker.habits.map(h => ({
            id: String(h.id || ("h_" + Math.random().toString(36).substring(2, 7))),
            name: String(h.name || "Hábito"),
            emoji: String(h.emoji || "⭐"),
            goal: Number(h.goal) || 30
          }))
        : getDefaultRoutineHabits(),
      monthlyChecks: (candidate.routineTracker.monthlyChecks && typeof candidate.routineTracker.monthlyChecks === "object")
        ? candidate.routineTracker.monthlyChecks
        : {}
    };
  } else {
    normalized.routineTracker = {
      habits: getDefaultRoutineHabits(),
      monthlyChecks: {}
    };
  }

  return normalized;
}

function normalizeTask(task) {
  if (!task || typeof task !== "object") return null;
  return {
    id: task.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    text: String(task.text || "").trim(),
    description: String(task.description || "").trim(),
    completed: Boolean(task.completed),
    linkType: typeof task.linkType === "string" ? task.linkType : "",
    linkKey: typeof task.linkKey === "string" ? task.linkKey : "",
    dueDate: typeof task.dueDate === "string" ? task.dueDate : "",
    difficulty: clampDifficulty(task.difficulty ?? 3),
    createdAt: typeof task.createdAt === "string" ? task.createdAt : new Date().toISOString(),
    completedAt: typeof task.completedAt === "string" ? task.completedAt : ""
  };
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
  academicPeriods = normalizeAcademicPeriods(state.settings.academicPeriods);
  state.settings.subjects = subjects;
  state.settings.tracks = EXTRA_TRACKS;
  state.settings.academicPeriods = academicPeriods;
  state.settings.profile = normalizeProfile(state.settings.profile);
  state.settings.calendarRange = normalizeCalendarRange(state.settings.calendarRange);

  if (!state.settings.subjectsLabelPlural) state.settings.subjectsLabelPlural = "Asignaturas";
  if (!state.settings.subjectsLabelSingular) state.settings.subjectsLabelSingular = "Asignatura";
  if (!state.settings.hobbiesLabelPlural) state.settings.hobbiesLabelPlural = "Hobbies";
  if (!state.settings.hobbiesLabelSingular) state.settings.hobbiesLabelSingular = "Hobby";

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

function normalizeAcademicPeriods(periods) {
  if (!Array.isArray(periods)) return [];
  return periods.filter(p => p && typeof p === "object" && typeof p.name === "string" && p.name.trim()).map(p => ({
    id: typeof p.id === "string" && p.id.trim() ? p.id.trim() : `period_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: p.name.trim(),
    startDate: typeof p.startDate === "string" ? p.startDate : TODAY_DATE,
    endDate: typeof p.endDate === "string" ? p.endDate : TODAY_DATE,
    subjects: Array.isArray(p.subjects) ? p.subjects.filter(s => typeof s === "string") : [],
    tracks: Array.isArray(p.tracks) ? p.tracks.filter(t => typeof t === "string") : EXTRA_TRACKS.map(t => t.key)
  }));
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
  const subSingular = state.settings.subjectsLabelSingular || "Asignatura";
  eventSubjectEl.innerHTML = "";

  const noneOption = document.createElement("option");
  noneOption.value = "";
  noneOption.textContent = `Ninguno (sin ${subSingular.toLowerCase()})`;
  eventSubjectEl.appendChild(noneOption);

  for (const subject of subjects) {
    const option = document.createElement("option");
    option.value = subject.name;
    option.textContent = subject.name;
    eventSubjectEl.appendChild(option);
  }

  const createOption = document.createElement("option");
  createOption.value = "__new_subject__";
  createOption.textContent = `Crear nueva ${subSingular.toLowerCase()}`;
  eventSubjectEl.appendChild(createOption);

  if (selectedValue !== undefined && Array.from(eventSubjectEl.options).some((option) => option.value === selectedValue)) {
    eventSubjectEl.value = selectedValue;
  } else {
    const isExam = eventTypeEl.value === "exam";
    if (isExam && subjects.length) {
      eventSubjectEl.value = subjects[0].name;
    } else {
      eventSubjectEl.value = "";
    }
  }
}

function toggleEventSubjectFields() {
  const isExam = eventTypeEl.value === "exam";
  const isCreatingSubject = eventSubjectEl.value === "__new_subject__";
  
  eventSubjectFieldsEl.hidden = false;
  eventSubjectEl.required = isExam;
  
  eventNewSubjectFieldsEl.hidden = !isCreatingSubject;
  eventNewSubjectNameEl.required = isCreatingSubject;
  eventNewSubjectDescriptionEl.required = isCreatingSubject;
  eventNewSubjectDifficultyEl.required = false;
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

  const day = ensureDay(selectedDate);
  let visibleSubjects = subjects;
  let isPeriodOff = false;

  if (academicPeriods.length > 0) {
    const activePeriod = academicPeriods.find(p => selectedDate >= p.startDate && selectedDate <= p.endDate);
    if (activePeriod) {
      visibleSubjects = subjects.filter(s => activePeriod.subjects.includes(s.name) || (day.subjects[s.name] > 0));
    } else {
      visibleSubjects = subjects.filter(s => day.subjects[s.name] > 0);
      if (visibleSubjects.length === 0) {
        isPeriodOff = true;
      }
    }
  }

  if (isPeriodOff) {
    subjectFormEl.innerHTML = `
      <div class="empty-state" style="padding: 8px 0; font-size: 0.86rem; color: var(--muted); text-align: center; display: flex; flex-direction: column; align-items: center; gap: 6px;">
        <span>Periodo no lectivo (vacaciones)</span>
        <button type="button" id="showAllSubjectsBtn" class="ghost-button" style="min-height: 28px; padding: 2px 10px; font-size: 0.76rem; width: 100%; border-radius: 6px;">Mostrar asignaturas</button>
      </div>
    `;
    const showAllBtn = document.getElementById("showAllSubjectsBtn");
    if (showAllBtn) {
      showAllBtn.addEventListener("click", () => {
        renderSubjectInputsWithList(subjects);
      });
    }
    return;
  }

  renderSubjectInputsWithList(visibleSubjects);
}

function renderSubjectInputsWithList(list) {
  subjectFormEl.innerHTML = "";
  if (!list.length) {
    subjectFormEl.innerHTML = `<div class="empty-state">Sin asignaturas asignadas.</div>`;
    return;
  }

  for (const subject of list) {
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
  const hasPendingTasks = state.checklistTasks?.some(t => t.dueDate === key && !t.completed);
  const taskDot = hasPendingTasks ? `<span class="task-dot" title="Tareas pendientes para este día"></span>` : "";

  return `
    <span class="day-topline">
      <span class="day-number">${date.getDate()}</span>
      ${noteDot}${taskDot}
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
  selectedStudyEl.textContent = `${state.settings.subjectsLabelPlural || "Asignaturas"}: ${formatNumber(getStudyTotal(selectedDate))} h`;
  renderDaySplit();
  dayNotesEl.value = day.notes || "";
  renderTrackInputs();
  renderRating(day.rating);

  for (const input of subjectFormEl.querySelectorAll("input[data-subject]")) {
    const value = day.subjects[input.dataset.subject] || 0;
    input.value = value ? String(value) : "";
  }

  renderNotices();
  renderDayTasks();
  if (typeof renderChecklistSelectedDay === "function") {
    renderChecklistSelectedDay();
  }
  renderStats();
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
    const subjectSuffix = ev.subjectName ? ` · ${ev.subjectName}` : "";
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
    ...(subjectName ? { subjectName } : {}),
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
  if (type !== "exam" && eventSubjectEl.value === "") return "";

  if (eventSubjectEl.value === "") {
    showToast(`Para un examen, debes elegir una ${state.settings.subjectsLabelSingular.toLowerCase()}.`);
    eventSubjectEl.focus();
    return "";
  }

  if (eventSubjectEl.value !== "__new_subject__") {
    return eventSubjectEl.value;
  }

  const name = eventNewSubjectNameEl.value.trim();
  const description = eventNewSubjectDescriptionEl.value.trim();
  if (!name || !description) {
    showToast(`Para crear una ${state.settings.subjectsLabelSingular.toLowerCase()}, escribe su nombre y descripción.`);
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
  updateDynamicLabels();
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
  const { currentPeriod, isVacation, activeSubjects, activeTracks } = getActiveStatsContext();
  const keys = getStatsRangeKeys();
  
  if (generateReportBtn) {
    const isLectivoFinished = currentPeriod && !isVacation && getTodayDateKey() >= currentPeriod.endDate;
    generateReportBtn.style.display = isLectivoFinished ? "flex" : "none";
  }

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
    let studyTotal = 0;
    let trackTotal = 0;

    for (const track of activeTracks) {
      const h = day.extra[track.key] || 0;
      totalsByTrack[track.key] += h;
      trackTotal += h;
    }

    for (const subject of activeSubjects) {
      const subjectHours = day.subjects[subject.name] || 0;
      totalsBySubject[subject.name] += subjectHours;
      studyTotal += subjectHours;
      weightedLoad += subjectHours * getSubjectDifficulty(subject.name);
    }

    const dayTotal = studyTotal + trackTotal;
    totalHours += dayTotal;
    totalStudy += studyTotal;
    totalTracks += trackTotal;

    if (dayTotal > 0) activeDays++;
    
    const relevantTotal = activeSubjects.length === 0 ? trackTotal : studyTotal;
    if (relevantTotal > best.total) best = { key, total: relevantTotal };

    const rating = day.rating || 0;
    if (rating > 0) {
      ratedDays++;
      totalRating += rating;
    }
  }

  const lastKeyOfPeriod = keys[keys.length - 1] || getTodayDateKey();
  const isHobbyMode = isVacation || (currentPeriod && activeSubjects.length === 0);
  const currentStreak = calculateCurrentStreak(keys, lastKeyOfPeriod, isHobbyMode);
  const averageRating = ratedDays > 0 ? totalRating / ratedDays : 0;
  const elapsedDays = Math.max(1, keys.length);

  grandTotalEl.textContent = `${formatNumber(totalHours)} h`;
  avgPerDayEl.textContent = `${formatNumber(totalHours / elapsedDays)} h`;
  avgActiveDayEl.textContent = activeDays ? `${formatNumber(totalHours / activeDays)} h` : "0 h";
  bestDayEl.textContent = best.key ? `${formatShortDate(best.key)} (${formatNumber(best.total)} h)` : "-";
  streakEl.textContent = `${currentStreak} días`;

  let topSubject = null;
  let topTrack = null;

  if (isHobbyMode) {
    // Periodo sin asignaturas (ej. vacaciones / solo hobbies)
    if (grandTotalLabel) grandTotalLabel.textContent = "total hobbies";
    if (weightedLoadLabel) weightedLoadLabel.textContent = "hobbies vinculados";
    weightedLoadEl.textContent = `${activeTracks.length}`;
    if (avgPerDayLabel) avgPerDayLabel.textContent = "media diaria (hobbies)";
    if (avgActiveDayLabel) avgActiveDayLabel.textContent = "media en días activos";
    if (bestDayLabel) bestDayLabel.textContent = "mejor día de hobbies";
    if (streakLabel) streakLabel.textContent = "racha de días con hobbies";
    if (studyFocusLabel) studyFocusLabel.textContent = "foco principal";
    if (hobbyFocusLabel) hobbyFocusLabel.textContent = "foco secundario";
    if (topSubjectLabel) topSubjectLabel.textContent = "hobby principal";
    if (topTrackLabel) topTrackLabel.textContent = "segundo hobby";

    const sortedTracks = activeTracks
      .map((track) => ({ label: track.label, total: totalsByTrack[track.key] }))
      .sort((a, b) => b.total - a.total);
    const t1 = sortedTracks[0];
    const t2 = sortedTracks[1];

    topSubjectEl.textContent = t1 && t1.total > 0 ? `${t1.label} (${formatNumber(t1.total)} h)` : "-";
    topTrackEl.textContent = t2 && t2.total > 0 ? `${t2.label} (${formatNumber(t2.total)} h)` : "-";
    
    studyFocusEl.textContent = totalHours && t1 ? `${formatNumber((t1.total / totalHours) * 100)}%` : "0%";
    hobbyFocusEl.textContent = totalHours && t2 ? `${formatNumber((t2.total / totalHours) * 100)}%` : "0%";
    topSubject = t1 ? { name: t1.label, total: t1.total } : null;
    topTrack = t2 ? { label: t2.label, total: t2.total } : null;
  } else {
    // Periodo normal (estudio o mixto)
    if (grandTotalLabel) grandTotalLabel.textContent = "total global";
    if (weightedLoadLabel) weightedLoadLabel.textContent = "carga ponderada";
    weightedLoadEl.textContent = `${formatNumber(weightedLoad)}`;
    if (avgPerDayLabel) avgPerDayLabel.textContent = "media diaria";
    if (avgActiveDayLabel) avgActiveDayLabel.textContent = "media en días activos";
    if (bestDayLabel) bestDayLabel.textContent = "mejor día académico";
    if (streakLabel) streakLabel.textContent = "racha de días seguidos con estudio";
    if (studyFocusLabel) studyFocusLabel.textContent = "foco en estudio";
    if (hobbyFocusLabel) hobbyFocusLabel.textContent = "foco en hobbies";
    if (topSubjectLabel) topSubjectLabel.textContent = "asignatura dominante";
    if (topTrackLabel) topTrackLabel.textContent = "hobby dominante";

    topSubject = activeSubjects
      .map((subject) => ({ name: subject.name, total: totalsBySubject[subject.name] }))
      .sort((a, b) => b.total - a.total)[0];
    topTrack = activeTracks
      .map((track) => ({ label: track.label, total: totalsByTrack[track.key], activeDays: countActiveTrackDays(keys, track.key) }))
      .sort((a, b) => b.total - a.total || b.activeDays - a.activeDays)[0];

    topSubjectEl.textContent = topSubject && topSubject.total > 0 ? `${topSubject.name} (${formatNumber(topSubject.total)} h)` : "-";
    topTrackEl.textContent = topTrack && topTrack.total > 0 ? `${topTrack.label} (${formatNumber(topTrack.total)} h)` : "-";
    studyFocusEl.textContent = totalHours ? `${formatNumber((totalStudy / totalHours) * 100)}%` : "0%";
    hobbyFocusEl.textContent = totalHours ? `${formatNumber((totalTracks / totalHours) * 100)}%` : "0%";
  }

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
    currentStreak,
    activeSubjects,
    activeTracks
  };

  if (isHobbyMode || activeSubjects.length === 0) {
    if (subjectChartPanel) subjectChartPanel.hidden = true;
    if (hobbyFrequencyPanel) hobbyFrequencyPanel.hidden = false;
    renderHobbyFrequencyChart(keys, activeTracks, totalsByTrack);
  } else {
    if (subjectChartPanel) subjectChartPanel.hidden = false;
    if (hobbyFrequencyPanel) hobbyFrequencyPanel.hidden = true;
    renderSubjectChart(totalsBySubject, activeSubjects);
  }
  renderRatingsChart(keys);
  renderBalanceChart(totalStudy, totalsByTrack, totalHours, activeTracks);
}

function renderHobbyFrequencyChart(keys, activeTracks, totalsByTrack) {
  const container = hobbyFrequencyChart;
  if (!container) return;
  container.innerHTML = "";

  const ranking = activeTracks
    .map((track) => {
      const activeDays = countActiveTrackDays(keys, track.key);
      const totalHours = totalsByTrack[track.key] || 0;
      const avgPerActiveDay = activeDays > 0 ? totalHours / activeDays : 0;
      return { ...track, activeDays, totalHours, avgPerActiveDay };
    })
    .sort((a, b) => b.activeDays - a.activeDays || b.totalHours - a.totalHours || a.label.localeCompare(b.label, "es-ES"));

  const maxDays = Math.max(1, ...ranking.map((t) => t.activeDays));

  if (ranking.length === 0) {
    container.innerHTML = `<div class="empty-state">No hay hobbies vinculados a este periodo.</div>`;
    return;
  }

  for (const [index, track] of ranking.entries()) {
    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <span class="bar-label">
        <span class="bar-rank">#${index + 1}</span>
        <span>${escapeHtml(track.label)}</span>
        <small>Media ${formatNumber(track.avgPerActiveDay)}h/día</small>
      </span>
      <span class="bar-track">
        <span class="bar-fill" style="background:${track.color}; width:${(track.activeDays / maxDays) * 100}%"></span>
      </span>
      <span class="bar-value">${track.activeDays} ${track.activeDays === 1 ? 'día' : 'días'}</span>
    `;
    container.appendChild(row);
  }
}

function renderSubjectChart(totalsBySubject, activeSubjects = subjects) {
  subjectChartEl.innerHTML = "";
  const ranking = activeSubjects
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

function renderBalanceChart(totalStudy, totalsByTrack, totalHours, activeTracks = EXTRA_TRACKS) {
  balanceChartEl.innerHTML = "";

  const parts = [];
  if (totalStudy > 0 || latestStats?.activeSubjects?.length > 0) {
    parts.push({ label: state.settings.subjectsLabelPlural || "Estudio", value: totalStudy, color: state.settings.profile.accentColor });
  }
  parts.push(...activeTracks.map((track) => ({ label: track.label, value: totalsByTrack[track.key] || 0, color: track.color })));

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
  try {
    if (!latestStats) renderStats();
    renderAdvancedStats();
    advancedStatsModalEl.hidden = false;
  } catch (err) {
    console.error("Error al abrir estadísticas avanzadas:", err);
    showToast("Error al abrir las estadísticas avanzadas.");
  }
}

function closeAdvancedStats() {
  advancedStatsModalEl.hidden = true;
}

function renderAdvancedStats() {
  const stats = latestStats;
  if (!stats) return;

  const subPlural = state.settings.subjectsLabelPlural || "Asignaturas";
  const subSingular = state.settings.subjectsLabelSingular || "Asignatura";
  const hobPlural = state.settings.hobbiesLabelPlural || "Hobbies";
  const hobSingular = state.settings.hobbiesLabelSingular || "Hobby";

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
        `Días sin actividad registrada: ${stats.inactiveDays}; racha de ${subPlural.toLowerCase()} actual: ${stats.currentStreak} días.`
      ])}
      ${renderAdvancedCard(`${subPlural} y ${hobPlural}`, [
        `${subPlural}: ${formatNumber(stats.totalStudy)} h (${formatNumber(studyShare)}%).`,
        `${hobPlural}: ${formatNumber(stats.totalTracks)} h (${formatNumber(trackShare)}%).`,
        `Actividad en ${formatNumber(activeRatio)}% de los días transcurridos.`
      ])}
      ${renderAdvancedCard(subPlural, subjectRanking.length ? [
        `Dominante: ${subjectRanking[0]?.total > 0 ? `${escapeHtml(subjectRanking[0].name)} con ${formatNumber(subjectRanking[0].total)} h` : "todavía sin horas"}.`,
        `Concentración principal: ${formatNumber(topSubjectShare)}% del total; ${studiedSubjects}/${subjectRanking.length} ${subPlural.toLowerCase()} tocadas.`,
        `Carga ponderada acumulada: ${formatNumber(stats.weightedLoad)}.`
      ] : [`No hay ${subPlural.toLowerCase()} configuradas.`])}
      ${renderAdvancedCard(hobPlural, trackRanking.length ? [
        `${hobSingular} dominante: ${trackRanking[0]?.total > 0 ? `${escapeHtml(trackRanking[0].label)} con ${formatNumber(trackRanking[0].total)} h` : "todavía sin horas"}.`,
        `Mayor constancia: ${getMostConsistentTrackText(trackRanking)}.`,
        `${trackRanking.length} ${hobPlural.toLowerCase()} configurados.`
      ] : [`No hay ${hobPlural.toLowerCase()} configurados.`])}
      ${renderAdvancedCard("Semana", [
        `Día con más horas: ${bestWeekday ? `${bestWeekday.label} (${formatNumber(bestWeekday.total)} h)` : "-"}.`,
        `Día más constante: ${mostActiveWeekday ? `${mostActiveWeekday.label} (${mostActiveWeekday.activeDays} días activos)` : "-"}.`,
        `Valoraciones registradas: ${usefulRatedDays}.`
      ])}
      ${renderAdvancedCard("Riesgos", [
        highestRisk ? `Mayor riesgo: ${escapeHtml(highestRisk.name)} (${formatNumber(highestRisk.score)}/100), ${highestRisk.examText}.` : `No hay ${subPlural.toLowerCase()} para evaluar.`,
        bestCovered ? `Mejor cubierta: ${escapeHtml(bestCovered.name)} (${formatNumber(bestCovered.coverage)}% del objetivo estimado).` : `${subPlural} sin tocar: ${neglectedSubjects}.`,
        `${highRiskCount} ${subPlural.toLowerCase()} en riesgo alto; ${neglectedSubjects} ${subPlural.toLowerCase()} sin tocar.`
      ])}
    </div>
    <div class="advanced-lists">
      ${renderRankingList(`Ranking de ${subPlural.toLowerCase()}`, subjectRanking.map((item) => ({
        label: item.name,
        meta: `Dif. ${item.difficulty}`,
        value: `${formatNumber(item.total)} h`
      })))}
      ${renderRankingList(`Ranking de ${hobPlural.toLowerCase()}`, trackRanking.map((item) => ({
        label: item.label,
        meta: `${item.activeDays} días`,
        value: `${formatNumber(item.total)} h`
      })))}
      ${renderRankingList("Días de la semana", weekdayStudyRanking.map((item) => ({
        label: item.label,
        meta: `${item.studyActiveDays} con ${subPlural.toLowerCase()}`,
        value: `${formatNumber(item.total)} h`
      })))}
      ${renderRankingList(`${subPlural} por carga ponderada`, weightedSubjectRanking
        .map((item) => ({
          label: item.name,
          meta: `Dif. ${item.difficulty}`,
          value: `${formatNumber(item.weighted)} carga`
        })))}
      ${renderRankingList(`Riesgo de ${subPlural.toLowerCase()}`, riskRanking.map((item) => ({
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
      const upcomingEvents = getUpcomingLinkedEvents(subject.name, todayKey);
      const closestEvent = upcomingEvents[0] || null;

      let urgency = 10;
      if (closestEvent) {
        let baseUrgency = 10;
        const days = closestEvent.daysUntil;
        if (days <= 1) baseUrgency = 100;
        else if (days <= 3) baseUrgency = 90;
        else if (days <= 7) baseUrgency = 75;
        else if (days <= 14) baseUrgency = 50;
        else if (days <= 30) baseUrgency = 25;
        
        let typeWeight = 0.5;
        if (closestEvent.type === "exam") typeWeight = 1.0;
        else if (closestEvent.type === "deadline") typeWeight = 0.9;
        else if (closestEvent.type === "project") typeWeight = 0.8;
        else if (closestEvent.type === "review") typeWeight = 0.7;

        urgency = baseUrgency * typeWeight;
      }

      const difficultyScore = subject.difficulty * 20;

      const targetHours = Math.max(4, subject.difficulty * 5);
      const coverage = Math.min(140, (subject.total / targetHours) * 100);
      const missingRatio = Math.max(0, 1 - subject.total / targetHours);
      const dedicationScore = missingRatio * 100;

      const score = Math.min(100, Math.max(0, urgency * 0.40 + difficultyScore * 0.25 + dedicationScore * 0.35));

      return {
        ...subject,
        score,
        targetHours,
        coverage,
        exam: closestEvent,
        examText: formatRiskEventText(closestEvent)
      };
    })
    .sort((a, b) => {
      const aDays = a.exam ? a.exam.daysUntil : Number.POSITIVE_INFINITY;
      const bDays = b.exam ? b.exam.daysUntil : Number.POSITIVE_INFINITY;
      return b.score - a.score || aDays - bDays || b.difficulty - a.difficulty;
    });
}

function getUpcomingLinkedEvents(subjectName, fromKey = getTodayDateKey()) {
  const matches = [];
  const allEventDates = new Set([...Object.keys(events), ...Object.keys(state.days || {})]);
  for (const key of allEventDates) {
    if (key < fromKey) continue;
    const dayEvents = [
      ...getVisibleStaticEvents(key).map(({ event }) => event),
      ...(state.days[key]?.customEvents || [])
    ];
    for (const event of dayEvents) {
      let isMatch = false;
      if (event.subjectName) {
        isMatch = normalizeSearchText(event.subjectName) === normalizeSearchText(subjectName);
      } else {
        isMatch = eventMatchesSubject(event.text, subjectName);
      }

      if (isMatch) {
        const daysUntil = Math.max(0, Math.round((parseKey(key) - parseKey(fromKey)) / 86400000));
        matches.push({
          key,
          type: event.type,
          text: event.text,
          daysUntil
        });
      }
    }
  }
  return matches.sort((a, b) => a.daysUntil - b.daysUntil);
}

function formatRiskEventText(event) {
  if (!event) return "sin eventos próximos";
  const typeText = event.type === "exam" ? "examen" : (event.type === "deadline" ? "entrega" : "evento");
  if (event.daysUntil === 0) return `${typeText} hoy`;
  if (event.daysUntil === 1) return `${typeText} mañana`;
  return `${typeText} en ${event.daysUntil} días`;
}

function normalizeSearchText(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function eventMatchesSubject(text, subjectName) {
  if (!text || !subjectName) return false;
  return normalizeSearchText(text).includes(normalizeSearchText(subjectName));
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
  const subPlural = state.settings.subjectsLabelPlural || "Asignaturas";
  const subSingular = state.settings.subjectsLabelSingular || "Asignatura";
  const hobPlural = state.settings.hobbiesLabelPlural || "Hobbies";
  const hobSingular = state.settings.hobbiesLabelSingular || "Hobby";

  const tips = [];
  const lowSubjects = subjectRanking.filter((item) => item.total === 0).slice(0, 2);
  const topSubject = subjectRanking[0];
  const topTrack = trackRanking[0];
  const touchedSubjects = subjectRanking.filter((item) => item.total > 0).length;
  const heavyDifficultyWithoutTime = subjectRanking
    .filter((item) => item.difficulty >= 4 && item.total < Math.max(1, stats.totalStudy / Math.max(1, subjectRanking.length) * 0.5))
    .slice(0, 2);

  if (lowSubjects.length) {
    tips.push(`${subPlural} sin horas: ${lowSubjects.map((item) => escapeHtml(item.name)).join(", ")}. Conviene meterles aunque sea un bloque corto para que no desaparezcan del radar.`);
  }

  if (heavyDifficultyWithoutTime.length) {
    tips.push(`Hay ${subPlural.toLowerCase()} difíciles con poco peso (${heavyDifficultyWithoutTime.map((item) => escapeHtml(item.name)).join(", ")}). Priorízalas antes de que se acumulen.`);
  }

  if (topSubject && stats.totalStudy > 0 && topSubject.total / stats.totalStudy > 0.45) {
    tips.push(`${escapeHtml(topSubject.name)} concentra demasiado estudio. Si no es por un examen o entrega cercana, reparte algo más para evitar abandonar el resto.`);
  }

  if (subjectRanking.length && touchedSubjects / subjectRanking.length < 0.6) {
    tips.push(`Solo has tocado ${touchedSubjects}/${subjectRanking.length} ${subPlural.toLowerCase()}. Un reparto mínimo semanal puede darte mejor control del calendario.`);
  }

  if (studyShare < 60 && stats.totalHours > 0) {
    tips.push(`El peso de ${subPlural.toLowerCase()} está por debajo del 60%. Si estás en periodo fuerte, sube el foco académico o separa mejor hobbies de días de estudio.`);
  } else if (studyShare > 90 && stats.totalTracks > 0) {
    tips.push(`El calendario está muy cargado hacia ${subPlural.toLowerCase()}. Mantener algo de ${hobPlural.toLowerCase()} puede ayudar a sostener ritmo sin quemarte.`);
  }

  if (topTrack && topTrack.total > 0) {
    tips.push(`Tu ${hobSingular.toLowerCase()} más presente es ${escapeHtml(topTrack.label)}. Úsalo como indicador de equilibrio: muchas horas ahí pueden ser descanso útil o una fuga, según la semana.`);
  }

  if (stats.inactiveDays > stats.activeDays && stats.totalHours > 0) {
    tips.push(`Hay más días sin actividad que activos. Una meta mínima diaria de 25-30 minutos puede mejorar continuidad sin depender de días enormes.`);
  }

  if (stats.ratedDays < Math.max(3, stats.activeDays / 4)) {
    tips.push("Hay pocas valoraciones del día. Puntuar más días ayuda a cruzar horas con sensación real de rendimiento.");
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
  editingSubjectTarget = null;
  subjectSettingsFormEl.reset();
  newSubjectColorEl.value = "#0f766e";
  
  const subSingular = state.settings.subjectsLabelSingular || "Asignatura";
  subjectEntryTitleEl.textContent = `Añadir ${subSingular.toLowerCase()}`;
  subjectSettingsFormEl.querySelector('button[type="submit"]').textContent = `Añadir ${subSingular.toLowerCase()}`;
  
  subjectEntryModalEl.hidden = false;
  newSubjectNameEl.focus();
}

function closeSubjectEntry() {
  editingSubjectTarget = null;
  subjectEntryModalEl.hidden = true;
}

function openTrackEntry() {
  editingTrackTarget = null;
  trackSettingsFormEl.reset();
  newTrackColorEl.value = "#d97706";
  
  const hobSingular = state.settings.hobbiesLabelSingular || "Hobby";
  trackEntryTitleEl.textContent = `Añadir ${hobSingular.toLowerCase()}`;
  trackSettingsFormEl.querySelector('button[type="submit"]').textContent = `Añadir ${hobSingular.toLowerCase()}`;
  
  trackEntryModalEl.hidden = false;
  newTrackNameEl.focus();
}

function closeTrackEntry() {
  editingTrackTarget = null;
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
  
  const subjectsPluralInput = document.getElementById("profileSubjectsPlural");
  const subjectsSingularInput = document.getElementById("profileSubjectsSingular");
  const hobbiesPluralInput = document.getElementById("profileHobbiesPlural");
  const hobbiesSingularInput = document.getElementById("profileHobbiesSingular");
  if (subjectsPluralInput) subjectsPluralInput.value = state.settings.subjectsLabelPlural || "Asignaturas";
  if (subjectsSingularInput) subjectsSingularInput.value = state.settings.subjectsLabelSingular || "Asignatura";
  if (hobbiesPluralInput) hobbiesPluralInput.value = state.settings.hobbiesLabelPlural || "Hobbies";
  if (hobbiesSingularInput) hobbiesSingularInput.value = state.settings.hobbiesLabelSingular || "Hobby";

  [profileLevel1El, profileLevel2El, profileLevel3El, profileLevel4El].forEach((input, index) => {
    input.value = profile.intensityLevels[index];
  });
  renderSubjectsSettings();
  renderTracksSettings();
  renderAcademicPeriodsSettings();
  populateStatsPeriodSelect();
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
      <span style="flex: 1 1 auto; margin-right: 10px;"><strong>${escapeHtml(subject.name)}</strong><small>${escapeHtml(subject.description || "Sin descripción")} · Dif. ${getSubjectDifficulty(subject.name)}</small></span>
      <div class="notice-actions">
        <button type="button" class="notice-action" data-edit-subject="${escapeHtml(subject.name)}" title="Editar" style="color: var(--accent); border-color: rgba(var(--accent-rgb), 0.25);">✎</button>
        <button type="button" class="notice-action" data-delete-subject="${escapeHtml(subject.name)}" title="Eliminar" style="color: #dc2626; border-color: rgba(220, 38, 38, 0.25);">🗑</button>
      </div>
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
      <span style="flex: 1 1 auto; margin-right: 10px;"><strong>${escapeHtml(track.label)}</strong><small>${escapeHtml(track.description || "Sin descripción")}</small></span>
      <div class="notice-actions">
        <button type="button" class="notice-action" data-edit-track="${track.key}" title="Editar" style="color: var(--accent); border-color: rgba(var(--accent-rgb), 0.25);">✎</button>
        <button type="button" class="notice-action" data-delete-track="${track.key}" title="Eliminar" style="color: #dc2626; border-color: rgba(220, 38, 38, 0.25);">🗑</button>
      </div>
    `;
    tracksSettingsListEl.appendChild(item);
  }
}

function renderAcademicPeriodsSettings() {
  if (!periodsSettingsListEl) return;
  periodsSettingsListEl.innerHTML = "";
  if (!academicPeriods.length) {
    periodsSettingsListEl.innerHTML = `<div class="empty-state">Vacío.</div>`;
    return;
  }

  for (const period of academicPeriods) {
    const item = document.createElement("div");
    item.className = "settings-item";
    
    const dateText = `${formatShortDate(period.startDate)} - ${formatShortDate(period.endDate)}`;
    const subCount = period.subjects.length;
    const trackCount = (period.tracks || []).length;
    const subLabel = subCount === 1 ? (state.settings.subjectsLabelSingular || "Asignatura") : (state.settings.subjectsLabelPlural || "Asignaturas");
    
    item.innerHTML = `
      <span class="settings-color" style="background:var(--accent)"></span>
      <span style="flex: 1 1 auto; margin-right: 10px;">
        <strong>${escapeHtml(period.name)}</strong>
        <small>${escapeHtml(dateText)} · ${subCount} ${escapeHtml(subLabel.toLowerCase())} · ${trackCount} hobbies</small>
      </span>
      <div class="notice-actions">
        <button type="button" class="notice-action" data-edit-period="${period.id}" title="Editar" style="color: var(--accent); border-color: rgba(var(--accent-rgb), 0.25);">✎</button>
        <button type="button" class="notice-action" data-delete-period="${period.id}" title="Eliminar" style="color: #dc2626; border-color: rgba(220, 38, 38, 0.25);">🗑</button>
      </div>
    `;
    periodsSettingsListEl.appendChild(item);
  }
}

function openPeriodEntry(targetPeriod = null) {
  if (!periodEntryModalEl) return;
  
  if (periodSubjectsCheckboxesEl) {
    periodSubjectsCheckboxesEl.innerHTML = "";
    if (subjects.length === 0) {
      periodSubjectsCheckboxesEl.innerHTML = `<div style="font-size: 0.8rem; color: var(--muted); padding: 4px 0;">Crea primero alguna asignatura.</div>`;
    } else {
      for (const subject of subjects) {
        const wrap = document.createElement("label");
        wrap.style.display = "flex";
        wrap.style.alignItems = "center";
        wrap.style.gap = "8px";
        wrap.style.fontSize = "0.84rem";
        wrap.style.fontWeight = "bold";
        wrap.style.cursor = "pointer";
        wrap.innerHTML = `
          <input type="checkbox" value="${escapeHtml(subject.name)}" data-period-subject style="width:16px; height:16px; cursor:pointer;">
          <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${subject.color};"></span>
          <span>${escapeHtml(subject.name)}</span>
        `;
        periodSubjectsCheckboxesEl.appendChild(wrap);
      }
    }
  }

  if (periodTracksCheckboxesEl) {
    periodTracksCheckboxesEl.innerHTML = "";
    if (EXTRA_TRACKS.length === 0) {
      periodTracksCheckboxesEl.innerHTML = `<div style="font-size: 0.8rem; color: var(--muted); padding: 4px 0;">No hay hobbies creados.</div>`;
    } else {
      for (const track of EXTRA_TRACKS) {
        const wrap = document.createElement("label");
        wrap.style.display = "flex";
        wrap.style.alignItems = "center";
        wrap.style.gap = "8px";
        wrap.style.fontSize = "0.84rem";
        wrap.style.fontWeight = "bold";
        wrap.style.cursor = "pointer";
        wrap.innerHTML = `
          <input type="checkbox" value="${escapeHtml(track.key)}" data-period-track style="width:16px; height:16px; cursor:pointer;">
          <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${track.color};"></span>
          <span>${escapeHtml(track.label)}</span>
        `;
        periodTracksCheckboxesEl.appendChild(wrap);
      }
    }
  }

  if (targetPeriod) {
    editingPeriodTarget = targetPeriod.id;
    periodEntryTitleEl.textContent = "Editar curso académico";
    newPeriodNameEl.value = targetPeriod.name;
    newPeriodStartEl.value = targetPeriod.startDate;
    newPeriodEndEl.value = targetPeriod.endDate;
    
    if (periodSubjectsCheckboxesEl) {
      for (const checkbox of periodSubjectsCheckboxesEl.querySelectorAll("input[data-period-subject]")) {
        checkbox.checked = targetPeriod.subjects.includes(checkbox.value);
      }
    }
    if (periodTracksCheckboxesEl) {
      const pTracks = targetPeriod.tracks || EXTRA_TRACKS.map(t => t.key);
      for (const checkbox of periodTracksCheckboxesEl.querySelectorAll("input[data-period-track]")) {
        checkbox.checked = pTracks.includes(checkbox.value);
      }
    }
    periodSettingsFormEl.querySelector('button[type="submit"]').textContent = "Guardar cambios";
  } else {
    editingPeriodTarget = null;
    periodEntryTitleEl.textContent = "Añadir curso académico";
    if (periodSettingsFormEl) periodSettingsFormEl.reset();
    newPeriodNameEl.value = "";
    newPeriodStartEl.value = TODAY_DATE;
    newPeriodEndEl.value = TODAY_DATE;
    
    if (periodSubjectsCheckboxesEl) {
      for (const checkbox of periodSubjectsCheckboxesEl.querySelectorAll("input[data-period-subject]")) {
        checkbox.checked = false;
      }
    }
    if (periodTracksCheckboxesEl) {
      for (const checkbox of periodTracksCheckboxesEl.querySelectorAll("input[data-period-track]")) {
        checkbox.checked = true; // Por defecto los hobbies activos en todos los cursos
      }
    }
    periodSettingsFormEl.querySelector('button[type="submit"]').textContent = "Añadir curso / periodo";
  }

  periodEntryModalEl.hidden = false;
  newPeriodNameEl.focus();
}

function closePeriodEntry() {
  if (periodEntryModalEl) periodEntryModalEl.hidden = true;
  editingPeriodTarget = null;
}

function saveAcademicPeriod(event) {
  event.preventDefault();
  
  const name = newPeriodNameEl.value.trim();
  const start = newPeriodStartEl.value;
  const end = newPeriodEndEl.value;
  
  if (start > end) {
    alert("La fecha de inicio no puede ser posterior a la de fin.");
    return;
  }
  
  const selectedSubjects = [];
  if (periodSubjectsCheckboxesEl) {
    for (const checkbox of periodSubjectsCheckboxesEl.querySelectorAll("input[data-period-subject]")) {
      if (checkbox.checked) {
        selectedSubjects.push(checkbox.value);
      }
    }
  }

  const selectedTracks = [];
  if (periodTracksCheckboxesEl) {
    for (const checkbox of periodTracksCheckboxesEl.querySelectorAll("input[data-period-track]")) {
      if (checkbox.checked) {
        selectedTracks.push(checkbox.value);
      }
    }
  }
  
  if (editingPeriodTarget) {
    const period = state.settings.academicPeriods.find(p => p.id === editingPeriodTarget);
    if (period) {
      period.name = name;
      period.startDate = start;
      period.endDate = end;
      period.subjects = selectedSubjects;
      period.tracks = selectedTracks;
    }
  } else {
    if (!state.settings.academicPeriods) state.settings.academicPeriods = [];
    state.settings.academicPeriods.push({
      id: `period_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      startDate: start,
      endDate: end,
      subjects: selectedSubjects,
      tracks: selectedTracks
    });
  }
  
  closePeriodEntry();
  refreshAfterConfigChange("Curso académico guardado.");
  populateStatsPeriodSelect();
}

function handlePeriodSettingsClick(event) {
  const editBtn = event.target.closest("[data-edit-period]");
  if (editBtn) {
    const id = editBtn.dataset.editPeriod;
    const period = academicPeriods.find(p => p.id === id);
    if (!period) return;
    openPeriodEntry(period);
    return;
  }

  const deleteBtn = event.target.closest("[data-delete-period]");
  if (!deleteBtn) return;
  const id = deleteBtn.dataset.deletePeriod;
  const period = academicPeriods.find(p => p.id === id);
  if (!period) return;
  
  const ok = confirm(`¿Estás seguro de que quieres eliminar el curso académico "${period.name}"? Los datos de estudio y asignaturas no se borrarán.`);
  if (!ok) return;
  
  state.settings.academicPeriods = state.settings.academicPeriods.filter(p => p.id !== id);
  
  if (selectedStatsPeriodId === id) {
    selectedStatsPeriodId = "all";
    if (statsPeriodSelectEl) statsPeriodSelectEl.value = "all";
  }
  
  refreshAfterConfigChange("Curso académico eliminado.");
  populateStatsPeriodSelect();
}

function populateStatsPeriodSelect() {
  if (!statsPeriodSelectEl) return;
  const currentValue = statsPeriodSelectEl.value;
  statsPeriodSelectEl.innerHTML = '<option value="all">Todo el historial</option>';
  
  for (const period of academicPeriods) {
    const opt = document.createElement("option");
    opt.value = period.id;
    opt.textContent = period.name;
    statsPeriodSelectEl.appendChild(opt);
  }
  
  if (Array.from(statsPeriodSelectEl.options).some(o => o.value === currentValue)) {
    statsPeriodSelectEl.value = currentValue;
  } else {
    statsPeriodSelectEl.value = "all";
    selectedStatsPeriodId = "all";
  }
}

function saveProfileSettings(event) {
  event.preventDefault();
  
  const subjectsPluralInput = document.getElementById("profileSubjectsPlural");
  const subjectsSingularInput = document.getElementById("profileSubjectsSingular");
  const hobbiesPluralInput = document.getElementById("profileHobbiesPlural");
  const hobbiesSingularInput = document.getElementById("profileHobbiesSingular");

  state.settings.subjectsLabelPlural = (subjectsPluralInput?.value || "Asignaturas").trim();
  state.settings.subjectsLabelSingular = (subjectsSingularInput?.value || "Asignatura").trim();
  state.settings.hobbiesLabelPlural = (hobbiesPluralInput?.value || "Hobbies").trim();
  state.settings.hobbiesLabelSingular = (hobbiesSingularInput?.value || "Hobby").trim();

  state.settings.profile = normalizeProfile({
    title: profileTitleEl.value,
    accentColor: profileAccentEl.value,
    intensityLevels: [profileLevel1El.value, profileLevel2El.value, profileLevel3El.value, profileLevel4El.value]
  });
  syncConfigFromState();
  applyProfile();
  updateDynamicLabels();
  persist();
  renderCalendar();
  showToast("Perfil guardado.");
}

function addSubjectFromSettings(event) {
  event.preventDefault();
  const name = newSubjectNameEl.value.trim();
  const description = newSubjectDescriptionEl.value.trim();
  if (!name || !description) return;

  const subSingular = state.settings.subjectsLabelSingular || "Asignatura";

  if (editingSubjectTarget) {
    if (name.toLowerCase() !== editingSubjectTarget.toLowerCase() && subjects.some((subject) => subject.name.toLowerCase() === name.toLowerCase())) {
      showToast(`Esa ${subSingular.toLowerCase()} ya existe.`);
      return;
    }

    const idx = state.settings.subjects.findIndex(s => s.name === editingSubjectTarget);
    if (idx >= 0) {
      state.settings.subjects[idx] = {
        name,
        description,
        color: normalizeColor(newSubjectColorEl.value),
        defaultDifficulty: clampDifficulty(newSubjectDifficultyEl.value)
      };
    }

    if (name !== editingSubjectTarget) {
      state.settings.subjectDifficulty[name] = clampDifficulty(newSubjectDifficultyEl.value);
      delete state.settings.subjectDifficulty[editingSubjectTarget];

      for (const day of Object.values(state.days)) {
        if (day.subjects && day.subjects[editingSubjectTarget] !== undefined) {
          day.subjects[name] = day.subjects[editingSubjectTarget];
          delete day.subjects[editingSubjectTarget];
        }
        if (day.customEvents) {
          for (const ev of day.customEvents) {
            if (ev.subjectName === editingSubjectTarget) {
              ev.subjectName = name;
            }
          }
        }
      }
      if (state.checklistTasks) {
        for (const task of state.checklistTasks) {
          if (task.linkType === "subject" && task.linkKey === editingSubjectTarget) {
            task.linkKey = name;
          }
        }
      }
    } else {
      state.settings.subjectDifficulty[name] = clampDifficulty(newSubjectDifficultyEl.value);
    }

    editingSubjectTarget = null;
    closeSubjectEntry();
    refreshAfterConfigChange(`${subSingular} actualizada.`);
    return;
  }

  if (subjects.some((subject) => subject.name.toLowerCase() === name.toLowerCase())) {
    showToast(`Esa ${subSingular.toLowerCase()} ya existe.`);
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
  refreshAfterConfigChange(`${subSingular} añadida.`);
}

function addTrackFromSettings(event) {
  event.preventDefault();
  const label = newTrackNameEl.value.trim();
  const description = newTrackDescriptionEl.value.trim();
  if (!label) return;

  const hobSingular = state.settings.hobbiesLabelSingular || "Hobby";

  if (editingTrackTarget) {
    const idx = state.settings.tracks.findIndex(t => t.key === editingTrackTarget);
    if (idx >= 0) {
      state.settings.tracks[idx] = {
        ...state.settings.tracks[idx],
        label,
        description,
        shortLabel: getShortLabel(label),
        color: normalizeColor(newTrackColorEl.value)
      };
    }
    editingTrackTarget = null;
    closeTrackEntry();
    refreshAfterConfigChange(`${hobSingular} actualizado.`);
    return;
  }

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
  refreshAfterConfigChange(`${hobSingular} añadido.`);
}

function handleSubjectSettingsClick(event) {
  const editBtn = event.target.closest("[data-edit-subject]");
  if (editBtn) {
    const oldName = editBtn.dataset.editSubject;
    const subject = subjects.find(s => s.name === oldName);
    if (!subject) return;

    editingSubjectTarget = oldName;
    newSubjectNameEl.value = subject.name;
    newSubjectDescriptionEl.value = subject.description || "";
    newSubjectColorEl.value = subject.color || "#0f766e";
    newSubjectDifficultyEl.value = getSubjectDifficulty(subject.name);

    const subSingular = state.settings.subjectsLabelSingular || "Asignatura";
    subjectEntryTitleEl.textContent = `Editar ${subSingular.toLowerCase()}`;
    subjectSettingsFormEl.querySelector('button[type="submit"]').textContent = "Guardar cambios";

    subjectEntryModalEl.hidden = false;
    newSubjectNameEl.focus();
    return;
  }

  const deleteBtn = event.target.closest("[data-delete-subject]");
  if (!deleteBtn) return;
  const name = deleteBtn.dataset.deleteSubject;
  
  const subSingular = state.settings.subjectsLabelSingular || "Asignatura";
  const ok = confirm(`¿Estás seguro de que quieres eliminar toda la info de "${name}"? El paso no será reversible.`);
  if (!ok) return;
  state.settings.subjects = state.settings.subjects.filter((subject) => subject.name !== name);
  delete state.settings.subjectDifficulty[name];
  for (const day of Object.values(state.days)) {
    if (day.subjects) delete day.subjects[name];
  }
  if (state.checklistTasks) {
    state.checklistTasks = state.checklistTasks.map(task => {
      if (task.linkType === "subject" && task.linkKey === name) {
        return { ...task, linkType: "", linkKey: "" };
      }
      return task;
    });
  }
  refreshAfterConfigChange(`${subSingular} eliminada.`);
}

function handleTrackSettingsClick(event) {
  const editBtn = event.target.closest("[data-edit-track]");
  if (editBtn) {
    const key = editBtn.dataset.editTrack;
    const track = EXTRA_TRACKS.find(t => t.key === key);
    if (!track) return;

    editingTrackTarget = key;
    newTrackNameEl.value = track.label;
    newTrackDescriptionEl.value = track.description || "";
    newTrackColorEl.value = track.color || "#d97706";

    const hobSingular = state.settings.hobbiesLabelSingular || "Hobby";
    trackEntryTitleEl.textContent = `Editar ${hobSingular.toLowerCase()}`;
    trackSettingsFormEl.querySelector('button[type="submit"]').textContent = "Guardar cambios";

    trackEntryModalEl.hidden = false;
    newTrackNameEl.focus();
    return;
  }

  const deleteBtn = event.target.closest("[data-delete-track]");
  if (!deleteBtn) return;
  const key = deleteBtn.dataset.deleteTrack;
  const track = EXTRA_TRACKS.find((item) => item.key === key);
  
  const hobSingular = state.settings.hobbiesLabelSingular || "Hobby";
  const ok = confirm(`¿Estás seguro de que quieres eliminar toda la info de "${track?.label || key}"? El paso no será reversible.`);
  if (!ok) return;
  state.settings.tracks = state.settings.tracks.filter((item) => item.key !== key);
  for (const day of Object.values(state.days)) {
    if (day.extra) delete day.extra[key];
  }
  if (state.checklistTasks) {
    state.checklistTasks = state.checklistTasks.map(task => {
      if (task.linkType === "track" && task.linkKey === key) {
        return { ...task, linkType: "", linkKey: "" };
      }
      return task;
    });
  }
  refreshAfterConfigChange(`${hobSingular} eliminado.`);
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
  updateDynamicLabels();
  if (typeof renderChecklistFilters === "function") {
    renderChecklistFilters();
  }
  if (typeof refreshChecklistAll === "function") {
    refreshChecklistAll();
  }
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
    checklistTasks: state.checklistTasks || [],
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

      // Copiar checklistTasks del nivel superior si no está en importedState
      if (Array.isArray(parsed.checklistTasks) && !Array.isArray(importedState.checklistTasks)) {
        importedState.checklistTasks = parsed.checklistTasks;
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
      if (typeof refreshChecklistAll === "function") {
        refreshChecklistAll();
      }
      updateDynamicLabels();
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

function calculateCurrentStreak(keys, endKey = getTodayDateKey(), isHobbyMode = false) {
  const todayIndex = keys.indexOf(endKey);
  let endIndex = todayIndex >= 0 ? todayIndex : keys.length - 1;
  const checkTotal = (key) => isHobbyMode ? getTrackTotal(key) : getStudyTotal(key);
  
  if (todayIndex >= 0 && checkTotal(endKey) <= 0) {
    endIndex = todayIndex - 1;
  }
  let streak = 0;
  for (let i = endIndex; i >= 0; i--) {
    if (checkTotal(keys[i]) <= 0) break;
    streak++;
  }
  return streak;
}

function classifyConfigItems() {
  const allPeriods = academicPeriods || [];
  
  const annualSubjects = [];
  const periodSubjectsMap = {}; 

  for (const sub of subjects) {
    if (allPeriods.length === 0) {
      annualSubjects.push(sub.name);
      continue;
    }
    let count = 0;
    const pIds = [];
    for (const p of allPeriods) {
      if (p.subjects && p.subjects.includes(sub.name)) {
        pIds.push(p.id);
        count++;
      }
    }
    if (count === allPeriods.length || count === 0) {
      annualSubjects.push(sub.name);
    } else {
      periodSubjectsMap[sub.name] = pIds;
    }
  }

  const annualTracks = [];
  const periodTracksMap = {}; 

  for (const trk of EXTRA_TRACKS) {
    if (allPeriods.length === 0) {
      annualTracks.push(trk.key);
      continue;
    }
    let count = 0;
    const pIds = [];
    for (const p of allPeriods) {
      const pTracks = Array.isArray(p.tracks) ? p.tracks : EXTRA_TRACKS.map(t => t.key);
      if (pTracks.includes(trk.key)) {
        pIds.push(p.id);
        count++;
      }
    }
    if (count === allPeriods.length || count === 0) {
      annualTracks.push(trk.key);
    } else {
      periodTracksMap[trk.key] = pIds;
    }
  }

  return { annualSubjects, periodSubjectsMap, annualTracks, periodTracksMap };
}

function getActiveStatsContext() {
  const { annualSubjects, periodSubjectsMap, annualTracks, periodTracksMap } = classifyConfigItems();
  const allPeriods = academicPeriods || [];

  let currentPeriod = null;
  let isVacation = false;

  if (selectedStatsPeriodId !== "all") {
    currentPeriod = allPeriods.find(p => p.id === selectedStatsPeriodId) || null;
  } else {
    currentPeriod = allPeriods.find(p => selectedDate >= p.startDate && selectedDate <= p.endDate) || null;
    if (!currentPeriod && allPeriods.length > 0) {
      isVacation = true; 
    }
  }

  const activeSubjects = subjects.filter(sub => {
    if (isVacation) return false; 
    if (annualSubjects.includes(sub.name)) return true; 
    if (currentPeriod) {
      const pIds = periodSubjectsMap[sub.name] || [];
      return pIds.includes(currentPeriod.id);
    }
    return true; 
  });

  const activeTracks = EXTRA_TRACKS.filter(trk => {
    if (annualTracks.includes(trk.key)) return true; 
    if (currentPeriod) {
      const pIds = periodTracksMap[trk.key] || [];
      return pIds.includes(currentPeriod.id);
    }
    if (isVacation) {
      return false; 
    }
    return true; 
  });

  return {
    currentPeriod,
    isVacation,
    activeSubjects,
    activeTracks,
    annualSubjects,
    annualTracks
  };
}

function getEffectiveStatsPeriod() {
  const { currentPeriod, isVacation } = getActiveStatsContext();
  if (currentPeriod) return { ...currentPeriod, isVacation: false };
  if (isVacation) {
    return {
      id: "vacation",
      name: "Vacaciones / Periodo no lectivo",
      startDate: getCalendarStart(),
      endDate: getCalendarEnd(),
      subjects: [],
      tracks: EXTRA_TRACKS.map(t => t.key),
      isVacation: true
    };
  }
  return null;
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

// --- LÓGICA Y RENDERIZADO DEL TRACKER DE HÁBITOS ("RoutineKraft" STYLE DASHBOARD) ---

function initRoutineTrackerEvents() {
  // Global window bindings for inline handlers
  window.openHabitModal = openHabitModal;
  window.closeHabitModal = closeHabitModal;
  window.toggleHabitCheck = toggleHabitCheck;
  window.updateHabitGoalInline = updateHabitGoalInline;
  window.switchView = switchView;
  window.openSettings = openSettings;
  window.closeSettings = closeSettings;

  const prevBtn = document.getElementById("routinePrevMonthBtn");
  const nextBtn = document.getElementById("routineNextMonthBtn");
  const monthSelect = document.getElementById("routineMonthSelect");
  const addHabitBtn = document.getElementById("addHabitBtn");
  const resetBtn = document.getElementById("resetMonthBtn");

  // Dock Action Buttons & Popover Menu
  const dockExportBtn = document.getElementById("dockExportBtn");
  const dockImportInput = document.getElementById("dockImportInput");
  const dockSettingsBtn = document.getElementById("dockSettingsBtn");
  const dockHomeBtn = document.getElementById("dockHomeBtn");
  const homePopoverMenu = document.getElementById("homePopoverMenu");

  const openPopoverMenu = () => {
    if (!homePopoverMenu) return;
    homePopoverMenu.classList.remove("closing");
    homePopoverMenu.removeAttribute("hidden");
    void homePopoverMenu.offsetWidth;
    homePopoverMenu.classList.add("open");
  };

  const closePopoverMenu = () => {
    if (!homePopoverMenu || !homePopoverMenu.classList.contains("open")) return;
    homePopoverMenu.classList.remove("open");
    homePopoverMenu.classList.add("closing");
    setTimeout(() => {
      if (homePopoverMenu.classList.contains("closing")) {
        homePopoverMenu.classList.remove("closing");
        homePopoverMenu.setAttribute("hidden", "true");
      }
    }, 210);
  };

  if (dockHomeBtn && homePopoverMenu) {
    dockHomeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (homePopoverMenu.classList.contains("open")) {
        closePopoverMenu();
      } else {
        openPopoverMenu();
      }
    });

    document.addEventListener("click", (e) => {
      if (homePopoverMenu.classList.contains("open") && !homePopoverMenu.contains(e.target) && !dockHomeBtn.contains(e.target)) {
        closePopoverMenu();
      }
    });
  }

  if (dockExportBtn) {
    dockExportBtn.addEventListener("click", () => {
      closePopoverMenu();
      exportData();
    });
  }

  const dockImportTriggerBtn = document.getElementById("dockImportTriggerBtn");
  if (dockImportTriggerBtn && dockImportInput) {
    dockImportTriggerBtn.addEventListener("click", () => {
      closePopoverMenu();
      dockImportInput.click();
    });
  }

  if (dockImportInput) {
    dockImportInput.addEventListener("change", (e) => {
      closePopoverMenu();
      importData(e);
    });
  }
  if (dockSettingsBtn) {
    dockSettingsBtn.addEventListener("click", () => {
      closePopoverMenu();
      openSettings();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      routineActiveMonth = shiftMonthKey(routineActiveMonth, -1);
      renderRoutineTracker();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      routineActiveMonth = shiftMonthKey(routineActiveMonth, 1);
      renderRoutineTracker();
    });
  }

  if (monthSelect) {
    monthSelect.addEventListener("change", (e) => {
      routineActiveMonth = e.target.value;
      renderRoutineTracker();
    });
  }

  if (addHabitBtn) {
    addHabitBtn.addEventListener("click", () => {
      openHabitModal(null);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (confirm(`¿Vaciar todas las marcas registradas de este mes (${formatMonthKeyTitle(routineActiveMonth)})?`)) {
        if (state.routineTracker && state.routineTracker.monthlyChecks) {
          delete state.routineTracker.monthlyChecks[routineActiveMonth];
          saveState();
          renderRoutineTracker();
          showToast("Marcas del mes vaciadas.");
        }
      }
    });
  }

  // Habit Modal form listener
  const habitForm = document.getElementById("habitForm");
  const habitCloseBtn = document.getElementById("habitEntryCloseBtn");
  const habitDeleteBtn = document.getElementById("habitDeleteBtn");
  const backdrop = document.querySelector("[data-close-habit]");

  if (habitForm) {
    habitForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const emoji = document.getElementById("habitEmojiInput").value.trim() || "⭐";
      const name = document.getElementById("habitNameInput").value.trim() || "Nuevo Hábito";
      const goal = Number(document.getElementById("habitGoalInput").value) || 30;

      if (!state.routineTracker) {
        state.routineTracker = { habits: getDefaultRoutineHabits(), monthlyChecks: {} };
      }

      if (editingHabitTarget) {
        const habit = state.routineTracker.habits.find(h => h.id === editingHabitTarget);
        if (habit) {
          habit.emoji = emoji;
          habit.name = name;
          habit.goal = goal;
        }
      } else {
        const newHabit = {
          id: "h_" + Date.now().toString(36),
          name: name,
          emoji: emoji,
          goal: goal
        };
        state.routineTracker.habits.push(newHabit);
      }

      saveState();
      closeHabitModal();
      renderRoutineTracker();
      showToast(editingHabitTarget ? "Hábito actualizado." : "Hábito añadido.");
    });
  }

  if (habitCloseBtn) habitCloseBtn.addEventListener("click", closeHabitModal);
  if (backdrop) backdrop.addEventListener("click", closeHabitModal);

  if (habitDeleteBtn) {
    habitDeleteBtn.addEventListener("click", () => {
      if (editingHabitTarget && confirm("¿Eliminar este hábito de la lista?")) {
        state.routineTracker.habits = state.routineTracker.habits.filter(h => h.id !== editingHabitTarget);
        saveState();
        closeHabitModal();
        renderRoutineTracker();
        showToast("Hábito eliminado.");
      }
    });
  }
}

function openHabitModal(habitId) {
  const modal = document.getElementById("habitEntryModal");
  const title = document.getElementById("habitEntryTitle");
  const emojiInput = document.getElementById("habitEmojiInput");
  const nameInput = document.getElementById("habitNameInput");
  const goalInput = document.getElementById("habitGoalInput");
  const deleteBtn = document.getElementById("habitDeleteBtn");

  if (!modal) return;

  editingHabitTarget = habitId;

  if (habitId) {
    const habit = (state.routineTracker && state.routineTracker.habits) ? state.routineTracker.habits.find(h => h.id === habitId) : null;
    if (habit) {
      title.textContent = "Editar Hábito";
      emojiInput.value = habit.emoji || "⭐";
      nameInput.value = habit.name || "";
      goalInput.value = habit.goal || 30;
      if (deleteBtn) deleteBtn.style.display = "inline-block";
    }
  } else {
    title.textContent = "Añadir Hábito";
    emojiInput.value = "⭐";
    nameInput.value = "";
    goalInput.value = 30;
    if (deleteBtn) deleteBtn.style.display = "none";
  }

  modal.hidden = false;
}

function closeHabitModal() {
  const modal = document.getElementById("habitEntryModal");
  if (modal) modal.hidden = true;
  editingHabitTarget = null;
}

function shiftMonthKey(key, delta) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  const newY = d.getFullYear();
  const newM = String(d.getMonth() + 1).padStart(2, "0");
  return `${newY}-${newM}`;
}

function formatMonthKeyTitle(key) {
  const [y, m] = key.split("-").map(Number);
  const date = new Date(y, m - 1, 1);
  return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" }).toUpperCase();
}

function renderRoutineTracker() {
  if (!state.routineTracker || !Array.isArray(state.routineTracker.habits)) {
    state.routineTracker = { habits: getDefaultRoutineHabits(), monthlyChecks: {} };
  }

  const habits = state.routineTracker.habits;
  const [year, month] = routineActiveMonth.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const checksMap = (state.routineTracker.monthlyChecks && state.routineTracker.monthlyChecks[routineActiveMonth]) || {};

  // Header Title
  const titleEl = document.getElementById("routineMonthTitle");
  if (titleEl) titleEl.textContent = formatMonthKeyTitle(routineActiveMonth);

  // Month Selector Options
  const selectEl = document.getElementById("routineMonthSelect");
  if (selectEl) {
    selectEl.innerHTML = "";
    for (let m = 1; m <= 12; m++) {
      const mKey = `${year}-${String(m).padStart(2, "0")}`;
      const opt = document.createElement("option");
      opt.value = mKey;
      opt.textContent = formatMonthKeyTitle(mKey);
      if (mKey === routineActiveMonth) opt.selected = true;
      selectEl.appendChild(opt);
    }
  }

  // Calculate Metrics
  const donePerDay = {};
  for (let d = 1; d <= daysInMonth; d++) {
    donePerDay[d] = 0;
    habits.forEach(h => {
      if (checksMap[h.id] && checksMap[h.id][d]) {
        donePerDay[d]++;
      }
    });
  }

  const donePerHabit = {};
  habits.forEach(h => {
    donePerHabit[h.id] = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      if (checksMap[h.id] && checksMap[h.id][d]) {
        donePerHabit[h.id]++;
      }
    }
  });

  let grandDone = 0;
  let grandGoal = 0;
  habits.forEach(h => {
    const goal = h.goal || daysInMonth;
    grandDone += donePerHabit[h.id];
    grandGoal += goal;
  });

  const globalPct = grandGoal > 0 ? ((grandDone / grandGoal) * 100).toFixed(1) : "0.0";

  // Summary Badge
  const summaryBadge = document.getElementById("trendMonthSummaryBadge");
  if (summaryBadge) summaryBadge.textContent = `${globalPct}% Cumplido`;

  // Render Sub-components
  renderRoutineTrendChart(daysInMonth, donePerDay, habits.length);
  renderRoutineMatrixTable(year, month, daysInMonth, habits, checksMap);
  renderRoutineWeeklyAnalysis(daysInMonth, habits.length, donePerDay);
  renderRoutineOverview(grandDone, grandGoal, globalPct, habits, donePerHabit, daysInMonth);
  renderRoutineRanking(habits, donePerHabit, daysInMonth);
}

function renderRoutineTrendChart(daysInMonth, donePerDay, totalHabits) {
  const container = document.getElementById("trendChartWrapper");
  if (!container) return;

  if (totalHabits === 0) {
    container.innerHTML = `<div style="text-align:center; color:var(--muted); padding:40px;">Añade hábitos para ver la gráfica de tendencia</div>`;
    return;
  }

  const width = 800;
  const height = 140;
  const paddingX = 30;
  const paddingY = 20;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const points = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const pct = totalHabits > 0 ? donePerDay[d] / totalHabits : 0;
    const x = paddingX + ((d - 1) / Math.max(1, daysInMonth - 1)) * chartW;
    const y = height - paddingY - pct * chartH;
    points.push({ day: d, pct: Math.round(pct * 100), count: donePerDay[d], x, y });
  }

  let dPath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const pPrev = points[i - 1];
    const pCurr = points[i];
    const cpX1 = pPrev.x + (pCurr.x - pPrev.x) / 2;
    const cpY1 = pPrev.y;
    const cpX2 = pPrev.x + (pCurr.x - pPrev.x) / 2;
    const cpY2 = pCurr.y;
    dPath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pCurr.x} ${pCurr.y}`;
  }

  const areaPath = `${dPath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  let gridSvg = "";
  [0, 0.25, 0.5, 0.75, 1].forEach(ratio => {
    const yPos = height - paddingY - ratio * chartH;
    gridSvg += `<line x1="${paddingX}" y1="${yPos}" x2="${width - paddingX}" y2="${yPos}" stroke="var(--line)" stroke-dasharray="3,3" stroke-width="1"/>`;
    gridSvg += `<text x="${paddingX - 6}" y="${yPos + 4}" fill="var(--muted)" font-size="10" text-anchor="end">${Math.round(ratio * 100)}%</text>`;
  });

  let circlesSvg = points.map(p => `
    <circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--accent)" stroke="var(--surface)" stroke-width="2">
      <title>Día ${p.day}: ${p.count}/${totalHabits} hábitos (${p.pct}%)</title>
    </circle>
  `).join("");

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="trend-svg" preserveAspectRatio="none">
      <defs>
        <linearGradient id="themeGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="var(--accent)" stop-opacity="0.02"/>
        </linearGradient>
      </defs>
      ${gridSvg}
      <path d="${areaPath}" fill="url(#themeGradient)"/>
      <path d="${dPath}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>
      ${circlesSvg}
    </svg>
  `;
}

function renderRoutineMatrixTable(year, month, daysInMonth, habits, checksMap) {
  const table = document.getElementById("routineMatrixTable");
  if (!table) return;

  const weeks = [
    { num: 1, name: "SEMANA 1", start: 1, end: Math.min(7, daysInMonth), cls: "week-header-1" },
    { num: 2, name: "SEMANA 2", start: 8, end: Math.min(14, daysInMonth), cls: "week-header-2" },
    { num: 3, name: "SEMANA 3", start: 15, end: Math.min(21, daysInMonth), cls: "week-header-3" },
    { num: 4, name: "SEMANA 4", start: 22, end: Math.min(28, daysInMonth), cls: "week-header-4" }
  ];
  if (daysInMonth > 28) {
    weeks.push({ num: 5, name: "SEMANA 5", start: 29, end: daysInMonth, cls: "week-header-5" });
  }

  let headerHtml = `
    <thead>
      <tr>
        <th class="routine-name-td">RUTINAS Y HÁBITOS</th>
        <th class="goal-td" title="Días objetivo al mes">OBJETIVO</th>
  `;

  weeks.forEach(w => {
    const colSpan = w.end - w.start + 1;
    headerHtml += `<th colspan="${colSpan}" class="${w.cls}">${w.name}</th>`;
  });
  headerHtml += `</tr><tr><th class="routine-name-td"></th><th class="goal-td"></th>`;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month - 1, d);
    const dayName = dateObj.toLocaleDateString("es-ES", { weekday: "short" }).toUpperCase();
    headerHtml += `<th class="day-th">${dayName}<br><span style="font-size:0.85rem; color:var(--ink);">${d}</span></th>`;
  }
  headerHtml += `</tr></thead>`;

  let bodyHtml = `<tbody>`;

  if (habits.length === 0) {
    bodyHtml += `<tr><td colspan="${daysInMonth + 2}" style="padding: 30px; color: var(--muted);">No hay hábitos definidos. Pulsa <strong>+ Añadir Hábito</strong> para comenzar.</td></tr>`;
  } else {
    habits.forEach(h => {
      const goal = h.goal || daysInMonth;
      bodyHtml += `
        <tr>
          <td class="routine-name-td">
            <div class="routine-name-inner">
              <span class="habit-title-text" title="${escapeHtml(h.name)}">
                <span>${h.emoji || "⭐"}</span>
                <span>${escapeHtml(h.name)}</span>
              </span>
              <span class="habit-edit-icon" onclick="openHabitModal('${h.id}')" title="Editar hábito">✏️</span>
            </div>
          </td>
          <td class="goal-td" title="Cambiar días objetivo">
            <input type="number"
                   class="goal-inline-input"
                   min="1"
                   max="31"
                   value="${goal}"
                   data-habit-id="${h.id}"
                   onchange="updateHabitGoalInline('${h.id}', this.value)"
            />
          </td>
      `;

      for (let d = 1; d <= daysInMonth; d++) {
        let weekNum = 1;
        if (d >= 8 && d <= 14) weekNum = 2;
        else if (d >= 15 && d <= 21) weekNum = 3;
        else if (d >= 22 && d <= 28) weekNum = 4;
        else if (d >= 29) weekNum = 5;

        const isChecked = !!(checksMap[h.id] && checksMap[h.id][d]);
        bodyHtml += `
          <td class="check-td">
            <input type="checkbox"
                   class="routine-checkbox week-${weekNum}"
                   ${isChecked ? "checked" : ""}
                   data-habit-id="${h.id}"
                   data-day="${d}"
                   onchange="toggleHabitCheck('${h.id}', ${d})"
            />
          </td>
        `;
      }
      bodyHtml += `</tr>`;
    });
  }

  bodyHtml += `</tbody>`;
  table.innerHTML = headerHtml + bodyHtml;
}

function toggleHabitCheck(habitId, dayNum) {
  if (!state.routineTracker) {
    state.routineTracker = { habits: getDefaultRoutineHabits(), monthlyChecks: {} };
  }
  if (!state.routineTracker.monthlyChecks) {
    state.routineTracker.monthlyChecks = {};
  }
  if (!state.routineTracker.monthlyChecks[routineActiveMonth]) {
    state.routineTracker.monthlyChecks[routineActiveMonth] = {};
  }
  if (!state.routineTracker.monthlyChecks[routineActiveMonth][habitId]) {
    state.routineTracker.monthlyChecks[routineActiveMonth][habitId] = {};
  }

  const current = !!state.routineTracker.monthlyChecks[routineActiveMonth][habitId][dayNum];
  state.routineTracker.monthlyChecks[routineActiveMonth][habitId][dayNum] = !current;

  saveState();
  renderRoutineTracker();
}

function updateHabitGoalInline(habitId, newGoalValue) {
  const val = Math.max(1, Math.min(31, Number(newGoalValue) || 30));
  if (!state.routineTracker || !Array.isArray(state.routineTracker.habits)) return;
  const habit = state.routineTracker.habits.find(h => h.id === habitId);
  if (habit) {
    habit.goal = val;
    saveState();
    renderRoutineTracker();
    showToast(`Objetivo de "${habit.name}" actualizado a ${val} días`);
  }
}

function renderRoutineWeeklyAnalysis(daysInMonth, totalHabits, donePerDay) {
  const barsContainer = document.getElementById("dailyBarsContainer");
  const statsSummary = document.getElementById("weeklyStatsSummary");
  if (!barsContainer || !statsSummary) return;

  let barsHtml = "";
  for (let d = 1; d <= daysInMonth; d++) {
    let weekNum = 1;
    if (d >= 8 && d <= 14) weekNum = 2;
    else if (d >= 15 && d <= 21) weekNum = 3;
    else if (d >= 22 && d <= 28) weekNum = 4;
    else if (d >= 29) weekNum = 5;

    const count = donePerDay[d] || 0;
    const heightPct = totalHabits > 0 ? (count / totalHabits) * 100 : 0;

    barsHtml += `
      <div class="bar-column" title="Día ${d}: ${count}/${totalHabits} hábitos">
        <div class="bar-fill week-${weekNum}" style="height: ${Math.max(2, heightPct)}%;"></div>
      </div>
    `;
  }
  barsContainer.innerHTML = barsHtml;

  const weeks = [
    { num: 1, name: "Semana 1", start: 1, end: Math.min(7, daysInMonth) },
    { num: 2, name: "Semana 2", start: 8, end: Math.min(14, daysInMonth) },
    { num: 3, name: "Semana 3", start: 15, end: Math.min(21, daysInMonth) },
    { num: 4, name: "Semana 4", start: 22, end: Math.min(28, daysInMonth) }
  ];
  if (daysInMonth > 28) {
    weeks.push({ num: 5, name: "Semana 5", start: 29, end: daysInMonth });
  }

  let cardsHtml = `<div class="weekly-progress-grid">`;
  weeks.forEach(w => {
    let weekDone = 0;
    const daysInWeek = w.end - w.start + 1;
    const weekGoal = daysInWeek * totalHabits;

    for (let d = w.start; d <= w.end; d++) {
      weekDone += (donePerDay[d] || 0);
    }

    const pct = weekGoal > 0 ? Math.round((weekDone / weekGoal) * 100) : 0;

    cardsHtml += `
      <div class="weekly-card">
        <div class="weekly-card-title">
          <span>SEMANA ${w.num}</span>
          <span style="color:var(--accent-dark);">${pct}%</span>
        </div>
        <div class="weekly-card-val">${weekDone}/${weekGoal}</div>
        <div class="weekly-card-bar">
          <div class="weekly-card-fill week-${w.num}" style="width: ${pct}%;"></div>
        </div>
      </div>
    `;
  });
  cardsHtml += `</div>`;

  statsSummary.innerHTML = cardsHtml;
}

function renderRoutineOverview(grandDone, grandGoal, globalPct, habits, donePerHabit, daysInMonth) {
  const donutWrapper = document.getElementById("donutSvgWrapper");
  const pctEl = document.getElementById("donutGlobalPct");
  const subEl = document.getElementById("donutGlobalSub");
  const overviewList = document.getElementById("habitOverviewList");

  if (pctEl) pctEl.textContent = `${globalPct}%`;
  if (subEl) subEl.textContent = `${grandDone} de ${grandGoal} completados`;

  if (donutWrapper) {
    const size = 110;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const numPct = Number(globalPct) || 0;
    const offset = circumference - (numPct / 100) * circumference;

    donutWrapper.innerHTML = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="none" stroke="var(--line)" stroke-width="${strokeWidth}"/>
        <circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="none" stroke="var(--accent)" stroke-width="${strokeWidth}"
                stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round"
                transform="rotate(-90 ${size/2} ${size/2})" style="transition: stroke-dashoffset 0.5s ease;"/>
      </svg>
    `;
  }

  if (overviewList) {
    let listHtml = "";
    habits.forEach(h => {
      const goal = h.goal || daysInMonth;
      const done = donePerHabit[h.id] || 0;
      const open = Math.max(0, goal - done);
      const pct = goal > 0 ? Math.round((done / goal) * 100) : 0;

      listHtml += `
        <div class="habit-overview-item">
          <span class="habit-info-name">
            <span>${h.emoji || "⭐"}</span>
            <span>${escapeHtml(h.name)}</span>
          </span>
          <div class="habit-info-stats">
            <span class="habit-stat-badge" title="Completados / Pendientes">${done} / ${open}</span>
            <span style="font-size:0.75rem; font-weight:800; color:var(--accent-dark); width:34px; text-align:right;">${pct}%</span>
            <div class="habit-inline-bar">
              <div class="habit-inline-fill" style="width: ${pct}%;"></div>
            </div>
          </div>
        </div>
      `;
    });
    overviewList.innerHTML = listHtml;
  }
}

function renderRoutineRanking(habits, donePerHabit, daysInMonth) {
  const rankingList = document.getElementById("rankingList");
  if (!rankingList) return;

  const sorted = habits.map(h => {
    const goal = h.goal || daysInMonth;
    const done = donePerHabit[h.id] || 0;
    const pct = goal > 0 ? (done / goal) * 100 : 0;
    return { ...h, done, goal, pct };
  }).sort((a, b) => b.pct - a.pct);

  let html = "";
  sorted.forEach((h, index) => {
    const rank = index + 1;
    let rankClass = "rank-other";
    if (rank === 1) rankClass = "rank-1";
    else if (rank === 2) rankClass = "rank-2";
    else if (rank === 3) rankClass = "rank-3";

    html += `
      <div class="ranking-item">
        <div class="ranking-left">
          <span class="rank-number ${rankClass}">${rank}</span>
          <span class="ranking-name">${h.emoji || "⭐"} ${escapeHtml(h.name)}</span>
        </div>
        <span class="ranking-pct-pill">${h.pct.toFixed(0)}%</span>
      </div>
    `;
  });
  rankingList.innerHTML = html;
}

// --- Controladores y Renderizadores de Checklist (Tareas) ---

function switchView(viewName) {
  if (viewName === "calendar") {
    tabCalendar.classList.add("active");
    tabCalendar.setAttribute("aria-selected", "true");
    tabChecklist.classList.remove("active");
    tabChecklist.setAttribute("aria-selected", "false");
    
    if (paneCalendar) paneCalendar.hidden = false;
    if (paneCalendarDayDetails) paneCalendarDayDetails.hidden = false;
    if (paneChecklistSelectedDay) paneChecklistSelectedDay.hidden = true;
    if (paneChecklistMain) paneChecklistMain.hidden = true;
    
    if (workspaceEl) {
      workspaceEl.classList.remove("checklist-active");
    }
    renderCalendar();
  } else {
    tabChecklist.classList.add("active");
    tabChecklist.setAttribute("aria-selected", "true");
    tabCalendar.classList.remove("active");
    tabCalendar.setAttribute("aria-selected", "false");
    
    if (paneCalendar) paneCalendar.hidden = true;
    if (paneCalendarDayDetails) paneCalendarDayDetails.hidden = true;
    if (paneChecklistSelectedDay) paneChecklistSelectedDay.hidden = true;
    if (paneChecklistMain) paneChecklistMain.hidden = false;
    
    if (workspaceEl) {
      workspaceEl.classList.add("checklist-active");
    }
    
    renderRoutineTracker();
  }
}

function getGroupedSubjectsAndTracks() {
  const groups = [];
  
  for (const period of academicPeriods) {
    const periodSubjects = subjects.filter(s => period.subjects.includes(s.name));
    if (periodSubjects.length > 0) {
      groups.push({
        label: period.name,
        type: "subject",
        items: periodSubjects
      });
    }
  }
  
  const assignedSubjectNames = new Set(academicPeriods.flatMap(p => p.subjects));
  const unassignedSubjects = subjects.filter(s => !assignedSubjectNames.has(s.name));
  if (unassignedSubjects.length > 0) {
    const subPlural = state.settings.subjectsLabelPlural || "Asignaturas";
    groups.push({
      label: academicPeriods.length > 0 ? `${subPlural} (sin curso)` : subPlural,
      type: "subject",
      items: unassignedSubjects
    });
  }
  
  if (EXTRA_TRACKS.length > 0) {
    groups.push({
      label: state.settings.hobbiesLabelPlural || "Hobbies",
      type: "track",
      items: EXTRA_TRACKS
    });
  }
  
  return groups;
}

function renderChecklistFilters() {
  if (!filterSubjectEl) return;
  const currentFilterValue = filterSubjectEl.value;
  filterSubjectEl.innerHTML = '<option value="all">Todos los items</option>';
  
  const groups = getGroupedSubjectsAndTracks();
  for (const group of groups) {
    const optGroup = document.createElement("optgroup");
    optGroup.label = group.label;
    for (const item of group.items) {
      const opt = document.createElement("option");
      if (group.type === "subject") {
        opt.value = `subject:${item.name}`;
        opt.textContent = item.name;
      } else {
        opt.value = `track:${item.key}`;
        opt.textContent = item.label;
      }
      optGroup.appendChild(opt);
    }
    filterSubjectEl.appendChild(optGroup);
  }
  
  if (Array.from(filterSubjectEl.options).some(o => o.value === currentFilterValue)) {
    filterSubjectEl.value = currentFilterValue;
  } else {
    filterSubjectEl.value = "all";
  }
}

function renderTaskLinkOptions(selectedValue = "") {
  if (!taskLinkEl) return;
  taskLinkEl.innerHTML = '<option value="">Ninguno (sin vincular)</option>';
  
  const groups = getGroupedSubjectsAndTracks();
  for (const group of groups) {
    const optGroup = document.createElement("optgroup");
    optGroup.label = group.label;
    for (const item of group.items) {
      const opt = document.createElement("option");
      if (group.type === "subject") {
        opt.value = `subject:${item.name}`;
        opt.textContent = item.name;
      } else {
        opt.value = `track:${item.key}`;
        opt.textContent = item.label;
      }
      optGroup.appendChild(opt);
    }
    taskLinkEl.appendChild(optGroup);
  }
  
  taskLinkEl.value = selectedValue;
}

function openTaskEntry(targetTask = null, defaultDate = "") {
  if (targetTask) {
    editingTaskTarget = targetTask.id;
    taskEntryTitleEl.textContent = "Editar tarea";
    taskSubmitBtn.textContent = "Guardar cambios";
    taskTextEl.value = targetTask.text;
    if (taskDescriptionEl) {
      taskDescriptionEl.value = targetTask.description || "";
    }
    renderTaskLinkOptions(targetTask.linkType ? `${targetTask.linkType}:${targetTask.linkKey}` : "");
    taskDueDateEl.value = targetTask.dueDate || "";
    taskDifficultyEl.value = targetTask.difficulty || 3;
  } else {
    editingTaskTarget = null;
    taskEntryTitleEl.textContent = "Añadir tarea";
    taskSubmitBtn.textContent = "Añadir tarea";
    taskTextEl.value = "";
    if (taskDescriptionEl) {
      taskDescriptionEl.value = "";
    }
    renderTaskLinkOptions("");
    taskDueDateEl.value = defaultDate || "";
    taskDifficultyEl.value = 3;
  }
  taskEntryModalEl.hidden = false;
  taskTextEl.focus();
}

function closeTaskEntry() {
  editingTaskTarget = null;
  taskEntryModalEl.hidden = true;
  taskFormEl.reset();
  if (taskDescriptionEl) {
    taskDescriptionEl.value = "";
  }
}

function saveTask(event) {
  event.preventDefault();
  const text = taskTextEl.value.trim();
  if (!text) {
    showToast("Escribe la tarea antes de guardarla.");
    return;
  }
  const description = taskDescriptionEl ? taskDescriptionEl.value.trim() : "";
  
  let linkType = "";
  let linkKey = "";
  if (taskLinkEl.value) {
    const parts = taskLinkEl.value.split(":");
    linkType = parts[0];
    linkKey = parts.slice(1).join(":");
  }
  
  const dueDate = taskDueDateEl.value || "";
  const difficulty = clampDifficulty(taskDifficultyEl.value);
  
  if (!state.checklistTasks) state.checklistTasks = [];
  
  if (editingTaskTarget) {
    const taskIdx = state.checklistTasks.findIndex(t => t.id === editingTaskTarget);
    if (taskIdx >= 0) {
      state.checklistTasks[taskIdx] = {
        ...state.checklistTasks[taskIdx],
        text,
        description,
        linkType,
        linkKey,
        dueDate,
        difficulty
      };
    }
    showToast("Tarea actualizada.");
  } else {
    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      description,
      completed: false,
      linkType,
      linkKey,
      dueDate,
      difficulty,
      createdAt: new Date().toISOString(),
      completedAt: ""
    };
    state.checklistTasks.push(newTask);
    showToast("Tarea añadida.");
  }
  
  closeTaskEntry();
  saveState();
  refreshChecklistAll();
  
  if (dueDate) {
    refreshDayCell(dueDate);
  }
}

function refreshChecklistAll() {
  renderChecklistFilters();
  renderChecklistInlineLinkOptions();
  renderChecklistSelectedDay();
  if (typeof renderChecklistCalendarPreview === "function") {
    renderChecklistCalendarPreview();
  }
  renderChecklist();
  renderChecklistStats();
  renderDayTasks();
  renderCalendar();
}

function handleChecklistClick(event) {
  const checkbox = event.target.closest(".task-checkbox-input");
  if (checkbox) {
    const taskId = checkbox.dataset.taskId;
    toggleTaskCompletion(taskId);
    return;
  }
  
  const editBtn = event.target.closest("[data-edit-task-id]");
  if (editBtn) {
    const taskId = editBtn.dataset.editTaskId;
    const task = state.checklistTasks.find(t => t.id === taskId);
    if (task) {
      openTaskEntry(task);
    }
    return;
  }
  
  const deleteBtn = event.target.closest("[data-delete-task-id]");
  if (deleteBtn) {
    const taskId = deleteBtn.dataset.deleteTaskId;
    deleteTask(taskId);
    return;
  }

  const card = event.target.closest(".task-card");
  if (card) {
    if (event.target.closest(".task-checkbox-wrapper") || event.target.closest(".notice-actions")) {
      return;
    }
    const taskId = card.dataset.taskId;
    const task = state.checklistTasks.find(t => t.id === taskId);
    if (task) {
      openTaskDetailsModal(task);
    }
  }
}

function toggleTaskCompletion(taskId) {
  const task = state.checklistTasks.find(t => t.id === taskId);
  if (!task) return;
  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date().toISOString() : "";
  saveState();
  refreshChecklistAll();
  if (task.dueDate) {
    refreshDayCell(task.dueDate);
  }
}

function deleteTask(taskId) {
  const task = state.checklistTasks.find(t => t.id === taskId);
  if (!task) return;
  const ok = confirm(`¿Estás seguro de que deseas eliminar la tarea "${task.text}"?`);
  if (!ok) return;
  state.checklistTasks = state.checklistTasks.filter(t => t.id !== taskId);
  saveState();
  refreshChecklistAll();
  if (task.dueDate) {
    refreshDayCell(task.dueDate);
  }
  showToast("Tarea eliminada.");
}

function renderChecklist() {
  if (!checklistListEl) return;
  checklistListEl.innerHTML = "";
  
  const query = (taskSearchInputEl.value || "").trim().toLowerCase();
  const filterProj = filterSubjectEl.value || "all";
  const filterStat = filterStatusEl.value || "all";
  const sortBy = filterSortEl.value || "dueDate";
  
  let list = state.checklistTasks || [];
  
  if (selectedPreviewDateFilter) {
    list = list.filter(t => t.dueDate === selectedPreviewDateFilter);
    if (dayFilterIndicator) {
      dayFilterIndicator.style.display = "inline-flex";
    }
  } else {
    if (dayFilterIndicator) {
      dayFilterIndicator.style.display = "none";
    }
  }
  
  if (query) {
    list = list.filter(t => t.text.toLowerCase().includes(query));
  }
  
  if (filterProj !== "all") {
    const parts = filterProj.split(":");
    const linkType = parts[0];
    const linkKey = parts.slice(1).join(":");
    list = list.filter(t => t.linkType === linkType && t.linkKey === linkKey);
  }
  
  if (filterStat === "pending") {
    list = list.filter(t => !t.completed);
  } else if (filterStat === "completed") {
    list = list.filter(t => t.completed);
  }
  
  list = list.slice().sort((a, b) => {
    if (sortBy === "dueDate") {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    } else if (sortBy === "difficulty") {
      return (b.difficulty || 3) - (a.difficulty || 3);
    } else {
      return b.createdAt.localeCompare(a.createdAt);
    }
  });
  
  if (list.length === 0) {
    checklistListEl.innerHTML = `<div class="empty-state">No hay tareas que coincidan con los filtros.</div>`;
    return;
  }
  
  const todayKey = getTodayDateKey();
  
  for (const task of list) {
    const item = document.createElement("div");
    item.className = `task-card ${task.completed ? "completed" : ""}`;
    item.dataset.taskId = task.id;
    
    let taskColor = "var(--line)";
    let linkLabel = "";
    if (task.linkType === "subject") {
      const subject = subjects.find(s => s.name === task.linkKey);
      taskColor = subject ? subject.color : "var(--accent)";
      linkLabel = task.linkKey;
    } else if (task.linkType === "track") {
      const track = EXTRA_TRACKS.find(t => t.key === task.linkKey);
      taskColor = track ? track.color : "#d97706";
      linkLabel = track ? track.label : task.linkKey;
    }
    
    item.style.borderLeftColor = taskColor;
    
    let dateHtml = "";
    if (task.dueDate) {
      const isOverdue = !task.completed && task.dueDate < todayKey;
      const dateLabel = formatShortDate(task.dueDate);
      dateHtml = `<span class="task-date-tag ${isOverdue ? "overdue" : ""}">📅 ${dateLabel}${isOverdue ? " (atrasada)" : ""}</span>`;
    }
    
    const tagHtml = linkLabel ? `<span class="task-tag" style="background:${hexToSoftBackground(taskColor)}; color:${taskColor};">${escapeHtml(linkLabel)}</span>` : "";
    const starsHtml = `<span class="task-difficulty-stars">${"★".repeat(task.difficulty)}${"☆".repeat(5 - task.difficulty)}</span>`;
    
    item.innerHTML = `
      <label class="task-checkbox-wrapper">
        <input type="checkbox" class="task-checkbox-input" data-task-id="${task.id}" ${task.completed ? "checked" : ""}>
        <span class="task-checkbox-custom"></span>
      </label>
      <div class="task-content-col">
        <span class="task-text">${escapeHtml(task.text)}</span>
        <div class="task-meta-row">
          ${tagHtml}
          ${dateHtml}
          ${starsHtml}
        </div>
      </div>
      <div class="notice-actions">
        <button type="button" class="notice-action" data-edit-task-id="${task.id}" title="Editar" style="color: var(--accent); border-color: rgba(var(--accent-rgb), 0.25);">✎</button>
        <button type="button" class="notice-action" data-delete-task-id="${task.id}" title="Eliminar" style="color: #dc2626; border-color: rgba(220, 38, 38, 0.25);">🗑</button>
      </div>
    `;
    checklistListEl.appendChild(item);
  }
}

function renderChecklistStats() {
  if (!totalTasksCountEl) return;
  const list = state.checklistTasks || [];
  const total = list.length;
  const completed = list.filter(t => t.completed).length;
  const pending = total - completed;
  
  const todayKey = getTodayDateKey();
  const overdue = list.filter(t => !t.completed && t.dueDate && t.dueDate < todayKey).length;
  
  totalTasksCountEl.textContent = total;
  completedTasksCountEl.textContent = completed;
  pendingTasksCountEl.textContent = pending;
  overdueTasksCountEl.textContent = overdue;
  
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  completedPercentageEl.textContent = `${pct}%`;
  
  // Calcular las nuevas métricas interesantes y no de relleno
  // 1. Dificultad media de tareas pendientes
  const pendingTasks = list.filter(t => !t.completed);
  const avgDiffVal = pendingTasks.length > 0
    ? (pendingTasks.reduce((sum, t) => sum + (t.difficulty || 3), 0) / pendingTasks.length).toFixed(1)
    : "—";
  const avgPendingDifficultyEl = document.getElementById("avgPendingDifficulty");
  if (avgPendingDifficultyEl) {
    avgPendingDifficultyEl.textContent = avgDiffVal !== "—" ? `${avgDiffVal} ★` : "—";
  }
  
  // 2. Próximos 7 días
  const todayVal = new Date(todayKey);
  const nextWeekVal = new Date(todayVal.getTime() + 7 * 86400000);
  const nextWeekKey = toDateKey(nextWeekVal);
  const dueSoonTasks = list.filter(t => !t.completed && t.dueDate && t.dueDate >= todayKey && t.dueDate <= nextWeekKey).length;
  const dueSoonTasksCountEl = document.getElementById("dueSoonTasksCount");
  if (dueSoonTasksCountEl) {
    dueSoonTasksCountEl.textContent = dueSoonTasks;
  }
  
  // 3. Racha de completado (días consecutivos completando tareas)
  const completedDates = list
    .filter(t => t.completed && t.completedAt)
    .map(t => t.completedAt.split('T')[0]);
  const uniqueDates = Array.from(new Set(completedDates)).sort();
  let streak = 0;
  if (uniqueDates.length > 0) {
    const yesterday = new Date(todayVal.getTime() - 86400000);
    const yesterdayStr = toDateKey(yesterday);
    if (uniqueDates.includes(todayKey) || uniqueDates.includes(yesterdayStr)) {
      let tempDate = uniqueDates.includes(todayKey) ? new Date(todayVal) : yesterday;
      while (true) {
        const tempStr = toDateKey(tempDate);
        if (uniqueDates.includes(tempStr)) {
          streak++;
          tempDate.setDate(tempDate.getDate() - 1);
        } else {
          break;
        }
      }
    }
  }
  const taskCompletionStreakEl = document.getElementById("taskCompletionStreak");
  if (taskCompletionStreakEl) {
    taskCompletionStreakEl.textContent = streak === 1 ? "1 día" : `${streak} días`;
  }
  
  // 4. Proyecto o hobby más exigente (más tareas pendientes)
  const pendingGroups = {};
  for (const task of list) {
    if (!task.completed && task.linkType) {
      const gkey = `${task.linkType}:${task.linkKey}`;
      pendingGroups[gkey] = (pendingGroups[gkey] || 0) + 1;
    }
  }
  let maxPending = 0;
  let mostDemandingKey = "";
  for (const [key, val] of Object.entries(pendingGroups)) {
    if (val > maxPending) {
      maxPending = val;
      mostDemandingKey = key;
    }
  }
  let mostDemandingLabel = "Ninguno";
  if (mostDemandingKey) {
    const parts = mostDemandingKey.split(":");
    const linkType = parts[0];
    const linkKey = parts.slice(1).join(":");
    if (linkType === "subject") {
      const subject = subjects.find(s => s.name === linkKey);
      mostDemandingLabel = subject ? subject.name : linkKey;
    } else if (linkType === "track") {
      const track = EXTRA_TRACKS.find(t => t.key === linkKey);
      mostDemandingLabel = track ? track.label : linkKey;
    }
    mostDemandingLabel += ` (${maxPending})`;
  }
  const mostDemandingSubjectEl = document.getElementById("mostDemandingSubject");
  if (mostDemandingSubjectEl) {
    mostDemandingSubjectEl.textContent = mostDemandingLabel;
  }
  
  taskStatsChartEl.innerHTML = "";
  
  const taskGroups = {};
  for (const s of subjects) {
    taskGroups[`subject:${s.name}`] = { label: s.name, color: s.color, total: 0, completed: 0 };
  }
  for (const t of EXTRA_TRACKS) {
    taskGroups[`track:${t.key}`] = { label: t.label, color: t.color, total: 0, completed: 0 };
  }
  
  for (const task of list) {
    if (task.linkType) {
      const gkey = `${task.linkType}:${task.linkKey}`;
      if (!taskGroups[gkey]) {
        taskGroups[gkey] = { label: task.linkKey, color: "var(--accent)", total: 0, completed: 0 };
      }
      taskGroups[gkey].total++;
      if (task.completed) taskGroups[gkey].completed++;
    }
  }
  
  const activeGroups = Object.values(taskGroups).filter(g => g.total > 0);
  if (activeGroups.length === 0) {
    taskStatsChartEl.innerHTML = `<div class="empty-state" style="border: 0; text-align: center; color: var(--muted); padding: 12px 0;">Vincula tareas a tus asignaturas o hobbies para ver su rendimiento aquí.</div>`;
    return;
  }
  
  activeGroups.sort((a, b) => b.total - a.total);
  
  for (const group of activeGroups) {
    const ratio = (group.completed / group.total) * 100;
    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <span class="bar-label">
        <span style="font-weight:700;">${escapeHtml(group.label)}</span>
        <small>${group.completed}/${group.total}</small>
      </span>
      <span class="bar-track">
        <span class="bar-fill" style="background:${group.color}; width:${ratio}%"></span>
      </span>
      <span class="bar-value">${Math.round(ratio)}%</span>
    `;
    taskStatsChartEl.appendChild(row);
  }
}

function renderDayTasks() {
  if (!dayTasksListEl) return;
  dayTasksListEl.innerHTML = "";
  
  const list = (state.checklistTasks || []).filter(t => t.dueDate === selectedDate);
  
  if (list.length === 0) {
    dayTasksListEl.innerHTML = `<div class="empty-state" style="padding: 8px 10px; font-size:0.78rem;">No hay tareas programadas para este día.</div>`;
    return;
  }
  
  for (const task of list) {
    const item = document.createElement("div");
    item.className = `day-task-item ${task.completed ? "completed" : ""}`;
    item.dataset.taskId = task.id;
    
    let taskColor = "var(--line)";
    if (task.linkType === "subject") {
      const subject = subjects.find(s => s.name === task.linkKey);
      taskColor = subject ? subject.color : "var(--accent)";
    } else if (task.linkType === "track") {
      const track = EXTRA_TRACKS.find(t => t.key === task.linkKey);
      taskColor = track ? track.color : "#d97706";
    }
    item.style.borderLeftColor = taskColor;
    
    item.innerHTML = `
      <label class="task-checkbox-wrapper" style="margin-right: 4px;">
        <input type="checkbox" class="task-checkbox-input" data-task-id="${task.id}" ${task.completed ? "checked" : ""}>
        <span class="task-checkbox-custom" style="width:16px; height:16px; border-radius:4px;"></span>
      </label>
      <span class="day-task-text" style="font-size:0.82rem;">${escapeHtml(task.text)}</span>
      <div class="notice-actions">
        <button type="button" class="notice-action" data-edit-task-id="${task.id}" title="Editar">✎</button>
        <button type="button" class="notice-action" data-delete-task-id="${task.id}" title="Eliminar" style="color: #dc2626; border-color: rgba(220, 38, 38, 0.25);">🗑</button>
      </div>
    `;
    dayTasksListEl.appendChild(item);
  }
}

function handleDayTasksClick(event) {
  const checkbox = event.target.closest(".task-checkbox-input");
  if (checkbox) {
    const taskId = checkbox.dataset.taskId;
    toggleTaskCompletion(taskId);
    return;
  }
  
  const editBtn = event.target.closest("[data-edit-task-id]");
  if (editBtn) {
    const taskId = editBtn.dataset.editTaskId;
    const task = state.checklistTasks.find(t => t.id === taskId);
    if (task) {
      openTaskEntry(task);
    }
    return;
  }
  
  const deleteBtn = event.target.closest("[data-delete-task-id]");
  if (deleteBtn) {
    const taskId = deleteBtn.dataset.deleteTaskId;
    deleteTask(taskId);
    return;
  }

  const item = event.target.closest(".day-task-item");
  if (item) {
    if (event.target.closest(".task-checkbox-wrapper") || event.target.closest(".notice-actions")) {
      return;
    }
    const taskId = item.dataset.taskId;
    const task = state.checklistTasks.find(t => t.id === taskId);
    if (task) {
      openTaskDetailsModal(task);
    }
  }
}

function openTaskDetailsModal(task) {
  currentViewingTaskId = task.id;
  if (taskDetailsTitleEl) taskDetailsTitleEl.textContent = task.text;
  if (taskDetailsDescEl) taskDetailsDescEl.textContent = task.description || "Sin descripción.";
  
  let linkLabel = "Ninguno (sin vincular)";
  let taskColor = "var(--line)";
  if (task.linkType === "subject") {
    const subject = subjects.find(s => s.name === task.linkKey);
    taskColor = subject ? subject.color : "var(--accent)";
    linkLabel = task.linkKey;
  } else if (task.linkType === "track") {
    const track = EXTRA_TRACKS.find(t => t.key === task.linkKey);
    taskColor = track ? track.color : "#d97706";
    linkLabel = track ? track.label : task.linkKey;
  }
  if (taskDetailsLinkEl) {
    taskDetailsLinkEl.innerHTML = linkLabel !== "Ninguno (sin vincular)"
      ? `<span class="task-tag" style="background:${hexToSoftBackground(taskColor)}; color:${taskColor};">${escapeHtml(linkLabel)}</span>`
      : `<span style="color: var(--muted); font-style: italic;">Sin vincular</span>`;
  }
  
  if (taskDetailsDifficultyEl) {
    taskDetailsDifficultyEl.innerHTML = "★".repeat(task.difficulty) + "☆".repeat(5 - task.difficulty);
  }
  
  if (taskDetailsDueDateEl) {
    if (task.dueDate) {
      const todayKey = getTodayDateKey();
      const isOverdue = !task.completed && task.dueDate < todayKey;
      const dateLabel = formatDateLong(task.dueDate);
      taskDetailsDueDateEl.innerHTML = isOverdue
        ? `<span style="color: #dc2626; font-weight: bold;">📅 ${dateLabel} (atrasada)</span>`
        : `<span>📅 ${dateLabel}</span>`;
    } else {
      taskDetailsDueDateEl.innerHTML = `<span style="color: var(--muted); font-style: italic;">Sin fecha</span>`;
    }
  }
  
  if (taskDetailsCheckboxEl) taskDetailsCheckboxEl.checked = task.completed;
  if (taskDetailsStatusTextEl) {
    taskDetailsStatusTextEl.textContent = task.completed ? "Completada" : "Pendiente";
    taskDetailsStatusTextEl.style.color = task.completed ? "#16a34a" : "var(--muted)";
  }
  
  if (taskDetailsModalEl) taskDetailsModalEl.hidden = false;
}

function closeTaskDetailsModal() {
  currentViewingTaskId = null;
  if (taskDetailsModalEl) taskDetailsModalEl.hidden = true;
}

// --- Nuevos Controladores y Renderizadores de Checklist Layout ---

function saveChecklistInPageTask(event) {
  event.preventDefault();
  const text = checklistTaskTextEl.value.trim();
  if (!text) {
    showToast("Escribe la tarea antes de guardarla.");
    return;
  }
  const description = checklistTaskDescriptionEl ? checklistTaskDescriptionEl.value.trim() : "";
  
  let linkType = "";
  let linkKey = "";
  if (checklistTaskLinkEl.value) {
    const parts = checklistTaskLinkEl.value.split(":");
    linkType = parts[0];
    linkKey = parts.slice(1).join(":");
  }
  
  const dueDate = checklistTaskDueDateEl.value || "";
  const difficulty = clampDifficulty(checklistTaskDifficultyEl.value);
  
  if (!state.checklistTasks) state.checklistTasks = [];
  
  const newTask = {
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    text,
    description,
    completed: false,
    linkType,
    linkKey,
    dueDate,
    difficulty,
    createdAt: new Date().toISOString(),
    completedAt: ""
  };
  state.checklistTasks.push(newTask);
  showToast("Tarea añadida.");
  
  checklistAddFormEl.reset();
  if (checklistTaskDescriptionEl) checklistTaskDescriptionEl.value = "";
  checklistTaskDueDateEl.value = selectedDate;
  checklistTaskDifficultyEl.value = 3;
  
  saveState();
  refreshChecklistAll();
  
  if (dueDate) {
    refreshDayCell(dueDate);
  }
}

function renderChecklistInlineLinkOptions() {
  if (!checklistTaskLinkEl) return;
  checklistTaskLinkEl.innerHTML = '<option value="">Ninguno (sin vincular)</option>';
  
  const groups = getGroupedSubjectsAndTracks();
  for (const group of groups) {
    const optGroup = document.createElement("optgroup");
    optGroup.label = group.label;
    for (const item of group.items) {
      const opt = document.createElement("option");
      if (group.type === "subject") {
        opt.value = `subject:${item.name}`;
        opt.textContent = item.name;
      } else {
        opt.value = `track:${item.key}`;
        opt.textContent = item.label;
      }
      optGroup.appendChild(opt);
    }
    checklistTaskLinkEl.appendChild(optGroup);
  }
}

function renderChecklistSelectedDay() {
  if (!checklistSelectedWeekdayEl || !checklistSelectedDateEl) return;
  checklistSelectedWeekdayEl.textContent = formatWeekday(selectedDate);
  checklistSelectedDateEl.textContent = formatDateLong(selectedDate);
  
  if (checklistTaskDueDateEl) {
    checklistTaskDueDateEl.value = selectedDate;
  }
  
  renderChecklistDayTasks();
}

function renderChecklistDayTasks() {
  if (!checklistDayTasksListEl) return;
  checklistDayTasksListEl.innerHTML = "";
  
  const list = (state.checklistTasks || []).filter(t => t.dueDate === selectedDate);
  
  if (list.length === 0) {
    checklistDayTasksListEl.innerHTML = `<div class="empty-state" style="padding: 12px 14px; font-size:0.86rem; text-align: center; color: var(--muted);">No hay tareas programadas para este día.</div>`;
    return;
  }
  
  for (const task of list) {
    const item = document.createElement("div");
    item.className = `day-task-item ${task.completed ? "completed" : ""}`;
    item.style.padding = "10px 12px";
    item.dataset.taskId = task.id;
    
    let taskColor = "var(--line)";
    if (task.linkType === "subject") {
      const subject = subjects.find(s => s.name === task.linkKey);
      taskColor = subject ? subject.color : "var(--accent)";
    } else if (task.linkType === "track") {
      const track = EXTRA_TRACKS.find(t => t.key === task.linkKey);
      taskColor = track ? track.color : "#d97706";
    }
    item.style.borderLeftColor = taskColor;
    item.style.borderLeftWidth = "4px";
    
    item.innerHTML = `
      <label class="task-checkbox-wrapper" style="margin-right: 4px;">
        <input type="checkbox" class="task-checkbox-input" data-task-id="${task.id}" ${task.completed ? "checked" : ""}>
        <span class="task-checkbox-custom" style="width:16px; height:16px; border-radius:4px;"></span>
      </label>
      <span class="day-task-text" style="font-size:0.86rem;">${escapeHtml(task.text)}</span>
      <div class="notice-actions">
        <button type="button" class="notice-action" data-edit-task-id="${task.id}" title="Editar">✎</button>
        <button type="button" class="notice-action" data-delete-task-id="${task.id}" title="Eliminar" style="color: #dc2626; border-color: rgba(220, 38, 38, 0.25);">🗑</button>
      </div>
    `;
    checklistDayTasksListEl.appendChild(item);
  }
}


// --- Renderizador de la Vista Previa del Calendario (Checklist) ---

function renderChecklistCalendarPreview() {
  if (!calendarPreviewGrid) return;
  calendarPreviewGrid.innerHTML = "";
  
  const year = previewVisibleMonth.getFullYear();
  const month = previewVisibleMonth.getMonth();
  
  // Actualizar título del mes
  const monthTitleEl = document.querySelector(".calendar-preview-month-title");
  if (monthTitleEl) {
    monthTitleEl.textContent = `${getMonthLabel(previewVisibleMonth)} ${year}`;
  }
  
  const first = new Date(year, month, 1);
  const blanks = (first.getDay() + 6) % 7;
  for (let i = 0; i < blanks; i++) {
    const blank = document.createElement("div");
    blank.className = "blank-cell";
    blank.style.minHeight = "36px";
    calendarPreviewGrid.appendChild(blank);
  }
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = getTodayDateKey();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(year, month, day);
    const key = toDateKey(cellDate);
    
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "day-cell preview-day-cell";
    
    // Asignar clase de fin de semana
    if ([0, 6].includes(cellDate.getDay())) {
      cell.classList.add("weekend");
    }
    
    // Resaltar según filtro de vista previa y día actual
    if (key === selectedPreviewDateFilter) {
      cell.classList.add("selected");
    } else if (key === TODAY_DATE) {
      cell.classList.add("today");
    }
    
    // Número del día
    const numSpan = document.createElement("span");
    numSpan.textContent = day;
    numSpan.style.fontWeight = "bold";
    cell.appendChild(numSpan);
    
    // Comprobar si hay tareas pendientes o completadas para este día
    const dayTasks = (state.checklistTasks || []).filter(t => t.dueDate === key);
    if (dayTasks.length > 0) {
      const dotsContainer = document.createElement("div");
      dotsContainer.style.display = "flex";
      dotsContainer.style.gap = "2px";
      dotsContainer.style.justifyContent = "center";
      
      const pendingCount = dayTasks.filter(t => !t.completed).length;
      const completedCount = dayTasks.length - pendingCount;
      
      if (pendingCount > 0) {
        const dot = document.createElement("span");
        dot.style.width = "5px";
        dot.style.height = "5px";
        dot.style.borderRadius = "50%";
        dot.style.background = "#6366f1"; // Índigo para tareas pendientes
        dotsContainer.appendChild(dot);
      }
      if (completedCount > 0) {
        const dot = document.createElement("span");
        dot.style.width = "5px";
        dot.style.height = "5px";
        dot.style.borderRadius = "50%";
        dot.style.background = "#10b981"; // Esmeralda para tareas completadas
        dotsContainer.appendChild(dot);
      }
      cell.appendChild(dotsContainer);
    }
    
    cell.addEventListener("click", () => {
      if (selectedPreviewDateFilter === key) {
        selectedPreviewDateFilter = null;
      } else {
        selectedPreviewDateFilter = key;
        selectedDate = key;
        renderSelectedDay();
      }
      renderChecklistCalendarPreview();
      renderChecklist();
    });
    
    calendarPreviewGrid.appendChild(cell);
  }
}

// ==========================================
// INFORME AVANZADO INTERACTIVO DE PERIODO
// ==========================================

function openPeriodReportModal() {
  if (!periodReportModalEl || !latestStats) return;
  const { currentPeriod, isVacation } = getActiveStatsContext();
  if (!currentPeriod || isVacation) return;
  if (getTodayDateKey() < currentPeriod.endDate) {
    showToast("El informe solo está disponible al finalizar el curso / periodo.");
    return;
  }

  const titleEl = document.getElementById("periodReportTitle");
  if (titleEl) titleEl.textContent = currentPeriod.name;

  const { totalHours, totalStudy, totalTracks, activeDays, keys, averageRating, totalsBySubject, totalsByTrack } = latestStats;

  document.getElementById("repTotalHours").textContent = `${formatNumber(totalHours)} h`;
  document.getElementById("repStudyHours").textContent = `${formatNumber(totalStudy)} h`;
  document.getElementById("repHobbyHours").textContent = `${formatNumber(totalTracks)} h`;
  document.getElementById("repActiveDays").textContent = `${activeDays}`;

  // Narrativa de Energía y Productividad
  const narrativeEl = document.getElementById("repEnergyNarrative");
  if (narrativeEl) {
    if (totalHours === 0) {
      narrativeEl.textContent = "Aún no hay actividad registrada en este periodo. ¡Empieza a añadir horas a tus asignaturas o hobbies para ver tu análisis de rendimiento!";
    } else if (totalStudy === 0) {
      narrativeEl.textContent = `Este periodo ha estado completamente enfocado en el descanso y desarrollo personal. Has dedicado el 100% de tu tiempo activo (${formatNumber(totalTracks)} h) a tus hobbies y pasiones. ¡Una excelente forma de recargar energía!`;
    } else if (totalTracks === 0) {
      narrativeEl.textContent = `Has mantenido un enfoque de estudio intensivo del 100% (${formatNumber(totalStudy)} h) sin registrar tiempo en hobbies. Recuerda que mantener un equilibrio con actividades recreativas ayuda a consolidar la memoria y evitar el burnout.`;
    } else {
      const studyRatio = Math.round((totalStudy / totalHours) * 100);
      const trackRatio = 100 - studyRatio;
      narrativeEl.textContent = `Has mantenido un balance del ${studyRatio}% en tus responsabilidades académicas y un ${trackRatio}% en tus hobbies. Esta distribución demuestra una gestión del tiempo saludable, permitiendo progreso continuo sin sacrificar tu bienestar personal.`;
    }
  }

  // Tareas Completadas del Periodo
  const activeSubjectNames = new Set((latestStats.activeSubjects || []).map(s => s.name));
  const activeTrackKeys = new Set((latestStats.activeTracks || []).map(t => t.key));
  const periodTasks = (state.checklistTasks || []).filter(t => {
    if (t.linkType === "subject") return activeSubjectNames.has(t.linkKey);
    if (t.linkType === "track") return activeTrackKeys.has(t.linkKey);
    if (currentPeriod && currentPeriod.startDate && currentPeriod.endDate) {
      return t.dueDate >= currentPeriod.startDate && t.dueDate <= currentPeriod.endDate;
    }
    return true;
  });

  const completedTasks = periodTasks.filter(t => t.completed).length;
  const totalTasksCount = periodTasks.length;
  const taskRatio = totalTasksCount > 0 ? (completedTasks / totalTasksCount) * 100 : 0;

  document.getElementById("repTasksCompleted").textContent = completedTasks;
  document.getElementById("repTasksTotal").textContent = `de ${totalTasksCount} tareas`;
  document.getElementById("repTasksBar").style.width = `${taskRatio}%`;

  // Estado de Ánimo
  const fullStars = Math.round(averageRating || 0);
  document.getElementById("repAvgRatingStars").textContent = `${"★".repeat(fullStars)}${"☆".repeat(5 - fullStars)}`;
  document.getElementById("repAvgRatingText").textContent = `(${formatNumber(averageRating)})`;

  const ratingDescEl = document.getElementById("repRatingDesc");
  if (ratingDescEl) {
    if (averageRating >= 4.5) ratingDescEl.textContent = "¡Un estado de ánimo excepcional! Has mantenido una motivación y energía altísimas.";
    else if (averageRating >= 3.5) ratingDescEl.textContent = "Un periodo muy productivo y positivo en general.";
    else if (averageRating >= 2.5) ratingDescEl.textContent = "Un balance normal con días de esfuerzo constante.";
    else if (averageRating > 0) ratingDescEl.textContent = "Un periodo exigente. Recuerda priorizar el descanso.";
    else ratingDescEl.textContent = "Sin valoraciones de ánimo registradas en este periodo.";
  }

  // Cargar componentes de las otras pestañas
  renderReportSubjectsBreakdown("hours");
  renderReportWeekdayChart(keys, currentPeriod);
  renderReportMoodCorrelation(keys, currentPeriod);
  renderReportBadges(currentPeriod);

  switchReportTab("Summary");
  periodReportModalEl.hidden = false;
}

function closePeriodReportModal() {
  if (periodReportModalEl) periodReportModalEl.hidden = true;
}

function switchReportTab(tabName) {
  const tabs = ["Summary", "Subjects", "Insights", "Badges"];
  for (const t of tabs) {
    const btn = document.getElementById(`tabReport${t}`);
    const content = document.getElementById(`reportTabContent${t}`);
    if (btn && content) {
      if (t === tabName) {
        btn.classList.add("active");
        btn.style.background = "var(--accent)";
        btn.style.color = "white";
        btn.style.borderColor = "var(--accent)";
        content.hidden = false;
      } else {
        btn.classList.remove("active");
        btn.style.background = "var(--surface)";
        btn.style.color = "var(--ink)";
        btn.style.borderColor = "var(--line)";
        content.hidden = true;
      }
    }
  }
}

function renderReportSubjectsBreakdown(sortBy = "hours") {
  const container = document.getElementById("repSubjectsBreakdownList");
  if (!container || !latestStats) return;
  container.innerHTML = "";

  const { activeSubjects, activeTracks, totalsBySubject, totalsByTrack, totalHours } = latestStats;
  const items = [
    ...(activeSubjects || []).map(s => ({ name: s.name, total: totalsBySubject[s.name] || 0, color: s.color, type: "Asignatura" })),
    ...(activeTracks || []).map(t => ({ name: t.label, total: totalsByTrack[t.key] || 0, color: t.color, type: "Hobby" }))
  ];

  if (sortBy === "hours") {
    items.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, "es-ES"));
  } else {
    items.sort((a, b) => a.name.localeCompare(b.name, "es-ES"));
  }

  if (items.length === 0) {
    container.innerHTML = `<div class="empty-state">No hay elementos vinculados a este periodo.</div>`;
    return;
  }

  const maxTotal = Math.max(1, ...items.map(i => i.total));

  for (const item of items) {
    const ratio = totalHours > 0 ? (item.total / totalHours) * 100 : 0;
    const row = document.createElement("div");
    row.style.border = "1px solid var(--line)";
    row.style.borderRadius = "var(--radius)";
    row.style.padding = "12px 16px";
    row.style.background = "var(--surface)";
    row.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="width: 12px; height: 12px; border-radius: 50%; background: ${item.color};"></span>
          <strong style="font-size: 0.95rem; color: var(--ink);">${escapeHtml(item.name)}</strong>
          <span style="font-size: 0.72rem; padding: 2px 6px; border-radius: 4px; background: rgba(var(--accent-rgb), 0.08); color: var(--accent); font-weight: bold;">${item.type}</span>
        </div>
        <div style="font-size: 0.95rem; font-weight: 800; color: var(--ink);">
          ${formatNumber(item.total)} h <span style="font-size: 0.8rem; color: var(--muted); font-weight: 600;">(${formatNumber(ratio)}%)</span>
        </div>
      </div>
      <div style="width: 100%; background: var(--line); height: 6px; border-radius: 3px; overflow: hidden;">
        <div style="background: ${item.color}; height: 100%; width: ${(item.total / maxTotal) * 100}%;"></div>
      </div>
    `;
    container.appendChild(row);
  }
}

function renderReportWeekdayChart(keys, currentPeriod) {
  const container = document.getElementById("repWeekdayChart");
  if (!container || !latestStats) return;
  container.innerHTML = "";

  const weekdays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const totals = [0, 0, 0, 0, 0, 0, 0];
  const counts = [0, 0, 0, 0, 0, 0, 0];

  const pSubjects = new Set((latestStats.activeSubjects || []).map(s => s.name));
  const pTracks = new Set((latestStats.activeTracks || []).map(t => t.key));

  for (const key of keys) {
    const d = new Date(`${key}T12:00:00`);
    const dayOfWeek = (d.getDay() + 6) % 7; 
    const dayData = ensureDay(key);

    let dayTotal = 0;
    for (const sub of pSubjects) dayTotal += dayData.subjects[sub] || 0;
    for (const trk of pTracks) dayTotal += dayData.extra[trk] || 0;

    totals[dayOfWeek] += dayTotal;
    counts[dayOfWeek]++;
  }

  const maxHours = Math.max(1, ...totals);

  for (let i = 0; i < 7; i++) {
    const avg = counts[i] > 0 ? totals[i] / counts[i] : 0;
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "12px";
    row.innerHTML = `
      <span style="width: 85px; font-size: 0.84rem; font-weight: 700; color: var(--muted);">${weekdays[i]}</span>
      <div style="flex: 1; background: var(--line); height: 8px; border-radius: 4px; overflow: hidden;">
        <div style="background: var(--accent); height: 100%; width: ${(totals[i] / maxHours) * 100}%;"></div>
      </div>
      <span style="width: 100px; text-align: right; font-size: 0.84rem; font-weight: 800; color: var(--ink);">
        ${formatNumber(totals[i])} h <small style="color: var(--muted); font-weight: 600;">(${formatNumber(avg)}h/día)</small>
      </span>
    `;
    container.appendChild(row);
  }
}

function renderReportMoodCorrelation(keys, currentPeriod) {
  const container = document.getElementById("repMoodCorrelation");
  if (!container || !latestStats) return;
  container.innerHTML = "";

  const pSubjects = new Set((latestStats.activeSubjects || []).map(s => s.name));
  const pTracks = new Set((latestStats.activeTracks || []).map(t => t.key));

  const moodData = { 1: { h: 0, c: 0 }, 2: { h: 0, c: 0 }, 3: { h: 0, c: 0 }, 4: { h: 0, c: 0 }, 5: { h: 0, c: 0 } };

  for (const key of keys) {
    const dayData = ensureDay(key);
    const r = dayData.rating || 0;
    if (r >= 1 && r <= 5) {
      let dayTotal = 0;
      for (const sub of pSubjects) dayTotal += dayData.subjects[sub] || 0;
      for (const trk of pTracks) dayTotal += dayData.extra[trk] || 0;
      moodData[r].h += dayTotal;
      moodData[r].c++;
    }
  }

  const colors = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"];
  let hasRatings = false;

  for (let i = 5; i >= 1; i--) {
    if (moodData[i].c > 0) hasRatings = true;
  }

  if (!hasRatings) {
    container.innerHTML = `<div class="empty-state">No has registrado estados de ánimo en este periodo.</div>`;
    return;
  }

  for (let i = 5; i >= 1; i--) {
    const { h, c } = moodData[i];
    if (c === 0) continue;
    const avg = h / c;
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.justifyContent = "space-between";
    row.style.borderBottom = i > 1 ? "1px solid var(--line)" : "none";
    row.style.paddingBottom = i > 1 ? "8px" : "0";
    row.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="color: ${colors[i-1]}; font-size: 1.2rem;">${"★".repeat(i)}</span>
        <span style="font-size: 0.86rem; color: var(--muted); font-weight: 700;">(${c} ${c === 1 ? 'día' : 'días'})</span>
      </div>
      <div style="font-size: 0.92rem; font-weight: 800; color: var(--ink);">
        Media de ${formatNumber(avg)} h / día
      </div>
    `;
    container.appendChild(row);
  }
}

function renderReportBadges(activePeriod) {
  const container = document.getElementById("repBadgesGrid");
  if (!container || !latestStats) return;
  container.innerHTML = "";

  const { totalHours, totalStudy, totalTracks, currentStreak, best, topSubject, topTrack } = latestStats;
  const badges = [];

  // Insignia de Racha
  if (currentStreak >= 7) {
    badges.push({ icon: "🔥", title: "Imparable", desc: `Racha activa de ${currentStreak} días consecutivos.` });
  } else if (currentStreak >= 3) {
    badges.push({ icon: "⚡", title: "En Racha", desc: `Racha activa de ${currentStreak} días consecutivos.` });
  }

  // Insignia de Mejor Día
  if (best && best.total >= 8) {
    badges.push({ icon: "👑", title: "Día Titánico", desc: `Lograste ${formatNumber(best.total)} horas en un solo día (${formatShortDate(best.key)}).` });
  } else if (best && best.total >= 4) {
    badges.push({ icon: "⭐", title: "Día Excelente", desc: `Tu récord diario fue de ${formatNumber(best.total)} horas (${formatShortDate(best.key)}).` });
  }

  // Insignias de Enfoque
  if (topSubject && topSubject.total >= 20) {
    badges.push({ icon: "📚", title: "Enfoque Láser", desc: `Dedicación máxima a ${topSubject.name} (${formatNumber(topSubject.total)} h).` });
  }
  if (topTrack && topTrack.total >= 15) {
    badges.push({ icon: "🎨", title: "Pasión Desatada", desc: `Invertiste ${formatNumber(topTrack.total)} horas en ${topTrack.label}.` });
  }

  // Insignia de Vacaciones / Desconexión
  if (activePeriod.subjects.length === 0 && totalTracks > 0) {
    badges.push({ icon: "🌴", title: "Maestro del Zen", desc: `Desconexión académica total con ${formatNumber(totalTracks)} h dedicadas a ti.` });
  }

  if (totalHours >= 50) {
    badges.push({ icon: "💎", title: "Leyenda del Log", desc: `Más de 50 horas totales registradas en este periodo.` });
  }

  if (badges.length === 0) {
    badges.push({ icon: "🌱", title: "Semilla del Éxito", desc: "Has iniciado tu registro en este periodo. ¡Sigue así para desbloquear más insignias!" });
  }

  for (const b of badges) {
    const card = document.createElement("div");
    card.style.border = "1px solid var(--line)";
    card.style.borderRadius = "var(--radius)";
    card.style.padding = "16px";
    card.style.background = "var(--surface)";
    card.style.display = "flex";
    card.style.alignItems = "center";
    card.style.gap = "14px";
    card.style.boxShadow = "0 2px 6px rgba(0,0,0,0.02)";
    card.innerHTML = `
      <div style="font-size: 2.2rem; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: rgba(var(--accent-rgb), 0.08); border-radius: 12px;">
        ${b.icon}
      </div>
      <div>
        <h4 style="margin: 0 0 4px 0; font-size: 0.98rem; color: var(--ink); font-weight: 800;">${escapeHtml(b.title)}</h4>
        <p style="margin: 0; font-size: 0.82rem; color: var(--muted); line-height: 1.35;">${escapeHtml(b.desc)}</p>
      </div>
    `;
    container.appendChild(card);
  }
}
