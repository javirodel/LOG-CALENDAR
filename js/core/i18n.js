(() => {
  window.App = window.App || {};
  window.App.I18n = window.App.I18n || {};

  const DAILY_QUOTES = [
    { es: "La constancia no es la ausencia de fallos, sino la insistencia en volver a empezar.", en: "Consistency is not the absence of mistakes, but the persistence to restart.", author: "James Clear" },
    { es: "Somos lo que hacemos día a día. La excelencia, por tanto, no es un acto, sino un hábito.", en: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristóteles" },
    { es: "El éxito es la suma de pequeños esfuerzos repetidos día tras día.", en: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
    { es: "Concéntrate en el proceso, no solo en el resultado.", en: "Focus on the process, not just the outcome.", author: "Carol Dweck" },
    { es: "El conocimiento se compone del tiempo que le dedicas con plena atención.", en: "Knowledge is built through time given with total attention.", author: "Cal Newport" },
    { es: "La disciplina es el puente entre las metas y los logros tangibles.", en: "Discipline is the bridge between goals and tangible accomplishment.", author: "Jim Rohn" },
    { es: "Poco a poco se llega lejos: cada hora registrada cuenta en tu trayectoria.", en: "Little by little goes far: every recorded hour counts towards your journey.", author: "Proverbio" },
    { es: "No tienes que ser extremo, solo constante.", en: "You don't have to be extreme, just consistent.", author: "Alex Hormozi" },
    { es: "El mejor momento para plantar un árbol fue hace 20 años. El segundo mejor momento es ahora.", en: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Proverbio Chino" },
    { es: "La maestría exige paciencia, repetición y reflexión honesta.", en: "Mastery demands patience, repetition, and honest reflection.", author: "Robert Greene" },
    { es: "Un viaje de mil millas comienza con un solo paso.", en: "A journey of a thousand miles begins with a single step.", author: "Lao-Tse" },
    { es: "Haz de cada día tu obra maestra personal.", en: "Make each day your personal masterpiece.", author: "John Wooden" },
    { es: "La motivación te pone en marcha, el hábito te mantiene avanzando.", en: "Motivation gets you started; habit keeps you going.", author: "Jim Ryun" },
    { es: "No cuentes los días, haz que los días cuenten.", en: "Don't count the days, make the days count.", author: "Muhammad Ali" },
    { es: "El descanso también es parte del entrenamiento y del estudio productivo.", en: "Rest is also an integral part of productive study and training.", author: "Matthew Walker" },
    { es: "La claridad proviene de la acción, no del pensamiento estático.", en: "Clarity comes from action, not static contemplation.", author: "Marie Forleo" },
    { es: "El orden exterior crea serenidad interior para el trabajo profundo.", en: "Outer order creates inner serenity for deep focused work.", author: "Gretchen Rubin" },
    { es: "Tu futuro se crea con lo que haces hoy, no mañana.", en: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
    { es: "La perseverancia transforma lo ordinario en extraordinario.", en: "Perseverance transforms the ordinary into the extraordinary.", author: "Angela Duckworth" },
    { es: "Celebra las pequeñas victorias: son los cimientos de los grandes triunfos.", en: "Celebrate small wins: they are the bedrock of great triumphs.", author: "Teresa Amabile" },
    { es: "El aprendizaje profundo requiere foco sostenido y curiosidad genuina.", en: "Deep learning requires sustained focus and genuine curiosity.", author: "Richard Feynman" },
    { es: "La energía fluye hacia donde diriges tu atención.", en: "Energy flows where attention goes.", author: "Tony Robbins" },
    { es: "No busques el momento perfecto: toma el momento y hazlo perfecto.", en: "Don't wait for the perfect moment: take the moment and make it perfect.", author: "Zoey Sayward" },
    { es: "Cada sesión de estudio es una inversión en tu autonomía futura.", en: "Every study session is an investment in your future autonomy.", author: "Log of Growth" },
    { es: "Lo que se mide, se gestiona y se mejora.", en: "What gets measured gets managed and improved.", author: "Peter Drucker" },
    { es: "La paciencia y el tiempo hacen más que la fuerza o la violencia.", en: "Patience and time do more than strength or passion.", author: "Jean de La Fontaine" },
    { es: "La acción cura el miedo; la indecisión lo alimenta.", en: "Action cures fear; indecision feeds it.", author: "David J. Schwartz" },
    { es: "Tus hábitos son la forma en que encarnas tu identidad deseada.", en: "Your habits are how you embody your desired identity.", author: "James Clear" },
    { es: "Mantén la calma y continúa tu plan paso a paso.", en: "Stay calm and execute your plan step by step.", author: "Marco Aurelio" },
    { es: "El verdadero progreso es silencioso, diario y acumulativo.", en: "True progress is quiet, daily, and cumulative.", author: "Epicteto" },
    { es: "Sé implacable con tu visión, pero flexible en tu camino diario.", en: "Be stubborn on vision, but flexible on daily details.", author: "Jeff Bezos" }
  ];

  const TRANSLATIONS = {
    es: {
      locale: "es-ES",
      dock: {
        calendar: "Calendario",
        tracker: "Tracker",
        profile: "Perfil"
      },
      topbar: {
        lastUpdate: "Última actualización:",
        noRecords: "Sin registros recientes",
        justNow: "hace un momento",
        secondsAgo: "hace {n} s",
        minAgo: "hace {n} min",
        hoursAgo: "hace {n} h",
        todayAt: "hoy a las {time}",
        yesterdayAt: "ayer a las {time}",
        atTime: "{date} a las {time}"
      },
      calendar: {
        title: "LOG CALENDAR",
        subtitle: "LOG is LOG of Growth",
        hoursMap: "Mapa de horas",
        visibleRangeHelp: "Selecciona un día para editar estudio, actividades y eventos.",
        legendMin: "0 h",
        legendMax: "10+ h",
        prevMonths: "Ver dos meses anteriores",
        nextMonths: "Ver dos meses siguientes",
        weekdayLetters: ["L", "M", "X", "J", "V", "S", "D"],
        selectedDay: "Día seleccionado",
        totalTime: "Tiempo total:",
        registeredTotal: "totales registradas",
        importantEvent: "Evento importante",
        addEvent: "Añadir evento",
        subjectsLabel: "Asignaturas",
        addSubjectShort: "+ Añadir",
        notesPlaceholder: "Notas, reflexiones o registro del día...",
        dayNotes: "Notas del día",
        saveDay: "Guardar día",
        clearDay: "Vaciar día",
        ratingHint: "Valoración del día (1 a 5 estrellas):",
        dayRating: "Valoración del día",
        daySplitTitle: "Desglose de dedicación",
        studyLabel: "Estudio",
        saved: "✓ Guardado",
        unrated: "Sin valorar",
        emptyNotes: "Sin notas añadidas para este día.",
        noEvents: "Sin eventos marcados para este día.",
        moreStats: "Más estadísticas"
      },
      stats: {
        mainStats: "Estadísticas principales",
        allHistory: "Todo el historial",
        grandTotalLabel: "total global",
        weightedLoadLabel: "carga ponderada",
        avgPerDayLabel: "media diaria",
        avgActiveDayLabel: "media en días activos",
        bestDayLabel: "mejor día académico",
        streakLabel: "racha de días seguidos con estudio",
        studyFocusLabel: "foco en estudio",
        hobbyFocusLabel: "foco en hobbies",
        topSubjectLabel: "asignatura dominante",
        topTrackLabel: "hobby dominante",
        avgRatingLabel: "valoración media",
        subjectRiskTitle: "Asignaturas en riesgo",
        subjectRiskHelp: "Horas, dificultad y próximas entregas",
        subjectRiskEmpty: "No hay asignaturas para evaluar.",
        seeMore: "Ver más",
        fullAnalysis: "análisis completo",
        hoursBySubject: "Horas por asignatura",
        hobbyFrequency: "Frecuencia y constancia por hobby",
        ratingsDistribution: "Distribución de valoraciones",
        globalDistribution: "Distribución global",
        daysUnit: "días",
        dayUnit: "día",
        hoursUnit: "h",
        noSubjectsInPeriod: "No hay asignaturas vinculadas a este periodo.",
        noHobbiesInPeriod: "No hay hobbies vinculados a este periodo.",
        advancedTitleRhythm: "Ritmo",
        advancedTitleStudyAndHobbies: "{s} y {h}",
        advancedTitleWeek: "Semana",
        advancedTitleRisks: "Riesgos",
        advancedTitleRealPrep: "Preparación real",
        advancedTitleActionSignals: "Señales para actuar",
        advancedTitleDeepAnalysis: "Análisis Profundo",
        rankingSubjects: "Ranking de {s}",
        rankingTracks: "Ranking de {h}",
        rankingWeekdays: "Días de la semana",
        rankingWeighted: "{s} por carga ponderada"
      },
      events: {
        modalTitle: "Añadir evento",
        typeLabel: "Tipo de evento",
        textPlaceholder: "Ej. Examen final",
        colorLabel: "Color del evento",
        subjectLabel: "Asignatura del evento",
        saveBtn: "Guardar evento",
        categories: {
          exam: "Examen",
          deadline: "Entrega",
          review: "Repaso clave",
          personal: "Aviso",
          academic: "Académico",
          holiday: "Festivo",
          project: "Proyecto",
          sport: "Deporte",
          community: "Comunidad",
          weekend: "Fin de semana",
          other: "Otro"
        }
      },
      tracker: {
        title: "Hábitos y Rutinas",
        subtitle: "Registro de constancia mensual y consolidación de hábitos",
        addHabit: "+ Añadir Hábito",
        resetMonth: "Restablecer Mes",
        habitModalTitle: "Añadir Hábito",
        habitModalEditTitle: "Editar Hábito",
        habitNamePlaceholder: "Ej. Lectura 20 min",
        habitGoalPlaceholder: "Días objetivo (ej. 25)",
        monthlySummaryBadge: "RESUMEN MENSUAL",
        dailyTrendTitle: "TENDENCIA DE CUMPLIMIENTO DIARIO",
        dailyTrendSub: "% de hábitos completados cada día del mes",
        routinesTitle: "RUTINAS Y HÁBITOS DIARIOS",
        matrixSubtitle: "Haz clic en las casillas para registrar el progreso diario",
        weeklyAnalysisTitle: "ANÁLISIS SEMANAL Y HÁBITOS COMPLETADOS",
        prevMonthsTitle: "RESUMEN DE MESES ANTERIORES",
        prevMonthsSub: "Evolución y hábitos destacados en los meses previos",
        restoreBtn: "Restaurar",
        historyBadge: "Histórico",
        globalCompliance: "CUMPLIMIENTO GLOBAL",
        topHabits: "TOP HÁBITOS DIARIOS",
        dynamicRanking: "Ranking Dinámico",
        tableHabit: "Hábito",
        tableGoal: "Meta",
        tableTotal: "Total",
        tableTrend: "Gráfica de tendencia",
        tableTrendSub: "Porcentaje de hábitos completados por cada día del mes",
        weeklyTitle: "Análisis Semanal",
        weeklySub: "Progreso de hábitos agrupado por semanas naturales del mes",
        overviewTitle: "Balance General del Mes",
        rankingTitle: "Ranking de Cumplimiento",
        historyTitle: "Histórico de Meses",
        emptyHabits: "Añade hábitos para comenzar a medir tu constancia diaria.",
        completedBadge: "Cumplido",
        streakDays: "días de racha",
        weekLabel: "SEMANA",
        completedOf: "{c} de {t} completados",
        prevMonth: "Mes anterior",
        nextMonth: "Mes siguiente",
        deleteHabit: "Eliminar Hábito",
        saveHabit: "Guardar Hábito"
      },
      tasks: {
        title: "Tareas y Objetivos",
        subtitle: "Seguimiento ágil de entregas, repasos y compromisos",
        addTask: "Añadir tarea",
        filterAll: "Todas",
        filterPending: "Pendientes",
        filterCompleted: "Completadas",
        noTasks: "No hay tareas pendientes registradas.",
        tasksThisDay: "Tareas de este día",
        addTaskThisDay: "Añadir tarea para este día",
        taskInputPlaceholder: "¿Qué tarea tienes pendiente?",
        taskDescShortPlaceholder: "Descripción breve (opcional)",
        taskTitlePlaceholder: "Ej. Estudiar tema 3",
        taskDescPlaceholder: "Detalles o notas de la tarea...",
        linkProject: "Vincular a proyecto",
        difficulty: "Dificultad (1-5)",
        dueDateLabel: "Fecha de entrega",
        addTaskBtn: "+ Añadir Tarea",
        difficultyLabel: "Dificultad (1-5)",
        linkNone: "Sin vincular",
        noDate: "Sin fecha",
        deleteBtn: "Eliminar",
        editBtn: "Editar",
        acceptBtn: "Aceptar",
        statusPending: "Pendiente",
        statusDone: "Completada",
        taskDetailsEyebrow: "Detalles de la tarea",
        descLabel: "DESCRIPCIÓN",
        projectLabel: "PROYECTO / HOBBY",
        difficultyTag: "DIFICULTAD",
        statusLabel: "ESTADO"
      },
      profile: {
        heroStatus: "Local-First",
        heroSubtitle: "Espacio privado de desarrollo continuo con persistencia física en disco",
        activeProfileLabel: "PERFIL ACTIVO",
        newProfileBtn: "+ Nuevo",
        renameProfileBtn: "✎ Renombrar",
        deleteProfileBtn: "🗑 Borrar",
        tabSettings: "Ajustes",
        tabReport: "Informe",
        navMenu: "Menú",
        navIdentity: "Identidad",
        navAppearance: "Aspecto",
        navGoals: "Metas",
        navSubjects: "Materias",
        navPeriods: "Cursos",
        navStorage: "Disco",
        navAbout: "Acerca",
        navStudy: "Estudio",
        navHabits: "Hábitos"
      },
      settings: {
        identityTitle: "👤 Identidad del Perfil",
        identityHelp: "Personaliza tu nombre, foto de perfil, rol y enfoque de productividad.",
        profileNameLabel: "Nombre del perfil",
        profileRoleLabel: "Rol / Ocupación (ej. Estudiante, Opositor, Investigador)",
        profileBioLabel: "Enfoque actual / Bio (ej. Preparación Semestre 2)",
        profileAccentLabel: "Color principal de acento",
        saveProfileBtn: "Guardar cambios del perfil",

        appearanceTitle: "🎨 Aspecto & Visualización",
        appearanceHelp: "Configura el tema visual, paleta de colores, densidad del calendario y preferencias de uso.",
        themeModeLabel: "Tema visual de la interfaz",
        themeSystem: "🖥️ Por defecto del sistema",
        themeLight: "Claro (Estándar)",
        themeDark: "Oscuro (Modern Dark)",
        themeOled: "Negro Puro OLED (Ahorro de batería)",
        themeSepia: "Sepia / Papel (Descanso visual)",
        darkModeLabel: "Modo Oscuro rápido",
        heatmapPaletteLabel: "Paleta del mapa de calor de estudio",
        heatmapPaletteHelp: "Define los tonos de color que representan la intensidad de estudio en el calendario.",
        paletteSync: "🎯 Sincronizada con color de acento (Recomendado)",
        paletteEmerald: "Esmeralda Clásico (Verde-Teal)",
        paletteGithub: "GitHub Green (Verde intenso)",
        palettePurple: "Dracula Purple (Púrpura elegante)",
        paletteNeon: "Monokai Neon (Cian eléctrico)",
        paletteAmber: "Ámbar Otoño (Dorado cálido)",
        paletteCyberpunk: "Cyberpunk Pink (Rosa neón)",
        paletteCustom: "Personalizado (Color propio)",
        customAccentHelp: "Color distintivo para botones, resaltados y cálculo del mapa de calor si eliges personalizado.",
        subgroupVisual: "🎨 Tema & Paleta Cromática",
        subgroupVisualHelp: "Personaliza el estilo visual, contraste y colores del calendario.",
        subgroupInteractive: "🌐 Idioma & Experiencia Interactiva",
        subgroupInteractiveHelp: "Configura el idioma de la app y la respuesta háptica y motivacional.",
        subgroupTrackpad: "🎛️ Ergonomía & Navegación Trackpad",
        subgroupTrackpadHelp: "Ajusta la respuesta al deslizar con dos dedos entre vistas.",
        subgroupTimeAndNaming: "⏱️ Registro de Tiempo & Nombres Personalizados",
        subgroupTimeAndNamingHelp: "Define el formato de entrada de tiempo, terminología y umbrales de intensidad.",
        namingBlockTitle: "Nombres personalizados de actividades",
        heatLevelsBlockTitle: "Umbrales de intensidad del mapa de calor (horas)",
        calendarDensityLabel: "Densidad visual del calendario",
        calendarDensityHelp: "Ajusta el espaciado y tamaño de las celdas del calendario para adaptarlo a tu pantalla.",
        densityCompact: "Compacta (Celdas reducidas, todo a la vista)",
        densityStandard: "Estándar (Equilibrada)",
        densitySpacious: "Espaciosa (Celdas amplias y legibles)",
        soundFeedbackLabel: "Efectos de sonido hápticos (Micro-clicks)",
        soundFeedbackHelp: "Reproduce micro-sonidos mecánicos generados por síntesis web al marcar hábitos o tareas.",
        dailyQuoteLabel: "Cita motivacional diaria",
        dailyQuoteHelp: "Muestra una frase inspiradora de productividad y constancia en el panel del día.",
        invertTrackpadLabel: "Invertir sentido del trackpad",
        invertTrackpadHelp: "Invierte la dirección lógica al deslizar con dos dedos entre Calendario, Tracker y Perfil.",
        trackpadSensitivityLabel: "Sensibilidad del trackpad",
        trackpadSensitivityHelp: "Regula la fuerza del gesto para evitar cambios dobles accidentales.",
        trackpadLow: "Baja (Gesto amplio)",
        trackpadMedium: "Media (Recomendada)",
        trackpadHigh: "Alta (Sensible)",
        languageLabel: "Idioma de la aplicación",
        languageHelp: "Selecciona el idioma de la interfaz y las explicaciones estadísticas.",
        timeEntryModeLabel: "Formato de registro de tiempo",
        timeDecimal: "Horas decimales (ej. 1,5)",
        timeHoursMinutes: "Horas y minutos (ej. 1:30)",
        timeAdditionsLabel: "Permitir sumas de tiempo",
        timeAdditionsHelp: "Escribe una expresión sin “=” (por ejemplo, 0:40 +:45 o 0,67 +0,75). También puedes escribir solo +:45 para sumarlo al total anterior. Al pasar el ratón verás el desglose.",
        subjectsPluralLabel: "Nombre de asignaturas (Plural)",
        subjectsSingularLabel: "Nombre de asignatura (Singular)",
        subjectsGlobalColor: "Color global de asignaturas",
        subjectsGlobalColorHelp: "Color para el concepto de asignaturas en el gráfico de distribución global.",
        hobbiesPluralLabel: "Nombre de hobbies (Plural)",
        hobbiesSingularLabel: "Nombre de hobby (Singular)",
        heatScaleHelp: "Escala de calor de estudio en el calendario:",
        level1Hours: "Horas nivel 1",
        level2Hours: "Horas nivel 2",
        level3Hours: "Horas nivel 3",
        level4Hours: "Horas nivel 4",
        saveAppearanceBtn: "Guardar preferencias de aspecto",

        goalsTitle: "⏱️ Objetivos de Tiempo (Metas)",
        goalsHelp: "Define las horas de dedicación diaria general y objetivos por cada asignatura y hobby.",
        dailyGoalLabel: "Objetivo diario general (horas/día)",
        saveGoalsBtn: "Guardar objetivos",

        subjectsTitle: "📚 Asignaturas & Hobbies",
        subjectsHelp: "Administra tus materias académicas y proyectos personales.",
        addSubjectBtn: "Añadir asignatura",
        addTrackBtn: "Añadir hobby",

        periodsTitle: "📅 Cursos Académicos & Evaluaciones",
        periodsHelp: "Periodos temporales con asignaturas y objetivos acotados.",
        addPeriodBtn: "Añadir curso académico",

        storageTitle: "💾 Almacenamiento Local en Disco (Local-First)",
        storageHelp: "Conecta una carpeta física de tu disco duro para persistir tus datos sin límite de 5 MB.",
        storageStatusBrowser: "Almacenamiento del Navegador (localStorage)",
        storageStatusConnected: "Carpeta física vinculada",
        storageConnectBtn: "📂 Conectar Carpeta Local en Disco",
        storageDisconnectBtn: "🔌 Desconectar Carpeta",
        exportJsonBtn: "Exportar Datos (JSON)",
        importJsonBtn: "Importar Datos (JSON)",
        dangerZone: "Zona de Peligro",
        dangerZoneHelp: "Al restablecer se borrarán todas las asignaturas, notas y eventos del perfil actual.",
        dangerResetBtn: "Restablecer datos del perfil",

        aboutTitle: "ℹ️ Acerca de LOG Calendar",
        aboutHelp: "Información técnica, privacidad y arquitectura de la aplicación.",
        versionTag: "Versión {version}",
        aboutDesc: "Aplicación web Local-First diseñada para optimizar el estudio, el seguimiento de hábitos y el bienestar personal con privacidad total.",
        aboutPrivacy: "🔒 Privacidad Absoluta: Cero cookies de seguimiento, cero llamadas a servidores externos y ejecución 100% en local.",
        aboutStorage: "💾 Arquitectura Local-First: Compatible con File System Access API para almacenamiento nativo en archivos físicos JSON.",
        aboutPerformance: "⚡ Rendimiento Extremo: Cero dependencias npm, cero bundlers y código Vanilla JavaScript nativo.",
        checkUpdatesBtn: "🔄 Comprobar actualizaciones",
        installPwaBtn: "📲 Instalar como aplicación de escritorio",
        pwaInstalledText: "✓ Modo aplicación de escritorio activo",
        versionUpToDate: "✓ Al día",
        versionUpdateAvailable: "🚀 v{version} Disponible"
      },
      updater: {
        eyebrow: "Actualización del Sistema",
        modalTitle: "🚀 Nueva versión disponible",
        modalDesc: "Hay una nueva versión de LOG Calendar lista para descargar.",
        guideTitle: "¿Cómo actualizar tu copia local?",
        step1: "1. Descarga el paquete .zip de la última versión en GitHub.",
        step2: "2. Descomprime los archivos y reemplaza los archivos del programa (.html, .js, .css) en tu carpeta de LOG Calendar.",
        step3Safety: "🛡️ ¡Tus datos están 100% a salvo!",
        step3SafetyDesc: "Todas tus horas registradas, asignaturas, hábitos y notas residen en el almacenamiento de tu navegador (localStorage) o en tu carpeta conectada en disco. Reemplazar los archivos del programa no altera ni borra tus datos.",
        downloadReleaseBtn: "🔗 Abrir Release en GitHub",
        laterBtn: "Recordar más tarde"
      },
      insights: {
        scoreTitle: "PUNTUACIÓN GLOBAL",
        scoreSub: "Constancia, metas, diversificación y energía · Toca para ver detalle",
        regularityTitle: "ÍNDICE DE REGULARIDAD",
        regularitySub: "Estabilidad de ritmo diario sin atracones · Toca para ver detalle",
        regularityHigh: "Alta Constancia",
        regularityMid: "Ritmo Medio",
        regularityLow: "Fluctuante",
        goalTitle: "OBJETIVO DIARIO",
        goalSubMet: "{met} de {total} días cumplidos · Toca para ver detalle",
        goalSubUnset: "Define tu meta diaria en Ajustes · Toca para ver detalle",
        goalBtnSettings: "⚙️ Ajustes",
        trendTitle: "TENDENCIA SEMANAL (WoW)",
        trendSub: "Semana actual vs previa ({prev}) · Toca para ver detalle",
        weeklyTitle: "COMPARATIVA SEMANA A SEMANA",
        weeklySub: "Evolución del tiempo dedicado por semana (Estudio vs Hobbies)",
        radialTitle: "DIVERSIFICACIÓN & EQUILIBRIO RADIAL",
        radialSub: "Reparto proporcional entre asignaturas y hobbies activos",
        moodTitle: "CORRELACIÓN ENERGÍA / ÁNIMO VS DEDICACIÓN",
        moodSub: "Cómo impacta tu estado de ánimo en el rendimiento y horas registradas",
        weekdayTitle: "DISTRIBUCIÓN DE ESFUERZO POR DÍA DE LA SEMANA",
        weekdaySub: "Descubre qué días de la semana alcanzas mayor productividad",
        healthTitle: "BALANCE & SALUD POR ASIGNATURA",
        healthSub: "Diagnóstico de urgencia, tareas pendientes y constancia",
        directivesTitle: "DIRECTRICES & PLAN DE ACCIÓN RECOMENDADO",
        directivesSub: "Recomendaciones estratégicas generadas a partir de tus patrones",
        peakWeek: "SEMANA PICO",
        weeklyAvg: "MEDIA SEMANAL",
        goalsMet: "METAS CUMPLIDAS",
        globalShare: "REPARTO GLOBAL",
        perWeek: "por semana",
        consistency: "consistencia",
        fixGoal: "Fija meta en ajustes",
        noRecords: "Sin registros",
        notSet: "Sin fijar",
        latestWeek: "Última semana",
        study: "estudio",
        hobbies: "hobbies",
        total: "totales",
        avgLabel: "MEDIA:",
        goalLabel: "META:",
        trackerScoreTitle: "PUNTUACIÓN GLOBAL DE HÁBITOS",
        trackerScoreSub: "Consistencia global de hábitos en el periodo",
        trackerAdherenceTitle: "TASA DE ÉXITO GLOBAL",
        trackerAdherenceSub: "Hábitos cumplidos frente a metas programadas",
        trackerStreakTitle: "MEJOR RACHA ACTIVA",
        trackerStreakSub: "Hábito con mayor número de días consecutivos",
        trackerTrendTitle: "EVOLUCIÓN SEMANAL",
        trackerTrendSub: "Tendencia de cumplimiento respecto a la semana previa",
        trackerWeeklyTitle: "CONSTANCIA SEMANAL DE HÁBITOS",
        trackerWeeklySub: "Porcentaje de hábitos completados por semana",
        trackerWeekdayTitle: "CUMPLIMIENTO POR DÍA DE LA SEMANA",
        trackerWeekdaySub: "Patrones de constancia según el día",
        trackerHealthTitle: "SALUD & CONSISTENCIA POR HÁBITO",
        trackerHealthSub: "Análisis individual de cada hábito",
        trackerDirectivesTitle: "DIRECTRICES & PLAN DE ACCIÓN PARA HÁBITOS",
        trackerDirectivesSub: "Consejos prácticos para consolidar tus rutinas",
        hoverWeekTracker: "Pasa el cursor sobre una semana para ver los hábitos completados.",
        completedHabits: "hábitos completados"
      },
      templates: {
        eyebrow: "Nuevo Perfil",
        modalTitle: "Crear Nuevo Perfil",
        modalDesc: "Elige una plantilla inicial adaptada a tu enfoque o empieza con un lienzo en blanco.",
        nameLabel: "Nombre del perfil",
        namePlaceholder: "Ej. Mi Nuevo Semestre",
        chooseTemplate: "Plantilla inicial:",
        university: {
          title: "Estudiante Universitario",
          desc: "Materias académicas, proyectos, hábitos de estudio y preparación de exámenes."
        },
        opositor: {
          title: "Opositor / Oposiciones",
          desc: "Jornadas intensivas, leyes, simulacros y balance con descanso y bienestar."
        },
        developer: {
          title: "Desarrollador / Ingeniero",
          desc: "Backend, frontend, algoritmos, proyectos propios y deep work técnico."
        },
        creator: {
          title: "Creativo / Freelance",
          desc: "Diseño, contenidos, clientes, investigación y bloques creativos."
        },
        blank: {
          title: "En Blanco (Personalizado)",
          desc: "Lienzo limpio sin asignaturas ni hábitos predefinidos."
        },
        createBtn: "Crear Perfil",
        cancelBtn: "Cancelar"
      },
      tutorial: {
        bannerTitle: "Tutorial Guiado de la Aplicación",
        bannerHelp: "Aprende en 2 minutos a utilizar el Perfil de Ejemplo, el registro de horas, el tracker de hábitos y tus métricas clave.",
        startBtn: "🎓 Iniciar Tutorial Guiado",
        exitBtn: "Salir",
        prevBtn: "Anterior",
        nextBtn: "Siguiente",
        finishBtn: "¡Entendido! Finalizar",
        stepCount: "Paso {current} de {total}",
        switchDemoBtn: "👤 Cambiar al Perfil de Ejemplo",
        step1Title: "👤 Tu Perfil & Modo Demostración",
        step1Desc: "¡Te damos la bienvenida a LOG CALENDAR! Aquí puedes gestionar múltiples perfiles o cambiar al <strong>Perfil de Ejemplo</strong>, un espacio de demostración seguro donde trastear libremente sin miedo a alterar tus datos reales.",
        step2Title: "📅 Calendario y Mapa de Horas",
        step2Desc: "El calendario visualiza todo tu año. Cada celda cambia de intensidad y color según las horas que dedicas a tus materias. La paleta de color se sincroniza armónicamente con tu tema y color de acento.",
        step3Title: "⏱️ Registro de Horas, Notas y Tareas",
        step3Desc: "Al hacer clic en cualquier día, este panel lateral te permite sumar horas por asignatura o hobby, escribir reflexiones o notas, valorar tu día con estrellas y gestionar tareas pendientes.",
        step4Title: "📋 Tracker de Rutinas & Hábitos",
        step4Desc: "Haz un solo clic en la celda del día para registrar tus hábitos (hidratación, lectura, deporte, descanso...). La aplicación calcula tu porcentaje mensual y oculta automáticamente los meses vacíos.",
        step5Title: "📊 Analítica Avanzada e Informes",
        step5Desc: "Descubre tus días pico de productividad, comparativas semana a semana, diversificación radial de materias y diagnósticos automáticos basados en tus patrones reales.",
        step6Title: "⚙️ Personalización & Almacenamiento Local-First",
        step6Desc: "Ajusta temas (Oscuro, Claro, OLED, Sepia o Sistema), sensibilidad del trackpad, idioma e incluso conecta una carpeta de tu disco duro para guardar tus datos en archivos físicos JSON sin límites."
      },
      badges: {
        unstoppable: { title: "Imparable", desc: "Racha activa de {n} días consecutivos." },
        onStreak: { title: "En Racha", desc: "Racha activa de {n} días consecutivos." },
        titanicDay: { title: "Día Titánico", desc: "Lograste {h} en un solo día ({d})." },
        excellentDay: { title: "Día Excelente", desc: "Tu récord diario fue de {h} ({d})." },
        laserFocus: { title: "Enfoque Láser", desc: "Dedicación máxima a {name} ({h})." },
        unleashedPassion: { title: "Pasión Desatada", desc: "Invertiste {h} en {name}." },
        zenMaster: { title: "Maestro del Zen", desc: "Desconexión académica total con {h} dedicadas a ti." },
        legend: { title: "Leyenda del Log", desc: "Más de 50 horas totales registradas en este periodo." },
        seed: { title: "Semilla del Éxito", desc: "Has iniciado tu registro en este periodo. ¡Sigue así para desbloquear más insignias!" }
      },
      ratings: [
        "Sin valorar",
        "Muy mal día",
        "Poco productivo",
        "Día normal",
        "Productivo",
        "¡Excelente día!"
      ],
      avatarPicker: {
        modalTitle: "Foto de perfil",
        modalSubtitle: "Elige cómo quieres personalizar tu imagen de perfil",
        currentPhoto: "Foto actual",
        optUploadTitle: "Subir desde el ordenador",
        optUploadDesc: "Elige una imagen (JPG, PNG o WebP) desde tus archivos locales",
        optCameraTitle: "Hacer foto con la cámara",
        optCameraDesc: "Utiliza tu cámara web para capturar una foto al instante",
        optGalleryTitle: "Elegir de la galería",
        optGalleryDesc: "Selecciona un avatar prediseñado y estético de nuestra colección",
        optRemoveTitle: "Eliminar foto actual",
        optRemoveDesc: "Restablece tu foto de perfil al icono predeterminado",
        cameraTitle: "Cámara en directo",
        cameraSubtitle: "Encuadra tu rostro en el círculo y toma la foto",
        cameraCapture: "Capturar foto",
        cameraRetake: "Repetir",
        cameraUse: "Usar esta foto",
        cameraError: "No se pudo acceder a la cámara. Comprueba los permisos de tu navegador o dispositivo.",
        cameraNotSupported: "Tu navegador no soporta el acceso a la cámara mediante mediaDevices.",
        galleryTitle: "Galería de avatares",
        gallerySubtitle: "Elige un estilo que represente tu viaje de aprendizaje",
        avatarUpdated: "Foto de perfil actualizada con éxito.",
        avatarRemoved: "Foto de perfil eliminada.",
        avatarInvalid: "Por favor selecciona un archivo de imagen válido (JPG, PNG o WebP)."
      }
    },

    en: {
      locale: "en-US",
      dock: {
        calendar: "Calendar",
        tracker: "Tracker",
        profile: "Profile"
      },
      topbar: {
        lastUpdate: "Last update:",
        noRecords: "No recent records",
        justNow: "just now",
        secondsAgo: "{n}s ago",
        minAgo: "{n}m ago",
        hoursAgo: "{n}h ago",
        todayAt: "today at {time}",
        yesterdayAt: "yesterday at {time}",
        atTime: "{date} at {time}"
      },
      calendar: {
        title: "LOG CALENDAR",
        subtitle: "LOG is LOG of Growth",
        hoursMap: "Hours Map",
        visibleRangeHelp: "Select a day to edit study hours, activities, and events.",
        legendMin: "0 h",
        legendMax: "10+ h",
        prevMonths: "View previous two months",
        nextMonths: "View next two months",
        weekdayLetters: ["M", "T", "W", "T", "F", "S", "S"],
        selectedDay: "Selected Day",
        totalTime: "Total time:",
        registeredTotal: "total recorded",
        importantEvent: "Important Event",
        addEvent: "Add Event",
        subjectsLabel: "Subjects",
        addSubjectShort: "+ Add",
        notesPlaceholder: "Notes, reflections, or daily thoughts...",
        dayNotes: "Day Notes",
        saveDay: "Save Day",
        clearDay: "Clear Day",
        ratingHint: "Day rating (1 to 5 stars):",
        dayRating: "Day Rating",
        daySplitTitle: "Time breakdown",
        studyLabel: "Study",
        saved: "✓ Saved",
        unrated: "Unrated",
        emptyNotes: "No notes recorded for this day.",
        noEvents: "No events scheduled for this day.",
        moreStats: "More Statistics"
      },
      stats: {
        mainStats: "Main Statistics",
        allHistory: "All History",
        grandTotalLabel: "grand total",
        weightedLoadLabel: "weighted load",
        avgPerDayLabel: "daily average",
        avgActiveDayLabel: "active days average",
        bestDayLabel: "best academic day",
        streakLabel: "consecutive study streak",
        studyFocusLabel: "study focus",
        hobbyFocusLabel: "hobby focus",
        topSubjectLabel: "dominant subject",
        topTrackLabel: "dominant hobby",
        avgRatingLabel: "average rating",
        subjectRiskTitle: "Subjects at risk",
        subjectRiskHelp: "Hours, difficulty and upcoming deadlines",
        subjectRiskEmpty: "No subjects to evaluate.",
        seeMore: "View more",
        fullAnalysis: "full analytics",
        hoursBySubject: "Hours per Subject",
        hobbyFrequency: "Frequency & Consistency per Hobby",
        ratingsDistribution: "Ratings Distribution",
        globalDistribution: "Global Distribution",
        daysUnit: "days",
        dayUnit: "day",
        hoursUnit: "h",
        noSubjectsInPeriod: "No subjects linked to this period.",
        noHobbiesInPeriod: "No hobbies linked to this period.",
        advancedTitleRhythm: "Pace & Rhythm",
        advancedTitleStudyAndHobbies: "{s} and {h}",
        advancedTitleWeek: "Week",
        advancedTitleRisks: "Risks & Alerts",
        advancedTitleRealPrep: "Actual Preparation",
        advancedTitleActionSignals: "Action Signals",
        advancedTitleDeepAnalysis: "Deep Analysis",
        rankingSubjects: "{s} Ranking",
        rankingTracks: "{h} Ranking",
        rankingWeekdays: "Days of the Week",
        rankingWeighted: "{s} by Weighted Load"
      },
      events: {
        modalTitle: "Add Event",
        typeLabel: "Event Type",
        textPlaceholder: "e.g. Final Exam",
        colorLabel: "Event color",
        subjectLabel: "Event Subject",
        saveBtn: "Save Event",
        categories: {
          exam: "Exam",
          deadline: "Deadline",
          review: "Key Review",
          personal: "Notice",
          academic: "Academic",
          holiday: "Holiday",
          project: "Project",
          sport: "Sport",
          community: "Community",
          weekend: "Weekend",
          other: "Other"
        }
      },
      tracker: {
        title: "Habits & Routines",
        subtitle: "Monthly consistency tracking and sustainable habit building",
        addHabit: "+ Add Habit",
        resetMonth: "Reset Month",
        habitModalTitle: "Add Habit",
        habitModalEditTitle: "Edit Habit",
        habitNamePlaceholder: "e.g. 20 min reading",
        habitGoalPlaceholder: "Target days (e.g. 25)",
        monthlySummaryBadge: "MONTHLY OVERVIEW",
        dailyTrendTitle: "DAILY COMPLETION TREND",
        dailyTrendSub: "% of habits completed each day of the month",
        routinesTitle: "DAILY HABITS & ROUTINES",
        matrixSubtitle: "Click checkboxes to record daily progress",
        weeklyAnalysisTitle: "WEEKLY ANALYSIS & COMPLETED HABITS",
        prevMonthsTitle: "PREVIOUS MONTHS OVERVIEW",
        prevMonthsSub: "Trend and habit highlights in previous months",
        restoreBtn: "Restore",
        historyBadge: "History",
        globalCompliance: "GLOBAL COMPLETION",
        topHabits: "TOP DAILY HABITS",
        dynamicRanking: "Dynamic Ranking",
        tableHabit: "Habit",
        tableGoal: "Goal",
        tableTotal: "Total",
        tableTrend: "Trend Chart",
        tableTrendSub: "Percentage of completed habits for each day of the month",
        weeklyTitle: "Weekly Analysis",
        weeklySub: "Habit progress grouped by calendar weeks of the month",
        overviewTitle: "Monthly Overview",
        rankingTitle: "Completion Ranking",
        historyTitle: "Monthly History",
        emptyHabits: "Add habits to begin measuring your daily consistency.",
        completedBadge: "Completed",
        streakDays: "streak days",
        weekLabel: "WEEK",
        completedOf: "{c} of {t} completed",
        prevMonth: "Previous month",
        nextMonth: "Next month",
        deleteHabit: "Delete Habit",
        saveHabit: "Save Habit"
      },
      tasks: {
        title: "Tasks & Milestones",
        subtitle: "Agile tracking for deadlines, reviews, and commitments",
        addTask: "Add task",
        filterAll: "All",
        filterPending: "Pending",
        filterCompleted: "Completed",
        noTasks: "No registered pending tasks.",
        tasksThisDay: "Tasks for this day",
        addTaskThisDay: "Add task for this day",
        taskInputPlaceholder: "What task do you have pending?",
        taskDescShortPlaceholder: "Brief description (optional)",
        taskTitlePlaceholder: "e.g. Study chapter 3",
        taskDescPlaceholder: "Task details or notes...",
        linkProject: "Link to project",
        difficulty: "Difficulty (1-5)",
        dueDateLabel: "Due date",
        addTaskBtn: "+ Add Task",
        difficultyLabel: "Difficulty (1-5)",
        linkNone: "Unlinked",
        noDate: "No due date",
        deleteBtn: "Delete",
        editBtn: "Edit",
        acceptBtn: "Done",
        statusPending: "Pending",
        statusDone: "Completed",
        taskDetailsEyebrow: "Task Details",
        descLabel: "DESCRIPTION",
        projectLabel: "PROJECT / HOBBY",
        difficultyTag: "DIFFICULTY",
        statusLabel: "STATUS"
      },
      profile: {
        heroStatus: "Local-First",
        heroSubtitle: "Private continuous growth space with physical disk persistence",
        activeProfileLabel: "ACTIVE PROFILE",
        newProfileBtn: "+ New",
        renameProfileBtn: "✎ Rename",
        deleteProfileBtn: "🗑 Delete",
        tabSettings: "Settings",
        tabReport: "Report",
        navMenu: "Menu",
        navIdentity: "Identity",
        navAppearance: "Appearance",
        navGoals: "Goals",
        navSubjects: "Subjects",
        navPeriods: "Periods",
        navStorage: "Disk",
        navAbout: "About",
        navStudy: "Study",
        navHabits: "Habits"
      },
      settings: {
        identityTitle: "👤 Profile Identity",
        identityHelp: "Customize your name, profile photo, role, and productivity focus.",
        profileNameLabel: "Profile name",
        profileRoleLabel: "Role / Occupation (e.g. Student, Researcher, Creator)",
        profileBioLabel: "Current focus / Bio (e.g. Semester 2 Preparation)",
        profileAccentLabel: "Primary accent color",
        saveProfileBtn: "Save profile changes",

        appearanceTitle: "🎨 Appearance & Display",
        appearanceHelp: "Configure visual theme, heatmap palette, calendar density, and usage preferences.",
        themeModeLabel: "Interface Visual Theme",
        themeSystem: "🖥️ System default",
        themeLight: "Light (Standard)",
        themeDark: "Dark (Modern Dark)",
        themeOled: "Pure Black OLED (Battery saving)",
        themeSepia: "Sepia / Paper (Eye comfort)",
        darkModeLabel: "Quick Dark Mode",
        heatmapPaletteLabel: "Study Heatmap Color Palette",
        heatmapPaletteHelp: "Defines the color gradient representing study intensity across calendar cells.",
        paletteSync: "🎯 Synced with Accent Color (Recommended)",
        paletteEmerald: "Classic Emerald (Green-Teal)",
        paletteGithub: "GitHub Green (Vibrant green)",
        palettePurple: "Dracula Purple (Elegant purple)",
        paletteNeon: "Monokai Neon (Electric cyan)",
        paletteAmber: "Autumn Amber (Warm gold)",
        paletteCyberpunk: "Cyberpunk Pink (Neon pink)",
        paletteCustom: "Custom (Own color)",
        customAccentHelp: "Distinctive color for buttons, highlights and heatmap calculation if you choose custom.",
        subgroupVisual: "🎨 Theme & Color Palette",
        subgroupVisualHelp: "Customize visual style, contrast and calendar colors.",
        subgroupInteractive: "🌐 Language & Interactive Experience",
        subgroupInteractiveHelp: "Configure app language, haptic feedback and motivation.",
        subgroupTrackpad: "🎛️ Ergonomics & Trackpad Navigation",
        subgroupTrackpadHelp: "Adjust two-finger swipe response between views.",
        subgroupTimeAndNaming: "⏱️ Time Tracking & Custom Naming",
        subgroupTimeAndNamingHelp: "Define time entry format, terminology and intensity thresholds.",
        namingBlockTitle: "Custom activity names",
        heatLevelsBlockTitle: "Heatmap intensity thresholds (hours)",
        calendarDensityLabel: "Calendar Grid Visual Density",
        calendarDensityHelp: "Adjust cell sizing and padding to tailor the calendar to your screen.",
        densityCompact: "Compact (Reduced cells, wide view)",
        densityStandard: "Standard (Balanced)",
        densitySpacious: "Spacious (Roomy and legible)",
        soundFeedbackLabel: "Haptic Audio Feedback (Micro-clicks)",
        soundFeedbackHelp: "Plays subtle offline mechanical clicks synthesized via Web Audio when checking habits or tasks.",
        dailyQuoteLabel: "Daily Motivational Quote",
        dailyQuoteHelp: "Displays an inspiring productivity & consistency quote in the selected day panel.",
        invertTrackpadLabel: "Invert trackpad direction",
        invertTrackpadHelp: "Inverts the logical direction when two-finger swiping between Calendar, Tracker, and Profile.",
        trackpadSensitivityLabel: "Trackpad sensitivity",
        trackpadSensitivityHelp: "Adjusts swipe threshold and cooldown to prevent accidental double transitions.",
        trackpadLow: "Low (Wide gesture)",
        trackpadMedium: "Medium (Recommended)",
        trackpadHigh: "High (Responsive)",
        languageLabel: "Application Language",
        languageHelp: "Select the interface language and advanced statistical explanations.",
        timeEntryModeLabel: "Time entry format",
        timeDecimal: "Decimal hours (e.g. 1.5)",
        timeHoursMinutes: "Hours & minutes (e.g. 1:30)",
        timeAdditionsLabel: "Allow time expressions",
        timeAdditionsHelp: "Type an expression without “=” (for example, 0:40 +:45 or 0.67 +0.75). You can also type only +:45 to add to the previous total. Hover to see the breakdown.",
        subjectsPluralLabel: "Subject name (Plural)",
        subjectsSingularLabel: "Subject name (Singular)",
        subjectsGlobalColor: "Subjects global color",
        subjectsGlobalColorHelp: "Color for the subjects concept in the global distribution chart.",
        hobbiesPluralLabel: "Hobby name (Plural)",
        hobbiesSingularLabel: "Hobby name (Singular)",
        heatScaleHelp: "Calendar study intensity threshold scale:",
        level1Hours: "Level 1 hours",
        level2Hours: "Level 2 hours",
        level3Hours: "Level 3 hours",
        level4Hours: "Level 4 hours",
        saveAppearanceBtn: "Save appearance preferences",

        goalsTitle: "⏱️ Time Goals & Targets",
        goalsHelp: "Define overall daily study hours and specific targets per subject and hobby.",
        dailyGoalLabel: "Overall daily target (hours/day)",
        saveGoalsBtn: "Save goals",

        subjectsTitle: "📚 Subjects & Hobbies",
        subjectsHelp: "Manage your academic courses and personal development tracks.",
        addSubjectBtn: "Add subject",
        addTrackBtn: "Add hobby",

        periodsTitle: "📅 Academic Terms & Periods",
        periodsHelp: "Time-bound periods with defined subjects and targets.",
        addPeriodBtn: "Add academic term",

        storageTitle: "💾 Local Disk Storage (Local-First)",
        storageHelp: "Connect a local disk folder to persist your data without any 5 MB limit.",
        storageStatusBrowser: "Browser Storage (localStorage)",
        storageStatusConnected: "Linked physical disk folder",
        storageConnectBtn: "📂 Connect Local Disk Folder",
        storageDisconnectBtn: "🔌 Disconnect Folder",
        exportJsonBtn: "Export Data (JSON)",
        importJsonBtn: "Import Data (JSON)",
        dangerZone: "Danger Zone",
        dangerZoneHelp: "Resetting will clear all subjects, notes, and events for the active profile.",
        dangerResetBtn: "Reset profile data",

        aboutTitle: "ℹ️ About LOG Calendar",
        aboutHelp: "Technical details, privacy philosophy, and local-first architecture.",
        versionTag: "Version {version}",
        aboutDesc: "Local-First web application designed to optimize study, habit consistency, and personal well-being with total privacy.",
        aboutPrivacy: "🔒 Absolute Privacy: Zero tracking cookies, zero external server calls, 100% offline local execution.",
        aboutStorage: "💾 Local-First Architecture: Supports File System Access API for native JSON persistence on disk.",
        aboutPerformance: "⚡ Extreme Performance: Zero npm dependencies, zero bundlers, pure native Vanilla JavaScript.",
        checkUpdatesBtn: "🔄 Check for updates",
        installPwaBtn: "📲 Install as Desktop App",
        pwaInstalledText: "✓ Desktop App mode active",
        versionUpToDate: "✓ Up to date",
        versionUpdateAvailable: "🚀 v{version} Available"
      },
      updater: {
        eyebrow: "System Update",
        modalTitle: "🚀 New Version Available",
        modalDesc: "A new version of LOG Calendar is available for download.",
        guideTitle: "How to update your local copy?",
        step1: "1. Download the latest release .zip package on GitHub.",
        step2: "2. Unzip and replace the program files (.html, .js, .css) in your LOG Calendar folder.",
        step3Safety: "🛡️ Your data is 100% safe!",
        step3SafetyDesc: "All your logged hours, subjects, habits, and notes reside in browser storage (localStorage) or in your connected local folder on disk. Replacing program files does not alter or erase your data.",
        downloadReleaseBtn: "🔗 Open Release on GitHub",
        laterBtn: "Remind me later"
      },
      insights: {
        scoreTitle: "GLOBAL SCORE",
        scoreSub: "Consistency, goals, diversification & energy · Tap for details",
        regularityTitle: "REGULARITY INDEX",
        regularitySub: "Daily rhythm stability without cramming · Tap for details",
        regularityHigh: "High Consistency",
        regularityMid: "Medium Pace",
        regularityLow: "Fluctuating",
        goalTitle: "DAILY GOAL",
        goalSubMet: "{met} of {total} days achieved · Tap for details",
        goalSubUnset: "Set your daily goal in Settings · Tap for details",
        goalBtnSettings: "⚙️ Settings",
        trendTitle: "WEEKLY TREND (WoW)",
        trendSub: "Current vs previous week ({prev}) · Tap for details",
        weeklyTitle: "WEEK-OVER-WEEK COMPARISON",
        weeklySub: "Evolution of time spent per week (Study vs Hobbies)",
        radialTitle: "RADIAL DIVERSIFICATION & BALANCE",
        radialSub: "Proportional distribution among active subjects & hobbies",
        moodTitle: "ENERGY / MOOD VS DEDICATION CORRELATION",
        moodSub: "Impact of mood on your study hours and rest",
        weekdayTitle: "EFFORT DISTRIBUTION BY DAY OF THE WEEK",
        weekdaySub: "Average and totals grouped from Monday to Sunday",
        healthTitle: "SUBJECT BALANCE & HEALTH",
        healthSub: "Urgency diagnostic, coverage, and pending tasks",
        directivesTitle: "RECOMMENDED DIRECTIVES & ACTION PLAN",
        directivesSub: "Priority recommendations based on your recent pace",
        peakWeek: "PEAK WEEK",
        weeklyAvg: "WEEKLY AVERAGE",
        goalsMet: "GOALS MET",
        globalShare: "GLOBAL BALANCE",
        perWeek: "per week",
        consistency: "consistency",
        fixGoal: "Set goal in settings",
        noRecords: "No records",
        notSet: "Not set",
        latestWeek: "Latest week",
        study: "study",
        hobbies: "hobbies",
        total: "total",
        avgLabel: "AVG:",
        goalLabel: "GOAL:",
        trackerScoreTitle: "GLOBAL HABIT SCORE",
        trackerScoreSub: "Overall consistency across active habits in period",
        trackerAdherenceTitle: "GLOBAL SUCCESS RATE",
        trackerAdherenceSub: "Completed habits vs scheduled targets",
        trackerStreakTitle: "BEST ACTIVE STREAK",
        trackerStreakSub: "Habit with highest consecutive completed days",
        trackerTrendTitle: "WEEKLY EVOLUTION",
        trackerTrendSub: "Compliance trend compared to previous week",
        trackerWeeklyTitle: "WEEKLY HABIT CONSISTENCY",
        trackerWeeklySub: "Percentage of habits completed per week",
        trackerWeekdayTitle: "COMPLIANCE BY DAY OF THE WEEK",
        trackerWeekdaySub: "Consistency patterns by day of the week",
        trackerHealthTitle: "HEALTH & CONSISTENCY BY HABIT",
        trackerHealthSub: "Individual performance and completion rate per habit",
        trackerDirectivesTitle: "HABIT DIRECTIVES & ACTION PLAN",
        trackerDirectivesSub: "Practical advice to build and solidify routines",
        hoverWeekTracker: "Hover over a week to see completed habits.",
        completedHabits: "completed habits"
      },
      templates: {
        eyebrow: "New Profile",
        modalTitle: "Create New Profile",
        modalDesc: "Pick a starter template tailored to your focus or start with a blank canvas.",
        nameLabel: "Profile name",
        namePlaceholder: "e.g. My New Semester",
        chooseTemplate: "Starter template:",
        university: {
          title: "University Student",
          desc: "Academic subjects, projects, daily study routines, and exam preparation."
        },
        opositor: {
          title: "Public Exam Candidate (Opositor)",
          desc: "Intensive sessions, legal codes, mock exams, and balanced wellness."
        },
        developer: {
          title: "Developer / Engineer",
          desc: "Backend, frontend, algorithms, side projects, and deep technical focus."
        },
        creator: {
          title: "Creative / Freelance",
          desc: "Design, content creation, client strategy, and creative blocks."
        },
        blank: {
          title: "Blank Canvas (Custom)",
          desc: "Clean starting point with zero preloaded subjects or habits."
        },
        createBtn: "Create Profile",
        cancelBtn: "Cancel"
      },
      tutorial: {
        bannerTitle: "Interactive Guided Tour",
        bannerHelp: "Learn in 2 minutes how to use the Demo Profile, study hour logging, habit tracker, and executive analytics.",
        startBtn: "🎓 Start Guided Tour",
        exitBtn: "Exit",
        prevBtn: "Previous",
        nextBtn: "Next",
        finishBtn: "Got it! Finish",
        stepCount: "Step {current} of {total}",
        switchDemoBtn: "👤 Switch to Demo Profile",
        step1Title: "👤 Your Profile & Demo Mode",
        step1Desc: "Welcome to LOG CALENDAR! Here you can manage multiple profiles or switch to the <strong>Demo Profile</strong>, a safe sandbox preloaded with subjects and habits where you can explore freely without touching your real data.",
        step2Title: "📅 Calendar & Study Heatmap",
        step2Desc: "The calendar displays your entire year. Each cell shifts in color intensity based on study hours dedicated to your subjects. The heatmap harmoniously synchronizes with your theme and accent color.",
        step3Title: "⏱️ Logging Hours, Notes & Tasks",
        step3Desc: "Clicking any day opens this side panel to log hours per subject or hobby, write journal notes, rate your daily satisfaction with stars, and manage tasks with deadlines.",
        step4Title: "📋 Daily Habits & Routine Tracker",
        step4Desc: "Single-click any day to mark your routine checks (hydration, reading, fitness, rest...). The app automatically computes your monthly consistency percentage and cleanly hides empty months.",
        step5Title: "📊 Advanced Analytics & Reports",
        step5Desc: "Explore peak productivity days, week-over-week comparisons, subject diversification donuts, and actionable AI-driven diagnostics based on your real patterns.",
        step6Title: "⚙️ Customization & Local-First Storage",
        step6Desc: "Configure themes (Dark, Light, OLED, Sepia, or System auto), trackpad sensitivity, language, and connect a local folder to persist your data into local JSON files with zero limits."
      },
      badges: {
        unstoppable: { title: "Unstoppable", desc: "Active streak of {n} consecutive days." },
        onStreak: { title: "On a Streak", desc: "Active streak of {n} consecutive days." },
        titanicDay: { title: "Titanic Day", desc: "Achieved {h} in a single day ({d})." },
        excellentDay: { title: "Excellent Day", desc: "Daily record of {h} ({d})." },
        laserFocus: { title: "Laser Focus", desc: "Maximum dedication to {name} ({h})." },
        unleashedPassion: { title: "Unleashed Passion", desc: "Invested {h} into {name}." },
        zenMaster: { title: "Zen Master", desc: "Complete academic recharge with {h} dedicated to self-growth." },
        legend: { title: "Log Legend", desc: "Over 50 total hours logged in this period." },
        seed: { title: "Seed of Growth", desc: "Started logging in this period. Keep going to unlock more badges!" }
      },
      ratings: [
        "Unrated",
        "Very rough day",
        "Low productivity",
        "Normal day",
        "Productive",
        "Excellent day!"
      ],
      avatarPicker: {
        modalTitle: "Profile Photo",
        modalSubtitle: "Choose how you would like to customize your profile picture",
        currentPhoto: "Current photo",
        optUploadTitle: "Upload from computer",
        optUploadDesc: "Choose an image file (JPG, PNG, or WebP) from your local device",
        optCameraTitle: "Take photo with camera",
        optCameraDesc: "Use your webcam to snap a photo instantly",
        optGalleryTitle: "Choose from avatar gallery",
        optGalleryDesc: "Select an aesthetic curated vector avatar from our collection",
        optRemoveTitle: "Remove current photo",
        optRemoveDesc: "Reset your profile picture to the default icon",
        cameraTitle: "Live Camera",
        cameraSubtitle: "Frame your face inside the circle and take your shot",
        cameraCapture: "Take Snapshot",
        cameraRetake: "Retake",
        cameraUse: "Use This Photo",
        cameraError: "Unable to access the camera. Check your browser or device permissions.",
        cameraNotSupported: "Your browser does not support camera access via mediaDevices.",
        galleryTitle: "Avatar Gallery",
        gallerySubtitle: "Select an avatar that represents your growth journey",
        avatarUpdated: "Profile photo updated successfully.",
        avatarRemoved: "Profile photo removed.",
        avatarInvalid: "Please select a valid image file (JPG, PNG, or WebP)."
      }
    }
  };

  function getCurrentLanguage() {
    return App.State?.state?.settings?.language === "en" ? "en" : "es";
  }

  function getLocale() {
    return getCurrentLanguage() === "en" ? "en-US" : "es-ES";
  }

  function t(path, fallback = "") {
    const lang = getCurrentLanguage();
    const parts = String(path).split(".");
    let current = TRANSLATIONS[lang];
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        current = null;
        break;
      }
    }
    if (typeof current === "string" || typeof current === "number" || Array.isArray(current)) {
      return current;
    }
    // Fallback to Spanish if English missing
    if (lang !== "es") {
      let fallbackCurrent = TRANSLATIONS.es;
      for (const part of parts) {
        if (fallbackCurrent && typeof fallbackCurrent === "object" && part in fallbackCurrent) {
          fallbackCurrent = fallbackCurrent[part];
        } else {
          fallbackCurrent = null;
          break;
        }
      }
      if (typeof fallbackCurrent === "string" || typeof fallbackCurrent === "number" || Array.isArray(fallbackCurrent)) {
        return fallbackCurrent;
      }
    }
    return fallback || path;
  }

  function text(es, en) {
    return getCurrentLanguage() === "en" ? en : es;
  }

  function format(path, values = {}, fallback = "") {
    let value = t(path, fallback);
    if (typeof value !== "string") return value;
    return value.replace(/\{(\w+)\}/g, (_, key) => values[key] == null ? `{${key}}` : String(values[key]));
  }

  function getWeekdayLetters() {
    return t("calendar.weekdayLetters") || (getCurrentLanguage() === "en" ? ["M", "T", "W", "T", "F", "S", "S"] : ["L", "M", "X", "J", "V", "S", "D"]);
  }

  function getEventCategoryLabel(catKey) {
    const fromI18n = t(`events.categories.${catKey}`);
    if (fromI18n && fromI18n !== `events.categories.${catKey}`) return fromI18n;
    if (App.Constants.EVENT_CATEGORIES?.[catKey]?.label) {
      return App.Constants.EVENT_CATEGORIES[catKey].label;
    }
    return catKey;
  }

  function getRatingLabels() {
    return t("ratings") || TRANSLATIONS.es.ratings;
  }

  function getDailyQuote(dateKey) {
    const lang = getCurrentLanguage();
    if (!dateKey) {
      const today = new Date();
      dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    }
    // Deterministic hash based on date string
    let hash = 0;
    for (let i = 0; i < dateKey.length; i++) {
      hash = (hash << 5) - hash + dateKey.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % DAILY_QUOTES.length;
    const item = DAILY_QUOTES[index];
    return {
      text: lang === "en" ? item.en : item.es,
      author: item.author
    };
  }

  function setLanguage(lang) {
    const targetLang = lang === "en" ? "en" : "es";
    if (!App.State?.state?.settings) return;
    const alreadySelected = App.State.state.settings.language === targetLang;
    App.State.state.settings.language = targetLang;
    if (App.Storage && typeof App.Storage.saveState === "function" && !alreadySelected) {
      App.Storage.saveState();
    }
    const languageSelect = document.getElementById("appLanguageSelect");
    if (languageSelect) languageSelect.value = targetLang;
    applyDOMTranslations();
    if (App.Settings && typeof App.Settings.applyProfile === "function") {
      App.Settings.applyProfile();
    }
    refreshAllViews();
  }

  function applyDOMTranslations() {
    const lang = getCurrentLanguage();
    document.documentElement.setAttribute("lang", lang);

    const resolveText = (str) => {
      if (typeof str !== "string") return str;
      if (str.includes("{version}")) {
        const v = window.App?.Constants?.APP_VERSION || "4.0.8";
        return str.replace(/\{version\}/g, v);
      }
      return str;
    };

    // Apply data-i18n attributes
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const translation = t(key);
      if (translation && typeof translation === "string") {
        el.textContent = resolveText(translation);
      }
    });

    // Apply data-i18n-placeholder
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const translation = t(key);
      if (translation && typeof translation === "string") {
        el.setAttribute("placeholder", resolveText(translation));
      }
    });

    // Apply data-i18n-title
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.getAttribute("data-i18n-title");
      const translation = t(key);
      if (translation && typeof translation === "string") {
        el.setAttribute("title", resolveText(translation));
      }
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria-label");
      const translation = t(key);
      if (translation && typeof translation === "string") {
        el.setAttribute("aria-label", resolveText(translation));
      }
    });

    const staticText = [
      ["#settingsModal .eyebrow", "Configuración", "Settings"],
      ["#settingsTitle", "Ajustes", "Settings"],
      ["#rangeEntryTitle", "Precargar más meses", "Preload more months"],
      ["#rangeEntryConfirmBtn", "Precargar un año más", "Preload one more year"],
      ["#taskDetailsDesc", "Aquí va la descripción detallada de la tarea...", "The task description will appear here..."],
      ["#repEnergyNarrative", "Cargando análisis de rendimiento...", "Loading performance analysis..."],
      ["#repRatingDesc", "Día normal en promedio.", "Average normal day."],
      ["#reportTabContentInsights h3:first-of-type", "Distribución por Día de la Semana", "Distribution by Day of the Week"],
      ["#reportTabContentInsights h3:nth-of-type(2)", "Correlación: Ánimo vs Dedicación", "Correlation: Mood vs Dedication"],
      ["#reportTabContentBadges > p", "Insignias desbloqueadas según tu desempeño en este periodo:", "Badges unlocked based on your performance in this period:"]
    ];
    staticText.forEach(([selector, es, en]) => {
      const el = document.querySelector(selector);
      if (el) el.textContent = text(es, en);
    });

    [
      ["#topbarLastUpdate", "title", "Sin registros recientes", "No recent records"],
      [".month-nav-strip", "aria-label", "Navegación de meses", "Month navigation"],
      [".stats-section", "aria-label", "Resumen y estadísticas", "Summary and statistics"],
      ["#paneChecklistSelectedDay", "aria-label", "Editor de tareas del día", "Daily task editor"],
      ["#dayPanel", "aria-label", "Editor del día", "Day editor"],
      ["#profileLateralDock", "aria-label", "Navegación de perfil", "Profile navigation"],
      [".liquid-glass-dock", "aria-label", "Navegación principal", "Main navigation"]
    ].forEach(([selector, attribute, es, en]) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attribute, text(es, en));
    });

    const closeLabel = text("Cerrar", "Close");
    [
      "#settingsCloseBtn", "#subjectEntryCloseBtn", "#trackEntryCloseBtn",
      "#periodEntryCloseBtn", "#eventEntryCloseBtn", "#rangeEntryCloseBtn",
      "#advancedStatsCloseBtn", "#taskEntryCloseBtn", "#taskDetailsCloseBtn",
      "#habitEntryCloseBtn", "#profileTemplateCloseBtn"
    ].forEach((selector) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute("aria-label", closeLabel);
    });

    // Update Dock labels
    const tabCalLabel = document.querySelector("#tabCalendar .dock-label");
    if (tabCalLabel) tabCalLabel.textContent = t("dock.calendar");
    const tabChkLabel = document.querySelector("#tabChecklist .dock-label");
    if (tabChkLabel) tabChkLabel.textContent = t("dock.tracker");
    const tabProfLabel = document.querySelector("#tabProfile .dock-label");
    if (tabProfLabel) tabProfLabel.textContent = t("dock.profile");
  }

  function refreshAllViews() {
    if (App.Calendar && typeof App.Calendar.renderCalendar === "function") {
      App.Calendar.renderCalendar();
      App.Calendar.renderEventLegend();
    }
    if (App.DayPanel && typeof App.DayPanel.renderSelectedDay === "function") {
      App.DayPanel.renderSelectedDay();
    }
    if (App.Tracker && typeof App.Tracker.renderRoutineTracker === "function") {
      App.Tracker.renderRoutineTracker();
    }
    if (App.Tasks && typeof App.Tasks.refreshChecklistAll === "function") {
      App.Tasks.refreshChecklistAll();
    }
    if (App.Tasks && typeof App.Tasks.renderEventTypeOptions === "function") {
      App.Tasks.renderEventTypeOptions();
    }
    if (App.Stats && typeof App.Stats.renderStats === "function") {
      App.Stats.renderStats();
    }
    if (App.Insights && typeof App.Insights.renderInsightsDashboard === "function") {
      App.Insights.renderInsightsDashboard();
    }
    if (App.Settings && typeof App.Settings.renderProfileDashboard === "function") {
      App.Settings.renderProfileDashboard();
    }
    if (App.Main && typeof App.Main.updateDynamicLabels === "function") {
      App.Main.updateDynamicLabels();
    }
  }

  Object.assign(App.I18n, {
    getCurrentLanguage,
    getLocale,
    t,
    text,
    format,
    getWeekdayLetters,
    getEventCategoryLabel,
    getRatingLabels,
    getDailyQuote,
    setLanguage,
    applyDOMTranslations,
    refreshAllViews
  });
})();
