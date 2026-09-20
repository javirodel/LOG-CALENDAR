# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [3.0.1] - 2026-09-20

### Added
- **Navegación horizontal entre vistas**:
  - Desplazamiento horizontal con dos dedos en el trackpad para cambiar entre Calendario y Tracker.
  - El gesto respeta el scroll vertical y no interfiere con las tablas que tienen scroll horizontal propio.
- **Análisis académico avanzado** en el desplegable “Más estadísticas” del Calendario:
  - Riesgo por asignatura combinando eventos próximos, dificultad, cobertura de horas, tareas y actividad reciente.
  - Detección de tareas pendientes y atrasadas vinculadas a cada asignatura.
  - Días desde el último estudio, horas registradas en los últimos 14 días y cobertura frente al objetivo estimado.
  - Motivos concretos de riesgo y recomendaciones accionables para priorizar el estudio.
  - Tarjetas de preparación real y señales de actuación, además de los rankings existentes.

### Changed
- **Transición entre Calendario y Tracker**: cambio de vista con una animación lateral suave al superar el umbral del gesto horizontal.
- **Gráficos de horas por asignatura**:
  - Mejor distribución del espacio para nombres largos.
  - La dificultad se muestra separada y sin solaparse con el nombre.
  - Las barras y los valores de horas conservan una alineación estable.
- **Resumen de hábitos del Tracker**: añadido espacio entre el nombre truncado y los contadores de completados, pendientes y porcentaje.

### Fixed
- Corregidas declaraciones CSS huérfanas que provocaban el error de sintaxis “se esperaba `{`”.
- Corregidos solapamientos visuales en nombres largos de asignaturas, etiquetas de dificultad y estadísticas del Tracker.

## [3.0.0] - 2026-09-14

### Added
- **Modo Oscuro integral (Dark Mode)**:
  - Sistema de tema visual oscuro nativo completo con paleta de superficies oscuras (`#111116`, `#1a1a22`, `#22222e`) y degradados sutiles.
  - Conmutadores estilo switch iOS interactivos tanto en el menú popover de **Inicio** como en **Ajustes > Perfil**.
  - Script inline de precarga en `<head>` para evitar parpadeos de brillo al recargar la página (*flash of unstyled content / FOUC*).
  - Persistencia dedicada en `localStorage` sincronizada en tiempo real entre ambos interruptores.
  - Adaptación cromática dinámica con funciones `readableColor` y `lightenColor` para garantizar legibilidad óptima de chips, materias y categorías sobre fondos oscuros.
  - Compatibilidad total de estados interactivos (`:hover`, `:focus`, `:active`) con resplandor sutil del color de acento y bordes refinados.
- **Acciones rápidas para asignaturas**:
  - Botón directo `+ Añadir` en la cabecera de "Asignaturas" del panel lateral del día.
  - Botón directo en el estado vacío cuando no existen asignaturas configuradas.
- **Cálculo unificado de semanas naturales Lunes–Domingo (`getRoutineMonthWeeks`)**:
  - Algoritmo unificado para agrupar las semanas de cualquier mes calendario empezando estrictamente en lunes (norma ISO).

### Changed
- **Tracker de hábitos y rutinas (Sincronización total Lunes–Domingo)**:
  - El histograma de barras diarias (`dailyBarsContainer`), las cabeceras de la matriz mensual y las tarjetas de progreso semanal (`weeklyStatsSummary`) ahora comparten la misma definición de semanas, eliminando el desfase donde el lunes tomaba el color de la semana anterior.
  - Cada semana natural tiene su propio color distintivo (Semana 1: Acento, Semana 2: Verde `#10b981`, Semana 3: Morado `#a855f7`, Semana 4: Azul `#3b82f6`, Semana 5: Ámbar `#d97706`).
  - Tooltips de barras diarias enriquecidos con nombre del día de la semana y semana correspondiente (ej. *lun. 14 (Semana 3): 5/10 hábitos*).
  - Normalización de hábitos predeterminados limpios sin emojis forzados.
- **Gráfica de tendencia SVG**:
  - Corrección de viewBox y dimensiones dinámicas del contenedor para evitar el efecto achatado o deformado de los porcentajes y curvas.
- **Sección de Cumplimiento Global**:
  - Maquetación fija con `flex-grow` para el nombre y ancho fijo para las cifras `X/30` y porcentajes, evitando solapamientos cuando los nombres son largos.
- **Formularios de Asignaturas y Eventos**:
  - El campo de descripción pasa a ser opcional en lugar de obligatorio al crear asignaturas.
- **Notificaciones Toast**:
  - Elevación de capa al máximo admitido (`z-index: 2147483647 !important`) con bordes y sombras profundas para mostrarse de forma garantizada por encima del menú de configuración y modales abiertos.

### Fixed
- **Borde blanco en Estadísticas Principales**:
  - Eliminada la línea blanca residual que bordeaba el recuadro `.stats-section` en modo oscuro, unificándolo con los demás paneles oscuros (`var(--line)`).
- **Error crítico en botones de creación (`ReferenceError: subjectEntryTitleEl`)**:
  - Corregido el fallo de JavaScript que impedía abrir el modal para añadir o editar asignaturas y hobbies.

## [2.0.0] - 2026-08-14

### Added
- **Liquid Glass Dock**: barra de navegación inferior flotante con estética glassmorphism (blur, reflejos, sombras) y animaciones spring en hover. Reemplaza la botonera superior anterior.
- **Menú popover del dock**: menú desplegable animado desde el botón 🏠 Inicio con acceso rápido a Exportar, Importar y Ajustes. Cierre automático al pulsar fuera.
- **Tracker de hábitos y rutinas** (pestaña 📋 Tracker): vista completa tipo "RoutineKraft" con:
  - Matriz mensual interactiva de hábitos con checkboxes estilo GitHub contributions, coloreados por semana.
  - Edición inline de objetivos (días/mes) directamente en la tabla.
  - Gráfico de tendencia SVG con curva Bézier suavizada y área degradada.
  - Histograma diario de hábitos completados por día.
  - Tarjetas de progreso semanal con barras de porcentaje animadas.
  - Gráfico donut SVG de completitud mensual global.
  - Ranking Top 10 dinámico con medallas oro/plata/bronce.
  - Modal de creación/edición de hábitos con selector de emoji y objetivo mensual.
- **Sistema de cursos académicos**: creación de periodos académicos (p. ej. "Curso 2025-2026") con fechas de inicio/fin y asignación selectiva de asignaturas y hobbies mediante checkboxes.
- **Filtrado de estadísticas por periodo**: selector desplegable que filtra todas las métricas, gráficos y análisis por curso académico o vista global.
- **Detección automática de vacaciones**: cuando la fecha actual cae fuera de un periodo académico configurado, la UI cambia automáticamente a modo "Hobby / Desconexión" (oculta datos académicos, muestra gráficos de ocio).
- **Informes de periodo con 4 pestañas**:
  - 📌 Resumen ejecutivo: horas totales, reparto estudio/ocio, días activos, tasa de completitud de tareas, valoración media.
  - 📚 Materias y Hobbies: desglose granular con barras de progreso, ordenable por horas o nombre.
  - 🧠 Insights: distribución de carga por día de la semana (Lun-Dom) y correlación estado de ánimo vs dedicación.
  - 🏆 Logros: sistema de insignias (Imparable, Día Titánico, Enfoque Láser, Maestro del Zen, Leyenda del Log).
- **Categorías de evento personalizadas**: creación de tipos de evento arbitrarios con nombre y color propios desde el formulario de eventos.
- **Leyenda dinámica de eventos**: badges de color en la barra del calendario que se actualizan automáticamente según los eventos activos.
- **Extensión dinámica del rango del calendario**: modal para ampliar ±1 año los límites del calendario sin perder datos.
- **Puntuación de riesgo académico**: algoritmo multifactor (0-100) que considera proximidad de exámenes, dificultad de la asignatura y cobertura de estudio estimada.
- **Consejos automáticos de mejora**: sugerencias contextuales que detectan asignaturas descuidadas, concentración excesiva o desequilibrios estudio-ocio.
- **Renombrado dinámico de etiquetas**: doble clic en cabeceras para personalizar los términos "Asignaturas" y "Hobbies" (singular/plural) con propagación global en toda la interfaz.

### Changed
- Navegación principal migrada de botones en cabecera a dock flotante inferior con pestañas 📅 Calendario y 📋 Tracker.
- Exportar, Importar y Ajustes movidos al menú popover del dock.
- Panel de estadísticas principales mejorado: carga cognitiva ponderada, puntuación de riesgo académico y análisis de distribución semanal.
- Modal de estadísticas avanzadas ampliado con ranking por día de la semana y clasificación de carga ponderada.
- Indicador de autoguardado visual (`💾 Guardado`) en el panel de día.

### Fixed
- Botones completamente inoperativos (añadir evento, registrar horas, cerrar configuración, etc.) por crash de JavaScript al intentar vincular event listeners a elementos con IDs obsoletos (`exportBtn`, `importInput`, `settingsBtn`) tras la migración al dock. Resuelto con null guards.

## [1.2.0] - 2026-06-01

### Added
- Modal de detalles para tareas con visualización de descripción, vinculación, dificultad, vencimiento y estado.
- Campo de descripción detallada en formularios de creación de tareas.
- Panel de métricas avanzadas: racha de completado, próximos vencimientos (7 días), dificultad promedio y carga de trabajo por proyecto.
- Reorganización y separador visual en el panel izquierdo de tareas diarias.
- Indicador de versión en la sección inferior de la ventana de configuración.

### Changed
- Nueva distribución en tres columnas para la vista de tareas: listado principal, calendario de vista previa mensual e informes estadísticos en la sección inferior.
- Renombrado del botón "Guardar tarea" a "Añadir tarea".
- Optimización de etiquetas de filtros ("Todos los items") para evitar desbordamientos visuales.
- Vista de tareas completadas: ahora permanecen visibles (atenuadas y tachadas) de forma predeterminada bajo el filtro "Todas" para permitir desmarcado en caso de error.

### Removed
- Eliminadas las tareas de ejemplo (mock tasks) de la inicialización de la base de datos para garantizar una lista limpia en nuevas instalaciones.

### Fixed
- Corrección de anidamiento HTML que desplazaba el panel de detalles y ocultaba la sección de Checklist.
- Corrección de eventos de clic en tarjetas de tarea para evitar aperturas involuntarias del modal al marcar checkboxes o pulsar botones de acción.

## [1.1.0] - 2026-05-31

### Added
- Personalización dinámica de etiquetas de proyectos y hobbies ("asignaturas", "bloques", etc.) con propagación en toda la UI.
- Acciones directas (iconos de edición y eliminación) para la gestión de proyectos y hobbies en los ajustes.
- Pestaña de lista de tareas (Checklist) con buscador integrado y panel básico de rendimiento.
- Vista previa mensual con indicadores de cumplimiento diario en el panel de tareas.
- Botón flotante inferior para alternar de forma rápida entre las vistas de Calendario y Checklist.

### Fixed
- Corrección del enlace/botón de desglose detallado ("Ver más") en el panel de estadísticas principales.

## [1.0.0] - 2026-05-25

### Added
- Versión inicial: mapa de calor de intensidad de estudio, registro de horas académicas/hobbies, notas diarias, valoración de productividad por estrellas y sistema de importación/exportación de copias de seguridad.
