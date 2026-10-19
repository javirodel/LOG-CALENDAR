(() => {
  window.App = window.App || {};
  window.App.State = window.App.State || {};



let subjects = App.Constants.DEFAULT_SUBJECTS.map((subject) => ({ ...subject }));
let EXTRA_TRACKS = App.Constants.DEFAULT_EXTRA_TRACKS.map((track) => ({ ...track }));
let academicPeriods = [];

let events = {};

let state = null;
let selectedDate = null;
let visibleMonth = null;
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
let previewVisibleMonth = new Date();

let routineActiveMonth = App.Utils.getTodayYearMonth();
let editingHabitTarget = null;
let routineMatrixScrollSaveTimer = null;

function onDayDataUpdated() {
  App.Constants.selectedTotalEl.textContent = App.Utils.formatTime(App.Stats.getDayTotal(selectedDate));
  App.Constants.selectedStudyEl.textContent = `${state.settings.subjectsLabelPlural || App.I18n?.text("Asignaturas", "Subjects")}: ${App.Utils.formatTime(App.Stats.getStudyTotal(selectedDate))}`;
  App.DayPanel.renderDaySplit();
  App.Storage.saveState();
  App.Storage.flashAutoSave();
  App.Calendar.refreshDayCell(selectedDate);
  App.Stats.scheduleStatsRender();
  App.DayPanel.renderNotices();
}

function syncConfigFromState() {
  subjects = App.Tasks.normalizeSubjects(state.settings.subjects);
  EXTRA_TRACKS = App.Tasks.normalizeTracks(state.settings.tracks);
  academicPeriods = App.Tasks.normalizeAcademicPeriods(state.settings.academicPeriods);
  state.settings.subjects = subjects;
  state.settings.tracks = EXTRA_TRACKS;
  state.settings.academicPeriods = academicPeriods;
  state.settings.profile = App.Tasks.normalizeProfile(state.settings.profile);
  state.settings.calendarRange = App.Tasks.normalizeCalendarRange(state.settings.calendarRange);

  if (!state.settings.subjectsLabelPlural) state.settings.subjectsLabelPlural = "Asignaturas";
  if (!state.settings.subjectsLabelSingular) state.settings.subjectsLabelSingular = "Asignatura";
  if (!state.settings.subjectsColor) state.settings.subjectsColor = state.settings.profile?.accentColor || "#0f766e";
  if (!state.settings.hobbiesLabelPlural) state.settings.hobbiesLabelPlural = "Hobbies";
  if (!state.settings.hobbiesLabelSingular) state.settings.hobbiesLabelSingular = "Hobby";
  if (state.settings.timeEntryMode !== "hours-minutes") state.settings.timeEntryMode = "decimal";
  if (typeof state.settings.timeAdditionsEnabled !== "boolean") state.settings.timeAdditionsEnabled = true;

  for (const subject of subjects) {
    if (typeof state.settings.subjectDifficulty[subject.name] !== "number") {
      state.settings.subjectDifficulty[subject.name] = subject.defaultDifficulty || 3;
    }
  }
}

  Object.defineProperties(window.App.State, {
    subjects: { get: () => subjects, set: (v) => subjects = v, enumerable: true },
    EXTRA_TRACKS: { get: () => EXTRA_TRACKS, set: (v) => EXTRA_TRACKS = v, enumerable: true },
    academicPeriods: { get: () => academicPeriods, set: (v) => academicPeriods = v, enumerable: true },
    events: { get: () => events, set: (v) => events = v, enumerable: true },
    state: { get: () => state, set: (v) => state = v, enumerable: true },
    selectedDate: { get: () => selectedDate, set: (v) => selectedDate = v, enumerable: true },
    visibleMonth: { get: () => visibleMonth, set: (v) => visibleMonth = v, enumerable: true },
    calendarAnimated: { get: () => calendarAnimated, set: (v) => calendarAnimated = v, enumerable: true },
    statsRenderTimer: { get: () => statsRenderTimer, set: (v) => statsRenderTimer = v, enumerable: true },
    pendingRangeExtension: { get: () => pendingRangeExtension, set: (v) => pendingRangeExtension = v, enumerable: true },
    latestStats: { get: () => latestStats, set: (v) => latestStats = v, enumerable: true },
    editingEventTarget: { get: () => editingEventTarget, set: (v) => editingEventTarget = v, enumerable: true },
    editingSubjectTarget: { get: () => editingSubjectTarget, set: (v) => editingSubjectTarget = v, enumerable: true },
    editingTrackTarget: { get: () => editingTrackTarget, set: (v) => editingTrackTarget = v, enumerable: true },
    editingTaskTarget: { get: () => editingTaskTarget, set: (v) => editingTaskTarget = v, enumerable: true },
    selectedStatsPeriodId: { get: () => selectedStatsPeriodId, set: (v) => selectedStatsPeriodId = v, enumerable: true },
    editingPeriodTarget: { get: () => editingPeriodTarget, set: (v) => editingPeriodTarget = v, enumerable: true },
    selectedPreviewDateFilter: { get: () => selectedPreviewDateFilter, set: (v) => selectedPreviewDateFilter = v, enumerable: true },
    previewVisibleMonth: { get: () => previewVisibleMonth, set: (v) => previewVisibleMonth = v, enumerable: true },
    routineActiveMonth: { get: () => routineActiveMonth, set: (v) => routineActiveMonth = v, enumerable: true },
    editingHabitTarget: { get: () => editingHabitTarget, set: (v) => editingHabitTarget = v, enumerable: true },
    routineMatrixScrollSaveTimer: { get: () => routineMatrixScrollSaveTimer, set: (v) => routineMatrixScrollSaveTimer = v, enumerable: true },
    onDayDataUpdated: { get: () => onDayDataUpdated, set: (v) => onDayDataUpdated = v, enumerable: true },
    syncConfigFromState: { get: () => syncConfigFromState, set: (v) => syncConfigFromState = v, enumerable: true }
  });
})();
