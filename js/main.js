// Main Entry
(() => {
  window.App = window.App || {};

  
  async function initApplication() {
    App.State.state = App.Storage.loadState();
    App.State.selectedDate = App.Calendar.getInitialSelectedDate();
    App.State.visibleMonth = App.Calendar.getInitialVisibleMonth();

    if (App.Storage && typeof App.Storage.initStorage === "function") {
      try {
        await App.Storage.initStorage();
        App.State.state = App.Storage.loadState();
      } catch (err) {
        console.warn("Error en initStorage:", err);
      }
    }

    if (!App.Storage.hasState()) {
      if (!App.State.state.settings.subjects) {
        App.State.state.settings.subjects = [];
        App.State.state.settings.subjectDifficulty = {};
      }
      if (!App.State.state.settings.tracks) {
        App.State.state.settings.tracks = [];
      }
      if (!App.State.state.routineTracker) {
        App.State.state.routineTracker = { habits: [], monthlyChecks: {}, matrixScrollLeft: 0, hiddenHistoryMonths: [] };
      }
      App.Storage.saveState();
    }

    App.State.syncConfigFromState();

    // Early dark mode
    if (App.Storage.getDarkMode()) {
      document.documentElement.setAttribute("data-theme", "dark");
    }

    if (App.I18n && typeof App.I18n.applyDOMTranslations === "function") {
      App.I18n.applyDOMTranslations();
    }

    App.Settings.applyProfile();
    App.Tasks.renderEventTypeOptions();
    App.Tasks.renderEventSubjectOptions();
    App.Tasks.updateEventEntryFields();
    App.Tasks.renderSubjectInputs();
    App.Tracker.renderTrackInputs();
    App.Calendar.renderCalendar();
    App.DayPanel.renderSelectedDay();
    App.Stats.renderStats();
    App.Settings.renderSettings();
    App.Calendar.renderEventLegend();
    updateDynamicLabels();

    if (typeof App.Tracker.initRoutineTrackerEvents === "function") {
      App.Tracker.initRoutineTrackerEvents();
    }
    if (typeof App.Tracker.renderRoutineTracker === "function") {
      App.Tracker.renderRoutineTracker();
    }
    if (typeof App.Tasks.renderChecklistFilters === "function") {
      App.Tasks.renderChecklistFilters();
    }
    if (typeof App.Tasks.refreshChecklistAll === "function") {
      App.Tasks.refreshChecklistAll();
    }
    if (App.Settings && typeof App.Settings.renderProfileDashboard === "function") {
      App.Settings.renderProfileDashboard();
    }
    if (App.Settings && typeof App.Settings.updateStorageStatusUI === "function") {
      App.Settings.updateStorageStatusUI();
    }

    renderLastUpdateIndicator();

    // Restaurar vista activa persistida (Tracker, Perfil o Calendario)
    try {
      const savedView = localStorage.getItem("log_calendar_active_view");
      if (savedView && savedView !== "calendar" && App.Tracker && typeof App.Tracker.switchView === "function") {
        App.Tracker.switchView(savedView);
      }
    } catch (e) {}
  }

  // Version indicator
  if (App.Constants.settingsVersionIndicatorEl) {
    App.Constants.settingsVersionIndicatorEl.textContent = App.I18n?.text(
      `LOG of growth • Versión ${App.Constants.APP_VERSION}`,
      `LOG of growth • Version ${App.Constants.APP_VERSION}`
    );
  }

  // Start application asynchronously
  initApplication();
  setInterval(renderLastUpdateIndicator, 30000);

if (App.Constants.statsPeriodSelectEl) {
  App.Constants.statsPeriodSelectEl.addEventListener("change", () => {
    App.State.selectedStatsPeriodId = App.Constants.statsPeriodSelectEl.value;
    App.Stats.renderStats();
  });
}

// Eventos del modal de detalles
if (App.Constants.taskDetailsCloseBtn) App.Constants.taskDetailsCloseBtn.addEventListener("click", App.Tasks.closeTaskDetailsModal);
if (App.Constants.taskDetailsOkBtn) App.Constants.taskDetailsOkBtn.addEventListener("click", App.Tasks.closeTaskDetailsModal);
if (App.Constants.taskDetailsModalEl) {
  App.Constants.taskDetailsModalEl.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-close-task-details")) App.Tasks.closeTaskDetailsModal();
  });
}
if (App.Constants.taskDetailsCheckboxEl) {
  App.Constants.taskDetailsCheckboxEl.addEventListener("change", () => {
    if (currentViewingTaskId) {
      App.Tasks.toggleTaskCompletion(currentViewingTaskId);
      const updatedTask = App.State.state?.checklistTasks?.find(t => t.id === currentViewingTaskId);
      if (updatedTask) {
        App.Constants.taskDetailsCheckboxEl.checked = updatedTask.completed;
        App.Constants.taskDetailsStatusTextEl.textContent = updatedTask.completed
          ? (App.I18n?.t("tasks.statusDone") || "Completada")
          : (App.I18n?.t("tasks.statusPending") || "Pendiente");
        App.Constants.taskDetailsStatusTextEl.style.color = updatedTask.completed ? (App.Utils.isDarkMode() ? "#4ade80" : "#16a34a") : "var(--muted)";
      }
    }
  });
}
if (App.Constants.taskDetailsDeleteBtn) {
  App.Constants.taskDetailsDeleteBtn.addEventListener("click", () => {
    if (currentViewingTaskId) {
      const taskId = currentViewingTaskId;
      App.Tasks.deleteTask(taskId);
      if (!App.State.state?.checklistTasks?.some(t => t.id === taskId)) {
        App.Tasks.closeTaskDetailsModal();
      }
    }
  });
}
if (App.Constants.taskDetailsEditBtn) {
  App.Constants.taskDetailsEditBtn.addEventListener("click", () => {
    if (currentViewingTaskId) {
      const task = App.State.state?.checklistTasks?.find(t => t.id === currentViewingTaskId);
      if (task) {
        App.Tasks.closeTaskDetailsModal();
        App.Tasks.openTaskEntry(task);
      }
    }
  });
}

if (typeof App.Tasks.renderChecklistFilters === "function") {
  App.Tasks.renderChecklistFilters();
}
if (typeof App.Tasks.refreshChecklistAll === "function") {
  App.Tasks.refreshChecklistAll();
}

if (App.Constants.subjectsHeaderLabelEl) {
  App.Constants.subjectsHeaderLabelEl.addEventListener("dblclick", App.Tasks.renameSubjectsPrompt);
}
if (App.Constants.settingsSubjectsTitleEl) {
  App.Constants.settingsSubjectsTitleEl.addEventListener("dblclick", App.Tasks.renameSubjectsPrompt);
}
if (App.Constants.settingsTracksTitleEl) {
  App.Constants.settingsTracksTitleEl.addEventListener("dblclick", App.Tasks.renameTracksPrompt);
}

if (App.Constants.clearDayBtn) App.Constants.clearDayBtn.addEventListener("click", App.DayPanel.clearSelectedDay);
if (App.Constants.exportBtn) App.Constants.exportBtn.addEventListener("click", App.Storage.exportData);
if (App.Constants.importInput) App.Constants.importInput.addEventListener("change", App.Storage.importData);
if (App.Constants.settingsBtn) App.Constants.settingsBtn.addEventListener("click", App.Settings.openSettings);
if (App.Constants.resetDataBtn) App.Constants.resetDataBtn.addEventListener("click", App.Utils.resetAllData);
if (App.Constants.prevMonthsBtn) App.Constants.prevMonthsBtn.addEventListener("click", () => App.Calendar.moveVisibleMonths(-2));
if (App.Constants.nextMonthsBtn) App.Constants.nextMonthsBtn.addEventListener("click", () => App.Calendar.moveVisibleMonths(2));
const navigateToCalendarStats = () => {
  if (App.Tracker && typeof App.Tracker.switchView === "function") {
    App.Tracker.switchView("profile", "study");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (App.Stats && typeof App.Stats.openAdvancedStats === "function") {
    App.Stats.openAdvancedStats();
  }
};
if (App.Constants.moreStatsBtn) App.Constants.moreStatsBtn.addEventListener("click", navigateToCalendarStats);
const metricsGridEl = document.getElementById("metricsGrid");
if (metricsGridEl) {
  const openMetricFromEvent = (event) => {
    const card = event.target.closest("[data-metric-id]");
    if (!card || !metricsGridEl.contains(card)) return;
    App.Stats.openMetricDetails(card.dataset.metricId);
  };
  metricsGridEl.addEventListener("click", openMetricFromEvent);
  metricsGridEl.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest("[data-metric-id]");
    if (!card || !metricsGridEl.contains(card)) return;
    event.preventDefault();
    App.Stats.openMetricDetails(card.dataset.metricId);
  });
}
if (App.Constants.statsHeaderTitle) App.Constants.statsHeaderTitle.addEventListener("click", navigateToCalendarStats);
if (App.Constants.statPillGrandTotal) App.Constants.statPillGrandTotal.addEventListener("click", navigateToCalendarStats);
if (App.Constants.statPillWeightedLoad) App.Constants.statPillWeightedLoad.addEventListener("click", navigateToCalendarStats);
if (App.Constants.advancedStatsCloseBtn) App.Constants.advancedStatsCloseBtn.addEventListener("click", App.Stats.closeAdvancedStats);
if (App.Constants.advancedStatsModalEl) {
  App.Constants.advancedStatsModalEl.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-close-advanced-stats")) App.Stats.closeAdvancedStats();
  });
}
const metricDetailsCloseBtn = document.getElementById("metricDetailsCloseBtn");
const metricDetailsModal = document.getElementById("metricDetailsModal");
if (metricDetailsCloseBtn) metricDetailsCloseBtn.addEventListener("click", App.Stats.closeMetricDetails);
if (metricDetailsModal) {
  metricDetailsModal.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-close-metric-details")) App.Stats.closeMetricDetails();
  });
}
if (App.Constants.settingsCloseBtn) App.Constants.settingsCloseBtn.addEventListener("click", App.Settings.closeSettings);
if (App.Constants.settingsModalEl) {
  App.Constants.settingsModalEl.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-close-settings")) App.Settings.closeSettings();
  });
}
if (App.Constants.openSubjectModalBtn) App.Constants.openSubjectModalBtn.addEventListener("click", App.Tasks.openSubjectEntry);
if (App.Constants.openSubjectModalFromDayBtn) App.Constants.openSubjectModalFromDayBtn.addEventListener("click", App.Tasks.openSubjectEntry);
if (App.Constants.openTrackModalBtn) App.Constants.openTrackModalBtn.addEventListener("click", App.Tracker.openTrackEntry);
if (App.Constants.openPeriodModalBtn) App.Constants.openPeriodModalBtn.addEventListener("click", () => App.Periods.openPeriodEntry());
if (App.Constants.openEventModalBtn) App.Constants.openEventModalBtn.addEventListener("click", () => App.Tasks.openEventEntry());
if (App.Constants.eventEntryCloseBtn) App.Constants.eventEntryCloseBtn.addEventListener("click", App.Tasks.closeEventEntry);
if (App.Constants.eventEntryModalEl) {
  App.Constants.eventEntryModalEl.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-close-event")) App.Tasks.closeEventEntry();
  });
}
if (App.Constants.subjectEntryCloseBtn) App.Constants.subjectEntryCloseBtn.addEventListener("click", App.Tasks.closeSubjectEntry);
if (App.Constants.trackEntryCloseBtn) App.Constants.trackEntryCloseBtn.addEventListener("click", App.Tracker.closeTrackEntry);
if (App.Constants.periodEntryCloseBtn) App.Constants.periodEntryCloseBtn.addEventListener("click", App.Periods.closePeriodEntry);
if (App.Constants.subjectEntryModalEl) {
  App.Constants.subjectEntryModalEl.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-close-entry")) App.Tasks.closeSubjectEntry();
  });
}
if (App.Constants.trackEntryModalEl) {
  App.Constants.trackEntryModalEl.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-close-entry")) App.Tracker.closeTrackEntry();
  });
}
if (App.Constants.periodEntryModalEl) {
  App.Constants.periodEntryModalEl.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-close-period-modal")) App.Periods.closePeriodEntry();
  });
}
if (App.Constants.periodReportCloseBtn) App.Constants.periodReportCloseBtn.addEventListener("click", App.Stats.closePeriodReportModal);
if (App.Constants.periodReportDoneBtn) App.Constants.periodReportDoneBtn.addEventListener("click", App.Stats.closePeriodReportModal);
if (App.Constants.periodReportModalEl) {
  App.Constants.periodReportModalEl.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-close-report-modal")) App.Stats.closePeriodReportModal();
  });
}
if (App.Constants.tabSummary) App.Constants.tabSummary.addEventListener("click", () => App.Stats.switchReportTab("Summary"));
if (App.Constants.tabSubjects) App.Constants.tabSubjects.addEventListener("click", () => App.Stats.switchReportTab("Subjects"));
if (App.Constants.tabInsights) App.Constants.tabInsights.addEventListener("click", () => App.Stats.switchReportTab("Insights"));
if (App.Constants.tabBadges) App.Constants.tabBadges.addEventListener("click", () => App.Stats.switchReportTab("Badges"));
if (App.Constants.sortRepHours) App.Constants.sortRepHours.addEventListener("click", () => {
  App.Constants.sortRepHours.classList.add("active");
  App.Constants.sortRepName.classList.remove("active");
  App.Stats.renderReportSubjectsBreakdown("hours");
});
if (App.Constants.sortRepName) App.Constants.sortRepName.addEventListener("click", () => {
  App.Constants.sortRepName.classList.add("active");
  App.Constants.sortRepHours.classList.remove("active");
  App.Stats.renderReportSubjectsBreakdown("name");
});
App.Constants.rangeEntryCloseBtn.addEventListener("click", App.Settings.closeRangeEntry);
App.Constants.rangeEntryConfirmBtn.addEventListener("click", App.Calendar.extendCalendarRange);
App.Constants.rangeEntryModalEl.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-range")) App.Settings.closeRangeEntry();
});
App.Constants.eventFormEl.addEventListener("submit", App.Tasks.addCustomEvent);
App.Constants.eventTypeEl.addEventListener("change", () => {
  if (App.Constants.eventTypeEl.value === "exam" && App.Constants.eventSubjectEl.value === "") {
    if (App.State.subjects.length) {
      App.Constants.eventSubjectEl.value = App.State.subjects[0].name;
    } else {
      App.Constants.eventSubjectEl.value = "__new_subject__";
    }
  }
  App.Tasks.updateEventEntryFields();
});
App.Constants.eventSubjectEl.addEventListener("change", App.Tasks.updateEventEntryFields);
App.Constants.profileFormEl.addEventListener("submit", App.Settings.saveProfileSettings);
const goalsForm = document.getElementById("goalsForm");
if (goalsForm) goalsForm.addEventListener("submit", App.Settings.saveGoalsSettings);
App.Constants.subjectSettingsFormEl.addEventListener("submit", App.Tasks.addSubjectFromSettings);
App.Constants.trackSettingsFormEl.addEventListener("submit", App.Tracker.addTrackFromSettings);
if (App.Constants.periodSettingsFormEl) App.Constants.periodSettingsFormEl.addEventListener("submit", App.Periods.saveAcademicPeriod);
App.Constants.subjectsSettingsListEl.addEventListener("click", App.Tasks.handleSubjectSettingsClick);
App.Constants.tracksSettingsListEl.addEventListener("click", App.Tracker.handleTrackSettingsClick);
if (App.Constants.periodsSettingsListEl) App.Constants.periodsSettingsListEl.addEventListener("click", App.Periods.handlePeriodSettingsClick);

// View switching (Calendar, Tracker, Perfil)
if (App.Constants.tabCalendar) {
  App.Constants.tabCalendar.addEventListener("click", () => App.Tracker.switchView("calendar"));
}
if (App.Constants.tabChecklist) {
  App.Constants.tabChecklist.addEventListener("click", () => App.Tracker.switchView("checklist"));
}
if (App.Constants.tabProfile) {
  App.Constants.tabProfile.addEventListener("click", () => App.Tracker.switchView("profile"));
}
if (App.Constants.tabInsights) {
  App.Constants.tabInsights.addEventListener("click", () => App.Tracker.switchView("profile", "stats"));
}
if (App.Constants.workspaceEl) {
  App.Constants.workspaceEl.addEventListener("wheel", App.Tracker.handleHorizontalViewSwipe, { passive: false });
}
const addNewTaskBtn = document.getElementById("addNewTaskBtn");
if (addNewTaskBtn) addNewTaskBtn.addEventListener("click", () => App.Tasks.openTaskEntry());

const addDayTaskBtn = document.getElementById("addDayTaskBtn");
if (addDayTaskBtn) addDayTaskBtn.addEventListener("click", () => App.Tasks.openTaskEntry(null, App.State.selectedDate));

if (App.Constants.taskEntryCloseBtn) App.Constants.taskEntryCloseBtn.addEventListener("click", App.Tasks.closeTaskEntry);
if (App.Constants.taskEntryModalEl) {
  App.Constants.taskEntryModalEl.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-close-task")) App.Tasks.closeTaskEntry();
  });
}
if (App.Constants.taskFormEl) App.Constants.taskFormEl.addEventListener("submit", App.Tasks.saveTask);

const taskSearchInputEl = document.getElementById("taskSearchInput");
const filterSubjectEl = document.getElementById("filterSubject");
const filterStatusEl = document.getElementById("filterStatus");
const filterSortEl = document.getElementById("filterSort");
const checklistListEl = document.getElementById("checklistList");
const dayTasksListEl = document.getElementById("dayTasksList");
const checklistFiltersDropdown = document.getElementById("checklistFiltersDropdown");
const clearDayFilterBtn = document.getElementById("clearDayFilterBtn");
const prevPreviewMonthBtn = document.getElementById("prevPreviewMonthBtn");
const nextPreviewMonthBtn = document.getElementById("nextPreviewMonthBtn");

if (taskSearchInputEl) taskSearchInputEl.addEventListener("input", App.Tasks.renderChecklist);
if (filterSubjectEl) filterSubjectEl.addEventListener("change", App.Tasks.renderChecklist);
if (filterStatusEl) filterStatusEl.addEventListener("change", App.Tasks.renderChecklist);
if (filterSortEl) filterSortEl.addEventListener("change", App.Tasks.renderChecklist);
if (checklistListEl) checklistListEl.addEventListener("click", App.Tasks.handleChecklistClick);
if (dayTasksListEl) dayTasksListEl.addEventListener("click", App.Tasks.handleDayTasksClick);
if (App.Constants.checklistAddFormEl) App.Constants.checklistAddFormEl.addEventListener("submit", App.Tasks.saveChecklistInPageTask);
if (App.Constants.checklistDayTasksListEl) App.Constants.checklistDayTasksListEl.addEventListener("click", App.Tasks.handleDayTasksClick);

// Control de apertura del panel de filtros superpuesto y clicks fuera
if (taskSearchInputEl && checklistFiltersDropdown) {
  taskSearchInputEl.addEventListener("focus", () => {
    checklistFiltersDropdown.style.display = "flex";
  });
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
    App.State.selectedPreviewDateFilter = null;
    App.Tasks.renderChecklistCalendarPreview();
    App.Tasks.renderChecklist();
  });
}

// Botones de navegación del mini-calendario
if (prevPreviewMonthBtn) {
  prevPreviewMonthBtn.addEventListener("click", () => {
    App.State.previewVisibleMonth = App.Utils.addMonths(App.State.previewVisibleMonth, -1);
    App.Tasks.renderChecklistCalendarPreview();
  });
}
if (nextPreviewMonthBtn) {
  nextPreviewMonthBtn.addEventListener("click", () => {
    App.State.previewVisibleMonth = App.Utils.addMonths(App.State.previewVisibleMonth, 1);
    App.Tasks.renderChecklistCalendarPreview();
  });
}

function commitTimeInput(target, entriesCollection, valueCollection, key, label, type) {
  const day = App.DayPanel.ensureDay(App.State.selectedDate);
  const raw = target.value.trim();
  const currentParts = App.Utils.getTimeEntryParts(day, entriesCollection, key);
  const parts = App.Utils.parseTimeExpression(raw, currentParts);
  if (raw && !parts.length) {
    App.Utils.updateTimeInputDisplay(target, currentParts);
    return;
  }
  const total = parts.reduce((sum, value) => sum + value, 0);
  const normalizedTotal = App.Utils.getTimeEntryMode() === "hours-minutes"
    ? Math.min(24, Math.round(total * 60) / 60)
    : App.Utils.normalizeHours(total);

  day[valueCollection][key] = normalizedTotal;
  App.Utils.setTimeEntryParts(day, entriesCollection, key, parts);
  App.Utils.updateTimeInputDisplay(target, parts);
  recordLastUpdate({ source: "calendar", target: label, type });
  App.State.onDayDataUpdated();
}

App.Constants.subjectFormEl.addEventListener("input", (event) => {
  if (!(event.target instanceof HTMLInputElement) || !event.target.dataset.subject) return;
});

App.Constants.focusTracksEl.addEventListener("input", (event) => {
  if (!(event.target instanceof HTMLInputElement) || !event.target.dataset.track) return;
});

App.Constants.subjectFormEl.addEventListener("change", (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement && target.dataset.subject) {
    commitTimeInput(target, "subjectTimeEntries", "subjects", target.dataset.subject, target.dataset.subject, "subject");
  }
});

App.Constants.focusTracksEl.addEventListener("change", (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement && target.dataset.track) {
    const trackObj = (App.State.state.settings?.tracks || App.State.EXTRA_TRACKS || []).find(t => t.key === target.dataset.track);
    commitTimeInput(target, "extraTimeEntries", "extra", target.dataset.track, trackObj ? trackObj.label : target.dataset.track, "track");
  }
});

App.Constants.subjectFormEl.addEventListener("blur", (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement && target.dataset.subject) {
    commitTimeInput(target, "subjectTimeEntries", "subjects", target.dataset.subject, target.dataset.subject, "subject");
  }
}, true);

App.Constants.focusTracksEl.addEventListener("blur", (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement && target.dataset.track) {
    const trackObj = (App.State.state.settings?.tracks || App.State.EXTRA_TRACKS || []).find(t => t.key === target.dataset.track);
    commitTimeInput(target, "extraTimeEntries", "extra", target.dataset.track, trackObj ? trackObj.label : target.dataset.track, "track");
  }
}, true);

function commitTimeInputOnEnter(event) {
  if (event.key !== "Enter" || !(event.target instanceof HTMLInputElement)) return;
  const target = event.target;
  if (target.dataset.subject) {
    event.preventDefault();
    commitTimeInput(target, "subjectTimeEntries", "subjects", target.dataset.subject, target.dataset.subject, "subject");
  } else if (target.dataset.track) {
    event.preventDefault();
    const trackObj = (App.State.state.settings?.tracks || App.State.EXTRA_TRACKS || []).find(t => t.key === target.dataset.track);
    commitTimeInput(target, "extraTimeEntries", "extra", target.dataset.track, trackObj ? trackObj.label : target.dataset.track, "track");
  }
}

App.Constants.subjectFormEl.addEventListener("keydown", commitTimeInputOnEnter);
App.Constants.focusTracksEl.addEventListener("keydown", commitTimeInputOnEnter);

App.Constants.dayNotesEl.addEventListener("input", () => {
  App.DayPanel.ensureDay(App.State.selectedDate).notes = App.Constants.dayNotesEl.value;
  recordLastUpdate({
    source: "calendar",
    target: "Nota del día",
    type: "note"
  });
  App.Storage.saveState();
  App.Calendar.refreshDayCell(App.State.selectedDate);
  App.Storage.flashAutoSave();
});

App.Constants.starsContainerEl.addEventListener("click", (event) => {
  const star = event.target.closest(".star");
  if (!star) return;
  const value = Number(star.dataset.value);
  const day = App.DayPanel.ensureDay(App.State.selectedDate);
  day.rating = day.rating === value ? 0 : value;
  recordLastUpdate({
    source: "calendar",
    target: "Valoración del día",
    type: "rating"
  });
  App.Storage.saveState();
  App.DayPanel.renderRating(day.rating);
  App.Calendar.refreshDayCell(App.State.selectedDate);
  App.Stats.renderStats();
  App.Storage.flashAutoSave();
});

App.Constants.starsContainerEl.addEventListener("mouseover", (event) => {
  const star = event.target.closest(".star");
  if (!star) return;
  const val = Number(star.dataset.value);
  App.DayPanel.highlightStars(val);
  App.Constants.ratingHintEl.textContent = App.Constants.RATING_LABELS[val];
  App.Constants.ratingHintEl.dataset.level = val;
});

App.Constants.starsContainerEl.addEventListener("mouseleave", () => {
  const rating = App.State.state.days[App.State.selectedDate]?.rating || 0;
  App.DayPanel.renderRating(rating);
});

function recordLastUpdate({ source, target, type }) {
  if (!App.State.state) return;
  App.State.state.lastUpdate = {
    timestamp: Date.now(),
    source: String(source || ""),
    target: String(target || "").trim(),
    type: String(type || "")
  };
  App.Storage.saveState();
  renderLastUpdateIndicator(true);
}

function renderLastUpdateIndicator(animate = false) {
          if (!App.Constants.container || !App.Constants.timeEl || !App.Constants.detailEl || !App.Constants.dotEl) return;

  const lastUpdate = App.State.state?.lastUpdate;
  if (!lastUpdate || !lastUpdate.timestamp) {
    App.Constants.dotEl.classList.remove("is-active", "pulse");
    const lastUpdateLabel = App.I18n?.t("topbar.lastUpdate") || "Última actualización:";
    App.Constants.timeEl.textContent = `${lastUpdateLabel} —`;
    App.Constants.detailEl.textContent = App.I18n?.t("topbar.noRecords") || "Sin registros recientes";
    App.Constants.container.setAttribute("title", App.I18n?.text("No hay modificaciones registradas todavía", "No changes have been recorded yet."));
    return;
  }

  App.Constants.dotEl.classList.add("is-active");
  if (animate) {
    App.Constants.dotEl.classList.remove("pulse");
    void App.Constants.dotEl.offsetWidth;
    App.Constants.dotEl.classList.add("pulse");
  }

  const relativeTime = App.Utils.formatRelativeTime(lastUpdate.timestamp);
  App.Constants.timeEl.textContent = `${App.I18n?.t("topbar.lastUpdate") || "Última actualización:"} ${relativeTime}`;

  let sourceLabel = "";
  let typeLabel = "";
  const subSingular = App.State.state?.settings?.subjectsLabelSingular || "Asignatura";
  const hobSingular = App.State.state?.settings?.hobbiesLabelSingular || "Hobby";

  if (lastUpdate.source === "calendar") {
    sourceLabel = App.I18n?.t("dock.calendar") || "Calendario";
    if (lastUpdate.type === "subject") {
      typeLabel = `${subSingular}: ${lastUpdate.target}`;
    } else if (lastUpdate.type === "track") {
      typeLabel = `${hobSingular}: ${lastUpdate.target}`;
    } else if (lastUpdate.type === "note") {
      typeLabel = App.I18n?.text("Nota del día", "Day note");
    } else if (lastUpdate.type === "rating") {
      typeLabel = App.I18n?.text("Valoración del día", "Day rating");
    } else if (lastUpdate.type === "event") {
      typeLabel = lastUpdate.target || (App.I18n?.t("events.categories.other") || "Evento");
    } else {
      typeLabel = lastUpdate.target || App.I18n?.text("Registro", "Record");
    }
  } else if (lastUpdate.source === "tracker") {
    sourceLabel = App.I18n?.t("dock.tracker") || "Tracker";
    if (lastUpdate.type === "habit") {
      typeLabel = `${App.I18n?.text("Hábito", "Habit")}: ${lastUpdate.target}`;
    } else {
      typeLabel = lastUpdate.target || App.I18n?.text("Hábito", "Habit");
    }
  } else if (lastUpdate.source === "tasks") {
    sourceLabel = App.I18n?.t("tasks.title") || "Tareas";
    typeLabel = lastUpdate.target || App.I18n?.text("Tarea", "Task");
  } else {
    sourceLabel = lastUpdate.source || App.I18n?.text("General", "General");
    typeLabel = lastUpdate.target || "";
  }

  const detailText = typeLabel ? `${sourceLabel} · ${typeLabel}` : sourceLabel;
  App.Constants.detailEl.textContent = detailText;

  const exactDate = new Date(lastUpdate.timestamp);
  const formattedFull = exactDate.toLocaleString(App.I18n?.getLocale?.() || "es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  App.Constants.container.setAttribute("title", `Última actualización: ${formattedFull}\n${detailText}`);
}

function updateDynamicLabels() {
  const subPlural = App.State.state.settings.subjectsLabelPlural || "Asignaturas";
  const subSingular = App.State.state.settings.subjectsLabelSingular || "Asignatura";
  const hobPlural = App.State.state.settings.hobbiesLabelPlural || "Hobbies";
  const hobSingular = App.State.state.settings.hobbiesLabelSingular || "Hobby";

  // Main Page elements
    if (App.Constants.studyFocusLabelEl) App.Constants.studyFocusLabelEl.textContent = App.I18n?.text(`foco en ${subPlural.toLowerCase()}`, `${subPlural} focus`);
  
    if (App.Constants.hobbyFocusLabelEl) App.Constants.hobbyFocusLabelEl.textContent = App.I18n?.text(`foco en ${hobPlural.toLowerCase()}`, `${hobPlural} focus`);

    if (App.Constants.topSubjectLabelEl) App.Constants.topSubjectLabelEl.textContent = App.I18n?.text(`${subSingular.toLowerCase()} dominante`, `dominant ${subSingular.toLowerCase()}`);

    if (App.Constants.topTrackLabelEl) App.Constants.topTrackLabelEl.textContent = App.I18n?.text(`${hobSingular.toLowerCase()} dominante`, `dominant ${hobSingular.toLowerCase()}`);

    if (App.Constants.subjectChartTitleEl) App.Constants.subjectChartTitleEl.textContent = App.I18n?.text(`Horas por ${subSingular.toLowerCase()}`, `Hours per ${subSingular.toLowerCase()}`);

    if (App.Constants.subjectsHeaderLabelEl) {
    App.Constants.subjectsHeaderLabelEl.textContent = subPlural;
    App.Constants.subjectsHeaderLabelEl.title = App.I18n?.text(`Doble click para renombrar las ${subPlural.toLowerCase()}`, `Double-click to rename ${subPlural.toLowerCase()}`);
  }

    if (App.Constants.streakLabelEl) {
    App.Constants.streakLabelEl.textContent = App.I18n?.text(`racha de días seguidos con ${subPlural.toLowerCase()}`, `consecutive ${subPlural.toLowerCase()} streak`);
  }

  // Settings elements
    if (App.Constants.settingsSubjectsTitleEl) {
    App.Constants.settingsSubjectsTitleEl.textContent = subPlural;
    App.Constants.settingsSubjectsTitleEl.title = App.I18n?.text(`Doble click para renombrar las ${subPlural.toLowerCase()}`, `Double-click to rename ${subPlural.toLowerCase()}`);
  }

    if (App.Constants.settingsTracksTitleEl) {
    App.Constants.settingsTracksTitleEl.textContent = hobPlural;
    App.Constants.settingsTracksTitleEl.title = App.I18n?.text(`Doble click para renombrar los ${hobPlural.toLowerCase()}`, `Double-click to rename ${hobPlural.toLowerCase()}`);
  }

    if (App.Constants.openSubjectModalBtnEl) App.Constants.openSubjectModalBtnEl.textContent = App.I18n?.text(`Añadir ${subSingular.toLowerCase()}`, `Add ${subSingular.toLowerCase()}`);
  if (App.Constants.openSubjectModalFromDayBtn) App.Constants.openSubjectModalFromDayBtn.title = App.I18n?.text(`Añadir ${subSingular.toLowerCase()}`, `Add ${subSingular.toLowerCase()}`);

    if (App.Constants.openTrackModalBtnEl) App.Constants.openTrackModalBtnEl.textContent = App.I18n?.text(`Añadir ${hobSingular.toLowerCase()}`, `Add ${hobSingular.toLowerCase()}`);

  // Subject Entry Modal
    if (App.Constants.subjectEntryEyebrowEl) App.Constants.subjectEntryEyebrowEl.textContent = subPlural;

    if (App.Constants.subjectEntryTitleEl) {
    const isEditing = App.Constants.subjectEntryTitleEl.textContent.startsWith("Editar");
    App.Constants.subjectEntryTitleEl.textContent = isEditing
      ? App.I18n?.text(`Editar ${subSingular.toLowerCase()}`, `Edit ${subSingular.toLowerCase()}`)
      : App.I18n?.text(`Añadir ${subSingular.toLowerCase()}`, `Add ${subSingular.toLowerCase()}`);
  }

    if (App.Constants.newSubjectNameEl) App.Constants.newSubjectNameEl.placeholder = App.I18n?.text(`Nombre de la ${subSingular.toLowerCase()}`, `${subSingular} name`);

    if (App.Constants.newSubjectDifficultyEl) {
    App.Constants.newSubjectDifficultyEl.placeholder = App.I18n?.text(`Añadir dificultad de la ${subSingular.toLowerCase()}`, `Add ${subSingular.toLowerCase()} difficulty`);
    App.Constants.newSubjectDifficultyEl.setAttribute("aria-label", App.I18n?.text(`Dificultad de la ${subSingular.toLowerCase()}`, `${subSingular} difficulty`));
  }

  const subjectSettingsFormSubmitBtn = document.querySelector('#subjectSettingsForm button[type="submit"]');
  if (subjectSettingsFormSubmitBtn) subjectSettingsFormSubmitBtn.textContent = App.I18n?.text(`Añadir ${subSingular.toLowerCase()}`, `Add ${subSingular.toLowerCase()}`);

  // Track Entry Modal
    if (App.Constants.trackEntryEyebrowEl) App.Constants.trackEntryEyebrowEl.textContent = hobPlural;

    if (App.Constants.trackEntryTitleEl) {
    const isEditing = App.Constants.trackEntryTitleEl.textContent.startsWith("Editar");
    App.Constants.trackEntryTitleEl.textContent = isEditing
      ? App.I18n?.text(`Editar ${hobSingular.toLowerCase()}`, `Edit ${hobSingular.toLowerCase()}`)
      : App.I18n?.text(`Añadir ${hobSingular.toLowerCase()}`, `Add ${hobSingular.toLowerCase()}`);
  }

    if (App.Constants.newTrackNameEl) App.Constants.newTrackNameEl.placeholder = App.I18n?.text(`Nombre del ${hobSingular.toLowerCase()}`, `${hobSingular} name`);

  const trackSettingsFormSubmitBtn = document.querySelector('#trackSettingsForm button[type="submit"]');
  if (trackSettingsFormSubmitBtn) trackSettingsFormSubmitBtn.textContent = App.I18n?.text(`Añadir ${hobSingular.toLowerCase()}`, `Add ${hobSingular.toLowerCase()}`);

  // Event Form elements
    if (App.Constants.eventSubjectLabelEl) App.Constants.eventSubjectLabelEl.textContent = App.I18n?.text(`${subSingular} del evento`, `Event ${subSingular.toLowerCase()}`);

    if (App.Constants.eventSubjectEl) App.Constants.eventSubjectEl.setAttribute("aria-label", App.I18n?.text(`${subSingular} del evento`, `Event ${subSingular.toLowerCase()}`));

    if (App.Constants.eventNewSubjectNameEl) App.Constants.eventNewSubjectNameEl.placeholder = App.I18n?.text(`Nombre de la ${subSingular.toLowerCase()}`, `${subSingular} name`);
}


App.Theme.initDarkMode();

// Public bridge for the ES Module shell. Templates continue to use the explicit
// global handlers registered above while the rest of the application migrates.
window.App.Main = {
  recordLastUpdate,
  renderLastUpdateIndicator,
  updateDynamicLabels,
  initApplication
};

})();
