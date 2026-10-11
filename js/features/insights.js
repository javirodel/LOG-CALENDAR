(() => {
  window.App = window.App || {};
  window.App.Insights = {};

  let currentFilter = "current"; // "current" | "last30" | "last8w" | "all"
  let selectedPeriodId = "auto"; // "auto" | "all" | periodId
  let activeInsightsCategory = "study"; // "study" | "tracker"

  function setInsightsCategory(category) {
    activeInsightsCategory = category === "tracker" ? "tracker" : "study";
    renderInsightsDashboard();
  }

  function setInsightsFilter(filterName) {
    currentFilter = filterName;
    renderInsightsDashboard();
  }

  function setSelectedPeriod(periodId) {
    selectedPeriodId = periodId;
    renderInsightsDashboard();
  }

  function getActiveAcademicPeriod() {
    const allPeriods = App.State.academicPeriods || [];
    if (selectedPeriodId === "all") return null;
    if (selectedPeriodId !== "auto") {
      return allPeriods.find(p => p.id === selectedPeriodId) || null;
    }
    // "auto": find by selected date or today
    const dateToCheck = App.State.selectedDate || App.Utils.getTodayDateKey();
    return allPeriods.find(p => dateToCheck >= p.startDate && dateToCheck <= p.endDate) || allPeriods[0] || null;
  }

  function getFilteredRangeKeys() {
    const allKeys = App.Stats.getStatsRangeKeys ? App.Stats.getStatsRangeKeys() : [];
    if (!allKeys.length) return [];
    const todayKey = App.Utils.getTodayDateKey();

    if (currentFilter === "last30") {
      const d = App.Utils.parseKey(todayKey);
      d.setDate(d.getDate() - 29);
      const minKey = App.Utils.toDateKey(d);
      return allKeys.filter(k => k >= minKey && k <= todayKey);
    }
    if (currentFilter === "last8w") {
      const d = App.Utils.parseKey(todayKey);
      d.setDate(d.getDate() - 55);
      const minKey = App.Utils.toDateKey(d);
      return allKeys.filter(k => k >= minKey && k <= todayKey);
    }
    if (currentFilter === "all" || selectedPeriodId === "all") {
      return allKeys;
    }

    // Filter by academic period if selected
    const period = getActiveAcademicPeriod();
    if (period && period.startDate && period.endDate) {
      const pKeys = allKeys.filter(k => k >= period.startDate && k <= period.endDate);
      return pKeys.length ? pKeys : allKeys;
    }

    return allKeys;
  }

  function getISOWeekInfo(dateKey) {
    const date = App.Utils.parseKey(dateKey);
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    
    const mon = new Date(date);
    const currentDay = mon.getDay() || 7;
    mon.setDate(mon.getDate() - currentDay + 1);
    const sun = new Date(mon);
    sun.setDate(sun.getDate() + 6);

    const monKey = App.Utils.toDateKey(mon);
    const sunKey = App.Utils.toDateKey(sun);

    return {
      weekKey: `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`,
      weekNo,
      year: d.getUTCFullYear(),
      mondayKey: monKey,
      sundayKey: sunKey,
      shortLabel: `Sem ${weekNo}`,
      rangeLabel: `${mon.getDate()} ${mon.toLocaleDateString("es-ES", { month: "short" })} - ${sun.getDate()} ${sun.toLocaleDateString("es-ES", { month: "short" })}`
    };
  }

  function calculateDashboardData(keys) {
    const subPlural = App.State.state?.settings?.subjectsLabelPlural || "Asignaturas";
    const subSingular = App.State.state?.settings?.subjectsLabelSingular || "Asignatura";
    const hobPlural = App.State.state?.settings?.hobbiesLabelPlural || "Hobbies";
    const hobSingular = App.State.state?.settings?.hobbiesLabelSingular || "Hobby";

    const currentPeriod = getActiveAcademicPeriod();
    let activeSubjects = App.State.subjects || [];
    let activeTracks = App.State.EXTRA_TRACKS || [];

    if (currentPeriod && Array.isArray(currentPeriod.subjects) && currentPeriod.subjects.length) {
      activeSubjects = App.State.subjects.filter(s => currentPeriod.subjects.includes(s.name));
    }
    if (currentPeriod && Array.isArray(currentPeriod.tracks) && currentPeriod.tracks.length) {
      activeTracks = App.State.EXTRA_TRACKS.filter(t => currentPeriod.tracks.includes(t.key));
    }

    let totalHours = 0;
    let totalStudy = 0;
    let totalTracks = 0;
    let activeDays = 0;
    const dailyTotals = {};
    const totalsBySubject = {};
    const totalsByTrack = {};
    activeSubjects.forEach(s => totalsBySubject[s.name] = 0);
    activeTracks.forEach(t => totalsByTrack[t.key] = 0);

    const moodData = {
      5: { count: 0, hours: 0 },
      4: { count: 0, hours: 0 },
      3: { count: 0, hours: 0 },
      2: { count: 0, hours: 0 },
      1: { count: 0, hours: 0 },
      unrated: { count: 0, hours: 0 }
    };

    const weekdayTotals = {
      1: { name: "Lunes", short: "Lun", hours: 0, study: 0, days: 0 },
      2: { name: "Martes", short: "Mar", hours: 0, study: 0, days: 0 },
      3: { name: "Miércoles", short: "Mié", hours: 0, study: 0, days: 0 },
      4: { name: "Jueves", short: "Jue", hours: 0, study: 0, days: 0 },
      5: { name: "Viernes", short: "Vie", hours: 0, study: 0, days: 0 },
      6: { name: "Sábado", short: "Sáb", hours: 0, study: 0, days: 0 },
      0: { name: "Domingo", short: "Dom", hours: 0, study: 0, days: 0 }
    };

    const weeksMap = {};

    keys.forEach(k => {
      const day = App.DayPanel.ensureDay(k);
      let sHours = 0;
      let tHours = 0;

      activeSubjects.forEach(s => {
        const h = Number(day.subjects?.[s.name]) || 0;
        totalsBySubject[s.name] = (totalsBySubject[s.name] || 0) + h;
        sHours += h;
      });

      activeTracks.forEach(t => {
        const h = Number(day.extra?.[t.key]) || Number(day[t.key]) || 0;
        totalsByTrack[t.key] = (totalsByTrack[t.key] || 0) + h;
        tHours += h;
      });

      const dayTotal = sHours + tHours;
      dailyTotals[k] = dayTotal;
      totalHours += dayTotal;
      totalStudy += sHours;
      totalTracks += tHours;

      if (dayTotal > 0) activeDays++;

      const rating = Number(day.rating) || 0;
      if (rating >= 1 && rating <= 5) {
        moodData[rating].count++;
        moodData[rating].hours += dayTotal;
      } else {
        moodData.unrated.count++;
        moodData.unrated.hours += dayTotal;
      }

      const dateObj = App.Utils.parseKey(k);
      const dow = dateObj.getDay();
      if (weekdayTotals[dow]) {
        weekdayTotals[dow].hours += dayTotal;
        weekdayTotals[dow].study += sHours;
        if (dayTotal > 0) weekdayTotals[dow].days++;
      }

      const wInfo = getISOWeekInfo(k);
      if (!weeksMap[wInfo.weekKey]) {
        weeksMap[wInfo.weekKey] = {
          ...wInfo,
          study: 0,
          tracks: 0,
          total: 0,
          activeDays: 0,
          daysCount: 0
        };
      }
      weeksMap[wInfo.weekKey].study += sHours;
      weeksMap[wInfo.weekKey].tracks += tHours;
      weeksMap[wInfo.weekKey].total += dayTotal;
      weeksMap[wInfo.weekKey].daysCount++;
      if (dayTotal > 0) weeksMap[wInfo.weekKey].activeDays++;
    });

    const elapsedDays = Math.max(1, keys.length);
    const meanDaily = totalHours / elapsedDays;

    let varianceSum = 0;
    keys.forEach(k => {
      const h = dailyTotals[k] || 0;
      varianceSum += Math.pow(h - meanDaily, 2);
    });
    const sd = Math.sqrt(varianceSum / elapsedDays);
    const regularityScore = meanDaily > 0 ? Math.max(0, Math.min(100, Math.round(100 - (sd / meanDaily * 60)))) : 0;

    const dailyGoal = Number(App.State.state?.settings?.dailyGoal) || 0;
    let goalMetDays = 0;
    if (dailyGoal > 0) {
      keys.forEach(k => {
        if ((dailyTotals[k] || 0) >= dailyGoal) goalMetDays++;
      });
    }
    const goalPct = dailyGoal > 0 ? Math.min(100, Math.round((goalMetDays / elapsedDays) * 100)) : 0;

    const items = [];
    activeSubjects.forEach(s => {
      const h = totalsBySubject[s.name] || 0;
      items.push({ name: s.name, total: h, color: s.color || "var(--accent)", type: "subject" });
    });
    activeTracks.forEach(t => {
      const h = totalsByTrack[t.key] || 0;
      items.push({ name: t.label, total: h, color: t.color || "#06b6d4", type: "track" });
    });

    let itemsWithHours = 0;
    items.forEach(it => { if (it.total > 0) itemsWithHours++; });
    const diversificationRatio = items.length > 0 ? (itemsWithHours / items.length) * 100 : 0;

    const weeksList = Object.values(weeksMap).sort((a, b) => a.weekKey.localeCompare(b.weekKey));
    const curWeek = weeksList[weeksList.length - 1] || null;
    const prevWeek = weeksList[weeksList.length - 2] || null;
    const wowDeltaHours = curWeek && prevWeek ? curWeek.total - prevWeek.total : (curWeek ? curWeek.total : 0);
    const wowDeltaPct = prevWeek && prevWeek.total > 0 ? Math.round((wowDeltaHours / prevWeek.total) * 100) : (curWeek && curWeek.total > 0 ? 100 : 0);

    let compScore = 0;
    compScore += dailyGoal > 0 ? (goalPct * 0.3) : (Math.min(100, (activeDays / elapsedDays) * 100) * 0.3);
    compScore += (regularityScore * 0.25);
    compScore += (diversificationRatio * 0.2);
    const ratedCount = moodData[5].count + moodData[4].count + moodData[3].count + moodData[2].count + moodData[1].count;
    if (ratedCount > 0) {
      const avgRating = ((moodData[5].count * 5) + (moodData[4].count * 4) + (moodData[3].count * 3) + (moodData[2].count * 2) + (moodData[1].count * 1)) / ratedCount;
      compScore += (avgRating / 5) * 15;
    } else {
      compScore += 10;
    }
    const streak = App.Stats.calculateCurrentStreak ? App.Stats.calculateCurrentStreak(keys) : 0;
    compScore += Math.min(10, streak * 2);

    const globalScore = Math.max(0, Math.min(100, Math.round(compScore)));

    let projectionText = "N/A";
    let projectedHours = 0;
    if (currentPeriod && currentPeriod.startDate && currentPeriod.endDate) {
      const startD = App.Utils.parseKey(currentPeriod.startDate);
      const endD = App.Utils.parseKey(currentPeriod.endDate);
      const totalPeriodDays = Math.max(1, Math.round((endD - startD) / 86400000) + 1);
      projectedHours = meanDaily * totalPeriodDays;
      projectionText = `${App.Utils.formatTime(projectedHours)} proyectadas al fin del curso`;
    } else {
      projectedHours = meanDaily * 30;
      projectionText = `${App.Utils.formatTime(projectedHours)} proyectadas a 30 días`;
    }

    return {
      subPlural,
      subSingular,
      hobPlural,
      hobSingular,
      totalHours,
      totalStudy,
      totalTracks,
      activeDays,
      elapsedDays,
      inactiveDays: elapsedDays - activeDays,
      meanDaily,
      sd,
      regularityScore,
      dailyGoal,
      goalMetDays,
      goalPct,
      items,
      itemsWithHours,
      diversificationRatio,
      weeksList,
      curWeek,
      prevWeek,
      wowDeltaHours,
      wowDeltaPct,
      moodData,
      weekdayTotals,
      globalScore,
      projectedHours,
      projectionText,
      activeSubjects,
      activeTracks,
      totalsBySubject,
      totalsByTrack,
      currentPeriod
    };
  }

  // --- REDISEÑO ELEGANTE Y LIMPIO DEL GRÁFICO SEMANAL CON PANEL DE DIGEST EJECUTIVO ---
  function renderWeeklyBarChartSvg(weeksList, dailyGoal) {
    const isEn = App.I18n?.getCurrentLanguage ? App.I18n.getCurrentLanguage() === "en" : false;
    if (!weeksList || !weeksList.length) {
      return `<div class="insights-empty-chart">${isEn ? "Not enough weekly logs to display comparison." : "No hay suficientes registros semanales para comparar."}</div>`;
    }

    const displayWeeks = weeksList.slice(-8);
    const maxVal = Math.max(5, ...displayWeeks.map(w => w.total)) * 1.15;
    const totalWeeklyHours = displayWeeks.reduce((acc, w) => acc + w.total, 0);
    const avgWeeklyHours = totalWeeklyHours / displayWeeks.length;
    const totalStudyHours = displayWeeks.reduce((acc, w) => acc + w.study, 0);
    const totalTrackHours = displayWeeks.reduce((acc, w) => acc + w.tracks, 0);
    const studyRatioPct = totalWeeklyHours > 0 ? Math.round((totalStudyHours / totalWeeklyHours) * 100) : 0;
    const trackRatioPct = 100 - studyRatioPct;

    const weeklyGoal = dailyGoal * 7;
    const goalMetWeeks = dailyGoal > 0 ? displayWeeks.filter(w => w.total >= weeklyGoal).length : 0;
    let peakWeek = displayWeeks[0];
    displayWeeks.forEach(w => {
      if (w.total > (peakWeek ? peakWeek.total : 0)) peakWeek = w;
    });

    const width = 640;
    const height = 340;
    const padLeft = 44;
    const padRight = 18;
    const padTop = 32;
    const padBottom = 40;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    const colWidth = chartW / displayWeeks.length;
    const barWidth = Math.min(36, Math.max(22, colWidth * 0.54));

    // Grid lines (5 levels for rich vertical visual distribution)
    let gridSvg = "";
    [0, 0.25, 0.5, 0.75, 1].forEach(r => {
      const y = padTop + chartH - (r * chartH);
      const val = Math.round(r * maxVal);
      gridSvg += `
        <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="var(--line)" stroke-dasharray="3,3" stroke-width="1" />
        <text x="${padLeft - 8}" y="${y + 4}" fill="var(--muted)" font-size="10" font-weight="650" text-anchor="end">${val}h</text>
      `;
    });

    // Average line
    const avgY = padTop + chartH - (Math.min(maxVal, avgWeeklyHours) / maxVal * chartH);
    const avgLabel = App.I18n?.t("insights.avgLabel") || (isEn ? "AVG:" : "MEDIA:");
    const avgLineSvg = `
      <line x1="${padLeft}" y1="${avgY}" x2="${width - padRight}" y2="${avgY}" stroke="#eab308" stroke-dasharray="4,4" stroke-width="1.8" />
      <text x="${width - padRight}" y="${avgY - 6}" fill="#eab308" font-size="10" font-weight="800" text-anchor="end">${avgLabel} ${App.Utils.formatTime(avgWeeklyHours)}</text>
    `;

    // Goal line
    let goalLineSvg = "";
    if (dailyGoal > 0 && weeklyGoal <= maxVal) {
      const goalY = padTop + chartH - (weeklyGoal / maxVal * chartH);
      const goalLabel = App.I18n?.t("insights.goalLabel") || (isEn ? "GOAL:" : "META:");
      goalLineSvg = `
        <line x1="${padLeft}" y1="${goalY}" x2="${width - padRight}" y2="${goalY}" stroke="var(--accent)" stroke-opacity="0.45" stroke-dasharray="2,3" stroke-width="1.5" />
        <text x="${padLeft + 6}" y="${goalY - 6}" fill="var(--accent)" font-size="9.5" font-weight="750">${goalLabel} ${App.Utils.formatTime(weeklyGoal)}</text>
      `;
    }

    // Bars
    let barsSvg = "";
    displayWeeks.forEach((w, idx) => {
      const xCenter = padLeft + (idx * colWidth) + (colWidth / 2);
      const xBar = xCenter - (barWidth / 2);

      const totalH = (w.total / maxVal) * chartH;
      const studyH = (w.study / maxVal) * chartH;
      const trackH = (w.tracks / maxVal) * chartH;

      const yBase = padTop + chartH;
      const yStudy = yBase - studyH;
      const yTotal = yBase - totalH;

      barsSvg += `
        <g class="chart-bar-group" tabindex="0" data-week-idx="${idx}" data-week-range="${App.Utils.escapeHtml(w.rangeLabel)}" data-week-total="${App.Utils.formatTime(w.total)}" data-week-study="${App.Utils.formatTime(w.study)}" data-week-tracks="${App.Utils.formatTime(w.tracks)}">
          <title>${w.shortLabel} (${w.rangeLabel}):&#10;Total: ${App.Utils.formatTime(w.total)} | Study: ${App.Utils.formatTime(w.study)} | Tracks: ${App.Utils.formatTime(w.tracks)}</title>
          <!-- Hobby bar (top) -->
          ${trackH > 0 ? `
            <rect x="${xBar}" y="${yTotal}" width="${barWidth}" height="${trackH}" fill="#06b6d4" rx="5" />
          ` : ""}
          <!-- Study bar (bottom) -->
          ${studyH > 0 ? `
            <rect x="${xBar}" y="${yStudy}" width="${barWidth}" height="${studyH}" fill="var(--accent)" rx="5" />
          ` : ""}
          <!-- Total Value above bar -->
          <text x="${xCenter}" y="${Math.max(padTop + 14, yTotal - 7)}" fill="var(--ink)" font-size="10.5" font-weight="800" text-anchor="middle">
            ${w.total > 0 ? App.Utils.formatTime(w.total) : "—"}
          </text>
          <!-- X-Axis Label -->
          <text x="${xCenter}" y="${height - padBottom + 18}" fill="var(--ink)" font-size="10.5" font-weight="750" text-anchor="middle">
            ${w.shortLabel}
          </text>
        </g>
      `;
    });

    const latestW = displayWeeks[displayWeeks.length - 1];
    const latestLabel = App.I18n?.t("insights.latestWeek") || (isEn ? "Latest week" : "Última semana");
    const studyWord = App.I18n?.t("insights.study") || (isEn ? "study" : "estudio");
    const hobbiesWord = App.I18n?.t("insights.hobbies") || (isEn ? "hobbies" : "hobbies");

    return `
      <div class="weekly-comparison-layout">
        <div class="weekly-chart-column">
          <div class="chart-svg-container">
            <svg viewBox="0 0 ${width} ${height}" class="insights-bar-svg" preserveAspectRatio="xMidYMid meet">
              ${gridSvg}
              ${goalLineSvg}
              ${avgLineSvg}
              ${barsSvg}
            </svg>
          </div>
          <!-- Tira de detalle dinámico limpio al pie del gráfico -->
          <div class="weekly-chart-status-strip" id="weeklyChartStatusStrip">
            <span>${latestLabel} (<strong>${latestW ? latestW.shortLabel : "—"}</strong>): <strong>${latestW ? App.Utils.formatTime(latestW.total) : "0 h"}</strong> (${latestW ? App.Utils.formatTime(latestW.study) : "0 h"} ${studyWord} · ${latestW ? App.Utils.formatTime(latestW.tracks) : "0 h"} ${hobbiesWord}).</span>
          </div>
        </div>

        <div class="weekly-metrics-column">
          <div class="weekly-metric-box">
            <span class="weekly-metric-label">🏆 ${App.I18n?.t("insights.peakWeek") || "SEMANA PICO"}</span>
            <strong class="weekly-metric-val">${peakWeek && peakWeek.total > 0 ? peakWeek.shortLabel : "—"}</strong>
            <small class="weekly-metric-sub">${peakWeek && peakWeek.total > 0 ? App.Utils.formatTime(peakWeek.total) : (App.I18n?.t("insights.noRecords") || "Sin registros")}</small>
          </div>
          <div class="weekly-metric-box">
            <span class="weekly-metric-label">📊 ${App.I18n?.t("insights.weeklyAvg") || "MEDIA SEMANAL"}</span>
            <strong class="weekly-metric-val">${App.Utils.formatTime(avgWeeklyHours)}</strong>
            <small class="weekly-metric-sub">${App.I18n?.t("insights.perWeek") || "por semana"}</small>
          </div>
          <div class="weekly-metric-box">
            <span class="weekly-metric-label">🎯 ${App.I18n?.t("insights.goalsMet") || "METAS CUMPLIDAS"}</span>
            <strong class="weekly-metric-val">${dailyGoal > 0 ? `${goalMetWeeks} ${isEn ? "of" : "de"} ${displayWeeks.length}` : (App.I18n?.t("insights.notSet") || "Sin fijar")}</strong>
            <small class="weekly-metric-sub">${dailyGoal > 0 ? `${Math.round((goalMetWeeks / displayWeeks.length) * 100)}% ${App.I18n?.t("insights.consistency") || "consistencia"}` : (App.I18n?.t("insights.fixGoal") || "Fija meta en ajustes")}</small>
          </div>
          <div class="weekly-metric-box">
            <span class="weekly-metric-label">⚖️ ${App.I18n?.t("insights.globalShare") || "REPARTO GLOBAL"}</span>
            <div class="weekly-split-bar" style="display: flex; height: 8px; border-radius: 999px; overflow: hidden; background: rgba(0,0,0,0.06); margin: 6px 0 4px 0;">
              <div class="weekly-split-fill" style="width: ${studyRatioPct}%; background: var(--accent);" title="${studyWord}: ${studyRatioPct}%"></div>
              <div class="weekly-split-fill" style="width: ${trackRatioPct}%; background: #06b6d4;" title="${hobbiesWord}: ${trackRatioPct}%"></div>
            </div>
            <small class="weekly-metric-sub">${studyRatioPct}% ${studyWord} · ${trackRatioPct}% ${hobbiesWord}</small>
          </div>
        </div>
      </div>
    `;
  }

  function renderRadialDiversificationSvg(items, totalHours, diversificationRatio) {
    if (!items || !items.length || totalHours <= 0) {
      return `
        <div class="insights-empty-chart">
          <span>Aún no hay horas registradas para calcular la diversificación.</span>
        </div>
      `;
    }

    const sortedItems = items.filter(it => it.total > 0).sort((a, b) => b.total - a.total);
    const size = 210;
    const radius = 68;
    const strokeWidth = 22;
    const circumference = 2 * Math.PI * radius;

    let segmentsSvg = "";
    let accumulatedOffset = 0;

    sortedItems.forEach(it => {
      const share = it.total / totalHours;
      const strokeLen = share * circumference;
      const offset = circumference - strokeLen;

      segmentsSvg += `
        <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none"
          stroke="${App.Utils.escapeHtml(it.color)}" stroke-width="${strokeWidth}"
          stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
          stroke-linecap="round"
          transform="rotate(${(accumulatedOffset / circumference) * 360 - 90} ${size / 2} ${size / 2})"
          style="transition: all 0.5s ease;">
          <title>${App.Utils.escapeHtml(it.name)}: ${App.Utils.formatTime(it.total)} (${Math.round(share * 100)}%)</title>
        </circle>
      `;

      accumulatedOffset += strokeLen;
    });

    let legendHtml = "";
    sortedItems.slice(0, 5).forEach(it => {
      const pct = Math.round((it.total / totalHours) * 100);
      legendHtml += `
        <div class="radial-legend-row">
          <span class="radial-color-dot" style="background:${App.Utils.escapeHtml(it.color)}"></span>
          <span class="radial-item-title" title="${App.Utils.escapeHtml(it.name)}">${App.Utils.escapeHtml(it.name)}</span>
          <span class="radial-item-time">${App.Utils.formatTime(it.total)}</span>
          <span class="radial-item-pct">${pct}%</span>
        </div>
      `;
    });

    return `
      <div class="radial-donut-layout">
        <div class="radial-svg-wrapper">
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="radial-donut-svg">
            <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="var(--line)" stroke-width="${strokeWidth}" />
            ${segmentsSvg}
          </svg>
          <div class="radial-center-text">
            <span class="radial-center-number">${Math.round(diversificationRatio)}%</span>
            <span class="radial-center-sub">DIVERSIFICACIÓN</span>
          </div>
        </div>
        <div class="radial-legend-list">
          <div class="radial-legend-header">
            <span>Actividad</span>
            <span>Horas</span>
            <span>Peso</span>
          </div>
          ${legendHtml}
        </div>
      </div>
    `;
  }

  function renderMoodCorrelationVisual(moodData) {
    const ratings = [5, 4, 3, 2, 1];
    const maxHoursPerDay = Math.max(1, ...ratings.map(r => moodData[r].count > 0 ? (moodData[r].hours / moodData[r].count) : 0));

    let columnsHtml = "";
    ratings.forEach(r => {
      const data = moodData[r];
      const avg = data.count > 0 ? data.hours / data.count : 0;
      const barHeightPct = Math.min(100, (avg / maxHoursPerDay) * 100);
      const starIcons = "★".repeat(r);

      columnsHtml += `
        <div class="mood-col">
          <div class="mood-col-bar-wrap">
            <div class="mood-col-fill" style="height: ${barHeightPct}%;"></div>
            <span class="mood-col-val">${avg > 0 ? App.Utils.formatTime(avg) : "0 h"}</span>
          </div>
          <div class="mood-col-label">
            <span class="mood-stars">${starIcons}</span>
            <span class="mood-days">${data.count} ${data.count === 1 ? "día" : "días"}</span>
          </div>
        </div>
      `;
    });

    const highMoodCount = moodData[5].count + moodData[4].count;
    const highMoodAvg = highMoodCount > 0 ? (moodData[5].hours + moodData[4].hours) / highMoodCount : 0;
    const lowMoodCount = moodData[2].count + moodData[1].count;
    const lowMoodAvg = lowMoodCount > 0 ? (moodData[2].hours + moodData[1].hours) / lowMoodCount : 0;

    let insightNote = "Puntúa más días con estrellas para desbloquear patrones de energía y fatiga.";
    if (highMoodCount > 0 && lowMoodCount > 0) {
      if (highMoodAvg >= lowMoodAvg * 1.25) {
        insightNote = `¡Sinergia positiva! Rindes un ${Math.round((highMoodAvg / Math.max(0.1, lowMoodAvg) - 1) * 100)}% más en días de buen humor (${App.Utils.formatTime(highMoodAvg)} vs ${App.Utils.formatTime(lowMoodAvg)}). Tu bienestar impulsa tus horas.`;
      } else if (lowMoodAvg > highMoodAvg) {
        insightNote = `Alerta de fatiga: Registras más horas en días de baja satisfacción (${App.Utils.formatTime(lowMoodAvg)} vs ${App.Utils.formatTime(highMoodAvg)}). Considera espaciar los bloques.`;
      } else {
        insightNote = `Rendimiento regular: Mantienes un ritmo parejo independientemente del ánimo diario (${App.Utils.formatTime(highMoodAvg)} en días altos).`;
      }
    } else if (highMoodCount > 0) {
      insightNote = `La mayoría de tus días registrados tienen ánimo positivo (media de ${App.Utils.formatTime(highMoodAvg)}/día).`;
    }

    return `
      <div class="mood-correlation-card">
        <div class="mood-chart-flex">
          ${columnsHtml}
        </div>
        <div class="mood-insight-box">
          <span class="mood-insight-icon">💡</span>
          <span class="mood-insight-text">${App.Utils.escapeHtml(insightNote)}</span>
        </div>
      </div>
    `;
  }

  function renderWeekdayDistribution(weekdayTotals) {
    const daysOrder = [1, 2, 3, 4, 5, 6, 0];
    const maxVal = Math.max(1, ...daysOrder.map(d => weekdayTotals[d].hours));

    let bestDow = 1;
    let maxHours = 0;
    daysOrder.forEach(d => {
      if (weekdayTotals[d].hours > maxHours) {
        maxHours = weekdayTotals[d].hours;
        bestDow = d;
      }
    });

    let barsHtml = "";
    daysOrder.forEach(d => {
      const item = weekdayTotals[d];
      const pct = maxVal > 0 ? (item.hours / maxVal) * 100 : 0;
      const isBest = d === bestDow && item.hours > 0;

      barsHtml += `
        <div class="weekday-bar-row ${isBest ? "highlight-best" : ""}">
          <span class="weekday-name">${item.short}</span>
          <div class="weekday-track">
            <div class="weekday-fill" style="width: ${pct}%;"></div>
          </div>
          <span class="weekday-val">${item.hours > 0 ? App.Utils.formatTime(item.hours) : "—"}</span>
          ${isBest ? `<span class="weekday-best-badge">Pico</span>` : ""}
        </div>
      `;
    });

    return `
      <div class="weekday-distribution-card">
        <div class="weekday-list">
          ${barsHtml}
        </div>
        <div class="weekday-footer-note">
          <span>Día con mayor volumen: <strong>${weekdayTotals[bestDow].name}</strong> (${App.Utils.formatTime(weekdayTotals[bestDow].hours)})</span>
        </div>
      </div>
    `;
  }

  function renderSubjectsHealthTable(activeSubjects, totalsBySubject, subSingular) {
    if (!activeSubjects.length) {
      return `<div class="insights-empty-chart">No hay materias configuradas.</div>`;
    }

    const tasks = App.State.state?.checklistTasks || [];
    const ranking = App.Stats.buildSubjectRiskRanking ? App.Stats.buildSubjectRiskRanking(
      activeSubjects.map(s => ({ name: s.name, total: totalsBySubject[s.name] || 0, difficulty: App.Tasks.getSubjectDifficulty(s.name) })),
      App.Stats.getStatsRangeKeys()
    ) : [];

    let rowsHtml = "";
    activeSubjects.forEach(s => {
      const hours = totalsBySubject[s.name] || 0;
      const diff = App.Tasks.getSubjectDifficulty(s.name);
      const riskInfo = ranking.find(r => r.name === s.name);
      const score = riskInfo ? riskInfo.score : 0;
      const pendingTasks = tasks.filter(t => t.linkType === "subject" && t.linkKey === s.name && !t.completed).length;

      let statusBadge = `<span class="health-badge healthy">Al día</span>`;
      if (score >= 70) {
        statusBadge = `<span class="health-badge danger">Atención Prioritaria</span>`;
      } else if (score >= 40) {
        statusBadge = `<span class="health-badge warning">Reforzar</span>`;
      }

      const daysAgo = riskInfo?.daysSinceLastStudy;
      const lastSessionText = daysAgo === 0 ? "Hoy" : (daysAgo === 1 ? "Ayer" : (daysAgo !== null ? `Hace ${daysAgo} días` : "Sin sesiones"));

      rowsHtml += `
        <div class="health-table-row">
          <div class="health-cell-name">
            <span class="health-color-indicator" style="background:${App.Utils.escapeHtml(s.color)}"></span>
            <div>
              <strong>${App.Utils.escapeHtml(s.name)}</strong>
              <small>Dificultad ${diff}/5 · ${pendingTasks} tareas pendientes</small>
            </div>
          </div>
          <div class="health-cell-hours">
            <strong>${App.Utils.formatTime(hours)}</strong>
            <small>acumuladas</small>
          </div>
          <div class="health-cell-recency">
            <span>${lastSessionText}</span>
          </div>
          <div class="health-cell-status">
            ${statusBadge}
          </div>
        </div>
      `;
    });

    return `
      <div class="health-table-wrapper">
        <div class="health-table-header">
          <span>${App.Utils.escapeHtml(subSingular)}</span>
          <span>Dedicación</span>
          <span>Último Repaso</span>
          <span>Diagnóstico</span>
        </div>
        ${rowsHtml}
      </div>
    `;
  }

  // --- EXACTAMENTE 3 DIRECTRICES ESTRATÉGICAS DE CRECIMIENTO ---
  function renderActionableDirectives(data) {
    const directives = [];

    // Pilar 1: Ritmo y Metas Diarias
    if (data.dailyGoal > 0) {
      if (data.goalPct >= 75) {
        directives.push({
          pillar: "RITMO & METAS",
          icon: "🎯",
          title: `Meta diaria consolidada (${data.goalPct}% de éxito)`,
          desc: `Has cumplido tu objetivo de ${data.dailyGoal}h en ${data.goalMetDays} de ${data.elapsedDays} días. Mantienes una disciplina sólida; tu prioridad es no aumentar la exigencia bruscamente para proteger esta constancia.`
        });
      } else {
        directives.push({
          pillar: "RITMO & METAS",
          icon: "⚡",
          title: `Optimización de meta diaria (${data.goalMetDays}/${data.elapsedDays} días)`,
          desc: `Estás alcanzando la meta de ${data.dailyGoal}h el ${data.goalPct}% del tiempo. Te recomendamos asegurar primero un bloque base de ${Math.max(1, Math.round(data.dailyGoal * 0.7))}h en días con menor energía antes de elevar el listón.`
        });
      }
    } else {
      if (data.regularityScore >= 75) {
        directives.push({
          pillar: "RITMO & METAS",
          icon: "🌊",
          title: `Excelente regularidad natural (${data.regularityScore}%)`,
          desc: `Tus horas diarias son muy estables sin necesidad de una meta explícita. Para un control aún más preciso, define tu objetivo diario en Ajustes.`
        });
      } else {
        directives.push({
          pillar: "RITMO & METAS",
          icon: "📌",
          title: "Establece un ancla de tiempo diario",
          desc: "Presentas oscilaciones entre días intensivos y días sin registros. Configurar una meta diaria en Ajustes te ayudará a estabilizar el avance continuo."
        });
      }
    }

    // Pilar 2: Diversificación y Equilibrio de Actividades
    if (data.diversificationRatio >= 70) {
      directives.push({
        pillar: "EQUILIBRIO & CARGA",
        icon: "🔄",
        title: `Gran cobertura de áreas (${Math.round(data.diversificationRatio)}%)`,
        desc: `Estás distribuyendo tu tiempo activamente en ${data.itemsWithHours} de tus ${data.items.length} asignaturas y hobbies. Ninguna responsabilidad clave está quedando en el olvido.`
      });
    } else if (data.diversificationRatio >= 45) {
      directives.push({
        pillar: "EQUILIBRIO & CARGA",
        icon: "⚖️",
        title: "Regla del contacto mínimo semanal",
        desc: `Concentras el esfuerzo en pocas áreas (${data.itemsWithHours}/${data.items.length}). Dedica un bloque semanal de al menos 30-45 minutos a tus materias secundarias para evitar que se acumule materia pendiente.`
      });
    } else {
      directives.push({
        pillar: "EQUILIBRIO & CARGA",
        icon: "🚨",
        title: "Alerta de materias o hobbies desatendidos",
        desc: `Más de la mitad de tus proyectos configurados tienen 0 horas acumuladas. Revisa la tabla de salud inferior y programa una sesión corta de reactivación.`
      });
    }

    // Pilar 3: Energía, Bienestar y Tendencia
    const ratedCount = data.moodData[5].count + data.moodData[4].count + data.moodData[3].count + data.moodData[2].count + data.moodData[1].count;
    if (data.wowDeltaHours > 0) {
      directives.push({
        pillar: "ENERGÍA & TENDENCIA",
        icon: "📈",
        title: `Crecimiento semanal positivo (+${App.Utils.formatTime(data.wowDeltaHours)})`,
        desc: `Has incrementado un ${data.wowDeltaPct}% tu dedicación respecto a la semana pasada. Aprovecha este impulso para rematar las tareas más complejas de la lista.`
      });
    } else if (ratedCount > 0) {
      const highAvg = (data.moodData[5].count + data.moodData[4].count) > 0 ? (data.moodData[5].hours + data.moodData[4].hours) / (data.moodData[5].count + data.moodData[4].count) : 0;
      directives.push({
        pillar: "ENERGÍA & BIENESTAR",
        icon: "✨",
        title: `Pico de rendimiento en días positivos (${App.Utils.formatTime(highAvg)}/día)`,
        desc: `Tus registros confirman que tu mayor productividad coincide con días de alta motivación y energía. Prioriza el descanso reparador para maximizar tus horas útiles.`
      });
    } else {
      directives.push({
        pillar: "ENERGÍA & BIENESTAR",
        icon: "🌟",
        title: "Puntúa tus sensaciones diarias",
        desc: "Asignar estrellas al final de cada jornada te permitirá descubrir qué tipo de descanso potencia tu rendimiento al día siguiente."
      });
    }

    return `
      <div class="insights-tips-grid">
        ${directives.slice(0, 3).map(d => `
          <div class="insights-tip-card">
            <span class="insights-tip-icon">${d.icon}</span>
            <div>
              <span class="insights-pillar-badge">${App.Utils.escapeHtml(d.pillar)}</span>
              <h4>${App.Utils.escapeHtml(d.title)}</h4>
              <p>${App.Utils.escapeHtml(d.desc)}</p>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  // --- BASE DE CONOCIMIENTO PREDEFINIDA PARA CADA RECUADRO INTERACTIVO ---
  const INSIGHTS_KNOWLEDGE_BASE = {
    score: {
      title: "Puntuación Global de Rendimiento",
      icon: "🏆",
      meaning: "Es un indicador ejecutivo compuesto (0-100) que resume la salud global de tu desarrollo. Pondera el cumplimiento de tu meta diaria (30%), la regularidad del ritmo (25%), la diversificación entre asignaturas/hobbies (20%), el estado anímico y bienestar (15%) y la racha continuada (10%). No mide solo 'echar muchas horas', sino la calidad y sostenibilidad de tu trabajo.",
      getDiagnosis: (d) => `Tu puntuación actual es de **${d.globalScore}/100**, lo que te sitúa en el nivel **${d.globalScore >= 90 ? "Rendimiento Élite" : (d.globalScore >= 75 ? "Consistente y Óptimo" : (d.globalScore >= 55 ? "Buen Ritmo" : "En Desarrollo"))}**.`,
      getCurrentAdvice: (d) => {
        if (d.globalScore >= 90) return { situation: "Puntuación ≥ 90 (Nivel Élite)", phrase: "Tu disciplina, constancia y equilibrio son extraordinarios.", advice: "No busques forzar más horas; tu gran reto ahora es proteger tu descanso y mantener este ritmo sin agotamiento." };
        if (d.globalScore >= 75) return { situation: "Puntuación 75 - 89 (Nivel Óptimo)", phrase: "Avanzas de forma sólida y constante en casi todas tus áreas.", advice: "Revisa si tienes alguna asignatura rezagada o si estás bajando el ritmo en días concretos para alcanzar el nivel élite." };
        if (d.globalScore >= 55) return { situation: "Puntuación 55 - 74 (Buen Ritmo)", phrase: "Tienes actividad regular pero con fluctuaciones o metas sin cerrar.", advice: "Asegura sesiones mínimas de 30-45 minutos en tus días flojos para elevar tu puntuación base de forma estable." };
        return { situation: "Puntuación < 55 (En Construcción)", phrase: "Estás en una fase de arranque o con ritmo irregular.", advice: "Define una meta diaria muy alcanzable en Ajustes (ej. 1-2 horas) para acumular victorias rápidas y ganar tracción." };
      },
      scenarios: [
        { range: "≥ 90 puntos", label: "Élite", text: "Excelente equilibrio, alta fidelidad a metas y descanso sano.", tip: "Consolidar el ritmo y evitar la autoexigencia extrema." },
        { range: "75 - 89 puntos", label: "Óptimo", text: "Ritmo productivo muy consistente con pequeñas fugas puntuales.", tip: "Atender materias secundarias y mantener el fin de semana balanceado." },
        { range: "55 - 74 puntos", label: "Buen Ritmo", text: "Progreso activo pero con días vacíos o metas desajustadas.", tip: "Fijar un mínimo diario garantizado y evitar posponer temas duros." },
        { range: "< 55 puntos", label: "En Desarrollo", text: "Ritmo disperso o sin registros suficientes para estabilizar métricas.", tip: "Reducir la meta inicial y registrar bloques diarios pequeños." }
      ]
    },
    regularity: {
      title: "Índice de Regularidad",
      icon: "🌊",
      meaning: "Evalúa cómo de estables son tus horas día tras día. Analiza la dispersión de tu dedicación frente a tu media. Premia el flujo continuo y penaliza el 'efecto montaña rusa' (días de atracón de 8 horas seguidos de múltiples días a cero).",
      getDiagnosis: (d) => `Tu índice de regularidad es del **${d.regularityScore}%**. Tu media diaria en este periodo es de **${App.Utils.formatTime(d.meanDaily)}/día**.`,
      getCurrentAdvice: (d) => {
        if (d.regularityScore >= 80) return { situation: "Regularidad ≥ 80% (Flujo Estable)", phrase: "Tu dedicación diaria es excepcionalmente uniforme.", advice: "Este es el modelo más eficaz para la memoria a largo plazo: dosis diarias asimilables sin fatiga cognitiva." };
        if (d.regularityScore >= 60) return { situation: "Regularidad 60 - 79% (Moderada)", phrase: "Ritmo aceptable con variaciones lógicas de fines de semana.", advice: "Procura que tus días de descanso sean activos y no caigan a cero si tienes tareas pendientes acumuladas." };
        return { situation: "Regularidad < 60% (Picos y Valles)", phrase: "Presentas alternancia pronunciada entre jornadas intensas y días vacíos.", advice: "Ponte un tope máximo en tus días fuertes y un suelo mínimo de 30 minutos en días tranquilos para evitar el desgaste." };
      },
      scenarios: [
        { range: "≥ 80%", label: "Constante", text: "Avanzas sin picos ni valles; hábito blindado.", tip: "Ideal para la retención y la tranquilidad mental." },
        { range: "60 - 79%", label: "Flexible", text: "Fluctuaciones moderadas con buen ritmo semanal.", tip: "Cuidar la inercia tras los fines de semana." },
        { range: "< 60%", label: "Errático", text: "Efecto atracón seguido de fatiga y días en blanco.", tip: "Establecer sesiones mínimas de 30 min para proteger el hábito." }
      ]
    },
    goal: {
      title: "Objetivo Diario & Metas de Tiempo",
      icon: "🎯",
      meaning: "Mide qué porcentaje de los días evaluados alcanzas o superas el volumen de horas que te has propuesto en Ajustes. Puedes configurar objetivos globales diarios y metas específicas por cada asignatura y hobby.",
      getDiagnosis: (d) => d.dailyGoal > 0
        ? `Tienes una meta diaria de **${d.dailyGoal}h**. La has alcanzado en **${d.goalMetDays} de ${d.elapsedDays} días** (**${d.goalPct}%** de cumplimiento).`
        : "Actualmente no tienes un objetivo diario numérico configurado en Ajustes.",
      getCurrentAdvice: (d) => {
        if (d.dailyGoal <= 0) return { situation: "Sin objetivo fijado", phrase: "Aún no mides tu avance frente a una meta diaria definida.", advice: "Haz clic en 'Ajustes' en la tarjeta superior para definir una meta (ej. 4h, 6h o las que se adapten a tu curso)." };
        if (d.goalPct >= 80) return { situation: "Cumplimiento ≥ 80%", phrase: "Dominas tu meta diaria con soltura y disciplina.", advice: "Tu compromiso es impecable. Si te sientes con margen, puedes elevar ligeramente la meta en Ajustes." };
        if (d.goalPct >= 50) return { situation: "Cumplimiento 50 - 79%", phrase: "Cumples la meta la mitad o más de los días.", advice: "Detecta qué obstáculos surgen en los días no cumplidos para despejar distracciones recurrentes." };
        return { situation: "Cumplimiento < 50%", phrase: "La meta actual está por encima de tu dedicación real sostenida.", advice: "Ajusta la meta a un valor más realista en Ajustes para generar victorias constantes que refuercen tu moral." };
      },
      scenarios: [
        { range: "≥ 80%", label: "Dominado", text: "Meta plenamente integrada en tu rutina habitual.", tip: "Considerar incrementar 30-45 minutos si buscas mayor exigencia." },
        { range: "50 - 79%", label: "En Progreso", text: "Buen avance con días de interrupción.", tip: "Proteger bloques de tiempo prioritarios a primera hora del día." },
        { range: "< 50%", label: "Desfasado", text: "Meta demasiado alta respecto a la realidad del calendario.", tip: "Reducir la meta en Ajustes para recuperar la sensación de logro." }
      ]
    },
    trend: {
      title: "Tendencia Semanal (Week-over-Week)",
      icon: "📈",
      meaning: "Compara el volumen de horas de la semana actual con la semana anterior completa. Indica si tu inercia de trabajo se está acelerando, consolidando o desacelerando.",
      getDiagnosis: (d) => `Esta semana registras **${App.Utils.formatTime(d.curWeek ? d.curWeek.total : 0)}** frente a **${App.Utils.formatTime(d.prevWeek ? d.prevWeek.total : 0)}** de la semana previa (variación de **${d.wowDeltaHours >= 0 ? "+" : ""}${App.Utils.formatTime(d.wowDeltaHours)}**, **${d.wowDeltaHours >= 0 ? "+" : ""}${d.wowDeltaPct}%**).`,
      getCurrentAdvice: (d) => {
        if (d.wowDeltaHours > 2) return { situation: "Crecimiento marcado (> +2h)", phrase: "Estás en una fase de aceleración positiva.", advice: "Asegúrate de que este aumento se apoya en bloques enfocados y no en sesiones atropelladas a última hora." };
        if (d.wowDeltaHours >= -2) return { situation: "Estabilidad (±2h)", phrase: "Mantienes un volumen equilibrado semana a semana.", advice: "La constancia entre semanas es la mayor fortaleza de un estudiante o profesional de alto rendimiento." };
        return { situation: "Descenso (> -2h)", phrase: "Esta semana registra menos dedicación que la previa.", advice: "Si coincide con un descanso programado, es positivo. Si no, programa un bloque breve para reactivar la semana." };
      },
      scenarios: [
        { range: "> +15%", label: "Aceleración", text: "Incremento significativo de horas respecto a la semana pasada.", tip: "Consolidar los nuevos temas sin comprometer horas de sueño." },
        { range: "± 10%", label: "Estable", text: "Ritmo consolidado y predecible.", tip: "Mantener la estructura que ya te está funcionando." },
        { range: "< -15%", label: "Bajada", text: "Descenso notable en las horas registradas.", tip: "Comprobar si hay fatiga o retomar con una sesión sencilla." }
      ]
    },
    "weekly-bars": {
      title: "Comparativa Semana a Semana",
      icon: "📊",
      meaning: "Muestra la evolución cronológica del tiempo dedicado semana a semana, separando visualmente el esfuerzo académico (asignaturas) de tus proyectos personales o descanso (hobbies). Permite detectar ciclos de alta carga y fases de recuperación.",
      getDiagnosis: (d) => `Tu media semanal en las últimas semanas es de **${App.Utils.formatTime(d.weeksList.length ? d.totalHours / Math.max(1, d.weeksList.length) : 0)}/semana**.`,
      getCurrentAdvice: (d) => ({
        situation: "Análisis de distribución semanal",
        phrase: "Observa la proporción entre barras de estudio y hobbies en cada periodo.",
        advice: "Las semanas con 65-80% de estudio y 20-35% de hobbies son las más sostenibles. Semanas con 100% estudio suelen preceder caídas de energía en la semana posterior."
      }),
      scenarios: [
        { range: "Proporción 70/30", label: "Equilibrado", text: "Foco académico con tiempo suficiente para hobbies y desconexión.", tip: "Patrón ideal para prevenir el agotamiento." },
        { range: "Proporción 100/0", label: "Sobrecarga", text: "Cero tiempo en actividades de descompresión.", tip: "Integrar al menos un bloque de hobby para despejar la mente." },
        { range: "Caídas post-entrega", label: "Compensación", text: "Semanas muy bajas tras semanas de picos.", tip: "Planificar descansos deliberados en lugar de frenazos forzados." }
      ]
    },
    diversification: {
      title: "Diversificación & Equilibrio Radial",
      icon: "🎯",
      meaning: "Evalúa cómo se reparte tu tiempo entre todas las asignaturas y hobbies que tienes dados de alta. Un reparto equilibrado previene que materias complejas queden desatendidas hasta semanas previas a exámenes.",
      getDiagnosis: (d) => `Tienes un **${Math.round(d.diversificationRatio)}%** de diversificación. Dedicas tiempo a **${d.itemsWithHours} de tus ${d.items.length}** áreas dadas de alta.`,
      getCurrentAdvice: (d) => {
        if (d.diversificationRatio >= 70) return { situation: "Diversificación ≥ 70%", phrase: "Distribución muy equilibrada entre todas tus responsabilidades.", advice: "Mantén este reparto; rotar de materia favorece la consolidación de la memoria." };
        if (d.diversificationRatio >= 45) return { situation: "Diversificación 45 - 69%", phrase: "Foco centrado en 2 o 3 áreas mientras otras quedan en segundo plano.", advice: "Aplica la regla del contacto mínimo: dedica al menos 30 min por semana a cada asignatura secundaria." };
        return { situation: "Diversificación < 45%", phrase: "Hiperenfoque o materias completamente abandonadas.", advice: "Revisa qué materias están a cero horas; la procrastinación en materias difíciles genera urgencias críticas." };
      },
      scenarios: [
        { range: "≥ 70%", label: "Equilibrado", text: "Contacto activo con la casi totalidad de tus proyectos.", tip: "Excelente salud en el seguimiento global." },
        { range: "45 - 69%", label: "Foco Parcial", text: "Sobreatención a unas pocas materias.", tip: "Programar sesiones cortas para las materias en riesgo." },
        { range: "< 45%", label: "Descompensado", text: "Múltiples materias con cero dedicación acumulada.", tip: "Desbloquear la primera sesión de repaso de inmediato." }
      ]
    },
    mood: {
      title: "Correlación Energía / Ánimo vs Productividad",
      icon: "⚡",
      meaning: "Cruza la valoración con estrellas (1★ a 5★) que introduces cada día con las horas reales registradas. Revela si tu motor principal es la motivación o la presión, y te alerta de posibles fases de fatiga crónica.",
      getDiagnosis: (d) => {
        const highCount = d.moodData[5].count + d.moodData[4].count;
        const lowCount = d.moodData[2].count + d.moodData[1].count;
        return `Has registrado **${highCount} días** con ánimo alto (4-5★) y **${lowCount} días** con ánimo bajo o exigente (1-2★).`;
      },
      getCurrentAdvice: (d) => {
        const highCount = d.moodData[5].count + d.moodData[4].count;
        const highAvg = highCount > 0 ? (d.moodData[5].hours + d.moodData[4].hours) / highCount : 0;
        const lowCount = d.moodData[2].count + d.moodData[1].count;
        const lowAvg = lowCount > 0 ? (d.moodData[2].hours + d.moodData[1].hours) / lowCount : 0;
        if (highCount > 0 && lowCount > 0 && highAvg > lowAvg) {
          return { situation: "Sinergia Bienestar-Horas", phrase: "Tus horas aumentan cuando te sientes motivado y enérgico.", advice: "Cuidar tu sueño, deporte y hobbies produce un retorno directo en tus resultados académicos." };
        }
        if (highCount > 0 && lowCount > 0 && lowAvg > highAvg) {
          return { situation: "Alerta de Fatiga por Presión", phrase: "Acumulas más horas precisamente en días con baja satisfacción.", advice: "Cuidado con la trampa del presentismo: estudiar muchas horas con la mente agotada reduce drásticamente la retención." };
        }
        return { situation: "Ritmo Estable", phrase: "Mantienes una dedicación constante independiente del ánimo diario.", advice: "Sigue puntuando al final de cada jornada para enriquecer el algoritmo de predicción." };
      },
      scenarios: [
        { range: "Alta correlación positiva", label: "Motor de Bienestar", text: "Rendimiento óptimo cuando estás descansado y animado.", tip: "Priorizar hábitos de salud para potenciar tus horas." },
        { range: "Correlación negativa", label: "Sobrecarga", text: "Más horas en días de 1-2★ por urgencias o estrés.", tip: "Planificar descansos obligatorios para evitar burnout." },
        { range: "Sin correlación clara", label: "Disciplinado", text: "Horas estables independientemente de cómo te sientas.", tip: "Excelente profesionalidad y control de la procrastinación." }
      ]
    },
    weekday: {
      title: "Patrón Semanal de Trabajo",
      icon: "📅",
      meaning: "Agrega tus horas acumuladas de Lunes a Domingo para identificar tus 'Días Pico' naturales de máxima concentración y tus días habituales de descanso o dispersión.",
      getDiagnosis: (d) => {
        let bestDay = "Lunes";
        let maxH = 0;
        Object.values(d.weekdayTotals).forEach(w => { if (w.hours > maxH) { maxH = w.hours; bestDay = w.name; } });
        return `Tu día de mayor volumen acumulado es el **${bestDay}** (**${App.Utils.formatTime(maxH)}** totales).`;
      },
      getCurrentAdvice: (d) => ({
        situation: "Organización estratégica de la semana",
        phrase: "Conocer tus días pico te permite colocar las tareas más duras en el momento oportuno.",
        advice: "Programa los temas más complejos o nuevos en tus días pico y reserva los días valle para tareas mecánicas, repasos ligeros o descanso."
      }),
      scenarios: [
        { range: "Pico a inicio de semana", label: "Arranque Fuerte", text: "Lunes y Martes concentran la mayor carga.", tip: "Aprovechar la energía inicial para temas nuevos." },
        { range: "Pico a fin de semana", label: "Modo Entrega", text: "Viernes o fin de semana muy cargados.", tip: "Procurar adelantar trabajo para no agotar el fin de semana." },
        { range: "Reparto uniforme", label: "Ritmo Parejo", text: "Carga similar todos los días de la semana.", tip: "Comprobar que dispones de al menos 1 día de desconexión." }
      ]
    },
    health: {
      title: "Diagnóstico Estratégico por Asignatura",
      icon: "🩺",
      meaning: "Evalúa en tiempo real el estado de salud de cada materia cruzando: horas dedicadas, días transcurridos desde el último repaso, nivel de dificultad y tareas pendientes atrasadas vinculadas en el checklist.",
      getDiagnosis: (d) => `Estás gestionando **${d.activeSubjects.length} asignaturas** activas en este periodo.`,
      getCurrentAdvice: (d) => ({
        situation: "Priorización por riesgo de olvido",
        phrase: "La curva del olvido actúa rápidamente tras 5-7 días sin contacto con un tema.",
        advice: "Da prioridad a las materias marcadas en 'Atención Prioritaria' o 'Reforzar', realizando un repaso corto antes de que el coste de volver a empezar sea mayor."
      }),
      scenarios: [
        { range: "Al día", label: "Saludable", text: "Repaso reciente y cobertura de horas adecuada.", tip: "Mantener el ciclo de revisiones periódicas." },
        { range: "Reforzar", label: "Alerta Media", text: "Más de 5 días sin sesión o avance por debajo del 50%.", tip: "Agendar una sesión de 45 minutos esta misma semana." },
        { range: "Atención Prioritaria", label: "Crítico", text: "Materia difícil con tareas atrasadas o semanas sin contacto.", tip: "Desbloquear de inmediato con un repaso del índice general." }
      ]
    },
    "tracker-adherence": {
      title: "Tasa de Adherencia a Rutinas",
      icon: "📋",
      meaning: "Mide el porcentaje de cumplimiento real de tus hábitos frente al total de compromisos diarios programados en el periodo evaluado. Una tasa saludable demuestra que tus hábitos están integrados en tu vida diaria sin sobrecargarte.",
      getDiagnosis: (d) => `Tu tasa de adherencia es del **${d.adherenceRate}%** (${d.totalChecksDone} registros completados de ${d.totalScheduled} programados). Has estado activo en **${d.activeDays} de ${d.totalDays} días**.`,
      getCurrentAdvice: (d) => {
        if (d.adherenceRate >= 80) return { situation: "Adherencia ≥ 80% (Hábito Consolidado)", phrase: "Tu sistema de rutinas funciona con fluidez y precisión.", advice: "Protege este ritmo y resiste la tentación de sobrecargar tu lista con demasiados hábitos nuevos." };
        if (d.adherenceRate >= 50) return { situation: "Adherencia 50 - 79% (Constancia Moderada)", phrase: "Avanzas bien pero experimentas días de abandono.", advice: "Revisa qué hábitos específicos se quedan sin marcar y reduce su dificultad o conéctalos a un disparador claro." };
        return { situation: "Adherencia < 50% (Fricción en el Sistema)", phrase: "Tu tasa de cumplimiento está por debajo de lo deseado.", advice: "Reduce el número de hábitos en el Tracker a un máximo de 2 o 3 esenciales hasta recuperar la inercia diaria." };
      },
      scenarios: [
        { range: "≥ 80%", label: "Consolidado", text: "Hábitos ejecutados casi a diario de forma automática.", tip: "Mantener la inercia y vigilar no saturarse." },
        { range: "50 - 79%", label: "En Progreso", text: "Cumplimiento estable con caídas en días atareados.", tip: "Preparar un plan de contingencia para días de mucho trabajo." },
        { range: "< 50%", label: "Sobrecarga", text: "Excesiva fricción o demasiados hábitos a la vez.", tip: "Eliminar hábitos secundarios y centrarse en 1 o 2 vitales." }
      ]
    },
    "tracker-streak": {
      title: "Racha Media & Continuidad",
      icon: "🔥",
      meaning: "Evalúa la cantidad de días consecutivos ininterrumpidos en los que marcas tus hábitos. No romper la cadena genera impulso psicológico y reduce la energía necesaria para iniciar cada actividad.",
      getDiagnosis: (d) => `Tu racha media actual es de **${d.avgStreak} días**. Tu racha más larga registrada en este periodo es de **${d.maxActiveStreak} días**.`,
      getCurrentAdvice: (d) => {
        if (d.avgStreak >= 7) return { situation: "Racha ≥ 7 días (Inercia Total)", phrase: "Tienes una continuidad impecable.", advice: "La inercia juega a tu favor. Recuerda la regla de oro: nunca faltes dos días seguidos para no romper la identidad del hábito." };
        if (d.avgStreak >= 3) return { situation: "Racha 3 - 6 días (Cadena Activa)", phrase: "Empiezas a consolidar bloques de días consecutivos.", advice: "El paso de 3 a 7 días es donde más resistencia mental se siente. Mantén la concentración en el objetivo de hoy." };
        return { situation: "Racha < 3 días (Cadena Frágil)", phrase: "Se producen cortes frecuentes en la continuidad.", advice: "Céntrate exclusivamente en el hábito más sencillo y logra una mini-racha de 3 días consecutivos para ganar tracción." };
      },
      scenarios: [
        { range: "≥ 14 días", label: "Automatizado", text: "El hábito ya forma parte de tu identidad diaria.", tip: "Seguir celebrando el progreso sin confiarse." },
        { range: "4 - 13 días", label: "En Consolidación", text: "Cadena sólida que requiere atención consciente.", tip: "Nunca dejar pasar 2 días seguidos." },
        { range: "1 - 3 días", label: "Fase Inicial", text: "Alta vulnerabilidad a imprevistos y pereza.", tip: "Bajar la dificultad a la versión mínima." }
      ]
    },
    "tracker-wow": {
      title: "Evolución Semanal de Hábitos (WoW)",
      icon: "📈",
      meaning: "Compara el total de hábitos completados en la semana actual con la semana anterior. Permite saber si tu constancia está en ascenso o si estás sufriendo una desaceleración.",
      getDiagnosis: (d) => `Esta semana llevas **${d.curWeek ? d.curWeek.checks : 0} hábitos completados** frente a **${d.prevWeek ? d.prevWeek.checks : 0}** de la semana previa (variación de **${d.wowDeltaChecks >= 0 ? "+" : ""}${d.wowDeltaChecks}**, **${d.wowDeltaChecks >= 0 ? "+" : ""}${d.wowDeltaPct}%**).`,
      getCurrentAdvice: (d) => {
        if (d.wowDeltaChecks > 0) return { situation: "Tendencia Positiva", phrase: "Estás mejorando tu disciplina semanal.", advice: "Usa este momento de alta motivación para consolidar tus rutinas más tempranas." };
        if (d.wowDeltaChecks === 0) return { situation: "Estabilidad Semanal", phrase: "Mantienes exactamente el mismo volumen de checks.", advice: "La estabilidad es excelente; procura asegurar tus hábitos antes del anochecer." };
        return { situation: "Descenso Semanal", phrase: "Registras menos hábitos completados que la semana previa.", advice: "No te desanimes; detecta si ha habido una sobrecarga de exámenes o trabajo y reajusta tus expectativas." };
      },
      scenarios: [
        { range: "Aumento > +20%", label: "Aceleración", text: "Mayor dedicación y foco en tus rutinas.", tip: "Asegurar que sea sostenible en el tiempo." },
        { range: "Variación ± 10%", label: "Ritmo Fijo", text: "Constancia predecible y sólida.", tip: "Mantener los disparadores habituales." },
        { range: "Descenso > -20%", label: "Pérdida de Foco", text: "Fricción o desatención de la lista de rutinas.", tip: "Revisar los hábitos en el Tracker y reactivar los más fáciles." }
      ]
    },
    "tracker-star": {
      title: "Hábito Estrella vs Hábito en Riesgo",
      icon: "⭐",
      meaning: "Identifica tu hábito con mayor tasa de éxito (el que dominas) y lo contrasta con el hábito que más dificultades presenta. Esta comparativa te permite usar el hábito fuerte como ancla para arrastrar al hábito débil.",
      getDiagnosis: (d) => d.starHabit
        ? `Tu hábito estrella es **${App.Utils.escapeHtml(d.starHabit.emoji)} ${App.Utils.escapeHtml(d.starHabit.name)}** con un **${d.starHabit.adherencePct}% de éxito** (${d.starHabit.checks} días).${d.atRiskHabit && d.atRiskHabit.id !== d.starHabit.id ? ` Tu hábito con mayor margen de mejora es **${App.Utils.escapeHtml(d.atRiskHabit.emoji)} ${App.Utils.escapeHtml(d.atRiskHabit.name)}** (${d.atRiskHabit.adherencePct}%).` : ""}`
        : "Aún no hay suficientes registros de hábitos para clasificar tus rutinas.",
      getCurrentAdvice: (d) => {
        if (!d.starHabit) return { situation: "Sin datos", phrase: "Marca hábitos en el Tracker para analizar tus puntos fuertes.", advice: "Dirígete a la pestaña Tracker y pulsa en los checks del mes." };
        return {
          situation: "Técnica del Hábito Ancla",
          phrase: `Ejecuta tu hábito en riesgo justo después de ${d.starHabit.name}.`,
          advice: "Aprovecha la inercia positiva de tu hábito consolidado para iniciar sin pensar el hábito que más te cuesta."
        };
      },
      scenarios: [
        { range: "Éxito ≥ 85%", label: "Hábito Estrella", text: "Hábito integrado de manera natural en tu día.", tip: "Utilizar como ancla para nuevos hábitos." },
        { range: "Éxito 40 - 70%", label: "Hábito Medio", text: "Progreso variable según la energía del día.", tip: "Vincular a un momento exacto del día." },
        { range: "Éxito < 40%", label: "Hábito en Riesgo", text: "Alta tasa de olvido o resistencia.", tip: "Reducir la exigencia a la mitad." }
      ]
    },
    "tracker-weekly-bars": {
      title: "Comparativa Semanal de Cumplimiento",
      icon: "📊",
      meaning: "Visualiza la evolución de hábitos completados semana a semana. Te ayuda a detectar en qué semanas tu disciplina fue más alta y en cuáles bajó la guardia.",
      getDiagnosis: (d) => `En las semanas analizadas has completado un total de **${d.totalChecksDone} hábitos**.`,
      getCurrentAdvice: (d) => ({
        situation: "Análisis de ciclos semanales",
        phrase: "Observa si tus semanas coinciden con entregas académicas o cambios de rutina.",
        advice: "Cuando preveas una semana intensa de exámenes, activa un 'modo mínimo de supervivencia' para tus hábitos más esenciales en lugar de abandonarlos todos."
      }),
      scenarios: [
        { range: "Semanas altas", label: "Consistencia", text: "Alto volumen de hábitos cumplidos de forma continuada.", tip: "Proteger el descanso para mantener el nivel." },
        { range: "Semanas valle", label: "Interrupción", text: "Caídas pronunciadas por viajes o picos de trabajo.", tip: "Retomar con el hábito más breve al volver a la rutina." }
      ]
    },
    "tracker-weekday": {
      title: "Distribución de Hábitos por Día",
      icon: "📅",
      meaning: "Agrega todos tus checks según el día de la semana (Lunes a Domingo) para descubrir en qué días tienes mayor adherencia y en cuáles se produce una mayor caída de atención.",
      getDiagnosis: (d) => {
        let bestDay = "Lunes";
        let maxC = 0;
        Object.values(d.weekdayTotals).forEach(w => { if (w.checks > maxC) { maxC = w.checks; bestDay = w.name; } });
        return `Tu día con mayor cumplimiento de hábitos es el **${bestDay}** (**${maxC} checks** totales).`;
      },
      getCurrentAdvice: (d) => ({
        situation: "Alineación de rutinas con tu semana",
        phrase: "Los fines de semana suelen romper las rutinas que dependen de horarios fijos.",
        advice: "Diseña un disparador independiente para el fin de semana si notas que tus hábitos caen en sábado o domingo."
      }),
      scenarios: [
        { range: "Caída en fin de semana", label: "Efecto Desconexión", text: "Sábado y domingo presentan caídas de más del 50%.", tip: "Fijar una versión corta de 5 minutos para el fin de semana." },
        { range: "Reparto uniforme", label: "Rutina Blindada", text: "Cumplimiento parejo de lunes a domingo.", tip: "Felicidades; tu sistema no depende de estar trabajando o libre." }
      ]
    },
    "tracker-health": {
      title: "Matriz de Salud de Hábitos",
      icon: "🩺",
      meaning: "Radiografía detallada del estado de salud de cada uno de tus hábitos: porcentaje de adherencia, días totales completados y racha actual ininterrumpida.",
      getDiagnosis: (d) => `Tienes **${d.totalHabits} hábitos** registrados en tu Tracker.`,
      getCurrentAdvice: (d) => ({
        situation: "Mantenimiento preventivo de hábitos",
        phrase: "Los hábitos marcados 'En Riesgo' necesitan una simplificación antes de ser abandonados por completo.",
        advice: "Si un hábito lleva varios días en riesgo, reduce su meta mensual en el Tracker o baja el nivel de exigencia por sesión."
      }),
      scenarios: [
        { range: "Consolidado (≥ 70%)", label: "Saludable", text: "Hábito sólido y con buen arraigo.", tip: "Mantener el registro sin cambios." },
        { range: "En Progreso (40-69%)", label: "Atención Media", text: "Cumplimiento parcial con días perdidos.", tip: "Eliminar fricciones de inicio." },
        { range: "En Riesgo (< 40%)", label: "Peligro de Abandono", text: "Pocos registros en el periodo.", tip: "Rediseñar o pausar temporalmente." }
      ]
    }
  };

  const INSIGHTS_KNOWLEDGE_BASE_EN = {
    score: {
      title: "Global Performance Score",
      icon: "🏆",
      meaning: "A composite executive indicator (0-100) summarizing your overall development health. It weights daily goal adherence (30%), pace consistency (25%), subject/hobby diversification (20%), mood and energy (15%), and active streak (10%). It measures quality and sustainability, not just brute hours.",
      getDiagnosis: (d) => `Your current score is **${d.globalScore}/100**, placing you in the **${d.globalScore >= 90 ? "Elite Performance" : (d.globalScore >= 75 ? "Consistent & Optimal" : (d.globalScore >= 55 ? "Good Pace" : "In Development"))}** tier.`,
      getCurrentAdvice: (d) => {
        if (d.globalScore >= 90) return { situation: "Score ≥ 90 (Elite Tier)", phrase: "Your discipline, continuity, and balance are outstanding.", advice: "Avoid forcing more hours; your key challenge now is protecting recovery and sustaining this pace without burnout." };
        if (d.globalScore >= 75) return { situation: "Score 75 - 89 (Optimal Tier)", phrase: "You are advancing steadily across almost all areas.", advice: "Check if any subject is lagging behind or if specific days show sharp drops to reach the elite level." };
        if (d.globalScore >= 55) return { situation: "Score 55 - 74 (Good Pace)", phrase: "You have regular activity but with noticeable fluctuations.", advice: "Ensure minimum 30-45 minute sessions on low-energy days to build a rock-solid baseline score." };
        return { situation: "Score < 55 (In Development)", phrase: "You are in an early phase or dealing with erratic momentum.", advice: "Set a very achievable daily target in Settings (e.g. 1-2 hours) to accumulate quick wins and gain traction." };
      },
      scenarios: [
        { range: "≥ 90 pts", label: "Elite", text: "Exceptional balance, high goal fidelity, and healthy recovery.", tip: "Consolidate the rhythm and avoid extreme self-criticism." },
        { range: "75 - 89 pts", label: "Optimal", text: "Very consistent productivity with minor isolated dips.", tip: "Address secondary topics and keep weekends balanced." },
        { range: "55 - 74 pts", label: "Good Pace", text: "Active progress with sporadic zero-days or loose targets.", tip: "Lock in a guaranteed daily minimum and avoid postponing difficult tasks." },
        { range: "< 55 pts", label: "In Development", text: "Scattered pace or insufficient logs to stabilize metrics.", tip: "Lower the starting target and log small daily blocks." }
      ]
    },
    regularity: {
      title: "Regularity Index",
      icon: "🌊",
      meaning: "Evaluates how stable your daily study hours are day over day. Analyzes variance against your average. Rewards steady continuous flow and penalizes the rollercoaster cramming effect (8-hour cram days followed by zero-days).",
      getDiagnosis: (d) => `Your regularity index is **${d.regularityScore}%**. Your daily average for this period is **${App.Utils.formatTime(d.meanDaily)}/day**.`,
      getCurrentAdvice: (d) => {
        if (d.regularityScore >= 80) return { situation: "Regularity ≥ 80% (Steady Flow)", phrase: "Your daily commitment is exceptionally uniform.", advice: "This is the most effective approach for long-term retention: digestible daily doses without cognitive fatigue." };
        if (d.regularityScore >= 60) return { situation: "Regularity 60 - 79% (Moderate)", phrase: "Acceptable pace with understandable weekend fluctuations.", advice: "Ensure rest days don't completely zero out if you have pending review backlogs." };
        return { situation: "Regularity < 60% (Peaks & Valleys)", phrase: "Sharp alternating pattern between marathon sessions and empty days.", advice: "Cap maximum hours on intense days and set a 30-minute floor on quiet days to prevent burnout." };
      },
      scenarios: [
        { range: "≥ 80%", label: "Consistent", text: "Progress without spikes or crashes; habit is shielded.", tip: "Optimal for memory retention and peace of mind." },
        { range: "60 - 79%", label: "Flexible", text: "Moderate fluctuations with good overall weekly rhythm.", tip: "Maintain momentum immediately following weekends." },
        { range: "< 60%", label: "Erratic", text: "Binge-studying followed by cognitive fatigue and blank days.", tip: "Set 30-minute minimum sessions to protect momentum." }
      ]
    },
    goal: {
      title: "Daily Target & Time Goals",
      icon: "🎯",
      meaning: "Measures what percentage of evaluated days you achieve or exceed your daily targeted study hours configured in Settings. You can also configure specific targets per subject and hobby.",
      getDiagnosis: (d) => d.dailyGoal > 0
        ? `Your daily target is **${d.dailyGoal}h**. You achieved it on **${d.goalMetDays} of ${d.elapsedDays} days** (**${d.goalPct}%** fulfillment).`
        : "You currently have no numerical daily target set in Settings.",
      getCurrentAdvice: (d) => {
        if (d.dailyGoal <= 0) return { situation: "No Target Set", phrase: "You are not yet measuring progress against a defined daily goal.", advice: "Click 'Settings' on the top card to set a realistic goal (e.g. 3h, 5h or whatever fits your term)." };
        if (d.goalPct >= 80) return { situation: "Fulfillment ≥ 80%", phrase: "You reach your daily goal with ease and disciplined execution.", advice: "Your commitment is solid. If you feel comfortable, consider slightly raising your target in Settings." };
        if (d.goalPct >= 50) return { situation: "Fulfillment 50 - 79%", phrase: "You reach your goal on half or more of all days.", advice: "Identify what roadblocks arise on missed days to eliminate recurrent distractions." };
        return { situation: "Fulfillment < 50%", phrase: "The current target exceeds your sustained real-world capacity.", advice: "Adjust the goal to a more realistic figure in Settings to generate frequent morale-boosting wins." };
      },
      scenarios: [
        { range: "≥ 80%", label: "Mastered", text: "Goal is fully integrated into your natural daily routine.", tip: "Consider adding 30-45 minutes if seeking higher demand." },
        { range: "50 - 79%", label: "In Progress", text: "Good forward progress with occasional interrupted days.", tip: "Protect priority time blocks during the earliest part of the day." },
        { range: "< 50%", label: "Mismatched", text: "Target set too high compared to calendar reality.", tip: "Lower the goal in Settings to restore the feeling of achievement." }
      ]
    },
    trend: {
      title: "Weekly Trend (Week-over-Week)",
      icon: "📈",
      meaning: "Compares your logged study volume from the current week against the previous full week. Reveals whether your work inertia is accelerating, stabilizing, or slowing down.",
      getDiagnosis: (d) => `This week you have logged **${App.Utils.formatTime(d.curWeek ? d.curWeek.total : 0)}** versus **${App.Utils.formatTime(d.prevWeek ? d.prevWeek.total : 0)}** last week (a change of **${d.wowDeltaHours >= 0 ? "+" : ""}${App.Utils.formatTime(d.wowDeltaHours)}**, **${d.wowDeltaHours >= 0 ? "+" : ""}${d.wowDeltaPct}%**).`,
      getCurrentAdvice: (d) => {
        if (d.wowDeltaHours > 2) return { situation: "Noticeable Growth (> +2h)", phrase: "You are experiencing positive acceleration.", advice: "Ensure this surge is backed by focused blocks rather than rushed late-night sessions." };
        if (d.wowDeltaHours >= -2) return { situation: "Stable Pace (±2h)", phrase: "You are sustaining steady output week over week.", advice: "Consistency between weeks is the greatest asset of a high-performing learner." };
        return { situation: "Decline (> -2h)", phrase: "This week logs less dedication than the previous one.", advice: "If deliberate scheduled rest, this is healthy. If not, schedule a short session to reboot." };
      },
      scenarios: [
        { range: "> +15%", label: "Acceleration", text: "Significant increase in logged time over last week.", tip: "Consolidate new topics without cutting into sleep hours." },
        { range: "± 10%", label: "Stable", text: "Predictable and robust working cadence.", tip: "Keep the exact schedule that is currently serving you." },
        { range: "< -15%", label: "Slowdown", text: "Substantial drop in hours logged.", tip: "Check for accumulated fatigue or restart with a low-friction session." }
      ]
    },
    "weekly-bars": {
      title: "Week-over-Week Comparison",
      icon: "📊",
      meaning: "Displays the chronological evolution of dedicated time week by week, visually separating academic effort (subjects) from personal projects or rest (hobbies). Helps spot high-load cycles and recovery phases.",
      getDiagnosis: (d) => `Your weekly average over recent weeks is **${App.Utils.formatTime(d.weeksList.length ? d.totalHours / Math.max(1, d.weeksList.length) : 0)}/week**.`,
      getCurrentAdvice: (d) => ({
        situation: "Weekly Balance Breakdown",
        phrase: "Observe the ratio between study and hobby bars across each period.",
        advice: "Weeks with 65-80% study and 20-35% hobbies prove the most sustainable. Weeks with 100% study often precede sudden energy crashes."
      }),
      scenarios: [
        { range: "70/30 Ratio", label: "Balanced", text: "Academic focus with ample decompression and hobby time.", tip: "Ideal pattern for preventing long-term burnout." },
        { range: "100/0 Ratio", label: "Overload", text: "Zero time spent on decompression activities.", tip: "Schedule at least one hobby session to refresh cognitive clarity." },
        { range: "Post-deadline dips", label: "Recovery", text: "Very low weeks immediately following high peaks.", tip: "Plan deliberate micro-rests instead of forced exhaustion stops." }
      ]
    },
    diversification: {
      title: "Radial Diversification & Balance",
      icon: "🎯",
      meaning: "Evaluates how evenly your dedicated hours are distributed across all active subjects and hobbies. A balanced distribution ensures complex courses are not ignored until exam week.",
      getDiagnosis: (d) => `You have a **${Math.round(d.diversificationRatio)}%** diversification ratio. You dedicated time to **${d.itemsWithHours} of your ${d.items.length}** configured areas.`,
      getCurrentAdvice: (d) => {
        if (d.diversificationRatio >= 70) return { situation: "Diversification ≥ 70%", phrase: "Very balanced distribution across all commitments.", advice: "Maintain this rotation; interleaving topics strongly reinforces memory consolidation." };
        if (d.diversificationRatio >= 45) return { situation: "Diversification 45 - 69%", phrase: "Effort centered on 2-3 areas while others remain neglected.", advice: "Apply the minimum contact rule: spend at least 30 min per week on each secondary subject." };
        return { situation: "Diversification < 45%", phrase: "Hyper-focus or subjects left completely untouched.", advice: "Check which subjects sit at zero hours; avoiding tough courses creates critical emergencies later." };
      },
      scenarios: [
        { range: "≥ 70%", label: "Balanced", text: "Active contact with virtually all your projects.", tip: "High overall system health and retention." },
        { range: "45 - 69%", label: "Partial Focus", text: "Excessive time allocated to just a few courses.", tip: "Schedule short contact sessions for at-risk subjects." },
        { range: "< 45%", label: "Skewed", text: "Multiple subjects with zero accumulated dedication.", tip: "Unlock an initial low-friction review session immediately." }
      ]
    },
    mood: {
      title: "Energy / Mood vs Effort Correlation",
      icon: "⚡",
      meaning: "Cross-references your daily star rating (1★ to 5★) with actual recorded study hours. Uncovers whether your primary engine is motivation or pressure, and warns of chronic fatigue.",
      getDiagnosis: (d) => {
        const highCount = d.moodData[5].count + d.moodData[4].count;
        const lowCount = d.moodData[2].count + d.moodData[1].count;
        return `You logged **${highCount} days** with high energy (4-5★) and **${lowCount} days** with low or demanding mood (1-2★).`;
      },
      getCurrentAdvice: (d) => {
        const highCount = d.moodData[5].count + d.moodData[4].count;
        const highAvg = highCount > 0 ? (d.moodData[5].hours + d.moodData[4].hours) / highCount : 0;
        const lowCount = d.moodData[2].count + d.moodData[1].count;
        const lowAvg = lowCount > 0 ? (d.moodData[2].hours + d.moodData[1].hours) / lowCount : 0;
        if (highCount > 0 && lowCount > 0 && highAvg > lowAvg) {
          return { situation: "Wellbeing-Output Synergy", phrase: "Your hours naturally increase when feeling motivated and rested.", advice: "Protecting sleep, exercise, and hobbies directly boosts academic returns." };
        }
        if (highCount > 0 && lowCount > 0 && lowAvg > highAvg) {
          return { situation: "Pressure-Driven Fatigue Alert", phrase: "You log the most hours on days with lowest satisfaction.", advice: "Beware presenteeism: studying while exhausted dramatically reduces information retention." };
        }
        return { situation: "Stable Rhythm", phrase: "You sustain steady output irrespective of daily mood swings.", advice: "Continue rating daily to enrich long-term insights." };
      },
      scenarios: [
        { range: "Strong Positive", label: "Wellbeing Engine", text: "Best performance occurs when rested and cheerful.", tip: "Prioritize health habits to fuel study capacity." },
        { range: "Negative", label: "Overload", text: "More hours on 1-2★ days due to emergencies or stress.", tip: "Schedule mandatory recovery breaks to prevent burnout." },
        { range: "Neutral", label: "Disciplined", text: "Steady hours regardless of fluctuating feelings.", tip: "Great work ethic and strong procrastination control." }
      ]
    },
    weekday: {
      title: "Weekly Work Pattern",
      icon: "📅",
      meaning: "Aggregates total hours by day of the week (Monday through Sunday) to highlight your natural peak concentration days and habitual rest or distraction periods.",
      getDiagnosis: (d) => {
        let bestDay = "Monday";
        let maxH = 0;
        Object.values(d.weekdayTotals).forEach(w => { if (w.hours > maxH) { maxH = w.hours; bestDay = w.name; } });
        return `Your highest volume day is **${bestDay}** (**${App.Utils.formatTime(maxH)}** total).`;
      },
      getCurrentAdvice: (d) => ({
        situation: "Strategic Week Schedule",
        phrase: "Knowing your natural peak days lets you place the hardest tasks at the right moment.",
        advice: "Schedule complex new concepts on peak days and reserve quiet days for mechanical tasks or rest."
      }),
      scenarios: [
        { range: "Early Week Peak", label: "Strong Start", text: "Monday and Tuesday shoulder the heaviest burden.", tip: "Capitalize on initial energy for tough topics." },
        { range: "Weekend Peak", label: "Deadline Mode", text: "Fridays or weekends heavily loaded.", tip: "Try moving tasks forward to protect weekend recovery." },
        { range: "Even Distribution", label: "Uniform Pace", text: "Similar workload across all days of the week.", tip: "Ensure you maintain at least one full day of real disconnection." }
      ]
    },
    health: {
      title: "Strategic Diagnosis by Subject",
      icon: "🩺",
      meaning: "Real-time evaluation of each subject's health crossing: dedicated hours, days since last contact, course difficulty, and overdue checklist tasks.",
      getDiagnosis: (d) => `You are currently tracking **${d.activeSubjects.length} active subjects** in this period.`,
      getCurrentAdvice: (d) => ({
        situation: "Forgetting Curve Prioritization",
        phrase: "Memory retention drops sharply after 5-7 days without topic contact.",
        advice: "Prioritize subjects flagged as 'High Priority' or 'Needs Review' with a brief review before restart costs spike."
      }),
      scenarios: [
        { range: "Up to date", label: "Healthy", text: "Recent review and sufficient hours logged.", tip: "Maintain regular spaced review intervals." },
        { range: "Needs Review", label: "Medium Alert", text: "Over 5 days without contact or progress under 50%.", tip: "Schedule a 45-minute refresher this week." },
        { range: "High Priority", label: "Critical", text: "Challenging subject with overdue tasks or weeks idle.", tip: "Unlock immediately with a quick review of the main outline." }
      ]
    },
    "tracker-adherence": {
      title: "Routine Adherence Rate",
      icon: "📋",
      meaning: "Measures the completion rate of your habits against total scheduled daily commitments in the evaluated period. A healthy rate proves habits are integrated without overloading you.",
      getDiagnosis: (d) => `Your adherence rate is **${d.adherenceRate}%** (${d.totalChecksDone} checks of ${d.totalScheduled} scheduled). You were active on **${d.activeDays} of ${d.totalDays} days**.`,
      getCurrentAdvice: (d) => {
        if (d.adherenceRate >= 80) return { situation: "Adherence ≥ 80% (Anchored Habit)", phrase: "Your routine system functions with fluid consistency.", advice: "Protect this momentum and resist the temptation to crowd your list with too many new habits." };
        if (d.adherenceRate >= 50) return { situation: "Adherence 50 - 79% (Moderate Continuity)", phrase: "Good progress with occasional days of lapse.", advice: "Review which specific habits get skipped and lower their initial barrier." };
        return { situation: "Adherence < 50% (System Friction)", phrase: "Completion rate is lower than optimal.", advice: "Trim your habits down to 2-3 essential actions until daily momentum returns." };
      },
      scenarios: [
        { range: "≥ 80%", label: "Consolidated", text: "Habits executed automatically almost daily.", tip: "Protect momentum and avoid habit fatigue." },
        { range: "50 - 79%", label: "In Progress", text: "Stable execution with dips during busy weeks.", tip: "Prepare contingency plans for intense days." },
        { range: "< 50%", label: "Overload", text: "Too much friction or too many habits at once.", tip: "Prune secondary habits and focus on 1-2 vitals." }
      ]
    },
    "tracker-streak": {
      title: "Average Streak & Continuity",
      icon: "🔥",
      meaning: "Evaluates uninterrupted consecutive days completing your habits. Unbroken chains build powerful psychological inertia and eliminate startup friction.",
      getDiagnosis: (d) => `Your current average streak is **${d.avgStreak} days**. Your longest streak in this period is **${d.maxActiveStreak} days**.`,
      getCurrentAdvice: (d) => {
        if (d.avgStreak >= 7) return { situation: "Streak ≥ 7 days (Full Momentum)", phrase: "You have impeccable continuity.", advice: "Inertia works in your favor. Remember the golden rule: never miss two days in a row." };
        if (d.avgStreak >= 3) return { situation: "Streak 3 - 6 days (Active Chain)", phrase: "You are consolidating consecutive days.", advice: "The leap from 3 to 7 days carries the most mental friction. Stay focused on today's target." };
        return { situation: "Streak < 3 days (Fragile Chain)", phrase: "Frequent breaks interrupt continuity.", advice: "Focus exclusively on your easiest habit and secure a 3-day streak to gain confidence." };
      },
      scenarios: [
        { range: "≥ 14 days", label: "Automated", text: "Habit is woven into your daily identity.", tip: "Celebrate milestones without getting complacent." },
        { range: "4 - 13 days", label: "Consolidating", text: "Solid chain requiring mindful attention.", tip: "Never let 2 consecutive days slip." },
        { range: "1 - 3 days", label: "Early Stage", text: "Vulnerable to unexpected events and low energy.", tip: "Lower difficulty to the absolute bare minimum." }
      ]
    },
    "tracker-wow": {
      title: "Weekly Habit Evolution (WoW)",
      icon: "📈",
      meaning: "Compares total completed habits between the current week and the previous week. Informs you if consistency is climbing or sliding.",
      getDiagnosis: (d) => `This week you completed **${d.curWeek ? d.curWeek.checks : 0} habits** compared to **${d.prevWeek ? d.prevWeek.checks : 0}** last week (a change of **${d.wowDeltaChecks >= 0 ? "+" : ""}${d.wowDeltaChecks}**, **${d.wowDeltaChecks >= 0 ? "+" : ""}${d.wowDeltaPct}%**).`,
      getCurrentAdvice: (d) => {
        if (d.wowDeltaChecks > 0) return { situation: "Positive Trend", phrase: "You are actively improving weekly discipline.", advice: "Use this wave of motivation to cement your morning routines." };
        if (d.wowDeltaChecks === 0) return { situation: "Weekly Stability", phrase: "You maintain the exact same check volume.", advice: "Stability is great; ensure habits are completed before nighttime." };
        return { situation: "Weekly Dip", phrase: "Fewer habits completed than last week.", advice: "Don't fret; check if exam crunches intervened and calibrate expectations." };
      },
      scenarios: [
        { range: "Increase > +20%", label: "Acceleration", text: "Greater discipline and focus on routines.", tip: "Make sure this remains sustainable long term." },
        { range: "Change ± 10%", label: "Consistent", text: "Reliable and steady habit tracking.", tip: "Keep your trusted environmental cues." },
        { range: "Decline > -20%", label: "Lost Focus", text: "Friction or neglected habit list.", tip: "Reactivate the easiest habit in the tracker first." }
      ]
    },
    "tracker-star": {
      title: "Star Habit vs At-Risk Habit",
      icon: "⭐",
      meaning: "Contrasts your highest-performing habit (mastered) with the one showing the lowest completion rate. Allows using your strong habit as an anchor to pull up the lagging one.",
      getDiagnosis: (d) => d.starHabit
        ? `Your star habit is **${App.Utils.escapeHtml(d.starHabit.emoji)} ${App.Utils.escapeHtml(d.starHabit.name)}** with a **${d.starHabit.adherencePct}% completion rate** (${d.starHabit.checks} days).${d.atRiskHabit && d.atRiskHabit.id !== d.starHabit.id ? ` Your habit with highest room for improvement is **${App.Utils.escapeHtml(d.atRiskHabit.emoji)} ${App.Utils.escapeHtml(d.atRiskHabit.name)}** (${d.atRiskHabit.adherencePct}%).` : ""}`
        : "Not enough habit data yet to classify your routines.",
      getCurrentAdvice: (d) => {
        if (!d.starHabit) return { situation: "No Data", phrase: "Check off habits in the Tracker to unlock performance insights.", advice: "Head to the Tracker tab and complete this month's checks." };
        return {
          situation: "Habit Stacking Technique",
          phrase: `Execute your at-risk habit immediately after ${d.starHabit.name}.`,
          advice: "Harness the momentum of your anchored habit to seamlessly trigger the harder action."
        };
      },
      scenarios: [
        { range: "Success ≥ 85%", label: "Star Habit", text: "Habit is naturally ingrained in your daily rhythm.", tip: "Use as an anchor to launch new routines." },
        { range: "Success 40 - 70%", label: "Moderate Habit", text: "Variable adherence depending on daily energy.", tip: "Attach to an exact, non-negotiable time of day." },
        { range: "Success < 40%", label: "At-Risk Habit", text: "High rate of avoidance or forgetfulness.", tip: "Halve the requirements to make it effortless." }
      ]
    },
    "tracker-weekly-bars": {
      title: "Weekly Habit Completion Comparison",
      icon: "📊",
      meaning: "Visualizes the evolution of completed habits week by week. Detects high-discipline cycles and low-energy valleys.",
      getDiagnosis: (d) => `Across analyzed weeks, you completed a total of **${d.totalChecksDone} habits**.`,
      getCurrentAdvice: (d) => ({
        situation: "Weekly Cycle Analysis",
        phrase: "Observe if dips align with heavy deadlines or routine disruptions.",
        advice: "When anticipating an intense exam week, switch to a minimal survival mode for essential habits instead of ditching all of them."
      }),
      scenarios: [
        { range: "High Weeks", label: "Consistency", text: "High volume of habits executed continuously.", tip: "Protect rest to maintain high stamina." },
        { range: "Low Weeks", label: "Interruption", text: "Noticeable drops due to travel or work crunches.", tip: "Restart with the shortest habit upon returning." }
      ]
    },
    "tracker-weekday": {
      title: "Habit Distribution by Weekday",
      icon: "📅",
      meaning: "Aggregates all checks by day of the week (Monday through Sunday) to pinpoint which days offer highest adherence and where focus drops off.",
      getDiagnosis: (d) => {
        let bestDay = "Monday";
        let maxC = 0;
        Object.values(d.weekdayTotals).forEach(w => { if (w.checks > maxC) { maxC = w.checks; bestDay = w.name; } });
        return `Your highest habit completion day is **${bestDay}** (**${maxC} total checks**).`;
      },
      getCurrentAdvice: (d) => ({
        situation: "Weekly Routine Alignment",
        phrase: "Weekends frequently disrupt routines that rely on fixed weekdays.",
        advice: "Design a dedicated weekend trigger if you notice your habits plummet on Saturday or Sunday."
      }),
      scenarios: [
        { range: "Weekend Drop", label: "Disconnection Effect", text: "Saturday and Sunday drop by more than 50%.", tip: "Set a 5-minute lightweight weekend version." },
        { range: "Even Spread", label: "Shielded Routine", text: "Consistent completion from Monday to Sunday.", tip: "Congratulations; your system is resilient regardless of work or free days." }
      ]
    },
    "tracker-health": {
      title: "Habit Health Matrix",
      icon: "🩺",
      meaning: "Detailed diagnostic of each habit: adherence rate, total completed days, and current uninterrupted streak.",
      getDiagnosis: (d) => `You have **${d.totalHabits} habits** tracked in your routine matrix.`,
      getCurrentAdvice: (d) => ({
        situation: "Preventative Habit Care",
        phrase: "Habits marked 'At Risk' need streamlining before being completely abandoned.",
        advice: "If a habit remains at risk for multiple days, lower its monthly goal in the Tracker or reduce the per-session expectation."
      }),
      scenarios: [
        { range: "Consolidated (≥ 70%)", label: "Healthy", text: "Solid habit with deep roots.", tip: "Maintain current logging without changes." },
        { range: "In Progress (40-69%)", label: "Moderate Care", text: "Partial execution with missed days.", tip: "Remove friction at the start of the action." },
        { range: "At Risk (< 40%)", label: "Risk of Abandonment", text: "Few logs during this period.", tip: "Redesign or temporarily pause." }
      ]
    }
  };

  // --- CÁLCULO DE DATOS DEL DASHBOARD DE TRACKER / HÁBITOS ---
  function calculateTrackerDashboardData(keys) {
    const rawHabits = (App.State.state?.routineTracker?.habits || []);
    const habits = rawHabits.map(h => ({
      id: h.id,
      name: h.name || "Hábito",
      emoji: h.emoji || "⭐",
      goal: Math.max(1, Number(h.goal) || 30)
    }));

    const monthlyChecks = App.State.state?.routineTracker?.monthlyChecks || {};
    const totalHabits = habits.length;
    const totalDays = keys.length || 1;

    let totalChecksDone = 0;
    const habitStats = {};
    habits.forEach(h => {
      habitStats[h.id] = {
        ...h,
        checks: 0,
        checksByDate: {},
        currentStreak: 0,
        maxStreak: 0,
        adherencePct: 0
      };
    });

    const weekdayTotals = {
      1: { name: "Lunes", short: "Lun", checks: 0 },
      2: { name: "Martes", short: "Mar", checks: 0 },
      3: { name: "Miércoles", short: "Mié", checks: 0 },
      4: { name: "Jueves", short: "Jue", checks: 0 },
      5: { name: "Viernes", short: "Vie", checks: 0 },
      6: { name: "Sábado", short: "Sáb", checks: 0 },
      0: { name: "Domingo", short: "Dom", checks: 0 }
    };

    const weeksMap = {};
    const daysWithAnyCheck = new Set();

    keys.forEach(k => {
      const mKey = k.slice(0, 7);
      const dayNum = parseInt(k.slice(8, 10), 10);
      const dateObj = App.Utils.parseKey(k);
      const dow = dateObj.getDay();

      const weekInfo = getISOWeekInfo(k);
      if (!weeksMap[weekInfo.weekKey]) {
        weeksMap[weekInfo.weekKey] = {
          ...weekInfo,
          checks: 0,
          daysCount: 0
        };
      }
      weeksMap[weekInfo.weekKey].daysCount++;

      let dayChecksCount = 0;
      habits.forEach(h => {
        const isDone = Boolean(monthlyChecks[mKey]?.[h.id]?.[dayNum]);
        if (isDone) {
          totalChecksDone++;
          habitStats[h.id].checks++;
          habitStats[h.id].checksByDate[k] = true;
          weekdayTotals[dow].checks++;
          weeksMap[weekInfo.weekKey].checks++;
          dayChecksCount++;
        }
      });

      if (dayChecksCount > 0) {
        daysWithAnyCheck.add(k);
      }
    });

    const sortedKeysAsc = [...keys].sort();
    habits.forEach(h => {
      let streak = 0;
      let maxS = 0;
      sortedKeysAsc.forEach(k => {
        if (habitStats[h.id].checksByDate[k]) {
          streak++;
          if (streak > maxS) maxS = streak;
        } else {
          streak = 0;
        }
      });
      habitStats[h.id].maxStreak = maxS;

      let curS = 0;
      for (let i = sortedKeysAsc.length - 1; i >= 0; i--) {
        const k = sortedKeysAsc[i];
        if (habitStats[h.id].checksByDate[k]) {
          curS++;
        } else {
          break;
        }
      }
      habitStats[h.id].currentStreak = curS;
      habitStats[h.id].adherencePct = totalDays > 0 ? Math.min(100, Math.round((habitStats[h.id].checks / totalDays) * 100)) : 0;
    });

    const totalScheduled = totalHabits * totalDays;
    const adherenceRate = totalScheduled > 0 ? Math.min(100, Math.round((totalChecksDone / totalScheduled) * 100)) : 0;

    const habitsList = Object.values(habitStats).sort((a, b) => b.adherencePct - a.adherencePct || b.checks - a.checks);
    const starHabit = habitsList.length > 0 && habitsList[0].checks > 0 ? habitsList[0] : null;
    const atRiskHabit = habitsList.length > 1 ? habitsList[habitsList.length - 1] : (habitsList.length === 1 && habitsList[0].checks === 0 ? habitsList[0] : null);

    const avgStreak = habitsList.length > 0 ? Math.round(habitsList.reduce((acc, h) => acc + h.currentStreak, 0) / habitsList.length) : 0;
    const maxActiveStreak = habitsList.length > 0 ? Math.max(0, ...habitsList.map(h => h.maxStreak)) : 0;

    const weeksList = Object.values(weeksMap).sort((a, b) => a.weekKey.localeCompare(b.weekKey));
    const curWeekKey = getISOWeekInfo(App.Utils.getTodayDateKey()).weekKey;
    const curWeek = weeksMap[curWeekKey] || (weeksList.length ? weeksList[weeksList.length - 1] : null);
    const curWeekIdx = weeksList.findIndex(w => w.weekKey === curWeekKey);
    const prevWeek = curWeekIdx > 0 ? weeksList[curWeekIdx - 1] : (weeksList.length > 1 ? weeksList[weeksList.length - 2] : null);

    const curWeekChecks = curWeek ? curWeek.checks : 0;
    const prevWeekChecks = prevWeek ? prevWeek.checks : 0;
    const wowDeltaChecks = curWeekChecks - prevWeekChecks;
    const wowDeltaPct = prevWeekChecks > 0 ? Math.round((wowDeltaChecks / prevWeekChecks) * 100) : (curWeekChecks > 0 ? 100 : 0);

    return {
      habits,
      totalHabits,
      totalDays,
      totalChecksDone,
      totalScheduled,
      adherenceRate,
      activeDays: daysWithAnyCheck.size,
      avgStreak,
      maxActiveStreak,
      habitsList,
      starHabit,
      atRiskHabit,
      weekdayTotals,
      weeksList,
      curWeek,
      prevWeek,
      wowDeltaChecks,
      wowDeltaPct
    };
  }

  // --- RENDERIZADORES DE GRÁFICOS Y TABLAS DE TRACKER ---
  function renderTrackerWeeklyBarChartSvg(weeksList, totalHabits) {
    if (!weeksList.length || totalHabits === 0) {
      return `<div class="insights-empty-chart">No hay registros de hábitos en este periodo.</div>`;
    }
    const maxPossiblePerWeek = Math.max(1, 7 * totalHabits);
    const maxChecksInPeriod = Math.max(1, ...weeksList.map(w => w.checks));
    const maxVal = Math.max(maxChecksInPeriod, maxPossiblePerWeek);

    const svgWidth = 560;
    const svgHeight = 180;
    const padBottom = 28;
    const padTop = 18;
    const chartHeight = svgHeight - padBottom - padTop;
    const count = weeksList.length;
    const colWidth = Math.min(60, Math.floor((svgWidth - 40) / Math.max(1, count)));
    const barWidth = Math.max(12, Math.floor(colWidth * 0.48));

    let barsSvg = "";
    let labelsSvg = "";

    weeksList.forEach((w, i) => {
      const xCenter = 30 + i * colWidth + colWidth / 2;
      const hChecks = (w.checks / maxVal) * chartHeight;
      const yChecks = padTop + (chartHeight - hChecks);

      barsSvg += `
        <g class="chart-bar-group tracker-bar-group" data-week-checks="${w.checks}" data-week-range="${App.Utils.escapeHtml(w.rangeLabel)}">
          <rect x="${xCenter - barWidth / 2}" y="${padTop}" width="${barWidth}" height="${chartHeight}" rx="4" fill="rgba(255,255,255,0.03)" />
          <rect x="${xCenter - barWidth / 2}" y="${yChecks}" width="${barWidth}" height="${Math.max(2, hChecks)}" rx="4" fill="#10b981" />
          <text x="${xCenter}" y="${Math.max(padTop + 10, yChecks - 4)}" text-anchor="middle" fill="var(--ink)" font-size="9" font-weight="700">${w.checks}</text>
        </g>
      `;

      labelsSvg += `
        <text x="${xCenter}" y="${svgHeight - 8}" text-anchor="middle" fill="var(--muted)" font-size="9">${App.Utils.escapeHtml(w.shortLabel)}</text>
      `;
    });

    return `
      <div class="weekly-chart-wrapper">
        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="weekly-bars-svg" preserveAspectRatio="none">
          ${barsSvg}
          ${labelsSvg}
        </svg>
        <div class="weekly-chart-status" id="trackerWeeklyChartStatusStrip">
          <span>Pasa el cursor sobre una semana para ver los hábitos completados.</span>
        </div>
      </div>
    `;
  }

  function renderTrackerWeekdayDistribution(weekdayTotals) {
    const daysOrder = [1, 2, 3, 4, 5, 6, 0];
    const maxVal = Math.max(1, ...daysOrder.map(d => weekdayTotals[d].checks));

    let bestDow = 1;
    let maxChecks = 0;
    daysOrder.forEach(d => {
      if (weekdayTotals[d].checks > maxChecks) {
        maxChecks = weekdayTotals[d].checks;
        bestDow = d;
      }
    });

    let barsHtml = "";
    daysOrder.forEach(d => {
      const item = weekdayTotals[d];
      const pct = maxVal > 0 ? (item.checks / maxVal) * 100 : 0;
      const isBest = d === bestDow && item.checks > 0;

      barsHtml += `
        <div class="weekday-bar-row ${isBest ? "highlight-best" : ""}">
          <span class="weekday-name">${item.short}</span>
          <div class="weekday-track">
            <div class="weekday-fill" style="width: ${pct}%; background: #10b981;"></div>
          </div>
          <span class="weekday-val">${item.checks > 0 ? `${item.checks} checks` : "—"}</span>
          ${isBest ? `<span class="weekday-best-badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">Pico</span>` : ""}
        </div>
      `;
    });

    return `
      <div class="weekday-distribution-card">
        <div class="weekday-list">
          ${barsHtml}
        </div>
        <div class="weekday-footer-note">
          <span>Día con mayor adherencia a hábitos: <strong>${weekdayTotals[bestDow].name}</strong> (${weekdayTotals[bestDow].checks} completados)</span>
        </div>
      </div>
    `;
  }

  function renderTrackerHabitsHealthTable(habitsList) {
    if (!habitsList.length) {
      return `<div class="insights-empty-chart">No hay hábitos configurados en el Tracker.</div>`;
    }

    let rowsHtml = "";
    habitsList.forEach(h => {
      let statusBadge = `<span class="health-badge healthy" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">Consolidado</span>`;
      if (h.adherencePct < 40) {
        statusBadge = `<span class="health-badge danger" style="background: rgba(239, 68, 68, 0.15); color: #ef4444;">En Riesgo</span>`;
      } else if (h.adherencePct < 70) {
        statusBadge = `<span class="health-badge warning" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b;">En Progreso</span>`;
      }

      rowsHtml += `
        <div class="health-table-row">
          <div class="health-cell-name">
            <span style="font-size: 1.25rem; margin-right: 6px;">${App.Utils.escapeHtml(h.emoji || "⭐")}</span>
            <div>
              <strong>${App.Utils.escapeHtml(h.name)}</strong>
              <small>Objetivo mensual: ${h.goal} días</small>
            </div>
          </div>
          <div class="health-cell-hours">
            <strong>${h.checks}</strong>
            <small>días completados</small>
          </div>
          <div class="health-cell-recency">
            <span>${h.currentStreak > 0 ? `🔥 ${h.currentStreak} días` : "0 días"}</span>
            <small style="display:block; color:var(--muted); font-size:0.72rem;">Máx: ${h.maxStreak}d</small>
          </div>
          <div class="health-cell-status">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="flex: 1; height: 6px; background: var(--line); border-radius: 999px; overflow: hidden; min-width: 50px;">
                <div style="width: ${h.adherencePct}%; height: 100%; background: #10b981; border-radius: 999px;"></div>
              </div>
              <strong style="font-size: 0.8rem; min-width: 35px;">${h.adherencePct}%</strong>
              ${statusBadge}
            </div>
          </div>
        </div>
      `;
    });

    return `
      <div class="health-table-wrapper">
        <div class="health-table-header">
          <span>Hábito</span>
          <span>Cumplimiento</span>
          <span>Racha Actual</span>
          <span>Adherencia & Estado</span>
        </div>
        ${rowsHtml}
      </div>
    `;
  }

  function renderTrackerActionableDirectives(data) {
    const directives = [];

    // Pilar 1: Adherencia & Volumen
    if (data.adherenceRate >= 75) {
      directives.push({
        pillar: "SISTEMA & DISCIPLINA",
        icon: "🎯",
        title: `Excelente adherencia general (${data.adherenceRate}%)`,
        desc: `Has cumplido ${data.totalChecksDone} registros de tus rutinas. Tu sistema de hábitos está bien calibrado. Evita añadir más de 1 nuevo hábito al mismo tiempo para no saturar tu fuerza de voluntad.`
      });
    } else if (data.adherenceRate >= 45) {
      directives.push({
        pillar: "SISTEMA & DISCIPLINA",
        icon: "⚡",
        title: `Adherencia moderada (${data.adherenceRate}%)`,
        desc: `Mantienes un cumplimiento regular pero con interrupciones. Prueba a anclar tus hábitos débiles a momentos fijos del día (por ejemplo, justo antes de empezar a estudiar o antes de cenar).`
      });
    } else {
      directives.push({
        pillar: "SISTEMA & DISCIPLINA",
        icon: "📌",
        title: "Simplifica la fricción inicial",
        desc: `Tu tasa de adherencia (${data.adherenceRate}%) indica resistencia. Reduce el tamaño de los hábitos difíciles a su versión mínima (regla de los 2 minutos) para facilitar la ejecución diaria.`
      });
    }

    // Pilar 2: Hábito Estrella y Racha
    if (data.starHabit) {
      directives.push({
        pillar: "INERCIA & HÁBITO ANCLA",
        icon: "⭐",
        title: `Apalanca "${data.starHabit.name}" (${data.starHabit.adherencePct}%)`,
        desc: `Este es tu hábito más sólido con ${data.starHabit.checks} días completados y racha de ${data.starHabit.currentStreak} días. Úsalo como 'hábito ancla': realiza tu hábito más difícil inmediatamente después de cumplir este.`
      });
    } else {
      directives.push({
        pillar: "INERCIA & ARRANQUE",
        icon: "🔥",
        title: "Enfócate en una primera racha de 3 días",
        desc: "El mayor esfuerzo se concentra en romper la inercia del día cero. Elige un solo hábito sencillo en el Tracker y comprométete a completarlo 3 días seguidos."
      });
    }

    // Pilar 3: Patrón de Fines de Semana vs Días Laborables
    const wkdayChecks = (data.weekdayTotals[1].checks + data.weekdayTotals[2].checks + data.weekdayTotals[3].checks + data.weekdayTotals[4].checks + data.weekdayTotals[5].checks) / 5;
    const wkendChecks = (data.weekdayTotals[6].checks + data.weekdayTotals[0].checks) / 2;

    if (wkendChecks < wkdayChecks * 0.5 && wkdayChecks > 0) {
      directives.push({
        pillar: "FINES DE SEMANA",
        icon: "🏖️",
        title: "Alerta de desconexión en fin de semana",
        desc: `Tus hábitos caen notablemente los sábados y domingos respecto a entre semana. Establece una versión simplificada de fin de semana para no reiniciar las rachas cada lunes.`
      });
    } else if (data.wowDeltaChecks > 0) {
      directives.push({
        pillar: "TENDENCIA SEMANAL",
        icon: "📈",
        title: `Crecimiento semanal positivo (+${data.wowDeltaChecks} checks)`,
        desc: `Has incrementado un ${data.wowDeltaPct}% tus registros frente a la semana pasada. Esta inercia positiva refuerza tu autodisciplina; mantén el ritmo sin sobreexigirte.`
      });
    } else {
      directives.push({
        pillar: "ESTABILIDAD SEMANAL",
        icon: "🌊",
        title: "Consistencia de Lunes a Domingo",
        desc: `Tu distribución semanal es equilibrada. Mantener este reparto previene el estrés de recuperación y asienta los hábitos en tu identidad a largo plazo.`
      });
    }

    return `
      <div class="insights-tips-grid">
        ${directives.slice(0, 3).map(d => `
          <div class="insights-tip-card">
            <span class="insights-tip-icon">${d.icon}</span>
            <div>
              <span class="insights-pillar-badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">${App.Utils.escapeHtml(d.pillar)}</span>
              <h4>${App.Utils.escapeHtml(d.title)}</h4>
              <p>${App.Utils.escapeHtml(d.desc)}</p>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  // --- MODAL DETALLADO DINÁMICO (3 PESTAÑAS: SIGNIFICADO, DIAGNÓSTICO, CONSEJOS) ---
  function openInsightsDetailModal(type, data) {
    const modal = document.getElementById("insightsDetailModal");
    if (!modal) return;

    const isEn = App.I18n?.getCurrentLanguage ? App.I18n.getCurrentLanguage() === "en" : false;
    const kb = isEn ? (INSIGHTS_KNOWLEDGE_BASE_EN[type] || INSIGHTS_KNOWLEDGE_BASE[type]) : INSIGHTS_KNOWLEDGE_BASE[type];
    const info = kb;
    if (!info) return;

    if (!data) {
      const keys = getFilteredRangeKeys();
      if (type.startsWith("tracker-")) {
        data = calculateTrackerDashboardData(keys);
      } else {
        data = calculateDashboardData(keys);
      }
    }

    const iconEl = document.getElementById("insightsDetailIcon");
    const titleEl = document.getElementById("insightsDetailTitle");
    const meaningEl = document.getElementById("insightsDetailMeaning");
    const statusEl = document.getElementById("insightsDetailStatus");
    const scenariosEl = document.getElementById("insightsDetailScenarios");

    if (iconEl) iconEl.textContent = info.icon;
    if (titleEl) titleEl.textContent = info.title;
    if (meaningEl) meaningEl.textContent = info.meaning;

    if (statusEl) {
      const diagText = typeof info.getDiagnosis === "function" ? info.getDiagnosis(data) : "";
      const currentAdv = typeof info.getCurrentAdvice === "function" ? info.getCurrentAdvice(data) : null;

      statusEl.innerHTML = `
        <p style="margin: 0 0 10px 0; font-size: 0.92rem; color: var(--ink); line-height: 1.45;">
          ${App.Utils.escapeHtml(diagText).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
        </p>
        ${currentAdv ? `
          <div class="current-advice-box">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="font-size: 0.76rem; font-weight: 850; text-transform: uppercase; letter-spacing: 0.06em; color: var(--accent);">${isEn ? "Diagnostic" : "Diagnóstico"}: ${App.Utils.escapeHtml(currentAdv.situation)}</span>
            </div>
            <strong style="font-size: 0.88rem; color: var(--ink); display: block; margin-bottom: 4px;">"${App.Utils.escapeHtml(currentAdv.phrase)}"</strong>
            <p style="margin: 0; font-size: 0.82rem; color: var(--muted); line-height: 1.4;">${App.Utils.escapeHtml(currentAdv.advice)}</p>
          </div>
        ` : ""}
      `;
    }

    if (scenariosEl && Array.isArray(info.scenarios)) {
      scenariosEl.innerHTML = info.scenarios.map(sc => `
        <div class="scenario-item">
          <div class="scenario-badge-col">
            <span class="scenario-range">${App.Utils.escapeHtml(sc.range)}</span>
            <span class="scenario-label">${App.Utils.escapeHtml(sc.label)}</span>
          </div>
          <div class="scenario-desc-col">
            <p style="margin: 0 0 2px 0; font-size: 0.82rem; color: var(--ink); font-weight: 700;">${App.Utils.escapeHtml(sc.text)}</p>
            <p style="margin: 0; font-size: 0.78rem; color: var(--muted);">${App.Utils.escapeHtml(sc.tip)}</p>
          </div>
        </div>
      `).join("");
    }

    // Dynamic tabs logic: meaning vs status vs scenarios
    const tabChips = modal.querySelectorAll(".insights-tab-chip");
    const paneMeaning = document.getElementById("insightsPaneMeaning");
    const paneStatus = document.getElementById("insightsPaneStatus");
    const paneScenarios = document.getElementById("insightsPaneScenarios");

    function setModalActiveTab(tabKey) {
      tabChips.forEach(chip => {
        chip.classList.toggle("active", chip.getAttribute("data-modal-tab") === tabKey);
      });
      if (paneMeaning) {
        paneMeaning.style.display = tabKey === "meaning" ? "block" : "none";
        paneMeaning.hidden = tabKey !== "meaning";
      }
      if (paneStatus) {
        paneStatus.style.display = tabKey === "status" ? "block" : "none";
        paneStatus.hidden = tabKey !== "status";
      }
      if (paneScenarios) {
        paneScenarios.style.display = tabKey === "scenarios" ? "block" : "none";
        paneScenarios.hidden = tabKey !== "scenarios";
      }
    }

    tabChips.forEach(chip => {
      chip.onclick = (e) => {
        e.preventDefault();
        setModalActiveTab(chip.getAttribute("data-modal-tab"));
      };
    });

    setModalActiveTab("meaning");
    modal.hidden = false;
  }

  function closeInsightsDetailModal() {
    const modal = document.getElementById("insightsDetailModal");
    if (modal) modal.hidden = true;
  }

  // --- RENDERIZADO DEL CUERPO DE ESTUDIO & CALENDARIO ---
  // --- RENDERIZADO DEL CUERPO DE ESTUDIO & CALENDARIO ---
  function renderStudyDashboardHtml(data, tierText, tierColor, wowPositive, wowDeltaText, wowPctText) {
    const isEn = App.I18n?.getCurrentLanguage ? App.I18n.getCurrentLanguage() === "en" : false;
    const scoreTitle = App.I18n?.t("insights.scoreTitle") || "PUNTUACIÓN GLOBAL";
    const scoreSub = App.I18n?.t("insights.scoreSub") || (isEn ? "Consistency, goals, diversification & energy · Tap for details" : "Constancia, metas, diversificación y energía · Toca para ver detalle");
    const regTitle = App.I18n?.t("insights.regularityTitle") || "ÍNDICE DE REGULARIDAD";
    const regBadge = data.regularityScore >= 80 ? (App.I18n?.t("insights.regularityHigh") || "Alta Constancia") : (data.regularityScore >= 60 ? (App.I18n?.t("insights.regularityMid") || "Ritmo Medio") : (App.I18n?.t("insights.regularityLow") || "Fluctuante"));
    const regSub = App.I18n?.t("insights.regularitySub") || (isEn ? "Daily rhythm stability without cramming · Tap for details" : "Estabilidad de ritmo diario sin atracones · Toca para ver detalle");
    const goalTitle = App.I18n?.t("insights.goalTitle") || "OBJETIVO DIARIO";
    const trendTitle = App.I18n?.t("insights.trendTitle") || "TENDENCIA SEMANAL (WoW)";

    return `
      <!-- KPI RIBBON DIRECTIVO (TODOS INTERACTIVOS CON CLICK) -->
      <section class="insights-kpi-ribbon" aria-label="Indicadores Clave">
        <!-- KPI 1: SCORE GLOBAL -->
        <article class="insights-kpi-card highlight-card insights-clickable-card" data-insight-type="score" tabindex="0" role="button" aria-label="Ver detalle de puntuación global">
          <div class="kpi-head">
            <span class="kpi-label">${scoreTitle}</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="kpi-tier-tag" style="background: rgba(var(--accent-rgb), 0.12); color: ${tierColor};">${tierText}</span>
              <span class="kpi-info-icon" title="Hacer clic para ver explicación y consejos">ℹ️</span>
            </div>
          </div>
          <div class="kpi-main-val">
            <span class="kpi-big-num">${data.globalScore}</span>
            <span class="kpi-denom">/ 100</span>
          </div>
          <div class="kpi-progress-bar">
            <div class="kpi-progress-fill" style="width: ${data.globalScore}%; background: ${tierColor};"></div>
          </div>
          <span class="kpi-subtext">${scoreSub}</span>
        </article>

        <!-- KPI 2: REGULARIDAD -->
        <article class="insights-kpi-card insights-clickable-card" data-insight-type="regularity" tabindex="0" role="button" aria-label="Ver detalle de regularidad">
          <div class="kpi-head">
            <span class="kpi-label">${regTitle}</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="kpi-badge">${regBadge}</span>
              <span class="kpi-info-icon" title="Hacer clic para ver explicación y consejos">ℹ️</span>
            </div>
          </div>
          <div class="kpi-main-val">
            <span class="kpi-big-num">${data.regularityScore}%</span>
          </div>
          <div class="kpi-progress-bar">
            <div class="kpi-progress-fill" style="width: ${data.regularityScore}%;"></div>
          </div>
          <span class="kpi-subtext">${regSub}</span>
        </article>

        <!-- KPI 3: META DIARIA -->
        <article class="insights-kpi-card insights-clickable-card" data-insight-type="goal" tabindex="0" role="button" aria-label="Ver detalle de objetivo diario">
          <div class="kpi-head">
            <span class="kpi-label">${goalTitle} (${data.dailyGoal > 0 ? `${data.dailyGoal}h` : (App.I18n?.t("insights.notSet") || "Sin fijar")})</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <button type="button" class="kpi-badge kpi-badge-btn" id="insightsGoToGoalsBtn" title="Configurar horas objetivo por día, asignatura y hobby">⚙️ ${isEn ? "Settings" : "Ajustes"}</button>
              <span class="kpi-info-icon" title="Hacer clic para ver explicación y consejos">ℹ️</span>
            </div>
          </div>
          <div class="kpi-main-val">
            <span class="kpi-big-num">${data.dailyGoal > 0 ? `${data.goalPct}%` : "—"}</span>
          </div>
          <div class="kpi-progress-bar">
            <div class="kpi-progress-fill" style="width: ${data.goalPct}%;"></div>
          </div>
          <span class="kpi-subtext">${data.dailyGoal > 0 ? (isEn ? `${data.goalMetDays} of ${data.elapsedDays} days achieved · Tap for details` : `${data.goalMetDays} de ${data.elapsedDays} días cumplidos · Toca para ver detalle`) : (isEn ? "Set your daily target in Settings · Tap for details" : "Define tu meta diaria en Ajustes · Toca para ver detalle")}</span>
        </article>

        <!-- KPI 4: EVOLUCIÓN SEMANAL (WoW) -->
        <article class="insights-kpi-card insights-clickable-card" data-insight-type="trend" tabindex="0" role="button" aria-label="Ver detalle de evolución semanal">
          <div class="kpi-head">
            <span class="kpi-label">${trendTitle}</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="kpi-badge ${wowPositive ? "badge-green" : "badge-red"}">${wowPctText}</span>
              <span class="kpi-info-icon" title="Hacer clic para ver explicación y consejos">ℹ️</span>
            </div>
          </div>
          <div class="kpi-main-val">
            <span class="kpi-big-num ${wowPositive ? "text-green" : "text-red"}">${wowDeltaText}</span>
          </div>
          <div class="kpi-subtext" style="margin-top: 10px;">
            ${isEn ? `Current vs previous week (${App.Utils.formatTime(data.prevWeek ? data.prevWeek.total : 0)}) · <em>Tap for details</em>` : `Semana actual vs previa (${App.Utils.formatTime(data.prevWeek ? data.prevWeek.total : 0)}) · <em>Toca para ver detalle</em>`}
          </div>
        </article>
      </section>

      <!-- SECCIÓN PRINCIPAL: BARRAS SEMANALES LIMPIAS & DIVERSIFICACIÓN RADIAL -->
      <section class="insights-grid-two">
        <article class="insights-card insights-clickable-card" data-insight-type="weekly-bars" tabindex="0" role="button">
          <div class="insights-card-head flex-between">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h3>${App.I18n?.t("insights.weeklyTitle") || "COMPARATIVA SEMANA A SEMANA"}</h3>
                <span class="kpi-info-icon">ℹ️</span>
              </div>
              <p class="insights-card-subtitle">${App.I18n?.t("insights.weeklySub") || "Evolución del tiempo dedicado por semana (Estudio vs Hobbies)"}</p>
            </div>
            <div class="insights-chart-legend">
              <span class="legend-item"><span class="legend-color-dot" style="background:var(--accent);"></span>${App.Utils.escapeHtml(data.subPlural)}</span>
              <span class="legend-item"><span class="legend-color-dot" style="background:#06b6d4;"></span>${App.Utils.escapeHtml(data.hobPlural)}</span>
            </div>
          </div>
          ${renderWeeklyBarChartSvg(data.weeksList, data.dailyGoal)}
        </article>

        <article class="insights-card insights-clickable-card" data-insight-type="diversification" tabindex="0" role="button">
          <div class="insights-card-head">
            <div style="display: flex; align-items: center; gap: 8px;">
              <h3>${App.I18n?.t("insights.radialTitle") || "DIVERSIFICACIÓN & EQUILIBRIO RADIAL"}</h3>
              <span class="kpi-info-icon">ℹ️</span>
            </div>
            <p class="insights-card-subtitle">${App.I18n?.t("insights.radialSub") || "Reparto proporcional entre asignaturas y hobbies activos"}</p>
          </div>
          ${renderRadialDiversificationSvg(data.items, data.totalHours, data.diversificationRatio)}
        </article>
      </section>

      <!-- SECCIÓN SECUNDARIA: CORRELACIÓN ÁNIMO & DISTRIBUCIÓN POR DÍAS -->
      <section class="insights-grid-two">
        <article class="insights-card insights-clickable-card" data-insight-type="mood" tabindex="0" role="button">
          <div class="insights-card-head">
            <div style="display: flex; align-items: center; gap: 8px;">
              <h3>${App.I18n?.t("insights.moodTitle") || "CORRELACIÓN ENERGÍA / ÁNIMO VS DEDICACIÓN"}</h3>
              <span class="kpi-info-icon">ℹ️</span>
            </div>
            <p class="insights-card-subtitle">${App.I18n?.t("insights.moodSub") || "Media de horas registradas según la valoración del día (1 a 5 ★)"}</p>
          </div>
          ${renderMoodCorrelationVisual(data.moodData)}
        </article>

        <article class="insights-card insights-clickable-card" data-insight-type="weekday" tabindex="0" role="button">
          <div class="insights-card-head">
            <div style="display: flex; align-items: center; gap: 8px;">
              <h3>${App.I18n?.t("insights.weekdayTitle") || "DISTRIBUCIÓN DE ESFUERZO POR DÍA DE LA SEMANA"}</h3>
              <span class="kpi-info-icon">ℹ️</span>
            </div>
            <p class="insights-card-subtitle">${App.I18n?.t("insights.weekdaySub") || "Distribución del esfuerzo acumulado según el día de la semana"}</p>
          </div>
          ${renderWeekdayDistribution(data.weekdayTotals)}
        </article>
      </section>

      <!-- SECCIÓN DE SALUD DE ASIGNATURAS / PROYECTOS -->
      <section class="insights-card insights-clickable-card" data-insight-type="health" tabindex="0" role="button">
        <div class="insights-card-head">
          <div style="display: flex; align-items: center; gap: 8px;">
            <h3>${App.I18n?.t("insights.healthTitle") || `BALANCE & SALUD POR ${data.subSingular.toUpperCase()}`}</h3>
            <span class="kpi-info-icon">ℹ️</span>
          </div>
          <p class="insights-card-subtitle">${App.I18n?.t("insights.healthSub") || "Diagnóstico de urgencia, tareas pendientes y constancia"}</p>
        </div>
        ${renderSubjectsHealthTable(data.activeSubjects, data.totalsBySubject, data.subSingular)}
      </section>

      <!-- RECOMENDACIONES ACCIONABLES (EXACTAMENTE 3 ENTRADAS) -->
      <section class="insights-card">
        <div class="insights-card-head">
          <h3>${App.I18n?.t("insights.directivesTitle") || "DIRECTRICES & PLAN DE ACCIÓN RECOMENDADO"}</h3>
          <p class="insights-card-subtitle">${App.I18n?.t("insights.directivesSub") || "Recomendaciones estratégicas generadas a partir de tus patrones"}</p>
        </div>
        ${renderActionableDirectives(data)}
      </section>
    `;
  }

  // --- RENDERIZADO DEL CUERPO DE HÁBITOS & TRACKER ---
  function renderTrackerDashboardHtml(tData) {
    if (tData.totalHabits === 0) {
      return `
        <div class="insights-card" style="text-align: center; padding: 50px 20px;">
          <span style="font-size: 3rem; display: block; margin-bottom: 12px;">📋</span>
          <h3 style="margin-bottom: 8px;">Aún no tienes hábitos configurados en el Tracker</h3>
          <p style="color: var(--muted); max-width: 460px; margin: 0 auto 20px auto; font-size: 0.92rem;">
            Añade tus primeras rutinas diarias (ej. lectura, ejercicio, hidratación) desde la pestaña Tracker para desbloquear análisis de adherencia, rachas y comparativas semanales.
          </p>
          <button type="button" class="btn btn-primary" id="insightsGoToTrackerBtn">Ir a Tracker de Hábitos</button>
        </div>
      `;
    }

    const adherenceColor = tData.adherenceRate >= 75 ? "#10b981" : (tData.adherenceRate >= 50 ? "#06b6d4" : "#f59e0b");
    const wowPositive = tData.wowDeltaChecks >= 0;
    const wowPctText = `${wowPositive ? "+" : ""}${tData.wowDeltaPct}%`;
    const wowDeltaText = `${wowPositive ? "+" : ""}${tData.wowDeltaChecks} checks`;

    const isEn = App.I18n?.getCurrentLanguage ? App.I18n.getCurrentLanguage() === "en" : false;
    const adhTitle = App.I18n?.t("insights.trackerAdherenceTitle") || "ADHERENCIA A RUTINAS";
    const strkTitle = App.I18n?.t("insights.trackerStreakTitle") || "RACHA MEDIA ACTIVA";
    const wowTitle = App.I18n?.t("insights.trackerTrendTitle") || "EVOLUCIÓN SEMANAL (WoW)";
    const starTitle = App.I18n?.t("insights.trackerScoreTitle") || "HÁBITO ESTRELLA";
    const weeklyTitle = App.I18n?.t("insights.trackerWeeklyTitle") || "COMPARATIVA SEMANA A SEMANA DE HÁBITOS";
    const weeklySub = App.I18n?.t("insights.trackerWeeklySub") || "Volumen de hábitos completados semana tras semana";
    const weekdayTitle = App.I18n?.t("insights.trackerWeekdayTitle") || "DISTRIBUCIÓN DE HÁBITOS POR DÍA";
    const weekdaySub = App.I18n?.t("insights.trackerWeekdaySub") || "Frecuencia de cumplimiento según el día de la semana";
    const healthTitle = App.I18n?.t("insights.trackerHealthTitle") || "MATRIZ DE SALUD DE HÁBITOS";
    const healthSub = App.I18n?.t("insights.trackerHealthSub") || "Adherencia, racha consecutiva y estado de cada rutina";
    const dirTitle = App.I18n?.t("insights.trackerDirectivesTitle") || "DIRECTRICES ESTRATÉGICAS DE RUTINAS";
    const dirSub = App.I18n?.t("insights.trackerDirectivesSub") || "3 pautas personalizadas para asentar tus hábitos a largo plazo";
    const completedBadge = isEn ? "Completed Habits" : "Hábitos Completados";

    return `
      <!-- KPI RIBBON TRACKER -->
      <section class="insights-kpi-ribbon" aria-label="Indicadores Clave de Hábitos">
        <!-- KPI 1: ADHERENCIA GLOBAL -->
        <article class="insights-kpi-card highlight-card insights-clickable-card" data-insight-type="tracker-adherence" tabindex="0" role="button" aria-label="Ver detalle de adherencia a rutinas">
          <div class="kpi-head">
            <span class="kpi-label">${adhTitle}</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="kpi-tier-tag" style="background: rgba(16, 185, 129, 0.12); color: ${adherenceColor};">
                ${tData.adherenceRate >= 80 ? (isEn ? "High Discipline" : "Alta Disciplina") : (tData.adherenceRate >= 50 ? (isEn ? "In Progress" : "En Progreso") : (isEn ? "Low Frequency" : "Baja Frecuencia"))}
              </span>
              <span class="kpi-info-icon" title="Hacer clic para ver explicación y consejos">ℹ️</span>
            </div>
          </div>
          <div class="kpi-main-val">
            <span class="kpi-big-num">${tData.adherenceRate}%</span>
            <span class="kpi-denom">${isEn ? "completion" : "cumplimiento"}</span>
          </div>
          <div class="kpi-progress-bar">
            <div class="kpi-progress-fill" style="width: ${tData.adherenceRate}%; background: ${adherenceColor};"></div>
          </div>
          <span class="kpi-subtext">${isEn ? `${tData.totalChecksDone} of ${tData.totalScheduled} completed habits · <em>Tap for details</em>` : `${tData.totalChecksDone} de ${tData.totalScheduled} hábitos completados · <em>Toca para ver detalle</em>`}</span>
        </article>

        <!-- KPI 2: RACHA MEDIA -->
        <article class="insights-kpi-card insights-clickable-card" data-insight-type="tracker-streak" tabindex="0" role="button" aria-label="Ver detalle de rachas">
          <div class="kpi-head">
            <span class="kpi-label">${strkTitle}</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="kpi-badge">${isEn ? "Max" : "Máx"}: ${tData.maxActiveStreak}d</span>
              <span class="kpi-info-icon" title="Hacer clic para ver explicación y consejos">ℹ️</span>
            </div>
          </div>
          <div class="kpi-main-val">
            <span class="kpi-big-num">${tData.avgStreak} <span style="font-size: 1.1rem; font-weight: 600; color: var(--muted);">${isEn ? "days" : "días"}</span></span>
          </div>
          <div class="kpi-progress-bar">
            <div class="kpi-progress-fill" style="width: ${Math.min(100, tData.avgStreak * 10)}%; background: #f59e0b;"></div>
          </div>
          <span class="kpi-subtext">${isEn ? "Average consecutive continuity · <em>Tap for details</em>" : "Continuidad consecutiva promedio · <em>Toca para ver detalle</em>"}</span>
        </article>

        <!-- KPI 3: EVOLUCIÓN WOW -->
        <article class="insights-kpi-card insights-clickable-card" data-insight-type="tracker-wow" tabindex="0" role="button" aria-label="Ver detalle de evolución semanal de hábitos">
          <div class="kpi-head">
            <span class="kpi-label">${wowTitle}</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="kpi-badge ${wowPositive ? "badge-green" : "badge-red"}">${wowPctText}</span>
              <span class="kpi-info-icon" title="Hacer clic para ver explicación y consejos">ℹ️</span>
            </div>
          </div>
          <div class="kpi-main-val">
            <span class="kpi-big-num ${wowPositive ? "text-green" : "text-red"}">${wowDeltaText}</span>
          </div>
          <div class="kpi-subtext" style="margin-top: 10px;">
            ${isEn ? `Current week (${tData.curWeek ? tData.curWeek.checks : 0}) vs previous (${tData.prevWeek ? tData.prevWeek.checks : 0}) · <em>Tap for details</em>` : `Semana actual (${tData.curWeek ? tData.curWeek.checks : 0}) vs previa (${tData.prevWeek ? tData.prevWeek.checks : 0}) · <em>Toca para ver detalle</em>`}
          </div>
        </article>

        <!-- KPI 4: HÁBITO ESTRELLA -->
        <article class="insights-kpi-card insights-clickable-card" data-insight-type="tracker-star" tabindex="0" role="button" aria-label="Ver detalle de hábito estrella">
          <div class="kpi-head">
            <span class="kpi-label">${starTitle}</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="kpi-badge">${tData.starHabit ? `${tData.starHabit.adherencePct}% ${isEn ? "success" : "éxito"}` : "—"}</span>
              <span class="kpi-info-icon" title="Hacer clic para ver explicación y consejos">ℹ️</span>
            </div>
          </div>
          <div class="kpi-main-val" style="font-size: 1.45rem; line-height: 1.25; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${tData.starHabit ? `${App.Utils.escapeHtml(tData.starHabit.emoji)} ${App.Utils.escapeHtml(tData.starHabit.name)}` : (isEn ? "No records" : "Sin registros")}
          </div>
          <div class="kpi-subtext" style="margin-top: 10px;">
            ${tData.atRiskHabit && tData.atRiskHabit.id !== tData.starHabit?.id ? (isEn ? `To reinforce: ${App.Utils.escapeHtml(tData.atRiskHabit.emoji)} ${App.Utils.escapeHtml(tData.atRiskHabit.name)} (${tData.atRiskHabit.adherencePct}%)` : `A reforzar: ${App.Utils.escapeHtml(tData.atRiskHabit.emoji)} ${App.Utils.escapeHtml(tData.atRiskHabit.name)} (${tData.atRiskHabit.adherencePct}%)`) : (isEn ? "Highest consistency routine · <em>Tap for details</em>" : "Mayor fidelidad de cumplimiento · <em>Toca para ver detalle</em>")}
          </div>
        </article>
      </section>

      <!-- SECCIÓN PRINCIPAL TRACKER: BARRAS SEMANALES & DISTRIBUCIÓN POR DÍAS -->
      <section class="insights-grid-two">
        <article class="insights-card insights-clickable-card" data-insight-type="tracker-weekly-bars" tabindex="0" role="button">
          <div class="insights-card-head flex-between">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h3>${weeklyTitle}</h3>
                <span class="kpi-info-icon">ℹ️</span>
              </div>
              <p class="insights-card-subtitle">${weeklySub}</p>
            </div>
            <div class="insights-chart-legend">
              <span class="legend-item"><span class="legend-color-dot" style="background:#10b981;"></span>${completedBadge}</span>
            </div>
          </div>
          ${renderTrackerWeeklyBarChartSvg(tData.weeksList, tData.totalHabits)}
        </article>

        <article class="insights-card insights-clickable-card" data-insight-type="tracker-weekday" tabindex="0" role="button">
          <div class="insights-card-head">
            <div style="display: flex; align-items: center; gap: 8px;">
              <h3>${weekdayTitle}</h3>
              <span class="kpi-info-icon">ℹ️</span>
            </div>
            <p class="insights-card-subtitle">${weekdaySub}</p>
          </div>
          ${renderTrackerWeekdayDistribution(tData.weekdayTotals)}
        </article>
      </section>

      <!-- SECCIÓN DE SALUD DE HÁBITOS -->
      <section class="insights-card insights-clickable-card" data-insight-type="tracker-health" tabindex="0" role="button">
        <div class="insights-card-head">
          <div style="display: flex; align-items: center; gap: 8px;">
            <h3>${healthTitle}</h3>
            <span class="kpi-info-icon">ℹ️</span>
          </div>
          <p class="insights-card-subtitle">${healthSub}</p>
        </div>
        ${renderTrackerHabitsHealthTable(tData.habitsList)}
      </section>

      <!-- RECOMENDACIONES ACCIONABLES DE TRACKER -->
      <section class="insights-card">
        <div class="insights-card-head">
          <h3>${dirTitle}</h3>
          <p class="insights-card-subtitle">${dirSub}</p>
        </div>
        ${renderTrackerActionableDirectives(tData)}
      </section>
    `;
  }

  // --- RENDERIZADO GLOBAL DEL INFORME AVANZADO (CATEGORÍAS ESTUDIO & TRACKER) ---
  function renderInsightsDashboard() {
    const container = document.getElementById("insightsDashboardContainer");
    if (!container) return;

    const keys = getFilteredRangeKeys();
    const data = calculateDashboardData(keys);
    const tData = calculateTrackerDashboardData(keys);

    const isEn = App.I18n?.getCurrentLanguage ? App.I18n.getCurrentLanguage() === "en" : false;
    let tierText = isEn ? "In Development" : "En Construcción";
    let tierColor = "#94a3b8";
    if (data.globalScore >= 90) { tierText = isEn ? "Elite Performance" : "Rendimiento Élite"; tierColor = "var(--accent)"; }
    else if (data.globalScore >= 75) { tierText = isEn ? "Consistent & Optimal" : "Consistente y Óptimo"; tierColor = "#10b981"; }
    else if (data.globalScore >= 55) { tierText = isEn ? "Good Pace" : "Buen Ritmo"; tierColor = "#06b6d4"; }
    else if (data.globalScore >= 35) { tierText = isEn ? "In Development" : "En Desarrollo"; tierColor = "#f59e0b"; }

    const wowPositive = data.wowDeltaHours >= 0;
    const wowDeltaText = `${wowPositive ? "+" : ""}${App.Utils.formatTime(data.wowDeltaHours)}`;
    const wowPctText = `${wowPositive ? "+" : ""}${data.wowDeltaPct}%`;

    // Academic periods for the header select (used when in study view)
    const allPeriods = App.State.academicPeriods || [];
    const periodsOptionsHtml = allPeriods.map(p => `
      <option value="${App.Utils.escapeHtml(p.id)}" ${data.currentPeriod && data.currentPeriod.id === p.id && selectedPeriodId !== "all" ? "selected" : ""}>
        ${App.Utils.escapeHtml(p.name)}
      </option>
    `).join("");

    container.innerHTML = `
      <!-- CABECERA EJECUTIVA DEL INFORME AVANZADO -->
      <header class="insights-header">
        <div class="insights-title-group">
          <!-- SELECTOR DE CATEGORÍA PRINCIPAL (ESTUDIO VS HÁBITOS) -->
          <div class="insights-category-switch-pills" role="tablist" aria-label="Categoría de análisis">
            <button type="button" class="insights-category-pill ${activeInsightsCategory === "study" ? "active" : ""}" data-insights-category="study">
              ${isEn ? "📚 Study & Calendar" : "📚 Estudio & Calendario"}
            </button>
            <button type="button" class="insights-category-pill ${activeInsightsCategory === "tracker" ? "active" : ""}" data-insights-category="tracker">
              ${isEn ? "📋 Habits & Tracker" : "📋 Hábitos & Tracker"}
            </button>
          </div>

          <div class="insights-badge-row" style="margin-top: 10px;">
            <span class="insights-eyebrow-badge">${isEn ? "ADVANCED REPORT" : "INFORME AVANZADO"}</span>
            ${activeInsightsCategory === "study" ? `
              <!-- SELECTOR DE PERIODO INTERACTIVO -->
              <select id="insightsPeriodSelect" class="insights-period-select" aria-label="Seleccionar periodo académico">
                <option value="auto" ${selectedPeriodId === "auto" ? "selected" : ""}>${isEn ? "Current Academic Period" : "Periodo Actual Automático"}</option>
                <option value="all" ${selectedPeriodId === "all" ? "selected" : ""}>${isEn ? "All History" : "Todo el Historial"}</option>
                ${periodsOptionsHtml}
              </select>
            ` : ""}
          </div>
          <h1 class="insights-main-title">${isEn ? "Advanced Report & Performance" : "Informe Avanzado & Rendimiento"}</h1>
          <p class="insights-subtitle">
            ${activeInsightsCategory === "study"
              ? (isEn ? "Executive analysis of study trends, consistency, diversification, and wellbeing" : "Análisis ejecutivo de tendencias, constancia de estudio, diversificación y bienestar")
              : (isEn ? "Analysis of routine adherence, uninterrupted streaks, and daily habit health" : "Análisis de adherencia a rutinas, rachas continuadas y salud de tus hábitos diarios")}
          </p>
        </div>

        <div class="insights-controls">
          <div class="insights-filter-group" role="group" aria-label="Rango de análisis">
            <button type="button" class="insights-filter-btn ${currentFilter === "current" ? "active" : ""}" data-filter="current">Periodo Seleccionado</button>
            <button type="button" class="insights-filter-btn ${currentFilter === "last30" ? "active" : ""}" data-filter="last30">Últimos 30 días</button>
            <button type="button" class="insights-filter-btn ${currentFilter === "last8w" ? "active" : ""}" data-filter="last8w">Últimas 8 semanas</button>
            <button type="button" class="insights-filter-btn ${currentFilter === "all" ? "active" : ""}" data-filter="all">Todo el Historial</button>
          </div>
        </div>
      </header>

      <!-- CUERPO PRINCIPAL SEGÚN CATEGORÍA SELECCIONADA -->
      ${activeInsightsCategory === "study"
        ? renderStudyDashboardHtml(data, tierText, tierColor, wowPositive, wowDeltaText, wowPctText)
        : renderTrackerDashboardHtml(tData)
      }
    `;

    // Hook category switch pills
    container.querySelectorAll(".insights-category-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        const cat = pill.getAttribute("data-insights-category");
        if (cat) setInsightsCategory(cat);
      });
    });

    // Hook filter buttons
    container.querySelectorAll(".insights-filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const filter = btn.getAttribute("data-filter");
        if (filter) setInsightsFilter(filter);
      });
    });

    // Hook academic period select (if present)
    const periodSelect = document.getElementById("insightsPeriodSelect");
    if (periodSelect) {
      periodSelect.addEventListener("change", (e) => {
        setSelectedPeriod(e.target.value);
      });
    }

    // Hook quick button to Goals in Settings
    const goToGoalsBtn = document.getElementById("insightsGoToGoalsBtn");
    if (goToGoalsBtn) {
      goToGoalsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (App.Settings && typeof App.Settings.openSettingsToGoals === "function") {
          App.Settings.openSettingsToGoals();
        }
      });
    }

    // Hook jump to tracker from empty habits state
    const goToTrackerBtn = document.getElementById("insightsGoToTrackerBtn");
    if (goToTrackerBtn) {
      goToTrackerBtn.addEventListener("click", () => {
        if (App.Tracker && typeof App.Tracker.switchView === "function") {
          App.Tracker.switchView("checklist");
        }
      });
    }

    // Hook card click events to open Detail Modal
    container.querySelectorAll(".insights-clickable-card").forEach(card => {
      const type = card.getAttribute("data-insight-type");
      if (type) {
        card.addEventListener("click", (e) => {
          if (e.target.closest("button") || e.target.closest("select")) return;
          openInsightsDetailModal(type, type.startsWith("tracker-") ? tData : data);
        });
      }
    });

    // Hook hover over weekly chart bars to update status strip dynamically
    const statusStrip = document.getElementById("weeklyChartStatusStrip");
    container.querySelectorAll(".study-bar-group, .chart-bar-group:not(.tracker-bar-group)").forEach(group => {
      group.addEventListener("mouseenter", () => {
        if (!statusStrip) return;
        const total = group.getAttribute("data-week-total");
        const study = group.getAttribute("data-week-study");
        const tracks = group.getAttribute("data-week-tracks");
        const range = group.getAttribute("data-week-range");
        if (total && range) {
          statusStrip.innerHTML = `<span>Semana <strong>${range}</strong>: <strong>${total}</strong> totales (${study} estudio · ${tracks} hobbies).</span>`;
        }
      });
    });

    const trackerStatusStrip = document.getElementById("trackerWeeklyChartStatusStrip");
    container.querySelectorAll(".tracker-bar-group").forEach(group => {
      group.addEventListener("mouseenter", () => {
        if (!trackerStatusStrip) return;
        const checks = group.getAttribute("data-week-checks");
        const range = group.getAttribute("data-week-range");
        if (checks && range) {
          trackerStatusStrip.innerHTML = `<span>Semana <strong>${range}</strong>: <strong>${checks}</strong> hábitos completados.</span>`;
        }
      });
    });
  }

  // Hook global modal close triggers
  document.addEventListener("DOMContentLoaded", () => {
    const closeBtn = document.getElementById("insightsDetailCloseBtn");
    if (closeBtn) closeBtn.addEventListener("click", closeInsightsDetailModal);

    const backdrop = document.querySelector("[data-close-insights-detail]");
    if (backdrop) backdrop.addEventListener("click", closeInsightsDetailModal);
  });

  // Also bind immediately in case DOM is already ready
  const closeBtn = document.getElementById("insightsDetailCloseBtn");
  if (closeBtn) closeBtn.addEventListener("click", closeInsightsDetailModal);
  const backdrop = document.querySelector("[data-close-insights-detail]");
  if (backdrop) backdrop.addEventListener("click", closeInsightsDetailModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeInsightsDetailModal();
  });

  Object.defineProperties(window.App.Insights, {
    renderInsightsDashboard: { get: () => renderInsightsDashboard, set: (v) => renderInsightsDashboard = v, enumerable: true },
    setInsightsFilter: { get: () => setInsightsFilter, set: (v) => setInsightsFilter = v, enumerable: true },
    setSelectedPeriod: { get: () => setSelectedPeriod, set: (v) => setSelectedPeriod = v, enumerable: true },
    setInsightsCategory: { get: () => setInsightsCategory, set: (v) => setInsightsCategory = v, enumerable: true },
    calculateTrackerDashboardData: { get: () => calculateTrackerDashboardData, set: (v) => calculateTrackerDashboardData = v, enumerable: true },
    openInsightsDetailModal: { get: () => openInsightsDetailModal, set: (v) => openInsightsDetailModal = v, enumerable: true },
    closeInsightsDetailModal: { get: () => closeInsightsDetailModal, set: (v) => closeInsightsDetailModal = v, enumerable: true }
  });
})();
