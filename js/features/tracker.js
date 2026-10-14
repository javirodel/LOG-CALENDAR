(() => {
  window.App = window.App || {};
  window.App.Tracker = window.App.Tracker || {};

  let horizontalViewSwipeDistance = 0;
  let horizontalViewSwipeLockedUntil = 0;
  let horizontalViewSwipeResetTimer = null;

  function getTrackpadSwipeSettings() {
    const sensitivity = App.State.state?.settings?.trackpadSensitivity || "medium";
    switch (sensitivity) {
      case "low":
        return { threshold: 180, cooldown: 900 };
      case "high":
        return { threshold: 75, cooldown: 750 };
      case "medium":
      default:
        return { threshold: 120, cooldown: 800 };
    }
  }


/**
 * Configuración predeterminada de hábitos y rutinas para nuevos usuarios.
 * Modifica este array si deseas precargar hábitos al iniciar la aplicación.
 *
 * Ejemplo de hábitos:
 * return [
 *   { id: "h_agua", emoji: "💧", name: "Beber 2L de agua", goal: 30 },
 *   { id: "h_lectura", emoji: "📖", name: "Lectura diaria (20 min)", goal: 25 },
 *   { id: "h_deporte", emoji: "🏋️", name: "Entrenamiento / Deporte", goal: 20 },
 *   { id: "h_meditar", emoji: "🧘", name: "Meditación / Desconexión", goal: 15 }
 * ];
 */
function getDefaultRoutineHabits() {
  return [];
}

function renderTrackInputs() {
  App.Constants.focusTracksEl.innerHTML = "";
  if (!App.State.EXTRA_TRACKS.length) {
    App.Constants.focusTracksEl.innerHTML = `<div class="empty-state">Sin hobbies configurados.</div>`;
    return;
  }

  const day = App.DayPanel.ensureDay(App.State.selectedDate);
  for (const track of App.State.EXTRA_TRACKS) {
    const article = document.createElement("article");
    article.className = "focus-track";
    article.style.setProperty("--track-color", track.color);
    article.innerHTML = `
      <h3>${App.Utils.escapeHtml(track.label)}</h3>
      <p>${App.Utils.escapeHtml(track.description || "Tiempo dedicado a este hobby.")}</p>
      <label for="track-${App.Utils.escapeHtml(track.key)}">Tiempo del día</label>
      <input id="track-${App.Utils.escapeHtml(track.key)}" type="${App.Utils.getTimeInputType()}" ${App.Utils.getTimeInputAttributes()} placeholder="${App.Utils.getTimeInputPlaceholder()}" data-track="${App.Utils.escapeHtml(track.key)}">
    `;
    const input = article.querySelector("input");
    input.value = day.extra[track.key] ? App.Utils.formatTimeInput(day.extra[track.key]) : "";
    App.Constants.focusTracksEl.appendChild(article);
  }
}

function addTrackClasses(classNames, key) {
  const day = App.DayPanel.ensureDay(key);
  if (App.State.EXTRA_TRACKS.some((track) => day.extra[track.key] > 0)) classNames.push("has-track");
}

function openTrackEntry() {
  App.State.editingTrackTarget = null;
  if (App.Constants.trackSettingsFormEl) App.Constants.trackSettingsFormEl.reset();
  if (App.Constants.newTrackColorEl) App.Constants.newTrackColorEl.value = "#d97706";
  
  const hobSingular = App.State.state.settings.hobbiesLabelSingular || "Hobby";
  const titleEl = App.Constants.trackEntryTitleEl || document.getElementById("trackEntryTitle");
  if (titleEl) titleEl.textContent = App.I18n?.text(`Añadir ${hobSingular.toLowerCase()}`, `Add ${hobSingular.toLowerCase()}`);
  const submitBtn = App.Constants.trackSettingsFormEl ? App.Constants.trackSettingsFormEl.querySelector('button[type="submit"]') : null;
  if (submitBtn) submitBtn.textContent = App.I18n?.text(`Añadir ${hobSingular.toLowerCase()}`, `Add ${hobSingular.toLowerCase()}`);
  
  if (App.Constants.trackEntryModalEl) App.Constants.trackEntryModalEl.hidden = false;
  if (App.Constants.newTrackNameEl) App.Constants.newTrackNameEl.focus();
}

function closeTrackEntry() {
  App.State.editingTrackTarget = null;
  if (App.Constants.trackSettingsFormEl) App.Constants.trackSettingsFormEl.reset();
  if (App.Constants.newTrackColorEl) App.Constants.newTrackColorEl.value = "#d97706";
  if (App.Constants.trackEntryModalEl) App.Constants.trackEntryModalEl.hidden = true;
}

function addTrackFromSettings(event) {
  event.preventDefault();
  const label = App.Constants.newTrackNameEl.value.trim();
  const description = App.Constants.newTrackDescriptionEl.value.trim();
  if (!label) return;

  const hobSingular = App.State.state.settings.hobbiesLabelSingular || "Hobby";

  if (App.State.editingTrackTarget) {
    const idx = App.State.state.settings.tracks.findIndex(t => t.key === App.State.editingTrackTarget);
    if (idx >= 0) {
      App.State.state.settings.tracks[idx] = {
        ...App.State.state.settings.tracks[idx],
        label,
        description,
        shortLabel: App.Utils.getShortLabel(label),
        color: App.Utils.normalizeColor(App.Constants.newTrackColorEl.value)
      };
    }
    App.State.editingTrackTarget = null;
    closeTrackEntry();
    App.Settings.refreshAfterConfigChange(App.I18n?.text(`${hobSingular} actualizado.`, `${hobSingular} updated.`));
    return;
  }

  const key = App.Utils.createUniqueKey(App.Utils.slugifyCategory(label) || "hobby", App.State.EXTRA_TRACKS.map((track) => track.key));
  App.State.state.settings.tracks.push({
    key,
    label,
    description,
    shortLabel: App.Utils.getShortLabel(label),
    color: App.Utils.normalizeColor(App.Constants.newTrackColorEl.value)
  });
  App.Constants.trackSettingsFormEl.reset();
  App.Constants.newTrackColorEl.value = "#d97706";
  closeTrackEntry();
  App.Settings.refreshAfterConfigChange(App.I18n?.text(`${hobSingular} añadido.`, `${hobSingular} added.`));
}

function handleTrackSettingsClick(event) {
  const editBtn = event.target.closest("[data-edit-track]");
  if (editBtn) {
    const key = editBtn.dataset.editTrack;
    const track = App.State.EXTRA_TRACKS.find(t => t.key === key);
    if (!track) return;

    App.State.editingTrackTarget = key;
    App.Constants.newTrackNameEl.value = track.label;
    App.Constants.newTrackDescriptionEl.value = track.description || "";
    App.Constants.newTrackColorEl.value = track.color || "#d97706";

    const hobSingular = App.State.state.settings.hobbiesLabelSingular || "Hobby";
    App.Constants.trackEntryTitleEl.textContent = App.I18n?.text(`Editar ${hobSingular.toLowerCase()}`, `Edit ${hobSingular.toLowerCase()}`);
    App.Constants.trackSettingsFormEl.querySelector('button[type="submit"]').textContent = App.I18n?.text("Guardar cambios", "Save changes");

    App.Constants.trackEntryModalEl.hidden = false;
    App.Constants.newTrackNameEl.focus();
    return;
  }

  const deleteBtn = event.target.closest("[data-delete-track]");
  if (!deleteBtn) return;
  const key = deleteBtn.dataset.deleteTrack;
  const track = App.State.EXTRA_TRACKS.find((item) => item.key === key);
  
  const hobSingular = App.State.state.settings.hobbiesLabelSingular || "Hobby";
  const ok = confirm(App.I18n?.text(
    `¿Estás seguro de que quieres eliminar toda la info de "${track?.label || key}"? El paso no será reversible.`,
    `Are you sure you want to delete all information for "${track?.label || key}"? This cannot be undone.`
  ));
  if (!ok) return;
  App.State.state.settings.tracks = App.State.state.settings.tracks.filter((item) => item.key !== key);
  for (const day of Object.values(App.State.state.days)) {
    if (day.extra) delete day.extra[key];
  }
  if (App.State.state?.checklistTasks) {
    App.State.state.checklistTasks = App.State.state.checklistTasks.map(task => {
      if (task.linkType === "track" && task.linkKey === key) {
        return { ...task, linkType: "", linkKey: "" };
      }
      return task;
    });
  }
  App.Settings.refreshAfterConfigChange(App.I18n?.text(`${hobSingular} eliminado.`, `${hobSingular} deleted.`));
}

function getTrackTotal(key) {
  const day = App.DayPanel.ensureDay(key);
  return App.State.EXTRA_TRACKS.reduce((sum, track) => sum + (Number(day.extra[track.key]) || 0), 0);
}

function countActiveTrackDays(keys, trackKey) {
  if (!trackKey) return 0;
  return keys.filter((key) => (App.DayPanel.ensureDay(key).extra[trackKey] || 0) > 0).length;
}

// --- LÓGICA Y RENDERIZADO DEL TRACKER DE HÁBITOS ("RoutineKraft" STYLE DASHBOARD) ---

function initRoutineTrackerEvents() {
  // Global window bindings for inline handlers
  window.openHabitModal = openHabitModal;
  window.closeHabitModal = closeHabitModal;
  window.toggleHabitCheck = toggleHabitCheck;
  window.updateHabitGoalInline = updateHabitGoalInline;
  window.switchView = switchView;
  window.openSettings = App.Settings.openSettings;
  window.closeSettings = App.Settings.closeSettings;

  const prevBtn = document.getElementById("routinePrevMonthBtn");
  const nextBtn = document.getElementById("routineNextMonthBtn");
  const monthSelect = document.getElementById("routineMonthSelect");
  const addHabitBtn = document.getElementById("addHabitBtn");
  const resetBtn = document.getElementById("resetMonthBtn");



  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      App.State.routineActiveMonth = shiftMonthKey(App.State.routineActiveMonth, -1);
      renderRoutineTracker();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      App.State.routineActiveMonth = shiftMonthKey(App.State.routineActiveMonth, 1);
      renderRoutineTracker();
    });
  }

  if (monthSelect) {
    monthSelect.addEventListener("change", (e) => {
      App.State.routineActiveMonth = e.target.value;
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
      if (confirm(App.I18n?.text(
        `¿Vaciar todas las marcas registradas de este mes (${formatMonthKeyTitle(App.State.routineActiveMonth)})?`,
        `Clear all recorded marks for this month (${formatMonthKeyTitle(App.State.routineActiveMonth)})?`
      ))) {
        if (App.State.state.routineTracker && App.State.state.routineTracker.monthlyChecks) {
          delete App.State.state.routineTracker.monthlyChecks[App.State.routineActiveMonth];
          App.Main.recordLastUpdate({
            source: "tracker",
            target: "Marcas del mes vaciadas",
            type: "habit"
          });
          App.Storage.saveState();
          renderRoutineTracker();
          App.Utils.showToast(App.I18n?.text("Marcas del mes vaciadas.", "Monthly marks cleared."));
        }
      }
    });
  }

  // Controles de navegación y desplazamiento para el histórico de meses anteriores
  const historyPrevBtn = document.getElementById("historySidePrevBtn");
  const historyNextBtn = document.getElementById("historySideNextBtn");
  const historyScrollContainer = document.getElementById("routineHistoryScrollContainer");

  if (historyPrevBtn && historyScrollContainer) {
    historyPrevBtn.addEventListener("click", () => {
      historyScrollContainer.scrollBy({ left: -240, behavior: "smooth" });
    });
  }

  if (historyNextBtn && historyScrollContainer) {
    historyNextBtn.addEventListener("click", () => {
      historyScrollContainer.scrollBy({ left: 240, behavior: "smooth" });
    });
  }

  if (historyScrollContainer) {
    historyScrollContainer.addEventListener("scroll", updateHistoryArrowStates, { passive: true });
    historyScrollContainer.addEventListener("wheel", (e) => {
      // Si el usuario usa rueda vertical convencional, convertirla suavemente a scroll horizontal
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && e.deltaY !== 0) {
        historyScrollContainer.scrollLeft += e.deltaY * 0.9;
        e.preventDefault();
      }
    }, { passive: false });
  }

  // Delegación de eventos para la matriz mensual de hábitos
  const matrixTable = document.getElementById("routineMatrixTable");
  const matrixScrollContainer = matrixTable?.closest(".table-scroll-container");
  if (matrixScrollContainer) {
    matrixScrollContainer.addEventListener("scroll", () => {
      clearTimeout(App.State.routineMatrixScrollSaveTimer);
      routineMatrixScrollSaveTimer = setTimeout(() => {
        App.State.state.routineTracker.matrixScrollLeft = matrixScrollContainer.scrollLeft;
        App.Storage.saveState();
      }, 150);
    }, { passive: true });
  }
  if (matrixTable) {
    matrixTable.addEventListener("click", (e) => {
      const editIcon = e.target.closest(".habit-edit-icon");
      if (editIcon && editIcon.dataset.habitId) {
        openHabitModal(editIcon.dataset.habitId);
      }
    });

    matrixTable.addEventListener("change", (e) => {
      const target = e.target;
      if (target.classList.contains("routine-checkbox")) {
        const habitId = target.dataset.habitId;
        const day = Number(target.dataset.day);
        if (habitId && day) {
          toggleHabitCheck(habitId, day);
        }
      } else if (target.classList.contains("goal-inline-input")) {
        const habitId = target.dataset.habitId;
        if (habitId) {
          updateHabitGoalInline(habitId, target.value);
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

      if (!App.State.state.routineTracker) {
        App.State.state.routineTracker = { habits: getDefaultRoutineHabits(), monthlyChecks: {}, matrixScrollLeft: 0 };
      }

      if (App.State.editingHabitTarget) {
        const habit = App.State.state.routineTracker.habits.find(h => h.id === App.State.editingHabitTarget);
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
        App.State.state.routineTracker.habits.push(newHabit);
      }

      App.Main.recordLastUpdate({
        source: "tracker",
        target: name,
        type: "habit"
      });

      const wasEditingHabit = Boolean(App.State.editingHabitTarget);
      App.Storage.saveState();
      closeHabitModal();
      renderRoutineTracker();
      App.Utils.showToast(wasEditingHabit ? App.I18n?.text("Hábito actualizado.", "Habit updated.") : App.I18n?.text("Hábito añadido.", "Habit added."));
    });
  }

  if (habitCloseBtn) habitCloseBtn.addEventListener("click", closeHabitModal);
  if (backdrop) backdrop.addEventListener("click", closeHabitModal);

  if (habitDeleteBtn) {
    habitDeleteBtn.addEventListener("click", () => {
      if (App.State.editingHabitTarget && confirm(App.I18n?.text("¿Eliminar este hábito de la lista?", "Delete this habit from the list?"))) {
        const habit = App.State.state.routineTracker.habits.find(h => h.id === App.State.editingHabitTarget);
        App.State.state.routineTracker.habits = App.State.state.routineTracker.habits.filter(h => h.id !== App.State.editingHabitTarget);
        App.Main.recordLastUpdate({
          source: "tracker",
          target: habit ? `Hábito "${habit.name}" eliminado` : "Hábito eliminado",
          type: "habit"
        });
        App.Storage.saveState();
        closeHabitModal();
        renderRoutineTracker();
        App.Utils.showToast(App.I18n?.text("Hábito eliminado.", "Habit deleted."));
      }
    });
  }

  // Navegación fluida por gestos de trackpad (dos dedos / scroll horizontal)
  window.removeEventListener("wheel", handleHorizontalViewSwipe);
  window.addEventListener("wheel", handleHorizontalViewSwipe, { passive: false });
}

function openHabitModal(habitId) {
  const modal = document.getElementById("habitEntryModal");
  const title = document.getElementById("habitEntryTitle");
  const emojiInput = document.getElementById("habitEmojiInput");
  const nameInput = document.getElementById("habitNameInput");
  const goalInput = document.getElementById("habitGoalInput");
  const deleteBtn = document.getElementById("habitDeleteBtn");

  if (!modal) return;

  App.State.editingHabitTarget = habitId;

  if (habitId) {
    const habit = (App.State.state.routineTracker && App.State.state.routineTracker.habits) ? App.State.state.routineTracker.habits.find(h => h.id === habitId) : null;
    if (habit) {
      title.textContent = App.I18n?.t("tracker.habitModalEditTitle") || "Editar Hábito";
      emojiInput.value = habit.emoji || "⭐";
      nameInput.value = habit.name || "";
      goalInput.value = habit.goal || 30;
      if (deleteBtn) deleteBtn.style.display = "inline-block";
    }
  } else {
    title.textContent = App.I18n?.t("tracker.habitModalTitle") || "Añadir Hábito";
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
  App.State.editingHabitTarget = null;
}

function shiftMonthKey(key, delta) {
  if (!key || typeof key !== "string" || !key.includes("-")) {
    key = App.Utils.getTodayYearMonth();
  }
  const parts = key.split("-").map(Number);
  const y = parts[0] || 2026;
  const m = parts[1] || 1;
  const d = new Date(y, m - 1 + delta, 1);
  const newY = d.getFullYear();
  const newM = String(d.getMonth() + 1).padStart(2, "0");
  return `${newY}-${newM}`;
}

function formatMonthKeyTitle(key) {
  if (!key || typeof key !== "string" || !key.includes("-")) {
    key = App.Utils.getTodayYearMonth();
  }
  const parts = key.split("-").map(Number);
  const y = parts[0] || 2026;
  const m = parts[1] || 1;
  const date = new Date(y, m - 1, 1);
  const locale = App.I18n && typeof App.I18n.getLocale === "function" ? App.I18n.getLocale() : "es-ES";
  return date.toLocaleDateString(locale, { month: "long", year: "numeric" }).toUpperCase();
}

function renderRoutineTracker() {
  if (!App.State.routineActiveMonth || typeof App.State.routineActiveMonth !== "string" || !App.State.routineActiveMonth.includes("-")) {
    App.State.routineActiveMonth = App.Utils.getTodayYearMonth();
  }
  if (!App.State.state.routineTracker || !Array.isArray(App.State.state.routineTracker.habits)) {
    App.State.state.routineTracker = { habits: getDefaultRoutineHabits(), monthlyChecks: {}, matrixScrollLeft: 0 };
  }

  const habits = App.State.state.routineTracker.habits;
  const parts = App.State.routineActiveMonth.split("-").map(Number);
  const year = parts[0] || 2026;
  const month = parts[1] || 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const checksMap = (App.State.state.routineTracker.monthlyChecks && App.State.state.routineTracker.monthlyChecks[App.State.routineActiveMonth]) || {};

  // Header Title
  const titleEl = document.getElementById("routineMonthTitle");
  if (titleEl) titleEl.textContent = formatMonthKeyTitle(App.State.routineActiveMonth);

  // Month Selector Options
  const selectEl = document.getElementById("routineMonthSelect");
  if (selectEl) {
    selectEl.innerHTML = "";
    for (let m = 1; m <= 12; m++) {
      const mKey = `${year}-${String(m).padStart(2, "0")}`;
      const opt = document.createElement("option");
      opt.value = mKey;
      opt.textContent = formatMonthKeyTitle(mKey);
      if (mKey === App.State.routineActiveMonth) opt.selected = true;
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
    const goal = Math.min(daysInMonth, Math.max(1, Number(h.goal) || daysInMonth));
    grandDone += donePerHabit[h.id];
    grandGoal += goal;
  });

  const globalPct = grandGoal > 0 ? Math.min(100, (grandDone / grandGoal) * 100).toFixed(1) : "0.0";

  // Summary Badge
  const isEn = App.I18n && typeof App.I18n.getCurrentLanguage === "function" && App.I18n.getCurrentLanguage() === "en";
  const summaryBadge = document.getElementById("trendMonthSummaryBadge");
  if (summaryBadge) summaryBadge.textContent = `${globalPct}% ${isEn ? "Completed" : "Cumplido"}`;

  // Render Sub-components
  renderRoutineTrendChart(daysInMonth, donePerDay, habits.length);
  renderRoutineMatrixTable(year, month, daysInMonth, habits, checksMap);
  renderRoutineWeeklyAnalysis(year, month, daysInMonth, habits.length, donePerDay);
  renderRoutineOverview(grandDone, grandGoal, globalPct, habits, donePerHabit, daysInMonth);
  renderRoutineRanking(habits, donePerHabit, daysInMonth);
  renderRoutineHistory(habits);
}

function renderRoutineTrendChart(daysInMonth, donePerDay, totalHabits) {
  const container = document.getElementById("trendChartWrapper");
  if (!container) return;

  const isEn = App.I18n && typeof App.I18n.getCurrentLanguage === "function" && App.I18n.getCurrentLanguage() === "en";

  if (totalHabits === 0) {
    container.innerHTML = `<div style="text-align:center; color:var(--muted); padding:40px;">${isEn ? "Add habits to view daily completion trend" : "Añade hábitos para ver la gráfica de tendencia"}</div>`;
    return;
  }

  const containerRect = container.getBoundingClientRect();
  const width = Math.max(Math.round(containerRect.width), 400);
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
      <title>${isEn ? `Day ${p.day}: ${p.count}/${totalHabits} habits (${p.pct}%)` : `Día ${p.day}: ${p.count}/${totalHabits} hábitos (${p.pct}%)`}</title>
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

function getRoutineMonthWeeks(year, month, daysInMonth) {
  const weeks = [];
  const weekLabel = (App.I18n?.t ? App.I18n.t("tracker.weekLabel") : null) || "SEMANA";
  const firstDow = new Date(year, month - 1, 1).getDay(); // 0=Sun..6=Sat
  // Find the first Monday on or after day 1 (ISO weeks start on Monday)
  // dow: 0=Sun,1=Mon,...,6=Sat → daysUntilFirstMon: Sun→1, Mon→0, Tue→6, Wed→5, Thu→4, Fri→3, Sat→2
  const daysUntilFirstMon = firstDow === 0 ? 1 : (firstDow === 1 ? 0 : 8 - firstDow);
  let weekNum = 1;

  // If the month doesn't start on Monday, the first partial week
  if (daysUntilFirstMon > 0) {
    weeks.push({
      num: weekNum,
      name: `${weekLabel} ${weekNum}`,
      start: 1,
      end: Math.min(daysUntilFirstMon, daysInMonth),
      cls: `week-header-${Math.min(weekNum, 5)}`
    });
    weekNum++;
  }

  // Full and remaining weeks starting from the first Monday
  let monDay = daysUntilFirstMon + 1;
  if (daysUntilFirstMon === 0) monDay = 1;
  while (monDay <= daysInMonth) {
    const sunDay = Math.min(monDay + 6, daysInMonth);
    weeks.push({
      num: weekNum,
      name: `${weekLabel} ${weekNum}`,
      start: monDay,
      end: sunDay,
      cls: `week-header-${Math.min(weekNum, 5)}`
    });
    weekNum++;
    monDay = sunDay + 1;
  }
  return weeks;
}

function renderRoutineMatrixTable(year, month, daysInMonth, habits, checksMap) {
  const table = document.getElementById("routineMatrixTable");
  if (!table) return;
  const scrollContainer = table.closest(".table-scroll-container");

  // Calculate real Mon-Sun weeks for this month
  const weeks = getRoutineMonthWeeks(year, month, daysInMonth);

  const isEn = App.I18n && typeof App.I18n.getCurrentLanguage === "function" && App.I18n.getCurrentLanguage() === "en";
  const locale = App.I18n && typeof App.I18n.getLocale === "function" ? App.I18n.getLocale() : "es-ES";
  const routinesHeader = isEn ? "DAILY HABITS & ROUTINES" : "RUTINAS Y HÁBITOS";
  const goalHeader = isEn ? "GOAL" : "OBJETIVO";
  const goalTitle = isEn ? "Target days per month" : "Días objetivo al mes";

  let headerHtml = `
    <thead>
      <tr>
        <th class="routine-name-td">${routinesHeader}</th>
        <th class="goal-td" title="${goalTitle}">${goalHeader}</th>
  `;

  weeks.forEach(w => {
    const colSpan = w.end - w.start + 1;
    headerHtml += `<th colspan="${colSpan}" class="${w.cls}">${w.name}</th>`;
  });
  headerHtml += `</tr><tr><th class="routine-name-td"></th><th class="goal-td"></th>`;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month - 1, d);
    const dayName = dateObj.toLocaleDateString(locale, { weekday: "short" }).toUpperCase();
    headerHtml += `<th class="day-th">${dayName}<br><span style="font-size:0.85rem; color:var(--ink);">${d}</span></th>`;
  }
  headerHtml += `</tr></thead>`;

  let bodyHtml = `<tbody>`;

  if (habits.length === 0) {
    const emptyMsg = isEn 
      ? "No habits defined. Click <strong>+ Add Habit</strong> to get started." 
      : "No hay hábitos definidos. Pulsa <strong>+ Añadir Hábito</strong> para comenzar.";
    bodyHtml += `<tr><td colspan="${daysInMonth + 2}" style="padding: 30px; color: var(--muted);">${emptyMsg}</td></tr>`;
  } else {
    habits.forEach(h => {
      const goal = Math.min(daysInMonth, Math.max(1, Number(h.goal) || daysInMonth));
      bodyHtml += `
        <tr>
          <td class="routine-name-td">
            <div class="routine-name-inner">
              <span class="habit-title-text" title="${App.Utils.escapeHtml(h.name)}">
                <span>${App.Utils.escapeHtml(h.emoji || '⭐')}</span>
                <span>${App.Utils.escapeHtml(h.name)}</span>
              </span>
              <span class="habit-edit-icon" data-habit-id="${App.Utils.escapeHtml(h.id)}" title="${isEn ? "Edit habit" : "Editar hábito"}">✏️</span>
            </div>
          </td>
          <td class="goal-td" title="${isEn ? "Change target days" : "Cambiar días objetivo"}">
            <input type="number"
                   class="goal-inline-input"
                   min="1"
                   max="31"
                   value="${goal}"
                   data-habit-id="${App.Utils.escapeHtml(h.id)}"
                   
            />
          </td>
      `;

      for (let d = 1; d <= daysInMonth; d++) {
        let weekIdx = weeks.findIndex(w => d >= w.start && d <= w.end);
        const weekNum = weekIdx >= 0 ? Math.min(weeks[weekIdx].num, 5) : 1;

        const isChecked = !!(checksMap[h.id] && checksMap[h.id][d]);
        bodyHtml += `
          <td class="check-td">
            <input type="checkbox"
                   class="routine-checkbox week-${weekNum}"
                   ${isChecked ? "checked" : ""}
                   data-habit-id="${App.Utils.escapeHtml(h.id)}"
                   data-day="${d}"
            />
          </td>
        `;
      }
      bodyHtml += `</tr>`;
    });
  }

  bodyHtml += `</tbody>`;
  table.innerHTML = headerHtml + bodyHtml;

  if (scrollContainer) {
    requestAnimationFrame(() => {
      scrollContainer.scrollLeft = Math.max(0, Number(App.State.state.routineTracker?.matrixScrollLeft) || 0);
    });
  }
}

function toggleHabitCheck(habitId, dayNum) {
  if (!App.State.state.routineTracker) {
    App.State.state.routineTracker = { habits: getDefaultRoutineHabits(), monthlyChecks: {}, matrixScrollLeft: 0 };
  }
  if (!App.State.state.routineTracker.monthlyChecks) {
    App.State.state.routineTracker.monthlyChecks = {};
  }
  if (!App.State.state.routineTracker.monthlyChecks[App.State.routineActiveMonth]) {
    App.State.state.routineTracker.monthlyChecks[App.State.routineActiveMonth] = {};
  }
  if (!App.State.state.routineTracker.monthlyChecks[App.State.routineActiveMonth][habitId]) {
    App.State.state.routineTracker.monthlyChecks[App.State.routineActiveMonth][habitId] = {};
  }

  const current = !!App.State.state.routineTracker.monthlyChecks[App.State.routineActiveMonth][habitId][dayNum];
  const newState = !current;
  App.State.state.routineTracker.monthlyChecks[App.State.routineActiveMonth][habitId][dayNum] = newState;

  if (newState && App.Sound && typeof App.Sound.playClick === "function") {
    App.Sound.playClick();
  }

  const habit = (App.State.state.routineTracker.habits || []).find(h => h.id === habitId);
  const habitName = habit ? habit.name : "Hábito";
  App.Main.recordLastUpdate({
    source: "tracker",
    target: habitName,
    type: "habit"
  });

  App.Storage.saveState();
  renderRoutineTracker();
}

function updateHabitGoalInline(habitId, newGoalValue) {
  const val = Math.max(1, Math.min(31, Number(newGoalValue) || 30));
  if (!App.State.state.routineTracker || !Array.isArray(App.State.state.routineTracker.habits)) return;
  const habit = App.State.state.routineTracker.habits.find(h => h.id === habitId);
  if (habit) {
    habit.goal = val;
    App.Main.recordLastUpdate({
      source: "tracker",
      target: habit.name,
      type: "habit"
    });
    App.Storage.saveState();
    renderRoutineTracker();
    App.Utils.showToast(`Objetivo de "${habit.name}" actualizado a ${val} días`);
  }
}

function renderRoutineWeeklyAnalysis(year, month, daysInMonth, totalHabits, donePerDay) {
  const barsContainer = document.getElementById("dailyBarsContainer");
  const statsSummary = document.getElementById("weeklyStatsSummary");
  if (!barsContainer || !statsSummary) return;

  const weeks = getRoutineMonthWeeks(year, month, daysInMonth);
  const isEn = App.I18n && typeof App.I18n.getCurrentLanguage === "function" && App.I18n.getCurrentLanguage() === "en";
  const locale = App.I18n && typeof App.I18n.getLocale === "function" ? App.I18n.getLocale() : "es-ES";

  let barsHtml = "";
  for (let d = 1; d <= daysInMonth; d++) {
    const weekIdx = weeks.findIndex(w => d >= w.start && d <= w.end);
    const weekNum = weekIdx >= 0 ? Math.min(weeks[weekIdx].num, 5) : 1;

    const count = donePerDay[d] || 0;
    const heightPct = totalHabits > 0 ? (count / totalHabits) * 100 : 0;

    const dateObj = new Date(year, month - 1, d);
    const dayName = dateObj.toLocaleDateString(locale, { weekday: "short" });

    barsHtml += `
      <div class="bar-column" title="${dayName} ${d} (${isEn ? "Week" : "Semana"} ${weekNum}): ${count}/${totalHabits} ${isEn ? "habits" : "hábitos"}">
        <div class="bar-fill week-${weekNum}" style="height: ${Math.max(2, heightPct)}%;"></div>
      </div>
    `;
  }
  barsContainer.innerHTML = barsHtml;

  let cardsHtml = `<div class="weekly-progress-grid">`;
  weeks.forEach(w => {
    let weekDone = 0;
    const daysInWeek = w.end - w.start + 1;
    const weekGoal = daysInWeek * totalHabits;

    for (let d = w.start; d <= w.end; d++) {
      weekDone += (donePerDay[d] || 0);
    }

    const pct = weekGoal > 0 ? Math.round((weekDone / weekGoal) * 100) : 0;

    const weekLabel = (App.I18n && typeof App.I18n.t === "function") ? App.I18n.t("tracker.weekLabel", "SEMANA") : "SEMANA";
    cardsHtml += `
      <div class="weekly-card">
        <div class="weekly-card-title">
          <span>${weekLabel} ${w.num}</span>
          <span style="color:var(--accent-dark);">${pct}%</span>
        </div>
        <div class="weekly-card-val">${weekDone}/${weekGoal}</div>
        <div class="weekly-card-bar">
          <div class="weekly-card-fill week-${Math.min(w.num, 5)}" style="width: ${pct}%;"></div>
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
  if (subEl) subEl.textContent = (App.I18n && typeof App.I18n.t === "function") 
    ? App.I18n.t("tracker.completedOf", { c: grandDone, t: grandGoal }) 
    : `${grandDone} de ${grandGoal} completados`;

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
    const isEn = App.I18n && typeof App.I18n.getCurrentLanguage === "function" && App.I18n.getCurrentLanguage() === "en";
    habits.forEach(h => {
      const goal = Math.min(daysInMonth, Math.max(1, Number(h.goal) || daysInMonth));
      const done = donePerHabit[h.id] || 0;
      const pct = goal > 0 ? Math.min(100, Math.round((done / goal) * 100)) : 0;

      listHtml += `
        <div class="habit-overview-item">
          <span class="habit-info-name">
            <span>${App.Utils.escapeHtml(h.emoji || '⭐')}</span>
            <span>${App.Utils.escapeHtml(h.name)}</span>
          </span>
          <div class="habit-info-stats">
            <span class="habit-stat-badge" title="${isEn ? "Logged / monthly target" : "Registros / objetivo mensual"}">${done} / ${goal}</span>
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

  const isEn = App.I18n && typeof App.I18n.getCurrentLanguage === "function" && App.I18n.getCurrentLanguage() === "en";

  const sorted = habits.map(h => {
    const goal = Math.min(daysInMonth, Math.max(1, Number(h.goal) || daysInMonth));
    const done = donePerHabit[h.id] || 0;
    const pct = goal > 0 ? Math.min(100, (done / goal) * 100) : 0;
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
          <span class="ranking-name">${App.Utils.escapeHtml(h.emoji || "⭐")} ${App.Utils.escapeHtml(h.name)}</span>
        </div>
        <span class="ranking-pct-pill" title="${h.done} ${isEn ? "logged of" : "registros de"} ${h.goal} ${isEn ? "target days" : "días objetivo"}">${h.done}/${h.goal} · ${h.pct.toFixed(0)}%</span>
      </div>
    `;
  });
  rankingList.innerHTML = html;
}

function hasMonthHabitChecks(mKey) {
  if (!mKey || typeof mKey !== "string") return false;
  const parts = mKey.split("-").map(Number);
  const key1 = mKey;
  const key2 = parts.length === 2 ? `${parts[0]}-${parts[1]}` : mKey;
  const key3 = parts.length === 2 ? `${parts[0]}-${String(parts[1]).padStart(2, "0")}` : mKey;
  
  const allMonthly = App.State.state.routineTracker?.monthlyChecks || {};
  const checks = allMonthly[key1] || allMonthly[key2] || allMonthly[key3];
  if (!checks || typeof checks !== "object") return false;
  return Object.values(checks).some(habitDays => 
    habitDays && typeof habitDays === "object" && Object.values(habitDays).some(val => !!val)
  );
}

function getRoutineMonthStats(mKey, habits) {
  if (!mKey || typeof mKey !== "string" || !mKey.includes("-")) return null;
  const parts = mKey.split("-").map(Number);
  const y = parts[0] || 2026;
  const m = parts[1] || 1;
  const daysInMonth = new Date(y, m, 0).getDate();
  const unpaddedKey = `${y}-${m}`;
  const paddedKey = `${y}-${String(m).padStart(2, "0")}`;
  const checksMap = (App.State.state.routineTracker?.monthlyChecks && (
    App.State.state.routineTracker.monthlyChecks[mKey] ||
    App.State.state.routineTracker.monthlyChecks[unpaddedKey] ||
    App.State.state.routineTracker.monthlyChecks[paddedKey]
  )) || {};

  let grandDone = 0;
  let grandGoal = 0;
  const activeDaysSet = new Set();
  const donePerDay = {};
  for (let d = 1; d <= daysInMonth; d++) donePerDay[d] = 0;

  const habitPerformances = [];

  habits.forEach(h => {
    let done = 0;
    const hChecks = checksMap[h.id] || {};
    for (let d = 1; d <= daysInMonth; d++) {
      if (hChecks[d]) {
        done++;
        activeDaysSet.add(d);
        donePerDay[d]++;
      }
    }
    const goal = Math.min(daysInMonth, Math.max(1, Number(h.goal) || daysInMonth));
    grandDone += done;
    grandGoal += goal;
    const pct = goal > 0 ? Math.min(100, (done / goal) * 100) : 0;
    habitPerformances.push({ habit: h, done, goal, pct });
  });

  const globalPct = grandGoal > 0 ? Math.min(100, (grandDone / grandGoal) * 100) : 0;
  habitPerformances.sort((a, b) => b.pct - a.pct || b.done - a.done);

  // Mejor día del mes
  let bestDayNum = null;
  let maxDoneInDay = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    if (donePerDay[d] > maxDoneInDay) {
      maxDoneInDay = donePerDay[d];
      bestDayNum = d;
    }
  }

  // Hábitos con 100% de cumplimiento
  const completedHabitsCount = habitPerformances.filter(h => h.done >= h.goal).length;

  return {
    monthKey: mKey,
    title: formatMonthKeyTitle(mKey),
    year: y,
    month: m,
    daysInMonth,
    grandDone,
    grandGoal,
    globalPct,
    activeDays: activeDaysSet.size,
    topHabit: habitPerformances.length > 0 && habitPerformances[0].done > 0 ? habitPerformances[0] : null,
    topHabits: habitPerformances.filter(h => h.done > 0).slice(0, 3),
    bestDay: bestDayNum ? { day: bestDayNum, count: maxDoneInDay } : null,
    completedHabitsCount,
    hasData: grandDone > 0
  };
}

function getMonthsWithDataList(activeKey) {
  const allMonthly = App.State.state.routineTracker?.monthlyChecks || {};
  const monthsSet = new Set();

  // Escanear todas las claves existentes en monthlyChecks que tengan datos reales
  Object.keys(allMonthly).forEach(key => {
    if (hasMonthHabitChecks(key)) {
      const parts = key.split("-").map(Number);
      if (parts.length === 2) {
        monthsSet.add(`${parts[0]}-${String(parts[1]).padStart(2, "0")}`);
      } else {
        monthsSet.add(key);
      }
    }
  });

  // También verificar meses relativos (tanto anteriores como posteriores) dentro de un rango de 2 años
  for (let i = -12; i <= 12; i++) {
    if (i === 0) continue;
    const candidate = shiftMonthKey(activeKey, i);
    if (hasMonthHabitChecks(candidate)) {
      monthsSet.add(candidate);
    }
  }

  // Quitar el mes que actualmente se está mostrando arriba en la matriz activa
  const activeParts = (activeKey || "").split("-").map(Number);
  const activeNorm = activeParts.length === 2 ? `${activeParts[0]}-${String(activeParts[1]).padStart(2, "0")}` : activeKey;
  monthsSet.delete(activeNorm);
  monthsSet.delete(activeKey);

  // Orden cronológico (de más antiguo a más reciente)
  return Array.from(monthsSet).sort();
}

function getPreviousMonthsList(activeKey, maxMonths = 12) {
  return getMonthsWithDataList(activeKey);
}

function updateHistoryArrowStates() {
  const scrollContainer = document.getElementById("routineHistoryScrollContainer");
  const prevBtn = document.getElementById("historySidePrevBtn");
  const nextBtn = document.getElementById("historySideNextBtn");
  if (!scrollContainer || !prevBtn || !nextBtn) return;

  const hasScroll = scrollContainer.scrollWidth > scrollContainer.clientWidth + 4;
  if (!hasScroll) {
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    prevBtn.style.visibility = "hidden";
    nextBtn.style.visibility = "hidden";
    return;
  }
  prevBtn.style.visibility = "visible";
  nextBtn.style.visibility = "visible";

  const atStart = scrollContainer.scrollLeft <= 3;
  const atEnd = scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth - 4;
  prevBtn.disabled = atStart;
  nextBtn.disabled = atEnd;
}

function renderRoutineHistory(habits) {
  const container = document.getElementById("routineHistoryGrid");
  const historyCard = document.getElementById("routineHistoryCard");
  const scrollContainer = document.getElementById("routineHistoryScrollContainer");
  const prevBtn = document.getElementById("historySidePrevBtn");
  const nextBtn = document.getElementById("historySideNextBtn");
  const restoreBtn = document.getElementById("historyRestoreBtn");
  if (!container) return;
  container.innerHTML = "";

  const hiddenMonths = Array.isArray(App.State.state.routineTracker?.hiddenHistoryMonths)
    ? App.State.state.routineTracker.hiddenHistoryMonths
    : [];
  const hiddenSet = new Set(hiddenMonths);

  const prevMonths = getMonthsWithDataList(App.State.routineActiveMonth);
  const visibleMonths = prevMonths.filter(m => !hiddenSet.has(m));
  const isEn = App.I18n && typeof App.I18n.getCurrentLanguage === "function" && App.I18n.getCurrentLanguage() === "en";

  // Si no hay información de meses anteriores que mostrar, ocultar toda la tarjeta de resumen
  if (!prevMonths || prevMonths.length === 0) {
    if (historyCard) historyCard.style.display = "none";
    if (prevBtn) prevBtn.style.visibility = "hidden";
    if (nextBtn) nextBtn.style.visibility = "hidden";
    return;
  }

  if (historyCard) historyCard.style.display = "";

  // Botón restaurar en cabecera
  if (restoreBtn) {
    if (hiddenSet.size > 0 && prevMonths.length > 0) {
      restoreBtn.style.display = "inline-flex";
      restoreBtn.textContent = isEn ? `Restore (${hiddenSet.size})` : `Restaurar (${hiddenSet.size})`;
      restoreBtn.onclick = () => {
        App.State.state.routineTracker.hiddenHistoryMonths = [];
        App.Storage.saveState();
        renderRoutineTracker();
        App.Utils.showToast(isEn ? "Hidden months restored." : "Meses ocultos restaurados.");
      };
    } else {
      restoreBtn.style.display = "none";
    }
  }

  if (visibleMonths.length === 0) {
    if (prevBtn) prevBtn.style.visibility = "hidden";
    if (nextBtn) nextBtn.style.visibility = "hidden";
    container.innerHTML = `
      <div class="history-empty-state">
        <span class="history-empty-icon">👁️</span>
        <div class="history-empty-text">
          <strong>${isEn ? "All previous months are hidden" : "Todos los meses anteriores están ocultos"}</strong>
          <span>${isEn ? "You have hidden all previous months from the summary. You can restore them to view them again." : "Has ocultado todos los meses previos del resumen. Puedes restablecerlos para volver a verlos."}</span>
          <div style="margin-top: 8px;">
            <button type="button" class="history-restore-btn" id="historyRestoreAllBtn">${isEn ? `Restore all months (${hiddenSet.size})` : `Restaurar todos los meses (${hiddenSet.size})`}</button>
          </div>
        </div>
      </div>
    `;
    const restoreAllBtn = document.getElementById("historyRestoreAllBtn");
    if (restoreAllBtn) {
      restoreAllBtn.onclick = () => {
        App.State.state.routineTracker.hiddenHistoryMonths = [];
        App.Storage.saveState();
        renderRoutineTracker();
        App.Utils.showToast(isEn ? "Hidden months restored." : "Meses ocultos restaurados.");
      };
    }
    return;
  }

  // Orden cronológico: de más antiguo a más reciente
  const sortedMonths = visibleMonths.slice();
  const visibleCount = sortedMonths.length;
  container.dataset.count = visibleCount === 1 ? "1" : (visibleCount === 2 ? "2" : "multi");

  // Si hay 1 o 2 tarjetas visibles, llenan todo el ancho y no se necesita scroll lateral
  if (visibleCount <= 2) {
    if (prevBtn) prevBtn.style.visibility = "hidden";
    if (nextBtn) nextBtn.style.visibility = "hidden";
  }

  sortedMonths.forEach(mKey => {
    const stats = getRoutineMonthStats(mKey, habits);
    const priorKey = shiftMonthKey(mKey, -1);
    const priorStats = getRoutineMonthStats(priorKey, habits);

    let trendHtml = "";
    if (stats.hasData && priorStats.hasData) {
      const diff = stats.globalPct - priorStats.globalPct;
      if (diff > 0.05) {
        trendHtml = `<span class="history-month-trend up" title="${isEn ? "Compared to previous month" : "Comparado con el mes anterior"}">↑ +${diff.toFixed(1)}%</span>`;
      } else if (diff < -0.05) {
        trendHtml = `<span class="history-month-trend down" title="${isEn ? "Compared to previous month" : "Comparado con el mes anterior"}">↓ ${diff.toFixed(1)}%</span>`;
      } else {
        trendHtml = `<span class="history-month-trend neutral" title="${isEn ? "Compared to previous month" : "Comparado con el mes anterior"}">= 0%</span>`;
      }
    } else if (stats.hasData && !priorStats.hasData) {
      trendHtml = `<span class="history-month-trend up" title="${isEn ? "Tracking started" : "Inicio de registro"}">${isEn ? "★ Active" : "★ Activo"}</span>`;
    } else {
      trendHtml = `<span class="history-month-trend neutral">—</span>`;
    }

    const pctFormatted = stats.globalPct.toFixed(1);
    const activeDaysPct = stats.daysInMonth > 0 ? Math.round((stats.activeDays / stats.daysInMonth) * 100) : 0;

    const card = document.createElement("div");
    card.className = "history-month-card";
    card.dataset.month = mKey;
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("title", isEn ? `Click to navigate to ${stats.title}` : `Haz clic para navegar a ${stats.title}`);

    const hideBtnHtml = `
      <button type="button" class="history-hide-btn" data-hide-month="${mKey}" title="${isEn ? `Hide ${stats.title} from summary` : `Ocultar ${stats.title} del resumen`}" aria-label="${isEn ? "Hide month" : "Ocultar mes"}">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    `;

    if (visibleCount === 1) {
      // 1 SOLO MES VISIBLE: Layout enriquecido a pantalla completa
      card.innerHTML = `
        <div class="history-month-header">
          <div class="history-header-left">
            <span class="history-month-title">${stats.title}</span>
            ${trendHtml}
          </div>
          <div class="history-header-right">
            ${hideBtnHtml}
          </div>
        </div>

        <div class="history-expanded-grid">
          <div class="history-expanded-left">
            <div class="history-month-main">
              <span class="history-month-pct">${pctFormatted}%</span>
              <span class="history-month-checks">${stats.grandDone} / ${stats.grandGoal} ${isEn ? "completed" : "completados"}</span>
            </div>
            <div class="history-month-bar-wrap">
              <div class="history-month-bar-fill" style="width: ${Math.min(100, Math.max(0, stats.globalPct))}%;"></div>
            </div>
            <div class="history-pills-row">
              <span class="history-kpi-pill">📅 <strong>${stats.activeDays}/${stats.daysInMonth} d</strong> ${isEn ? "active" : "activos"} (${activeDaysPct}%)</span>
              ${stats.bestDay ? `<span class="history-kpi-pill">⚡ ${isEn ? "Best day" : "Mejor día"}: <strong>${isEn ? "day" : "día"} ${stats.bestDay.day}</strong> (${stats.bestDay.count})</span>` : ""}
              ${stats.completedHabitsCount > 0 ? `<span class="history-kpi-pill">🏆 <strong>${stats.completedHabitsCount}</strong> ${isEn ? "at 100%" : "al 100%"}</span>` : ""}
            </div>
          </div>

          <div class="history-expanded-right">
            <span class="history-expanded-right-title">${isEn ? "Top Highlighted Habits" : "Hábitos más destacados"}</span>
            <div class="history-top-habits-list">
              ${stats.topHabits.length > 0 ? stats.topHabits.map((th, i) => `
                <div class="history-top-habit-item">
                  <span class="history-top-habit-name">
                    <span style="color:var(--muted); font-size:0.7rem;">#${i+1}</span> ${App.Utils.escapeHtml(th.habit.emoji || "⭐")} ${App.Utils.escapeHtml(th.habit.name)}
                  </span>
                  <div class="history-top-habit-right">
                    <div class="history-mini-bar">
                      <div class="history-mini-bar-fill" style="width: ${Math.min(100, th.pct)}%;"></div>
                    </div>
                    <span class="history-top-habit-pct">${th.pct.toFixed(0)}%</span>
                  </div>
                </div>
              `).join("") : `<span style="font-size:0.75rem; color:var(--muted)">${isEn ? "No completed habits this month" : "Sin hábitos completados en este mes"}</span>`}
            </div>
          </div>
        </div>
      `;
    } else if (visibleCount === 2) {
      // 2 MESES VISIBLES: Layout ampliado al 50% con top hábitos y mejores marcas
      card.innerHTML = `
        <div class="history-month-header">
          <div class="history-header-left">
            <span class="history-month-title">${stats.title}</span>
            ${trendHtml}
          </div>
          <div class="history-header-right">
            ${hideBtnHtml}
          </div>
        </div>

        <div class="history-month-main">
          <span class="history-month-pct">${pctFormatted}%</span>
          <span class="history-month-checks">${stats.grandDone} / ${stats.grandGoal}</span>
        </div>

        <div class="history-month-bar-wrap">
          <div class="history-month-bar-fill" style="width: ${Math.min(100, Math.max(0, stats.globalPct))}%;"></div>
        </div>

        <div class="history-month-meta">
          <div class="history-meta-row">
            <span class="history-meta-label">${isEn ? "Active days" : "Días activos"}</span>
            <span class="history-meta-value">${stats.activeDays}/${stats.daysInMonth} d (${activeDaysPct}%)</span>
          </div>
          ${stats.bestDay ? `
            <div class="history-meta-row">
              <span class="history-meta-label">${isEn ? "Best day" : "Mejor día"}</span>
              <span class="history-meta-value">${isEn ? "Day" : "Día"} ${stats.bestDay.day} (${stats.bestDay.count} ${isEn ? "habits" : "hábitos"})</span>
            </div>
          ` : ""}
          <div class="history-top-habits-list" style="margin-top:2px;">
            ${stats.topHabits.slice(0, 2).map((th, i) => `
              <div class="history-top-habit-item">
                <span class="history-top-habit-name">
                  ${App.Utils.escapeHtml(th.habit.emoji || "⭐")} ${App.Utils.escapeHtml(th.habit.name)}
                </span>
                <div class="history-top-habit-right">
                  <div class="history-mini-bar" style="width: 36px;">
                    <div class="history-mini-bar-fill" style="width: ${Math.min(100, th.pct)}%;"></div>
                  </div>
                  <span class="history-top-habit-pct">${th.pct.toFixed(0)}%</span>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    } else {
      // 3 O MÁS MESES: Modo carrusel compacto
      const topHabitDisplay = stats.topHabit 
        ? `${App.Utils.escapeHtml(stats.topHabit.habit.emoji || "⭐")} ${App.Utils.escapeHtml(stats.topHabit.habit.name)} (${stats.topHabit.pct.toFixed(0)}%)`
        : `<span style="color:var(--muted)">${isEn ? "No habits" : "Sin hábitos"}</span>`;

      card.innerHTML = `
        <div class="history-month-header">
          <div class="history-header-left">
            <span class="history-month-title">${stats.title}</span>
            ${trendHtml}
          </div>
          <div class="history-header-right">
            ${hideBtnHtml}
          </div>
        </div>

        <div class="history-month-main">
          <span class="history-month-pct">${pctFormatted}%</span>
          <span class="history-month-checks">${stats.grandDone} / ${stats.grandGoal}</span>
        </div>

        <div class="history-month-bar-wrap">
          <div class="history-month-bar-fill" style="width: ${Math.min(100, Math.max(0, stats.globalPct))}%;"></div>
        </div>

        <div class="history-month-meta">
          <div class="history-meta-row">
            <span class="history-meta-label">${isEn ? "Active days" : "Días activos"}</span>
            <span class="history-meta-value">${stats.activeDays} / ${stats.daysInMonth} d (${activeDaysPct}%)</span>
          </div>
          <div class="history-meta-row">
            <span class="history-meta-label">${isEn ? "Top habit" : "Top hábito"}</span>
            <span class="history-meta-value" title="${stats.topHabit ? App.Utils.escapeHtml(stats.topHabit.habit.name) : ''}">${topHabitDisplay}</span>
          </div>
        </div>
      `;
    }

    // Evento para el botón de ocultar
    const hideBtn = card.querySelector(`[data-hide-month="${mKey}"]`);
    if (hideBtn) {
      hideBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!Array.isArray(App.State.state.routineTracker.hiddenHistoryMonths)) {
          App.State.state.routineTracker.hiddenHistoryMonths = [];
        }
        if (!App.State.state.routineTracker.hiddenHistoryMonths.includes(mKey)) {
          App.State.state.routineTracker.hiddenHistoryMonths.push(mKey);
        }
        App.Storage.saveState();
        renderRoutineTracker();
        App.Utils.showToast(`Mes ${stats.title} ocultado del resumen.`);
      });
    }

    // Clic en la tarjeta para navegar a ese mes
    card.addEventListener("click", () => {
      App.State.routineActiveMonth = mKey;
      renderRoutineTracker();
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        App.State.routineActiveMonth = mKey;
        renderRoutineTracker();
      }
    });

    container.appendChild(card);
  });

  if (scrollContainer && visibleCount > 2) {
    requestAnimationFrame(() => {
      if (scrollContainer.dataset.lastActiveMonth !== App.State.routineActiveMonth) {
        scrollContainer.dataset.lastActiveMonth = App.State.routineActiveMonth;
        scrollContainer.scrollLeft = scrollContainer.scrollWidth;
      }
      updateHistoryArrowStates();
    });
  }
}

// --- Controladores y Renderizadores de Checklist (Tareas) ---

function handleHorizontalViewSwipe(event) {
  const horizontalDistance = event.deltaX;
  const verticalDistance = event.deltaY;
  const eventTarget = event.target;

  // Don't intercept swipe in horizontally scrollable sections (matrices, charts, history)
  if (eventTarget instanceof Element && (
    eventTarget.closest(".table-scroll-container") ||
    eventTarget.closest(".routine-history-card") ||
    eventTarget.closest(".chart-svg-container") ||
    eventTarget.closest(".routine-overview-grid")
  )) {
    horizontalViewSwipeDistance = 0;
    return;
  }

  const { threshold, cooldown } = getTrackpadSwipeSettings();
  const now = performance.now();
  if (now < horizontalViewSwipeLockedUntil) {
    // Consume residual momentum events to prevent browser horizontal bounce and double swipe
    if (event.cancelable) event.preventDefault();
    horizontalViewSwipeDistance = 0;
    return;
  }

  // If the gesture is predominantly vertical, don't accumulate horizontal swipe
  if (!horizontalDistance || Math.abs(verticalDistance) > Math.abs(horizontalDistance) * 1.4) {
    return;
  }

  horizontalViewSwipeDistance += horizontalDistance;
  if (event.cancelable) event.preventDefault();

  // Reset accumulated distance if the user pauses or stops moving fingers
  clearTimeout(horizontalViewSwipeResetTimer);
  horizontalViewSwipeResetTimer = setTimeout(() => {
    horizontalViewSwipeDistance = 0;
  }, 180);

  if (Math.abs(horizontalViewSwipeDistance) < threshold) return;

  const isProfile = App.Constants.tabProfile?.classList.contains("active");
  const isChecklist = App.Constants.tabChecklist?.classList.contains("active");
  const currentView = isProfile ? "profile" : (isChecklist ? "checklist" : "calendar");

  let nextView = currentView;
  let animDir = "forward";

  const isInverted = Boolean(App.State.state?.settings?.invertTrackpadSwipe);
  const effectiveDistance = isInverted ? -horizontalViewSwipeDistance : horizontalViewSwipeDistance;

  if (effectiveDistance < 0) {
    // Mover hacia la derecha (gesture left-to-right): circuito cerrado
    animDir = "back";
    if (currentView === "profile") nextView = "calendar";
    else if (currentView === "calendar") nextView = "checklist";
    else if (currentView === "checklist") nextView = "profile";
  } else {
    // Mover hacia la izquierda (gesture right-to-left): circuito cerrado inverso
    animDir = "forward";
    if (currentView === "profile") nextView = "checklist";
    else if (currentView === "checklist") nextView = "calendar";
    else if (currentView === "calendar") nextView = "profile";
  }

  horizontalViewSwipeDistance = 0;
  clearTimeout(horizontalViewSwipeResetTimer);

  if (nextView !== currentView) {
    horizontalViewSwipeLockedUntil = now + cooldown;
    animateViewTransition(animDir);
    switchView(nextView);
  }
}

let viewTransitionTimer = null;
function animateViewTransition(direction) {
  if (!App.Constants.workspaceEl) return;

  const el = App.Constants.workspaceEl;
  el.classList.remove("view-transition-forward", "view-transition-back");
  void el.offsetWidth;
  el.classList.add(direction === "forward" ? "view-transition-forward" : "view-transition-back");

  clearTimeout(viewTransitionTimer);
  viewTransitionTimer = setTimeout(() => {
    el.classList.remove("view-transition-forward", "view-transition-back");
  }, 240);
}

function switchView(viewName, targetSubTab) {
  if (viewName === "insights") {
    viewName = "profile";
    targetSubTab = targetSubTab || "stats";
  }

  try {
    localStorage.setItem("log_calendar_active_view", viewName);
  } catch (e) {}

  const isCalendar = viewName === "calendar";
  const isChecklist = viewName === "checklist";
  const isProfile = viewName === "profile";

  if (App.Constants.tabCalendar) {
    App.Constants.tabCalendar.classList.toggle("active", isCalendar);
    App.Constants.tabCalendar.setAttribute("aria-selected", isCalendar ? "true" : "false");
  }
  if (App.Constants.tabChecklist) {
    App.Constants.tabChecklist.classList.toggle("active", isChecklist);
    App.Constants.tabChecklist.setAttribute("aria-selected", isChecklist ? "true" : "false");
  }
  if (App.Constants.tabProfile) {
    App.Constants.tabProfile.classList.toggle("active", isProfile);
    App.Constants.tabProfile.setAttribute("aria-selected", isProfile ? "true" : "false");
  }

  if (viewName === "calendar") {
    if (App.Constants.paneCalendar) App.Constants.paneCalendar.hidden = false;
    if (App.Constants.paneCalendarDayDetails) App.Constants.paneCalendarDayDetails.hidden = false;
    if (App.Constants.paneChecklistSelectedDay) App.Constants.paneChecklistSelectedDay.hidden = true;
    if (App.Constants.paneChecklistMain) App.Constants.paneChecklistMain.hidden = true;
    if (App.Constants.paneInsightsMain) App.Constants.paneInsightsMain.hidden = true;
    if (App.Constants.paneProfileMain) App.Constants.paneProfileMain.hidden = true;
    
    if (App.Constants.workspaceEl) {
      App.Constants.workspaceEl.classList.remove("checklist-active", "insights-active", "profile-active");
    }
    animateViewTransition("back");
    App.Calendar.renderCalendar();
  } else if (viewName === "checklist") {
    if (App.Constants.paneCalendar) App.Constants.paneCalendar.hidden = true;
    if (App.Constants.paneCalendarDayDetails) App.Constants.paneCalendarDayDetails.hidden = true;
    if (App.Constants.paneChecklistSelectedDay) App.Constants.paneChecklistSelectedDay.hidden = true;
    if (App.Constants.paneChecklistMain) App.Constants.paneChecklistMain.hidden = false;
    if (App.Constants.paneInsightsMain) App.Constants.paneInsightsMain.hidden = true;
    if (App.Constants.paneProfileMain) App.Constants.paneProfileMain.hidden = true;
    
    if (App.Constants.workspaceEl) {
      App.Constants.workspaceEl.classList.add("checklist-active");
      App.Constants.workspaceEl.classList.remove("insights-active", "profile-active");
    }
    animateViewTransition("forward");
    
    renderRoutineTracker();
  } else if (viewName === "profile") {
    if (App.Constants.paneCalendar) App.Constants.paneCalendar.hidden = true;
    if (App.Constants.paneCalendarDayDetails) App.Constants.paneCalendarDayDetails.hidden = true;
    if (App.Constants.paneChecklistSelectedDay) App.Constants.paneChecklistSelectedDay.hidden = true;
    if (App.Constants.paneChecklistMain) App.Constants.paneChecklistMain.hidden = true;
    if (App.Constants.paneInsightsMain) App.Constants.paneInsightsMain.hidden = true;
    if (App.Constants.paneProfileMain) App.Constants.paneProfileMain.hidden = false;
    
    if (App.Constants.workspaceEl) {
      App.Constants.workspaceEl.classList.remove("checklist-active", "insights-active");
      App.Constants.workspaceEl.classList.add("profile-active");
    }
    animateViewTransition("forward");

    if (App.Settings && typeof App.Settings.renderProfileDashboard === "function") {
      App.Settings.renderProfileDashboard(targetSubTab);
    }
  }
}

  Object.defineProperties(window.App.Tracker, {
    getDefaultRoutineHabits: { get: () => getDefaultRoutineHabits, set: (v) => getDefaultRoutineHabits = v, enumerable: true },
    renderTrackInputs: { get: () => renderTrackInputs, set: (v) => renderTrackInputs = v, enumerable: true },
    addTrackClasses: { get: () => addTrackClasses, set: (v) => addTrackClasses = v, enumerable: true },
    openTrackEntry: { get: () => openTrackEntry, set: (v) => openTrackEntry = v, enumerable: true },
    closeTrackEntry: { get: () => closeTrackEntry, set: (v) => closeTrackEntry = v, enumerable: true },
    addTrackFromSettings: { get: () => addTrackFromSettings, set: (v) => addTrackFromSettings = v, enumerable: true },
    handleTrackSettingsClick: { get: () => handleTrackSettingsClick, set: (v) => handleTrackSettingsClick = v, enumerable: true },
    getTrackTotal: { get: () => getTrackTotal, set: (v) => getTrackTotal = v, enumerable: true },
    countActiveTrackDays: { get: () => countActiveTrackDays, set: (v) => countActiveTrackDays = v, enumerable: true },
    initRoutineTrackerEvents: { get: () => initRoutineTrackerEvents, set: (v) => initRoutineTrackerEvents = v, enumerable: true },
    openHabitModal: { get: () => openHabitModal, set: (v) => openHabitModal = v, enumerable: true },
    closeHabitModal: { get: () => closeHabitModal, set: (v) => closeHabitModal = v, enumerable: true },
    shiftMonthKey: { get: () => shiftMonthKey, set: (v) => shiftMonthKey = v, enumerable: true },
    formatMonthKeyTitle: { get: () => formatMonthKeyTitle, set: (v) => formatMonthKeyTitle = v, enumerable: true },
    renderRoutineTracker: { get: () => renderRoutineTracker, set: (v) => renderRoutineTracker = v, enumerable: true },
    renderRoutineTrendChart: { get: () => renderRoutineTrendChart, set: (v) => renderRoutineTrendChart = v, enumerable: true },
    getRoutineMonthWeeks: { get: () => getRoutineMonthWeeks, set: (v) => getRoutineMonthWeeks = v, enumerable: true },
    renderRoutineMatrixTable: { get: () => renderRoutineMatrixTable, set: (v) => renderRoutineMatrixTable = v, enumerable: true },
    toggleHabitCheck: { get: () => toggleHabitCheck, set: (v) => toggleHabitCheck = v, enumerable: true },
    updateHabitGoalInline: { get: () => updateHabitGoalInline, set: (v) => updateHabitGoalInline = v, enumerable: true },
    renderRoutineWeeklyAnalysis: { get: () => renderRoutineWeeklyAnalysis, set: (v) => renderRoutineWeeklyAnalysis = v, enumerable: true },
    renderRoutineOverview: { get: () => renderRoutineOverview, set: (v) => renderRoutineOverview = v, enumerable: true },
    renderRoutineRanking: { get: () => renderRoutineRanking, set: (v) => renderRoutineRanking = v, enumerable: true },
    hasMonthHabitChecks: { get: () => hasMonthHabitChecks, set: (v) => hasMonthHabitChecks = v, enumerable: true },
    getRoutineMonthStats: { get: () => getRoutineMonthStats, set: (v) => getRoutineMonthStats = v, enumerable: true },
    getMonthsWithDataList: { get: () => getMonthsWithDataList, set: (v) => getMonthsWithDataList = v, enumerable: true },
    getPreviousMonthsList: { get: () => getPreviousMonthsList, set: (v) => getPreviousMonthsList = v, enumerable: true },
    updateHistoryArrowStates: { get: () => updateHistoryArrowStates, set: (v) => updateHistoryArrowStates = v, enumerable: true },
    renderRoutineHistory: { get: () => renderRoutineHistory, set: (v) => renderRoutineHistory = v, enumerable: true },
    handleHorizontalViewSwipe: { get: () => handleHorizontalViewSwipe, set: (v) => handleHorizontalViewSwipe = v, enumerable: true },
    animateViewTransition: { get: () => animateViewTransition, set: (v) => animateViewTransition = v, enumerable: true },
    switchView: { get: () => switchView, set: (v) => switchView = v, enumerable: true }
  });
})();
