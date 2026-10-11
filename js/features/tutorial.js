(() => {
  window.App = window.App || {};
  window.App.Tutorial = window.App.Tutorial || {};

  let currentStep = 0;
  let isActive = false;
  let savedInitialView = "calendar";

  const STEPS = [
    {
      id: "profile_demo",
      view: "profile",
      subTab: "identity",
      targetSelector: "#profileHeroCard",
      fallbackSelector: "#paneProfileMain",
      preferredSide: "bottom",
      titleKey: "tutorial.step1Title",
      descKey: "tutorial.step1Desc",
      hasDemoAction: true
    },
    {
      id: "calendar_heatmap",
      view: "calendar",
      subTab: null,
      targetSelector: "#months",
      fallbackSelector: ".calendar-pane",
      preferredSide: "right",
      titleKey: "tutorial.step2Title",
      descKey: "tutorial.step2Desc"
    },
    {
      id: "day_panel",
      view: "calendar",
      subTab: null,
      targetSelector: "#dayPanel",
      fallbackSelector: ".calendar-workspace",
      preferredSide: "left",
      titleKey: "tutorial.step3Title",
      descKey: "tutorial.step3Desc"
    },
    {
      id: "habit_tracker",
      view: "checklist",
      subTab: null,
      targetSelector: "#routineMatrixCard",
      fallbackSelector: "#paneChecklistMain",
      preferredSide: "bottom",
      titleKey: "tutorial.step4Title",
      descKey: "tutorial.step4Desc"
    },
    {
      id: "insights_report",
      view: "profile",
      subTab: "stats",
      targetSelector: "#profileStatsSection",
      fallbackSelector: "#paneProfileMain",
      preferredSide: "bottom",
      titleKey: "tutorial.step5Title",
      descKey: "tutorial.step5Desc"
    },
    {
      id: "settings_storage",
      view: "profile",
      subTab: "settings",
      targetSelector: "#settingsSecStorage",
      fallbackSelector: "#profileSettingsSection",
      preferredSide: "right",
      titleKey: "tutorial.step6Title",
      descKey: "tutorial.step6Desc"
    }
  ];

  let highlightedEl = null;

  function clearTargetHighlight() {
    if (highlightedEl) {
      highlightedEl.classList.remove("guided-tour-target-highlight");
      highlightedEl = null;
    }
  }

  function setTargetHighlight(el) {
    clearTargetHighlight();
    if (el) {
      el.classList.add("guided-tour-target-highlight");
      highlightedEl = el;
    }
  }

  function ensureTourDOM() {
    let overlay = document.getElementById("guidedTourOverlay");
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.id = "guidedTourOverlay";
    overlay.className = "guided-tour-overlay";
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("role", "dialog");

    overlay.innerHTML = `
      <div class="guided-tour-backdrop-segment tour-backdrop-top" id="tourBackdropTop"></div>
      <div class="guided-tour-backdrop-segment tour-backdrop-bottom" id="tourBackdropBottom"></div>
      <div class="guided-tour-backdrop-segment tour-backdrop-left" id="tourBackdropLeft"></div>
      <div class="guided-tour-backdrop-segment tour-backdrop-right" id="tourBackdropRight"></div>
      <div class="guided-tour-spotlight" id="guidedTourSpotlight"></div>
      <div class="guided-tour-card" id="guidedTourCard" role="region" aria-live="polite">
        <div class="guided-tour-header">
          <div class="guided-tour-step-badge" id="guidedTourStepBadge">Paso 1 de 6</div>
          <button type="button" class="guided-tour-close-btn" id="guidedTourCloseBtn" aria-label="Cerrar tutorial">✕</button>
        </div>
        <div class="guided-tour-body">
          <h3 class="guided-tour-title" id="guidedTourTitle">Título</h3>
          <p class="guided-tour-desc" id="guidedTourDesc">Descripción del paso...</p>
          <div id="guidedTourActionBox" style="margin-top: 12px; display: none;">
            <button type="button" class="ghost-button" id="guidedTourSwitchDemoBtn" style="font-size: 0.82rem; padding: 4px 12px; border-radius: 999px;">
              👤 Cambiar al Perfil de Ejemplo ahora
            </button>
          </div>
        </div>
        <div class="guided-tour-footer">
          <div class="guided-tour-dots" id="guidedTourDots"></div>
          <div class="guided-tour-buttons">
            <button type="button" class="ghost-button guided-tour-btn" id="guidedTourPrevBtn">Anterior</button>
            <button type="button" class="primary-button guided-tour-btn" id="guidedTourNextBtn">Siguiente</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const cardEl = document.getElementById("guidedTourCard");
    const closeBtn = document.getElementById("guidedTourCloseBtn");
    const prevBtn = document.getElementById("guidedTourPrevBtn");
    const nextBtn = document.getElementById("guidedTourNextBtn");
    const demoBtn = document.getElementById("guidedTourSwitchDemoBtn");

    if (cardEl) {
      cardEl.addEventListener("click", (e) => e.stopPropagation());
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        endTour();
      });
    }
    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        prevStep();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        nextStep();
      });
    }

    ["tourBackdropTop", "tourBackdropBottom", "tourBackdropLeft", "tourBackdropRight"].forEach(id => {
      const seg = document.getElementById(id);
      if (seg) {
        seg.addEventListener("click", (e) => {
          e.stopPropagation();
          endTour();
        });
      }
    });

    if (demoBtn) {
      demoBtn.addEventListener("click", () => {
        if (App.Settings && typeof App.Settings.switchProfile === "function") {
          App.Settings.switchProfile("demo");
          if (App.Utils && typeof App.Utils.showToast === "function") {
            const isEn = App.I18n && App.I18n.getCurrentLanguage() === "en";
            App.Utils.showToast(isEn ? "Switched to Demo Profile." : "Cambiado al Perfil de Ejemplo.");
          }
          renderStep(currentStep);
        }
      });
    }

    window.addEventListener("keydown", (e) => {
      if (!isActive) return;
      if (e.key === "Escape") endTour();
      else if (e.key === "ArrowRight") nextStep();
      else if (e.key === "ArrowLeft") prevStep();
    });

    window.addEventListener("resize", () => {
      if (!isActive) return;
      positionSpotlightAndCard();
    });

    return overlay;
  }

  function startTour(initialStep = 0) {
    savedInitialView = localStorage.getItem("log_calendar_active_view") || "calendar";
    isActive = true;
    currentStep = Math.max(0, Math.min(STEPS.length - 1, initialStep));

    document.body.classList.add("tour-active");
    const dock = document.querySelector(".liquid-glass-dock");
    if (dock) dock.style.display = "none";

    const overlay = ensureTourDOM();
    overlay.classList.add("active");

    renderStep(currentStep);
  }

  function endTour() {
    isActive = false;
    document.body.classList.remove("tour-active");
    const dock = document.querySelector(".liquid-glass-dock");
    if (dock) dock.style.display = "";

    clearTargetHighlight();
    const overlay = document.getElementById("guidedTourOverlay");
    if (overlay) {
      overlay.classList.remove("active");
    }
  }

  function nextStep() {
    if (!isActive) return;
    if (currentStep < STEPS.length - 1) {
      currentStep++;
      renderStep(currentStep);
    } else {
      endTour();
    }
  }

  function prevStep() {
    if (!isActive) return;
    if (currentStep > 0) {
      currentStep--;
      renderStep(currentStep);
    }
  }

  function renderStep(index) {
    const step = STEPS[index];
    if (!step) return;

    // Conmutar a la vista correspondiente
    if (App.Tracker && typeof App.Tracker.switchView === "function") {
      App.Tracker.switchView(step.view, step.subTab);
    }

    const t = (key) => (App.I18n && typeof App.I18n.t === "function" ? App.I18n.t(key) : key);
    const isEn = App.I18n && typeof App.I18n.getCurrentLanguage === "function" && App.I18n.getCurrentLanguage() === "en";

    // Textos
    const badgeEl = document.getElementById("guidedTourStepBadge");
    const titleEl = document.getElementById("guidedTourTitle");
    const descEl = document.getElementById("guidedTourDesc");
    const prevBtn = document.getElementById("guidedTourPrevBtn");
    const nextBtn = document.getElementById("guidedTourNextBtn");
    const dotsContainer = document.getElementById("guidedTourDots");
    const actionBox = document.getElementById("guidedTourActionBox");
    const demoBtn = document.getElementById("guidedTourSwitchDemoBtn");

    if (badgeEl) {
      badgeEl.textContent = isEn ? `Step ${index + 1} of ${STEPS.length}` : `Paso ${index + 1} de ${STEPS.length}`;
    }
    if (titleEl) titleEl.textContent = t(step.titleKey);
    if (descEl) descEl.innerHTML = t(step.descKey);

    if (prevBtn) {
      prevBtn.textContent = isEn ? "Previous" : "Anterior";
      prevBtn.disabled = index === 0;
      prevBtn.style.opacity = index === 0 ? "0.4" : "1";
    }

    if (nextBtn) {
      if (index === STEPS.length - 1) {
        nextBtn.textContent = isEn ? "Finish Tour ✓" : "¡Entendido! Finalizar ✓";
      } else {
        nextBtn.textContent = isEn ? "Next →" : "Siguiente →";
      }
    }

    if (actionBox && demoBtn) {
      if (step.hasDemoAction) {
        actionBox.style.display = "block";
        const isCurrentlyDemo = App.State?.state?.settings?.profile?.title === "Perfil de Ejemplo" ||
                                localStorage.getItem("log_calendar_active_profile_id") === "demo";
        demoBtn.textContent = isCurrentlyDemo
          ? (isEn ? "✓ Demo Profile currently active" : "✓ Perfil de Ejemplo activo")
          : (isEn ? "👤 Switch to Demo Profile now" : "👤 Cambiar al Perfil de Ejemplo ahora");
        demoBtn.disabled = isCurrentlyDemo;
        demoBtn.style.opacity = isCurrentlyDemo ? "0.6" : "1";
      } else {
        actionBox.style.display = "none";
      }
    }

    // Dots
    if (dotsContainer) {
      dotsContainer.innerHTML = "";
      STEPS.forEach((_, sIdx) => {
        const dot = document.createElement("span");
        dot.className = "guided-tour-dot" + (sIdx === index ? " active" : "");
        dot.title = isEn ? `Go to step ${sIdx + 1}` : `Ir al paso ${sIdx + 1}`;
        dot.addEventListener("click", () => {
          currentStep = sIdx;
          renderStep(currentStep);
        });
        dotsContainer.appendChild(dot);
      });
    }

    // Esperar a que la transición de vista se asiente para colocar la tarjeta y foco
    setTimeout(() => {
      positionSpotlightAndCard();
    }, 120);
    setTimeout(() => {
      positionSpotlightAndCard();
    }, 280);
  }

  function updateBackdropSegments(top, left, width, height) {
    const topEl = document.getElementById("tourBackdropTop");
    const btmEl = document.getElementById("tourBackdropBottom");
    const leftEl = document.getElementById("tourBackdropLeft");
    const rightEl = document.getElementById("tourBackdropRight");

    if (!topEl || !btmEl || !leftEl || !rightEl) return;

    if (width === 0 || height === 0) {
      topEl.style.cssText = "top:0; left:0; width:100vw; height:100vh; display:block;";
      btmEl.style.display = "none";
      leftEl.style.display = "none";
      rightEl.style.display = "none";
      return;
    }

    topEl.style.cssText = `top:0; left:0; width:100vw; height:${top}px; display:block;`;
    btmEl.style.cssText = `top:${top + height}px; left:0; width:100vw; height:calc(100vh - ${top + height}px); display:block;`;
    leftEl.style.cssText = `top:${top}px; left:0; width:${left}px; height:${height}px; display:block;`;
    rightEl.style.cssText = `top:${top}px; left:${left + width}px; width:calc(100vw - ${left + width}px); height:${height}px; display:block;`;
  }

  function positionSpotlightAndCard() {
    const step = STEPS[currentStep];
    if (!step) return;

    const spotlight = document.getElementById("guidedTourSpotlight");
    const card = document.getElementById("guidedTourCard");
    if (!spotlight || !card) return;

    let targetEl = document.querySelector(step.targetSelector);
    if (!targetEl || targetEl.offsetParent === null) {
      targetEl = document.querySelector(step.fallbackSelector);
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (targetEl) {
      setTargetHighlight(targetEl);

      // Si el elemento pertenece a una sección con scroll vertical, asegurar que sea visible
      if (typeof targetEl.scrollIntoView === "function" && step.view === "profile" && step.subTab === "settings") {
        targetEl.scrollIntoView({ behavior: "auto", block: "nearest" });
      }

      const rect = targetEl.getBoundingClientRect();
      const pad = 8;
      const top = Math.max(0, rect.top - pad);
      const left = Math.max(0, rect.left - pad);
      const width = Math.min(vw - left, rect.width + pad * 2);
      const height = Math.min(vh - top, rect.height + pad * 2);

      updateBackdropSegments(top, left, width, height);

      spotlight.style.display = "block";
      spotlight.style.top = `${top}px`;
      spotlight.style.left = `${left}px`;
      spotlight.style.width = `${width}px`;
      spotlight.style.height = `${height}px`;

      // Tarjeta: resetear propiedades para evitar acumulación de offsets
      card.style.transform = "none";
      card.style.bottom = "auto";
      card.style.right = "auto";

      const cardWidth = Math.min(440, Math.max(300, vw - 32));
      card.style.width = `${cardWidth}px`;
      const cardHeight = card.offsetHeight || 230;

      // Espacios libres en los 4 costados fuera del objetivo iluminado
      const spaceRight = vw - (left + width);
      const spaceLeft = left;
      const spaceBottom = vh - (top + height);
      const spaceTop = top;

      const gap = 16;
      let chosenSide = null;

      // 1. Probar la posición preferida del paso
      const preferred = step.preferredSide;
      if (preferred === "right" && spaceRight >= cardWidth + gap) {
        chosenSide = "right";
      } else if (preferred === "left" && spaceLeft >= cardWidth + gap) {
        chosenSide = "left";
      } else if (preferred === "bottom" && spaceBottom >= cardHeight + gap) {
        chosenSide = "bottom";
      } else if (preferred === "top" && spaceTop >= cardHeight + gap) {
        chosenSide = "top";
      }

      // 2. Si el lado preferido no cabe fuera del elemento, elegir el costado con mayor holgura
      if (!chosenSide) {
        const sides = [
          { side: "right", space: spaceRight, minRequired: cardWidth + gap },
          { side: "left", space: spaceLeft, minRequired: cardWidth + gap },
          { side: "bottom", space: spaceBottom, minRequired: cardHeight + gap },
          { side: "top", space: spaceTop, minRequired: cardHeight + gap }
        ];
        const fittingSides = sides.filter(s => s.space >= s.minRequired);
        if (fittingSides.length > 0) {
          fittingSides.sort((a, b) => b.space - a.space);
          chosenSide = fittingSides[0].side;
        } else {
          // Si el elemento es gigantesco y no cabe por completo en ningún margen, colocar en el que tenga más espacio
          sides.sort((a, b) => b.space - a.space);
          chosenSide = sides[0].side;
        }
      }

      // 3. Posicionar coordenadas en base al lado seleccionado
      let cTop, cLeft;
      if (chosenSide === "right") {
        cLeft = left + width + gap;
        cTop = Math.max(16, Math.min(vh - cardHeight - 16, top + (height / 2) - (cardHeight / 2)));
      } else if (chosenSide === "left") {
        cLeft = Math.max(16, left - cardWidth - gap);
        cTop = Math.max(16, Math.min(vh - cardHeight - 16, top + (height / 2) - (cardHeight / 2)));
      } else if (chosenSide === "bottom") {
        cTop = top + height + gap;
        cLeft = Math.max(16, Math.min(vw - cardWidth - 16, left + (width / 2) - (cardWidth / 2)));
      } else if (chosenSide === "top") {
        cTop = Math.max(16, top - cardHeight - gap);
        cLeft = Math.max(16, Math.min(vw - cardWidth - 16, left + (width / 2) - (cardWidth / 2)));
      }

      // Asegurar acotamiento dentro de la ventana física
      cLeft = Math.max(12, Math.min(vw - cardWidth - 12, cLeft));
      cTop = Math.max(12, Math.min(vh - cardHeight - 12, cTop));

      card.style.top = `${Math.round(cTop)}px`;
      card.style.left = `${Math.round(cLeft)}px`;
    } else {
      clearTargetHighlight();
      updateBackdropSegments(0, 0, 0, 0);
      spotlight.style.display = "none";
      const cardWidth = Math.min(440, vw - 32);
      card.style.width = `${cardWidth}px`;
      card.style.bottom = "auto";
      card.style.right = "auto";
      card.style.top = "50%";
      card.style.left = "50%";
      card.style.transform = "translate(-50%, -50%)";
    }
  }

  Object.defineProperties(window.App.Tutorial, {
    startTour: { get: () => startTour, set: (v) => startTour = v, enumerable: true },
    endTour: { get: () => endTour, set: (v) => endTour = v, enumerable: true },
    nextStep: { get: () => nextStep, set: (v) => nextStep = v, enumerable: true },
    prevStep: { get: () => prevStep, set: (v) => prevStep = v, enumerable: true }
  });
})();
