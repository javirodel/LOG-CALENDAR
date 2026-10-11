(() => {
  window.App = window.App || {};
  window.App.Periods = window.App.Periods || {};



function openPeriodEntry(targetPeriod = null) {
  if (!App.Constants.periodEntryModalEl) return;
  
  if (App.Constants.periodSubjectsCheckboxesEl) {
    App.Constants.periodSubjectsCheckboxesEl.innerHTML = "";
    if (App.State.subjects.length === 0) {
      App.Constants.periodSubjectsCheckboxesEl.textContent = App.I18n?.text("Crea primero alguna asignatura.", "Create a subject first.");
    } else {
      for (const subject of App.State.subjects) {
        const wrap = document.createElement("label");
        wrap.style.display = "flex";
        wrap.style.alignItems = "center";
        wrap.style.gap = "8px";
        wrap.style.fontSize = "0.84rem";
        wrap.style.fontWeight = "bold";
        wrap.style.cursor = "pointer";
        wrap.innerHTML = `
          <input type="checkbox" value="${App.Utils.escapeHtml(subject.name)}" data-period-subject style="width:16px; height:16px; cursor:pointer;">
          <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${App.Utils.escapeHtml(subject.color)};"></span>
          <span>${App.Utils.escapeHtml(subject.name)}</span>
        `;
        App.Constants.periodSubjectsCheckboxesEl.appendChild(wrap);
      }
    }
  }

  if (App.Constants.periodTracksCheckboxesEl) {
    App.Constants.periodTracksCheckboxesEl.innerHTML = "";
    if (App.State.EXTRA_TRACKS.length === 0) {
      App.Constants.periodTracksCheckboxesEl.textContent = App.I18n?.text("No hay hobbies creados.", "No hobbies have been created.");
    } else {
      for (const track of App.State.EXTRA_TRACKS) {
        const wrap = document.createElement("label");
        wrap.style.display = "flex";
        wrap.style.alignItems = "center";
        wrap.style.gap = "8px";
        wrap.style.fontSize = "0.84rem";
        wrap.style.fontWeight = "bold";
        wrap.style.cursor = "pointer";
        wrap.innerHTML = `
          <input type="checkbox" value="${App.Utils.escapeHtml(track.key)}" data-period-track style="width:16px; height:16px; cursor:pointer;">
          <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${App.Utils.escapeHtml(track.color)};"></span>
          <span>${App.Utils.escapeHtml(track.label)}</span>
        `;
        App.Constants.periodTracksCheckboxesEl.appendChild(wrap);
      }
    }
  }

  if (targetPeriod) {
    App.State.editingPeriodTarget = targetPeriod.id;
    App.Constants.periodEntryTitleEl.textContent = App.I18n?.text("Editar curso académico", "Edit academic term");
    App.Constants.newPeriodNameEl.value = targetPeriod.name;
    App.Constants.newPeriodStartEl.value = targetPeriod.startDate;
    App.Constants.newPeriodEndEl.value = targetPeriod.endDate;
    
    if (App.Constants.periodSubjectsCheckboxesEl) {
      for (const checkbox of App.Constants.periodSubjectsCheckboxesEl.querySelectorAll("input[data-period-subject]")) {
        checkbox.checked = targetPeriod.subjects.includes(checkbox.value);
      }
    }
    if (App.Constants.periodTracksCheckboxesEl) {
      const pTracks = targetPeriod.tracks || App.State.EXTRA_TRACKS.map(t => t.key);
      for (const checkbox of App.Constants.periodTracksCheckboxesEl.querySelectorAll("input[data-period-track]")) {
        checkbox.checked = pTracks.includes(checkbox.value);
      }
    }
    App.Constants.periodSettingsFormEl.querySelector('button[type="submit"]').textContent = App.I18n?.text("Guardar cambios", "Save changes");
  } else {
    App.State.editingPeriodTarget = null;
    App.Constants.periodEntryTitleEl.textContent = App.I18n?.text("Añadir curso académico", "Add academic term");
    if (App.Constants.periodSettingsFormEl) App.Constants.periodSettingsFormEl.reset();
    App.Constants.newPeriodNameEl.value = "";
    App.Constants.newPeriodStartEl.value = App.Utils.getTodayDateKey();
    App.Constants.newPeriodEndEl.value = App.Utils.getTodayDateKey();
    
    if (App.Constants.periodSubjectsCheckboxesEl) {
      for (const checkbox of App.Constants.periodSubjectsCheckboxesEl.querySelectorAll("input[data-period-subject]")) {
        checkbox.checked = false;
      }
    }
    if (App.Constants.periodTracksCheckboxesEl) {
      for (const checkbox of App.Constants.periodTracksCheckboxesEl.querySelectorAll("input[data-period-track]")) {
        checkbox.checked = true; // Por defecto los hobbies activos en todos los cursos
      }
    }
    App.Constants.periodSettingsFormEl.querySelector('button[type="submit"]').textContent = App.I18n?.text("Añadir curso / periodo", "Add term / period");
  }

  App.Constants.periodEntryModalEl.hidden = false;
  App.Constants.newPeriodNameEl.focus();
}

function closePeriodEntry() {
  if (App.Constants.periodEntryModalEl) App.Constants.periodEntryModalEl.hidden = true;
  App.State.editingPeriodTarget = null;
}

function saveAcademicPeriod(event) {
  event.preventDefault();
  
  const name = App.Constants.newPeriodNameEl.value.trim();
  const start = App.Constants.newPeriodStartEl.value;
  const end = App.Constants.newPeriodEndEl.value;
  
  if (start > end) {
    alert(App.I18n?.text("La fecha de inicio no puede ser posterior a la de fin.", "The start date cannot be later than the end date."));
    return;
  }
  
  const selectedSubjects = [];
  if (App.Constants.periodSubjectsCheckboxesEl) {
    for (const checkbox of App.Constants.periodSubjectsCheckboxesEl.querySelectorAll("input[data-period-subject]")) {
      if (checkbox.checked) {
        selectedSubjects.push(checkbox.value);
      }
    }
  }

  const selectedTracks = [];
  if (App.Constants.periodTracksCheckboxesEl) {
    for (const checkbox of App.Constants.periodTracksCheckboxesEl.querySelectorAll("input[data-period-track]")) {
      if (checkbox.checked) {
        selectedTracks.push(checkbox.value);
      }
    }
  }
  
  if (App.State.editingPeriodTarget) {
    const period = App.State.state.settings.academicPeriods.find(p => p.id === App.State.editingPeriodTarget);
    if (period) {
      period.name = name;
      period.startDate = start;
      period.endDate = end;
      period.subjects = selectedSubjects;
      period.tracks = selectedTracks;
    }
  } else {
    if (!App.State.state.settings.academicPeriods) App.State.state.settings.academicPeriods = [];
    App.State.state.settings.academicPeriods.push({
      id: `period_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      startDate: start,
      endDate: end,
      subjects: selectedSubjects,
      tracks: selectedTracks
    });
  }
  
  closePeriodEntry();
  App.Settings.refreshAfterConfigChange(App.I18n?.text("Curso académico guardado.", "Academic term saved."));
  populateStatsPeriodSelect();
}

function handlePeriodSettingsClick(event) {
  const editBtn = event.target.closest("[data-edit-period]");
  if (editBtn) {
    const id = editBtn.dataset.editPeriod;
    const period = App.State.academicPeriods.find(p => p.id === id);
    if (!period) return;
    openPeriodEntry(period);
    return;
  }

  const deleteBtn = event.target.closest("[data-delete-period]");
  if (!deleteBtn) return;
  const id = deleteBtn.dataset.deletePeriod;
  const period = App.State.academicPeriods.find(p => p.id === id);
  if (!period) return;
  
  const ok = confirm(App.I18n?.text(
    `¿Estás seguro de que quieres eliminar el curso académico "${period.name}"? Los datos de estudio y asignaturas no se borrarán.`,
    `Are you sure you want to delete the academic term "${period.name}"? Study data and subjects will not be deleted.`
  ));
  if (!ok) return;
  
  App.State.state.settings.academicPeriods = App.State.state.settings.academicPeriods.filter(p => p.id !== id);
  
  if (App.State.selectedStatsPeriodId === id) {
    App.State.selectedStatsPeriodId = "all";
    if (App.Constants.statsPeriodSelectEl) App.Constants.statsPeriodSelectEl.value = "all";
  }
  
  App.Settings.refreshAfterConfigChange(App.I18n?.text("Curso académico eliminado.", "Academic term deleted."));
  populateStatsPeriodSelect();
}

function populateStatsPeriodSelect() {
  if (!App.Constants.statsPeriodSelectEl) return;
  const currentValue = App.Constants.statsPeriodSelectEl.value;
  App.Constants.statsPeriodSelectEl.innerHTML = `<option value="all">${App.I18n?.t("stats.allHistory") || "Todo el historial"}</option>`;
  
  for (const period of App.State.academicPeriods) {
    const opt = document.createElement("option");
    opt.value = period.id;
    opt.textContent = period.name;
    App.Constants.statsPeriodSelectEl.appendChild(opt);
  }
  
  if (Array.from(App.Constants.statsPeriodSelectEl.options).some(o => o.value === currentValue)) {
    App.Constants.statsPeriodSelectEl.value = currentValue;
  } else {
    App.Constants.statsPeriodSelectEl.value = "all";
    App.State.selectedStatsPeriodId = "all";
  }
}

  Object.defineProperties(window.App.Periods, {
    openPeriodEntry: { get: () => openPeriodEntry, set: (v) => openPeriodEntry = v, enumerable: true },
    closePeriodEntry: { get: () => closePeriodEntry, set: (v) => closePeriodEntry = v, enumerable: true },
    saveAcademicPeriod: { get: () => saveAcademicPeriod, set: (v) => saveAcademicPeriod = v, enumerable: true },
    handlePeriodSettingsClick: { get: () => handlePeriodSettingsClick, set: (v) => handlePeriodSettingsClick = v, enumerable: true },
    populateStatsPeriodSelect: { get: () => populateStatsPeriodSelect, set: (v) => populateStatsPeriodSelect = v, enumerable: true }
  });
})();
