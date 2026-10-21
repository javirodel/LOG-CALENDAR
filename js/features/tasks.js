(() => {
  window.App = window.App || {};
  window.App.Tasks = window.App.Tasks || {};

  const addNewTaskBtn = null;
  const checklistListEl = null;
  const taskSearchInputEl = null;
  const filterSubjectEl = null;
  const filterStatusEl = null;
  const filterSortEl = null;
  const totalTasksCountEl = null;
  const pendingTasksCountEl = null;
  const completedTasksCountEl = null;
  const overdueTasksCountEl = null;
  const completedPercentageEl = null;
  const taskStatsChartEl = null;
  const dayTasksListEl = null;
  const addDayTaskBtn = null;
  const checklistFiltersDropdown = null;
  const calendarPreviewGrid = null;
  const clearDayFilterBtn = null;
  const prevPreviewMonthBtn = null;
  const nextPreviewMonthBtn = null;
  const closeFiltersBtn = null;



function renameSubjectsPrompt() {
  const oldPlural = App.State.state.settings.subjectsLabelPlural || "Asignaturas";
  const oldSingular = App.State.state.settings.subjectsLabelSingular || "Asignatura";
  const newPlural = prompt(`Introduce el nombre en PLURAL para reemplazar "${oldPlural}" (ej. Proyectos, Tareas):`, oldPlural);
  if (!newPlural || !newPlural.trim()) return;
  const newSingular = prompt(`Introduce el nombre en SINGULAR para reemplazar "${oldSingular}" (ej. Proyecto, Tarea):`, oldSingular);
  if (!newSingular || !newSingular.trim()) return;

  App.State.state.settings.subjectsLabelPlural = newPlural.trim();
  App.State.state.settings.subjectsLabelSingular = newSingular.trim();
  
  App.Storage.saveState();
  App.State.syncConfigFromState();
  App.Main.updateDynamicLabels();
  App.Settings.renderSettings();
  App.DayPanel.renderSelectedDay();
  App.Stats.renderStats();
  App.Utils.showToast(App.I18n?.text("Nombres actualizados.", "Names updated."));
}

function renameTracksPrompt() {
  const oldPlural = App.State.state.settings.hobbiesLabelPlural || "Hobbies";
  const oldSingular = App.State.state.settings.hobbiesLabelSingular || "Hobby";
  const newPlural = prompt(`Introduce el nombre de Hobbies en PLURAL para reemplazar "${oldPlural}" (ej. Pasatiempos, Actividades):`, oldPlural);
  if (!newPlural || !newPlural.trim()) return;
  const newSingular = prompt(`Introduce el nombre de Hobbies en SINGULAR para reemplazar "${oldSingular}" (ej. Pasatiempo, Actividad):`, oldSingular);
  if (!newSingular || !newSingular.trim()) return;

  App.State.state.settings.hobbiesLabelPlural = newPlural.trim();
  App.State.state.settings.hobbiesLabelSingular = newSingular.trim();

  App.Storage.saveState();
  App.State.syncConfigFromState();
  App.Main.updateDynamicLabels();
  App.Settings.renderSettings();
  App.DayPanel.renderSelectedDay();
  App.Stats.renderStats();
  App.Utils.showToast(App.I18n?.text("Nombres actualizados.", "Names updated."));
}

function normalizeState(candidate) {
  const normalized = App.Storage.createFallbackState();
  if (!candidate || typeof candidate !== "object") return normalized;

  if (candidate.lastUpdate && typeof candidate.lastUpdate === "object") {
    normalized.lastUpdate = {
      timestamp: Number(candidate.lastUpdate.timestamp) || 0,
      source: String(candidate.lastUpdate.source || ""),
      target: String(candidate.lastUpdate.target || ""),
      type: String(candidate.lastUpdate.type || "")
    };
  } else {
    normalized.lastUpdate = null;
  }

  if (candidate.days && typeof candidate.days === "object") {
    normalized.days = candidate.days;
  }

  if (candidate.settings && typeof candidate.settings === "object") {
    normalized.settings = {
      ...normalized.settings,
      ...candidate.settings,
      subjectsLabelPlural: typeof candidate.settings.subjectsLabelPlural === "string" && candidate.settings.subjectsLabelPlural.trim() ? candidate.settings.subjectsLabelPlural.trim() : "Asignaturas",
      subjectsLabelSingular: typeof candidate.settings.subjectsLabelSingular === "string" && candidate.settings.subjectsLabelSingular.trim() ? candidate.settings.subjectsLabelSingular.trim() : "Asignatura",
      subjectsColor: candidate.settings.subjectsColor ? App.Utils.normalizeColor(candidate.settings.subjectsColor) : (candidate.settings.profile?.accentColor || "#0f766e"),
      hobbiesLabelPlural: typeof candidate.settings.hobbiesLabelPlural === "string" && candidate.settings.hobbiesLabelPlural.trim() ? candidate.settings.hobbiesLabelPlural.trim() : "Hobbies",
      hobbiesLabelSingular: typeof candidate.settings.hobbiesLabelSingular === "string" && candidate.settings.hobbiesLabelSingular.trim() ? candidate.settings.hobbiesLabelSingular.trim() : "Hobby",
      timeEntryMode: candidate.settings.timeEntryMode === "hours-minutes" ? "hours-minutes" : "decimal",
      timeAdditionsEnabled: candidate.settings.timeAdditionsEnabled !== false,
      invertTrackpadSwipe: Boolean(candidate.settings.invertTrackpadSwipe),
      subjectDifficulty: {
        ...normalized.settings.subjectDifficulty,
        ...(candidate.settings.subjectDifficulty || {})
      },
      dailyGoal: typeof candidate.settings.dailyGoal === "number" ? candidate.settings.dailyGoal : 0,
      subjectGoals: candidate.settings.subjectGoals && typeof candidate.settings.subjectGoals === "object" ? candidate.settings.subjectGoals : {},
      trackGoals: candidate.settings.trackGoals && typeof candidate.settings.trackGoals === "object" ? candidate.settings.trackGoals : {},
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
        : App.Tracker.getDefaultRoutineHabits(),
      monthlyChecks: (candidate.routineTracker.monthlyChecks && typeof candidate.routineTracker.monthlyChecks === "object")
        ? candidate.routineTracker.monthlyChecks
        : {},
      matrixScrollLeft: Number.isFinite(Number(candidate.routineTracker.matrixScrollLeft))
        ? Math.max(0, Number(candidate.routineTracker.matrixScrollLeft))
        : 0,
      hiddenHistoryMonths: Array.isArray(candidate.routineTracker.hiddenHistoryMonths)
        ? candidate.routineTracker.hiddenHistoryMonths.map(String)
        : []
    };
  } else {
    normalized.routineTracker = {
      habits: App.Tracker.getDefaultRoutineHabits(),
      monthlyChecks: {},
      matrixScrollLeft: 0,
      hiddenHistoryMonths: []
    };
  }

  return normalized;
}

function normalizeTask(task) {
  if (!task || typeof task !== "object") return null;
  return {
    id: String(task.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`),
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
  return Object.fromEntries(App.Constants.DEFAULT_SUBJECTS.map((subject) => [subject.name, subject.defaultDifficulty]));
}

function getSubjectDifficulty(subjectName) {
  return clampDifficulty(App.State.state.settings.subjectDifficulty[subjectName]);
}

function normalizeProfile(profile) {
  const source = profile && typeof profile === "object" ? profile : {};
  const levels = Array.isArray(source.intensityLevels) ? source.intensityLevels : App.Constants.DEFAULT_PROFILE.intensityLevels;
  return {
    title: typeof source.title === "string" && source.title.trim() ? source.title.trim() : App.Constants.DEFAULT_PROFILE.title,
    role: typeof source.role === "string" ? source.role : "Estudiante / Desarrollo Personal",
    bio: typeof source.bio === "string" ? source.bio : "Modo Enfoque Activo",
    avatarData: source.avatarData || null,
    accentColor: App.Utils.normalizeColor(source.accentColor || App.Constants.DEFAULT_PROFILE.accentColor),
    intensityLevels: App.Utils.normalizeIntensityLevels(levels)
  };
}

function normalizeCalendarRange(range) {
  const start = range?.start && App.Utils.isValidDateKey(range.start) ? range.start : App.Constants.INITIAL_START_DATE;
  const end = range?.end && App.Utils.isValidDateKey(range.end) ? range.end : App.Constants.INITIAL_END_DATE;
  return start <= end ? { start, end } : { start: App.Constants.INITIAL_START_DATE, end: App.Constants.INITIAL_END_DATE };
}

function normalizeSubjects(source) {
  const list = Array.isArray(source) && source.length ? source : App.Constants.DEFAULT_SUBJECTS;
  const seen = new Set();
  return list
    .map((subject) => {
      if (typeof subject === "string") {
        const defaultSubject = App.Constants.DEFAULT_SUBJECTS.find((item) => item.name === subject);
        return {
          name: subject.trim(),
          description: defaultSubject?.description || "Asignatura creada desde importación.",
          color: App.Utils.normalizeColor(defaultSubject?.color),
          defaultDifficulty: clampDifficulty(defaultSubject?.defaultDifficulty ?? 3)
        };
      }

      return {
        name: String(subject.name || "").trim(),
        description: String(subject.description || "").trim(),
        color: App.Utils.normalizeColor(subject.color),
        defaultDifficulty: clampDifficulty(subject.defaultDifficulty ?? subject.difficulty ?? 3)
      };
    })
    .filter((subject) => subject.name && !seen.has(subject.name) && seen.add(subject.name));
}

function normalizeTracks(source) {
  const list = Array.isArray(source) && source.length ? source : App.Constants.DEFAULT_EXTRA_TRACKS;
  const seen = new Set();
  return list
    .map((track) => {
      const label = String(track.label || "").trim();
      const key = track.key ? String(track.key) : (App.Utils.slugifyCategory(label) || "hobby");
      return {
        key,
        label,
        description: String(track.description || "").trim(),
        shortLabel: String(track.shortLabel || App.Utils.getShortLabel(label)).slice(0, 4).toUpperCase(),
        color: App.Utils.normalizeColor(track.color),
        className: `track-${App.Utils.slugifyCategory(label) || "custom"}`
      };
    })
    .filter((track) => track.key && track.label && !seen.has(track.key) && seen.add(track.key));
}

function normalizeAcademicPeriods(periods) {
  if (!Array.isArray(periods)) return [];
  return periods.filter(p => p && typeof p === "object" && typeof p.name === "string" && p.name.trim()).map(p => ({
    id: typeof p.id === "string" && p.id.trim() ? p.id.trim() : `period_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: p.name.trim(),
    startDate: typeof p.startDate === "string" ? p.startDate : App.Utils.getTodayDateKey(),
    endDate: typeof p.endDate === "string" ? p.endDate : App.Utils.getTodayDateKey(),
    subjects: Array.isArray(p.subjects) ? p.subjects.filter(s => typeof s === "string") : [],
    tracks: Array.isArray(p.tracks) ? p.tracks.filter(t => typeof t === "string") : App.State.EXTRA_TRACKS.map(t => t.key)
  }));
}

function clampDifficulty(value) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return 3;
  if (n < 1) return 1;
  if (n > 5) return 5;
  return n;
}

function renderEventTypeOptions(selectedValue = App.Constants.eventTypeEl.value) {
  const customCategories = getCustomEventCategories();
  App.Constants.eventTypeEl.querySelectorAll('option[value^="custom-"]').forEach((option) => option.remove());
  const newCategoryOption = App.Constants.eventTypeEl.querySelector(`option[value="${App.Constants.NEW_CATEGORY_VALUE}"]`);

  for (const category of customCategories) {
    const option = document.createElement("option");
    option.value = category.type;
    option.textContent = category.label;
    App.Constants.eventTypeEl.insertBefore(option, newCategoryOption);
  }

  if (selectedValue && Array.from(App.Constants.eventTypeEl.options).some((option) => option.value === selectedValue)) {
    App.Constants.eventTypeEl.value = selectedValue;
  }
}

function renderEventSubjectOptions(selectedValue = App.Constants.eventSubjectEl.value) {
  const subSingular = App.State.state.settings.subjectsLabelSingular || "Asignatura";
  App.Constants.eventSubjectEl.innerHTML = "";

  const noneOption = document.createElement("option");
  noneOption.value = "";
  noneOption.textContent = App.I18n?.text(`Ninguno (sin ${subSingular.toLowerCase()})`, `None (without ${subSingular.toLowerCase()})`);
  App.Constants.eventSubjectEl.appendChild(noneOption);

  for (const subject of App.State.subjects) {
    const option = document.createElement("option");
    option.value = subject.name;
    option.textContent = subject.name;
    App.Constants.eventSubjectEl.appendChild(option);
  }

  const createOption = document.createElement("option");
  createOption.value = "__new_subject__";
  createOption.textContent = App.I18n?.text(`Crear nueva ${subSingular.toLowerCase()}`, `Create new ${subSingular.toLowerCase()}`);
  App.Constants.eventSubjectEl.appendChild(createOption);

  if (selectedValue !== undefined && Array.from(App.Constants.eventSubjectEl.options).some((option) => option.value === selectedValue)) {
    App.Constants.eventSubjectEl.value = selectedValue;
  } else {
    const isExam = App.Constants.eventTypeEl.value === "exam";
    if (isExam && App.State.subjects.length) {
      App.Constants.eventSubjectEl.value = App.State.subjects[0].name;
    } else {
      App.Constants.eventSubjectEl.value = "";
    }
  }
}

function toggleEventSubjectFields() {
  const isExam = App.Constants.eventTypeEl.value === "exam";
  const isCreatingSubject = App.Constants.eventSubjectEl.value === "__new_subject__";
  
  App.Constants.eventSubjectFieldsEl.hidden = false;
  App.Constants.eventSubjectEl.required = isExam;
  
  App.Constants.eventNewSubjectFieldsEl.hidden = !isCreatingSubject;
  App.Constants.eventNewSubjectNameEl.required = isCreatingSubject;
  App.Constants.eventNewSubjectDescriptionEl.required = isCreatingSubject;
  App.Constants.eventNewSubjectDifficultyEl.required = false;
}

function updateEventEntryFields() {
  toggleCustomCategoryFields();
  toggleEventSubjectFields();
}

function toggleCustomCategoryFields() {
  const isCreatingCategory = App.Constants.eventTypeEl.value === App.Constants.NEW_CATEGORY_VALUE;
  App.Constants.customCategoryFieldsEl.hidden = !isCreatingCategory;
  App.Constants.customCategoryNameEl.required = isCreatingCategory;
}

function getCustomEventCategories() {
  if (!App.State.state.customEventCategories || typeof App.State.state.customEventCategories !== "object") {
    App.State.state.customEventCategories = {};
  }

  return Object.entries(App.State.state.customEventCategories)
    .map(([type, category]) => ({
      type,
      label: typeof category.label === "string" ? category.label : "Otro",
      color: App.Utils.normalizeColor(category.color)
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));
}

function getEventCategory(type) {
  if (App.Constants.EVENT_CATEGORIES[type]) return App.Constants.EVENT_CATEGORIES[type];

  const custom = App.State.state.customEventCategories?.[type];
  if (custom) {
    return {
      label: custom.label || "Otro",
      className: "custom-note",
      color: App.Utils.normalizeColor(custom.color)
    };
  }

  return App.Constants.EVENT_CATEGORIES.personal;
}

function renderSubjectInputs() {
  App.Constants.subjectFormEl.innerHTML = "";
  if (!App.State.subjects.length) {
    const subPlural = App.Utils.escapeHtml(App.State.state.settings.subjectsLabelPlural || "Asignaturas");
    const subSingular = App.Utils.escapeHtml(App.State.state.settings.subjectsLabelSingular || "Asignatura");
    App.Constants.subjectFormEl.innerHTML = `
      <div class="empty-state" style="padding: 10px 0; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <span>Sin ${subPlural.toLowerCase()} configuradas.</span>
        <button type="button" id="emptyStateAddSubjectBtn" class="ghost-button" style="min-height: 28px; padding: 2px 12px; font-size: 0.78rem; border-radius: 6px;">+ Añadir ${subSingular.toLowerCase()}</button>
      </div>
    `;
    const emptyBtn = null;
    if (emptyBtn) emptyBtn.addEventListener("click", openSubjectEntry);
    return;
  }

  const day = App.DayPanel.ensureDay(App.State.selectedDate);
  let visibleSubjects = App.State.subjects;
  let isPeriodOff = false;

  if (App.State.academicPeriods.length > 0) {
    const activePeriod = App.State.academicPeriods.find(p => App.State.selectedDate >= p.startDate && App.State.selectedDate <= p.endDate);
    if (activePeriod) {
      visibleSubjects = App.State.subjects.filter(s => activePeriod.subjects.includes(s.name) || (day.subjects[s.name] > 0));
    } else {
      visibleSubjects = App.State.subjects.filter(s => day.subjects[s.name] > 0);
      if (visibleSubjects.length === 0) {
        isPeriodOff = true;
      }
    }
  }

  if (isPeriodOff) {
    App.Constants.subjectFormEl.innerHTML = `
      <div class="empty-state" style="padding: 8px 0; font-size: 0.86rem; color: var(--muted); text-align: center; display: flex; flex-direction: column; align-items: center; gap: 6px;">
        <span>Periodo no lectivo (vacaciones)</span>
        <button type="button" id="showAllSubjectsBtn" class="ghost-button" style="min-height: 28px; padding: 2px 10px; font-size: 0.76rem; width: 100%; border-radius: 6px;">Mostrar asignaturas</button>
      </div>
    `;
    const showAllBtn = null;
    if (showAllBtn) {
      showAllBtn.addEventListener("click", () => {
        renderSubjectInputsWithList(App.State.subjects);
      });
    }
    return;
  }

  renderSubjectInputsWithList(visibleSubjects);
}

function renderSubjectInputsWithList(list) {
  App.Constants.subjectFormEl.innerHTML = "";
  if (!list.length) {
    App.Constants.subjectFormEl.innerHTML = `<div class="empty-state">Sin asignaturas asignadas.</div>`;
    return;
  }

  for (const subject of list) {
    const row = document.createElement("label");
    row.className = "subject-row";
    row.innerHTML = `
      <span class="subject-name">
        <span class="color-dot" style="background:${App.Utils.escapeHtml(subject.color)}"></span>
        <span>${App.Utils.escapeHtml(subject.name)}</span>
      </span>
      <span class="time-entry-control">
        <input type="${App.Utils.getTimeInputType()}" ${App.Utils.getTimeInputAttributes()} placeholder="${App.Utils.getTimeInputPlaceholder()}" data-subject="${App.Utils.escapeHtml(subject.name)}" aria-label="Tiempo de ${App.Utils.escapeHtml(subject.name)}">
        <span class="time-entry-breakdown" aria-hidden="true"></span>
      </span>
    `;
    App.Constants.subjectFormEl.appendChild(row);
  }

  for (const input of App.Constants.subjectFormEl.querySelectorAll("input[data-subject]")) {
    const day = App.DayPanel.ensureDay(App.State.selectedDate);
    App.Utils.updateTimeInputDisplay(
      input,
      App.Utils.getTimeEntryParts(day, "subjectTimeEntries", input.dataset.subject)
    );
  }
}

function openEventEntry(target = null) {
  App.State.editingEventTarget = target ? { source: target.source, index: target.index } : null;
  const sourceEvent = target || { type: "personal", text: "", subjectName: "" };
  App.Constants.eventEntryTitleEl.textContent = target ? (App.I18n?.text("Editar evento", "Edit event")) : (App.I18n?.t("events.modalTitle") || "Añadir evento");
  App.Constants.eventSubmitBtn.textContent = target ? (App.I18n?.text("Guardar cambios", "Save changes")) : (App.I18n?.t("events.saveBtn") || "Guardar evento");
  renderEventTypeOptions(sourceEvent.type);
  renderEventSubjectOptions(sourceEvent.subjectName);
  App.Constants.eventTextEl.value = sourceEvent.text || "";
  App.Constants.eventColorEl.value = App.Utils.normalizeColor(
    sourceEvent.color || getEventCategory(sourceEvent.type).color || getDefaultEventColor(sourceEvent.type)
  );
  App.Constants.customCategoryNameEl.value = "";
  App.Constants.customCategoryColorEl.value = getEventCategory(sourceEvent.type).color || "#0f766e";
  App.Constants.eventNewSubjectNameEl.value = "";
  App.Constants.eventNewSubjectDescriptionEl.value = "";
  App.Constants.eventNewSubjectColorEl.value = "#0f766e";
  App.Constants.eventNewSubjectDifficultyEl.value = "";
  updateEventEntryFields();
  App.Constants.eventEntryModalEl.hidden = false;
  App.Constants.eventTextEl.focus();
}

function closeEventEntry() {
  App.State.editingEventTarget = null;
  App.Constants.eventEntryModalEl.hidden = true;
  App.Constants.eventFormEl.reset();
  App.Constants.eventColorEl.value = "#0f766e";
  App.Constants.customCategoryColorEl.value = "#0f766e";
  App.Constants.eventNewSubjectColorEl.value = "#0f766e";
  renderEventTypeOptions();
  renderEventSubjectOptions();
  updateEventEntryFields();
}

function addCustomEvent(event) {
  event.preventDefault();
  const text = App.Constants.eventTextEl.value.trim();
  if (!text) {
    App.Utils.showToast(App.I18n?.text("Escribe el evento antes de añadirlo.", "Enter the event before adding it."));
    return;
  }

  const type = resolveEventTypeForSubmit();
  if (!type) return;
  const subjectName = resolveEventSubjectForSubmit(type);
  if (type === "exam" && !subjectName) return;

  const day = App.DayPanel.ensureDay(App.State.selectedDate);
  const payload = {
    type,
    text,
    color: App.Utils.normalizeColor(App.Constants.eventColorEl.value || getDefaultEventColor(type)),
    ...(subjectName ? { subjectName } : {}),
    createdAt: new Date().toISOString()
  };

  const wasEditing = Boolean(App.State.editingEventTarget);
  if (App.State.editingEventTarget) {
    if (App.State.editingEventTarget.source === "custom") {
      day.customEvents[App.State.editingEventTarget.index] = {
        ...day.customEvents[App.State.editingEventTarget.index],
        ...payload,
        updatedAt: new Date().toISOString()
      };
    } else if (App.State.editingEventTarget.source === "static") {
      dismissStaticEventByIndex(App.State.editingEventTarget.index);
      day.customEvents.push({
        ...payload,
        createdAt: new Date().toISOString(),
        editedFromStatic: true
      });
    }
  } else {
    day.customEvents.push(payload);
  }

  const eventLabel = type === "exam" && subjectName ? `Examen: ${subjectName}` : `Evento "${text}"`;
  App.Main.recordLastUpdate({
    source: "calendar",
    target: eventLabel,
    type: "event"
  });

  closeEventEntry();
  App.Storage.saveState();
  App.Calendar.refreshDayCell(App.State.selectedDate);
  App.DayPanel.renderNotices();
  App.Stats.renderStats();
  App.Calendar.renderEventLegend();
  App.Storage.flashAutoSave();
  App.Utils.showToast(wasEditing ? App.I18n?.text("Evento actualizado.", "Event updated.") : App.I18n?.text("Evento añadido.", "Event added."));
}

function resolveEventTypeForSubmit() {
  if (App.Constants.eventTypeEl.value !== App.Constants.NEW_CATEGORY_VALUE) return App.Constants.eventTypeEl.value;

  const label = App.Constants.customCategoryNameEl.value.trim();
  if (!label) {
    App.Utils.showToast(App.I18n?.text("Escribe el nombre de la categoría.", "Enter the category name."));
    App.Constants.customCategoryNameEl.focus();
    return "";
  }

  const type = createCustomEventCategory(label, App.Constants.customCategoryColorEl.value);
  renderEventTypeOptions(type);
  return type;
}

function resolveEventSubjectForSubmit(type) {
  if (type !== "exam" && App.Constants.eventSubjectEl.value === "") return "";

  if (App.Constants.eventSubjectEl.value === "") {
    App.Utils.showToast(App.I18n?.text(
      `Para un examen, debes elegir una ${App.State.state.settings.subjectsLabelSingular.toLowerCase()}.`,
      `For an exam, choose a ${App.State.state.settings.subjectsLabelSingular.toLowerCase()}.`
    ));
    App.Constants.eventSubjectEl.focus();
    return "";
  }

  if (App.Constants.eventSubjectEl.value !== "__new_subject__") {
    return App.Constants.eventSubjectEl.value;
  }

  const name = App.Constants.eventNewSubjectNameEl.value.trim();
  const description = App.Constants.eventNewSubjectDescriptionEl ? App.Constants.eventNewSubjectDescriptionEl.value.trim() : "";
  if (!name) {
    App.Utils.showToast(App.I18n?.text(
      `Para crear una ${App.State.state.settings.subjectsLabelSingular.toLowerCase()}, escribe su nombre.`,
      `To create a ${App.State.state.settings.subjectsLabelSingular.toLowerCase()}, enter its name.`
    ));
    App.Constants.eventNewSubjectNameEl.focus();
    return "";
  }

  const existing = App.State.subjects.find((subject) => subject.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    renderEventSubjectOptions(existing.name);
    return existing.name;
  }

  App.State.state.settings.subjects.push({
    name,
    description,
    color: App.Utils.normalizeColor(App.Constants.eventNewSubjectColorEl.value),
    defaultDifficulty: clampDifficulty(App.Constants.eventNewSubjectDifficultyEl.value)
  });
  App.State.state.settings.subjectDifficulty[name] = clampDifficulty(App.Constants.eventNewSubjectDifficultyEl.value);
  App.State.syncConfigFromState();
  renderEventSubjectOptions(name);
  renderSubjectInputs();
  App.Settings.renderSettings();
  updateDynamicLabels();
  return name;
}

function createCustomEventCategory(label, color) {
  if (!App.State.state.customEventCategories || typeof App.State.state.customEventCategories !== "object") {
    App.State.state.customEventCategories = {};
  }

  const existing = Object.entries(App.State.state.customEventCategories).find(([, category]) => {
    return String(category.label || "").trim().toLowerCase() === label.toLowerCase();
  });

  if (existing) {
    const [type] = existing;
    App.State.state.customEventCategories[type].color = App.Utils.normalizeColor(color);
    return type;
  }

  const base = App.Utils.slugifyCategory(label) || "categoria";
  let type = `custom-${base}`;
  let counter = 2;
  while (App.State.state.customEventCategories[type]) {
    type = `custom-${base}-${counter}`;
    counter += 1;
  }

  App.State.state.customEventCategories[type] = {
    label,
    color: App.Utils.normalizeColor(color)
  };

  return type;
}

function removeCustomEvent(index) {
  const day = App.DayPanel.ensureDay(App.State.selectedDate);
  const removed = day.customEvents[index];
  day.customEvents.splice(index, 1);
  App.Main.recordLastUpdate({
    source: "calendar",
    target: removed ? `Evento "${removed.text || "eliminado"}"` : "Evento eliminado",
    type: "event"
  });
  App.Storage.saveState();
  App.Calendar.refreshDayCell(App.State.selectedDate);
  App.DayPanel.renderNotices();
  App.Calendar.renderEventLegend();
  App.Storage.flashAutoSave();
  App.Utils.showToast(App.I18n?.text("Evento eliminado.", "Event deleted."));
}

function removeStaticEvent(index) {
  dismissStaticEventByIndex(index);
  App.Storage.saveState();
  App.Calendar.refreshDayCell(App.State.selectedDate);
  App.DayPanel.renderNotices();
  App.Calendar.renderEventLegend();
  App.Storage.flashAutoSave();
  App.Utils.showToast(App.I18n?.text("Evento eliminado.", "Event deleted."));
}

function dismissStaticEventByIndex(index) {
  const staticEvents = App.State.events[App.State.selectedDate] || [];
  const event = staticEvents[index];
  if (!event) return;

  if (!App.State.state.dismissedEvents || typeof App.State.state.dismissedEvents !== "object") {
    App.State.state.dismissedEvents = {};
  }

  const dismissedForDay = Array.isArray(App.State.state.dismissedEvents[App.State.selectedDate])
    ? App.State.state.dismissedEvents[App.State.selectedDate]
    : [];
  const eventId = App.Calendar.getStaticEventId(event, index);

  if (!dismissedForDay.includes(eventId)) {
    dismissedForDay.push(eventId);
  }

  App.State.state.dismissedEvents[App.State.selectedDate] = dismissedForDay;
}

function getDayEvents(key) {
  return [...App.Calendar.getVisibleStaticEvents(key).map(({ event }) => event), ...(App.State.state.days[key]?.customEvents || [])];
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
    const color = event.color || category.color || getDefaultEventColor(event.type);
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
  return map[type] || App.State.state.settings.profile.accentColor;
}

function getPrimaryEventType(dayEvents) {
  if (!dayEvents.length) return "";
  return App.Constants.EVENT_PRIORITY.find((type) => dayEvents.some((event) => event.type === type)) || dayEvents[0].type;
}

function eventMatchesSubject(text, subjectName) {
  if (!text || !subjectName) return false;
  return App.Utils.normalizeSearchText(text).includes(App.Utils.normalizeSearchText(subjectName));
}

function openSubjectEntry() {
  App.State.editingSubjectTarget = null;
  if (App.Constants.subjectSettingsFormEl) App.Constants.subjectSettingsFormEl.reset();
  if (App.Constants.newSubjectColorEl) App.Constants.newSubjectColorEl.value = "#0f766e";
  
  const subSingular = App.State.state.settings.subjectsLabelSingular || "Asignatura";
  const titleEl = App.Constants.subjectEntryTitleEl || document.getElementById("subjectEntryTitle");
  if (titleEl) titleEl.textContent = `Añadir ${subSingular.toLowerCase()}`;
  const submitBtn = App.Constants.subjectSettingsFormEl ? App.Constants.subjectSettingsFormEl.querySelector('button[type="submit"]') : null;
  if (submitBtn) submitBtn.textContent = `Añadir ${subSingular.toLowerCase()}`;
  
  if (App.Constants.subjectEntryModalEl) App.Constants.subjectEntryModalEl.hidden = false;
  if (App.Constants.newSubjectNameEl) App.Constants.newSubjectNameEl.focus();
}

function closeSubjectEntry() {
  App.State.editingSubjectTarget = null;
  if (App.Constants.subjectEntryModalEl) App.Constants.subjectEntryModalEl.hidden = true;
}

function addSubjectFromSettings(event) {
  event.preventDefault();
  const name = App.Constants.newSubjectNameEl.value.trim();
  const description = App.Constants.newSubjectDescriptionEl ? App.Constants.newSubjectDescriptionEl.value.trim() : "";
  if (!name) return;

  const subSingular = App.State.state.settings.subjectsLabelSingular || "Asignatura";

  if (App.State.editingSubjectTarget) {
    if (name.toLowerCase() !== App.State.editingSubjectTarget.toLowerCase() && App.State.subjects.some((subject) => subject.name.toLowerCase() === name.toLowerCase())) {
      App.Utils.showToast(`Esa ${subSingular.toLowerCase()} ya existe.`);
      return;
    }

    const idx = App.State.state.settings.subjects.findIndex(s => s.name === App.State.editingSubjectTarget);
    if (idx >= 0) {
      App.State.state.settings.subjects[idx] = {
        name,
        description,
        color: App.Utils.normalizeColor(App.Constants.newSubjectColorEl.value),
        defaultDifficulty: clampDifficulty(App.Constants.newSubjectDifficultyEl.value)
      };
    }

    if (name !== App.State.editingSubjectTarget) {
      App.State.state.settings.subjectDifficulty[name] = clampDifficulty(App.Constants.newSubjectDifficultyEl.value);
      delete App.State.state.settings.subjectDifficulty[App.State.editingSubjectTarget];

      for (const day of Object.values(App.State.state.days)) {
        if (day.subjects && day.subjects[App.State.editingSubjectTarget] !== undefined) {
          day.subjects[name] = day.subjects[App.State.editingSubjectTarget];
          delete day.subjects[App.State.editingSubjectTarget];
        }
        if (day.subjectTimeEntries && day.subjectTimeEntries[App.State.editingSubjectTarget] !== undefined) {
          day.subjectTimeEntries[name] = day.subjectTimeEntries[App.State.editingSubjectTarget];
          delete day.subjectTimeEntries[App.State.editingSubjectTarget];
        }
        if (day.customEvents) {
          for (const ev of day.customEvents) {
            if (ev.subjectName === App.State.editingSubjectTarget) {
              ev.subjectName = name;
            }
          }
        }
      }
      if (App.State.state?.checklistTasks) {
        for (const task of App.State.state.checklistTasks) {
          if (task.linkType === "subject" && task.linkKey === App.State.editingSubjectTarget) {
            task.linkKey = name;
          }
        }
      }
    } else {
      App.State.state.settings.subjectDifficulty[name] = clampDifficulty(App.Constants.newSubjectDifficultyEl.value);
    }

    App.State.editingSubjectTarget = null;
    closeSubjectEntry();
    App.Settings.refreshAfterConfigChange(`${subSingular} actualizada.`);
    return;
  }

  if (App.State.subjects.some((subject) => subject.name.toLowerCase() === name.toLowerCase())) {
    App.Utils.showToast(`Esa ${subSingular.toLowerCase()} ya existe.`);
    return;
  }

  App.State.state.settings.subjects.push({
    name,
    description,
    color: App.Utils.normalizeColor(App.Constants.newSubjectColorEl.value),
    defaultDifficulty: clampDifficulty(App.Constants.newSubjectDifficultyEl.value)
  });
  App.State.state.settings.subjectDifficulty[name] = clampDifficulty(App.Constants.newSubjectDifficultyEl.value);
  App.Constants.subjectSettingsFormEl.reset();
  App.Constants.newSubjectColorEl.value = "#0f766e";
  App.Constants.newSubjectDifficultyEl.value = "";
  closeSubjectEntry();
  App.Settings.refreshAfterConfigChange(`${subSingular} añadida.`);
}

function handleSubjectSettingsClick(event) {
  const editBtn = event.target.closest("[data-edit-subject]");
  if (editBtn) {
    const oldName = editBtn.dataset.editSubject;
    const subject = App.State.subjects.find(s => s.name === oldName);
    if (!subject) return;

    App.State.editingSubjectTarget = oldName;
    App.Constants.newSubjectNameEl.value = subject.name;
    App.Constants.newSubjectDescriptionEl.value = subject.description || "";
    App.Constants.newSubjectColorEl.value = subject.color || "#0f766e";
    App.Constants.newSubjectDifficultyEl.value = getSubjectDifficulty(subject.name);

    const subSingular = App.State.state.settings.subjectsLabelSingular || "Asignatura";
    App.Constants.subjectEntryTitleEl.textContent = App.I18n?.text(`Editar ${subSingular.toLowerCase()}`, `Edit ${subSingular.toLowerCase()}`);
    App.Constants.subjectSettingsFormEl.querySelector('button[type="submit"]').textContent = App.I18n?.text("Guardar cambios", "Save changes");

    App.Constants.subjectEntryModalEl.hidden = false;
    App.Constants.newSubjectNameEl.focus();
    return;
  }

  const deleteBtn = event.target.closest("[data-delete-subject]");
  if (!deleteBtn) return;
  const name = deleteBtn.dataset.deleteSubject;
  
  const subSingular = App.State.state.settings.subjectsLabelSingular || "Asignatura";
  const ok = confirm(App.I18n?.text(
    `¿Estás seguro de que quieres eliminar toda la info de "${name}"? El paso no será reversible.`,
    `Are you sure you want to delete all information for "${name}"? This cannot be undone.`
  ));
  if (!ok) return;
  App.State.state.settings.subjects = App.State.state.settings.subjects.filter((subject) => subject.name !== name);
  delete App.State.state.settings.subjectDifficulty[name];
  for (const day of Object.values(App.State.state.days)) {
    if (day.subjects) delete day.subjects[name];
    if (day.subjectTimeEntries) delete day.subjectTimeEntries[name];
  }
  if (App.State.state?.checklistTasks) {
    App.State.state.checklistTasks = App.State.state.checklistTasks.map(task => {
      if (task.linkType === "subject" && task.linkKey === name) {
        return { ...task, linkType: "", linkKey: "" };
      }
      return task;
    });
  }
  App.Settings.refreshAfterConfigChange(App.I18n?.text(`${subSingular} eliminada.`, `${subSingular} deleted.`));
}

function getGroupedSubjectsAndTracks() {
  const groups = [];
  
  for (const period of App.State.academicPeriods) {
    const periodSubjects = App.State.subjects.filter(s => period.subjects.includes(s.name));
    if (periodSubjects.length > 0) {
      groups.push({
        label: period.name,
        type: "subject",
        items: periodSubjects
      });
    }
  }
  
  const assignedSubjectNames = new Set(App.State.academicPeriods.flatMap(p => p.subjects));
  const unassignedSubjects = App.State.subjects.filter(s => !assignedSubjectNames.has(s.name));
  if (unassignedSubjects.length > 0) {
    const subPlural = App.State.state.settings.subjectsLabelPlural || "Asignaturas";
    groups.push({
      label: App.State.academicPeriods.length > 0 ? `${subPlural} (sin curso)` : subPlural,
      type: "subject",
      items: unassignedSubjects
    });
  }
  
  if (App.State.EXTRA_TRACKS.length > 0) {
    groups.push({
      label: App.State.state.settings.hobbiesLabelPlural || "Hobbies",
      type: "track",
      items: App.State.EXTRA_TRACKS
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
  if (!App.Constants.taskLinkEl) return;
  App.Constants.taskLinkEl.innerHTML = '<option value="">Ninguno (sin vincular)</option>';
  
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
    App.Constants.taskLinkEl.appendChild(optGroup);
  }
  
  App.Constants.taskLinkEl.value = selectedValue;
}

function openTaskEntry(targetTask = null, defaultDate = "") {
  if (targetTask) {
    App.State.editingTaskTarget = targetTask.id;
    App.Constants.taskEntryTitleEl.textContent = App.I18n?.text("Editar tarea", "Edit task");
    App.Constants.taskSubmitBtn.textContent = App.I18n?.text("Guardar cambios", "Save changes");
    App.Constants.taskTextEl.value = targetTask.text;
    if (App.Constants.taskDescriptionEl) {
      App.Constants.taskDescriptionEl.value = targetTask.description || "";
    }
    renderTaskLinkOptions(targetTask.linkType ? `${targetTask.linkType}:${targetTask.linkKey}` : "");
    App.Constants.taskDueDateEl.value = targetTask.dueDate || "";
    App.Constants.taskDifficultyEl.value = targetTask.difficulty || 3;
  } else {
    App.State.editingTaskTarget = null;
    App.Constants.taskEntryTitleEl.textContent = App.I18n?.t("tasks.addTask") || "Añadir tarea";
    App.Constants.taskSubmitBtn.textContent = App.I18n?.t("tasks.addTaskBtn") || "Añadir tarea";
    App.Constants.taskTextEl.value = "";
    if (App.Constants.taskDescriptionEl) {
      App.Constants.taskDescriptionEl.value = "";
    }
    renderTaskLinkOptions("");
    App.Constants.taskDueDateEl.value = defaultDate || "";
    App.Constants.taskDifficultyEl.value = 3;
  }
  App.Constants.taskEntryModalEl.hidden = false;
  App.Constants.taskTextEl.focus();
}

function closeTaskEntry() {
  App.State.editingTaskTarget = null;
  App.Constants.taskEntryModalEl.hidden = true;
  App.Constants.taskFormEl.reset();
  if (App.Constants.taskDescriptionEl) {
    App.Constants.taskDescriptionEl.value = "";
  }
}

function saveTask(event) {
  event.preventDefault();
  const text = App.Constants.taskTextEl.value.trim();
  if (!text) {
    App.Utils.showToast(App.I18n?.text("Escribe la tarea antes de guardarla.", "Enter the task before saving it."));
    return;
  }
  const description = App.Constants.taskDescriptionEl ? App.Constants.taskDescriptionEl.value.trim() : "";
  
  let linkType = "";
  let linkKey = "";
  if (App.Constants.taskLinkEl && App.Constants.taskLinkEl.value) {
    const parts = String(App.Constants.taskLinkEl.value).split(":");
    linkType = parts[0] || "";
    linkKey = parts.slice(1).join(":");
  }
  
  const dueDate = App.Constants.taskDueDateEl.value || "";
  const difficulty = clampDifficulty(App.Constants.taskDifficultyEl.value);
  
  if (!App.State.state) return;
  if (!App.State.state.checklistTasks) App.State.state.checklistTasks = [];
  
  if (App.State.editingTaskTarget) {
    const taskIdx = App.State.state.checklistTasks.findIndex(t => t.id === App.State.editingTaskTarget);
    if (taskIdx >= 0) {
      App.State.state.checklistTasks[taskIdx] = {
        ...App.State.state.checklistTasks[taskIdx],
        text,
        description,
        linkType,
        linkKey,
        dueDate,
        difficulty
      };
    }
    App.Utils.showToast(App.I18n?.text("Tarea actualizada.", "Task updated."));
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
    App.State.state.checklistTasks.push(newTask);
    App.Utils.showToast(App.I18n?.text("Tarea añadida.", "Task added."));
  }
  
  App.Main.recordLastUpdate({
    source: "tasks",
    target: text,
    type: "task"
  });

  closeTaskEntry();
  App.Storage.saveState();
  refreshChecklistAll();
  
  if (dueDate) {
    App.Calendar.refreshDayCell(dueDate);
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
  App.Calendar.renderCalendar();
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
    const task = App.State.state?.checklistTasks?.find(t => t.id === taskId);
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
    const task = App.State.state?.checklistTasks?.find(t => t.id === taskId);
    if (task) {
      openTaskDetailsModal(task);
    }
  }
}

function toggleTaskCompletion(taskId) {
  const task = App.State.state?.checklistTasks?.find(t => t.id === taskId);
  if (!task) return;
  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date().toISOString() : "";

  if (task.completed && App.Sound && typeof App.Sound.playSuccess === "function") {
    App.Sound.playSuccess();
  } else if (!task.completed && App.Sound && typeof App.Sound.playClick === "function") {
    App.Sound.playClick();
  }

  App.Main.recordLastUpdate({
    source: "tasks",
    target: task.text || task.title || "Tarea",
    type: "task"
  });
  App.Storage.saveState();
  refreshChecklistAll();
  if (task.dueDate) {
    App.Calendar.refreshDayCell(task.dueDate);
  }
}

function deleteTask(taskId) {
  const task = App.State.state?.checklistTasks?.find(t => t.id === taskId);
  if (!task) return;
  const ok = confirm(App.I18n?.text(
    `¿Estás seguro de que deseas eliminar la tarea "${task.text}"?`,
    `Are you sure you want to delete the task "${task.text}"?`
  ));
  if (!ok) return;
  if (App.State.state?.checklistTasks) {
    App.State.state.checklistTasks = App.State.state.checklistTasks.filter(t => t.id !== taskId);
  }
  App.Storage.saveState();
  refreshChecklistAll();
  if (task.dueDate) {
    App.Calendar.refreshDayCell(task.dueDate);
  }
  App.Utils.showToast(App.I18n?.text("Tarea eliminada.", "Task deleted."));
}

function renderChecklist() {
  if (!checklistListEl) return;
  checklistListEl.innerHTML = "";
  
  const query = (taskSearchInputEl.value || "").trim().toLowerCase();
  const filterProj = filterSubjectEl.value || "all";
  const filterStat = filterStatusEl.value || "all";
  const sortBy = filterSortEl.value || "dueDate";
  
  let list = App.State.state?.checklistTasks || [];
  
  if (App.State.selectedPreviewDateFilter) {
    list = list.filter(t => t.dueDate === App.State.selectedPreviewDateFilter);
    if (App.Constants.dayFilterIndicator) {
      App.Constants.dayFilterIndicator.style.display = "inline-flex";
    }
  } else {
    if (App.Constants.dayFilterIndicator) {
      App.Constants.dayFilterIndicator.style.display = "none";
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
  
  const todayKey = App.Utils.getTodayDateKey();
  
  for (const task of list) {
    const item = document.createElement("div");
    item.className = `task-card ${task.completed ? "completed" : ""}`;
    item.dataset.taskId = task.id;
    
    let taskColor = "var(--line)";
    let linkLabel = "";
    if (task.linkType === "subject") {
      const subject = App.State.subjects.find(s => s.name === task.linkKey);
      taskColor = subject ? subject.color : "var(--accent)";
      linkLabel = task.linkKey;
    } else if (task.linkType === "track") {
      const track = App.State.EXTRA_TRACKS.find(t => t.key === task.linkKey);
      taskColor = track ? track.color : "#d97706";
      linkLabel = track ? track.label : task.linkKey;
    }
    
    item.style.borderLeftColor = taskColor;
    
    let dateHtml = "";
    if (task.dueDate) {
      const isOverdue = !task.completed && task.dueDate < todayKey;
      const dateLabel = App.Utils.formatShortDate(task.dueDate);
      dateHtml = `<span class="task-date-tag ${isOverdue ? "overdue" : ""}">📅 ${dateLabel}${isOverdue ? " (atrasada)" : ""}</span>`;
    }
    
    const tagHtml = linkLabel ? `<span class="task-tag" style="background:${App.Utils.hexToSoftBackground(taskColor)}; color:${App.Utils.readableColor(taskColor)};">${App.Utils.escapeHtml(linkLabel)}</span>` : "";
    const starsHtml = `<span class="task-difficulty-stars">${"★".repeat(task.difficulty)}${"☆".repeat(5 - task.difficulty)}</span>`;
    
    item.innerHTML = `
      <label class="task-checkbox-wrapper">
        <input type="checkbox" class="task-checkbox-input" data-task-id="${App.Utils.escapeHtml(task.id)}" ${task.completed ? "checked" : ""}>
        <span class="task-checkbox-custom"></span>
      </label>
      <div class="task-content-col">
        <span class="task-text">${App.Utils.escapeHtml(task.text)}</span>
        <div class="task-meta-row">
          ${tagHtml}
          ${dateHtml}
          ${starsHtml}
        </div>
      </div>
      <div class="notice-actions">
        <button type="button" class="notice-action" data-edit-task-id="${App.Utils.escapeHtml(task.id)}" title="Editar" style="color: var(--accent); border-color: rgba(var(--accent-rgb), 0.25);">✎</button>
        <button type="button" class="notice-action" data-delete-task-id="${App.Utils.escapeHtml(task.id)}" title="Eliminar" style="color: #dc2626; border-color: rgba(220, 38, 38, 0.25);">🗑</button>
      </div>
    `;
    checklistListEl.appendChild(item);
  }
}

function renderChecklistStats() {
  if (!totalTasksCountEl) return;
  const list = App.State.state?.checklistTasks || [];
  const total = list.length;
  const completed = list.filter(t => t.completed).length;
  const pending = total - completed;
  
  const todayKey = App.Utils.getTodayDateKey();
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
  const avgPendingDifficultyEl = null;
  if (avgPendingDifficultyEl) {
    avgPendingDifficultyEl.textContent = avgDiffVal !== "—" ? `${avgDiffVal} ★` : "—";
  }
  
  // 2. Próximos 7 días
  const todayVal = new Date(todayKey);
  const nextWeekVal = new Date(todayVal.getTime() + 7 * 86400000);
  const nextWeekKey = App.Utils.toDateKey(nextWeekVal);
  const dueSoonTasks = list.filter(t => !t.completed && t.dueDate && t.dueDate >= todayKey && t.dueDate <= nextWeekKey).length;
  const dueSoonTasksCountEl = null;
  if (dueSoonTasksCountEl) {
    dueSoonTasksCountEl.textContent = dueSoonTasks;
  }
  
  // 3. Racha de completado (días consecutivos completando tareas)
  const completedDates = list
    .filter(t => t && t.completed && typeof t.completedAt === "string" && t.completedAt.trim().length > 0)
    .map(t => t.completedAt.split('T')[0]);
  const uniqueDates = Array.from(new Set(completedDates)).sort();
  let streak = 0;
  if (uniqueDates.length > 0) {
    const yesterday = new Date(todayVal.getTime() - 86400000);
    const yesterdayStr = App.Utils.toDateKey(yesterday);
    if (uniqueDates.includes(todayKey) || uniqueDates.includes(yesterdayStr)) {
      let tempDate = uniqueDates.includes(todayKey) ? new Date(todayVal) : yesterday;
      while (true) {
        const tempStr = App.Utils.toDateKey(tempDate);
        if (uniqueDates.includes(tempStr)) {
          streak++;
          tempDate.setDate(tempDate.getDate() - 1);
        } else {
          break;
        }
      }
    }
  }
  const taskCompletionStreakEl = null;
  if (taskCompletionStreakEl) {
    taskCompletionStreakEl.textContent = streak === 1 ? "1 día" : `${streak} días`;
  }
  
  // 4. Proyecto o hobby más exigente (más tareas pendientes)
  const pendingGroups = {};
  for (const task of list) {
    if (task && !task.completed && task.linkType) {
      const gkey = `${task.linkType}:${task.linkKey || ""}`;
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
  if (mostDemandingKey && typeof mostDemandingKey === "string") {
    const parts = mostDemandingKey.split(":");
    const linkType = parts[0] || "";
    const linkKey = parts.slice(1).join(":");
    if (linkType === "subject") {
      const subject = App.State.subjects.find(s => s.name === linkKey);
      mostDemandingLabel = subject ? subject.name : linkKey;
    } else if (linkType === "track") {
      const track = App.State.EXTRA_TRACKS.find(t => t.key === linkKey);
      mostDemandingLabel = track ? track.label : linkKey;
    }
    mostDemandingLabel += ` (${maxPending})`;
  }
  const mostDemandingSubjectEl = null;
  if (mostDemandingSubjectEl) {
    mostDemandingSubjectEl.textContent = mostDemandingLabel;
  }
  
  if (taskStatsChartEl) {
    taskStatsChartEl.innerHTML = "";
  }
  
  const taskGroups = {};
  for (const s of App.State.subjects) {
    taskGroups[`subject:${s.name}`] = { label: s.name, color: s.color, total: 0, completed: 0 };
  }
  for (const t of App.State.EXTRA_TRACKS) {
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
        <span style="font-weight:700;">${App.Utils.escapeHtml(group.label)}</span>
        <small>${group.completed}/${group.total}</small>
      </span>
      <span class="bar-track">
        <span class="bar-fill" style="background:${App.Utils.escapeHtml(group.color)}; width:${ratio}%"></span>
      </span>
      <span class="bar-value">${Math.round(ratio)}%</span>
    `;
    taskStatsChartEl.appendChild(row);
  }
}

function renderDayTasks() {
  if (!dayTasksListEl) return;
  dayTasksListEl.innerHTML = "";
  
  const list = (App.State.state?.checklistTasks || []).filter(t => t.dueDate === App.State.selectedDate);
  
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
      const subject = App.State.subjects.find(s => s.name === task.linkKey);
      taskColor = subject ? subject.color : "var(--accent)";
    } else if (task.linkType === "track") {
      const track = App.State.EXTRA_TRACKS.find(t => t.key === task.linkKey);
      taskColor = track ? track.color : "#d97706";
    }
    item.style.borderLeftColor = taskColor;
    
    item.innerHTML = `
      <label class="task-checkbox-wrapper" style="margin-right: 4px;">
        <input type="checkbox" class="task-checkbox-input" data-task-id="${App.Utils.escapeHtml(task.id)}" ${task.completed ? "checked" : ""}>
        <span class="task-checkbox-custom" style="width:16px; height:16px; border-radius:4px;"></span>
      </label>
      <span class="day-task-text" style="font-size:0.82rem;">${App.Utils.escapeHtml(task.text)}</span>
      <div class="notice-actions">
        <button type="button" class="notice-action" data-edit-task-id="${App.Utils.escapeHtml(task.id)}" title="Editar">✎</button>
        <button type="button" class="notice-action" data-delete-task-id="${App.Utils.escapeHtml(task.id)}" title="Eliminar" style="color: #dc2626; border-color: rgba(220, 38, 38, 0.25);">🗑</button>
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
    const task = App.State.state?.checklistTasks?.find(t => t.id === taskId);
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
    const task = App.State.state?.checklistTasks?.find(t => t.id === taskId);
    if (task) {
      openTaskDetailsModal(task);
    }
  }
}

function openTaskDetailsModal(task) {
  currentViewingTaskId = task.id;
  const noDesc = App.I18n?.getCurrentLanguage() === "en" ? "No description." : "Sin descripción.";
  const unlinked = App.I18n?.t("tasks.linkNone") || "Sin vincular";
  const noDueDate = App.I18n?.t("tasks.noDate") || "Sin fecha";
  const overdueSuffix = App.I18n?.getCurrentLanguage() === "en" ? " (overdue)" : " (atrasada)";
  const statusDone = App.I18n?.t("tasks.statusDone") || "Completada";
  const statusPending = App.I18n?.t("tasks.statusPending") || "Pendiente";

  if (App.Constants.taskDetailsTitleEl) App.Constants.taskDetailsTitleEl.textContent = task.text;
  if (App.Constants.taskDetailsDescEl) App.Constants.taskDetailsDescEl.textContent = task.description || noDesc;
  
  let linkLabel = unlinked;
  let taskColor = "var(--line)";
  if (task.linkType === "subject") {
    const subject = App.State.subjects.find(s => s.name === task.linkKey);
    taskColor = subject ? subject.color : "var(--accent)";
    linkLabel = task.linkKey;
  } else if (task.linkType === "track") {
    const track = App.State.EXTRA_TRACKS.find(t => t.key === task.linkKey);
    taskColor = track ? track.color : "#d97706";
    linkLabel = track ? track.label : task.linkKey;
  }
  if (App.Constants.taskDetailsLinkEl) {
    App.Constants.taskDetailsLinkEl.innerHTML = linkLabel !== unlinked
      ? `<span class="task-tag" style="background:${App.Utils.hexToSoftBackground(taskColor)}; color:${App.Utils.readableColor(taskColor)};">${App.Utils.escapeHtml(linkLabel)}</span>`
      : `<span style="color: var(--muted); font-style: italic;">${App.Utils.escapeHtml(unlinked)}</span>`;
  }
  
  if (App.Constants.taskDetailsDifficultyEl) {
    App.Constants.taskDetailsDifficultyEl.innerHTML = "★".repeat(task.difficulty) + "☆".repeat(5 - task.difficulty);
  }
  
  if (App.Constants.taskDetailsDueDateEl) {
    if (task.dueDate) {
      const todayKey = App.Utils.getTodayDateKey();
      const isOverdue = !task.completed && task.dueDate < todayKey;
      const dateLabel = App.Utils.formatDateLong(task.dueDate);
      App.Constants.taskDetailsDueDateEl.innerHTML = isOverdue
        ? `<span style="color: ${App.Utils.isDarkMode() ? '#f87171' : '#dc2626'}; font-weight: bold;">📅 ${dateLabel}${overdueSuffix}</span>`
        : `<span>📅 ${dateLabel}</span>`;
    } else {
      App.Constants.taskDetailsDueDateEl.innerHTML = `<span style="color: var(--muted); font-style: italic;">${App.Utils.escapeHtml(noDueDate)}</span>`;
    }
  }
  
  if (App.Constants.taskDetailsCheckboxEl) App.Constants.taskDetailsCheckboxEl.checked = task.completed;
  if (App.Constants.taskDetailsStatusTextEl) {
    App.Constants.taskDetailsStatusTextEl.textContent = task.completed ? statusDone : statusPending;
    App.Constants.taskDetailsStatusTextEl.style.color = task.completed ? (App.Utils.isDarkMode() ? "#4ade80" : "#16a34a") : "var(--muted)";
  }
  
  if (App.Constants.taskDetailsModalEl) App.Constants.taskDetailsModalEl.hidden = false;
}

function closeTaskDetailsModal() {
  currentViewingTaskId = null;
  if (App.Constants.taskDetailsModalEl) App.Constants.taskDetailsModalEl.hidden = true;
}

// --- Nuevos Controladores y Renderizadores de Checklist Layout ---

function saveChecklistInPageTask(event) {
  event.preventDefault();
  const text = App.Constants.checklistTaskTextEl.value.trim();
  if (!text) {
    App.Utils.showToast(App.I18n?.text("Escribe la tarea antes de guardarla.", "Enter the task before saving it."));
    return;
  }
  const description = App.Constants.checklistTaskDescriptionEl ? App.Constants.checklistTaskDescriptionEl.value.trim() : "";
  
  let linkType = "";
  let linkKey = "";
  if (App.Constants.checklistTaskLinkEl && App.Constants.checklistTaskLinkEl.value) {
    const parts = String(App.Constants.checklistTaskLinkEl.value).split(":");
    linkType = parts[0] || "";
    linkKey = parts.slice(1).join(":");
  }
  
  const dueDate = App.Constants.checklistTaskDueDateEl.value || "";
  const difficulty = clampDifficulty(App.Constants.checklistTaskDifficultyEl.value);
  
  if (!App.State.state) return;
  if (!App.State.state.checklistTasks) App.State.state.checklistTasks = [];
  
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
  App.State.state.checklistTasks.push(newTask);
  App.Utils.showToast(App.I18n?.text("Tarea añadida.", "Task added."));
  
  App.Main.recordLastUpdate({
    source: "tasks",
    target: text,
    type: "task"
  });

  App.Constants.checklistAddFormEl.reset();
  if (App.Constants.checklistTaskDescriptionEl) App.Constants.checklistTaskDescriptionEl.value = "";
  App.Constants.checklistTaskDueDateEl.value = App.State.selectedDate;
  App.Constants.checklistTaskDifficultyEl.value = 3;
  
  App.Storage.saveState();
  refreshChecklistAll();
  
  if (dueDate) {
    App.Calendar.refreshDayCell(dueDate);
  }
}

function renderChecklistInlineLinkOptions() {
  if (!App.Constants.checklistTaskLinkEl) return;
  App.Constants.checklistTaskLinkEl.innerHTML = '<option value="">Ninguno (sin vincular)</option>';
  
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
    App.Constants.checklistTaskLinkEl.appendChild(optGroup);
  }
}

function renderChecklistSelectedDay() {
  if (!App.Constants.checklistSelectedWeekdayEl || !App.Constants.checklistSelectedDateEl) return;
  App.Constants.checklistSelectedWeekdayEl.textContent = App.Utils.formatWeekday(App.State.selectedDate);
  App.Constants.checklistSelectedDateEl.textContent = App.Utils.formatDateLong(App.State.selectedDate);
  
  if (App.Constants.checklistTaskDueDateEl) {
    App.Constants.checklistTaskDueDateEl.value = App.State.selectedDate;
  }
  
  renderChecklistDayTasks();
}

function renderChecklistDayTasks() {
  if (!App.Constants.checklistDayTasksListEl) return;
  App.Constants.checklistDayTasksListEl.innerHTML = "";
  
  const list = (App.State.state?.checklistTasks || []).filter(t => t.dueDate === App.State.selectedDate);
  
  if (list.length === 0) {
    App.Constants.checklistDayTasksListEl.innerHTML = `<div class="empty-state" style="padding: 12px 14px; font-size:0.86rem; text-align: center; color: var(--muted);">No hay tareas programadas para este día.</div>`;
    return;
  }
  
  for (const task of list) {
    const item = document.createElement("div");
    item.className = `day-task-item ${task.completed ? "completed" : ""}`;
    item.style.padding = "10px 12px";
    item.dataset.taskId = task.id;
    
    let taskColor = "var(--line)";
    if (task.linkType === "subject") {
      const subject = App.State.subjects.find(s => s.name === task.linkKey);
      taskColor = subject ? subject.color : "var(--accent)";
    } else if (task.linkType === "track") {
      const track = App.State.EXTRA_TRACKS.find(t => t.key === task.linkKey);
      taskColor = track ? track.color : "#d97706";
    }
    item.style.borderLeftColor = taskColor;
    item.style.borderLeftWidth = "4px";
    
    item.innerHTML = `
      <label class="task-checkbox-wrapper" style="margin-right: 4px;">
        <input type="checkbox" class="task-checkbox-input" data-task-id="${App.Utils.escapeHtml(task.id)}" ${task.completed ? "checked" : ""}>
        <span class="task-checkbox-custom" style="width:16px; height:16px; border-radius:4px;"></span>
      </label>
      <span class="day-task-text" style="font-size:0.86rem;">${App.Utils.escapeHtml(task.text)}</span>
      <div class="notice-actions">
        <button type="button" class="notice-action" data-edit-task-id="${App.Utils.escapeHtml(task.id)}" title="Editar">✎</button>
        <button type="button" class="notice-action" data-delete-task-id="${App.Utils.escapeHtml(task.id)}" title="Eliminar" style="color: #dc2626; border-color: rgba(220, 38, 38, 0.25);">🗑</button>
      </div>
    `;
    App.Constants.checklistDayTasksListEl.appendChild(item);
  }
}


// --- Renderizador de la Vista Previa del Calendario (Checklist) ---

function renderChecklistCalendarPreview() {
  if (!calendarPreviewGrid) return;
  calendarPreviewGrid.innerHTML = "";
  
  const year = App.State.previewVisibleMonth.getFullYear();
  const month = App.State.previewVisibleMonth.getMonth();
  
  // Actualizar título del mes
  const monthTitleEl = document.querySelector(".calendar-preview-month-title");
  if (monthTitleEl) {
    monthTitleEl.textContent = `${App.Utils.getMonthLabel(App.State.previewVisibleMonth)} ${year}`;
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
  const todayKey = App.Utils.getTodayDateKey();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(year, month, day);
    const key = App.Utils.toDateKey(cellDate);
    
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "day-cell preview-day-cell";
    
    // Asignar clase de fin de semana
    if ([0, 6].includes(cellDate.getDay())) {
      cell.classList.add("weekend");
    }
    
    // Resaltar según filtro de vista previa y día actual
    if (key === App.State.selectedPreviewDateFilter) {
      cell.classList.add("selected");
    } else if (key === App.Utils.getTodayDateKey()) {
      cell.classList.add("today");
    }
    
    // Número del día
    const numSpan = document.createElement("span");
    numSpan.textContent = day;
    numSpan.style.fontWeight = "bold";
    cell.appendChild(numSpan);
    
    // Comprobar si hay tareas pendientes o completadas para este día
    const dayTasks = (App.State.state?.checklistTasks || []).filter(t => t.dueDate === key);
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
      if (App.State.selectedPreviewDateFilter === key) {
        App.State.selectedPreviewDateFilter = null;
      } else {
        App.State.selectedPreviewDateFilter = key;
        App.State.selectedDate = key;
        App.DayPanel.renderSelectedDay();
      }
      renderChecklistCalendarPreview();
      renderChecklist();
    });
    
    calendarPreviewGrid.appendChild(cell);
  }
}

  Object.defineProperties(window.App.Tasks, {
    renameSubjectsPrompt: { get: () => renameSubjectsPrompt, set: (v) => renameSubjectsPrompt = v, enumerable: true },
    renameTracksPrompt: { get: () => renameTracksPrompt, set: (v) => renameTracksPrompt = v, enumerable: true },
    normalizeState: { get: () => normalizeState, set: (v) => normalizeState = v, enumerable: true },
    normalizeTask: { get: () => normalizeTask, set: (v) => normalizeTask = v, enumerable: true },
    getDefaultDifficultyMap: { get: () => getDefaultDifficultyMap, set: (v) => getDefaultDifficultyMap = v, enumerable: true },
    getSubjectDifficulty: { get: () => getSubjectDifficulty, set: (v) => getSubjectDifficulty = v, enumerable: true },
    normalizeProfile: { get: () => normalizeProfile, set: (v) => normalizeProfile = v, enumerable: true },
    normalizeCalendarRange: { get: () => normalizeCalendarRange, set: (v) => normalizeCalendarRange = v, enumerable: true },
    normalizeSubjects: { get: () => normalizeSubjects, set: (v) => normalizeSubjects = v, enumerable: true },
    normalizeTracks: { get: () => normalizeTracks, set: (v) => normalizeTracks = v, enumerable: true },
    normalizeAcademicPeriods: { get: () => normalizeAcademicPeriods, set: (v) => normalizeAcademicPeriods = v, enumerable: true },
    clampDifficulty: { get: () => clampDifficulty, set: (v) => clampDifficulty = v, enumerable: true },
    renderEventTypeOptions: { get: () => renderEventTypeOptions, set: (v) => renderEventTypeOptions = v, enumerable: true },
    renderEventSubjectOptions: { get: () => renderEventSubjectOptions, set: (v) => renderEventSubjectOptions = v, enumerable: true },
    toggleEventSubjectFields: { get: () => toggleEventSubjectFields, set: (v) => toggleEventSubjectFields = v, enumerable: true },
    updateEventEntryFields: { get: () => updateEventEntryFields, set: (v) => updateEventEntryFields = v, enumerable: true },
    toggleCustomCategoryFields: { get: () => toggleCustomCategoryFields, set: (v) => toggleCustomCategoryFields = v, enumerable: true },
    getCustomEventCategories: { get: () => getCustomEventCategories, set: (v) => getCustomEventCategories = v, enumerable: true },
    getEventCategory: { get: () => getEventCategory, set: (v) => getEventCategory = v, enumerable: true },
    renderSubjectInputs: { get: () => renderSubjectInputs, set: (v) => renderSubjectInputs = v, enumerable: true },
    renderSubjectInputsWithList: { get: () => renderSubjectInputsWithList, set: (v) => renderSubjectInputsWithList = v, enumerable: true },
    openEventEntry: { get: () => openEventEntry, set: (v) => openEventEntry = v, enumerable: true },
    closeEventEntry: { get: () => closeEventEntry, set: (v) => closeEventEntry = v, enumerable: true },
    addCustomEvent: { get: () => addCustomEvent, set: (v) => addCustomEvent = v, enumerable: true },
    resolveEventTypeForSubmit: { get: () => resolveEventTypeForSubmit, set: (v) => resolveEventTypeForSubmit = v, enumerable: true },
    resolveEventSubjectForSubmit: { get: () => resolveEventSubjectForSubmit, set: (v) => resolveEventSubjectForSubmit = v, enumerable: true },
    createCustomEventCategory: { get: () => createCustomEventCategory, set: (v) => createCustomEventCategory = v, enumerable: true },
    removeCustomEvent: { get: () => removeCustomEvent, set: (v) => removeCustomEvent = v, enumerable: true },
    removeStaticEvent: { get: () => removeStaticEvent, set: (v) => removeStaticEvent = v, enumerable: true },
    dismissStaticEventByIndex: { get: () => dismissStaticEventByIndex, set: (v) => dismissStaticEventByIndex = v, enumerable: true },
    getDayEvents: { get: () => getDayEvents, set: (v) => getDayEvents = v, enumerable: true },
    addEventClasses: { get: () => addEventClasses, set: (v) => addEventClasses = v, enumerable: true },
    getEventBorderColors: { get: () => getEventBorderColors, set: (v) => getEventBorderColors = v, enumerable: true },
    getDefaultEventColor: { get: () => getDefaultEventColor, set: (v) => getDefaultEventColor = v, enumerable: true },
    getPrimaryEventType: { get: () => getPrimaryEventType, set: (v) => getPrimaryEventType = v, enumerable: true },
    eventMatchesSubject: { get: () => eventMatchesSubject, set: (v) => eventMatchesSubject = v, enumerable: true },
    openSubjectEntry: { get: () => openSubjectEntry, set: (v) => openSubjectEntry = v, enumerable: true },
    closeSubjectEntry: { get: () => closeSubjectEntry, set: (v) => closeSubjectEntry = v, enumerable: true },
    addSubjectFromSettings: { get: () => addSubjectFromSettings, set: (v) => addSubjectFromSettings = v, enumerable: true },
    handleSubjectSettingsClick: { get: () => handleSubjectSettingsClick, set: (v) => handleSubjectSettingsClick = v, enumerable: true },
    getGroupedSubjectsAndTracks: { get: () => getGroupedSubjectsAndTracks, set: (v) => getGroupedSubjectsAndTracks = v, enumerable: true },
    renderChecklistFilters: { get: () => renderChecklistFilters, set: (v) => renderChecklistFilters = v, enumerable: true },
    renderTaskLinkOptions: { get: () => renderTaskLinkOptions, set: (v) => renderTaskLinkOptions = v, enumerable: true },
    openTaskEntry: { get: () => openTaskEntry, set: (v) => openTaskEntry = v, enumerable: true },
    closeTaskEntry: { get: () => closeTaskEntry, set: (v) => closeTaskEntry = v, enumerable: true },
    saveTask: { get: () => saveTask, set: (v) => saveTask = v, enumerable: true },
    refreshChecklistAll: { get: () => refreshChecklistAll, set: (v) => refreshChecklistAll = v, enumerable: true },
    handleChecklistClick: { get: () => handleChecklistClick, set: (v) => handleChecklistClick = v, enumerable: true },
    toggleTaskCompletion: { get: () => toggleTaskCompletion, set: (v) => toggleTaskCompletion = v, enumerable: true },
    deleteTask: { get: () => deleteTask, set: (v) => deleteTask = v, enumerable: true },
    renderChecklist: { get: () => renderChecklist, set: (v) => renderChecklist = v, enumerable: true },
    renderChecklistStats: { get: () => renderChecklistStats, set: (v) => renderChecklistStats = v, enumerable: true },
    renderDayTasks: { get: () => renderDayTasks, set: (v) => renderDayTasks = v, enumerable: true },
    handleDayTasksClick: { get: () => handleDayTasksClick, set: (v) => handleDayTasksClick = v, enumerable: true },
    openTaskDetailsModal: { get: () => openTaskDetailsModal, set: (v) => openTaskDetailsModal = v, enumerable: true },
    closeTaskDetailsModal: { get: () => closeTaskDetailsModal, set: (v) => closeTaskDetailsModal = v, enumerable: true },
    saveChecklistInPageTask: { get: () => saveChecklistInPageTask, set: (v) => saveChecklistInPageTask = v, enumerable: true },
    renderChecklistInlineLinkOptions: { get: () => renderChecklistInlineLinkOptions, set: (v) => renderChecklistInlineLinkOptions = v, enumerable: true },
    renderChecklistSelectedDay: { get: () => renderChecklistSelectedDay, set: (v) => renderChecklistSelectedDay = v, enumerable: true },
    renderChecklistDayTasks: { get: () => renderChecklistDayTasks, set: (v) => renderChecklistDayTasks = v, enumerable: true },
    renderChecklistCalendarPreview: { get: () => renderChecklistCalendarPreview, set: (v) => renderChecklistCalendarPreview = v, enumerable: true }
  });
})();
