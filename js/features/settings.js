(() => {
  window.App = window.App || {};
  window.App.Settings = window.App.Settings || {};



function updateDockProfileAvatar() {
  const avatarImg = document.getElementById("dockProfileAvatarImg");
  const avatarEmoji = document.getElementById("dockProfileAvatarEmoji");
  const avatarData = App.State.state?.settings?.profile?.avatarData;

  if (avatarImg && avatarEmoji) {
    if (avatarData) {
      avatarImg.src = avatarData;
      avatarImg.style.display = "block";
      avatarEmoji.style.display = "none";
    } else {
      avatarImg.src = "";
      avatarImg.style.display = "none";
      avatarEmoji.style.display = "inline-block";
    }
  }
}

function updateHeroProfileAvatar() {
  const avatarImg = document.getElementById("profileAvatarImg");
  const avatarEmoji = document.getElementById("profileAvatarEmoji");
  const avatarData = App.State.state?.settings?.profile?.avatarData;

  if (avatarImg && avatarEmoji) {
    if (avatarData) {
      avatarImg.src = avatarData;
      avatarImg.style.display = "block";
      avatarEmoji.style.display = "none";
    } else {
      avatarImg.src = "";
      avatarImg.style.display = "none";
      avatarEmoji.style.display = "block";
    }
  }
}

const PRESET_AVATARS = [
  {
    id: "academia",
    nameEs: "Academia",
    nameEn: "Academia",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="p_acad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#p_acad)"/><polygon points="50,26 84,40 50,54 16,40" fill="#ffffff"/><path d="M30,48 L30,66 C30,76 70,76 70,66 L70,48" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/><circle cx="82" cy="53" r="3.5" fill="#fef08a"/><path d="M82,53 L85,68" stroke="#fef08a" stroke-width="3.5" stroke-linecap="round"/></svg>`
  },
  {
    id: "developer",
    nameEs: "Developer",
    nameEn: "Developer",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="p_dev" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0ea5e9"/><stop offset="100%" stop-color="#2563eb"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#p_dev)"/><rect x="22" y="28" width="56" height="38" rx="5" fill="#0f172a" stroke="#ffffff" stroke-width="4"/><polygon points="34,44 42,38 42,42 38,44 42,46 42,50" fill="#38bdf8"/><polygon points="66,44 58,38 58,42 62,44 58,46 58,50" fill="#38bdf8"/><rect x="47" y="38" width="6" height="12" rx="1" fill="#f43f5e"/><path d="M18,72 L82,72" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/></svg>`
  },
  {
    id: "explorer",
    nameEs: "Explorador",
    nameEn: "Explorer",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="p_exp" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#10b981"/><stop offset="100%" stop-color="#0d9488"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#p_exp)"/><path d="M50,20 C62,32 66,54 62,64 L38,64 C34,54 38,32 50,20 Z" fill="#ffffff"/><circle cx="50" cy="42" r="7" fill="#0d9488"/><polygon points="38,58 26,68 38,68" fill="#f59e0b"/><polygon points="62,58 74,68 62,68" fill="#f59e0b"/><polygon points="44,64 56,64 50,78" fill="#ef4444"/></svg>`
  },
  {
    id: "zen",
    nameEs: "Zen & Calma",
    nameEn: "Zen & Calm",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="p_zen" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#14b8a6"/><stop offset="100%" stop-color="#059669"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#p_zen)"/><path d="M50,22 C50,42 32,58 32,70 C44,70 56,58 56,38 Z" fill="#ffffff"/><path d="M50,30 C50,46 68,58 68,70 C56,70 44,58 44,42 Z" fill="#ffffff" opacity="0.88"/><circle cx="50" cy="74" r="5" fill="#fef08a"/></svg>`
  },
  {
    id: "mind",
    nameEs: "Enfoque & Mente",
    nameEn: "Deep Mind",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="p_mind" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ec4899"/><stop offset="100%" stop-color="#a855f7"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#p_mind)"/><path d="M48,28 C38,28 30,34 30,44 C30,48 32,52 34,54 C32,58 32,64 36,68 C40,72 46,72 48,70 Z" fill="#ffffff"/><path d="M52,28 C62,28 70,34 70,44 C70,48 68,52 66,54 C68,58 68,64 64,68 C60,72 54,72 52,70 Z" fill="#ffffff"/><circle cx="50" cy="38" r="4" fill="#ec4899"/><circle cx="42" cy="52" r="3.5" fill="#a855f7"/><circle cx="58" cy="52" r="3.5" fill="#a855f7"/></svg>`
  },
  {
    id: "focus",
    nameEs: "Diana / Foco",
    nameEn: "Bullseye Focus",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="p_foc" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f43f5e"/><stop offset="100%" stop-color="#e11d48"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#p_foc)"/><circle cx="50" cy="50" r="32" fill="#ffffff"/><circle cx="50" cy="50" r="22" fill="#f43f5e"/><circle cx="50" cy="50" r="12" fill="#ffffff"/><circle cx="50" cy="50" r="5" fill="#f43f5e"/><line x1="14" y1="50" x2="28" y2="50" stroke="#ffffff" stroke-width="4"/><line x1="72" y1="50" x2="86" y2="50" stroke="#ffffff" stroke-width="4"/><line x1="50" y1="14" x2="50" y2="28" stroke="#ffffff" stroke-width="4"/><line x1="50" y1="72" x2="50" y2="86" stroke="#ffffff" stroke-width="4"/></svg>`
  },
  {
    id: "scholar",
    nameEs: "Estudioso",
    nameEn: "Scholar",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="p_sch" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#d97706"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#p_sch)"/><path d="M50,38 C40,32 26,34 20,38 L20,68 C26,64 40,62 50,68 C60,62 74,64 80,68 L80,38 C74,34 60,32 50,38 Z" fill="#ffffff"/><line x1="50" y1="38" x2="50" y2="68" stroke="#d97706" stroke-width="3"/><polygon points="50,38 54,54 50,51 46,54" fill="#ef4444"/></svg>`
  },
  {
    id: "energy",
    nameEs: "Energía & Flow",
    nameEn: "Energy & Flow",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="p_ene" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#eab308"/><stop offset="100%" stop-color="#ca8a04"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#p_ene)"/><polygon points="54,18 28,52 48,52 44,82 72,46 52,46" fill="#ffffff" stroke="#ca8a04" stroke-width="2"/></svg>`
  },
  {
    id: "creative",
    nameEs: "Creatividad",
    nameEn: "Creative Arts",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="p_cre" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#d946ef"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#p_cre)"/><path d="M50,22 C32,22 20,36 20,54 C20,66 28,74 38,74 C42,74 44,70 46,68 C48,66 50,66 52,66 C62,66 78,58 78,44 C78,32 66,22 50,22 Z" fill="#ffffff"/><circle cx="34" cy="40" r="4.5" fill="#ef4444"/><circle cx="48" cy="34" r="4.5" fill="#eab308"/><circle cx="62" cy="40" r="4.5" fill="#3b82f6"/><circle cx="68" cy="52" r="4.5" fill="#10b981"/><circle cx="38" cy="62" r="6" fill="#d946ef"/></svg>`
  },
  {
    id: "champion",
    nameEs: "Campeón / Logro",
    nameEn: "Champion",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="p_tro" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#b45309"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#p_tro)"/><path d="M34,26 L66,26 L66,44 C66,54 58,60 50,60 C42,60 34,54 34,44 Z" fill="#ffffff"/><path d="M34,32 L24,32 C24,42 32,46 35,46" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/><path d="M66,32 L76,32 C76,42 68,46 65,46" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/><rect x="46" y="60" width="8" height="12" fill="#ffffff"/><rect x="36" y="72" width="28" height="6" rx="2" fill="#ffffff"/><polygon points="50,34 52,40 58,40 53,44 55,50 50,46 45,50 47,44 42,40 48,40" fill="#f59e0b"/></svg>`
  },
  {
    id: "science",
    nameEs: "Ciencia & Análisis",
    nameEn: "Science Lab",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="p_sci" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#06b6d4"/><stop offset="100%" stop-color="#0284c7"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#p_sci)"/><ellipse cx="50" cy="50" rx="36" ry="14" fill="none" stroke="#ffffff" stroke-width="3" transform="rotate(30 50 50)"/><ellipse cx="50" cy="50" rx="36" ry="14" fill="none" stroke="#ffffff" stroke-width="3" transform="rotate(-30 50 50)"/><ellipse cx="50" cy="50" rx="36" ry="14" fill="none" stroke="#ffffff" stroke-width="3" transform="rotate(90 50 50)"/><circle cx="50" cy="50" r="7" fill="#ffffff"/><circle cx="50" cy="42" r="3" fill="#0284c7"/></svg>`
  },
  {
    id: "cosmos",
    nameEs: "Cosmos & Visión",
    nameEn: "Night Cosmos",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="p_cos" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1e1b4b"/><stop offset="100%" stop-color="#4338ca"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#p_cos)"/><path d="M56,24 C40,24 28,36 28,52 C28,68 40,80 56,80 C62,80 68,78 72,74 C58,74 48,62 48,48 C48,36 56,26 68,26 C64,24 60,24 56,24 Z" fill="#fef08a"/><polygon points="72,34 74,38 78,38 75,41 76,45 72,42 68,45 69,41 66,38 70,38" fill="#ffffff"/><polygon points="34,30 35,32 37,32 35,34 36,36 34,34 32,36 33,34 31,32 33,32" fill="#ffffff"/><circle cx="44" cy="68" r="1.5" fill="#ffffff"/><circle cx="76" cy="62" r="2" fill="#ffffff"/></svg>`
  }
];

function setProfileAvatar(dataUrl) {
  if (!App.State.state.settings.profile) App.State.state.settings.profile = {};
  App.State.state.settings.profile.avatarData = dataUrl;
  updateDockProfileAvatar();
  updateHeroProfileAvatar();
  App.Storage.saveState();
  App.Storage.persist();
}

function removeProfileAvatar() {
  if (App.State.state?.settings?.profile) {
    delete App.State.state.settings.profile.avatarData;
  }
  updateDockProfileAvatar();
  updateHeroProfileAvatar();
  App.Storage.saveState();
  App.Storage.persist();
  closeAvatarPickerModal();
  App.Utils.showToast(App.I18n?.text("Foto de perfil eliminada.", "Profile photo removed."));
}

function openAvatarPickerModal() {
  const modal = document.getElementById("avatarPickerModal");
  if (!modal) return;

  const previewImg = document.getElementById("avatarPickerImgPreview");
  const previewEmoji = document.getElementById("avatarPickerEmojiPreview");
  const nameLabel = document.getElementById("avatarPickerProfileName");
  const removeBtn = document.getElementById("avatarOptRemove");

  const avatarData = App.State.state?.settings?.profile?.avatarData;
  const profileName = App.State.state?.settings?.profile?.title || "Principal";

  if (nameLabel) nameLabel.textContent = profileName;

  if (previewImg && previewEmoji) {
    if (avatarData) {
      previewImg.src = avatarData;
      previewImg.style.display = "block";
      previewEmoji.style.display = "none";
    } else {
      previewImg.src = "";
      previewImg.style.display = "none";
      previewEmoji.style.display = "block";
    }
  }

  if (removeBtn) {
    removeBtn.style.display = avatarData ? "flex" : "none";
  }

  modal.hidden = false;
}

function closeAvatarPickerModal() {
  const modal = document.getElementById("avatarPickerModal");
  if (modal) modal.hidden = true;
}

let cameraStream = null;

function stopCameraStream() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => {
      try { track.stop(); } catch (err) {}
    });
    cameraStream = null;
  }
  const video = document.getElementById("cameraVideo");
  if (video) {
    video.srcObject = null;
  }
}

async function openCameraModal() {
  const modal = document.getElementById("cameraModal");
  const video = document.getElementById("cameraVideo");
  const snapshotImg = document.getElementById("cameraSnapshotImg");
  const statusMsg = document.getElementById("cameraStatusMsg");
  const captureBtn = document.getElementById("cameraCaptureBtn");
  const snapshotActions = document.getElementById("cameraSnapshotActions");

  if (!modal || !video) return;

  if (snapshotImg) snapshotImg.style.display = "none";
  video.style.display = "block";
  if (captureBtn) captureBtn.style.display = "inline-flex";
  if (snapshotActions) snapshotActions.style.display = "none";
  if (statusMsg) {
    statusMsg.style.display = "none";
    statusMsg.textContent = "";
  }

  modal.hidden = false;

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (statusMsg) {
      statusMsg.textContent = App.I18n?.text(
        "Tu navegador no soporta el acceso a la cámara mediante mediaDevices.",
        "Your browser does not support camera access via mediaDevices."
      );
      statusMsg.style.display = "block";
    }
    if (captureBtn) captureBtn.style.display = "none";
    return;
  }

  try {
    stopCameraStream();
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 640 },
        facingMode: "user"
      },
      audio: false
    });
    video.srcObject = cameraStream;
    await video.play().catch(() => {});
  } catch (err) {
    console.error("Camera access error:", err);
    if (statusMsg) {
      statusMsg.textContent = App.I18n?.text(
        "No se pudo acceder a la cámara. Comprueba los permisos de tu navegador o dispositivo.",
        "Unable to access the camera. Check your browser or device permissions."
      );
      statusMsg.style.display = "block";
    }
    if (captureBtn) captureBtn.style.display = "none";
  }
}

function closeCameraModal() {
  const modal = document.getElementById("cameraModal");
  if (modal) modal.hidden = true;
  stopCameraStream();
}

function takeCameraSnapshot() {
  const video = document.getElementById("cameraVideo");
  const canvas = document.getElementById("cameraCanvas");
  const snapshotImg = document.getElementById("cameraSnapshotImg");
  const captureBtn = document.getElementById("cameraCaptureBtn");
  const snapshotActions = document.getElementById("cameraSnapshotActions");

  if (!video || !canvas || !snapshotImg) return;

  const size = Math.min(video.videoWidth || 400, video.videoHeight || 400);
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext("2d");

  // Mirror perspective
  ctx.save();
  ctx.translate(400, 0);
  ctx.scale(-1, 1);

  const startX = ((video.videoWidth || 400) - size) / 2;
  const startY = ((video.videoHeight || 400) - size) / 2;
  ctx.drawImage(video, startX, startY, size, size, 0, 0, 400, 400);
  ctx.restore();

  const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
  snapshotImg.src = dataUrl;
  snapshotImg.style.display = "block";
  video.style.display = "none";

  if (captureBtn) captureBtn.style.display = "none";
  if (snapshotActions) snapshotActions.style.display = "inline-flex";

  if (App.Sound && typeof App.Sound.playClick === "function") {
    App.Sound.playClick();
  }
}

function retakeCameraSnapshot() {
  const video = document.getElementById("cameraVideo");
  const snapshotImg = document.getElementById("cameraSnapshotImg");
  const captureBtn = document.getElementById("cameraCaptureBtn");
  const snapshotActions = document.getElementById("cameraSnapshotActions");

  if (snapshotImg) snapshotImg.style.display = "none";
  if (video) video.style.display = "block";
  if (captureBtn) captureBtn.style.display = "inline-flex";
  if (snapshotActions) snapshotActions.style.display = "none";
}

function useCameraSnapshot() {
  const canvas = document.getElementById("cameraCanvas");
  if (!canvas) return;
  const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
  setProfileAvatar(dataUrl);
  closeCameraModal();
  closeAvatarPickerModal();
  App.Utils.showToast(App.I18n?.text("Foto de perfil actualizada con éxito.", "Profile photo updated successfully."));
}

function openAvatarGalleryModal() {
  const modal = document.getElementById("avatarGalleryModal");
  if (!modal) return;
  renderAvatarGallery();
  modal.hidden = false;
}

function closeAvatarGalleryModal() {
  const modal = document.getElementById("avatarGalleryModal");
  if (modal) modal.hidden = true;
}

function renderAvatarGallery() {
  const grid = document.getElementById("avatarGalleryGrid");
  if (!grid) return;
  const isEn = App.I18n?.getCurrentLanguage() === "en";
  grid.innerHTML = "";

  const currentAvatar = App.State.state?.settings?.profile?.avatarData;

  PRESET_AVATARS.forEach(item => {
    const dataUrl = "data:image/svg+xml;utf8," + encodeURIComponent(item.svg);
    const card = document.createElement("button");
    card.type = "button";
    card.className = `avatar-gallery-item ${currentAvatar === dataUrl ? "selected" : ""}`;
    card.setAttribute("aria-label", isEn ? item.nameEn : item.nameEs);
    card.innerHTML = `
      <img src="${dataUrl}" alt="${item.id}" />
      <span class="avatar-gallery-name">${App.Utils.escapeHtml(isEn ? item.nameEn : item.nameEs)}</span>
    `;
    card.addEventListener("click", () => {
      setProfileAvatar(dataUrl);
      closeAvatarGalleryModal();
      closeAvatarPickerModal();
      App.Utils.showToast(App.I18n?.text("Avatar de galería seleccionado.", "Gallery avatar selected."));
    });
    grid.appendChild(card);
  });
}

function applyProfile() {
  const profile = App.State.state.settings.profile;
  const rgb = App.Utils.hexToRgb(profile.accentColor);
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  document.documentElement.style.setProperty("--accent", profile.accentColor);
  if (rgb) document.documentElement.style.setProperty("--accent-rgb", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
  // In dark mode, lighten the accent; in light mode, darken it
  document.documentElement.style.setProperty("--accent-dark", isDark ? App.Utils.lightenColor(profile.accentColor, 0.35) : App.Utils.darkenColor(profile.accentColor, 0.22));
  document.documentElement.style.setProperty("--accent-soft", isDark && rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)` : App.Utils.hexToSoftBackground(profile.accentColor));
  document.documentElement.style.setProperty("--level-1", App.Stats.getIntensityColor(profile.intensityLevels[0]));
  document.documentElement.style.setProperty("--level-2", App.Stats.getIntensityColor(profile.intensityLevels[1]));
  document.documentElement.style.setProperty("--level-3", App.Stats.getIntensityColor(profile.intensityLevels[2]));
  document.documentElement.style.setProperty("--level-4", App.Stats.getIntensityColor(profile.intensityLevels[3]));
  App.Constants.calendarTitleEl.textContent = "LOG CALENDAR";
  App.Constants.calendarSubtitleEl.textContent = "LOG is LOG of Growth";
  App.Constants.calendarSubtitleEl.hidden = false;
  updateDockProfileAvatar();
  updateHeroProfileAvatar();
}

function openSettings(section = "identity") {
  if (App.Tracker && typeof App.Tracker.switchView === "function") {
    App.Tracker.switchView("profile", section);
  } else {
    renderProfileDashboard(section);
  }
}

function closeSettings() {
  if (App.Constants.settingsModalEl) App.Constants.settingsModalEl.hidden = true;
  App.Tasks.closeSubjectEntry();
  App.Tracker.closeTrackEntry();
  App.Tasks.closeEventEntry();
  closeRangeEntry();
  App.Stats.closeAdvancedStats();
}

function openRangeEntry(direction) {
  App.State.pendingRangeExtension = direction;
  const isPrevious = direction === "prev";
  const date = App.Utils.formatDateLong(isPrevious ? App.Calendar.getCalendarStart() : App.Calendar.getCalendarEnd());
  App.Constants.rangeEntryTextEl.textContent = App.I18n?.text(
    `Has llegado a ${date}. Puedes precargar un año ${isPrevious ? "anterior" : "siguiente"} para seguir navegando.`,
    `You have reached ${date}. You can preload one ${isPrevious ? "previous" : "next"} year to keep browsing.`
  );
  App.Constants.rangeEntryConfirmBtn.textContent = App.I18n?.text(
    isPrevious ? "Precargar año anterior" : "Precargar año siguiente",
    isPrevious ? "Preload previous year" : "Preload next year"
  );
  App.Constants.rangeEntryModalEl.hidden = false;
}

function closeRangeEntry() {
  App.Constants.rangeEntryModalEl.hidden = true;
}

function renderSettings() {
  const profile = App.State.state.settings.profile;
  App.Constants.profileTitleEl.value = profile.title;
  App.Constants.profileAccentEl.value = profile.accentColor;
  
  const subjectsPluralInput = document.getElementById("profileSubjectsPlural");
  const subjectsSingularInput = document.getElementById("profileSubjectsSingular");
  const hobbiesPluralInput = document.getElementById("profileHobbiesPlural");
  const hobbiesSingularInput = document.getElementById("profileHobbiesSingular");
  const timeEntryModeInput = document.getElementById("profileTimeEntryMode");
  const dailyGoalInput = document.getElementById("profileDailyGoal");
  if (subjectsPluralInput) subjectsPluralInput.value = App.State.state.settings.subjectsLabelPlural || "Asignaturas";
  if (subjectsSingularInput) subjectsSingularInput.value = App.State.state.settings.subjectsLabelSingular || "Asignatura";
  const subjectsColor = App.State.state.settings.subjectsColor || App.State.state.settings.profile?.accentColor || "#0f766e";
  const subjectsColorInput = document.getElementById("profileSubjectsColor");
  const subjectsGlobalColorInput = document.getElementById("profileSubjectsGlobalColor");
  if (subjectsColorInput) subjectsColorInput.value = subjectsColor;
  if (subjectsGlobalColorInput) subjectsGlobalColorInput.value = subjectsColor;
  if (hobbiesPluralInput) hobbiesPluralInput.value = App.State.state.settings.hobbiesLabelPlural || "Hobbies";
  if (hobbiesSingularInput) hobbiesSingularInput.value = App.State.state.settings.hobbiesLabelSingular || "Hobby";
  if (timeEntryModeInput) timeEntryModeInput.value = App.State.state.settings.timeEntryMode || "decimal";
  if (dailyGoalInput) dailyGoalInput.value = App.State.state.settings.dailyGoal || 0;

  [App.Constants.profileLevel1El, App.Constants.profileLevel2El, App.Constants.profileLevel3El, App.Constants.profileLevel4El].forEach((input, index) => {
    input.value = profile.intensityLevels[index];
  });
  renderAppearanceSettings();
  renderSubjectsSettings();
  renderTracksSettings();
  renderAcademicPeriodsSettings();
  renderGoalsSettings();
  updateStorageStatusUI();
  App.Periods.populateStatsPeriodSelect();
}

function renderSubjectsSettings() {
  App.Constants.subjectsSettingsListEl.innerHTML = "";
  if (!App.State.subjects.length) {
    App.Constants.subjectsSettingsListEl.innerHTML = `<div class="empty-state">Vacío.</div>`;
    return;
  }

  for (const subject of App.State.subjects) {
    const item = document.createElement("div");
    item.className = "settings-item";
    item.innerHTML = `
      <span class="settings-color" style="background:${App.Utils.escapeHtml(subject.color)}"></span>
      <span style="flex: 1 1 auto; margin-right: 10px;"><strong>${App.Utils.escapeHtml(subject.name)}</strong><small>${App.Utils.escapeHtml(subject.description || "Sin descripción")} · Dif. ${App.Tasks.getSubjectDifficulty(subject.name)}</small></span>
      <div class="notice-actions">
        <button type="button" class="notice-action" data-edit-subject="${App.Utils.escapeHtml(subject.name)}" title="Editar" style="color: var(--accent); border-color: rgba(var(--accent-rgb), 0.25);">✎</button>
        <button type="button" class="notice-action" data-delete-subject="${App.Utils.escapeHtml(subject.name)}" title="Eliminar" style="color: #dc2626; border-color: rgba(220, 38, 38, 0.25);">🗑</button>
      </div>
    `;
    App.Constants.subjectsSettingsListEl.appendChild(item);
  }
}

function renderTracksSettings() {
  App.Constants.tracksSettingsListEl.innerHTML = "";
  if (!App.State.EXTRA_TRACKS.length) {
    App.Constants.tracksSettingsListEl.innerHTML = `<div class="empty-state">Vacío.</div>`;
    return;
  }

  for (const track of App.State.EXTRA_TRACKS) {
    const item = document.createElement("div");
    item.className = "settings-item";
    item.innerHTML = `
      <span class="settings-color" style="background:${App.Utils.escapeHtml(track.color)}"></span>
      <span style="flex: 1 1 auto; margin-right: 10px;"><strong>${App.Utils.escapeHtml(track.label)}</strong><small>${App.Utils.escapeHtml(track.description || "Sin descripción")}</small></span>
      <div class="notice-actions">
        <button type="button" class="notice-action" data-edit-track="${App.Utils.escapeHtml(track.key)}" title="Editar" style="color: var(--accent); border-color: rgba(var(--accent-rgb), 0.25);">✎</button>
        <button type="button" class="notice-action" data-delete-track="${App.Utils.escapeHtml(track.key)}" title="Eliminar" style="color: #dc2626; border-color: rgba(220, 38, 38, 0.25);">🗑</button>
      </div>
    `;
    App.Constants.tracksSettingsListEl.appendChild(item);
  }
}

function renderAcademicPeriodsSettings() {
  if (!App.Constants.periodsSettingsListEl) return;
  App.Constants.periodsSettingsListEl.innerHTML = "";
  if (!App.State.academicPeriods.length) {
    App.Constants.periodsSettingsListEl.innerHTML = `<div class="empty-state">Vacío.</div>`;
    return;
  }

  for (const period of App.State.academicPeriods) {
    const item = document.createElement("div");
    item.className = "settings-item";
    
    const dateText = `${App.Utils.formatShortDate(period.startDate)} - ${App.Utils.formatShortDate(period.endDate)}`;
    const subCount = period.subjects.length;
    const trackCount = (period.tracks || []).length;
    const subLabel = subCount === 1 ? (App.State.state.settings.subjectsLabelSingular || "Asignatura") : (App.State.state.settings.subjectsLabelPlural || "Asignaturas");
    
    item.innerHTML = `
      <span class="settings-color" style="background:var(--accent)"></span>
      <span style="flex: 1 1 auto; margin-right: 10px;">
        <strong>${App.Utils.escapeHtml(period.name)}</strong>
        <small>${App.Utils.escapeHtml(dateText)} · ${subCount} ${App.Utils.escapeHtml(subLabel.toLowerCase())} · ${trackCount} hobbies</small>
      </span>
      <div class="notice-actions">
        <button type="button" class="notice-action" data-edit-period="${App.Utils.escapeHtml(period.id)}" title="Editar" style="color: var(--accent); border-color: rgba(var(--accent-rgb), 0.25);">✎</button>
        <button type="button" class="notice-action" data-delete-period="${App.Utils.escapeHtml(period.id)}" title="Eliminar" style="color: #dc2626; border-color: rgba(220, 38, 38, 0.25);">🗑</button>
      </div>
    `;
    App.Constants.periodsSettingsListEl.appendChild(item);
  }
}

function renderGoalsSettings() {
  const dailyInput = document.getElementById("goalsDailyInput");
  if (dailyInput) {
    dailyInput.value = App.State.state.settings.dailyGoal || 0;
  }

  const subPlural = App.State.state.settings.subjectsLabelPlural || "Asignaturas";
  const hobPlural = App.State.state.settings.hobbiesLabelPlural || "Hobbies";
  const subHeading = document.getElementById("goalsSubjectsHeading");
  const trackHeading = document.getElementById("goalsTracksHeading");
  if (subHeading) subHeading.textContent = App.I18n?.text(`Objetivos por ${subPlural} (horas acumuladas)`, `Targets per ${subPlural} (accumulated hours)`);
  if (trackHeading) trackHeading.textContent = App.I18n?.text(`Objetivos por ${hobPlural} (horas acumuladas)`, `Targets per ${hobPlural} (accumulated hours)`);

  const subjectGoalsList = document.getElementById("subjectGoalsList");
  if (subjectGoalsList) {
    subjectGoalsList.innerHTML = "";
    const subjectGoals = App.State.state.settings.subjectGoals || {};
    if (!App.State.subjects.length) {
      subjectGoalsList.innerHTML = `<div class="empty-state">No hay asignaturas configuradas.</div>`;
    } else {
      for (const subject of App.State.subjects) {
        const item = document.createElement("div");
        item.className = "settings-item";
        item.style.display = "flex";
        item.style.alignItems = "center";
        item.style.gap = "10px";
        const curGoal = subjectGoals[subject.name] || 0;
        item.innerHTML = `
          <span class="settings-color" style="background:${App.Utils.escapeHtml(subject.color)}"></span>
          <span style="flex: 1 1 auto;"><strong>${App.Utils.escapeHtml(subject.name)}</strong></span>
          <div style="display: flex; align-items: center; gap: 6px;">
            <input type="number" min="0" step="0.5" value="${curGoal}" data-goal-subject="${App.Utils.escapeHtml(subject.name)}" style="width: 76px; min-height: 32px; padding: 4px 8px; text-align: center; border-radius: 6px; border: 1px solid var(--line); background: var(--bg); color: var(--ink); font-weight: 700;" />
            <small style="color: var(--muted); font-weight: 700;">h</small>
          </div>
        `;
        subjectGoalsList.appendChild(item);
      }
    }
  }

  const trackGoalsList = document.getElementById("trackGoalsList");
  if (trackGoalsList) {
    trackGoalsList.innerHTML = "";
    const trackGoals = App.State.state.settings.trackGoals || {};
    if (!App.State.EXTRA_TRACKS.length) {
      trackGoalsList.innerHTML = `<div class="empty-state">No hay hobbies configurados.</div>`;
    } else {
      for (const track of App.State.EXTRA_TRACKS) {
        const item = document.createElement("div");
        item.className = "settings-item";
        item.style.display = "flex";
        item.style.alignItems = "center";
        item.style.gap = "10px";
        const curGoal = trackGoals[track.key] || 0;
        item.innerHTML = `
          <span class="settings-color" style="background:${App.Utils.escapeHtml(track.color)}"></span>
          <span style="flex: 1 1 auto;"><strong>${App.Utils.escapeHtml(track.label)}</strong></span>
          <div style="display: flex; align-items: center; gap: 6px;">
            <input type="number" min="0" step="0.5" value="${curGoal}" data-goal-track="${App.Utils.escapeHtml(track.key)}" style="width: 76px; min-height: 32px; padding: 4px 8px; text-align: center; border-radius: 6px; border: 1px solid var(--line); background: var(--bg); color: var(--ink); font-weight: 700;" />
            <small style="color: var(--muted); font-weight: 700;">h</small>
          </div>
        `;
        trackGoalsList.appendChild(item);
      }
    }
  }
}

function saveGoalsSettings(event) {
  if (event) event.preventDefault();

  const dailyInput = document.getElementById("goalsDailyInput");
  const dailyVal = dailyInput ? parseFloat(dailyInput.value) || 0 : 0;
  App.State.state.settings.dailyGoal = dailyVal;

  const profileDaily = document.getElementById("profileDailyGoal");
  if (profileDaily) profileDaily.value = dailyVal;

  const subjectGoals = {};
  document.querySelectorAll("[data-goal-subject]").forEach(input => {
    const sName = input.getAttribute("data-goal-subject");
    const val = parseFloat(input.value) || 0;
    if (sName) subjectGoals[sName] = val;
  });
  App.State.state.settings.subjectGoals = subjectGoals;

  const trackGoals = {};
  document.querySelectorAll("[data-goal-track]").forEach(input => {
    const tKey = input.getAttribute("data-goal-track");
    const val = parseFloat(input.value) || 0;
    if (tKey) trackGoals[tKey] = val;
  });
  App.State.state.settings.trackGoals = trackGoals;

  App.Storage.persist();
  if (App.Insights && typeof App.Insights.renderInsightsDashboard === "function") {
    App.Insights.renderInsightsDashboard();
  }
  App.Utils.showToast(App.I18n?.text("Objetivos de tiempo guardados.", "Time goals saved."));
}

function openSettingsToGoals() {
  openSettings("goals");
  const section = document.getElementById("settingsSecGoals");
  if (section) {
    setTimeout(() => {
      section.scrollIntoView({ behavior: "smooth", block: "center" });
      section.classList.add("highlight-pulse");
      setTimeout(() => section.classList.remove("highlight-pulse"), 2500);
    }, 150);
  }
}

function saveProfileSettings(event) {
  if (event) event.preventDefault();
  
  const subjectsPluralInput = document.getElementById("profileSubjectsPlural");
  const subjectsSingularInput = document.getElementById("profileSubjectsSingular");
  const hobbiesPluralInput = document.getElementById("profileHobbiesPlural");
  const hobbiesSingularInput = document.getElementById("profileHobbiesSingular");
  const timeEntryModeInput = document.getElementById("profileTimeEntryMode");
  const dailyGoalInput = document.getElementById("profileDailyGoal");
  const roleInput = document.getElementById("profileRoleInput");
  const bioInput = document.getElementById("profileBioInput");

  if (subjectsPluralInput) App.State.state.settings.subjectsLabelPlural = (subjectsPluralInput.value || "Asignaturas").trim();
  if (subjectsSingularInput) App.State.state.settings.subjectsLabelSingular = (subjectsSingularInput.value || "Asignatura").trim();
  const subjectsColorInput = document.getElementById("profileSubjectsColor") || document.getElementById("profileSubjectsGlobalColor");
  if (subjectsColorInput) App.State.state.settings.subjectsColor = App.Utils.normalizeColor(subjectsColorInput.value);
  if (hobbiesPluralInput) App.State.state.settings.hobbiesLabelPlural = (hobbiesPluralInput.value || "Hobbies").trim();
  if (hobbiesSingularInput) App.State.state.settings.hobbiesLabelSingular = (hobbiesSingularInput.value || "Hobby").trim();
  if (timeEntryModeInput) App.State.state.settings.timeEntryMode = timeEntryModeInput.value === "hours-minutes" ? "hours-minutes" : "decimal";
  if (dailyGoalInput) App.State.state.settings.dailyGoal = parseFloat(dailyGoalInput.value) || 0;

  const titleVal = (App.Constants.profileTitleEl?.value || "").trim() || "Principal";
  const roleVal = (roleInput?.value || "").trim() || "Estudiante / Desarrollo Personal";
  const bioVal = (bioInput?.value || "").trim() || "Modo Enfoque Activo";
  const accentVal = App.Constants.profileAccentEl?.value || "#0f766e";

  const currentLevels = [
    parseFloat(App.Constants.profileLevel1El?.value) || 2,
    parseFloat(App.Constants.profileLevel2El?.value) || 4,
    parseFloat(App.Constants.profileLevel3El?.value) || 6,
    parseFloat(App.Constants.profileLevel4El?.value) || 8
  ];

  const existingProfile = App.State.state.settings.profile || {};
  App.State.state.settings.profile = App.Tasks.normalizeProfile({
    ...existingProfile,
    title: titleVal,
    role: roleVal,
    bio: bioVal,
    accentColor: accentVal,
    intensityLevels: currentLevels
  });

  // Sync profile name to manifest
  const curId = App.Storage.getActiveProfileId();
  const profilesList = App.Storage.getProfilesList();
  const curEntry = profilesList.find(p => p.id === curId);
  if (curEntry) {
    curEntry.name = titleVal;
    localStorage.setItem(App.Storage.PROFILES_MANIFEST_KEY, JSON.stringify(profilesList));
  }

  App.State.syncConfigFromState();
  applyProfile();
  App.Main.updateDynamicLabels();
  App.Tasks.renderSubjectInputs();
  App.Tracker.renderTrackInputs();
  App.DayPanel.renderSelectedDay();
  App.Storage.persist();
  App.Calendar.renderCalendar();

  const heroNameEl = document.getElementById("profileHeroName");
  const heroRoleEl = document.getElementById("profileHeroRole");
  const heroBioEl = document.getElementById("profileHeroBio");
  if (heroNameEl) heroNameEl.textContent = titleVal;
  if (heroRoleEl) heroRoleEl.textContent = roleVal;
  if (heroBioEl) heroBioEl.textContent = bioVal;

  const activeSelect = document.getElementById("profileActiveSelect");
  if (activeSelect && curEntry) {
    const opt = activeSelect.querySelector(`option[value="${curId}"]`);
    if (opt) opt.textContent = titleVal;
  }

  App.Utils.showToast(App.I18n?.text("Perfil guardado con éxito.", "Profile saved successfully."));
}

function refreshAfterConfigChange(message) {
  App.State.syncConfigFromState();
  App.Storage.saveState();
  App.Tasks.renderEventSubjectOptions();
  App.Tasks.updateEventEntryFields();
  App.Tasks.renderSubjectInputs();
  App.Tracker.renderTrackInputs();
  App.DayPanel.renderSelectedDay();
  App.Calendar.renderCalendar();
  App.Stats.renderStats();
  renderSettings();
  App.Main.updateDynamicLabels();
  if (typeof App.Tasks.renderChecklistFilters === "function") {
    App.Tasks.renderChecklistFilters();
  }
  if (typeof App.Tasks.refreshChecklistAll === "function") {
    App.Tasks.refreshChecklistAll();
  }
  App.Storage.flashAutoSave();
  App.Utils.showToast(message);
}

function classifyConfigItems() {
  const allPeriods = App.State.academicPeriods || [];
  
  const annualSubjects = [];
  const periodSubjectsMap = {}; 

  for (const sub of App.State.subjects) {
    if (allPeriods.length === 0) {
      annualSubjects.push(sub.name);
      continue;
    }
    let count = 0;
    const pIds = [];
    for (const p of allPeriods) {
      if (p.subjects && p.subjects.includes(sub.name)) {
        pIds.push(p.id);
        count++;
      }
    }
    if (count === allPeriods.length || count === 0) {
      annualSubjects.push(sub.name);
    } else {
      periodSubjectsMap[sub.name] = pIds;
    }
  }

  const annualTracks = [];
  const periodTracksMap = {}; 

  for (const trk of App.State.EXTRA_TRACKS) {
    if (allPeriods.length === 0) {
      annualTracks.push(trk.key);
      continue;
    }
    let count = 0;
    const pIds = [];
    for (const p of allPeriods) {
      const pTracks = Array.isArray(p.tracks) ? p.tracks : App.State.EXTRA_TRACKS.map(t => t.key);
      if (pTracks.includes(trk.key)) {
        pIds.push(p.id);
        count++;
      }
    }
    if (count === allPeriods.length || count === 0) {
      annualTracks.push(trk.key);
    } else {
      periodTracksMap[trk.key] = pIds;
    }
  }

  return { annualSubjects, periodSubjectsMap, annualTracks, periodTracksMap };
}

let profileEventsBound = false;

function showDockLevel(level) {
  const dockLevel1 = document.getElementById("profileDockLevel1");
  const dockLevelSettings = document.getElementById("profileDockLevelSettings");
  const dockLevelStats = document.getElementById("profileDockLevelStats");
  const settingsSec = document.getElementById("profileSettingsSection");
  const statsSec = document.getElementById("profileStatsSection");

  if (level === "settings") {
    if (dockLevel1) dockLevel1.style.display = "none";
    if (dockLevelSettings) dockLevelSettings.style.display = "flex";
    if (dockLevelStats) dockLevelStats.style.display = "none";
    if (settingsSec) {
      settingsSec.hidden = false;
      settingsSec.style.display = "block";
    }
    if (statsSec) {
      statsSec.hidden = true;
      statsSec.style.display = "none";
    }
    renderSettings();
  } else if (level === "stats") {
    if (dockLevel1) dockLevel1.style.display = "none";
    if (dockLevelSettings) dockLevelSettings.style.display = "none";
    if (dockLevelStats) dockLevelStats.style.display = "flex";
    if (settingsSec) {
      settingsSec.hidden = true;
      settingsSec.style.display = "none";
    }
    if (statsSec) {
      statsSec.hidden = false;
      statsSec.style.display = "block";
    }
  } else {
    // level1
    if (dockLevel1) dockLevel1.style.display = "flex";
    if (dockLevelSettings) dockLevelSettings.style.display = "none";
    if (dockLevelStats) dockLevelStats.style.display = "none";
  }
}

let isProgrammaticScroll = false;
let scrollSpyTicking = false;

function setSettingsActiveNav(sectionKey) {
  document.querySelectorAll("[data-settings-nav]").forEach(tab => {
    const isCurrent = tab.getAttribute("data-settings-nav") === sectionKey;
    tab.classList.toggle("active", isCurrent);
    tab.setAttribute("aria-selected", isCurrent ? "true" : "false");
  });
}

function handleSettingsScrollSpy() {
  if (isProgrammaticScroll) return;
  const settingsSec = document.getElementById("profileSettingsSection");
  if (!settingsSec || settingsSec.hidden || settingsSec.style.display === "none") return;

  const sectionKeys = ["identity", "appearance", "goals", "subjects", "periods", "storage", "about"];
  const sectionIds = {
    identity: "settingsSecIdentity",
    appearance: "settingsSecAppearance",
    goals: "settingsSecGoals",
    subjects: "settingsSecSubjects",
    periods: "settingsSecPeriods",
    storage: "settingsSecStorage",
    about: "settingsSecAbout"
  };

  const atBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 70);
  if (atBottom) {
    setSettingsActiveNav("about");
    return;
  }

  const triggerOffset = 130;
  let currentKey = "identity";

  for (const key of sectionKeys) {
    const el = document.getElementById(sectionIds[key]);
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top <= triggerOffset) {
        currentKey = key;
      }
    }
  }

  setSettingsActiveNav(currentKey);
}

function switchSettingsSection(sectionKey, shouldScroll = true) {
  const sectionIds = {
    identity: "settingsSecIdentity",
    appearance: "settingsSecAppearance",
    goals: "settingsSecGoals",
    subjects: "settingsSecSubjects",
    periods: "settingsSecPeriods",
    storage: "settingsSecStorage",
    about: "settingsSecAbout"
  };

  setSettingsActiveNav(sectionKey);

  const targetId = sectionIds[sectionKey];
  const targetEl = targetId ? document.getElementById(targetId) : null;
  if (targetEl && shouldScroll) {
    isProgrammaticScroll = true;
    targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      isProgrammaticScroll = false;
    }, 750);
  }

  if (sectionKey === "goals") {
    renderGoalsSettings();
  } else if (sectionKey === "subjects") {
    renderSubjectsSettings();
    renderTracksSettings();
  } else if (sectionKey === "periods") {
    renderAcademicPeriodsSettings();
  } else if (sectionKey === "storage") {
    updateStorageStatusUI();
  } else if (sectionKey === "appearance") {
    renderAppearanceSettings();
  }
}

function renderAppearanceSettings() {
  const subjectsPluralInput = document.getElementById("profileSubjectsPlural");
  const subjectsSingularInput = document.getElementById("profileSubjectsSingular");
  const hobbiesPluralInput = document.getElementById("profileHobbiesPlural");
  const hobbiesSingularInput = document.getElementById("profileHobbiesSingular");
  const timeEntryModeInput = document.getElementById("profileTimeEntryMode");

  if (subjectsPluralInput) subjectsPluralInput.value = App.State.state?.settings?.subjectsLabelPlural || "Asignaturas";
  if (subjectsSingularInput) subjectsSingularInput.value = App.State.state?.settings?.subjectsLabelSingular || "Asignatura";
  const subjectsColor = App.State.state?.settings?.subjectsColor || App.State.state?.settings?.profile?.accentColor || "#0f766e";
  const subjectsColorInput = document.getElementById("profileSubjectsColor");
  const subjectsGlobalColorInput = document.getElementById("profileSubjectsGlobalColor");
  if (subjectsColorInput) subjectsColorInput.value = subjectsColor;
  if (subjectsGlobalColorInput) subjectsGlobalColorInput.value = subjectsColor;
  if (hobbiesPluralInput) hobbiesPluralInput.value = App.State.state?.settings?.hobbiesLabelPlural || "Hobbies";
  if (hobbiesSingularInput) hobbiesSingularInput.value = App.State.state?.settings?.hobbiesLabelSingular || "Hobby";
  if (timeEntryModeInput) timeEntryModeInput.value = App.State.state?.settings?.timeEntryMode || "decimal";

  const profile = App.State.state?.settings?.profile;
  if (profile && Array.isArray(profile.intensityLevels)) {
    [App.Constants.profileLevel1El, App.Constants.profileLevel2El, App.Constants.profileLevel3El, App.Constants.profileLevel4El].forEach((input, index) => {
      if (input && profile.intensityLevels[index] !== undefined) input.value = profile.intensityLevels[index];
    });
  }

  const darkToggleSettings = document.getElementById("darkModeToggleSettings");
  if (darkToggleSettings) {
    const curTheme = document.documentElement.getAttribute("data-theme") || "light";
    darkToggleSettings.checked = curTheme === "dark" || curTheme === "oled";
  }

  const themeSelect = document.getElementById("appThemeSelect");
  if (themeSelect) {
    themeSelect.value = App.State.state?.settings?.theme || document.documentElement.getAttribute("data-theme") || "light";
  }

  const heatmapSelect = document.getElementById("heatmapPaletteSelect");
  if (heatmapSelect) {
    heatmapSelect.value = App.State.state?.settings?.heatmapPalette || "sync";
  }

  const densitySelect = document.getElementById("calendarDensitySelect");
  if (densitySelect) {
    densitySelect.value = App.State.state?.settings?.calendarDensity || "standard";
  }

  const soundToggle = document.getElementById("soundFeedbackToggle");
  if (soundToggle) {
    soundToggle.checked = Boolean(App.State.state?.settings?.soundFeedbackEnabled);
  }

  const quoteToggle = document.getElementById("dailyQuoteToggle");
  if (quoteToggle) {
    quoteToggle.checked = App.State.state?.settings?.showDailyQuote !== false;
  }

  const invertSwipeToggle = document.getElementById("invertTrackpadSwipeToggle");
  if (invertSwipeToggle) {
    invertSwipeToggle.checked = Boolean(App.State.state?.settings?.invertTrackpadSwipe);
  }

  const sensitivitySelect = document.getElementById("trackpadSensitivitySelect");
  if (sensitivitySelect) {
    sensitivitySelect.value = App.State.state?.settings?.trackpadSensitivity || "medium";
  }

  const langSelect = document.getElementById("appLanguageSelect");
  if (langSelect) {
    langSelect.value = App.State.state?.settings?.language || (App.I18n?.getCurrentLanguage ? App.I18n.getCurrentLanguage() : "es");
  }
}

function updateStorageStatusUI() {
  if (!App.Storage || typeof App.Storage.getStorageStatus !== "function") return;
  const st = App.Storage.getStorageStatus();
  const icon = document.getElementById("fsStatusIcon");
  const title = document.getElementById("fsStatusTitle");
  const desc = document.getElementById("fsStatusDesc");
  const badge = document.getElementById("fsStatusBadge");
  const connectBtn = document.getElementById("fsConnectBtn");
  const disconnectBtn = document.getElementById("fsDisconnectBtn");

  if (st.connected) {
    if (icon) icon.textContent = "💾";
    if (title) title.textContent = `Carpeta en Disco: "${st.directoryName}"`;
    if (desc) desc.textContent = "Sincronización automática activa en disco: settings.json, calendar.json, tasks.json, tracker.json y documents/.";
    if (badge) {
      badge.textContent = "Disco Nativo";
      badge.className = "storage-status-badge badge-connected";
    }
    if (connectBtn) connectBtn.textContent = "📂 Cambiar Carpeta";
    if (disconnectBtn) disconnectBtn.style.display = "inline-flex";
  } else {
    if (icon) icon.textContent = "📁";
    if (title) title.textContent = "Almacenamiento Local (Persistente)";
    if (st.supported) {
      if (desc) desc.textContent = "Conecta una carpeta local de tu disco para particionar y sincronizar tus datos en archivos físicos JSON y guardar fotos de perfil sin restricciones.";
      if (badge) {
        badge.textContent = "Disponible";
        badge.className = "storage-status-badge";
      }
      if (connectBtn) {
        connectBtn.textContent = "📂 Conectar Carpeta Local en Disco";
        connectBtn.disabled = false;
      }
    } else if (st.isLocalFileProtocol) {
      if (desc) desc.textContent = "Tus datos se guardan con total seguridad y persistencia en localStorage sin dependencias ni exposición a la red.";
      if (badge) {
        badge.textContent = "localStorage (Seguro)";
        badge.className = "storage-status-badge";
      }
      if (connectBtn) {
        connectBtn.textContent = "📂 Almacenamiento Local Seguro";
        connectBtn.disabled = true;
      }
    } else {
      if (desc) desc.textContent = "Tu navegador actual no soporta File System Access API nativa. Los datos se persisten de forma 100% segura en localStorage.";
      if (badge) {
        badge.textContent = "localStorage";
        badge.className = "storage-status-badge";
      }
      if (connectBtn) {
        connectBtn.textContent = "📂 No soportado en este navegador";
        connectBtn.disabled = true;
      }
    }
    if (disconnectBtn) disconnectBtn.style.display = "none";
  }
}

let selectedProfileTemplateKey = "university";

function openProfileTemplateModal() {
  const modal = document.getElementById("profileTemplateModal");
  if (!modal) {
    const isEn = App.I18n?.getCurrentLanguage() === "en";
    const name = prompt(isEn ? "Enter profile name:" : "Introduce el nombre para el nuevo perfil:");
    if (name && name.trim()) {
      App.Storage.createProfile(name.trim(), "blank");
    }
    return;
  }
  const input = document.getElementById("profileTemplateNameInput");
  if (input) input.value = "";
  selectedProfileTemplateKey = "university";
  renderProfileTemplateCards();
  modal.hidden = false;
  if (input) input.focus();
}

function closeProfileTemplateModal() {
  const modal = document.getElementById("profileTemplateModal");
  if (modal) modal.hidden = true;
}

function renderProfileTemplateCards() {
  const container = document.getElementById("profileTemplateCardsGrid");
  if (!container || !App.Storage.getProfileTemplates) return;
  const templates = App.Storage.getProfileTemplates();
  const isEn = App.I18n?.getCurrentLanguage() === "en";
  container.innerHTML = "";

  Object.values(templates).forEach(tpl => {
    const card = document.createElement("div");
    card.className = `template-card ${tpl.id === selectedProfileTemplateKey ? "selected" : ""}`;
    card.dataset.templateId = tpl.id;
    card.innerHTML = `
      <div class="template-card-icon">${tpl.icon || "📁"}</div>
      <div class="template-card-title">${App.Utils.escapeHtml(isEn ? tpl.titleEn : tpl.titleEs)}</div>
      <div class="template-card-desc">${App.Utils.escapeHtml(isEn ? tpl.descEn : tpl.descEs)}</div>
    `;
    card.addEventListener("click", () => {
      selectedProfileTemplateKey = tpl.id;
      container.querySelectorAll(".template-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      const nameInp = document.getElementById("profileTemplateNameInput");
      if (nameInp && !nameInp.value.trim()) {
        nameInp.placeholder = isEn ? tpl.titleEn : tpl.titleEs;
      }
    });
    container.appendChild(card);
  });
}

function renderProfileDashboard(targetSubTab = "identity") {
  const activeId = App.Storage.getActiveProfileId();
  const profilesList = App.Storage.getProfilesList();
  const currentProfile = profilesList.find(p => p.id === activeId) || { id: activeId, name: App.State.state?.settings?.profile?.title || "Principal" };

  // 1. Hero Title, Role & Bio
  const heroNameEl = document.getElementById("profileHeroName");
  const heroRoleEl = document.getElementById("profileHeroRole");
  const heroBioEl = document.getElementById("profileHeroBio");
  const profileRoleInput = document.getElementById("profileRoleInput");
  const profileBioInput = document.getElementById("profileBioInput");

  const userRole = App.State.state?.settings?.profile?.role || "Estudiante / Desarrollo Personal";
  const userBio = App.State.state?.settings?.profile?.bio || "Modo Enfoque Activo";

  if (heroNameEl) heroNameEl.textContent = currentProfile.name;
  if (heroRoleEl) heroRoleEl.textContent = userRole;
  if (heroBioEl) heroBioEl.textContent = userBio;
  if (profileRoleInput) profileRoleInput.value = userRole;
  if (profileBioInput) profileBioInput.value = userBio;

  if (App.Constants.profileTitleEl) App.Constants.profileTitleEl.value = currentProfile.name;
  if (App.Constants.profileAccentEl) App.Constants.profileAccentEl.value = App.State.state?.settings?.profile?.accentColor || "#0f766e";

  // 2. Avatar Display
  updateHeroProfileAvatar();
  updateDockProfileAvatar();

  // 3. Active profile dropdown
  const activeSelect = document.getElementById("profileActiveSelect");
  if (activeSelect) {
    activeSelect.innerHTML = "";
    profilesList.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name;
      if (p.id === activeId) opt.selected = true;
      activeSelect.appendChild(opt);
    });
  }

  // 4. Bind profile events once
  if (!profileEventsBound) {
    profileEventsBound = true;

    // Avatar upload click & change
    const avatarCircle = document.getElementById("profileAvatar");
    const avatarFileInput = document.getElementById("profileAvatarFileInput");
    if (avatarCircle) {
      avatarCircle.addEventListener("click", () => {
        openAvatarPickerModal();
      });
    }
    if (avatarFileInput) {
      avatarFileInput.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
          App.Utils.showToast(App.I18n?.text("Por favor selecciona un archivo de imagen válido.", "Please select a valid image file."));
          return;
        }
        const reader = new FileReader();
        reader.onload = async () => {
          const dataUrl = reader.result;
          setProfileAvatar(dataUrl);
          if (typeof App.Storage.saveAvatarFile === "function") {
            await App.Storage.saveAvatarFile(file);
          }
          closeAvatarPickerModal();
          App.Utils.showToast(App.I18n?.text("Foto de perfil actualizada con éxito.", "Profile photo updated successfully."));
        };
        reader.readAsDataURL(file);
      });
    }

    // Modal listeners
    const avatarPickerCloseBtn = document.getElementById("avatarPickerCloseBtn");
    const avatarPickerBackdrop = document.getElementById("avatarPickerBackdrop");
    const avatarOptUpload = document.getElementById("avatarOptUpload");
    const avatarOptCamera = document.getElementById("avatarOptCamera");
    const avatarOptGallery = document.getElementById("avatarOptGallery");
    const avatarOptRemove = document.getElementById("avatarOptRemove");

    if (avatarPickerCloseBtn) avatarPickerCloseBtn.addEventListener("click", closeAvatarPickerModal);
    if (avatarPickerBackdrop) avatarPickerBackdrop.addEventListener("click", closeAvatarPickerModal);
    if (avatarOptUpload && avatarFileInput) {
      avatarOptUpload.addEventListener("click", () => {
        avatarFileInput.click();
      });
    }
    if (avatarOptCamera) {
      avatarOptCamera.addEventListener("click", () => {
        openCameraModal();
      });
    }
    if (avatarOptGallery) {
      avatarOptGallery.addEventListener("click", () => {
        openAvatarGalleryModal();
      });
    }
    if (avatarOptRemove) {
      avatarOptRemove.addEventListener("click", () => {
        removeProfileAvatar();
      });
    }

    // Camera modal listeners
    const cameraCloseBtn = document.getElementById("cameraCloseBtn");
    const cameraBackdrop = document.getElementById("cameraBackdrop");
    const cameraCaptureBtn = document.getElementById("cameraCaptureBtn");
    const cameraRetakeBtn = document.getElementById("cameraRetakeBtn");
    const cameraUseBtn = document.getElementById("cameraUseBtn");

    if (cameraCloseBtn) cameraCloseBtn.addEventListener("click", closeCameraModal);
    if (cameraBackdrop) cameraBackdrop.addEventListener("click", closeCameraModal);
    if (cameraCaptureBtn) cameraCaptureBtn.addEventListener("click", takeCameraSnapshot);
    if (cameraRetakeBtn) cameraRetakeBtn.addEventListener("click", retakeCameraSnapshot);
    if (cameraUseBtn) cameraUseBtn.addEventListener("click", useCameraSnapshot);

    // Gallery modal listeners
    const avatarGalleryCloseBtn = document.getElementById("avatarGalleryCloseBtn");
    const avatarGalleryBackdrop = document.getElementById("avatarGalleryBackdrop");

    if (avatarGalleryCloseBtn) avatarGalleryCloseBtn.addEventListener("click", closeAvatarGalleryModal);
    if (avatarGalleryBackdrop) avatarGalleryBackdrop.addEventListener("click", closeAvatarGalleryModal);

    // Level 1 Navigation Tabs
    const dockBtnSettings = document.getElementById("profileDockBtnSettings");
    const dockBtnStats = document.getElementById("profileDockBtnStats");
    if (dockBtnSettings) {
      dockBtnSettings.addEventListener("click", () => {
        showDockLevel("settings");
        switchSettingsSection("identity");
      });
    }
    if (dockBtnStats) {
      dockBtnStats.addEventListener("click", () => {
        showDockLevel("stats");
        if (App.Insights && typeof App.Insights.renderInsightsDashboard === "function") {
          App.Insights.renderInsightsDashboard();
        }
      });
    }

    // Back buttons
    const backFromSettings = document.getElementById("profileDockBackFromSettings");
    const backFromStats = document.getElementById("profileDockBackFromStats");
    if (backFromSettings) {
      backFromSettings.addEventListener("click", () => showDockLevel("level1"));
    }
    if (backFromStats) {
      backFromStats.addEventListener("click", () => showDockLevel("level1"));
    }

    // Level 2 Settings sub-tabs
    document.querySelectorAll("[data-settings-nav]").forEach(tabBtn => {
      tabBtn.addEventListener("click", () => {
        const key = tabBtn.getAttribute("data-settings-nav");
        if (key) switchSettingsSection(key);
      });
    });

    // Level 2 Stats sub-tabs
    document.querySelectorAll("[data-stats-nav]").forEach(tabBtn => {
      tabBtn.addEventListener("click", () => {
        const cat = tabBtn.getAttribute("data-stats-nav");
        document.querySelectorAll("[data-stats-nav]").forEach(b => {
          b.classList.toggle("active", b === tabBtn);
          b.setAttribute("aria-selected", b === tabBtn ? "true" : "false");
        });
        if (App.Insights && typeof App.Insights.setInsightsCategory === "function") {
          App.Insights.setInsightsCategory(cat);
        }
      });
    });

    // Storage Connection buttons
    const fsConnectBtn = document.getElementById("fsConnectBtn");
    const fsDisconnectBtn = document.getElementById("fsDisconnectBtn");
    if (fsConnectBtn) {
      fsConnectBtn.addEventListener("click", async () => {
        const ok = await App.Storage.connectDirectory();
        if (ok) {
          updateStorageStatusUI();
          renderProfileDashboard("storage");
          App.Utils.showToast(App.I18n?.text("Carpeta local conectada exitosamente.", "Local folder connected successfully."));
        }
      });
    }
    if (fsDisconnectBtn) {
      fsDisconnectBtn.addEventListener("click", async () => {
        if (confirm(App.I18n?.text(
          "¿Desconectar la carpeta física en disco? Tus datos seguirán disponibles en el almacenamiento local del navegador.",
          "Disconnect the physical disk folder? Your data will remain available in browser storage."
        ))) {
          await App.Storage.disconnectDirectory();
          updateStorageStatusUI();
          App.Utils.showToast(App.I18n?.text("Carpeta local desconectada.", "Local folder disconnected."));
        }
      });
    }

    // Export / Import / Reset buttons in storage card
    const dockExportBtn = document.getElementById("dockExportBtn");
    const dockImportTriggerBtn = document.getElementById("dockImportTriggerBtn");
    const resetDataBtn = document.getElementById("resetDataBtn");
    if (dockExportBtn) {
      dockExportBtn.addEventListener("click", () => App.Storage.exportData());
    }
    if (dockImportTriggerBtn) {
      dockImportTriggerBtn.addEventListener("click", () => {
        let inp = document.getElementById("dockImportFileInput");
        if (!inp) {
          inp = document.createElement("input");
          inp.type = "file";
          inp.id = "dockImportFileInput";
          inp.accept = ".json,application/json";
          inp.style.display = "none";
          inp.addEventListener("change", (e) => App.Storage.importData(e));
          document.body.appendChild(inp);
        }
        inp.click();
      });
    }
    if (resetDataBtn) {
      resetDataBtn.addEventListener("click", () => App.Utils.resetAllData());
    }

    // Appearance save & dark mode toggle
    const saveAppearanceBtn = document.getElementById("saveAppearanceBtn");
    if (saveAppearanceBtn) {
      saveAppearanceBtn.addEventListener("click", () => {
        const subjectsPluralInput = document.getElementById("profileSubjectsPlural");
        const subjectsSingularInput = document.getElementById("profileSubjectsSingular");
        const hobbiesPluralInput = document.getElementById("profileHobbiesPlural");
        const hobbiesSingularInput = document.getElementById("profileHobbiesSingular");
        const timeEntryModeInput = document.getElementById("profileTimeEntryMode");

        App.State.state.settings.subjectsLabelPlural = (subjectsPluralInput?.value || "Asignaturas").trim();
        App.State.state.settings.subjectsLabelSingular = (subjectsSingularInput?.value || "Asignatura").trim();
        const subjectsColorInput = document.getElementById("profileSubjectsColor") || document.getElementById("profileSubjectsGlobalColor");
        if (subjectsColorInput) App.State.state.settings.subjectsColor = App.Utils.normalizeColor(subjectsColorInput.value);
        App.State.state.settings.hobbiesLabelPlural = (hobbiesPluralInput?.value || "Hobbies").trim();
        App.State.state.settings.hobbiesLabelSingular = (hobbiesSingularInput?.value || "Hobby").trim();
        App.State.state.settings.timeEntryMode = timeEntryModeInput?.value === "hours-minutes" ? "hours-minutes" : "decimal";

        App.State.state.settings.profile.intensityLevels = [
          parseFloat(App.Constants.profileLevel1El?.value) || 2,
          parseFloat(App.Constants.profileLevel2El?.value) || 4,
          parseFloat(App.Constants.profileLevel3El?.value) || 6,
          parseFloat(App.Constants.profileLevel4El?.value) || 8
        ];

        const accentInput = document.getElementById("profileAccent");
        if (accentInput) {
          App.State.state.settings.profile.accentColor = accentInput.value;
        }

        const themeSelect = document.getElementById("appThemeSelect");
        if (themeSelect && App.Theme && typeof App.Theme.setTheme === "function") {
          App.Theme.setTheme(themeSelect.value);
        }

        const heatmapSelect = document.getElementById("heatmapPaletteSelect");
        if (heatmapSelect) {
          App.State.state.settings.heatmapPalette = heatmapSelect.value;
          document.documentElement.setAttribute("data-heatmap-palette", heatmapSelect.value);
        }

        const densitySelect = document.getElementById("calendarDensitySelect");
        if (densitySelect) {
          App.State.state.settings.calendarDensity = densitySelect.value;
          const calPane = document.querySelector(".calendar-pane");
          if (calPane) calPane.setAttribute("data-density", densitySelect.value);
        }

        const soundToggle = document.getElementById("soundFeedbackToggle");
        if (soundToggle) {
          App.State.state.settings.soundFeedbackEnabled = Boolean(soundToggle.checked);
        }

        const quoteToggle = document.getElementById("dailyQuoteToggle");
        if (quoteToggle) {
          App.State.state.settings.showDailyQuote = Boolean(quoteToggle.checked);
          if (App.DayPanel && typeof App.DayPanel.renderDailyQuote === "function") {
            App.DayPanel.renderDailyQuote();
          }
        }

        const invertSwipeToggle = document.getElementById("invertTrackpadSwipeToggle");
        if (invertSwipeToggle) {
          App.State.state.settings.invertTrackpadSwipe = Boolean(invertSwipeToggle.checked);
        }

        const sensitivitySelect = document.getElementById("trackpadSensitivitySelect");
        if (sensitivitySelect) {
          App.State.state.settings.trackpadSensitivity = sensitivitySelect.value;
        }

        const langSelect = document.getElementById("appLanguageSelect");
        const languageChanged = Boolean(langSelect && langSelect.value !== App.State.state.settings.language);
        const nextLanguage = languageChanged ? langSelect.value : App.State.state.settings.language;

        App.State.syncConfigFromState();
        if (languageChanged && App.I18n && typeof App.I18n.setLanguage === "function") {
          App.I18n.setLanguage(nextLanguage);
          return;
        }
        applyProfile();
        App.Main.updateDynamicLabels();
        App.Tasks.renderSubjectInputs();
        App.Tracker.renderTrackInputs();
        App.DayPanel.renderSelectedDay();
        App.Calendar.renderCalendar();
        App.Storage.persist();
        App.Utils.showToast(App.I18n?.getCurrentLanguage() === "en" ? "Appearance preferences saved." : "Preferencias de aspecto guardadas.");
      });
    }

    const themeSelect = document.getElementById("appThemeSelect");
    if (themeSelect) {
      themeSelect.addEventListener("change", (e) => {
        if (App.Theme && typeof App.Theme.setTheme === "function") {
          App.Theme.setTheme(e.target.value);
        }
      });
    }

    const heatmapSelect = document.getElementById("heatmapPaletteSelect");
    if (heatmapSelect) {
      heatmapSelect.addEventListener("change", (e) => {
        if (!App.State.state.settings) App.State.state.settings = {};
        App.State.state.settings.heatmapPalette = e.target.value;
        document.documentElement.setAttribute("data-heatmap-palette", e.target.value);
        App.Storage.saveState();
        applyProfile();
        App.Calendar.renderCalendar();
        App.Stats.renderStats();
      });
    }

    const profileAccentInput = document.getElementById("profileAccent");
    if (profileAccentInput) {
      profileAccentInput.addEventListener("input", (e) => {
        if (!App.State.state.settings.profile) App.State.state.settings.profile = {};
        App.State.state.settings.profile.accentColor = e.target.value;
        applyProfile();
        const curPal = App.State.state.settings.heatmapPalette;
        if (curPal === "custom" || curPal === "sync" || !curPal) {
          App.Calendar.renderCalendar();
          App.Stats.renderStats();
        }
      });
      profileAccentInput.addEventListener("change", () => {
        App.Storage.saveState();
      });
    }

    function handleGlobalSubjectsColorChange(e) {
      const newColor = App.Utils.normalizeColor(e.target.value);
      if (!App.State.state.settings) App.State.state.settings = {};
      App.State.state.settings.subjectsColor = newColor;
      const c1 = document.getElementById("profileSubjectsColor");
      const c2 = document.getElementById("profileSubjectsGlobalColor");
      if (c1 && c1 !== e.target) c1.value = newColor;
      if (c2 && c2 !== e.target) c2.value = newColor;
      App.Stats.renderStats();
    }

    const subColorEl = document.getElementById("profileSubjectsColor");
    if (subColorEl) {
      subColorEl.addEventListener("input", handleGlobalSubjectsColorChange);
      subColorEl.addEventListener("change", () => {
        App.Storage.saveState();
      });
    }

    const subGlobalColorEl = document.getElementById("profileSubjectsGlobalColor");
    if (subGlobalColorEl) {
      subGlobalColorEl.addEventListener("input", handleGlobalSubjectsColorChange);
      subGlobalColorEl.addEventListener("change", () => {
        App.Storage.saveState();
        App.Utils.showToast(App.I18n?.text("Color de asignaturas actualizado.", "Subjects color updated."));
      });
    }

    const densitySelect = document.getElementById("calendarDensitySelect");
    if (densitySelect) {
      densitySelect.addEventListener("change", (e) => {
        if (!App.State.state.settings) App.State.state.settings = {};
        App.State.state.settings.calendarDensity = e.target.value;
        const calPane = document.querySelector(".calendar-pane");
        if (calPane) calPane.setAttribute("data-density", e.target.value);
        App.Storage.saveState();
        App.Calendar.renderCalendar();
      });
    }

    const soundToggle = document.getElementById("soundFeedbackToggle");
    if (soundToggle) {
      soundToggle.addEventListener("change", (e) => {
        if (!App.State.state.settings) App.State.state.settings = {};
        App.State.state.settings.soundFeedbackEnabled = Boolean(e.target.checked);
        App.Storage.saveState();
        if (e.target.checked && App.Sound && typeof App.Sound.playClick === "function") {
          App.Sound.playClick();
        }
      });
    }

    const quoteToggle = document.getElementById("dailyQuoteToggle");
    if (quoteToggle) {
      quoteToggle.addEventListener("change", (e) => {
        if (!App.State.state.settings) App.State.state.settings = {};
        App.State.state.settings.showDailyQuote = Boolean(e.target.checked);
        App.Storage.saveState();
        if (App.DayPanel && typeof App.DayPanel.renderDailyQuote === "function") {
          App.DayPanel.renderDailyQuote();
        }
      });
    }

    const darkToggleSettings = document.getElementById("darkModeToggleSettings");
    if (darkToggleSettings) {
      darkToggleSettings.addEventListener("change", (e) => {
        const isDark = e.target.checked;
        if (App.Theme && typeof App.Theme.setTheme === "function") {
          App.Theme.setTheme(isDark ? "dark" : "light");
        } else {
          document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
          App.Storage.setDarkMode(isDark);
          applyProfile();
        }
      });
    }

    const invertSwipeToggle = document.getElementById("invertTrackpadSwipeToggle");
    if (invertSwipeToggle) {
      invertSwipeToggle.addEventListener("change", (e) => {
        if (!App.State.state.settings) App.State.state.settings = {};
        App.State.state.settings.invertTrackpadSwipe = Boolean(e.target.checked);
        App.Storage.saveState();
        App.Utils.showToast(e.target.checked
          ? App.I18n?.text("Dirección del trackpad invertida.", "Trackpad direction inverted.")
          : App.I18n?.text("Dirección del trackpad normal.", "Normal trackpad direction."));
      });
    }

    const sensitivitySelect = document.getElementById("trackpadSensitivitySelect");
    if (sensitivitySelect) {
      sensitivitySelect.addEventListener("change", (e) => {
        if (!App.State.state.settings) App.State.state.settings = {};
        App.State.state.settings.trackpadSensitivity = e.target.value;
        App.Storage.saveState();
        const msg = e.target.value === "low"
          ? App.I18n?.text("Sensibilidad baja calibrada (gesto amplio).", "Low sensitivity calibrated (wide gesture).")
          : (e.target.value === "high"
            ? App.I18n?.text("Sensibilidad alta calibrada (respuesta rápida).", "High sensitivity calibrated (fast response).")
            : App.I18n?.text("Sensibilidad media calibrada (equilibrada).", "Medium sensitivity calibrated (balanced)."));
        App.Utils.showToast(msg);
      });
    }

    const langSelect = document.getElementById("appLanguageSelect");
    if (langSelect) {
      langSelect.addEventListener("change", (e) => {
        const newLang = e.target.value;
        if (App.I18n && typeof App.I18n.setLanguage === "function") {
          App.I18n.setLanguage(newLang);
        } else {
          if (!App.State.state.settings) App.State.state.settings = {};
          App.State.state.settings.language = newLang;
          App.Storage.saveState();
        }
        App.Utils.showToast(newLang === "en" ? "Language changed to English." : "Idioma cambiado a Español.");
      });
    }

    // Active profile dropdown change
    if (activeSelect) {
      activeSelect.addEventListener("change", (e) => {
        const newId = e.target.value;
        if (newId && newId !== App.Storage.getActiveProfileId()) {
          App.Storage.switchProfile(newId);
        }
      });
    }

    // Create new profile with templates
    const newBtn = document.getElementById("profileNewBtn");
    if (newBtn) {
      newBtn.addEventListener("click", () => {
        openProfileTemplateModal();
      });
    }

    const templateForm = document.getElementById("profileTemplateForm");
    if (templateForm) {
      templateForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.getElementById("profileTemplateNameInput");
        const name = input ? input.value.trim() : "";
        const templates = App.Storage.getProfileTemplates();
        const tpl = templates[selectedProfileTemplateKey] || templates.blank;
        const isEn = App.I18n?.getCurrentLanguage() === "en";
        const finalName = name || (isEn ? tpl.titleEn : tpl.titleEs) || "Nuevo Perfil";
        App.Storage.createProfile(finalName, selectedProfileTemplateKey);
        closeProfileTemplateModal();
        App.Utils.showToast(isEn ? `Profile "${finalName}" created.` : `Perfil "${finalName}" creado.`);
      });
    }

    const closeTemplateBtn = document.getElementById("profileTemplateCloseBtn");
    if (closeTemplateBtn) {
      closeTemplateBtn.addEventListener("click", closeProfileTemplateModal);
    }
    const cancelTemplateBtn = document.getElementById("profileTemplateCancelBtn");
    if (cancelTemplateBtn) {
      cancelTemplateBtn.addEventListener("click", closeProfileTemplateModal);
    }

    // Rename profile
    const renameBtn = document.getElementById("profileRenameBtn");
    if (renameBtn) {
      renameBtn.addEventListener("click", () => {
        const curId = App.Storage.getActiveProfileId();
        const pList = App.Storage.getProfilesList();
        const cur = pList.find(p => p.id === curId);
        const name = prompt(App.I18n?.text("Nuevo nombre para este perfil:", "New name for this profile:"), cur?.name || "");
        if (name && name.trim()) {
          App.Storage.renameProfile(curId, name.trim());
        }
      });
    }

    // Delete profile
    const deleteBtn = document.getElementById("profileDeleteBtn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        const curId = App.Storage.getActiveProfileId();
        const pList = App.Storage.getProfilesList();
        const cur = pList.find(p => p.id === curId);
        if (pList.length <= 1) {
          alert(App.I18n?.text("No puedes borrar el único perfil activo.", "You cannot delete the only active profile."));
          return;
        }
        if (confirm(App.I18n?.text(
          `¿Estás seguro de que deseas eliminar el perfil "${cur?.name || ''}" y todos sus datos? Esta acción no se puede deshacer.`,
          `Are you sure you want to delete profile "${cur?.name || ''}" and all its data? This cannot be undone.`
        ))) {
          App.Storage.deleteProfile(curId);
        }
      });
    }

    // Guided Tutorial launcher buttons
    const tourBtn = document.getElementById("startGuidedTourBtn");
    if (tourBtn) {
      tourBtn.addEventListener("click", () => {
        if (App.Tutorial && typeof App.Tutorial.startTour === "function") {
          App.Tutorial.startTour(0);
        }
      });
    }

    const tourAboutBtn = document.getElementById("startGuidedTourAboutBtn");
    if (tourAboutBtn) {
      tourAboutBtn.addEventListener("click", () => {
        if (App.Tutorial && typeof App.Tutorial.startTour === "function") {
          App.Tutorial.startTour(0);
        }
      });
    }
  }

  // 5. Select target view according to targetSubTab
  const knownSettingsSections = ["identity", "appearance", "goals", "subjects", "periods", "storage", "about"];

  if (targetSubTab === "stats" || targetSubTab === "study" || targetSubTab === "tracker") {
    showDockLevel("stats");
    const statsCat = targetSubTab === "tracker" ? "tracker" : "study";
    document.querySelectorAll("[data-stats-nav]").forEach(b => {
      const match = b.getAttribute("data-stats-nav") === statsCat;
      b.classList.toggle("active", match);
      b.setAttribute("aria-selected", match ? "true" : "false");
    });
    if (App.Insights && typeof App.Insights.setInsightsCategory === "function") {
      App.Insights.setInsightsCategory(statsCat);
    } else if (App.Insights && typeof App.Insights.renderInsightsDashboard === "function") {
      App.Insights.renderInsightsDashboard();
    }
  } else if (knownSettingsSections.includes(targetSubTab)) {
    showDockLevel("settings");
    switchSettingsSection(targetSubTab);
  } else {
    // Default to settings identity
    showDockLevel("settings");
    switchSettingsSection("identity");
  }
}

  Object.defineProperties(window.App.Settings, {
    applyProfile: { get: () => applyProfile, set: (v) => applyProfile = v, enumerable: true },
    openSettings: { get: () => openSettings, set: (v) => openSettings = v, enumerable: true },
    closeSettings: { get: () => closeSettings, set: (v) => closeSettings = v, enumerable: true },
    openRangeEntry: { get: () => openRangeEntry, set: (v) => openRangeEntry = v, enumerable: true },
    closeRangeEntry: { get: () => closeRangeEntry, set: (v) => closeRangeEntry = v, enumerable: true },
    renderSettings: { get: () => renderSettings, set: (v) => renderSettings = v, enumerable: true },
    renderProfileDashboard: { get: () => renderProfileDashboard, set: (v) => renderProfileDashboard = v, enumerable: true },
    showDockLevel: { get: () => showDockLevel, set: (v) => showDockLevel = v, enumerable: true },
    switchSettingsSection: { get: () => switchSettingsSection, set: (v) => switchSettingsSection = v, enumerable: true },
    updateStorageStatusUI: { get: () => updateStorageStatusUI, set: (v) => updateStorageStatusUI = v, enumerable: true },
    renderSubjectsSettings: { get: () => renderSubjectsSettings, set: (v) => renderSubjectsSettings = v, enumerable: true },
    renderTracksSettings: { get: () => renderTracksSettings, set: (v) => renderTracksSettings = v, enumerable: true },
    renderAcademicPeriodsSettings: { get: () => renderAcademicPeriodsSettings, set: (v) => renderAcademicPeriodsSettings = v, enumerable: true },
    saveProfileSettings: { get: () => saveProfileSettings, set: (v) => saveProfileSettings = v, enumerable: true },
    renderGoalsSettings: { get: () => renderGoalsSettings, set: (v) => renderGoalsSettings = v, enumerable: true },
    saveGoalsSettings: { get: () => saveGoalsSettings, set: (v) => saveGoalsSettings = v, enumerable: true },
    openSettingsToGoals: { get: () => openSettingsToGoals, set: (v) => openSettingsToGoals = v, enumerable: true },
    refreshAfterConfigChange: { get: () => refreshAfterConfigChange, set: (v) => refreshAfterConfigChange = v, enumerable: true },
    classifyConfigItems: { get: () => classifyConfigItems, set: (v) => classifyConfigItems = v, enumerable: true },
    updateDockProfileAvatar: { get: () => updateDockProfileAvatar, set: (v) => updateDockProfileAvatar = v, enumerable: true },
    updateHeroProfileAvatar: { get: () => updateHeroProfileAvatar, set: (v) => updateHeroProfileAvatar = v, enumerable: true },
    handleSettingsScrollSpy: { get: () => handleSettingsScrollSpy, set: (v) => handleSettingsScrollSpy = v, enumerable: true }
  });

  window.addEventListener("scroll", () => {
    if (!scrollSpyTicking) {
      scrollSpyTicking = true;
      requestAnimationFrame(() => {
        handleSettingsScrollSpy();
        scrollSpyTicking = false;
      });
    }
  }, { passive: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      updateDockProfileAvatar();
    });
  } else {
    updateDockProfileAvatar();
  }
})();

