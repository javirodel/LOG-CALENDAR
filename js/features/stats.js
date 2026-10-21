(() => {
  window.App = window.App || {};
  window.App.Stats = window.App.Stats || {};



function scheduleStatsRender() {
  clearTimeout(App.State.statsRenderTimer);
  statsRenderTimer = setTimeout(renderStats, 300);
}

function renderStats() {
  const { currentPeriod, isVacation, activeSubjects, activeTracks } = getActiveStatsContext();
  const keys = getStatsRangeKeys();
  

  const totalsBySubject = Object.fromEntries(App.State.subjects.map((subject) => [subject.name, 0]));
  const totalsByTrack = Object.fromEntries(App.State.EXTRA_TRACKS.map((track) => [track.key, 0]));

  let totalHours = 0;
  let totalStudy = 0;
  let totalTracks = 0;
  let weightedLoad = 0;
  let activeDays = 0;
  let best = { key: null, total: 0 };
  let ratedDays = 0;
  let totalRating = 0;

  for (const key of keys) {
    const day = App.DayPanel.ensureDay(key);
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
      weightedLoad += subjectHours * App.Tasks.getSubjectDifficulty(subject.name);
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

  const lastKeyOfPeriod = keys[keys.length - 1] || App.Utils.getTodayDateKey();
  const isHobbyMode = isVacation || (currentPeriod && activeSubjects.length === 0);
  const currentStreak = calculateCurrentStreak(keys, lastKeyOfPeriod, isHobbyMode);
  const averageRating = ratedDays > 0 ? totalRating / ratedDays : 0;
  const elapsedDays = Math.max(1, keys.length);
  const isEn = App.I18n?.getCurrentLanguage?.() === "en";

  App.Constants.grandTotalEl.textContent = App.Utils.formatTime(totalHours);
  App.Constants.avgPerDayEl.textContent = App.Utils.formatTime(totalHours / elapsedDays);
  App.Constants.avgActiveDayEl.textContent = activeDays ? App.Utils.formatTime(totalHours / activeDays) : "0 h";
  App.Constants.bestDayEl.textContent = best.key ? `${App.Utils.formatShortDate(best.key)} (${App.Utils.formatTime(best.total)})` : "-";
  App.Constants.streakEl.textContent = `${currentStreak} ${isEn ? "days" : "días"}`;

  let topSubject = null;
  let topTrack = null;

  if (isHobbyMode) {
    // Periodo sin asignaturas (ej. vacaciones / solo hobbies)
    if (App.Constants.grandTotalLabel) App.Constants.grandTotalLabel.textContent = "total hobbies";
    if (App.Constants.weightedLoadLabel) App.Constants.weightedLoadLabel.textContent = isEn ? "linked hobbies" : "hobbies vinculados";
    App.Constants.weightedLoadEl.textContent = `${activeTracks.length}`;
    if (App.Constants.avgPerDayLabel) App.Constants.avgPerDayLabel.textContent = isEn ? "daily average (hobbies)" : "media diaria (hobbies)";
    if (App.Constants.avgActiveDayLabel) App.Constants.avgActiveDayLabel.textContent = isEn ? "active days average" : "media en días activos";
    if (App.Constants.bestDayLabel) App.Constants.bestDayLabel.textContent = isEn ? "best hobby day" : "mejor día de hobbies";
    if (App.Constants.streakLabel) App.Constants.streakLabel.textContent = isEn ? "hobby day streak" : "racha de días con hobbies";
    if (App.Constants.studyFocusLabel) App.Constants.studyFocusLabel.textContent = isEn ? "primary focus" : "foco principal";
    if (App.Constants.hobbyFocusLabel) App.Constants.hobbyFocusLabel.textContent = isEn ? "secondary focus" : "foco secundario";
    if (App.Constants.topSubjectLabel) App.Constants.topSubjectLabel.textContent = isEn ? "primary hobby" : "hobby principal";
    if (App.Constants.topTrackLabel) App.Constants.topTrackLabel.textContent = isEn ? "second hobby" : "segundo hobby";

    const sortedTracks = activeTracks
      .map((track) => ({ label: track.label, total: totalsByTrack[track.key] }))
      .sort((a, b) => b.total - a.total);
    const t1 = sortedTracks[0];
    const t2 = sortedTracks[1];

    App.Constants.topSubjectEl.textContent = t1 && t1.total > 0 ? `${t1.label} (${App.Utils.formatTime(t1.total)})` : "-";
    App.Constants.topTrackEl.textContent = t2 && t2.total > 0 ? `${t2.label} (${App.Utils.formatTime(t2.total)})` : "-";
    
    App.Constants.studyFocusEl.textContent = totalHours && t1 ? `${App.Utils.formatNumber((t1.total / totalHours) * 100)}%` : "0%";
    App.Constants.hobbyFocusEl.textContent = totalHours && t2 ? `${App.Utils.formatNumber((t2.total / totalHours) * 100)}%` : "0%";
    topSubject = t1 ? { name: t1.label, total: t1.total } : null;
    topTrack = t2 ? { label: t2.label, total: t2.total } : null;
  } else {
    // Periodo normal (estudio o mixto)
    if (App.Constants.grandTotalLabel) App.Constants.grandTotalLabel.textContent = App.I18n?.t("stats.grandTotalLabel") || "total global";
    if (App.Constants.weightedLoadLabel) App.Constants.weightedLoadLabel.textContent = App.I18n?.t("stats.weightedLoadLabel") || "carga ponderada";
    App.Constants.weightedLoadEl.textContent = App.Utils.getTimeEntryMode() === "hours-minutes" ? App.Utils.formatTime(weightedLoad) : `${App.Utils.formatNumber(weightedLoad)}`;
    if (App.Constants.avgPerDayLabel) App.Constants.avgPerDayLabel.textContent = App.I18n?.t("stats.avgPerDayLabel") || "media diaria";
    if (App.Constants.avgActiveDayLabel) App.Constants.avgActiveDayLabel.textContent = App.I18n?.t("stats.avgActiveDayLabel") || "media en días activos";
    if (App.Constants.bestDayLabel) App.Constants.bestDayLabel.textContent = App.I18n?.t("stats.bestDayLabel") || "mejor día académico";
    if (App.Constants.streakLabel) App.Constants.streakLabel.textContent = App.I18n?.t("stats.streakLabel") || "racha de días seguidos con estudio";
    if (App.Constants.studyFocusLabel) App.Constants.studyFocusLabel.textContent = App.I18n?.t("stats.studyFocusLabel") || "foco en estudio";
    if (App.Constants.hobbyFocusLabel) App.Constants.hobbyFocusLabel.textContent = App.I18n?.t("stats.hobbyFocusLabel") || "foco en hobbies";
    if (App.Constants.topSubjectLabel) App.Constants.topSubjectLabel.textContent = App.I18n?.t("stats.topSubjectLabel") || "asignatura dominante";
    if (App.Constants.topTrackLabel) App.Constants.topTrackLabel.textContent = App.I18n?.t("stats.topTrackLabel") || "hobby dominante";

    topSubject = activeSubjects
      .map((subject) => ({ name: subject.name, total: totalsBySubject[subject.name] }))
      .sort((a, b) => b.total - a.total)[0];
    topTrack = activeTracks
      .map((track) => ({ label: track.label, total: totalsByTrack[track.key], activeDays: App.Tracker.countActiveTrackDays(keys, track.key) }))
      .sort((a, b) => b.total - a.total || b.activeDays - a.activeDays)[0];

    App.Constants.topSubjectEl.textContent = topSubject && topSubject.total > 0 ? `${topSubject.name} (${App.Utils.formatTime(topSubject.total)})` : "-";
    App.Constants.topTrackEl.textContent = topTrack && topTrack.total > 0 ? `${topTrack.label} (${App.Utils.formatTime(topTrack.total)})` : "-";
    App.Constants.studyFocusEl.textContent = totalHours ? `${App.Utils.formatNumber((totalStudy / totalHours) * 100)}%` : "0%";
    App.Constants.hobbyFocusEl.textContent = totalHours ? `${App.Utils.formatNumber((totalTracks / totalHours) * 100)}%` : "0%";
  }

  if (ratedDays > 0) {
    const full = Math.round(averageRating);
    App.Constants.avgRatingEl.textContent = `${"★".repeat(full)}${"☆".repeat(5 - full)}  ${App.Utils.formatNumber(averageRating)}`;
  } else {
    App.Constants.avgRatingEl.textContent = "—";
  }

  App.State.latestStats = {
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

  renderSubjectRiskMetric(activeSubjects, totalsBySubject, keys);

  if (isHobbyMode || activeSubjects.length === 0) {
    if (App.Constants.subjectChartPanel) App.Constants.subjectChartPanel.hidden = true;
    if (App.Constants.hobbyFrequencyPanel) App.Constants.hobbyFrequencyPanel.hidden = false;
    renderHobbyFrequencyChart(keys, activeTracks, totalsByTrack);
  } else {
    if (App.Constants.subjectChartPanel) App.Constants.subjectChartPanel.hidden = false;
    if (App.Constants.hobbyFrequencyPanel) App.Constants.hobbyFrequencyPanel.hidden = true;
    renderSubjectChart(totalsBySubject, activeSubjects);
  }
  renderRatingsChart(keys);
  renderBalanceChart(totalStudy, totalsByTrack, totalHours, activeTracks);
}

function renderSubjectRiskMetric(activeSubjects, totalsBySubject, statsKeys) {
  const valueEl = document.getElementById("subjectRiskMetricValue");
  const metaEl = document.getElementById("subjectRiskMetricMeta");
  if (!valueEl) return;

  const isEn = App.I18n?.getCurrentLanguage?.() === "en";
  if (!activeSubjects.length) {
    valueEl.textContent = "—";
    if (metaEl) metaEl.textContent = isEn ? "No subjects to evaluate" : "Sin asignaturas que evaluar";
    return;
  }

  const subjectRanking = activeSubjects.map((subject) => ({
    name: subject.name,
    total: totalsBySubject[subject.name] || 0,
    difficulty: App.Tasks.getSubjectDifficulty(subject.name)
  }));
  const riskRanking = buildSubjectRiskRanking(subjectRanking, statsKeys);
  const highestRisk = riskRanking[0];
  valueEl.textContent = highestRisk
    ? highestRisk.name
    : (isEn ? "No subject currently stands out" : "Ninguna asignatura destaca ahora");
  if (metaEl) {
    metaEl.textContent = highestRisk
      ? highestRisk.riskReason
      : (isEn ? "No current risk signal" : "Sin señales de riesgo actuales");
  }
}

function openMetricDetails(metricId) {
  const modal = document.getElementById("metricDetailsModal");
  const titleEl = document.getElementById("metricDetailsTitle");
  const contentEl = document.getElementById("metricDetailsContent");
  const stats = App.State.latestStats;
  if (!modal || !titleEl || !contentEl || !stats) return;

  const isEn = App.I18n?.getCurrentLanguage?.() === "en";
  const subjectRanking = (stats.activeSubjects || []).map((subject) => ({
    name: subject.name,
    total: stats.totalsBySubject[subject.name] || 0,
    difficulty: App.Tasks.getSubjectDifficulty(subject.name)
  }));
  const riskRanking = buildSubjectRiskRanking(subjectRanking, stats.keys);
  const trackRanking = (stats.activeTracks || []).map((track) => ({
    label: track.label,
    total: stats.totalsByTrack[track.key] || 0
  })).sort((a, b) => b.total - a.total);
  const subjectList = subjectRanking.slice().sort((a, b) => b.total - a.total);
  const formatList = (items, labelKey, valueFn) => `
    <div class="metric-detail-list">
      ${items.map((item, index) => `<div class="metric-detail-row"><span>#${index + 1} ${App.Utils.escapeHtml(item[labelKey])}</span><strong>${valueFn(item)}</strong></div>`).join("")}
    </div>`;

  const details = {
    avgPerDay: {
      title: isEn ? "Daily average" : "Media diaria",
      body: isEn
        ? `You have recorded ${App.Utils.formatTime(stats.totalHours)} across ${stats.elapsedDays} days, which gives an average of ${App.Utils.formatTime(stats.totalHours / stats.elapsedDays)} per day.`
        : `Has registrado ${App.Utils.formatTime(stats.totalHours)} en ${stats.elapsedDays} días. La media resultante es de ${App.Utils.formatTime(stats.totalHours / stats.elapsedDays)} al día.`
    },
    avgActiveDay: {
      title: isEn ? "Average on active days" : "Media en días activos",
      body: isEn
        ? `${stats.activeDays} days contain recorded activity. On those days you averaged ${App.Utils.formatTime(stats.activeDays ? stats.totalHours / stats.activeDays : 0)}.`
        : `${stats.activeDays} días tienen actividad registrada. En esos días has hecho una media de ${App.Utils.formatTime(stats.activeDays ? stats.totalHours / stats.activeDays : 0)}.`
    },
    bestDay: {
      title: isEn ? "Best day" : "Mejor día",
      body: stats.best.key
        ? (isEn ? `Your strongest day was ${App.Utils.formatShortDate(stats.best.key)}, with ${App.Utils.formatTime(stats.best.total)}.` : `Tu mejor día fue el ${App.Utils.formatShortDate(stats.best.key)}, con ${App.Utils.formatTime(stats.best.total)}.`)
        : (isEn ? "There is no recorded day yet." : "Todavía no hay ningún día registrado.")
    },
    streak: {
      title: isEn ? "Current streak" : "Racha actual",
      body: isEn ? `You currently have ${stats.currentStreak} consecutive active days. The calculation follows the selected statistics period.` : `Ahora mismo tienes ${stats.currentStreak} días consecutivos con actividad. El cálculo respeta el periodo estadístico seleccionado.`
    },
    studyFocus: {
      title: isEn ? "Study focus" : "Foco en estudio",
      body: isEn ? `${App.Utils.formatTime(stats.totalStudy)} of ${App.Utils.formatTime(stats.totalHours)} recorded hours belong to subjects.` : `${App.Utils.formatTime(stats.totalStudy)} de las ${App.Utils.formatTime(stats.totalHours)} registradas corresponden a asignaturas.`
    },
    hobbyFocus: {
      title: isEn ? "Hobby focus" : "Foco en hobbies",
      body: isEn ? `${App.Utils.formatTime(stats.totalTracks)} of ${App.Utils.formatTime(stats.totalHours)} recorded hours belong to hobbies.` : `${App.Utils.formatTime(stats.totalTracks)} de las ${App.Utils.formatTime(stats.totalHours)} registradas corresponden a hobbies.`
    },
    topSubject: {
      title: isEn ? "Subjects ranking" : "Ranking de asignaturas",
      body: formatList(subjectList, "name", (item) => App.Utils.formatTime(item.total))
    },
    topTrack: {
      title: isEn ? "Hobbies ranking" : "Ranking de hobbies",
      body: formatList(trackRanking, "label", (item) => App.Utils.formatTime(item.total))
    },
    avgRating: {
      title: isEn ? "Average rating" : "Valoración media",
      body: stats.ratedDays ? (isEn ? `Your average rating is ${App.Utils.formatNumber(stats.averageRating)} out of 5 across ${stats.ratedDays} rated days.` : `Tu valoración media es de ${App.Utils.formatNumber(stats.averageRating)} sobre 5 en ${stats.ratedDays} días valorados.`) : (isEn ? "No rated days yet." : "Todavía no hay días valorados.")
    },
    subjectRisk: {
      title: isEn ? "Subjects at risk" : "Asignaturas en riesgo",
      body: riskRanking.length
        ? `<p>${isEn ? "The ranking combines upcoming linked events, hours covered against a difficulty-based target, pending tasks, inactivity and subject difficulty." : "El ranking combina eventos vinculados próximos, horas cubiertas frente a un objetivo según dificultad, tareas pendientes, inactividad y dificultad de la asignatura."}</p>
           ${riskRanking.map((item, index) => `<div class="metric-detail-risk-row"><span><strong>#${index + 1} ${App.Utils.escapeHtml(item.name)}</strong><small>${App.Utils.escapeHtml(item.riskReason)} · ${App.Utils.formatTime(item.total)}/${App.Utils.formatTime(item.targetHours)} · ${item.difficulty}/5</small></span><b>${App.Utils.formatNumber(item.score)}/100</b></div>`).join("")}`
        : (isEn ? "No subjects to evaluate." : "No hay asignaturas para evaluar.")
    }
  }[metricId];

  if (!details) return;
  titleEl.textContent = details.title;
  contentEl.innerHTML = typeof details.body === "string" && details.body.startsWith("<")
    ? details.body
    : `<p>${details.body}</p>`;
  modal.hidden = false;
}

function closeMetricDetails() {
  const modal = document.getElementById("metricDetailsModal");
  if (modal) modal.hidden = true;
}

function renderHobbyFrequencyChart(keys, activeTracks, totalsByTrack) {
  const container = App.Constants.hobbyFrequencyChart;
  if (!container) return;
  container.innerHTML = "";

  const ranking = activeTracks
    .map((track) => {
      const activeDays = App.Tracker.countActiveTrackDays(keys, track.key);
      const totalHours = totalsByTrack[track.key] || 0;
      const avgPerActiveDay = activeDays > 0 ? totalHours / activeDays : 0;
      return { ...track, activeDays, totalHours, avgPerActiveDay };
    })
    .sort((a, b) => b.activeDays - a.activeDays || b.totalHours - a.totalHours || a.label.localeCompare(b.label, "es-ES"));

  const maxDays = Math.max(1, ...ranking.map((t) => t.activeDays));

  if (ranking.length === 0) {
    container.innerHTML = `<div class="empty-state">${App.I18n?.text("No hay hobbies vinculados a este periodo.", "No hobbies are linked to this period.")}</div>`;
    return;
  }

  for (const [index, track] of ranking.entries()) {
    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <span class="bar-label">
        <span class="bar-rank">#${index + 1}</span>
        <span class="bar-item-name">${App.Utils.escapeHtml(track.label)}</span>
        <small>Media ${App.Utils.formatTime(track.avgPerActiveDay)}/día</small>
      </span>
      <span class="bar-track">
        <span class="bar-fill" style="background:${App.Utils.escapeHtml(track.color)}; width:${(track.activeDays / maxDays) * 100}%"></span>
      </span>
      <span class="bar-value">${track.activeDays} ${track.activeDays === 1 ? 'día' : 'días'}</span>
    `;
    container.appendChild(row);
  }
}

function renderSubjectChart(totalsBySubject, activeSubjects = App.State.subjects) {
  App.Constants.subjectChartEl.innerHTML = "";
  const ranking = activeSubjects
    .map((subject) => ({ ...subject, total: totalsBySubject[subject.name] }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, "es-ES"));
  const max = Math.max(1, ...ranking.map((subject) => subject.total));

  for (const [index, subject] of ranking.entries()) {
    const total = subject.total;
      const difficulty = App.Tasks.getSubjectDifficulty(subject.name);
      const row = document.createElement("div");
      row.className = "bar-row";
      row.innerHTML = `
      <span class="bar-label"><span class="bar-rank">#${index + 1}</span><span class="bar-item-name">${App.Utils.escapeHtml(subject.name)}</span><small>Dif. ${difficulty}</small></span>
      <span class="bar-track"><span class="bar-fill" style="background:${App.Utils.escapeHtml(subject.color)}; width:${(total / max) * 100}%"></span></span>
      <span class="bar-value">${App.Utils.formatTime(total)}</span>
    `;
    App.Constants.subjectChartEl.appendChild(row);
  }
}

function renderRatingsChart(keys) {
  App.Constants.ratingsChartEl.innerHTML = "";
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let maxCount = 0;

  for (const key of keys) {
    const rating = App.State.state.days[key]?.rating || 0;
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
      <span class="bar-label" style="display: flex; gap: 4px; color: ${App.Utils.escapeHtml(colors[i-1])}; font-size: 1.1rem; min-width: 80px;">${"★".repeat(i)}</span>
      <span class="bar-track"><span class="bar-fill" style="background:${App.Utils.escapeHtml(colors[i-1])}; width:${(count / maxCount) * 100}%"></span></span>
      <span class="bar-value">${count} ${count === 1 ? 'día' : 'días'}</span>
    `;
    App.Constants.ratingsChartEl.appendChild(row);
  }
}

function renderBalanceChart(totalStudy, totalsByTrack, totalHours, activeTracks = App.State.EXTRA_TRACKS) {
  App.Constants.balanceChartEl.innerHTML = "";

  const subjectsColor = App.State.state.settings.subjectsColor || App.State.state.settings.profile?.accentColor || "#0f766e";

  const parts = [];
  if (totalStudy > 0 || App.State.latestStats?.activeSubjects?.length > 0) {
    parts.push({ label: App.State.state.settings.subjectsLabelPlural || "Estudio", value: totalStudy, color: subjectsColor });
  }
  parts.push(...activeTracks.map((track) => ({ label: track.label, value: totalsByTrack[track.key] || 0, color: track.color })));

  for (const part of parts) {
    const value = part.value;
    const ratio = totalHours > 0 ? (value / totalHours) * 100 : 0;
    const row = document.createElement("div");
    row.className = "balance-row";
    row.innerHTML = `
      <span class="balance-label">${App.Utils.escapeHtml(part.label)}</span>
      <span class="balance-track"><span class="balance-fill" style="width:${ratio}%; background:${App.Utils.escapeHtml(part.color)}"></span></span>
      <span class="balance-value">${App.Utils.formatTime(value)} (${App.Utils.formatNumber(ratio)}%)</span>
    `;
    App.Constants.balanceChartEl.appendChild(row);
  }
}

function openAdvancedStats() {
  if (App.Tracker && typeof App.Tracker.switchView === "function") {
    App.Tracker.switchView("profile", "study");
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  try {
    if (!App.State.latestStats) renderStats();
    renderAdvancedStats();
    App.Constants.advancedStatsModalEl.hidden = false;
  } catch (err) {
    console.error("Error al abrir estadísticas avanzadas:", err);
    App.Utils.showToast(App.I18n?.text("Error al abrir las estadísticas avanzadas.", "Could not open advanced statistics."));
  }
}

function closeAdvancedStats() {
  App.Constants.advancedStatsModalEl.hidden = true;
}

function renderAdvancedStats() {
  const stats = App.State.latestStats;
  if (!stats) return;

  const subPlural = App.State.state.settings.subjectsLabelPlural || "Asignaturas";
  const subSingular = App.State.state.settings.subjectsLabelSingular || "Asignatura";
  const hobPlural = App.State.state.settings.hobbiesLabelPlural || "Hobbies";
  const hobSingular = App.State.state.settings.hobbiesLabelSingular || "Hobby";

  const subjectRanking = App.State.subjects
    .map((subject) => ({
      name: subject.name,
      total: stats.totalsBySubject[subject.name] || 0,
      difficulty: App.Tasks.getSubjectDifficulty(subject.name)
    }))
    .sort((a, b) => b.total - a.total || b.difficulty - a.difficulty);

  const trackRanking = App.State.EXTRA_TRACKS
    .map((track) => ({
      label: track.label,
      total: stats.totalsByTrack[track.key] || 0,
      activeDays: App.Tracker.countActiveTrackDays(stats.keys, track.key)
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
  const riskRanking = buildSubjectRiskRanking(subjectRanking, stats.keys);
  const highestRisk = riskRanking[0];
  const bestCovered = riskRanking
    .slice()
    .sort((a, b) => a.score - b.score || b.coverage - a.coverage)[0];
  const highRiskCount = riskRanking.filter((item) => item.score >= 70).length;
  const neglectedSubjects = subjectRanking.filter((item) => item.total === 0).length;
  const studiedSubjects = subjectRanking.filter((item) => item.total > 0).length;
  const usefulRatedDays = stats.ratedDays ? `${stats.ratedDays} días (${App.Utils.formatNumber((stats.ratedDays / Math.max(1, stats.activeDays)) * 100)}% de los activos)` : "sin valoraciones";
  const overdueTasks = riskRanking.reduce((total, item) => total + item.overdueTasks, 0);
  const pendingLinkedTasks = riskRanking.reduce((total, item) => total + item.pendingTasks, 0);
  const leastRecentSubject = riskRanking
    .filter((item) => item.daysSinceLastStudy !== null)
    .sort((a, b) => b.daysSinceLastStudy - a.daysSinceLastStudy)[0];
  const averageCoverage = riskRanking.length
    ? riskRanking.reduce((total, item) => total + Math.min(100, item.coverage), 0) / riskRanking.length
    : 0;
  const deepMetrics = calculateDeepMetrics(stats);

  const isEn = App.I18n && typeof App.I18n.getCurrentLanguage === "function" && App.I18n.getCurrentLanguage() === "en";

  App.Constants.advancedStatsContentEl.innerHTML = `
    <div class="advanced-grid">
      ${renderAdvancedCard(isEn ? "Pace" : "Ritmo", [
        isEn
          ? `You have logged ${App.Utils.formatTime(stats.totalHours)} across ${stats.activeDays} active days.`
          : `Has registrado ${App.Utils.formatTime(stats.totalHours)} en ${stats.activeDays} días activos.`,
        isEn
          ? `Real average: ${App.Utils.formatTime(stats.totalHours / stats.elapsedDays)}/day. Active days avg: ${stats.activeDays ? App.Utils.formatTime(stats.totalHours / stats.activeDays) : "0 h"}.`
          : `Media real: ${App.Utils.formatTime(stats.totalHours / stats.elapsedDays)}/día. Media cuando haces algo: ${stats.activeDays ? App.Utils.formatTime(stats.totalHours / stats.activeDays) : "0 h"}.`,
        isEn
          ? `Days without recorded activity: ${stats.inactiveDays}; current ${subPlural.toLowerCase()} streak: ${stats.currentStreak} days.`
          : `Días sin actividad registrada: ${stats.inactiveDays}; racha de ${subPlural.toLowerCase()} actual: ${stats.currentStreak} días.`
      ])}
      ${renderAdvancedCard(`${subPlural} ${isEn ? "and" : "y"} ${hobPlural}`, [
        `${subPlural}: ${App.Utils.formatTime(stats.totalStudy)} (${App.Utils.formatNumber(studyShare)}%).`,
        `${hobPlural}: ${App.Utils.formatTime(stats.totalTracks)} (${App.Utils.formatNumber(trackShare)}%).`,
        isEn
          ? `Activity on ${App.Utils.formatNumber(activeRatio)}% of elapsed days.`
          : `Actividad en ${App.Utils.formatNumber(activeRatio)}% de los días transcurridos.`
      ])}
      ${renderAdvancedCard(subPlural, subjectRanking.length ? [
        isEn
          ? `Dominant: ${subjectRanking[0]?.total > 0 ? `${subjectRanking[0].name} with ${App.Utils.formatTime(subjectRanking[0].total)}` : "no hours recorded yet"}.`
          : `Dominante: ${subjectRanking[0]?.total > 0 ? `${subjectRanking[0].name} con ${App.Utils.formatTime(subjectRanking[0].total)}` : "todavía sin horas"}.`,
        isEn
          ? `Primary concentration: ${App.Utils.formatNumber(topSubjectShare)}% of total; ${studiedSubjects}/${subjectRanking.length} ${subPlural.toLowerCase()} touched.`
          : `Concentración principal: ${App.Utils.formatNumber(topSubjectShare)}% del total; ${studiedSubjects}/${subjectRanking.length} ${subPlural.toLowerCase()} tocadas.`,
        isEn
          ? `Cumulative weighted load: ${App.Utils.getTimeEntryMode() === "hours-minutes" ? App.Utils.formatTime(stats.weightedLoad) : App.Utils.formatNumber(stats.weightedLoad)}.`
          : `Carga ponderada acumulada: ${App.Utils.getTimeEntryMode() === "hours-minutes" ? App.Utils.formatTime(stats.weightedLoad) : App.Utils.formatNumber(stats.weightedLoad)}.`
      ] : [isEn ? `No ${subPlural.toLowerCase()} configured.` : `No hay ${subPlural.toLowerCase()} configuradas.`])}
      ${renderAdvancedCard(hobPlural, trackRanking.length ? [
        isEn
          ? `Dominant ${hobSingular.toLowerCase()}: ${trackRanking[0]?.total > 0 ? `${trackRanking[0].label} with ${App.Utils.formatTime(trackRanking[0].total)}` : "no hours recorded yet"}.`
          : `${hobSingular} dominante: ${trackRanking[0]?.total > 0 ? `${trackRanking[0].label} con ${App.Utils.formatTime(trackRanking[0].total)}` : "todavía sin horas"}.`,
        `${isEn ? "Highest consistency:" : "Mayor constancia:"} ${getMostConsistentTrackText(trackRanking, isEn)}.`,
        isEn ? `${trackRanking.length} ${hobPlural.toLowerCase()} configured.` : `${trackRanking.length} ${hobPlural.toLowerCase()} configurados.`
      ] : [isEn ? `No ${hobPlural.toLowerCase()} configured.` : `No hay ${hobPlural.toLowerCase()} configurados.`])}
      ${renderAdvancedCard(isEn ? "Week" : "Semana", [
        isEn
          ? `Day with most hours: ${bestWeekday ? `${bestWeekday.label} (${App.Utils.formatTime(bestWeekday.total)})` : "-"}.`
          : `Día con más horas: ${bestWeekday ? `${bestWeekday.label} (${App.Utils.formatTime(bestWeekday.total)})` : "-"}.`,
        isEn
          ? `Most consistent day: ${mostActiveWeekday ? `${mostActiveWeekday.label} (${mostActiveWeekday.activeDays} active days)` : "-"}.`
          : `Día más constante: ${mostActiveWeekday ? `${mostActiveWeekday.label} (${mostActiveWeekday.activeDays} días activos)` : "-"}.`,
        isEn
          ? `Recorded ratings: ${usefulRatedDays}.`
          : `Valoraciones registradas: ${usefulRatedDays}.`
      ])}
      ${renderAdvancedCard(isEn ? "Risks & Alerts" : "Riesgos", [
        highestRisk
          ? (isEn
              ? `Highest risk: ${highestRisk.name} (${App.Utils.formatNumber(highestRisk.score)}/100), ${highestRisk.riskReason}.`
              : `Mayor riesgo: ${highestRisk.name} (${App.Utils.formatNumber(highestRisk.score)}/100), ${highestRisk.riskReason}.`)
          : (isEn ? `No ${subPlural.toLowerCase()} to evaluate.` : `No hay ${subPlural.toLowerCase()} para evaluar.`),
        bestCovered
          ? (isEn
              ? `Best covered: ${bestCovered.name} (${App.Utils.formatNumber(bestCovered.coverage)}% of target).`
              : `Mejor cubierta: ${bestCovered.name} (${App.Utils.formatNumber(bestCovered.coverage)}% del objetivo estimado).`)
          : (isEn ? `Untouched ${subPlural.toLowerCase()}: ${neglectedSubjects}.` : `${subPlural} sin tocar: ${neglectedSubjects}.`),
        isEn
          ? `${highRiskCount} ${subPlural.toLowerCase()} in high risk; ${overdueTasks} linked overdue tasks.`
          : `${highRiskCount} ${subPlural.toLowerCase()} en riesgo alto; ${overdueTasks} tareas atrasadas vinculadas.`
      ])}
      ${renderAdvancedCard(isEn ? "Actual Preparation" : "Preparación real", [
        isEn
          ? `${App.Utils.formatNumber(averageCoverage)}% average coverage against target hours.`
          : `${App.Utils.formatNumber(averageCoverage)}% de cobertura media frente al objetivo estimado de horas.`,
        isEn
          ? `${pendingLinkedTasks} pending tasks are linked to a ${subSingular.toLowerCase()}; ${overdueTasks} are already overdue.`
          : `${pendingLinkedTasks} tareas pendientes están vinculadas a una ${subSingular.toLowerCase()}; ${overdueTasks} ya van atrasadas.`,
        leastRecentSubject
          ? (isEn
              ? `Longest time without study: ${leastRecentSubject.name} (${formatDaysSinceStudy(leastRecentSubject.daysSinceLastStudy, isEn)}).`
              : `Más tiempo sin tocar: ${leastRecentSubject.name} (${formatDaysSinceStudy(leastRecentSubject.daysSinceLastStudy, isEn)}).`)
          : (isEn ? "Not enough study history yet." : "Todavía no hay historial suficiente de estudio.")
      ])}
      ${renderAdvancedCard(isEn ? "Action Signals" : "Señales para actuar", [
        highestRisk
          ? (isEn
              ? `Recommended priority: ${highestRisk.name} — ${getRiskActionText(highestRisk, isEn)}.`
              : `Prioridad recomendada: ${highestRisk.name} — ${getRiskActionText(highestRisk, isEn)}.`)
          : (isEn ? `Log hours or events to get recommendations.` : `Registra horas o eventos para obtener recomendaciones.`),
        highestRisk?.recentHours > 0
          ? (isEn
              ? `${highestRisk.name} accumulated ${App.Utils.formatTime(highestRisk.recentHours)} in the last 14 days.`
              : `${highestRisk.name} acumula ${App.Utils.formatTime(highestRisk.recentHours)} en los últimos 14 días.`)
          : (isEn ? "No subject has recent recorded activity." : "Ninguna asignatura tiene actividad reciente registrada."),
        isEn
          ? `Score balances urgency, coverage, tasks, inactivity and difficulty; not just an hours counter.`
          : `La puntuación combina urgencia, cobertura, tareas, inactividad y dificultad; no es solo un contador de horas.`
      ])}
      ${deepMetrics ? renderAdvancedCard(isEn ? "Deep Analysis" : "Análisis Profundo", [
        isEn
          ? `Weekly trend: ${deepMetrics.weekDelta > 0 ? '+' : ''}${App.Utils.formatTime(deepMetrics.weekDelta)} vs previous week.`
          : `Tendencia semanal: ${deepMetrics.weekDelta > 0 ? '+' : ''}${App.Utils.formatTime(deepMetrics.weekDelta)} respecto a la semana anterior.`,
        isEn
          ? `Regularity index: ${App.Utils.formatNumber(deepMetrics.regularityIndex)}/100 (deviation vs mean).`
          : `Índice de regularidad: ${App.Utils.formatNumber(deepMetrics.regularityIndex)}/100 (desviación vs media).`,
        isEn
          ? `Energy/hours correlation: ${App.Utils.formatTime(deepMetrics.avgHigh)}/day (high mood) vs ${App.Utils.formatTime(deepMetrics.avgLow)}/day (low mood).`
          : `Correlación ánimo/horas: ${App.Utils.formatTime(deepMetrics.avgHigh)}/día (ánimo alto) vs ${App.Utils.formatTime(deepMetrics.avgLow)}/día (ánimo bajo).`,
        `${isEn ? "Projection:" : "Proyección:"} ${deepMetrics.projectionText}.`,
        isEn
          ? `Diversification index: ${App.Utils.formatNumber(deepMetrics.diversification)}% active items used.`
          : `Índice de diversificación: ${App.Utils.formatNumber(deepMetrics.diversification)}% de elementos activos usados.`,
        isEn
          ? `Sequential patterns: ${App.Utils.formatNumber(deepMetrics.avgGap)} days average gap between active days.`
          : `Patrones secuenciales: ${App.Utils.formatNumber(deepMetrics.avgGap)} días de pausa de media entre días activos.`,
        isEn
          ? `Daily goal (${deepMetrics.goal}h): Reached on ${App.Utils.formatNumber(deepMetrics.goalProgress)}% of days.`
          : `Objetivo diario (${deepMetrics.goal}h): Alcanzado el ${App.Utils.formatNumber(deepMetrics.goalProgress)}% de los días.`,
        isEn
          ? `Global performance score: ${App.Utils.formatNumber(deepMetrics.globalScore)}/100.`
          : `Puntuación global de rendimiento: ${App.Utils.formatNumber(deepMetrics.globalScore)}/100.`
      ]) : ''}
    </div>
    <div class="advanced-lists">
      ${renderRankingList(isEn ? `${subPlural} Ranking` : `Ranking de ${subPlural.toLowerCase()}`, subjectRanking.map((item) => ({
        label: item.name,
        meta: `${isEn ? "Diff." : "Dif."} ${item.difficulty}`,
        value: App.Utils.formatTime(item.total)
      })))}
      ${renderRankingList(isEn ? `${hobPlural} Ranking` : `Ranking de ${hobPlural.toLowerCase()}`, trackRanking.map((item) => ({
        label: item.label,
        meta: `${item.activeDays} ${isEn ? "days" : "días"}`,
        value: App.Utils.formatTime(item.total)
      })))}
      ${renderRankingList(isEn ? "Days of the Week" : "Días de la semana", weekdayStudyRanking.map((item) => ({
        label: item.label,
        meta: `${item.studyActiveDays} ${isEn ? `with ${subPlural.toLowerCase()}` : `con ${subPlural.toLowerCase()}`}`,
        value: App.Utils.formatTime(item.total)
      })))}
      ${renderRankingList(isEn ? `${subPlural} by Weighted Load` : `${subPlural} por carga ponderada`, weightedSubjectRanking
        .map((item) => ({
          label: item.name,
          meta: `${isEn ? "Diff." : "Dif."} ${item.difficulty}`,
          value: App.Utils.getTimeEntryMode() === "hours-minutes" ? App.Utils.formatTime(item.weighted) : `${App.Utils.formatNumber(item.weighted)} ${isEn ? "load" : "carga"}`
        })))}
      ${renderRankingList(isEn ? `${subPlural} Risk` : `Riesgo de ${subPlural.toLowerCase()}`, riskRanking.map((item) => ({
        label: item.name,
        meta: `${item.riskReason} · ${App.Utils.formatTime(item.total)}/${App.Utils.formatTime(item.targetHours)} · ${item.pendingTasks} ${isEn ? "pending" : "pendientes"}`,
        value: `${App.Utils.formatNumber(item.score)}/100`
      })))}
    </div>
    <div class="advanced-card advanced-wide">
      <h3>${isEn ? "Quick Takeaways" : "Lectura rápida"}</h3>
      <ul>${buildImprovementTips(stats, subjectRanking, trackRanking, studyShare, isEn).map((tip) => `<li>${App.Utils.escapeHtml(tip)}</li>`).join("")}</ul>
    </div>
  `;
}

function renderAdvancedCard(title, lines) {
  return `
    <article class="advanced-card">
      <h3>${App.Utils.escapeHtml(title)}</h3>
      ${lines.map((line) => `<p>${App.Utils.escapeHtml(line)}</p>`).join("")}
    </article>
  `;
}

function renderRankingList(title, rows) {
  const content = rows.length
    ? rows.map((row, index) => `
        <li>
          <span><b>#${index + 1}</b> ${App.Utils.escapeHtml(row.label)} <small>${App.Utils.escapeHtml(row.meta)}</small></span>
          <strong>${App.Utils.escapeHtml(row.value)}</strong>
        </li>
      `).join("")
    : `<li><span>Sin datos configurados</span><strong>-</strong></li>`;

  return `
    <article class="advanced-card">
      <h3>${App.Utils.escapeHtml(title)}</h3>
      <ol class="advanced-ranking">${content}</ol>
    </article>
  `;
}

function calculateDeepMetrics(stats) {
  const keys = stats.keys || [];
  const daysCount = keys.length;
  if (daysCount === 0) return null;

  // 1. Weekly trends (Tendencias semanales)
  let currentWeekHours = 0;
  let previousWeekHours = 0;
  const last7Keys = keys.slice(-7);
  const prev7Keys = keys.slice(-14, -7);
  last7Keys.forEach(k => currentWeekHours += getDayTotal(k));
  prev7Keys.forEach(k => previousWeekHours += getDayTotal(k));
  const weekDelta = currentWeekHours - previousWeekHours;

  // 2. Regularity index (Índice de regularidad)
  const meanHours = stats.totalHours / Math.max(1, daysCount);
  let variance = 0;
  keys.forEach(k => {
    const h = getDayTotal(k);
    variance += Math.pow(h - meanHours, 2);
  });
  variance /= Math.max(1, daysCount);
  const sd = Math.sqrt(variance);
  const regularityIndex = meanHours > 0 ? Math.max(0, Math.min(100, 100 - (sd / meanHours * 100))) : 0;

  // 3. Mood-to-hours correlation (Correlación ánimo/horas)
  let highMoodHours = 0, highMoodDays = 0;
  let lowMoodHours = 0, lowMoodDays = 0;
  keys.forEach(k => {
    const day = App.State.state.days[k];
    const rating = day ? Number(day.rating) : 0;
    if (rating >= 4) {
      highMoodHours += getDayTotal(k);
      highMoodDays++;
    } else if (rating > 0 && rating <= 2) {
      lowMoodHours += getDayTotal(k);
      lowMoodDays++;
    }
  });
  const avgHigh = highMoodDays ? highMoodHours / highMoodDays : 0;
  const avgLow = lowMoodDays ? lowMoodHours / lowMoodDays : 0;

  // 4. Projections (Proyecciones)
  const isEn = App.I18n && typeof App.I18n.getCurrentLanguage === "function" && App.I18n.getCurrentLanguage() === "en";
  const { currentPeriod } = getActiveStatsContext();
  let projectionText = "N/A";
  if (currentPeriod && currentPeriod.startDate && currentPeriod.endDate) {
    const totalDays = Math.max(1, (new Date(currentPeriod.endDate) - new Date(currentPeriod.startDate)) / (1000 * 60 * 60 * 24));
    const projected = meanHours * totalDays;
    projectionText = isEn ? `${App.Utils.formatTime(projected)} by end of period` : `${App.Utils.formatTime(projected)} al final del periodo`;
  } else {
    projectionText = isEn ? `${App.Utils.formatTime(meanHours * 30)} (next 30 days)` : `${App.Utils.formatTime(meanHours * 30)} (próximos 30 días)`;
  }

  // 5. Diversification index (Índice de diversificación)
  const activeCount = (stats.activeSubjects?.length || 0) + (stats.activeTracks?.length || 0);
  let usedCount = 0;
  (stats.activeSubjects || []).forEach(s => { if (stats.totalsBySubject[s.name] > 0) usedCount++; });
  (stats.activeTracks || []).forEach(t => { if (stats.totalsByTrack[t.key] > 0) usedCount++; });
  const diversification = activeCount > 0 ? (usedCount / activeCount) * 100 : 0;

  // 6. Sequential patterns (Patrones secuenciales)
  let gapDays = [];
  let currentGap = 0;
  keys.forEach(k => {
    if (getDayTotal(k) > 0) {
      if (currentGap > 0) gapDays.push(currentGap);
      currentGap = 0;
    } else {
      currentGap++;
    }
  });
  const avgGap = gapDays.length ? gapDays.reduce((a, b) => a + b, 0) / gapDays.length : 0;

  // 7. Configurable daily goals (Objetivos diarios configurables)
  const goal = App.State.state.settings.dailyGoal || 0;
  let goalMetDays = 0;
  if (goal > 0) {
    keys.forEach(k => {
      if (getDayTotal(k) >= goal) goalMetDays++;
    });
  }
  const goalProgress = goal > 0 ? (goalMetDays / daysCount) * 100 : 0;

  // 8. Global performance score (Puntuación global de rendimiento)
  const score = (goal > 0 ? goalProgress * 0.3 : 30) + (regularityIndex * 0.3) + (diversification * 0.2) + (avgHigh >= avgLow ? 20 : 10);
  const globalScore = Math.min(100, Math.max(0, score));

  return {
    weekDelta,
    currentWeekHours,
    previousWeekHours,
    regularityIndex,
    avgHigh,
    avgLow,
    projectionText,
    diversification,
    avgGap,
    goal,
    goalMetDays,
    goalProgress,
    globalScore
  };
}

function getMostConsistentTrackText(trackRanking, isEn = false) {
  const best = trackRanking.slice().sort((a, b) => b.activeDays - a.activeDays || b.total - a.total)[0];
  if (!best || best.activeDays <= 0) return isEn ? "no consistency recorded yet" : "todavía no hay constancia registrada";
  return `${best.label} (${best.activeDays} ${isEn ? "days" : "días"})`;
}

function buildSubjectRiskRanking(subjectRanking, statsKeys = []) {
  const todayKey = App.Utils.getTodayDateKey();
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
      const subjectTasks = ((App.State.state?.checklistTasks) || []).filter((task) => (
        task.linkType === "subject" && App.Utils.normalizeSearchText(task.linkKey) === App.Utils.normalizeSearchText(subject.name)
      ));
      const pendingSubjectTasks = subjectTasks.filter((task) => !task.completed);
      const overdueSubjectTasks = pendingSubjectTasks.filter((task) => task.dueDate && task.dueDate < todayKey);
      const dueSoonSubjectTasks = pendingSubjectTasks.filter((task) => {
        if (!task.dueDate || task.dueDate < todayKey) return false;
        const daysUntil = Math.round((App.Utils.parseKey(task.dueDate) - App.Utils.parseKey(todayKey)) / 86400000);
        return daysUntil <= 7;
      });
      const taskPressure = Math.min(100, pendingSubjectTasks.reduce((total, task) => total + (task.difficulty || 3) * 10, 0) + overdueSubjectTasks.length * 15);
      const studyHistory = getSubjectStudyHistory(subject.name, statsKeys, todayKey);
      const inactivityScore = studyHistory.daysSinceLastStudy === null
        ? 100
        : Math.min(100, studyHistory.daysSinceLastStudy * 8);
      const recentActivityScore = studyHistory.recentHours > 0 ? 0 : 35;

      // La urgencia pesa más cuando hay un evento próximo; la cobertura y las tareas
      // evitan que una asignatura parezca segura solo por acumular muchas horas antiguas.
      const score = Math.min(100, Math.max(0,
        urgency * 0.32 +
        dedicationScore * 0.25 +
        taskPressure * 0.20 +
        inactivityScore * 0.13 +
        difficultyScore * 0.07 +
        recentActivityScore * 0.03
      ));

      const riskData = {
        ...subject,
        score,
        targetHours,
        coverage,
        exam: closestEvent,
        examText: formatRiskEventText(closestEvent),
        pendingTasks: pendingSubjectTasks.length,
        overdueTasks: overdueSubjectTasks.length,
        dueSoonTasks: dueSoonSubjectTasks.length,
        taskPressure,
        studyDays: studyHistory.studyDays,
        recentHours: studyHistory.recentHours,
        daysSinceLastStudy: studyHistory.daysSinceLastStudy
      };
      riskData.riskReason = getSubjectRiskReason(riskData);

      return riskData;
    })
    .sort((a, b) => {
      const aDays = a.exam ? a.exam.daysUntil : Number.POSITIVE_INFINITY;
      const bDays = b.exam ? b.exam.daysUntil : Number.POSITIVE_INFINITY;
      return b.score - a.score || aDays - bDays || b.difficulty - a.difficulty;
    });
}

function getSubjectStudyHistory(subjectName, statsKeys, todayKey) {
  const keys = Array.isArray(statsKeys) ? statsKeys : [];
  const studyDays = keys.filter((key) => Number(App.State.state.days[key]?.subjects?.[subjectName]) > 0);
  const recentStart = new Date(App.Utils.parseKey(todayKey).getTime() - 13 * 86400000);
  const recentHours = keys.reduce((total, key) => {
    if (App.Utils.parseKey(key) < recentStart) return total;
    return total + Number(App.State.state.days[key]?.subjects?.[subjectName] || 0);
  }, 0);
  const lastStudyKey = studyDays[studyDays.length - 1] || null;
  const daysSinceLastStudy = lastStudyKey
    ? Math.max(0, Math.round((App.Utils.parseKey(todayKey) - App.Utils.parseKey(lastStudyKey)) / 86400000))
    : null;

  return {
    studyDays: studyDays.length,
    recentHours,
    daysSinceLastStudy
  };
}

function getSubjectRiskReason(item) {
  const isEn = App.I18n && typeof App.I18n.getCurrentLanguage === "function" && App.I18n.getCurrentLanguage() === "en";
  if (item.exam && item.exam.daysUntil <= 7) return `${item.examText}; ${App.Utils.formatNumber(item.coverage)}% ${isEn ? "covered" : "cubierto"}`;
  if (item.overdueTasks > 0) return isEn ? `${item.overdueTasks} overdue task${item.overdueTasks === 1 ? "" : "s"}` : `${item.overdueTasks} tarea${item.overdueTasks === 1 ? "" : "s"} atrasada${item.overdueTasks === 1 ? "" : "s"}`;
  if (item.coverage < 50) return isEn ? `${App.Utils.formatNumber(item.coverage)}% of hours goal` : `${App.Utils.formatNumber(item.coverage)}% del objetivo de horas`;
  if (item.daysSinceLastStudy !== null && item.daysSinceLastStudy >= 7) return `${formatDaysSinceStudy(item.daysSinceLastStudy, isEn)}`;
  if (item.pendingTasks > 0) return isEn ? `${item.pendingTasks} pending task${item.pendingTasks === 1 ? "" : "s"}` : `${item.pendingTasks} tarea${item.pendingTasks === 1 ? "" : "s"} pendiente${item.pendingTasks === 1 ? "" : "s"}`;
  return isEn ? `${item.examText}; difficulty ${item.difficulty}/5` : `${item.examText}; dificultad ${item.difficulty}/5`;
}

function formatDaysSinceStudy(days, isEn = false) {
  if (days === 0) return isEn ? "studied today" : "estudiada hoy";
  if (days === 1) return isEn ? "1 day without study" : "1 día sin estudiar";
  return isEn ? `${days} days without study` : `${days} días sin estudiar`;
}

function getRiskActionText(item, isEn = false) {
  if (item.exam && item.exam.daysUntil <= 7) return isEn ? `prioritize a session before your ${item.examText}` : `prioriza una sesión antes de su ${item.examText}`;
  if (item.overdueTasks > 0) return isEn ? `resolve its ${item.overdueTasks} overdue tasks first` : `resuelve primero sus ${item.overdueTasks} tareas atrasadas`;
  if (item.coverage < 50) return isEn ? `bring hours closer to target of ${App.Utils.formatTime(item.targetHours)}` : `acerca sus horas al objetivo de ${App.Utils.formatTime(item.targetHours)}`;
  if (item.daysSinceLastStudy !== null && item.daysSinceLastStudy >= 7) return isEn ? `resume a session to break inactivity` : `retoma una sesión para romper la pausa`;
  return isEn ? "maintain a brief session and check pending tasks" : "mantén una sesión breve y revisa sus tareas pendientes";
}

function getUpcomingLinkedEvents(subjectName, fromKey = App.Utils.getTodayDateKey()) {
  const matches = [];
  const allEventDates = new Set([...Object.keys(App.State.events), ...Object.keys(App.State.state.days || {})]);
  for (const key of allEventDates) {
    if (key < fromKey) continue;
    const dayEvents = [
      ...App.Calendar.getVisibleStaticEvents(key).map(({ event }) => event),
      ...(App.State.state.days[key]?.customEvents || [])
    ];
    for (const event of dayEvents) {
      let isMatch = false;
      if (event.subjectName) {
        isMatch = App.Utils.normalizeSearchText(event.subjectName) === App.Utils.normalizeSearchText(subjectName);
      } else {
        isMatch = App.Tasks.eventMatchesSubject(event.text, subjectName);
      }

      if (isMatch) {
        const daysUntil = Math.max(0, Math.round((App.Utils.parseKey(key) - App.Utils.parseKey(fromKey)) / 86400000));
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
  const isEn = App.I18n && typeof App.I18n.getCurrentLanguage === "function" && App.I18n.getCurrentLanguage() === "en";
  if (!event) return isEn ? "no upcoming events" : "sin eventos próximos";
  const typeText = event.type === "exam" ? (isEn ? "exam" : "examen") : (event.type === "deadline" ? (isEn ? "deadline" : "entrega") : (isEn ? "event" : "evento"));
  if (event.daysUntil === 0) return isEn ? `${typeText} today` : `${typeText} hoy`;
  if (event.daysUntil === 1) return isEn ? `${typeText} tomorrow` : `${typeText} mañana`;
  return isEn ? `${typeText} in ${event.daysUntil} days` : `${typeText} en ${event.daysUntil} días`;
}

function getWeekdayStats(keys) {
  const isEn = App.I18n && typeof App.I18n.getCurrentLanguage === "function" && App.I18n.getCurrentLanguage() === "en";
  const labels = isEn
    ? ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    : ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const stats = labels.map((label) => ({ label, total: 0, study: 0, hobbies: 0, activeDays: 0, studyActiveDays: 0 }));

  for (const key of keys) {
    const index = App.Utils.parseKey(key).getDay();
    const study = getStudyTotal(key);
    const hobbies = App.Tracker.getTrackTotal(key);
    const total = study + hobbies;
    stats[index].total += total;
    stats[index].study += study;
    stats[index].hobbies += hobbies;
    if (total > 0) stats[index].activeDays++;
    if (study > 0) stats[index].studyActiveDays++;
  }

  return [stats[1], stats[2], stats[3], stats[4], stats[5], stats[6], stats[0]];
}

function buildImprovementTips(stats, subjectRanking, trackRanking, studyShare, isEn = false) {
  const subPlural = App.State.state.settings.subjectsLabelPlural || (isEn ? "Subjects" : "Asignaturas");
  const subSingular = App.State.state.settings.subjectsLabelSingular || (isEn ? "Subject" : "Asignatura");
  const hobPlural = App.State.state.settings.hobbiesLabelPlural || (isEn ? "Hobbies" : "Hobbies");
  const hobSingular = App.State.state.settings.hobbiesLabelSingular || (isEn ? "Hobby" : "Hobby");

  const tips = [];
  const lowSubjects = subjectRanking.filter((item) => item.total === 0).slice(0, 2);
  const topSubject = subjectRanking[0];
  const topTrack = trackRanking[0];
  const touchedSubjects = subjectRanking.filter((item) => item.total > 0).length;
  const heavyDifficultyWithoutTime = subjectRanking
    .filter((item) => item.difficulty >= 4 && item.total < Math.max(1, stats.totalStudy / Math.max(1, subjectRanking.length) * 0.5))
    .slice(0, 2);

  if (lowSubjects.length) {
    tips.push(isEn
      ? `${subPlural} with 0 hours: ${lowSubjects.map((item) => item.name).join(", ")}. Dedicating even a brief block helps keep them on track.`
      : `${subPlural} sin horas: ${lowSubjects.map((item) => item.name).join(", ")}. Conviene meterles aunque sea un bloque corto para que no desaparezcan del radar.`);
  }

  if (heavyDifficultyWithoutTime.length) {
    tips.push(isEn
      ? `High difficulty ${subPlural.toLowerCase()} with low dedicated time (${heavyDifficultyWithoutTime.map((item) => item.name).join(", ")}). Prioritize them before backlogs grow.`
      : `Hay ${subPlural.toLowerCase()} difíciles con poco peso (${heavyDifficultyWithoutTime.map((item) => item.name).join(", ")}). Priorízalas antes de que se acumulen.`);
  }

  if (topSubject && stats.totalStudy > 0 && topSubject.total / stats.totalStudy > 0.45) {
    tips.push(isEn
      ? `${topSubject.name} holds too much share. Unless an exam or deadline is imminent, balance time to avoid neglecting other areas.`
      : `${topSubject.name} concentra demasiado estudio. Si no es por un examen o entrega cercana, reparte algo más para evitar abandonar el resto.`);
  }

  if (subjectRanking.length && touchedSubjects / subjectRanking.length < 0.6) {
    tips.push(isEn
      ? `You have only touched ${touchedSubjects}/${subjectRanking.length} ${subPlural.toLowerCase()}. A steady weekly rotation yields better overall control.`
      : `Solo has tocado ${touchedSubjects}/${subjectRanking.length} ${subPlural.toLowerCase()}. Un reparto mínimo semanal puede darte mejor control del calendario.`);
  }

  if (studyShare < 60 && stats.totalHours > 0) {
    tips.push(isEn
      ? `The proportion of ${subPlural.toLowerCase()} is below 60%. If in an intensive phase, increase study focus or separate hobbies from study days.`
      : `El peso de ${subPlural.toLowerCase()} está por debajo del 60%. Si estás en periodo fuerte, sube el foco académico o separa mejor hobbies de días de estudio.`);
  } else if (studyShare > 90 && stats.totalTracks > 0) {
    tips.push(isEn
      ? `Schedule is heavily skewed towards ${subPlural.toLowerCase()}. Keeping some ${hobPlural.toLowerCase()} time sustains long-term momentum without burnout.`
      : `El calendario está muy cargado hacia ${subPlural.toLowerCase()}. Mantener algo de ${hobPlural.toLowerCase()} puede ayudar a sostener ritmo sin quemarte.`);
  }

  if (topTrack && topTrack.total > 0) {
    tips.push(isEn
      ? `Your most active ${hobSingular.toLowerCase()} is ${topTrack.label}. Use it as a balance indicator: rest is vital, but ensure it aligns with your goals.`
      : `Tu ${hobSingular.toLowerCase()} más presente es ${topTrack.label}. Úsalo como indicador de equilibrio: muchas horas ahí pueden ser descanso útil o una fuga, según la semana.`);
  }

  if (stats.inactiveDays > stats.activeDays && stats.totalHours > 0) {
    tips.push(isEn
      ? `More inactive days than active ones. A small daily minimum of 25-30 min boosts continuity without needing massive study days.`
      : `Hay más días sin actividad que activos. Una meta mínima diaria de 25-30 minutos puede mejorar continuidad sin depender de días enormes.`);
  }

  if (stats.ratedDays < Math.max(3, stats.activeDays / 4)) {
    tips.push(isEn
      ? `Few daily ratings recorded. Scoring more days helps cross-reference hours with true performance and energy levels.`
      : `Hay pocas valoraciones del día. Puntuar más días ayuda a cruzar horas con sensación real de rendimiento.`);
  }

  if (!tips.length) {
    tips.push(isEn
      ? `Time distribution is well balanced. Next step: compare daily ratings with recorded hours to discover your optimal working day.`
      : `El reparto está razonablemente equilibrado. El siguiente paso útil es comparar valoración diaria con horas para detectar qué tipo de día te funciona mejor.`);
  }

  return tips;
}

function getDayTotal(key) {
  return getStudyTotal(key) + App.Tracker.getTrackTotal(key);
}

function getStudyTotal(key) {
  const day = App.DayPanel.ensureDay(key);
  return App.State.subjects.reduce((sum, subject) => sum + (Number(day.subjects[subject.name]) || 0), 0);
}

function calculateCurrentStreak(keys, endKey = App.Utils.getTodayDateKey(), isHobbyMode = false) {
  const todayIndex = keys.indexOf(endKey);
  let endIndex = todayIndex >= 0 ? todayIndex : keys.length - 1;
  const checkTotal = (key) => isHobbyMode ? App.Tracker.getTrackTotal(key) : getStudyTotal(key);
  
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

function getActiveStatsContext() {
  const { annualSubjects, periodSubjectsMap, annualTracks, periodTracksMap } = App.Settings.classifyConfigItems();
  const allPeriods = App.State.academicPeriods || [];

  let currentPeriod = null;
  let isVacation = false;

  if (App.State.selectedStatsPeriodId !== "all") {
    currentPeriod = allPeriods.find(p => p.id === App.State.selectedStatsPeriodId) || null;
  } else {
    currentPeriod = allPeriods.find(p => App.State.selectedDate >= p.startDate && App.State.selectedDate <= p.endDate) || null;
    if (!currentPeriod && allPeriods.length > 0) {
      isVacation = true; 
    }
  }

  const activeSubjects = App.State.subjects.filter(sub => {
    if (isVacation) return false; 
    if (annualSubjects.includes(sub.name)) return true; 
    if (currentPeriod) {
      const pIds = periodSubjectsMap[sub.name] || [];
      return pIds.includes(currentPeriod.id);
    }
    return true; 
  });

  const activeTracks = App.State.EXTRA_TRACKS.filter(trk => {
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
      startDate: App.Calendar.getCalendarStart(),
      endDate: App.Calendar.getCalendarEnd(),
      subjects: [],
      tracks: App.State.EXTRA_TRACKS.map(t => t.key),
      isVacation: true
    };
  }
  return null;
}

function getStatsRangeKeys() {
  const todayKey = App.Utils.getTodayDateKey();
  const rangeKeys = getDateRangeKeys().filter((key) => key <= todayKey);
  
  const firstRecordedKey = rangeKeys.find(hasRecordedDayData);
  if (!firstRecordedKey) return [];
  return rangeKeys.filter((key) => key >= firstRecordedKey);
}

function hasRecordedDayData(key) {
  const day = App.State.state.days[key];
  if (!day || typeof day !== "object") return false;

  const hasStudy = App.State.subjects.some((subject) => Number(day.subjects?.[subject.name]) > 0);
  const hasTrack = App.State.EXTRA_TRACKS.some((track) => Number(day.extra?.[track.key]) > 0 || Number(day[track.key]) > 0);
  const hasNotes = typeof day.notes === "string" && day.notes.trim().length > 0;
  const hasRating = Number(day.rating) > 0;
  const hasCustomEvents = Array.isArray(day.customEvents) && day.customEvents.length > 0;

  return hasStudy || hasTrack || hasNotes || hasRating || hasCustomEvents;
}

function getDateRangeKeys() {
  const keys = [];
  for (let date = App.Utils.parseKey(App.Calendar.getCalendarStart()); App.Utils.toDateKey(date) <= App.Calendar.getCalendarEnd(); date.setDate(date.getDate() + 1)) {
    keys.push(App.Utils.toDateKey(date));
  }
  return keys;
}

function getIntensityClass(total) {
  const [l1, l2, l3, l4] = App.State.state.settings.profile.intensityLevels;
  if (total >= l4) return "level-4";
  if (total >= l3) return "level-3";
  if (total >= l2) return "level-2";
  if (total >= l1) return "level-1";
  return "";
}

const HEATMAP_PALETTES = {
  emerald: ["#d9f4ef", "#96ddd4", "#3ba99e", "#0f766e"],
  github: ["#9be9a8", "#40c463", "#30a14e", "#216e39"],
  purple: ["#f2e8ff", "#d8b4fe", "#a855f7", "#7e22ce"],
  neon: ["#ecfeff", "#67e8f9", "#06b6d4", "#0891b2"],
  amber: ["#fef3c7", "#fde047", "#f59e0b", "#b45309"],
  cyberpunk: ["#fce7f3", "#f472b6", "#ec4899", "#be185d"]
};

const HEATMAP_PALETTES_DARK = {
  emerald: ["#064e3b", "#047857", "#059669", "#10b981"],
  github: ["#0e4429", "#006d32", "#26a641", "#39d353"],
  purple: ["#3b0764", "#581c87", "#7e22ce", "#a855f7"],
  neon: ["#083344", "#155e75", "#0891b2", "#06b6d4"],
  amber: ["#451a03", "#78350f", "#b45309", "#f59e0b"],
  cyberpunk: ["#500724", "#831843", "#be185d", "#ec4899"]
};

const HEATMAP_PALETTES_OLED = {
  emerald: ["#032b20", "#064e3b", "#047857", "#059669"],
  github: ["#072617", "#0e4429", "#006d32", "#1b7c35"],
  purple: ["#23043d", "#3b0764", "#581c87", "#7e22ce"],
  neon: ["#041f2a", "#083344", "#155e75", "#0891b2"],
  amber: ["#260f02", "#451a03", "#78350f", "#b45309"],
  cyberpunk: ["#330417", "#500724", "#831843", "#be185d"]
};

function getIntensityColor(total) {
  const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
  const isDark = currentTheme === "dark" || currentTheme === "oled";
  const isOled = currentTheme === "oled";
  const isSepia = currentTheme === "sepia";

  const [l1, l2, l3, l4] = App.State.state?.settings?.profile?.intensityLevels || [2, 4, 6, 8];

  if (total < l1) {
    if (isOled) return "#000000";
    if (isDark) return "#181820";
    if (isSepia) return "#faf4e4";
    return "#f9fafb";
  }

  const paletteKey = App.State.state?.settings?.heatmapPalette || "sync";

  if (paletteKey !== "sync" && paletteKey !== "custom") {
    const paletteMap = isOled ? HEATMAP_PALETTES_OLED : (isDark ? HEATMAP_PALETTES_DARK : HEATMAP_PALETTES);
    const palette = paletteMap[paletteKey];
    if (palette) {
      if (total >= l4) return palette[3];
      if (total >= l3) return palette[2];
      if (total >= l2) return palette[1];
      if (total >= l1) return palette[0];
    }
  }

  // Sincronización pura con el color de acento del usuario:
  const accent = App.State.state?.settings?.profile?.accentColor || "#0f766e";
  const rgb = App.Utils.hexToRgb(accent) || { r: 15, g: 118, b: 110 };

  if (isOled) {
    // Modo OLED: Luminancia atenuada, confortable y con ahorro real de píxeles LED
    if (total >= l4) return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.62)`;
    if (total >= l3) return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.44)`;
    if (total >= l2) return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.28)`;
    if (total >= l1) return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.14)`;
  } else if (isDark) {
    if (total >= l4) return accent;
    if (total >= l3) return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.75)`;
    if (total >= l2) return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.46)`;
    if (total >= l1) return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.22)`;
  } else if (isSepia) {
    if (total >= l4) return accent;
    if (total >= l3) return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.68)`;
    if (total >= l2) return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.40)`;
    if (total >= l1) return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.18)`;
  } else {
    // Tema claro
    if (total >= l4) return accent;
    if (total >= l3) return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.70)`;
    if (total >= l2) return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.42)`;
    if (total >= l1) return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.18)`;
  }

  return accent;
}

// ==========================================
// INFORME AVANZADO INTERACTIVO DE PERIODO
// ==========================================

function openPeriodReportModal() {
  if (App.Tracker && typeof App.Tracker.switchView === "function") {
    App.Tracker.switchView("profile", "study");
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  if (!App.Constants.periodReportModalEl || !App.State.latestStats) return;
  const { currentPeriod, isVacation } = getActiveStatsContext();
  if (!currentPeriod || isVacation) return;
  if (App.Utils.getTodayDateKey() < currentPeriod.endDate) {
    App.Utils.showToast(App.I18n?.text(
      "El informe solo está disponible al finalizar el curso / periodo.",
      "The report is only available after the term / period ends."
    ));
    return;
  }

  const titleEl = document.getElementById("periodReportTitle");
  if (titleEl) titleEl.textContent = currentPeriod.name;

  const { totalHours, totalStudy, totalTracks, activeDays, keys, averageRating, totalsBySubject, totalsByTrack } = App.State.latestStats;

  document.getElementById("repTotalHours").textContent = App.Utils.formatTime(totalHours);
  document.getElementById("repStudyHours").textContent = App.Utils.formatTime(totalStudy);
  document.getElementById("repHobbyHours").textContent = App.Utils.formatTime(totalTracks);
  document.getElementById("repActiveDays").textContent = `${activeDays}`;

  // Narrativa de Energía y Productividad
  const narrativeEl = document.getElementById("repEnergyNarrative");
  if (narrativeEl) {
    if (totalHours === 0) {
      narrativeEl.textContent = App.I18n?.text(
        "Aún no hay actividad registrada en este periodo. ¡Empieza a añadir horas a tus asignaturas o hobbies para ver tu análisis de rendimiento!",
        "No activity has been recorded in this period yet. Start adding hours to your subjects or hobbies to see your performance analysis!"
      );
    } else if (totalStudy === 0) {
      narrativeEl.textContent = App.I18n?.text(
        `Este periodo ha estado completamente enfocado en el descanso y desarrollo personal. Has dedicado el 100% de tu tiempo activo (${App.Utils.formatTime(totalTracks)}) a tus hobbies y pasiones. ¡Una excelente forma de recargar energía!`,
        `This period was fully focused on rest and personal growth. You dedicated 100% of your active time (${App.Utils.formatTime(totalTracks)}) to hobbies and passions. A great way to recharge!`
      );
    } else if (totalTracks === 0) {
      narrativeEl.textContent = App.I18n?.text(
        `Has mantenido un enfoque de estudio intensivo del 100% (${App.Utils.formatTime(totalStudy)}) sin registrar tiempo en hobbies. Recuerda que mantener un equilibrio con actividades recreativas ayuda a consolidar la memoria y evitar el burnout.`,
        `You maintained an intensive 100% study focus (${App.Utils.formatTime(totalStudy)}) without logging hobby time. Remember that balancing recreation helps consolidate memory and prevent burnout.`
      );
    } else {
      const studyRatio = Math.round((totalStudy / totalHours) * 100);
      const trackRatio = 100 - studyRatio;
      narrativeEl.textContent = App.I18n?.text(
        `Has mantenido un balance del ${studyRatio}% en tus responsabilidades académicas y un ${trackRatio}% en tus hobbies. Esta distribución demuestra una gestión del tiempo saludable, permitiendo progreso continuo sin sacrificar tu bienestar personal.`,
        `You maintained a ${studyRatio}% academic focus and ${trackRatio}% on hobbies. This distribution shows healthy time management, allowing steady progress without sacrificing your well-being.`
      );
    }
  }

  // Tareas Completadas del Periodo
  const activeSubjectNames = new Set((App.State.latestStats.activeSubjects || []).map(s => s.name));
  const activeTrackKeys = new Set((App.State.latestStats.activeTracks || []).map(t => t.key));
  const periodTasks = ((App.State.state?.checklistTasks) || []).filter(t => {
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
  document.getElementById("repTasksTotal").textContent = App.I18n?.text(`de ${totalTasksCount} tareas`, `of ${totalTasksCount} tasks`);
  document.getElementById("repTasksBar").style.width = `${taskRatio}%`;

  // Estado de Ánimo
  const fullStars = Math.round(averageRating || 0);
  document.getElementById("repAvgRatingStars").textContent = `${"★".repeat(fullStars)}${"☆".repeat(5 - fullStars)}`;
  document.getElementById("repAvgRatingText").textContent = `(${App.Utils.formatNumber(averageRating)})`;

  const ratingDescEl = document.getElementById("repRatingDesc");
  if (ratingDescEl) {
    if (averageRating >= 4.5) ratingDescEl.textContent = App.I18n?.text("¡Un estado de ánimo excepcional! Has mantenido una motivación y energía altísimas.", "Exceptional mood! You maintained very high motivation and energy.");
    else if (averageRating >= 3.5) ratingDescEl.textContent = App.I18n?.text("Un periodo muy productivo y positivo en general.", "A very productive and positive period overall.");
    else if (averageRating >= 2.5) ratingDescEl.textContent = App.I18n?.text("Un balance normal con días de esfuerzo constante.", "A normal balance with days of steady effort.");
    else if (averageRating > 0) ratingDescEl.textContent = App.I18n?.text("Un periodo exigente. Recuerda priorizar el descanso.", "A demanding period. Remember to prioritize rest.");
    else ratingDescEl.textContent = App.I18n?.text("Sin valoraciones de ánimo registradas en este periodo.", "No mood ratings were recorded in this period.");
  }

  // Cargar componentes de las otras pestañas
  renderReportSubjectsBreakdown("hours");
  renderReportWeekdayChart(keys, currentPeriod);
  renderReportMoodCorrelation(keys, currentPeriod);
  renderReportBadges(currentPeriod);

  switchReportTab("Summary");
  App.Constants.periodReportModalEl.hidden = false;
}

function closePeriodReportModal() {
  if (App.Constants.periodReportModalEl) App.Constants.periodReportModalEl.hidden = true;
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
  if (!container || !App.State.latestStats) return;
  container.innerHTML = "";

  const { activeSubjects, activeTracks, totalsBySubject, totalsByTrack, totalHours } = App.State.latestStats;
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
    container.innerHTML = `<div class="empty-state">${App.I18n?.text("No hay elementos vinculados a este periodo.", "No elements are linked to this period.")}</div>`;
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
          <span style="width: 12px; height: 12px; border-radius: 50%; background: ${App.Utils.escapeHtml(item.color)};"></span>
          <strong style="font-size: 0.95rem; color: var(--ink);">${App.Utils.escapeHtml(item.name)}</strong>
          <span style="font-size: 0.72rem; padding: 2px 6px; border-radius: 4px; background: rgba(var(--accent-rgb), 0.08); color: var(--accent); font-weight: bold;">${item.type}</span>
        </div>
        <div style="font-size: 0.95rem; font-weight: 800; color: var(--ink);">
          ${App.Utils.formatTime(item.total)} <span style="font-size: 0.8rem; color: var(--muted); font-weight: 600;">(${App.Utils.formatNumber(ratio)}%)</span>
        </div>
      </div>
      <div style="width: 100%; background: var(--line); height: 6px; border-radius: 3px; overflow: hidden;">
        <div style="background: ${App.Utils.escapeHtml(item.color)}; height: 100%; width: ${(item.total / maxTotal) * 100}%;"></div>
      </div>
    `;
    container.appendChild(row);
  }
}

function renderReportWeekdayChart(keys, currentPeriod) {
  const container = document.getElementById("repWeekdayChart");
  if (!container || !App.State.latestStats) return;
  container.innerHTML = "";

  const weekdays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const totals = [0, 0, 0, 0, 0, 0, 0];
  const counts = [0, 0, 0, 0, 0, 0, 0];

  const pSubjects = new Set((App.State.latestStats.activeSubjects || []).map(s => s.name));
  const pTracks = new Set((App.State.latestStats.activeTracks || []).map(t => t.key));

  for (const key of keys) {
    const d = new Date(`${key}T12:00:00`);
    const dayOfWeek = (d.getDay() + 6) % 7; 
    const dayData = App.DayPanel.ensureDay(key);

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
        ${App.Utils.formatTime(totals[i])} <small style="color: var(--muted); font-weight: 600;">(${App.Utils.formatTime(avg)}/día)</small>
      </span>
    `;
    container.appendChild(row);
  }
}

function renderReportMoodCorrelation(keys, currentPeriod) {
  const container = document.getElementById("repMoodCorrelation");
  if (!container || !App.State.latestStats) return;
  container.innerHTML = "";

  const pSubjects = new Set((App.State.latestStats.activeSubjects || []).map(s => s.name));
  const pTracks = new Set((App.State.latestStats.activeTracks || []).map(t => t.key));

  const moodData = { 1: { h: 0, c: 0 }, 2: { h: 0, c: 0 }, 3: { h: 0, c: 0 }, 4: { h: 0, c: 0 }, 5: { h: 0, c: 0 } };

  for (const key of keys) {
    const dayData = App.DayPanel.ensureDay(key);
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
    container.innerHTML = `<div class="empty-state">${App.I18n?.text("No has registrado estados de ánimo en este periodo.", "No mood ratings were recorded in this period.")}</div>`;
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
        <span style="color: ${App.Utils.escapeHtml(colors[i-1])}; font-size: 1.2rem;">${"★".repeat(i)}</span>
        <span style="font-size: 0.86rem; color: var(--muted); font-weight: 700;">(${c} ${c === 1 ? 'día' : 'días'})</span>
      </div>
      <div style="font-size: 0.92rem; font-weight: 800; color: var(--ink);">
        Media de ${App.Utils.formatTime(avg)} / día
      </div>
    `;
    container.appendChild(row);
  }
}

function renderReportBadges(activePeriod) {
  const container = document.getElementById("repBadgesGrid");
  if (!container || !App.State.latestStats) return;
  container.innerHTML = "";

  const { totalHours, totalStudy, totalTracks, currentStreak, best, topSubject, topTrack } = App.State.latestStats;
  const badges = [];

  const isEn = App.I18n?.getCurrentLanguage() === "en";

  // Insignia de Racha
  if (currentStreak >= 7) {
    badges.push({
      icon: "🔥",
      title: isEn ? "Unstoppable" : "Imparable",
      desc: isEn ? `Active streak of ${currentStreak} consecutive days.` : `Racha activa de ${currentStreak} días consecutivos.`
    });
  } else if (currentStreak >= 3) {
    badges.push({
      icon: "⚡",
      title: isEn ? "On a Streak" : "En Racha",
      desc: isEn ? `Active streak of ${currentStreak} consecutive days.` : `Racha activa de ${currentStreak} días consecutivos.`
    });
  }

  // Insignia de Mejor Día
  if (best && best.total >= 8) {
    badges.push({
      icon: "👑",
      title: isEn ? "Titanic Day" : "Día Titánico",
      desc: isEn ? `Achieved ${App.Utils.formatTime(best.total)} in a single day (${App.Utils.formatShortDate(best.key)}).` : `Lograste ${App.Utils.formatTime(best.total)} en un solo día (${App.Utils.formatShortDate(best.key)}).`
    });
  } else if (best && best.total >= 4) {
    badges.push({
      icon: "⭐",
      title: isEn ? "Excellent Day" : "Día Excelente",
      desc: isEn ? `Daily record of ${App.Utils.formatTime(best.total)} (${App.Utils.formatShortDate(best.key)}).` : `Tu récord diario fue de ${App.Utils.formatTime(best.total)} (${App.Utils.formatShortDate(best.key)}).`
    });
  }

  // Insignias de Enfoque
  if (topSubject && topSubject.total >= 20) {
    badges.push({
      icon: "📚",
      title: isEn ? "Laser Focus" : "Enfoque Láser",
      desc: isEn ? `Maximum dedication to ${topSubject.name} (${App.Utils.formatTime(topSubject.total)}).` : `Dedicación máxima a ${topSubject.name} (${App.Utils.formatTime(topSubject.total)}).`
    });
  }
  if (topTrack && topTrack.total >= 15) {
    badges.push({
      icon: "🎨",
      title: isEn ? "Unleashed Passion" : "Pasión Desatada",
      desc: isEn ? `Invested ${App.Utils.formatTime(topTrack.total)} in ${topTrack.label}.` : `Invertiste ${App.Utils.formatTime(topTrack.total)} en ${topTrack.label}.`
    });
  }

  // Insignia de Vacaciones / Desconexión
  if (activePeriod.subjects.length === 0 && totalTracks > 0) {
    badges.push({
      icon: "🌴",
      title: isEn ? "Zen Master" : "Maestro del Zen",
      desc: isEn ? `Complete academic recharge with ${App.Utils.formatTime(totalTracks)} dedicated to you.` : `Desconexión académica total con ${App.Utils.formatTime(totalTracks)} dedicadas a ti.`
    });
  }

  if (totalHours >= 50) {
    badges.push({
      icon: "💎",
      title: isEn ? "Log Legend" : "Leyenda del Log",
      desc: isEn ? `Over 50 total hours recorded in this period.` : `Más de 50 horas totales registradas en este periodo.`
    });
  }

  if (badges.length === 0) {
    badges.push({
      icon: "🌱",
      title: isEn ? "Seed of Success" : "Semilla del Éxito",
      desc: isEn ? "You started recording in this period. Keep going to unlock more badges!" : "Has iniciado tu registro en este periodo. ¡Sigue así para desbloquear más insignias!"
    });
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
        <h4 style="margin: 0 0 4px 0; font-size: 0.98rem; color: var(--ink); font-weight: 800;">${App.Utils.escapeHtml(b.title)}</h4>
        <p style="margin: 0; font-size: 0.82rem; color: var(--muted); line-height: 1.35;">${App.Utils.escapeHtml(b.desc)}</p>
      </div>
    `;
    container.appendChild(card);
  }
}

  Object.defineProperties(window.App.Stats, {
    scheduleStatsRender: { get: () => scheduleStatsRender, set: (v) => scheduleStatsRender = v, enumerable: true },
    renderStats: { get: () => renderStats, set: (v) => renderStats = v, enumerable: true },
    renderHobbyFrequencyChart: { get: () => renderHobbyFrequencyChart, set: (v) => renderHobbyFrequencyChart = v, enumerable: true },
    renderSubjectChart: { get: () => renderSubjectChart, set: (v) => renderSubjectChart = v, enumerable: true },
    renderRatingsChart: { get: () => renderRatingsChart, set: (v) => renderRatingsChart = v, enumerable: true },
    renderBalanceChart: { get: () => renderBalanceChart, set: (v) => renderBalanceChart = v, enumerable: true },
    openAdvancedStats: { get: () => openAdvancedStats, set: (v) => openAdvancedStats = v, enumerable: true },
    closeAdvancedStats: { get: () => closeAdvancedStats, set: (v) => closeAdvancedStats = v, enumerable: true },
    renderAdvancedStats: { get: () => renderAdvancedStats, set: (v) => renderAdvancedStats = v, enumerable: true },
    renderAdvancedCard: { get: () => renderAdvancedCard, set: (v) => renderAdvancedCard = v, enumerable: true },
    renderRankingList: { get: () => renderRankingList, set: (v) => renderRankingList = v, enumerable: true },
    getMostConsistentTrackText: { get: () => getMostConsistentTrackText, set: (v) => getMostConsistentTrackText = v, enumerable: true },
    buildSubjectRiskRanking: { get: () => buildSubjectRiskRanking, set: (v) => buildSubjectRiskRanking = v, enumerable: true },
    getSubjectStudyHistory: { get: () => getSubjectStudyHistory, set: (v) => getSubjectStudyHistory = v, enumerable: true },
    getSubjectRiskReason: { get: () => getSubjectRiskReason, set: (v) => getSubjectRiskReason = v, enumerable: true },
    formatDaysSinceStudy: { get: () => formatDaysSinceStudy, set: (v) => formatDaysSinceStudy = v, enumerable: true },
    getRiskActionText: { get: () => getRiskActionText, set: (v) => getRiskActionText = v, enumerable: true },
    getUpcomingLinkedEvents: { get: () => getUpcomingLinkedEvents, set: (v) => getUpcomingLinkedEvents = v, enumerable: true },
    formatRiskEventText: { get: () => formatRiskEventText, set: (v) => formatRiskEventText = v, enumerable: true },
    getWeekdayStats: { get: () => getWeekdayStats, set: (v) => getWeekdayStats = v, enumerable: true },
    buildImprovementTips: { get: () => buildImprovementTips, set: (v) => buildImprovementTips = v, enumerable: true },
    getDayTotal: { get: () => getDayTotal, set: (v) => getDayTotal = v, enumerable: true },
    getStudyTotal: { get: () => getStudyTotal, set: (v) => getStudyTotal = v, enumerable: true },
    calculateCurrentStreak: { get: () => calculateCurrentStreak, set: (v) => calculateCurrentStreak = v, enumerable: true },
    getActiveStatsContext: { get: () => getActiveStatsContext, set: (v) => getActiveStatsContext = v, enumerable: true },
    getEffectiveStatsPeriod: { get: () => getEffectiveStatsPeriod, set: (v) => getEffectiveStatsPeriod = v, enumerable: true },
    getStatsRangeKeys: { get: () => getStatsRangeKeys, set: (v) => getStatsRangeKeys = v, enumerable: true },
    hasRecordedDayData: { get: () => hasRecordedDayData, set: (v) => hasRecordedDayData = v, enumerable: true },
    getDateRangeKeys: { get: () => getDateRangeKeys, set: (v) => getDateRangeKeys = v, enumerable: true },
    getIntensityClass: { get: () => getIntensityClass, set: (v) => getIntensityClass = v, enumerable: true },
    getIntensityColor: { get: () => getIntensityColor, set: (v) => getIntensityColor = v, enumerable: true },
    openPeriodReportModal: { get: () => openPeriodReportModal, set: (v) => openPeriodReportModal = v, enumerable: true },
    closePeriodReportModal: { get: () => closePeriodReportModal, set: (v) => closePeriodReportModal = v, enumerable: true },
    switchReportTab: { get: () => switchReportTab, set: (v) => switchReportTab = v, enumerable: true },
    renderReportSubjectsBreakdown: { get: () => renderReportSubjectsBreakdown, set: (v) => renderReportSubjectsBreakdown = v, enumerable: true },
    renderReportWeekdayChart: { get: () => renderReportWeekdayChart, set: (v) => renderReportWeekdayChart = v, enumerable: true },
    renderReportMoodCorrelation: { get: () => renderReportMoodCorrelation, set: (v) => renderReportMoodCorrelation = v, enumerable: true },
    renderReportBadges: { get: () => renderReportBadges, set: (v) => renderReportBadges = v, enumerable: true },
    calculateDeepMetrics: { get: () => calculateDeepMetrics, set: (v) => calculateDeepMetrics = v, enumerable: true },
    openMetricDetails: { get: () => openMetricDetails, set: (v) => openMetricDetails = v, enumerable: true },
    closeMetricDetails: { get: () => closeMetricDetails, set: (v) => closeMetricDetails = v, enumerable: true }
  });
})();
