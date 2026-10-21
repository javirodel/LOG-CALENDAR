(() => {
  window.App = window.App || {};
  window.App.DayPanel = window.App.DayPanel || {};

function ensureDay(dateKey) {
  if (!App.State.state.days[dateKey]) {
    App.State.state.days[dateKey] = { subjects: {}, notes: "", rating: 0, customEvents: [], extra: {} };
  }

  const day = App.State.state.days[dateKey];
  if (typeof day.notes !== "string") day.notes = "";
  if (typeof day.rating !== "number") day.rating = 0;
  if (!Array.isArray(day.customEvents)) day.customEvents = [];

  if (!day.extra || typeof day.extra !== "object") day.extra = {};
  if (!day.subjectTimeEntries || typeof day.subjectTimeEntries !== "object") day.subjectTimeEntries = {};
  if (!day.extraTimeEntries || typeof day.extraTimeEntries !== "object") day.extraTimeEntries = {};

  for (const track of App.State.EXTRA_TRACKS) {
    if (typeof day.extra[track.key] !== "number") {
      day.extra[track.key] = App.Utils.normalizeHours(day[track.key] || 0);
    }
  }

  for (const subject of App.State.subjects) {
    if (typeof day.subjects?.[subject.name] !== "number") {
      if (!day.subjects || typeof day.subjects !== "object") day.subjects = {};
      day.subjects[subject.name] = 0;
    }
  }

  return day;
}

function renderDailyQuote() {
  const quoteCard = document.getElementById("dailyQuoteCard");
  if (!quoteCard) return;
  const isEnabled = App.State?.state?.settings?.showDailyQuote !== false;
  if (!isEnabled) {
    quoteCard.style.display = "none";
    return;
  }
  const quote = App.I18n?.getDailyQuote ? App.I18n.getDailyQuote(App.State.selectedDate) : null;
  if (!quote) {
    quoteCard.style.display = "none";
    return;
  }
  const textEl = document.getElementById("dailyQuoteText");
  const authorEl = document.getElementById("dailyQuoteAuthor");
  if (textEl) textEl.textContent = `“${quote.text}”`;
  if (authorEl) authorEl.textContent = `— ${quote.author}`;
  quoteCard.style.display = "flex";
}

function renderSelectedDay() {
  const day = ensureDay(App.State.selectedDate);
  App.Constants.selectedWeekdayEl.textContent = App.Utils.formatWeekday(App.State.selectedDate);
  App.Constants.selectedDateEl.textContent = App.Utils.formatDateLong(App.State.selectedDate);
  App.Constants.selectedTotalEl.textContent = App.Utils.formatTime(App.Stats.getDayTotal(App.State.selectedDate));
  const subLabel = App.State.state.settings.subjectsLabelPlural || (App.I18n?.t("calendar.studyLabel") || "Estudio");
  App.Constants.selectedStudyEl.textContent = `${subLabel}: ${App.Utils.formatTime(App.Stats.getStudyTotal(App.State.selectedDate))}`;
  renderDaySplit();
  renderDailyQuote();
  App.Constants.dayNotesEl.value = day.notes || "";
  App.Tracker.renderTrackInputs();
  renderRating(day.rating);

  for (const input of App.Constants.subjectFormEl.querySelectorAll("input[data-subject]")) {
    App.Utils.updateTimeInputDisplay(
      input,
      App.Utils.getTimeEntryParts(day, "subjectTimeEntries", input.dataset.subject)
    );
  }

  renderNotices();
  App.Tasks.renderDayTasks();
  if (typeof App.Tasks.renderChecklistSelectedDay === "function") {
    App.Tasks.renderChecklistSelectedDay();
  }
  App.Stats.renderStats();
}

function renderDaySplit() {
  App.Constants.daySplitEl.querySelectorAll("[data-track-summary]").forEach((node) => node.remove());
  const day = ensureDay(App.State.selectedDate);
  for (const track of App.State.EXTRA_TRACKS) {
    const item = document.createElement("span");
    item.dataset.trackSummary = track.key;
    item.textContent = `${track.label}: ${App.Utils.formatTime(day.extra[track.key])}`;
    App.Constants.daySplitEl.appendChild(item);
  }
}

function renderRating(rating) {
  App.Constants.starsContainerEl.querySelectorAll(".star").forEach((star, i) => {
    star.classList.toggle("active", i < rating);
    star.classList.remove("hover");
  });
  const labels = App.I18n?.getRatingLabels ? App.I18n.getRatingLabels() : App.Constants.RATING_LABELS;
  App.Constants.ratingHintEl.textContent = labels[rating] || labels[0];
  App.Constants.ratingHintEl.dataset.level = rating;
}

function highlightStars(upTo) {
  App.Constants.starsContainerEl.querySelectorAll(".star").forEach((star, i) => {
    star.classList.remove("active");
    star.classList.toggle("hover", i < upTo);
  });
}

function renderNotices() {
  App.Constants.noticeListEl.innerHTML = "";
  const day = ensureDay(App.State.selectedDate);
  const list = [
    ...App.Calendar.getVisibleStaticEvents(App.State.selectedDate).map(({ event, index }) => ({ ...event, source: "static", index })),
    ...day.customEvents.map((event, index) => ({ ...event, source: "custom", index }))
  ];

  if (!list.length) {
    const clean = document.createElement("div");
    clean.className = "notice";
    clean.textContent = App.I18n?.t("calendar.noEvents") || "Sin eventos marcados para este día.";
    App.Constants.noticeListEl.appendChild(clean);
    return;
  }

  for (const ev of list) {
    const item = document.createElement("div");
    const category = ev.type === "track" ? { label: ev.label, className: "custom-note", color: ev.color } : App.Tasks.getEventCategory(ev.type);
    const eventColor = ev.color || category.color;
    item.className = `notice ${category.className}`;
    if (eventColor) {
      item.style.borderLeftColor = eventColor;
      item.style.background = App.Utils.hexToSoftBackground(eventColor);
      item.style.color = App.Utils.readableColor(eventColor);
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
      edit.title = App.I18n?.text(
        ev.source === "static" ? "Editar evento predefinido" : "Editar evento creado",
        ev.source === "static" ? "Edit predefined event" : "Edit created event"
      );
      edit.setAttribute("aria-label", edit.title);
      edit.addEventListener("click", () => App.Tasks.openEventEntry(ev));
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "notice-action";
      remove.textContent = "🗑";
      remove.title = App.I18n?.text(
        ev.source === "static" ? "Eliminar evento predefinido" : "Eliminar evento creado",
        ev.source === "static" ? "Delete predefined event" : "Delete created event"
      );
      remove.setAttribute("aria-label", remove.title);
      remove.addEventListener("click", () => {
        if (ev.source === "static") {
          App.Tasks.removeStaticEvent(ev.index);
        } else {
          App.Tasks.removeCustomEvent(ev.index);
        }
      });
      actions.append(edit, remove);
      item.appendChild(actions);
    }
    App.Constants.noticeListEl.appendChild(item);
  }
}

function clearSelectedDay() {
  const existingEvents = ensureDay(App.State.selectedDate).customEvents;
  App.State.state.days[App.State.selectedDate] = {
    subjects: Object.fromEntries(App.State.subjects.map((subject) => [subject.name, 0])),
    notes: "",
    rating: 0,
    customEvents: existingEvents,
    extra: Object.fromEntries(App.State.EXTRA_TRACKS.map((track) => [track.key, 0])),
    subjectTimeEntries: {},
    extraTimeEntries: {}
  };
  App.Storage.persist();
  renderSelectedDay();
  App.Utils.showToast(App.I18n?.text("Día vaciado.", "Day cleared."));
}

  Object.defineProperties(window.App.DayPanel, {
    ensureDay: { get: () => ensureDay, set: (v) => ensureDay = v, enumerable: true },
    renderDailyQuote: { get: () => renderDailyQuote, enumerable: true },
    renderSelectedDay: { get: () => renderSelectedDay, set: (v) => renderSelectedDay = v, enumerable: true },
    renderDaySplit: { get: () => renderDaySplit, set: (v) => renderDaySplit = v, enumerable: true },
    renderRating: { get: () => renderRating, set: (v) => renderRating = v, enumerable: true },
    highlightStars: { get: () => highlightStars, set: (v) => highlightStars = v, enumerable: true },
    renderNotices: { get: () => renderNotices, set: (v) => renderNotices = v, enumerable: true },
    clearSelectedDay: { get: () => clearSelectedDay, set: (v) => clearSelectedDay = v, enumerable: true }
  });
})();
