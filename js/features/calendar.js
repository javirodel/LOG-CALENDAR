(() => {
  window.App = window.App || {};
  window.App.Calendar = window.App.Calendar || {};



function renderCalendar() {
  const selected = App.State.selectedDate;
  const noAnim = App.State.calendarAnimated;
  App.Constants.monthsEl.innerHTML = "";

  const density = App.State.state?.settings?.calendarDensity || "standard";
  const palette = App.State.state?.settings?.heatmapPalette || "emerald";
  const calendarPane = document.querySelector(".calendar-pane");
  if (calendarPane) calendarPane.setAttribute("data-density", density);
  document.documentElement.setAttribute("data-heatmap-palette", palette);

  const months = [0, 1].map((offset) => {
    const date = App.Utils.addMonths(App.State.visibleMonth, offset);
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
      label: App.Utils.getMonthLabel(date)
    };
  });

  for (const monthInfo of months) {
    const monthEl = document.createElement("section");
    monthEl.className = "month";
    const weekdaySpans = (App.I18n?.getWeekdayLetters ? App.I18n.getWeekdayLetters() : ["L", "M", "X", "J", "V", "S", "D"])
      .map(letter => `<span>${letter}</span>`).join("");

    monthEl.innerHTML = `
      <div class="month-title">
        <strong>${monthInfo.label}</strong>
        <span>${monthInfo.year}</span>
      </div>
      <div class="weekday-row" aria-hidden="true">
        ${weekdaySpans}
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
      const key = App.Utils.toDateKey(new Date(monthInfo.year, monthInfo.month, day));
      if (key < getCalendarStart() || key > getCalendarEnd()) {
        grid.appendChild(Object.assign(document.createElement("div"), { className: "blank-cell" }));
        continue;
      }
      grid.appendChild(createDayCell(key, selected, noAnim));
    }

    monthEl.appendChild(grid);
    App.Constants.monthsEl.appendChild(monthEl);
  }

  if (!App.State.calendarAnimated) App.State.calendarAnimated = true;
  renderCalendarNavigation();
}

function renderCalendarNavigation() {
  const visibleStart = App.Utils.toDateKey(App.Utils.startOfMonth(App.State.visibleMonth));
  const visibleEnd = App.Utils.toDateKey(App.Utils.endOfMonth(App.Utils.addMonths(App.State.visibleMonth, 1)));
  const firstLabel = App.Utils.getMonthLabel(App.State.visibleMonth);
  const secondLabel = App.Utils.getMonthLabel(App.Utils.addMonths(App.State.visibleMonth, 1));
  App.Constants.visibleRangeLabelEl.textContent = App.I18n?.text(
    `Mostrando ${firstLabel.toLowerCase()} y ${secondLabel.toLowerCase()}.`,
    `Showing ${firstLabel.toLowerCase()} and ${secondLabel.toLowerCase()}.`
  );
  App.Constants.visibleMonthPairTitleEl.textContent = `${firstLabel} · ${secondLabel}`;
  App.Constants.prevMonthsBtn.title = App.I18n?.text(
    visibleStart <= getCalendarStart() ? "Precargar meses anteriores" : "Ver dos meses anteriores",
    visibleStart <= getCalendarStart() ? "Preload previous months" : "View previous two months"
  );
  App.Constants.nextMonthsBtn.title = App.I18n?.text(
    visibleEnd >= getCalendarEnd() ? "Precargar meses siguientes" : "Ver dos meses siguientes",
    visibleEnd >= getCalendarEnd() ? "Preload next months" : "View next two months"
  );
}

function moveVisibleMonths(offset) {
  const target = App.Utils.addMonths(App.State.visibleMonth, offset);
  if (offset < 0 && App.Utils.toDateKey(App.Utils.startOfMonth(target)) < getCalendarStart()) {
    App.Settings.openRangeEntry("prev");
    return;
  }

  if (offset > 0 && App.Utils.toDateKey(App.Utils.endOfMonth(App.Utils.addMonths(target, 1))) > getCalendarEnd()) {
    App.Settings.openRangeEntry("next");
    return;
  }

  App.State.visibleMonth = target;
  renderCalendar();
}

function createDayCell(key, selected, noAnim) {
  const date = App.Utils.parseKey(key);
  const total = App.Stats.getStudyTotal(key);
  const cell = document.createElement("button");
  const classNames = ["day-cell", App.Stats.getIntensityClass(total)];
  if (key === selected) classNames.push("selected");
  if (key === App.Utils.getTodayDateKey()) classNames.push("today");
  if ([0, 6].includes(date.getDay())) classNames.push("weekend");
  App.Tasks.addEventClasses(classNames, key);
  App.Tracker.addTrackClasses(classNames, key);
  const intensityColor = App.Stats.getIntensityColor(total);
  if (App.Utils.needsLightText(intensityColor)) {
    classNames.push("dark-day");
  } else {
    classNames.push("light-day");
  }
  cell.className = classNames.join(" ");
  cell.type = "button";
  cell.dataset.date = key;
  cell.style.backgroundColor = intensityColor;
  applyEventColorToCell(cell, key);

  if (noAnim) {
    cell.style.animation = "none";
    cell.style.opacity = "1";
    cell.style.transform = "translateY(0)";
  } else {
    cell.style.animationDelay = `${Math.min(date.getDate() * 16, 360)}ms`;
  }

  cell.setAttribute("aria-label", `${App.Utils.formatDateLong(key)}, ${App.Utils.formatTime(total)} ${App.I18n?.text("de estudio", "of study")}`);
  cell.innerHTML = getDayCellMarkup(key);

  cell.addEventListener("click", () => {
    App.State.selectedDate = key;
    renderCalendar();
    App.DayPanel.renderSelectedDay();
  });
  return cell;
}

function refreshDayCell(key) {
  const cell = App.Constants.monthsEl.querySelector(`[data-date="${key}"]`);
  if (!cell) return;
  const date = App.Utils.parseKey(key);
  const total = App.Stats.getStudyTotal(key);
  const classNames = ["day-cell", App.Stats.getIntensityClass(total)];
  if (key === App.State.selectedDate) classNames.push("selected");
  if (key === App.Utils.getTodayDateKey()) classNames.push("today");
  if ([0, 6].includes(date.getDay())) classNames.push("weekend");
  App.Tasks.addEventClasses(classNames, key);
  App.Tracker.addTrackClasses(classNames, key);
  const intensityColor = App.Stats.getIntensityColor(total);
  if (App.Utils.needsLightText(intensityColor)) {
    classNames.push("dark-day");
  } else {
    classNames.push("light-day");
  }
  cell.className = classNames.join(" ");
  cell.style.backgroundColor = intensityColor;
  applyEventColorToCell(cell, key);
  cell.setAttribute("aria-label", `${App.Utils.formatDateLong(key)}, ${App.Utils.formatTime(total)} ${App.I18n?.text("de estudio", "of study")}`);
  cell.innerHTML = getDayCellMarkup(key);
}

function applyEventColorToCell(cell, key) {
  for (let i = 1; i <= 4; i++) cell.style.removeProperty(`--event-color-${i}`);
  App.Tasks.getEventBorderColors(App.Tasks.getDayEvents(key)).forEach((color, index) => {
    cell.style.setProperty(`--event-color-${index + 1}`, color);
  });
}

function getDayCellMarkup(key) {
  const date = App.Utils.parseKey(key);
  const total = App.Stats.getStudyTotal(key);
  const day = App.DayPanel.ensureDay(key);

  const dots = App.State.subjects
    .filter((subject) => (day.subjects[subject.name] || 0) > 0)
    .map((subject) => `<span style="background:${App.Utils.escapeHtml(subject.color)}"></span>`)
    .join("");

  const chips = App.State.EXTRA_TRACKS
    .filter((track) => day.extra[track.key] > 0)
    .map((track) => `<span class="track-chip" style="--chip-color:${App.Utils.escapeHtml(track.color)}">${App.Utils.escapeHtml(track.shortLabel)} ${App.Utils.formatShortTime(day.extra[track.key])}</span>`)
    .join("");
  const noteDot = day.notes.trim() ? `<span class="note-dot" title="${App.I18n?.text("Tiene nota", "Has a note")}"></span>` : "";
  const hasPendingTasks = Boolean(App.State.state?.checklistTasks?.some(t => t.dueDate === key && !t.completed));
  const taskDot = hasPendingTasks ? `<span class="task-dot" title="${App.I18n?.text("Tareas pendientes para este día", "Pending tasks for this day")}"></span>` : "";

  return `
    <span class="day-topline">
      <span class="day-number">${date.getDate()}</span>
      ${noteDot}${taskDot}
    </span>
    <span class="day-body">
      <span class="day-hours">${App.Utils.formatShortTime(total)}</span>
    </span>
    <span class="subject-dots" aria-hidden="true">${dots}</span>
    <span class="track-chips" aria-hidden="true">${chips}</span>
  `;
}

function getVisibleStaticEvents(key) {
  const dismissedForDay = Array.isArray(App.State.state.dismissedEvents?.[key]) ? App.State.state.dismissedEvents[key] : [];
  return (App.State.events[key] || [])
    .map((event, index) => ({ event, index }))
    .filter(({ event, index }) => !dismissedForDay.includes(getStaticEventId(event, index)));
}

function getStaticEventId(event, index) {
  return `${index}:${event.type}:${event.text}`;
}

function extendCalendarRange() {
  const range = App.State.state.settings.calendarRange;
  if (App.State.pendingRangeExtension === "prev") {
    const newStart = App.Utils.addYears(App.Utils.parseKey(range.start), -1);
    range.start = App.Utils.toDateKey(newStart);
  } else {
    const newEnd = App.Utils.addYears(App.Utils.parseKey(range.end), 1);
    range.end = App.Utils.toDateKey(newEnd);
  }

  App.State.state.settings.calendarRange = App.Tasks.normalizeCalendarRange(range);
  App.Storage.saveState();
  App.Settings.applyProfile();
  App.Settings.closeRangeEntry();
  renderCalendar();
  App.Stats.renderStats();
  App.Utils.showToast(App.I18n?.text("Rango ampliado.", "Range extended."));
}

function getInitialSelectedDate() {
  if (App.Utils.getTodayDateKey() < getCalendarStart()) return getCalendarStart();
  if (App.Utils.getTodayDateKey() > getCalendarEnd()) return getCalendarEnd();
  return App.Utils.getTodayDateKey();
}

function getInitialVisibleMonth() {
  return App.Utils.startOfMonth(App.Utils.parseKey(App.State.selectedDate));
}

function getCalendarStart() {
  return App.State.state.settings.calendarRange.start;
}

function getCalendarEnd() {
  return App.State.state.settings.calendarRange.end;
}

function renderEventLegend() {
  if (!App.Constants.eventLegendEl) return;
  const usedTypes = new Set();
  
  for (const day of Object.values(App.State.state.days)) {
    for (const ev of (day.customEvents || [])) {
      usedTypes.add(ev.type);
    }
  }
  for (const dateKey of Object.keys(App.State.events)) {
    for (const ev of getVisibleStaticEvents(dateKey)) {
      usedTypes.add(ev.event.type);
    }
  }
  
  if (App.State.state.customEventCategories) {
    for (const type of Object.keys(App.State.state.customEventCategories)) {
      usedTypes.add(type);
    }
  }

  App.Constants.eventLegendEl.innerHTML = "";
  for (const type of usedTypes) {
    if (type === "weekend") continue;
    const category = App.Tasks.getEventCategory(type);
    const color = category.color || App.Tasks.getDefaultEventColor(type);
    
    let bg = color;
    if (typeof App.Utils.hexToSoftBackground === "function" && color.startsWith("#")) {
      bg = App.Utils.hexToSoftBackground(color);
    } else {
      bg = "rgba(180, 83, 9, 0.12)";
    }
    
    const span = document.createElement("span");
    span.innerHTML = `<b class="event-line" style="border-left-color: ${App.Utils.escapeHtml(color)}; background: ${App.Utils.escapeHtml(bg)};"></b> ${App.Utils.escapeHtml(category.label.toLowerCase())}`;
    App.Constants.eventLegendEl.appendChild(span);
  }
}

  Object.defineProperties(window.App.Calendar, {
    renderCalendar: { get: () => renderCalendar, set: (v) => renderCalendar = v, enumerable: true },
    renderCalendarNavigation: { get: () => renderCalendarNavigation, set: (v) => renderCalendarNavigation = v, enumerable: true },
    moveVisibleMonths: { get: () => moveVisibleMonths, set: (v) => moveVisibleMonths = v, enumerable: true },
    createDayCell: { get: () => createDayCell, set: (v) => createDayCell = v, enumerable: true },
    refreshDayCell: { get: () => refreshDayCell, set: (v) => refreshDayCell = v, enumerable: true },
    applyEventColorToCell: { get: () => applyEventColorToCell, set: (v) => applyEventColorToCell = v, enumerable: true },
    getDayCellMarkup: { get: () => getDayCellMarkup, set: (v) => getDayCellMarkup = v, enumerable: true },
    getVisibleStaticEvents: { get: () => getVisibleStaticEvents, set: (v) => getVisibleStaticEvents = v, enumerable: true },
    getStaticEventId: { get: () => getStaticEventId, set: (v) => getStaticEventId = v, enumerable: true },
    extendCalendarRange: { get: () => extendCalendarRange, set: (v) => extendCalendarRange = v, enumerable: true },
    getInitialSelectedDate: { get: () => getInitialSelectedDate, set: (v) => getInitialSelectedDate = v, enumerable: true },
    getInitialVisibleMonth: { get: () => getInitialVisibleMonth, set: (v) => getInitialVisibleMonth = v, enumerable: true },
    getCalendarStart: { get: () => getCalendarStart, set: (v) => getCalendarStart = v, enumerable: true },
    getCalendarEnd: { get: () => getCalendarEnd, set: (v) => getCalendarEnd = v, enumerable: true },
    renderEventLegend: { get: () => renderEventLegend, set: (v) => renderEventLegend = v, enumerable: true }
  });
})();
