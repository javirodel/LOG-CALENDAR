(() => {
  window.App = window.App || {};
  window.App.Constants = window.App.Constants || {};

const APP_VERSION = "4.0.8";
const STORAGE_KEY = "LOG-calendar-local-state-v1";

const INITIAL_START_DATE = "2026-01-01";
const INITIAL_END_DATE = "2026-12-31";

const DEFAULT_PROFILE = {
  title: "LOG CALENDAR",
  accentColor: "#0f766e",
  intensityLevels: [1, 3, 7, 10]
};

const DEFAULT_SUBJECTS = [];

const DEFAULT_EXTRA_TRACKS = [];

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
const eventColorEl = document.getElementById("eventColor");
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
const exportBtn = null;
const importInput = null;
const settingsBtn = null;
const settingsModalEl = document.getElementById("settingsModal");
const settingsCloseBtn = document.getElementById("settingsCloseBtn");
const openSubjectModalBtn = document.getElementById("openSubjectModalBtn");
const openSubjectModalFromDayBtn = document.getElementById("openSubjectModalFromDayBtn");
const openTrackModalBtn = document.getElementById("openTrackModalBtn");
const subjectEntryModalEl = document.getElementById("subjectEntryModal");
const subjectEntryTitleEl = document.getElementById("subjectEntryTitle");
const trackEntryModalEl = document.getElementById("trackEntryModal");
const trackEntryTitleEl = document.getElementById("trackEntryTitle");
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
const profileSubjectsColorEl = document.getElementById("profileSubjectsColor");
const profileSubjectsGlobalColorEl = document.getElementById("profileSubjectsGlobalColor");
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
const statsHeaderTitle = document.getElementById("statsHeaderTitle");
const statPillGrandTotal = document.getElementById("statPillGrandTotal");
const statPillWeightedLoad = document.getElementById("statPillWeightedLoad");
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
const grandTotalLabel = document.getElementById("grandTotalLabel");
const weightedLoadLabel = document.getElementById("weightedLoadLabel");
const avgPerDayLabel = document.getElementById("avgPerDayLabel");
const avgActiveDayLabel = document.getElementById("avgActiveDayLabel");
const bestDayLabel = document.getElementById("bestDayLabel");
const studyFocusLabel = document.getElementById("studyFocusLabel");
const hobbyFocusLabel = document.getElementById("hobbyFocusLabel");
const avgRatingLabel = document.getElementById("avgRatingLabel");
const hobbyFrequencyPanel = document.getElementById("hobbyFrequencyPanel");
const dayFilterIndicator = null;
const settingsVersionIndicatorEl = document.getElementById("settingsVersionIndicator");

// ─── Dark Mode ───────────────────────────────────────────────
const DARK_MODE_KEY = "LOG-calendar-dark-mode";

  const avgRatingEl = document.getElementById("avgRating");
const studyFocusEl = document.getElementById("studyFocus");
const hobbyFocusEl = document.getElementById("hobbyFocus");
const topSubjectEl = document.getElementById("topSubject");
const topTrackEl = document.getElementById("topTrack");
const streakLabel = document.getElementById("streakLabel");
const topSubjectLabel = document.getElementById("topSubjectLabel");
const topTrackLabel = document.getElementById("topTrackLabel");
const moreStatsBtn = document.getElementById("moreStatsBtn");
const subjectChartEl = document.getElementById("subjectChart");
const subjectChartPanel = document.getElementById("subjectChartPanel");
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
const tabCalendar = document.getElementById("tabCalendar");
const tabChecklist = document.getElementById("tabChecklist");
const tabInsights = document.getElementById("tabInsights");
const tabProfile = document.getElementById("tabProfile");
const paneCalendar = document.getElementById("paneCalendar");
const paneChecklistSelectedDay = document.getElementById("paneChecklistSelectedDay");
const paneCalendarDayDetails = document.getElementById("paneCalendarDayDetails");
const paneChecklistMain = document.getElementById("paneChecklistMain");
const paneInsightsMain = document.getElementById("paneInsightsMain");
const paneProfileMain = document.getElementById("paneProfileMain");
const profileActiveSelect = document.getElementById("profileActiveSelect");
const profileNewBtn = document.getElementById("profileNewBtn");
const profileRenameBtn = document.getElementById("profileRenameBtn");
const profileDeleteBtn = document.getElementById("profileDeleteBtn");
const profileSubTabSettings = document.getElementById("profileSubTabSettings");
const profileSubTabStats = document.getElementById("profileSubTabStats");
const profileSettingsSection = document.getElementById("profileSettingsSection");
const profileStatsSection = document.getElementById("profileStatsSection");
const checklistSelectedWeekdayEl = document.getElementById("checklistSelectedWeekday");
const checklistSelectedDateEl = document.getElementById("checklistSelectedDate");
const checklistAddFormEl = document.getElementById("checklistAddForm");
const checklistTaskTextEl = document.getElementById("checklistTaskText");
const checklistTaskLinkEl = document.getElementById("checklistTaskLink");
const checklistTaskDueDateEl = document.getElementById("checklistTaskDueDate");
const checklistTaskDifficultyEl = document.getElementById("checklistTaskDifficulty");
const checklistDayTasksListEl = document.getElementById("checklistDayTasksList");
const taskEntryModalEl = document.getElementById("taskEntryModal");
const taskEntryCloseBtn = document.getElementById("taskEntryCloseBtn");
const taskEntryTitleEl = document.getElementById("taskEntryTitle");
const taskFormEl = document.getElementById("taskForm");
const taskTextEl = document.getElementById("taskText");
const taskLinkEl = document.getElementById("taskLink");
const taskDueDateEl = document.getElementById("taskDueDate");
const taskDifficultyEl = document.getElementById("taskDifficulty");
const taskSubmitBtn = document.getElementById("taskSubmitBtn");
const settingsTitleEl = document.getElementById("settingsTitle");
const checklistTaskDescriptionEl = document.getElementById("checklistTaskDescription");
const taskDescriptionEl = document.getElementById("taskDescription");
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
const subjectsHeaderLabelEl = document.getElementById("subjectsHeaderLabel");
const settingsSubjectsTitleEl = document.getElementById("settingsSubjectsTitle");
const settingsTracksTitleEl = document.getElementById("settingsTracksTitle");
const tabSummary = document.getElementById("tabReportSummary");
const tabSubjects = document.getElementById("tabReportSubjects");
const tabReportInsights = document.getElementById("tabReportInsights");
const tabBadges = document.getElementById("tabReportBadges");
const sortRepHours = document.getElementById("sortRepSubjectsHours");
const sortRepName = document.getElementById("sortRepSubjectsName");
const container = document.getElementById("topbarLastUpdate");
const timeEl = document.getElementById("lastUpdateTime");
const detailEl = document.getElementById("lastUpdateDetail");
const dotEl = document.getElementById("lastUpdateDot");
const studyFocusLabelEl = document.getElementById("studyFocusLabel");
const hobbyFocusLabelEl = document.getElementById("hobbyFocusLabel");
const topSubjectLabelEl = document.getElementById("topSubjectLabel");
const topTrackLabelEl = document.getElementById("topTrackLabel");
const subjectChartTitleEl = document.getElementById("subjectChartTitle");
const streakLabelEl = document.getElementById("streakLabel");
const openSubjectModalBtnEl = document.getElementById("openSubjectModalBtn");
const openTrackModalBtnEl = document.getElementById("openTrackModalBtn");
const subjectEntryEyebrowEl = document.getElementById("subjectEntryEyebrow");
const trackEntryEyebrowEl = document.getElementById("trackEntryEyebrow");
const eventSubjectLabelEl = document.getElementById("eventSubjectLabel");
Object.defineProperties(window.App.Constants, {
    APP_VERSION: { get: () => APP_VERSION, set: (v) => APP_VERSION = v, enumerable: true },
    STORAGE_KEY: { get: () => STORAGE_KEY, set: (v) => STORAGE_KEY = v, enumerable: true },
    INITIAL_START_DATE: { get: () => INITIAL_START_DATE, set: (v) => INITIAL_START_DATE = v, enumerable: true },
    INITIAL_END_DATE: { get: () => INITIAL_END_DATE, set: (v) => INITIAL_END_DATE = v, enumerable: true },
    DEFAULT_PROFILE: { get: () => DEFAULT_PROFILE, set: (v) => DEFAULT_PROFILE = v, enumerable: true },
    DEFAULT_SUBJECTS: { get: () => DEFAULT_SUBJECTS, set: (v) => DEFAULT_SUBJECTS = v, enumerable: true },
    DEFAULT_EXTRA_TRACKS: { get: () => DEFAULT_EXTRA_TRACKS, set: (v) => DEFAULT_EXTRA_TRACKS = v, enumerable: true },
    EVENT_CATEGORIES: { get: () => EVENT_CATEGORIES, set: (v) => EVENT_CATEGORIES = v, enumerable: true },
    EVENT_PRIORITY: { get: () => EVENT_PRIORITY, set: (v) => EVENT_PRIORITY = v, enumerable: true },
    NEW_CATEGORY_VALUE: { get: () => NEW_CATEGORY_VALUE, set: (v) => NEW_CATEGORY_VALUE = v, enumerable: true },
    RATING_LABELS: { get: () => RATING_LABELS, set: (v) => RATING_LABELS = v, enumerable: true },
    eventLegendEl: { get: () => eventLegendEl, set: (v) => eventLegendEl = v, enumerable: true },
    monthsEl: { get: () => monthsEl, set: (v) => monthsEl = v, enumerable: true },
    calendarTitleEl: { get: () => calendarTitleEl, set: (v) => calendarTitleEl = v, enumerable: true },
    calendarSubtitleEl: { get: () => calendarSubtitleEl, set: (v) => calendarSubtitleEl = v, enumerable: true },
    visibleRangeLabelEl: { get: () => visibleRangeLabelEl, set: (v) => visibleRangeLabelEl = v, enumerable: true },
    visibleMonthPairTitleEl: { get: () => visibleMonthPairTitleEl, set: (v) => visibleMonthPairTitleEl = v, enumerable: true },
    prevMonthsBtn: { get: () => prevMonthsBtn, set: (v) => prevMonthsBtn = v, enumerable: true },
    nextMonthsBtn: { get: () => nextMonthsBtn, set: (v) => nextMonthsBtn = v, enumerable: true },
    selectedWeekdayEl: { get: () => selectedWeekdayEl, set: (v) => selectedWeekdayEl = v, enumerable: true },
    selectedDateEl: { get: () => selectedDateEl, set: (v) => selectedDateEl = v, enumerable: true },
    selectedTotalEl: { get: () => selectedTotalEl, set: (v) => selectedTotalEl = v, enumerable: true },
    selectedStudyEl: { get: () => selectedStudyEl, set: (v) => selectedStudyEl = v, enumerable: true },
    daySplitEl: { get: () => daySplitEl, set: (v) => daySplitEl = v, enumerable: true },
    noticeListEl: { get: () => noticeListEl, set: (v) => noticeListEl = v, enumerable: true },
    openEventModalBtn: { get: () => openEventModalBtn, set: (v) => openEventModalBtn = v, enumerable: true },
    eventEntryModalEl: { get: () => eventEntryModalEl, set: (v) => eventEntryModalEl = v, enumerable: true },
    eventEntryTitleEl: { get: () => eventEntryTitleEl, set: (v) => eventEntryTitleEl = v, enumerable: true },
    eventEntryCloseBtn: { get: () => eventEntryCloseBtn, set: (v) => eventEntryCloseBtn = v, enumerable: true },
    eventFormEl: { get: () => eventFormEl, set: (v) => eventFormEl = v, enumerable: true },
    eventTypeEl: { get: () => eventTypeEl, set: (v) => eventTypeEl = v, enumerable: true },
    eventTextEl: { get: () => eventTextEl, set: (v) => eventTextEl = v, enumerable: true },
    eventColorEl: { get: () => eventColorEl, set: (v) => eventColorEl = v, enumerable: true },
    customCategoryFieldsEl: { get: () => customCategoryFieldsEl, set: (v) => customCategoryFieldsEl = v, enumerable: true },
    customCategoryNameEl: { get: () => customCategoryNameEl, set: (v) => customCategoryNameEl = v, enumerable: true },
    customCategoryColorEl: { get: () => customCategoryColorEl, set: (v) => customCategoryColorEl = v, enumerable: true },
    eventSubjectFieldsEl: { get: () => eventSubjectFieldsEl, set: (v) => eventSubjectFieldsEl = v, enumerable: true },
    eventSubjectEl: { get: () => eventSubjectEl, set: (v) => eventSubjectEl = v, enumerable: true },
    eventNewSubjectFieldsEl: { get: () => eventNewSubjectFieldsEl, set: (v) => eventNewSubjectFieldsEl = v, enumerable: true },
    eventNewSubjectNameEl: { get: () => eventNewSubjectNameEl, set: (v) => eventNewSubjectNameEl = v, enumerable: true },
    eventNewSubjectDescriptionEl: { get: () => eventNewSubjectDescriptionEl, set: (v) => eventNewSubjectDescriptionEl = v, enumerable: true },
    eventNewSubjectColorEl: { get: () => eventNewSubjectColorEl, set: (v) => eventNewSubjectColorEl = v, enumerable: true },
    eventNewSubjectDifficultyEl: { get: () => eventNewSubjectDifficultyEl, set: (v) => eventNewSubjectDifficultyEl = v, enumerable: true },
    eventSubmitBtn: { get: () => eventSubmitBtn, set: (v) => eventSubmitBtn = v, enumerable: true },
    subjectFormEl: { get: () => subjectFormEl, set: (v) => subjectFormEl = v, enumerable: true },
    focusTracksEl: { get: () => focusTracksEl, set: (v) => focusTracksEl = v, enumerable: true },
    dayNotesEl: { get: () => dayNotesEl, set: (v) => dayNotesEl = v, enumerable: true },
    clearDayBtn: { get: () => clearDayBtn, set: (v) => clearDayBtn = v, enumerable: true },
    exportBtn: { get: () => exportBtn, set: (v) => exportBtn = v, enumerable: true },
    importInput: { get: () => importInput, set: (v) => importInput = v, enumerable: true },
    settingsBtn: { get: () => settingsBtn, set: (v) => settingsBtn = v, enumerable: true },
    settingsModalEl: { get: () => settingsModalEl, set: (v) => settingsModalEl = v, enumerable: true },
    settingsCloseBtn: { get: () => settingsCloseBtn, set: (v) => settingsCloseBtn = v, enumerable: true },
    openSubjectModalBtn: { get: () => openSubjectModalBtn, set: (v) => openSubjectModalBtn = v, enumerable: true },
    openSubjectModalFromDayBtn: { get: () => openSubjectModalFromDayBtn, set: (v) => openSubjectModalFromDayBtn = v, enumerable: true },
    openTrackModalBtn: { get: () => openTrackModalBtn, set: (v) => openTrackModalBtn = v, enumerable: true },
    subjectEntryModalEl: { get: () => subjectEntryModalEl, set: (v) => subjectEntryModalEl = v, enumerable: true },
    subjectEntryTitleEl: { get: () => subjectEntryTitleEl, set: (v) => subjectEntryTitleEl = v, enumerable: true },
    trackEntryModalEl: { get: () => trackEntryModalEl, set: (v) => trackEntryModalEl = v, enumerable: true },
    trackEntryTitleEl: { get: () => trackEntryTitleEl, set: (v) => trackEntryTitleEl = v, enumerable: true },
    rangeEntryModalEl: { get: () => rangeEntryModalEl, set: (v) => rangeEntryModalEl = v, enumerable: true },
    subjectEntryCloseBtn: { get: () => subjectEntryCloseBtn, set: (v) => subjectEntryCloseBtn = v, enumerable: true },
    trackEntryCloseBtn: { get: () => trackEntryCloseBtn, set: (v) => trackEntryCloseBtn = v, enumerable: true },
    rangeEntryCloseBtn: { get: () => rangeEntryCloseBtn, set: (v) => rangeEntryCloseBtn = v, enumerable: true },
    rangeEntryTextEl: { get: () => rangeEntryTextEl, set: (v) => rangeEntryTextEl = v, enumerable: true },
    rangeEntryConfirmBtn: { get: () => rangeEntryConfirmBtn, set: (v) => rangeEntryConfirmBtn = v, enumerable: true },
    profileFormEl: { get: () => profileFormEl, set: (v) => profileFormEl = v, enumerable: true },
    profileTitleEl: { get: () => profileTitleEl, set: (v) => profileTitleEl = v, enumerable: true },
    profileAccentEl: { get: () => profileAccentEl, set: (v) => profileAccentEl = v, enumerable: true },
    profileLevel1El: { get: () => profileLevel1El, set: (v) => profileLevel1El = v, enumerable: true },
    profileLevel2El: { get: () => profileLevel2El, set: (v) => profileLevel2El = v, enumerable: true },
    profileLevel3El: { get: () => profileLevel3El, set: (v) => profileLevel3El = v, enumerable: true },
    profileLevel4El: { get: () => profileLevel4El, set: (v) => profileLevel4El = v, enumerable: true },
    subjectsSettingsListEl: { get: () => subjectsSettingsListEl, set: (v) => subjectsSettingsListEl = v, enumerable: true },
    profileSubjectsColorEl: { get: () => profileSubjectsColorEl, set: (v) => profileSubjectsColorEl = v, enumerable: true },
    profileSubjectsGlobalColorEl: { get: () => profileSubjectsGlobalColorEl, set: (v) => profileSubjectsGlobalColorEl = v, enumerable: true },
    subjectSettingsFormEl: { get: () => subjectSettingsFormEl, set: (v) => subjectSettingsFormEl = v, enumerable: true },
    newSubjectNameEl: { get: () => newSubjectNameEl, set: (v) => newSubjectNameEl = v, enumerable: true },
    newSubjectDescriptionEl: { get: () => newSubjectDescriptionEl, set: (v) => newSubjectDescriptionEl = v, enumerable: true },
    newSubjectColorEl: { get: () => newSubjectColorEl, set: (v) => newSubjectColorEl = v, enumerable: true },
    newSubjectDifficultyEl: { get: () => newSubjectDifficultyEl, set: (v) => newSubjectDifficultyEl = v, enumerable: true },
    tracksSettingsListEl: { get: () => tracksSettingsListEl, set: (v) => tracksSettingsListEl = v, enumerable: true },
    trackSettingsFormEl: { get: () => trackSettingsFormEl, set: (v) => trackSettingsFormEl = v, enumerable: true },
    newTrackNameEl: { get: () => newTrackNameEl, set: (v) => newTrackNameEl = v, enumerable: true },
    newTrackDescriptionEl: { get: () => newTrackDescriptionEl, set: (v) => newTrackDescriptionEl = v, enumerable: true },
    newTrackColorEl: { get: () => newTrackColorEl, set: (v) => newTrackColorEl = v, enumerable: true },
    openPeriodModalBtn: { get: () => openPeriodModalBtn, set: (v) => openPeriodModalBtn = v, enumerable: true },
    periodEntryModalEl: { get: () => periodEntryModalEl, set: (v) => periodEntryModalEl = v, enumerable: true },
    periodEntryTitleEl: { get: () => periodEntryTitleEl, set: (v) => periodEntryTitleEl = v, enumerable: true },
    periodEntryCloseBtn: { get: () => periodEntryCloseBtn, set: (v) => periodEntryCloseBtn = v, enumerable: true },
    periodSettingsFormEl: { get: () => periodSettingsFormEl, set: (v) => periodSettingsFormEl = v, enumerable: true },
    newPeriodNameEl: { get: () => newPeriodNameEl, set: (v) => newPeriodNameEl = v, enumerable: true },
    newPeriodStartEl: { get: () => newPeriodStartEl, set: (v) => newPeriodStartEl = v, enumerable: true },
    newPeriodEndEl: { get: () => newPeriodEndEl, set: (v) => newPeriodEndEl = v, enumerable: true },
    periodSubjectsCheckboxesEl: { get: () => periodSubjectsCheckboxesEl, set: (v) => periodSubjectsCheckboxesEl = v, enumerable: true },
    periodTracksCheckboxesEl: { get: () => periodTracksCheckboxesEl, set: (v) => periodTracksCheckboxesEl = v, enumerable: true },
    periodsSettingsListEl: { get: () => periodsSettingsListEl, set: (v) => periodsSettingsListEl = v, enumerable: true },
    statsPeriodSelectEl: { get: () => statsPeriodSelectEl, set: (v) => statsPeriodSelectEl = v, enumerable: true },
    statsHeaderTitle: { get: () => statsHeaderTitle, set: (v) => statsHeaderTitle = v, enumerable: true },
    statPillGrandTotal: { get: () => statPillGrandTotal, set: (v) => statPillGrandTotal = v, enumerable: true },
    statPillWeightedLoad: { get: () => statPillWeightedLoad, set: (v) => statPillWeightedLoad = v, enumerable: true },
    generateReportBtn: { get: () => generateReportBtn, set: (v) => generateReportBtn = v, enumerable: true },
    periodReportModalEl: { get: () => periodReportModalEl, set: (v) => periodReportModalEl = v, enumerable: true },
    periodReportCloseBtn: { get: () => periodReportCloseBtn, set: (v) => periodReportCloseBtn = v, enumerable: true },
    periodReportDoneBtn: { get: () => periodReportDoneBtn, set: (v) => periodReportDoneBtn = v, enumerable: true },
    grandTotalEl: { get: () => grandTotalEl, set: (v) => grandTotalEl = v, enumerable: true },
    weightedLoadEl: { get: () => weightedLoadEl, set: (v) => weightedLoadEl = v, enumerable: true },
    avgPerDayEl: { get: () => avgPerDayEl, set: (v) => avgPerDayEl = v, enumerable: true },
    avgActiveDayEl: { get: () => avgActiveDayEl, set: (v) => avgActiveDayEl = v, enumerable: true },
    bestDayEl: { get: () => bestDayEl, set: (v) => bestDayEl = v, enumerable: true },
    streakEl: { get: () => streakEl, set: (v) => streakEl = v, enumerable: true },
    grandTotalLabel: { get: () => grandTotalLabel, set: (v) => grandTotalLabel = v, enumerable: true },
    weightedLoadLabel: { get: () => weightedLoadLabel, set: (v) => weightedLoadLabel = v, enumerable: true },
    avgPerDayLabel: { get: () => avgPerDayLabel, set: (v) => avgPerDayLabel = v, enumerable: true },
    avgActiveDayLabel: { get: () => avgActiveDayLabel, set: (v) => avgActiveDayLabel = v, enumerable: true },
    bestDayLabel: { get: () => bestDayLabel, set: (v) => bestDayLabel = v, enumerable: true },
    studyFocusLabel: { get: () => studyFocusLabel, set: (v) => studyFocusLabel = v, enumerable: true },
    hobbyFocusLabel: { get: () => hobbyFocusLabel, set: (v) => hobbyFocusLabel = v, enumerable: true },
    avgRatingLabel: { get: () => avgRatingLabel, set: (v) => avgRatingLabel = v, enumerable: true },
    hobbyFrequencyPanel: { get: () => hobbyFrequencyPanel, set: (v) => hobbyFrequencyPanel = v, enumerable: true },
    dayFilterIndicator: { get: () => dayFilterIndicator, set: (v) => dayFilterIndicator = v, enumerable: true },
    settingsVersionIndicatorEl: { get: () => settingsVersionIndicatorEl, set: (v) => settingsVersionIndicatorEl = v, enumerable: true },
    DARK_MODE_KEY: { get: () => DARK_MODE_KEY, set: (v) => DARK_MODE_KEY = v, enumerable: true }
,
    avgRatingEl: { get: () => avgRatingEl, set: (v) => avgRatingEl = v, enumerable: true },
    studyFocusEl: { get: () => studyFocusEl, set: (v) => studyFocusEl = v, enumerable: true },
    hobbyFocusEl: { get: () => hobbyFocusEl, set: (v) => hobbyFocusEl = v, enumerable: true },
    topSubjectEl: { get: () => topSubjectEl, set: (v) => topSubjectEl = v, enumerable: true },
    topTrackEl: { get: () => topTrackEl, set: (v) => topTrackEl = v, enumerable: true },
    streakLabel: { get: () => streakLabel, set: (v) => streakLabel = v, enumerable: true },
    topSubjectLabel: { get: () => topSubjectLabel, set: (v) => topSubjectLabel = v, enumerable: true },
    topTrackLabel: { get: () => topTrackLabel, set: (v) => topTrackLabel = v, enumerable: true },
    moreStatsBtn: { get: () => moreStatsBtn, set: (v) => moreStatsBtn = v, enumerable: true },
    subjectChartEl: { get: () => subjectChartEl, set: (v) => subjectChartEl = v, enumerable: true },
    subjectChartPanel: { get: () => subjectChartPanel, set: (v) => subjectChartPanel = v, enumerable: true },
    hobbyFrequencyChart: { get: () => hobbyFrequencyChart, set: (v) => hobbyFrequencyChart = v, enumerable: true },
    ratingsChartEl: { get: () => ratingsChartEl, set: (v) => ratingsChartEl = v, enumerable: true },
    balanceChartEl: { get: () => balanceChartEl, set: (v) => balanceChartEl = v, enumerable: true },
    advancedStatsModalEl: { get: () => advancedStatsModalEl, set: (v) => advancedStatsModalEl = v, enumerable: true },
    advancedStatsCloseBtn: { get: () => advancedStatsCloseBtn, set: (v) => advancedStatsCloseBtn = v, enumerable: true },
    advancedStatsContentEl: { get: () => advancedStatsContentEl, set: (v) => advancedStatsContentEl = v, enumerable: true },
    toastEl: { get: () => toastEl, set: (v) => toastEl = v, enumerable: true },
    starsContainerEl: { get: () => starsContainerEl, set: (v) => starsContainerEl = v, enumerable: true },
    ratingHintEl: { get: () => ratingHintEl, set: (v) => ratingHintEl = v, enumerable: true },
    autoSaveEl: { get: () => autoSaveEl, set: (v) => autoSaveEl = v, enumerable: true },
    resetDataBtn: { get: () => resetDataBtn, set: (v) => resetDataBtn = v, enumerable: true },
    tabCalendar: { get: () => tabCalendar, set: (v) => tabCalendar = v, enumerable: true },
    tabChecklist: { get: () => tabChecklist, set: (v) => tabChecklist = v, enumerable: true },
    tabInsights: { get: () => tabInsights, set: (v) => tabInsights = v, enumerable: true },
    tabProfile: { get: () => tabProfile, set: (v) => tabProfile = v, enumerable: true },
    paneCalendar: { get: () => paneCalendar, set: (v) => paneCalendar = v, enumerable: true },
    paneChecklistSelectedDay: { get: () => paneChecklistSelectedDay, set: (v) => paneChecklistSelectedDay = v, enumerable: true },
    paneCalendarDayDetails: { get: () => paneCalendarDayDetails, set: (v) => paneCalendarDayDetails = v, enumerable: true },
    paneChecklistMain: { get: () => paneChecklistMain, set: (v) => paneChecklistMain = v, enumerable: true },
    paneInsightsMain: { get: () => paneInsightsMain, set: (v) => paneInsightsMain = v, enumerable: true },
    paneProfileMain: { get: () => paneProfileMain, set: (v) => paneProfileMain = v, enumerable: true },
    profileActiveSelect: { get: () => profileActiveSelect, set: (v) => profileActiveSelect = v, enumerable: true },
    profileNewBtn: { get: () => profileNewBtn, set: (v) => profileNewBtn = v, enumerable: true },
    profileRenameBtn: { get: () => profileRenameBtn, set: (v) => profileRenameBtn = v, enumerable: true },
    profileDeleteBtn: { get: () => profileDeleteBtn, set: (v) => profileDeleteBtn = v, enumerable: true },
    profileSubTabSettings: { get: () => profileSubTabSettings, set: (v) => profileSubTabSettings = v, enumerable: true },
    profileSubTabStats: { get: () => profileSubTabStats, set: (v) => profileSubTabStats = v, enumerable: true },
    profileSettingsSection: { get: () => profileSettingsSection, set: (v) => profileSettingsSection = v, enumerable: true },
    profileStatsSection: { get: () => profileStatsSection, set: (v) => profileStatsSection = v, enumerable: true },
    checklistSelectedWeekdayEl: { get: () => checklistSelectedWeekdayEl, set: (v) => checklistSelectedWeekdayEl = v, enumerable: true },
    checklistSelectedDateEl: { get: () => checklistSelectedDateEl, set: (v) => checklistSelectedDateEl = v, enumerable: true },
    checklistAddFormEl: { get: () => checklistAddFormEl, set: (v) => checklistAddFormEl = v, enumerable: true },
    checklistTaskTextEl: { get: () => checklistTaskTextEl, set: (v) => checklistTaskTextEl = v, enumerable: true },
    checklistTaskLinkEl: { get: () => checklistTaskLinkEl, set: (v) => checklistTaskLinkEl = v, enumerable: true },
    checklistTaskDueDateEl: { get: () => checklistTaskDueDateEl, set: (v) => checklistTaskDueDateEl = v, enumerable: true },
    checklistTaskDifficultyEl: { get: () => checklistTaskDifficultyEl, set: (v) => checklistTaskDifficultyEl = v, enumerable: true },
    checklistDayTasksListEl: { get: () => checklistDayTasksListEl, set: (v) => checklistDayTasksListEl = v, enumerable: true },
    taskEntryModalEl: { get: () => taskEntryModalEl, set: (v) => taskEntryModalEl = v, enumerable: true },
    taskEntryCloseBtn: { get: () => taskEntryCloseBtn, set: (v) => taskEntryCloseBtn = v, enumerable: true },
    taskEntryTitleEl: { get: () => taskEntryTitleEl, set: (v) => taskEntryTitleEl = v, enumerable: true },
    taskFormEl: { get: () => taskFormEl, set: (v) => taskFormEl = v, enumerable: true },
    taskTextEl: { get: () => taskTextEl, set: (v) => taskTextEl = v, enumerable: true },
    taskLinkEl: { get: () => taskLinkEl, set: (v) => taskLinkEl = v, enumerable: true },
    taskDueDateEl: { get: () => taskDueDateEl, set: (v) => taskDueDateEl = v, enumerable: true },
    taskDifficultyEl: { get: () => taskDifficultyEl, set: (v) => taskDifficultyEl = v, enumerable: true },
    taskSubmitBtn: { get: () => taskSubmitBtn, set: (v) => taskSubmitBtn = v, enumerable: true },
    settingsTitleEl: { get: () => settingsTitleEl, set: (v) => settingsTitleEl = v, enumerable: true },
    checklistTaskDescriptionEl: { get: () => checklistTaskDescriptionEl, set: (v) => checklistTaskDescriptionEl = v, enumerable: true },
    taskDescriptionEl: { get: () => taskDescriptionEl, set: (v) => taskDescriptionEl = v, enumerable: true },
    taskDetailsModalEl: { get: () => taskDetailsModalEl, set: (v) => taskDetailsModalEl = v, enumerable: true },
    taskDetailsCloseBtn: { get: () => taskDetailsCloseBtn, set: (v) => taskDetailsCloseBtn = v, enumerable: true },
    taskDetailsTitleEl: { get: () => taskDetailsTitleEl, set: (v) => taskDetailsTitleEl = v, enumerable: true },
    taskDetailsDescEl: { get: () => taskDetailsDescEl, set: (v) => taskDetailsDescEl = v, enumerable: true },
    taskDetailsLinkEl: { get: () => taskDetailsLinkEl, set: (v) => taskDetailsLinkEl = v, enumerable: true },
    taskDetailsDifficultyEl: { get: () => taskDetailsDifficultyEl, set: (v) => taskDetailsDifficultyEl = v, enumerable: true },
    taskDetailsDueDateEl: { get: () => taskDetailsDueDateEl, set: (v) => taskDetailsDueDateEl = v, enumerable: true },
    taskDetailsStatusTextEl: { get: () => taskDetailsStatusTextEl, set: (v) => taskDetailsStatusTextEl = v, enumerable: true },
    taskDetailsCheckboxEl: { get: () => taskDetailsCheckboxEl, set: (v) => taskDetailsCheckboxEl = v, enumerable: true },
    taskDetailsDeleteBtn: { get: () => taskDetailsDeleteBtn, set: (v) => taskDetailsDeleteBtn = v, enumerable: true },
    taskDetailsEditBtn: { get: () => taskDetailsEditBtn, set: (v) => taskDetailsEditBtn = v, enumerable: true },
    taskDetailsOkBtn: { get: () => taskDetailsOkBtn, set: (v) => taskDetailsOkBtn = v, enumerable: true },
    subjectsHeaderLabelEl: { get: () => subjectsHeaderLabelEl, set: (v) => subjectsHeaderLabelEl = v, enumerable: true },
    settingsSubjectsTitleEl: { get: () => settingsSubjectsTitleEl, set: (v) => settingsSubjectsTitleEl = v, enumerable: true },
    settingsTracksTitleEl: { get: () => settingsTracksTitleEl, set: (v) => settingsTracksTitleEl = v, enumerable: true },
    tabSummary: { get: () => tabSummary, set: (v) => tabSummary = v, enumerable: true },
    tabSubjects: { get: () => tabSubjects, set: (v) => tabSubjects = v, enumerable: true },
    tabReportInsights: { get: () => tabReportInsights, set: (v) => tabReportInsights = v, enumerable: true },
    tabBadges: { get: () => tabBadges, set: (v) => tabBadges = v, enumerable: true },
    sortRepHours: { get: () => sortRepHours, set: (v) => sortRepHours = v, enumerable: true },
    sortRepName: { get: () => sortRepName, set: (v) => sortRepName = v, enumerable: true },
    container: { get: () => container, set: (v) => container = v, enumerable: true },
    timeEl: { get: () => timeEl, set: (v) => timeEl = v, enumerable: true },
    detailEl: { get: () => detailEl, set: (v) => detailEl = v, enumerable: true },
    dotEl: { get: () => dotEl, set: (v) => dotEl = v, enumerable: true },
    studyFocusLabelEl: { get: () => studyFocusLabelEl, set: (v) => studyFocusLabelEl = v, enumerable: true },
    hobbyFocusLabelEl: { get: () => hobbyFocusLabelEl, set: (v) => hobbyFocusLabelEl = v, enumerable: true },
    topSubjectLabelEl: { get: () => topSubjectLabelEl, set: (v) => topSubjectLabelEl = v, enumerable: true },
    topTrackLabelEl: { get: () => topTrackLabelEl, set: (v) => topTrackLabelEl = v, enumerable: true },
    subjectChartTitleEl: { get: () => subjectChartTitleEl, set: (v) => subjectChartTitleEl = v, enumerable: true },
    subjectsHeaderLabelEl: { get: () => subjectsHeaderLabelEl, set: (v) => subjectsHeaderLabelEl = v, enumerable: true },
    streakLabelEl: { get: () => streakLabelEl, set: (v) => streakLabelEl = v, enumerable: true },
    settingsSubjectsTitleEl: { get: () => settingsSubjectsTitleEl, set: (v) => settingsSubjectsTitleEl = v, enumerable: true },
    settingsTracksTitleEl: { get: () => settingsTracksTitleEl, set: (v) => settingsTracksTitleEl = v, enumerable: true },
    openSubjectModalBtnEl: { get: () => openSubjectModalBtnEl, set: (v) => openSubjectModalBtnEl = v, enumerable: true },
    openTrackModalBtnEl: { get: () => openTrackModalBtnEl, set: (v) => openTrackModalBtnEl = v, enumerable: true },
    subjectEntryEyebrowEl: { get: () => subjectEntryEyebrowEl, set: (v) => subjectEntryEyebrowEl = v, enumerable: true },
    subjectEntryTitleEl: { get: () => subjectEntryTitleEl, set: (v) => subjectEntryTitleEl = v, enumerable: true },
    newSubjectNameEl: { get: () => newSubjectNameEl, set: (v) => newSubjectNameEl = v, enumerable: true },
    newSubjectDifficultyEl: { get: () => newSubjectDifficultyEl, set: (v) => newSubjectDifficultyEl = v, enumerable: true },
    trackEntryEyebrowEl: { get: () => trackEntryEyebrowEl, set: (v) => trackEntryEyebrowEl = v, enumerable: true },
    trackEntryTitleEl: { get: () => trackEntryTitleEl, set: (v) => trackEntryTitleEl = v, enumerable: true },
    newTrackNameEl: { get: () => newTrackNameEl, set: (v) => newTrackNameEl = v, enumerable: true },
    eventSubjectLabelEl: { get: () => eventSubjectLabelEl, set: (v) => eventSubjectLabelEl = v, enumerable: true },
    eventSubjectEl: { get: () => eventSubjectEl, set: (v) => eventSubjectEl = v, enumerable: true },
    eventNewSubjectNameEl: { get: () => eventNewSubjectNameEl, set: (v) => eventNewSubjectNameEl = v, enumerable: true }
  });
  const workspaceEl = document.querySelector(".workspace");
  Object.defineProperty(window.App.Constants, "workspaceEl", { get: () => workspaceEl, enumerable: true });
})();
