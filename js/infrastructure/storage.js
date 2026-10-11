(() => {
  window.App = window.App || {};
  window.App.Storage = window.App.Storage || {};



  const PROFILES_MANIFEST_KEY = "LOG-calendar-profiles-manifest-v1";
  const ACTIVE_PROFILE_KEY = "LOG-calendar-active-profile-id";

  // --- LOCAL-FIRST DISK PERSISTENCE ENGINE (FILE SYSTEM ACCESS API & INDEXEDDB) ---
  const IDB_NAME = "DEFLOG_Storage_v1";
  const IDB_STORE = "fs_handles";
  const IDB_KEY = "root_directory";

  let connectedDirHandle = null;
  let cachedLoadedFsState = null;
  let saveToDiskTimer = null;
  const isFsSupported = typeof window.showDirectoryPicker === "function" && typeof indexedDB !== "undefined";

  function openIdb() {
    return new Promise((resolve) => {
      if (!isFsSupported) return resolve(null);
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
  }

  async function getStoredDirHandle() {
    try {
      const db = await openIdb();
      if (!db) return null;
      return new Promise((resolve) => {
        const tx = db.transaction(IDB_STORE, "readonly");
        const store = tx.objectStore(IDB_STORE);
        const req = store.get(IDB_KEY);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  async function storeDirHandle(handle) {
    try {
      const db = await openIdb();
      if (!db) return false;
      return new Promise((resolve) => {
        const tx = db.transaction(IDB_STORE, "readwrite");
        const store = tx.objectStore(IDB_STORE);
        const req = store.put(handle, IDB_KEY);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  }

  async function removeStoredDirHandle() {
    try {
      const db = await openIdb();
      if (!db) return false;
      return new Promise((resolve) => {
        const tx = db.transaction(IDB_STORE, "readwrite");
        const store = tx.objectStore(IDB_STORE);
        const req = store.delete(IDB_KEY);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  }

  async function writeFsFile(dirHandle, fileName, textContent) {
    const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(textContent);
    await writable.close();
  }

  async function readFsFile(dirHandle, fileName) {
    try {
      const fileHandle = await dirHandle.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      return await file.text();
    } catch {
      return null;
    }
  }

  async function saveStateToDirectory() {
    if (!connectedDirHandle) return false;
    try {
      const state = App.State.state || {};
      const profilesList = getProfilesList();
      const activeId = getActiveProfileId();

      const manifestContent = JSON.stringify({
        version: App.Constants.APP_VERSION,
        updatedAt: Date.now(),
        activeProfileId: activeId,
        profiles: profilesList
      }, null, 2);

      const settingsContent = JSON.stringify(state.settings || {}, null, 2);
      const calendarContent = JSON.stringify({ days: state.days || {} }, null, 2);
      const tasksContent = JSON.stringify({ checklistTasks: state.checklistTasks || [] }, null, 2);
      const trackerContent = JSON.stringify({ routineTracker: state.routineTracker || { habits: [], monthlyChecks: {} } }, null, 2);

      await writeFsFile(connectedDirHandle, "manifest.json", manifestContent);
      await writeFsFile(connectedDirHandle, "settings.json", settingsContent);
      await writeFsFile(connectedDirHandle, "calendar.json", calendarContent);
      await writeFsFile(connectedDirHandle, "tasks.json", tasksContent);
      await writeFsFile(connectedDirHandle, "tracker.json", trackerContent);
      return true;
    } catch (err) {
      console.warn("Error escribiendo en directorio físico:", err);
      return false;
    }
  }

  function scheduleSaveToDisk() {
    if (!connectedDirHandle) return;
    clearTimeout(saveToDiskTimer);
    saveToDiskTimer = setTimeout(async () => {
      await saveStateToDirectory();
    }, 400);
  }

  async function loadStateFromDirectory() {
    if (!connectedDirHandle) return null;
    try {
      const settingsRaw = await readFsFile(connectedDirHandle, "settings.json");
      const calendarRaw = await readFsFile(connectedDirHandle, "calendar.json");
      const tasksRaw = await readFsFile(connectedDirHandle, "tasks.json");
      const trackerRaw = await readFsFile(connectedDirHandle, "tracker.json");
      const manifestRaw = await readFsFile(connectedDirHandle, "manifest.json");

      if (!settingsRaw && !calendarRaw && !tasksRaw && !trackerRaw) {
        await saveStateToDirectory();
        return null;
      }

      if (manifestRaw) {
        try {
          const parsedManifest = JSON.parse(manifestRaw);
          if (Array.isArray(parsedManifest.profiles) && parsedManifest.profiles.length > 0) {
            localStorage.setItem(PROFILES_MANIFEST_KEY, JSON.stringify(parsedManifest.profiles));
          }
          if (parsedManifest.activeProfileId) {
            localStorage.setItem(ACTIVE_PROFILE_KEY, parsedManifest.activeProfileId);
          }
        } catch {}
      }

      let parsedSettings = {};
      let parsedCalendar = {};
      let parsedTasks = {};
      let parsedTracker = {};

      try { if (settingsRaw) parsedSettings = JSON.parse(settingsRaw) || {}; } catch {}
      try { if (calendarRaw) parsedCalendar = JSON.parse(calendarRaw) || {}; } catch {}
      try { if (tasksRaw) parsedTasks = JSON.parse(tasksRaw) || {}; } catch {}
      try { if (trackerRaw) parsedTracker = JSON.parse(trackerRaw) || {}; } catch {}

      const combined = {
        settings: parsedSettings,
        days: (parsedCalendar && parsedCalendar.days) || {},
        checklistTasks: (parsedTasks && parsedTasks.checklistTasks) || [],
        routineTracker: (parsedTracker && parsedTracker.routineTracker) || { habits: [], monthlyChecks: {} }
      };

      try {
        const docDir = await connectedDirHandle.getDirectoryHandle("documents", { create: false });
        const avatarHandle = await docDir.getFileHandle("avatar.png");
        const avatarFile = await avatarHandle.getFile();
        const reader = new FileReader();
        const dataUrl = await new Promise((res) => {
          reader.onload = () => res(reader.result);
          reader.onerror = () => res(null);
          reader.readAsDataURL(avatarFile);
        });
        if (dataUrl && combined.settings?.profile) {
          combined.settings.profile.avatarData = dataUrl;
        }
      } catch {}

      return App.Tasks.normalizeState(combined);
    } catch (err) {
      console.warn("Error leyendo de directorio físico:", err);
      return null;
    }
  }

  async function initStorage() {
    if (!isFsSupported) return;
    try {
      const handle = await getStoredDirHandle();
      if (!handle) return;
      const perm = await handle.queryPermission({ mode: "readwrite" });
      if (perm === "granted") {
        connectedDirHandle = handle;
        const loaded = await loadStateFromDirectory();
        if (loaded) {
          cachedLoadedFsState = loaded;
        }
      }
    } catch (err) {
      console.warn("Fallo en initStorage:", err);
    }
  }

  async function connectDirectory() {
    if (!isFsSupported) {
      App.Utils.showToast(App.I18n?.text("Tu navegador no soporta File System Access API.", "Your browser does not support the File System Access API."));
      return null;
    }
    try {
      const handle = await window.showDirectoryPicker({ mode: "readwrite" });
      if (!handle) return null;
      connectedDirHandle = handle;
      await storeDirHandle(handle);
      await saveStateToDirectory();
      App.Utils.showToast(App.I18n?.text(`Conectado a carpeta "${handle.name}".`, `Connected to folder "${handle.name}".`));
      return handle.name;
    } catch (err) {
      if (err.name !== "AbortError") {
        App.Utils.showToast(App.I18n?.text("Error al conectar la carpeta.", "Could not connect to the folder."));
      }
      return null;
    }
  }

  async function disconnectDirectory() {
    connectedDirHandle = null;
    await removeStoredDirHandle();
    App.Utils.showToast(App.I18n?.text("Desconectado de la carpeta local.", "Disconnected from the local folder."));
  }

  function getStorageStatus() {
    return {
      supported: isFsSupported,
      isFsSupported,
      connected: Boolean(connectedDirHandle),
      isConnected: Boolean(connectedDirHandle),
      directoryName: connectedDirHandle ? connectedDirHandle.name : null,
      isLocalFileProtocol: window.location.protocol === "file:"
    };
  }

  async function saveAvatarFile(file) {
    if (!file) return null;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result;
        if (App.State.state?.settings?.profile) {
          App.State.state.settings.profile.avatarData = dataUrl;
          saveState();
        }

        if (connectedDirHandle) {
          try {
            const docDir = await connectedDirHandle.getDirectoryHandle("documents", { create: true });
            const avatarHandle = await docDir.getFileHandle("avatar.png", { create: true });
            const writable = await avatarHandle.createWritable();
            await writable.write(file);
            await writable.close();
          } catch (e) {
            console.warn("No se pudo escribir el avatar en documents/:", e);
          }
        }
        resolve(dataUrl);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  const DEMO_PROFILE_ID = "demo";
  const DEMO_PROFILE_NAME = "Perfil de Ejemplo (Demo)";

  function getProfilesList() {
    let list = [];
    try {
      const raw = localStorage.getItem(PROFILES_MANIFEST_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
      }
    } catch (err) {}

    if (!list.length) {
      let initialTitle = "Principal";
      try {
        const legacyRaw = localStorage.getItem(App.Constants.STORAGE_KEY);
        if (legacyRaw) {
          const parsedLegacy = JSON.parse(legacyRaw);
          if (parsedLegacy?.settings?.profile?.title) {
            initialTitle = parsedLegacy.settings.profile.title;
          }
        }
      } catch (err) {}

      list = [
        { id: "default", name: initialTitle, createdAt: Date.now() }
      ];
    }

    // Always ensure hardcoded Demo Profile is available in the list
    if (!list.some(p => p.id === DEMO_PROFILE_ID)) {
      list.push({
        id: DEMO_PROFILE_ID,
        name: DEMO_PROFILE_NAME,
        isDemo: true,
        createdAt: 1704067200000
      });
      try {
        localStorage.setItem(PROFILES_MANIFEST_KEY, JSON.stringify(list));
      } catch (err) {}
    }

    if (!localStorage.getItem(ACTIVE_PROFILE_KEY)) {
      try {
        localStorage.setItem(ACTIVE_PROFILE_KEY, list[0].id);
      } catch (err) {}
    }

    return list;
  }

  function getActiveProfileId() {
    const currentId = localStorage.getItem(ACTIVE_PROFILE_KEY);
    const profiles = getProfilesList();
    if (currentId && profiles.some(p => p.id === currentId)) {
      return currentId;
    }
    const fallbackId = profiles[0]?.id || "default";
    try {
      localStorage.setItem(ACTIVE_PROFILE_KEY, fallbackId);
    } catch (err) {}
    return fallbackId;
  }

  function setActiveProfileId(profileId) {
    try {
      localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
    } catch (err) {}
  }

  function getProfileStorageKey(profileId) {
    return "LOG-calendar-profile-state-" + (profileId || "default");
  }

  function getProfileTemplates() {
    return {
      university: {
        id: "university",
        icon: "🎓",
        titleEs: "Estudiante Universitario",
        titleEn: "University Student",
        descEs: "Materias académicas, proyectos, hábitos de estudio y preparación de exámenes.",
        descEn: "Academic subjects, projects, daily study routines, and exam preparation.",
        defaultRole: "Estudiante Universitario",
        defaultBio: "Grado Académico & Proyectos",
        accentColor: "#0f766e",
        subjects: [
          { name: "Matemáticas / Cálculo", color: "#2563eb", description: "Álgebra y análisis", difficulty: 4 },
          { name: "Programación / Software", color: "#059669", description: "Estructuras y proyectos", difficulty: 3 },
          { name: "Física / Fundamentos", color: "#d97706", description: "Mecánica y teoría", difficulty: 4 },
          { name: "Sistemas Digitales", color: "#7c3aed", description: "Arquitectura y redes", difficulty: 3 }
        ],
        tracks: [
          { key: "reading", label: "Lectura & Idiomas", color: "#475569", description: "Lectura y práctica" },
          { key: "sport", label: "Deporte / Gym", color: "#16a34a", description: "Actividad física" }
        ],
        habits: [
          { emoji: "📚", name: "Estudio temario (2h+)", goal: 25 },
          { emoji: "🔁", name: "Repaso espaciado", goal: 20 },
          { emoji: "🏋️", name: "Ejercicio físico", goal: 20 },
          { emoji: "😴", name: "Dormir 8 horas", goal: 26 }
        ]
      },
      opositor: {
        id: "opositor",
        icon: "⚖️",
        titleEs: "Opositor / Oposiciones",
        titleEn: "Public Exam Candidate",
        descEs: "Jornadas intensivas, leyes, simulacros y balance con descanso y bienestar.",
        descEn: "Intensive sessions, legal codes, mock exams, and balanced wellness.",
        defaultRole: "Preparación de Oposiciones",
        defaultBio: "Constancia y disciplina diaria",
        accentColor: "#b45309",
        subjects: [
          { name: "Constitución y Leyes", color: "#b45309", description: "Bloque legislativo", difficulty: 4 },
          { name: "Temario Específico", color: "#0d9488", description: "Temario general", difficulty: 5 },
          { name: "Test Psicotécnicos", color: "#6366f1", description: "Simulacros y baterías", difficulty: 3 },
          { name: "Casos Prácticos", color: "#db2777", description: "Resolución de supuestos", difficulty: 4 }
        ],
        tracks: [
          { key: "walk", label: "Paseo Desconexión", color: "#15803d", description: "Paseo diario" },
          { key: "mind", label: "Salud Mental", color: "#4338ca", description: "Desconexión y respiración" }
        ],
        habits: [
          { emoji: "📖", name: "Estudio intensivo", goal: 26 },
          { emoji: "📝", name: "Simulacro / Test", goal: 22 },
          { emoji: "🚶", name: "Paseo al aire libre", goal: 28 },
          { emoji: "🧘", name: "Meditación / Respiro", goal: 24 }
        ]
      },
      developer: {
        id: "developer",
        icon: "💻",
        titleEs: "Desarrollador / Ingeniero",
        titleEn: "Developer / Engineer",
        descEs: "Backend, frontend, algoritmos, proyectos propios y deep work técnico.",
        descEn: "Backend, frontend, algorithms, side projects, and deep technical focus.",
        defaultRole: "Ingeniero de Software",
        defaultBio: "Deep Work y Arquitectura Limpia",
        accentColor: "#2563eb",
        subjects: [
          { name: "Backend & Arquitectura", color: "#2563eb", description: "APIs y concurrencia", difficulty: 4 },
          { name: "Frontend & UI/UX", color: "#0891b2", description: "Componentes e interfaces", difficulty: 3 },
          { name: "Algoritmos & LeetCode", color: "#9333ea", description: "Estructuras de datos", difficulty: 5 },
          { name: "DevOps & Cloud", color: "#ea580c", description: "CI/CD e infraestructura", difficulty: 3 }
        ],
        tracks: [
          { key: "projects", label: "Side Projects", color: "#10b981", description: "Proyectos personales" },
          { key: "techread", label: "Artículos Tech", color: "#64748b", description: "Lecturas y papers" }
        ],
        habits: [
          { emoji: "💻", name: "Commit diario / Código", goal: 26 },
          { emoji: "📑", name: "Lectura técnica", goal: 22 },
          { emoji: "☕", name: "Pausa activa postural", goal: 28 },
          { emoji: "🏋️", name: "Entrenamiento", goal: 18 }
        ]
      },
      creator: {
        id: "creator",
        icon: "🎨",
        titleEs: "Creativo / Freelance",
        titleEn: "Creative / Freelance",
        descEs: "Diseño, contenidos, clientes, investigación y bloques creativos.",
        descEn: "Design, content creation, client strategy, and creative blocks.",
        defaultRole: "Creativo & Estratega",
        defaultBio: "Proyectos y creación continua",
        accentColor: "#ec4899",
        subjects: [
          { name: "Producción de Contenido", color: "#ec4899", description: "Vídeo, audio y guiones", difficulty: 4 },
          { name: "Diseño & Identidad", color: "#8b5cf6", description: "Branding y piezas visuales", difficulty: 3 },
          { name: "Estrategia de Clientes", color: "#f59e0b", description: "Propuestas y proyectos", difficulty: 3 },
          { name: "Investigación", color: "#06b6d4", description: "Tendencias e inspiración", difficulty: 2 }
        ],
        tracks: [
          { key: "photo", label: "Fotografía", color: "#14b8a6", description: "Capturas y edición" },
          { key: "writing", label: "Escritura Libre", color: "#6366f1", description: "Ensayos e ideas" }
        ],
        habits: [
          { emoji: "🎨", name: "Bloque creativo matutino", goal: 24 },
          { emoji: "📊", name: "Revisión de métricas", goal: 20 },
          { emoji: "📵", name: "Desconexión nocturna", goal: 26 },
          { emoji: "🧘", name: "Mindfulness", goal: 22 }
        ]
      },
      blank: {
        id: "blank",
        icon: "📄",
        titleEs: "En Blanco (Personalizado)",
        titleEn: "Blank Canvas (Custom)",
        descEs: "Lienzo limpio sin asignaturas ni hábitos predefinidos.",
        descEn: "Clean starting point with zero preloaded subjects or habits.",
        defaultRole: "Desarrollo Personal",
        defaultBio: "Modo Enfoque Activo",
        accentColor: "#0f766e",
        subjects: [],
        tracks: [],
        habits: []
      }
    };
  }

  function createProfile(profileName, templateKey = "blank") {
    const templates = getProfileTemplates();
    const template = templates[templateKey] || templates.blank;
    const name = (profileName || "").trim() || (App.I18n?.getCurrentLanguage?.() === "en" ? template.titleEn : template.titleEs) || `Perfil ${getProfilesList().length + 1}`;
    const newId = "prof_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    const fallback = createFallbackState();

    fallback.settings.profile.title = name;
    if (template.accentColor) fallback.settings.profile.accentColor = template.accentColor;
    if (template.defaultRole) fallback.settings.profile.role = template.defaultRole;
    if (template.defaultBio) fallback.settings.profile.bio = template.defaultBio;
    if (Array.isArray(template.subjects) && template.subjects.length > 0) {
      fallback.settings.subjects = template.subjects.map(s => ({ ...s }));
    } else if (templateKey === "blank") {
      fallback.settings.subjects = [];
    }
    if (Array.isArray(template.tracks) && template.tracks.length > 0) {
      fallback.settings.tracks = template.tracks.map(t => ({ ...t }));
    } else if (templateKey === "blank") {
      fallback.settings.tracks = [];
    }
    if (Array.isArray(template.habits) && template.habits.length > 0) {
      fallback.routineTracker.habits = template.habits.map((h, i) => ({ id: "h_" + (i + 1), ...h }));
    } else if (templateKey === "blank") {
      fallback.routineTracker.habits = [];
    }

    try {
      localStorage.setItem(getProfileStorageKey(newId), JSON.stringify(fallback));
      const list = getProfilesList();
      list.push({ id: newId, name, templateKey, createdAt: Date.now() });
      localStorage.setItem(PROFILES_MANIFEST_KEY, JSON.stringify(list));
    } catch (err) {
      App.Utils.showToast(App.I18n?.text("Error al guardar el nuevo perfil.", "Could not save the new profile."));
      return null;
    }

    switchProfile(newId);
    return newId;
  }

  function renameProfile(profileId, newName) {
    if (profileId === DEMO_PROFILE_ID) {
      App.Utils.showToast(App.I18n?.text("El perfil de ejemplo no se puede renombrar.", "The demo profile cannot be renamed."));
      return false;
    }
    const cleanName = (newName || "").trim();
    if (!cleanName) return false;
    const list = getProfilesList();
    const target = list.find(p => p.id === profileId);
    if (!target) return false;

    target.name = cleanName;
    try {
      localStorage.setItem(PROFILES_MANIFEST_KEY, JSON.stringify(list));
    } catch (err) {}

    if (profileId === getActiveProfileId() && App.State.state?.settings?.profile) {
      App.State.state.settings.profile.title = cleanName;
      if (App.Constants.profileTitleEl) {
        App.Constants.profileTitleEl.value = cleanName;
      }
      saveState();
      App.Settings.applyProfile();
    }
    if (App.Settings && typeof App.Settings.renderProfileDashboard === "function") {
      App.Settings.renderProfileDashboard();
    }
    App.Utils.showToast(App.I18n?.text(`Perfil renombrado a "${cleanName}".`, `Profile renamed to "${cleanName}".`));
    return true;
  }

  function deleteProfile(profileId) {
    if (profileId === DEMO_PROFILE_ID) {
      App.Utils.showToast(App.I18n?.text("El perfil de ejemplo está protegido y no se puede eliminar.", "The demo profile is protected and cannot be deleted."));
      return false;
    }
    const list = getProfilesList();
    if (list.length <= 1) {
      App.Utils.showToast(App.I18n?.text("No puedes eliminar el único perfil existente.", "You cannot delete the only existing profile."));
      return false;
    }

    const filtered = list.filter(p => p.id !== profileId);
    try {
      localStorage.setItem(PROFILES_MANIFEST_KEY, JSON.stringify(filtered));
      localStorage.removeItem(getProfileStorageKey(profileId));
    } catch (err) {}

    const currentActive = getActiveProfileId();
    if (currentActive === profileId) {
      const nextProfile = filtered[0];
      switchProfile(nextProfile.id);
    } else {
      if (App.Settings && typeof App.Settings.renderProfileDashboard === "function") {
        App.Settings.renderProfileDashboard();
      }
    }
    App.Utils.showToast(App.I18n?.text("Perfil eliminado.", "Profile deleted."));
    return true;
  }

  function switchProfile(profileId) {
    const list = getProfilesList();
    const target = list.find(p => p.id === profileId);
    if (!target) return false;

    // Save current profile before switching
    saveState();

    setActiveProfileId(profileId);
    App.State.state = loadState();
    App.State.syncConfigFromState();

    // Early dark mode sync
    if (getDarkMode()) document.documentElement.setAttribute("data-theme", "dark");
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

    if (typeof App.Tracker.renderRoutineTracker === "function") {
      App.Tracker.renderRoutineTracker();
    }
    if (typeof App.Tasks.refreshChecklistAll === "function") {
      App.Tasks.refreshChecklistAll();
    }
    if (App.Settings && typeof App.Settings.renderProfileDashboard === "function") {
      App.Settings.renderProfileDashboard();
    }
    if (App.Insights && typeof App.Insights.renderInsightsDashboard === "function") {
      App.Insights.renderInsightsDashboard();
    }
    if (App.Main && typeof App.Main.updateDynamicLabels === "function") {
      App.Main.updateDynamicLabels();
    }

    App.Utils.showToast(`Cambiado a perfil "${target.name}".`);
    return true;
  }

  function saveState() {
    const activeId = getActiveProfileId();
    const serialized = JSON.stringify(App.State.state);
    try {
      localStorage.setItem(getProfileStorageKey(activeId), serialized);
      localStorage.setItem(App.Constants.STORAGE_KEY, serialized);
    } catch (err) {}

    if (connectedDirHandle) {
      scheduleSaveToDisk();
    }
  }

  function hasState() {
    const activeId = getActiveProfileId();
    return Boolean(localStorage.getItem(getProfileStorageKey(activeId)) || localStorage.getItem(App.Constants.STORAGE_KEY));
  }

  function clearState() {
    const activeId = getActiveProfileId();
    localStorage.removeItem(getProfileStorageKey(activeId));
    localStorage.removeItem(App.Constants.STORAGE_KEY);
  }

  function getDarkMode() {
    return localStorage.getItem(App.Constants.DARK_MODE_KEY) === "1";
  }

  function setDarkMode(enabled) {
    if (enabled) {
      localStorage.setItem(App.Constants.DARK_MODE_KEY, "1");
    } else {
      localStorage.removeItem(App.Constants.DARK_MODE_KEY);
    }
  }

  function persist() {
    saveState();
    App.Calendar.renderCalendar();
    App.Stats.renderStats();
    if (App.Insights && typeof App.Insights.renderInsightsDashboard === "function") {
      App.Insights.renderInsightsDashboard();
    }
    if (App.Settings && typeof App.Settings.renderProfileDashboard === "function") {
      App.Settings.renderProfileDashboard();
    }
  }

  function flashAutoSave() {
    if (!App.Constants.autoSaveEl) return;
    App.Constants.autoSaveEl.classList.add("visible");
    clearTimeout(flashAutoSave._t);
    flashAutoSave._t = setTimeout(() => App.Constants.autoSaveEl.classList.remove("visible"), 2000);
  }

  function loadState() {
    if (cachedLoadedFsState) {
      const res = cachedLoadedFsState;
      cachedLoadedFsState = null;
      return res;
    }
    const activeId = getActiveProfileId();

    if (activeId === DEMO_PROFILE_ID) {
      let raw = localStorage.getItem(getProfileStorageKey(DEMO_PROFILE_ID));
      if (!raw) {
        const demoState = createDemoProfileState();
        try {
          localStorage.setItem(getProfileStorageKey(DEMO_PROFILE_ID), JSON.stringify(demoState));
        } catch (e) {}
        return App.Tasks.normalizeState ? App.Tasks.normalizeState(demoState) : demoState;
      }
      try {
        return App.Tasks.normalizeState ? App.Tasks.normalizeState(JSON.parse(raw)) : JSON.parse(raw);
      } catch {
        return createDemoProfileState();
      }
    }

    const fallback = createFallbackState();
    try {
      let raw = localStorage.getItem(getProfileStorageKey(activeId));
      if (!raw && activeId === "default") {
        raw = localStorage.getItem(App.Constants.STORAGE_KEY);
        if (raw) {
          localStorage.setItem(getProfileStorageKey("default"), raw);
        }
      }
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return App.Tasks && typeof App.Tasks.normalizeState === "function" ? App.Tasks.normalizeState(parsed) : parsed;
    } catch {
      return fallback;
    }
  }

  function createFallbackState() {
    return {
      settings: {
        subjectsLabelPlural: "Asignaturas",
        subjectsLabelSingular: "Asignatura",
        hobbiesLabelPlural: "Hobbies",
        hobbiesLabelSingular: "Hobby",
        timeEntryMode: "decimal",
        invertTrackpadSwipe: false,
        trackpadSensitivity: "medium",
        language: "es",
        theme: "light",
        heatmapPalette: "sync",
        calendarDensity: "standard",
        soundFeedbackEnabled: false,
        showDailyQuote: true,
        subjectDifficulty: App.Tasks && typeof App.Tasks.getDefaultDifficultyMap === "function"
          ? App.Tasks.getDefaultDifficultyMap()
          : Object.fromEntries(App.Constants.DEFAULT_SUBJECTS.map((s) => [s.name, s.defaultDifficulty])),
        dailyGoal: 0,
        subjectGoals: {},
        trackGoals: {},
        profile: { ...App.Constants.DEFAULT_PROFILE },
        calendarRange: { start: App.Constants.INITIAL_START_DATE, end: App.Constants.INITIAL_END_DATE },
        subjects: App.Constants.DEFAULT_SUBJECTS.map((subject) => ({ ...subject })),
        tracks: App.Constants.DEFAULT_EXTRA_TRACKS.map((track) => ({ ...track })),
        academicPeriods: []
      },
      days: {},
      dismissedEvents: {},
      customEventCategories: {},
      checklistTasks: [],
      routineTracker: {
        habits: App.Tracker.getDefaultRoutineHabits(),
        monthlyChecks: {},
        hiddenHistoryMonths: []
      },
      lastUpdate: null
    };
  }

  function createDemoProfileState() {
    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = today.getMonth(); // 0-indexed
    const curDay = today.getDate();
    const curMonthKey = `${curYear}-${String(curMonth + 1).padStart(2, "0")}`;

    // Generate sample populated days for the past 10 days and today
    const demoDays = {};
    for (let i = 10; i >= 0; i--) {
      const d = new Date(curYear, curMonth, curDay - i);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const mathHours = isWeekend ? 1 : (i % 2 === 0 ? 2.5 : 1.5);
      const histHours = isWeekend ? 0.5 : (i % 3 === 0 ? 2 : 1);
      const langHours = isWeekend ? 1 : 1;
      const logicHours = isWeekend ? 0 : (i % 2 === 1 ? 1.5 : 0);
      const readHours = 0.5;
      const sportHours = isWeekend ? 1.5 : 1;

      const events = [];
      if (i === 4) {
        events.push({ text: "Repaso Vocabulario Inglés", category: "review", subject: "Idiomas (Inglés)" });
      } else if (i === 0) {
        events.push({ text: "Examen de Matemáticas", category: "exam", subject: "Matemáticas Básicas" });
      }

      demoDays[k] = {
        subjects: {
          "Matemáticas Básicas": mathHours,
          "Historia Universal": histHours,
          "Idiomas (Inglés)": langHours,
          "Lógica & Pensamiento Crítico": logicHours
        },
        extra: {
          "lectura": readHours,
          "ejercicio": sportHours
        },
        notes: i === 0 
          ? "Día del examen: repaso rápido de fórmulas por la mañana y descanso por la tarde." 
          : "Sesión enfocada de estudio, lectura y práctica de ejercicios.",
        rating: isWeekend ? 4 : (i % 3 === 0 ? 5 : 4),
        customEvents: events
      };
    }

    // Generate monthly checks for routine tracker
    const demoMonthlyChecks = {
      [curMonthKey]: {
        demo_h_agua: {},
        demo_h_lectura: {},
        demo_h_ejercicio: {},
        demo_h_plan: {}
      }
    };

    for (let dayNum = 1; dayNum <= Math.max(1, curDay); dayNum++) {
      if (dayNum % 7 !== 0) demoMonthlyChecks[curMonthKey].demo_h_agua[dayNum] = true;
      if (dayNum % 2 === 1 || dayNum > curDay - 4) demoMonthlyChecks[curMonthKey].demo_h_lectura[dayNum] = true;
      if (dayNum % 3 !== 0) demoMonthlyChecks[curMonthKey].demo_h_ejercicio[dayNum] = true;
      if (dayNum % 5 !== 0) demoMonthlyChecks[curMonthKey].demo_h_plan[dayNum] = true;
    }

    return {
      settings: {
        subjectsLabelPlural: "Asignaturas",
        subjectsLabelSingular: "Asignatura",
        hobbiesLabelPlural: "Hobbies",
        hobbiesLabelSingular: "Hobby",
        timeEntryMode: "decimal",
        invertTrackpadSwipe: false,
        trackpadSensitivity: "medium",
        language: "es",
        dailyGoal: 4,
        subjectDifficulty: {
          "Matemáticas Básicas": 3,
          "Historia Universal": 2,
          "Idiomas (Inglés)": 2,
          "Lógica & Pensamiento Crítico": 3
        },
        subjectGoals: {
          "Matemáticas Básicas": 10,
          "Historia Universal": 6,
          "Idiomas (Inglés)": 5,
          "Lógica & Pensamiento Crítico": 5
        },
        trackGoals: {
          "lectura": 4,
          "ejercicio": 3
        },
        profile: {
          title: "Perfil de Ejemplo",
          role: "Estudiante General / Demo",
          bio: "Demostración de hábitos y horas de estudio",
          accentColor: "#0f766e",
          intensityLevels: [1, 3, 6, 9]
        },
        calendarRange: { start: App.Constants.INITIAL_START_DATE, end: App.Constants.INITIAL_END_DATE },
        subjects: [
          { name: "Matemáticas Básicas", description: "Álgebra y cálculo elemental", color: "#2563eb", difficulty: 3 },
          { name: "Historia Universal", description: "Historia moderna y contemporánea", color: "#d97706", difficulty: 2 },
          { name: "Idiomas (Inglés)", description: "Gramática, vocabulario y práctica oral", color: "#059669", difficulty: 2 },
          { name: "Lógica & Pensamiento Crítico", description: "Razonamiento y resolución de problemas", color: "#7c3aed", difficulty: 3 }
        ],
        tracks: [
          { key: "lectura", label: "Lectura General", description: "Libros y divulgación", color: "#0284c7" },
          { key: "ejercicio", label: "Ejercicio Físico", description: "Deporte y salud", color: "#e11d48" }
        ],
        academicPeriods: [
          {
            id: "period_demo_1",
            name: "Curso Académico General (Demo)",
            startDate: `${curYear}-09-01`,
            endDate: `${curYear + 1}-01-31`,
            subjects: ["Matemáticas Básicas", "Historia Universal", "Idiomas (Inglés)", "Lógica & Pensamiento Crítico"],
            tracks: ["lectura", "ejercicio"]
          }
        ]
      },
      days: demoDays,
      dismissedEvents: {},
      customEventCategories: {},
      checklistTasks: [
        {
          id: "demo_task_1",
          text: "Repasar capítulo 3 de Álgebra",
          description: "Ejercicios pares del bloque de polinomios",
          link: "Matemáticas Básicas",
          dueDate: `${curYear}-${String(curMonth + 1).padStart(2, "0")}-${String(Math.min(28, curDay + 5)).padStart(2, "0")}`,
          difficulty: 3,
          completed: false,
          createdAt: Date.now() - 86400000
        },
        {
          id: "demo_task_2",
          text: "Leer tema de la Revolución Industrial",
          description: "Hacer esquema y resumen de los factores clave",
          link: "Historia Universal",
          dueDate: `${curYear}-${String(curMonth + 1).padStart(2, "0")}-${String(Math.min(28, curDay + 7)).padStart(2, "0")}`,
          difficulty: 2,
          completed: true,
          createdAt: Date.now() - 172800000
        },
        {
          id: "demo_task_3",
          text: "Flashcards vocabulario unidad 4",
          description: "30 palabras clave y expresiones orales",
          link: "Idiomas (Inglés)",
          dueDate: `${curYear}-${String(curMonth + 1).padStart(2, "0")}-${String(Math.min(28, curDay + 9)).padStart(2, "0")}`,
          difficulty: 2,
          completed: false,
          createdAt: Date.now() - 43200000
        },
        {
          id: "demo_task_4",
          text: "Ejercicios de tablas de verdad",
          description: "Lógica proposicional básica",
          link: "Lógica & Pensamiento Crítico",
          dueDate: "",
          difficulty: 3,
          completed: false,
          createdAt: Date.now() - 3600000
        },
        {
          id: "demo_task_5",
          text: "Sesión de lectura 30 min",
          description: "Capítulo 5 del libro de divulgación",
          link: "lectura",
          dueDate: "",
          difficulty: 1,
          completed: true,
          createdAt: Date.now() - 259200000
        }
      ],
      routineTracker: {
        habits: [
          { id: "demo_h_agua", emoji: "💧", name: "Beber 2L de Agua", goal: 25 },
          { id: "demo_h_lectura", emoji: "📖", name: "Lectura 20 min", goal: 20 },
          { id: "demo_h_ejercicio", emoji: "🏃", name: "Ejercicio / Caminata", goal: 15 },
          { id: "demo_h_plan", emoji: "📝", name: "Planificar el día", goal: 25 }
        ],
        monthlyChecks: demoMonthlyChecks,
        hiddenHistoryMonths: []
      },
      lastUpdate: Date.now() - 1800000
    };
  }

  function exportData() {
    const activeId = getActiveProfileId();
    const profiles = getProfilesList();
    const currentProfile = profiles.find(p => p.id === activeId) || { id: activeId, name: "Principal" };

    const payload = {
      exportedAt: new Date().toISOString(),
      version: `v${App.Constants?.APP_VERSION || "4.0.0"}`,
      activeProfile: currentProfile,
      profilesManifest: profiles,
      range: { start: App.Calendar.getCalendarStart(), end: App.Calendar.getCalendarEnd() },
      subjects: App.State.subjects.map((subject) => ({ ...subject, difficulty: App.Tasks.getSubjectDifficulty(subject.name) })),
      tracks: App.State.EXTRA_TRACKS,
      checklistTasks: App.State.state?.checklistTasks || [],
      data: App.State.state
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `LOG-backup-${App.Utils.slugifyCategory(currentProfile.name) || "perfil"}.json`;
    link.click();
    URL.revokeObjectURL(url);
    App.Utils.showToast(App.I18n?.text("Copia del perfil exportada.", "Profile backup exported."));
  }

  function importData(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const importedState = parsed.data || parsed;
        if (!importedState.days || typeof importedState.days !== "object") {
          throw new Error("Formato no válido");
        }

        if (parsed.data && Array.isArray(parsed.subjects) && !Array.isArray(importedState.settings?.subjects)) {
          importedState.settings = importedState.settings || {};
          importedState.settings.subjects = parsed.subjects;
        }

        if (parsed.data && Array.isArray(parsed.tracks) && !Array.isArray(importedState.settings?.tracks)) {
          importedState.settings = importedState.settings || {};
          importedState.settings.tracks = parsed.tracks;
        }

        if (Array.isArray(parsed.checklistTasks) && !Array.isArray(importedState.checklistTasks)) {
          importedState.checklistTasks = parsed.checklistTasks;
        }

        if (parsed.events && typeof parsed.events === "object") {
          for (const [date, eventsArray] of Object.entries(parsed.events)) {
            if (Array.isArray(eventsArray)) {
              importedState.days[date] = importedState.days[date] || {};
              importedState.days[date].customEvents = importedState.days[date].customEvents || [];
              for (const ev of eventsArray) {
                const exists = importedState.days[date].customEvents.some(e => e.text === ev.text && e.type === ev.type);
                if (!exists) {
                  importedState.days[date].customEvents.push({
                    type: ev.type,
                    text: ev.text,
                    createdAt: new Date().toISOString()
                  });
                }
              }
            }
          }
        }

        App.State.state = App.Tasks.normalizeState(importedState);
        App.State.syncConfigFromState();
        App.Settings.applyProfile();
        App.Tasks.renderEventTypeOptions();
        App.Tasks.renderEventSubjectOptions();
        App.Tasks.updateEventEntryFields();
        persist();
        App.Tasks.renderSubjectInputs();
        App.Tracker.renderTrackInputs();
        App.Settings.renderSettings();
        App.DayPanel.renderSelectedDay();
        if (typeof App.Tasks.refreshChecklistAll === "function") {
          App.Tasks.refreshChecklistAll();
        }
        if (typeof App.Tracker.renderRoutineTracker === "function") {
          App.Tracker.renderRoutineTracker();
        }
        if (App.Settings && typeof App.Settings.renderProfileDashboard === "function") {
          App.Settings.renderProfileDashboard();
        }
        if (App.Main && typeof App.Main.updateDynamicLabels === "function") {
          App.Main.updateDynamicLabels();
        }
        if (App.Main && typeof App.Main.renderLastUpdateIndicator === "function") {
          App.Main.renderLastUpdateIndicator();
        }
        App.Utils.showToast(App.I18n?.text("Datos importados con éxito.", "Data imported successfully."));
      } catch (err) {
        App.Utils.showToast(App.I18n?.text("No se pudo importar el archivo.", "The file could not be imported."));
      } finally {
        if (event.target) event.target.value = "";
      }
    };

    reader.readAsText(file);
  }

  Object.defineProperties(window.App.Storage, {
    PROFILES_MANIFEST_KEY: { get: () => PROFILES_MANIFEST_KEY, enumerable: true },
    ACTIVE_PROFILE_KEY: { get: () => ACTIVE_PROFILE_KEY, enumerable: true },
    getProfilesList: { get: () => getProfilesList, set: (v) => getProfilesList = v, enumerable: true },
    getActiveProfileId: { get: () => getActiveProfileId, set: (v) => getActiveProfileId = v, enumerable: true },
    setActiveProfileId: { get: () => setActiveProfileId, set: (v) => setActiveProfileId = v, enumerable: true },
    getProfileTemplates: { get: () => getProfileTemplates, enumerable: true },
    createProfile: { get: () => createProfile, set: (v) => createProfile = v, enumerable: true },
    renameProfile: { get: () => renameProfile, set: (v) => renameProfile = v, enumerable: true },
    deleteProfile: { get: () => deleteProfile, set: (v) => deleteProfile = v, enumerable: true },
    switchProfile: { get: () => switchProfile, set: (v) => switchProfile = v, enumerable: true },
    saveState: { get: () => saveState, set: (v) => saveState = v, enumerable: true },
    hasState: { get: () => hasState, set: (v) => hasState = v, enumerable: true },
    clearState: { get: () => clearState, set: (v) => clearState = v, enumerable: true },
    getDarkMode: { get: () => getDarkMode, set: (v) => getDarkMode = v, enumerable: true },
    setDarkMode: { get: () => setDarkMode, set: (v) => setDarkMode = v, enumerable: true },
    persist: { get: () => persist, set: (v) => persist = v, enumerable: true },
    flashAutoSave: { get: () => flashAutoSave, set: (v) => flashAutoSave = v, enumerable: true },
    loadState: { get: () => loadState, set: (v) => loadState = v, enumerable: true },
    createFallbackState: { get: () => createFallbackState, set: (v) => createFallbackState = v, enumerable: true },
    createDemoProfileState: { get: () => createDemoProfileState, set: (v) => createDemoProfileState = v, enumerable: true },
    exportData: { get: () => exportData, set: (v) => exportData = v, enumerable: true },
    importData: { get: () => importData, set: (v) => importData = v, enumerable: true },
    initStorage: { get: () => initStorage, set: (v) => initStorage = v, enumerable: true },
    connectDirectory: { get: () => connectDirectory, set: (v) => connectDirectory = v, enumerable: true },
    disconnectDirectory: { get: () => disconnectDirectory, set: (v) => disconnectDirectory = v, enumerable: true },
    getStorageStatus: { get: () => getStorageStatus, set: (v) => getStorageStatus = v, enumerable: true },
    saveAvatarFile: { get: () => saveAvatarFile, set: (v) => saveAvatarFile = v, enumerable: true },
    saveStateToDirectory: { get: () => saveStateToDirectory, set: (v) => saveStateToDirectory = v, enumerable: true }
  });

  if (window.App && window.App.State && !window.App.State.state) {
    window.App.State.state = createFallbackState();
  }
})();
