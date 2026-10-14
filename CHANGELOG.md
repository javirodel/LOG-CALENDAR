# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [4.0.3] - 2026-10-13

### Fixed
- **Edición y actualización de hobbies sin duplicación**: corregido el selector de estado en `tracker.js` (`App.State.editingTrackTarget`) que provocaba que al editar el color o título de un hobby existente se creara una entrada duplicada en lugar de actualizarse. Se revisó y aseguró la misma persistencia para asignaturas, hábitos y tareas en `tasks.js`.

### Added
- **Color global personalizable para asignaturas**: incorporado el ajuste `subjectsColor` para definir el color representativo del bloque general de asignaturas (especialmente visible en la gráfica de *Distribución global* del calendario). Añadidos selectores de color en **Ajustes > Asignaturas & Hobbies** y en **Ajustes > Perfil / Apariencia > Nombres personalizados** con sincronización en tiempo real y persistencia en el almacenamiento.

### Changed
- **Degradados con luminosidad adaptada en Modo Oscuro y OLED**:
  - Las tarjetas de registro de hobbies (`.focus-track`, proyectos/tiempo, deporte, scout/comunidad) recuperan sus degradados cromáticos en los temas oscuro y OLED, utilizando mezclas de contraste adaptativo (`color-mix`) con realce en blancos sobre el texto para evitar que colores oscuros queden apagados o ilegibles.
- **Difuminado ambiental reforzado desde la esquina de LOG CALENDAR**:
  - Mejorada la progresión de paradas del degradado radial en la esquina superior izquierda del `body` en todos los temas (claro, oscuro, OLED y sepia), logrando un resplandor ambiental orgánico y visible que acompaña al título sin resultar artificial ni excesivo.
- **Caché del Service Worker y versión**: actualizada a `v4.0.3`.

## [4.0.2] - 2026-10-12

### Changed
- **Manifiesto PWA actualizado**: añadido `display_override` con soporte para `window-controls-overlay` y fallback a `standalone`, mejorando la integración de la aplicación instalada con ventanas compatibles.
- **Gestión de temas y colores dinámicos**: el color de la barra del navegador se sincroniza con el tema activo (claro, oscuro, OLED, sepia o sistema), incluyendo la adaptación automática a `prefers-color-scheme`.
- **Persistencia del tema**: los cambios de tema se guardan inmediatamente en el estado del perfil y los controles del dock y de Ajustes permanecen sincronizados.
- **Versión de la aplicación**: actualizada a `4.0.2` en la fuente central de constantes y en el metadato de publicación.

### Fixed
- **Arranque sin parpadeo de tema**: el documento aplica el tema y el color iniciales antes de cargar la interfaz, respetando la preferencia guardada y el modo oscuro del sistema.

## [4.0.1] - 2026-10-12

### Added
- **Densidad visual configurable del calendario**: incorporados los modos compacto y espacioso, con ajustes específicos de altura, espaciado, tipografía, puntos de materias y etiquetas de actividades.

### Changed
- **Identidad visual del manifiesto PWA**: simplificados el nombre de la aplicación y los colores de tema y fondo para una instalación más coherente con la interfaz clara.
- **Color dinámico del navegador**: añadido el ajuste del color de la barra del navegador cuando cambia el tema activo.
- **Caché del Service Worker**: actualizada a `v4.0.1` para garantizar que las instalaciones PWA reciban los recursos de esta versión.

## [4.0.0] - 2026-10-12

### Fixed
- **Fidelidad cromática de etiquetas de hobbies y deporte en Modo Oscuro y OLED**:
  - Corrección del error visual en las celdas del calendario donde los chips de hobbies y actividades (`.track-chip`, ej. deporte en azul, lectura, etc.) se mostraban erróneamente en color amarillo uniforme (`--accent-rgb`) al activar el modo oscuro.
  - Se eliminó la regla restrictiva `[data-theme="dark"] .track-chip` que forzaba el color de acento y se implementó un esquema de contraste adaptativo para temas oscuros (`[data-theme="dark"]` y `[data-theme="oled"]`): fondo oscuro enriquecido con el color propio de la etiqueta (`color-mix` al 22% sobre `--surface`), silueta sutil interior (`box-shadow inset`) y texto luminiscente de alta legibilidad (`color-mix` al 72% con blanco), preservando fielmente el color individual de cada etiqueta configurado por el usuario tanto en modo claro como en modo oscuro.

### Changed
- **Contraste y Distinción Cromática de la Semana 1 en el Tracker**:
  - Sustitución del color por defecto de la Semana 1 (`var(--accent)`, que coincidía con el verde esmeralda de la Semana 2 `#10b981`) por una vibrante tonalidad Coral / Rosa (`#f43f5e`).
  - Actualización sincronizada en las cabeceras de columnas (`.week-header-1`), checkboxes de hábitos (`.routine-checkbox.week-1`), barras de actividad (`.bar-fill.week-1`) y progreso semanal (`.weekly-card-fill.week-1`), con soporte dedicado y contraste calibrado para los modos Claro, Oscuro y OLED.
- **Formato compacto de tiempo en las etiquetas del calendario**:
  - Las etiquetas de hobbies y deporte dentro de las celdas del calendario ahora muestran las horas con `h` y los minutos con `'` (por ejemplo, `1h 30'`) para aprovechar mejor el espacio reducido de los chips de color.
  - El cambio solo afecta a estas etiquetas compactas del calendario; los demás formatos de tiempo de la aplicación se mantienen sin cambios.
- **Centralización Arquitectónica de Versión (`Single Source of Truth`)**:
  - Unificación completa de la variable de versión en todo el código JavaScript cliente bajo una única fuente de verdad: `App.Constants.APP_VERSION = "4.0.0"` en [`js/core/constants.js`](file:///C:/Users/Rodel/OneDrive%20-%20Universidad%20de%20Salamanca/Escritorio/DEFLOG/RC/js/core/constants.js).
  - Eliminación de versiones manuales o redundantes en `updater.js`, `storage.js` e `i18n.js`. Ahora, el verificador de actualizaciones, las copias de seguridad JSON y el sistema de traducciones (`{version}`) beben de forma reactiva y dinámica de la misma constante central.

### Added
- **Transformación en PWA Instalable Completa (Progressive Web App)**:
  - Configuración de manifiesto web estándar en [`assets/manifest.webmanifest`](file:///C:/Users/Rodel/OneDrive%20-%20Universidad%20de%20Salamanca/Escritorio/DEFLOG/RC/assets/manifest.webmanifest) con `display: standalone`, `start_url: ../index.html`, orientación adaptable, color de tema y set de iconos de alta resolución generados en 192x192 y 512x512 píxeles tanto estándar como adaptativos (`purpose: any maskable`).
  - Service Worker (`service-worker.js`) con estrategia de almacenamiento en caché **Network First con fallback a Cache** para funcionamiento 100% offline, permitiendo abrir la aplicación instantáneamente sin conexión a internet y manteniendo siempre la última versión fresca disponible al reconectar.
  - **Aislamiento Seguro Total**: El Service Worker nunca intercepta ni altera la File System Access API ni IndexedDB, preservando la arquitectura Local-First y la integridad de los datos físicos en disco.
  - Detección y gestión de instalación: botón contextual dinámico en *Ajustes > Acerca de* (`📲 Instalar como aplicación de escritorio`) que captura el evento nativo `beforeinstallprompt`, detecta si la app ya se ejecuta en ventana independiente (`display-mode: standalone`) y muestra el badge `✓ Modo aplicación de escritorio activo`.
- **Sistema Ligero y Seguro de Notificación de Actualizaciones**:
  - Verificación pasiva, asíncrona y no bloqueante mediante lectura directa de [`assets/version.json`](file:///C:/Users/Rodel/OneDrive%20-%20Universidad%20de%20Salamanca/Escritorio/DEFLOG/RC/assets/version.json) alojado en el repositorio de GitHub (`https://raw.githubusercontent.com/javirodel/LOG-CALENDAR/main/assets/version.json`), evitando los límites de peticiones (rate limits) de la API REST de GitHub.
  - Exclusión inteligente para instancias desplegadas en GitHub Pages (`*.github.io`), donde el navegador siempre recibe de forma automática la última versión sin molestar al usuario con descargas redundantes.
  - Modal informativo de actualización con guía paso a paso clara sobre cómo actualizar instancias locales descomprimiendo el `.zip` de la última release de GitHub y enfatizando que **los datos del usuario NUNCA se pierden**, ya que residen en `localStorage` o en la carpeta conectada en disco.
  - Botón manual *"🔄 Comprobar actualizaciones"* y badge reactivo de estado en *Ajustes > Acerca de* (`✓ Al día` o `🚀 vX.X.X Disponible`).
- **Scroll Continuo con Sincronización Automática (Scroll-Spy) en Ajustes**:
  - En la vista de Configuración / Ajustes, todas las tarjetas de sección (`👤 Identidad`, `🎨 Aspecto`, `⏱️ Metas`, `📚 Materias`, `📅 Cursos`, `💾 Disco`, `ℹ️ Acerca`) ahora coexisten en un flujo vertical continuo para permitir una navegación natural mediante scroll con el ratón o trackpad sin tener que conmutar pestañas forzosamente.
  - Sincronización automática bidireccional (Scroll-Spy): al deslizar libremente la página, la pestaña correspondiente en el dock lateral sticky se ilumina activamente en tiempo real; y al pulsar sobre cualquier pestaña del dock, la página realiza un desplazamiento suave animado (`scrollIntoView`) directamente hasta el bloque seleccionado.
- **Spotlight Nítido Físico y Posicionamiento Inteligente Despejado en el Tutorial Guiado**:
  - Eliminación total del desenfoque sobre los elementos explicados en el recorrido interactivo (`App.Tutorial`): sustitución del telón único por una arquitectura física de 4 paneles perimetrales (`tourBackdropTop`, `tourBackdropBottom`, `tourBackdropLeft`, `tourBackdropRight`) con `backdrop-filter: blur(6px)`.
  - **Superposición Total y Clicabilidad Garantizada**: Tarjeta explicativa elevada a la capa superior absoluta del DOM (`z-index: 9999999 !important` y botones con `z-index: 10000000 !important; pointer-events: auto !important`), eliminando conflictos de apilamiento con los elementos destacados para que los botones "Siguiente", "Anterior" y "✕" respondan siempre al primer clic sin bloqueos.
  - **Posicionamiento Inteligente Despejado**: Algoritmo de holgura perimetral que sitúa la tarjeta fuera del elemento iluminado (a la derecha en el calendario de meses, a la izquierda en el panel del día, debajo en la tarjeta de identidad y matriz de hábitos), evitando tapar lo que se está mostrando al usuario.
- **Overhaul de Contraste y Calibración de Brillo en Modo OLED Negro Puro**:
  - Erradicación completa de bloques blancos deslumbrantes en el tema OLED: los paneles de estadísticas (`.chart-panel`: *Horas por asignatura*, *Distribución de valoraciones*, *Distribución global*) y las tarjetas de hobbies/materias en el panel del día (`.focus-track`, `.track-projects`, etc.) ahora adoptan fondos negros puros (`#060608`, `#08080c`) con bordes sutiles y textos perfectamente legibles.
  - Calibración de brillo en días de estudio para OLED: implementación de `HEATMAP_PALETTES_OLED` y atenuación de luminancia adaptativa en modo sincronizado (niveles de opacidad 14%, 28%, 44% y 62% frente al 100% cegador anterior) respetando la filosofía de verdadero descanso visual y ahorro de energía en pantallas LED.
  - Suavizado del contraste tipográfico y badges en celdas de calendario (`#e2e8f0` y fondos translúcidos oscuros en lugar de blanco puro estridente).
- **Foto de Perfil Dinámica en la Barra de Navegación Flotante (Dock)**:
  - Integración de avatar circular miniatura (`#dockProfileAvatarImg`) en el botón *Perfil* (`#tabProfile`) de la barra de navegación flotante inferior (`.liquid-glass-dock`).
  - Si el perfil activo cuenta con foto personalizada o avatar de galería, se muestra reactivamente su imagen con borde cromático y efecto hover sutil en lugar del icono genérico `👤`. Si no existe foto, preserva el icono predeterminado.
  - Sincronización instantánea al cambiar de perfil activo, subir imágenes, capturar desde cámara web, elegir de la galería o eliminar la foto.
- **Suite Profesional de Opciones de Foto de Perfil (Selector, Cámara y Galería)**:
  - Al pulsar sobre el avatar del perfil (`#profileAvatar`), se despliega un diálogo profesional (`#avatarPickerModal`) con 4 opciones:
    1. 💻 **Subir desde el ordenador**: Selector nativo de archivos de imagen (JPG, PNG, WebP) desde el disco local con procesamiento local vía `FileReader`.
    2. 📸 **Hacer foto con la cámara (Webcam en directo)**: Visor circular interactivo en tiempo real con efecto espejo selfie (`navigator.mediaDevices.getUserMedia`), guía de encuadre, captura instantánea a `<canvas>`, opciones de *↺ Repetir* o *✓ Usar esta foto*, y liberación total del stream (`track.stop()`) para apagar la luz de la cámara al instante al cerrar.
    3. 🖼️ **Elegir de la galería**: Selección de 12 avatares vectoriales SVG de alta definición con gradientes modernos temáticos (Academia, Developer, Explorador, Zen, Enfoque, Diana, Estudioso, Energía, Creatividad, Campeón, Ciencia y Cosmos) sin dependencias ni peticiones externas.
    4. 🗑️ **Eliminar foto actual**: Opción contextual visible únicamente cuando hay foto personalizada para restablecerla al icono por defecto.
  - 100% bilingüe (Español & English) y compatible con los temas Claro, Oscuro, OLED y Sepia.
- **Tutorial Guiado Interactivo (Spotlight Tour)**:
  - Sistema de recorrido guiado paso a paso (`App.Tutorial`) accesible en cualquier momento desde *Ajustes > Identidad* y *Ajustes > Acerca de*.
  - Efecto spotlight con oscurecimiento ambiental inteligente (`backdrop-filter: blur`), tarjeta flotante reactiva con medidor de pasos ("Paso 1 de 6"), controles "Anterior", "Siguiente", atajos de teclado (Escape, Flechas) e indicador de puntos navegables.
  - 6 paradas clave orientadas al flujo de valor:
    1. Selector de perfiles y acceso con un clic al **Perfil de Ejemplo** didáctico para trastear sin miedo a tocar datos reales.
    2. Calendario anual y comprensión del mapa de calor de horas de estudio.
    3. Panel lateral del día: suma de horas por materia o hobby, notas, valoración con estrellas y tareas pendientes.
    4. Tracker de hábitos: matriz de rutinas, cheques mensuales y limpieza de meses vacíos.
    5. Analítica avanzada e informes de rendimiento.
    6. Configuración personalizada, temas visuales y persistencia física en disco (Local-First).
  - Ocultación garantizada de la barra de navegación flotante inferior (`.liquid-glass-dock`) durante la ejecución del tutorial para erradicar cualquier solapamiento visual con las tarjetas explicativas.
  - 100% bilingüe (Español & English) y compatible con cierre inmediato (botón ✕ o tecla Escape).
- **Paleta de Calor Sincronizada con el Color de Acento (Opción por Defecto)**:
  - Nueva opción por defecto `"sync"` (*"🎯 Sincronizada con acento (Recomendado)"*) en la paleta del mapa de calor. Asegura armonía cromática total en la aplicación: al seleccionar cualquier color de acento (amarillo, azul, morado, etc.), las celdas del calendario adoptan de inmediato el gradiente correspondiente en lugar de desentonar con verde esmeralda.
- **Tema Automático Adaptativo ("Por defecto del sistema")**:
  - Soporte para sincronización automática en tiempo real con el esquema de color del sistema operativo mediante el listener reactivo `window.matchMedia('(prefers-color-scheme: dark)')`. Si el sistema operativo está configurado en tema oscuro aplica el tema oscuro clásico, y si está en claro aplica el tema claro estándar.
- **Paleta de Calor Personalizada y Reubicación de Color de Acento**:
  - Reubicación ergonómica del selector de color de acento (`#profileAccent`) desde la sección de *Identidad* a la de *Aspecto & Visualización*, situado justo debajo del selector de la paleta de calor de estudio.
  - Nueva opción *"Personalizado (Color propio)"* en la paleta del mapa de calor: calcula dinámicamente los 4 niveles de gradiente e intensidad de estudio a partir del color de acento elegido por el usuario, con actualización en vivo al modificar el selector de color.
- **Reorganización Estructurada de Ajustes de Aspecto**:
  - Reestructuración de la tarjeta *Aspecto & Visualización* en 4 subgrupos visuales claramente delimitados mediante tarjetas con títulos e iconos temáticos:
    1. *🎨 Tema & Paleta Cromática* (Tema con soporte para sistema, paletas predefinidas y personalizada, color de acento y densidad).
    2. *🌐 Idioma & Experiencia Interactiva* (Selector de idioma, retroalimentación auditiva háptica y cita motivacional diaria).
    3. *🎛️ Ergonomía & Navegación Trackpad* (Sensibilidad del gesto y sentido invertido).
    4. *⏱️ Registro de Tiempo & Nombres Personalizados* (Formato de entrada decimal o hh:mm, nombres personalizados de actividades y umbrales de intensidad).
- **Suite Completa de 6 Funcionalidades de Personalización Avanzada**:
  - **1. Paletas de Calor del Calendario Configurables (Heatmap Palettes)**:
    - Selector en *Ajustes > Aspecto* con 6 esquemas cromáticos cuidadosamente calibrados: *Esmeralda Clásico* (Verde-Teal), *GitHub Green* (Verde bosque intenso), *Dracula Purple* (Púrpura elegante), *Monokai Neon* (Cian eléctrico), *Ámbar Otoño* (Dorado cálido) y *Cyberpunk Pink* (Rosa neón de alto impacto).
    - Adaptación reactiva en tiempo real tanto de las variables CSS de celdas (`--heat-0` a `--heat-4`) como de la función analítica `getIntensityColor` y muestras de la leyenda.
  - **2. Modos de Contraste Extremo (OLED Negro Puro & Sepia de Lectura)**:
    - Incorporación de dos nuevos temas visuales completos que se suman a Claro y Oscuro:
      - *OLED Negro Puro*: Fondos `#000000` con bordes sutiles para maximizar el contraste y el ahorro de batería en pantallas OLED y AMOLED.
      - *Sepia / Papel*: Paleta cálida basada en tonos pergamino y papel encuadernado para descanso visual durante sesiones prolongadas de lectura y estudio nocturno.
  - **3. Respuesta Sonora Mecánica Háptica Offline (Web Audio Synthesis)**:
    - Módulo de micro-acústica háptica (`App.Sound`) sintetizado en tiempo real mediante la **Web Audio API** nativa del navegador (0 KB de archivos de audio, 0 llamadas a la red).
    - Genera micro-clics mecánicos amortiguados (ondas sinusoidales y triangulares de 12 ms a 1800 Hz) y acordes sutiles de éxito al marcar hábitos en la matriz de rutinas o completar tareas en el panel del día.
    - Conmutador conmutable (Toggle) en *Ajustes > Aspecto* para habilitar o silenciar la retroalimentación auditiva al instante.
  - **4. Plantillas de Inicio de Perfil (Profile Starter Templates)**:
    - Modal de creación guiada al pulsar `+ Nuevo Perfil` con selección entre 5 arquetipos preconfigurados:
      - *Estudiante Universitario*: Materias académicas (Cálculo, Álgebra, Física), proyectos y hábitos de estudio, biblioteca y preparación de exámenes.
      - *Opositor / Oposiciones*: Bloques de estudio intensivo, legislación, simulacros y balance con deporte y descanso.
      - *Desarrollador / Ingeniero*: Algoritmos, arquitectura de software, proyectos open-source, commits y deep work.
      - *Creativo / Freelance*: Diseño de producto, entregas a clientes, investigación, creación de contenido y hobbies.
      - *En Blanco (Personalizado)*: Lienzo completamente limpio para usuarios que desean comenzar desde cero.
  - **5. Selector de Densidad Visual del Calendario (Grid Visual Density)**:
    - Selector en *Ajustes > Aspecto* que calibra el espaciado, acolchado y altura de las celdas del calendario: *Compacta* (mayor cantidad de meses y semanas visibles a la vez), *Estándar* (equilibrio ideal) y *Espaciosa* (celdas amplias con mayor legibilidad de notas y eventos).
  - **6. Citas Motivacionales Diarias Offline Deterministas (Daily Motivational Quotes)**:
    - Banco local bilingüe de 31 reflexiones inspiradoras sobre constancia, disciplina, foco y descanso.
    - Selección determinista calculada por día calendario (`App.I18n.getDailyQuote(dateKey)`) integrada con tarjeta de diseño elegante en el panel del día seleccionado.
    - Conmutador conmutable en *Ajustes > Aspecto* para mostrar u ocultar la tarjeta según la preferencia del usuario.
- **Overhaul Exhaustivo de Traducción Bilingüe (Español & English)**:
  - Sistema de internacionalización 100% bilingüe implementado en absolutamente todos los textos de la interfaz de usuario:
    - Navegación del dock principal, controles y títulos del calendario, leyendas y selector de meses.
    - Panel lateral del día: asignaturas, materias, bloques de foco, notas, valoración por estrellas y citas.
    - Tracker de hábitos: cabeceras, botones de navegación, tarjeta de tendencia, matriz diaria, análisis semanal, histórico y ranking dinámico.
    - Perfil de usuario y ajustes: cabecera hero, selectores de perfil, pestañas multinivel, todas las secciones de configuración (Identidad, Aspecto, Metas, Materias, Cursos, Disco, Acerca de).
    - Modales emergentes: materias, hobbies, periodos académicos, eventos, tareas, detalles de tarea, hábitos, plantillas de perfil e informes.
    - Badges e insignias de rendimiento, estados de ánimo y toasts de confirmación.
  - Preservación estricta de marcas y elementos de identidad no traducibles: `"LOG CALENDAR"` y `"LOG is LOG of Growth"`, así como los nombres propios introducidos por el usuario.
- **Persistencia Física Local-First en Disco (File System Access API)**:
  - Capacidad nativa para conectar una carpeta local en el disco duro mediante `window.showDirectoryPicker` y persistir automáticamente todos los datos en archivos físicos JSON (`settings.json`, `calendar.json`, `tasks.json`, `tracker.json`, `manifest.json`) y subdirectorio de documentos (`documents/avatar.png`).
  - Almacenamiento seguro del puntero de directorio (`FileSystemDirectoryHandle`) en IndexedDB (`DEFLOG_Storage_v1`) para reconexión silenciosa y transparente tras recargar la página.
  - Sincronización continua desacoplada con fallback automático a `localStorage` para navegadores o entornos sin soporte de FS Access API, garantizando 100% de operatividad y cero dependencias npm.
- **Dock Lateral de Perfil con Subnavegación Multinivel**:
  - Sustitución de listas monolíticas de ajustes por una navegación lateral ergonómica de 2 niveles integrada en la vista de perfil:
    - **Nivel 1**: Conmutación principal entre `⚙️ Ajustes` e `📊 Informe`.
    - **Nivel 2 (Ajustes)**: Particionado estricto de tarjetas donde **solo una tarjeta está visible a la vez** (`👤 Identidad`, `🎨 Aspecto`, `⏱️ Metas`, `📚 Materias`, `📅 Cursos`, `💾 Disco`, `ℹ️ Acerca`), con botón `↩️ Menú` para volver al nivel 1.
    - **Nivel 2 (Informe)**: Conmutación entre `📚 Estudio` y `📋 Hábitos`, sincronizada con los pills superiores de categoría.
- **Sistema de Iluminación Hover Exclusiva**:
  - Al situar el cursor sobre cualquier pestaña de navegación del dock o sobre los pills de categoría (`📚 Estudio` vs `📋 Hábitos`), únicamente el elemento activo bajo el cursor se ilumina intensamente con el color de acento y resplandor, mientras las pestañas inactivas se mantienen atenuadas sin interferencias visuales ni parpadeos.
- **Subida y Gestión de Foto de Perfil Propia**:
  - Soporte para subir fotos de avatar personalizadas (`image/*`) desde el disco con previsualización instantánea.
  - Almacenamiento dual: en base64 DataURL en el estado local y como archivo físico binario `documents/avatar.png` en la carpeta física conectada.
  - Campos de ocupación/rol y enfoque actual / biografía configurables y sincronizados en tiempo real en la cabecera hero del perfil.
- **Calibración y Selector de Sensibilidad del Trackpad**:
  - Nuevo selector en *Ajustes > Aspecto & Visualización* (`🎛️ Sensibilidad del trackpad`) con 3 perfiles configurables: *Baja (Gesto amplio)*, *Media (Recomendada / por defecto)* y *Alta (Sensible)*.
  - Eliminación de saltos dobles accidentales: ampliación del cooldown de inercia a 800ms (frente a 380ms) y absorción activa de la desaceleración cinética del trackpad.
- **Sistema Integral de Internacionalización Bilingüe (Español & English)**:
  - Creación del módulo centralizado `js/core/i18n.js` con diccionarios completos para toda la aplicación (navegación del dock, cabeceras, mapa de horas, leyendas, modales, tracker de rutinas, checklist, pestañas y ajustes).
  - Selector de idioma en *Ajustes > Aspecto* (`🌐 Idioma de la aplicación`), persistente por perfil y con conmutación reactiva en caliente sin recargar la página.
  - Traducción exhaustiva del sistema de analítica avanzada: base de conocimiento completa en inglés para las 16 métricas de estudio y hábitos (`INSIGHTS_KNOWLEDGE_BASE_EN`), abarcando explicaciones, diagnósticos en tiempo real, consejos contextuales y escenarios clasificados.
  - Localización nativa mediante `Intl` de meses, días de la semana y marcas de tiempo relativas ("hace un momento" / "just now", "hoy a las" / "today at").
- **Perfil de Demostración Preconfigurado Permanente (`Perfil de Ejemplo`)**:
  - Integración en código de un perfil modelo inmutable (`demo`) siempre disponible en el selector multi-perfil.
  - Precargado con datos didácticos y genéricos (Matemáticas Básicas, Historia Universal, Idiomas, Lógica & Pensamiento Crítico; hábitos de agua, lectura, ejercicio y planificación; tareas y cheques mensuales).
  - Protegido contra borrado accidental y renombrado, ideal para mostrar la aplicación o probar funcionalidades sin comprometer información personal de la carrera.
- **Depuración Estética de Cabecera**:
  - Eliminación definitiva del elemento ceja `"Tracker local"` sobre el título principal para consolidar una cabecera minimalista y limpia.
- **Circuito Cerrado Bidireccional de Navegación por Gestos de Trackpad**:
  - Conexión cíclica continua entre las 3 vistas principales (`Calendario` <-> `Tracker` <-> `Perfil`), permitiendo envolver la navegación tanto al deslizar a la izquierda como a la derecha sin topar con finales cerrados:
    - En `Perfil`: deslizar a la derecha navega a `Calendario`; deslizar a la izquierda navega a `Tracker`.
    - En `Calendario`: deslizar a la derecha navega a `Tracker`; deslizar a la izquierda navega a `Perfil`.
    - En `Tracker`: deslizar a la derecha navega a `Perfil`; deslizar a la izquierda navega a `Calendario`.
  - **Selector Conmutable de Sentido Invertido (Toggle Switch)**: Nuevo control en *Ajustes > Aspecto & Visualización* (`🔄 Invertir sentido del trackpad`) para invertir la dirección lógica del deslizamiento según la preferencia ergonómica del usuario. Persistente por perfil.
- **Optimización y Simetría del Gráfico Semanal con Panel de Digest Ejecutivo**:
  - Reequilibrio espacial de la tarjeta de comparativa semana a semana con un layout de dos columnas que incluye un panel de métricas ejecutivas digest (Semana pico 🏆, Media semanal 📊, Consistencia de metas 🎯 y Barra de reparto porcentual de dedicación ⚖️), equilibrando perfectamente la altura y simetría junto a la tarjeta de Diversificación Radial.
- **Dock Liquid Glass de 3 botones principales**:
  - Reemplazo del botón "Inicio" por el acceso directo a **Perfil** (`👤 #tabProfile`), consolidando una barra de navegación inferior limpia y minimalista con exactamente 3 secciones: **Calendario**, **Tracker** y **Perfil**.
- **Dashboard Completo de Perfil (`#paneProfileMain`)**:
  - Nueva vista a página completa que sustituye las ventanas emergentes y modales superpuestos por un espacio de control directivo integrado.
  - Tarjeta principal de héroe (Hero Card) con avatar de usuario, nombre de perfil editable, subtítulo y badges de estado.
  - Sección dedicada de "Acerca de la Aplicación" en Ajustes que aloja la información de versión y arquitectura.
- **Motor Multi-Perfil con Almacenamiento Aislado**:
  - Soporte completo para múltiples perfiles de usuario con espacios de almacenamiento totalmente independientes (`LOG-calendar-profile-state-<id>`).
  - Manifiesto dinámico de perfiles (`log_calendar_profiles_manifest-v1`) con gestión de perfil activo (`log_calendar_active_profile_id`).
  - Operaciones CRUD directas desde la cabecera de perfil: conmutador desplegable, creación de nuevos perfiles (`+ Nuevo`), renombrado rápido (`✎ Renombrar`) y borrado seguro (`🗑 Borrar`) con protección para preservar siempre al menos un perfil activo.
  - Migración transparente y retrocompatible de datos existentes sin pérdida de información y compatibilidad total con exportación/importación JSON.
- **Informe Avanzado de Rendimiento (Estudio & Calendario)**:
  - Ribón de KPIs ejecutivos interactivos: Puntuación Global (0-100), Índice de Regularidad (fórmula simplificada sin términos matemáticos confusos), Meta Diaria configurada y Tendencia Semanal (WoW).
  - Acceso directo a configuración de metas desde la tarjeta de Objetivo Diario.
  - Gráfico de barras SVG de comparativa semana a semana (Estudio vs Hobbies) con etiquetas limpias y tira interactiva al pasar el cursor.
  - Gráfico de diversificación y equilibrio radial (Donut SVG) con reparto porcentual entre materias y proyectos.
  - Correlación visual de energía/ánimo (1 a 5 ★) vs dedicación real en horas.
  - Patrón semanal de trabajo con identificación automática de días pico de productividad.
  - Matriz de diagnóstico estratégico por asignatura cruzando recencia, dificultad y tareas atrasadas.
  - Tres directrices estratégicas accionables de crecimiento calculadas según los patrones reales del usuario.
- **Módulo de Analítica Avanzada para el Tracker de Hábitos**:
  - Selector superior de categorías en el Informe Avanzado para conmutar al instante entre `📚 Estudio & Calendario` y `📋 Hábitos & Tracker`.
  - Tasa de adherencia global a rutinas (%) comparando hábitos completados vs compromisos programados.
  - Índice de racha media activa y racha máxima consecutiva.
  - Comparativa de evolución de hábitos semanal (WoW) con diferencial de checks.
  - Identificación automática de Hábito Estrella (mayor fidelidad) y Hábito en Riesgo para aplicar la técnica del hábito ancla.
  - Gráfico de barras SVG de cumplimiento semanal de rutinas.
  - Distribución de hábitos por día de la semana para detectar desconexión en fines de semana.
  - Matriz de Salud de Hábitos con barras de progreso, racha actual y badges de estado ("Consolidado", "En Progreso", "En Riesgo").
  - Tres directrices estratégicas accionables de rutinas orientadas a proteger rachas y reducir fricción.
- **Dinamización Interactiva del Modal de Detalle de Métricas (`#insightsDetailModal`)**:
  - Sustitución de los bloques estáticos de texto por un sistema dinámico de 3 pestañas:
    - `📖 Significado`: Explicación didáctica del propósito de la métrica.
    - `🔍 Tu Diagnóstico`: Evaluación en tiempo real de tu puntuación con frase diagnóstica y consejo clave.
    - `💡 Escenarios & Consejos`: Desglose clasificado por niveles con recomendaciones específicas.
  - Vinculación interactiva de todas las tarjetas métricas (tanto de Calendario como de Tracker).
- **Enlace Directo y Simplificación de Estadísticas en Calendario**:
  - Los accesos del panel de calendario (`#moreStatsBtn` "Ver más / análisis completo", `#statsHeaderTitle` y las pastillas métricas `#statPillGrandTotal` y `#statPillWeightedLoad`) navegan directamente a la vista de `Perfil > Informe Avanzado > Estudio & Calendario`, con transición fluida a pantalla completa y sin modales emergentes.
  - Se eliminó el botón redundante de "Informe Avanzado" en la cabecera del calendario para maximizar la limpieza visual y el minimalismo de la barra superior.
- **Persistencia de la Vista Activa entre Sesiones**:
  - Almacenamiento automático en `localStorage` de la última pestaña visitada (`Calendario`, `Tracker` o `Perfil`). Al recargar la página o volver a abrir la aplicación, el usuario regresa exactamente a la vista en la que se encontraba en lugar de reiniciar siempre en el Calendario.

### Fixed
- **Subsanación de Errores de Consola JavaScript y Arranque**:
  - `ReferenceError: Cannot access 'isEn' before initialization`: Eliminada la variable sombreada `isEn` dentro del bucle de tarjetas de historial en `tracker.js`, restaurando el renderizado de tarjetas mensuales sin interrupciones.
  - `ReferenceError: addNewTaskBtn is not defined`: Encapsulado seguro mediante `document.getElementById` en `main.js` para botones y controles del DOM legado.
  - `TypeError: Cannot read properties of undefined (reading 'getDefaultDifficultyMap')`: Reordenada la carga de scripts en `index.html` colocando `tasks.js` antes de `storage.js` e implementada comprobación defensiva en `createFallbackState`.
- **Detección Exhaustiva de Meses con Datos en el Tracker**:
  - Sustituida la búsqueda fija de meses previos por `getMonthsWithDataList`, que analiza de manera exhaustiva todas las claves de `monthlyChecks` tanto anteriores como posteriores ("meses ya sea antes o después").
  - Compatibilidad de lectura con claves normalizadas con y sin cero inicial (`YYYY-M` y `YYYY-MM`), garantizando que meses activos como Septiembre se visualicen sin necesidad de ocultar meses vacíos a mano.
- **Calibración Perceptiva de Gradiente de Estudio y Contraste de Texto**:
  - Sustitución de mezclas de color oscuras que producían tonos marrones/olivas apagados sobre temas oscuros y OLED por capas de alfa puro (`rgba(r, g, b, alpha)`), logrando un resplandor limpio y vibrante que respeta el matiz elegido (ej. oro/ámbar luminoso al usar acento amarillo).
  - Ampliación de `App.Utils.needsLightText` para soportar formatos `rgba()`, asignando texto entintado oscuro (`#0f172a`) en celdas de máxima intensidad luminosa (ej. amarillo) y texto blanco nítido (`#ffffff`) en celdas de tonalidad profunda o fondos oscuros.
- **Limpieza de Histórico de Meses Anteriores en Tracker**:
  - Ocultación automática y total de la tarjeta *Resúmenes de meses anteriores* (`#routineHistoryCard`) si no existen meses previos con cheques de hábitos registrados.
  - Si existen datos de 1 o más meses previos, se renderizan únicamente aquellos meses que realmente contienen actividad, eliminando la precarga de meses vacíos desde enero al iniciar un perfil limpio.
- **Localización Completa y Dinámica de Meses y Tracker**:
  - Sustitución del formateo estático en español (`es-ES`) por localización dinámica (`App.I18n.getLocale()`) en `formatMonthKeyTitle`, adaptando dinámicamente nombres de meses (ej. `"OCTOBER 2026"` en inglés vs `"OCTUBRE 2026"` en español) e iniciales de días de la semana en la tabla matriz.
  - Traducción al inglés de tooltips de días objetivo, badges de tendencia, estados vacíos y botones de acción.
- **Persistencia Robusta de Foto de Perfil y Retirada del Badge de Cámara**:
  - Eliminado el icono flotante de cámara (`📷`) sobre el avatar de perfil, ofreciendo un acabado visual estático y limpio.
  - Subsanada la pérdida de la foto de avatar personalizada y campos biográficos tras recargar la aplicación: `App.Tasks.normalizeProfile` ahora preserva íntegramente `avatarData`, `role` y `bio` durante las sincronizaciones del estado local.
- **Eliminación de Etiqueta Redundante "Local-First" en Perfil**:
  - Retirada la pastilla/badge `.profile-status-pill` situada junto al nombre del perfil en la tarjeta hero principal, logrando una cabecera visualmente más sobria y despejada.
- **Problema 1: Optimización de Altura y Escala en Gráfico de Comparativa Semanal**:
  - Resuelto el desaprovechamiento de espacio vertical en la tarjeta de *Comparativa Semana a Semana* en Perfil > Informe.
  - Sin alterar las dimensiones externas del contenedor de la tarjeta ni descompensar el grid, se aumentó la escala vertical del gráfico SVG (`viewBox="0 0 760 340"` con `268px` de altura de trazado útil frente a los `160px` anteriores) y se dotó al contenedor de flexión y estiramiento activo (`height: 100%`, `min-height: 290px`, `max-height: 360px`).
  - Las 4 tarjetas de métricas del panel lateral digest (`.weekly-metric-box`) ahora se expanden de forma equidistante con `flex: 1` y `align-items: stretch`, eliminando el espacio muerto inferior.
- **Problema 2: Contraste de Texto y Legibilidad en Celdas del Calendario en Modos Oscuros**:
  - Corregido el problema donde celdas con registros de estudio mostraban fondos claros/pasteles con texto blanco o pálido ilegible.
  - Implementación de `HEATMAP_PALETTES_DARK` con tonalidades profundas y saturadas optimizadas para fondos oscuros (`[data-theme="dark"]` y `[data-theme="oled"]`).
  - Cálculo de contraste perceptivo dinámico (`App.Utils.needsLightText(color)`) en `createDayCell` y `refreshDayCell`: asignación forzosa de clase `.dark-day` (texto `#ffffff`) o `.light-day` (texto `#0f172a`), garantizando contraste perfecto y legibilidad absoluta sin importar la paleta o tema elegido.
  - Solucionada la regla de anulación en OLED que impedía renderizar los colores de calor en las celdas.
  - Corregida la clave raw `calendar.noEvents` en el panel de eventos del día.
- **Traducción Integral de Bloques Estadísticos Dinámicos**:
  - Localización bilingüe (ES/EN) de la totalidad de las tarjetas y métricas de analítica avanzada en `stats.js` (tarjetas de Ritmo, Asignaturas/Hobbies, Semana, Riesgos, Preparación Real, Señales para Actuar, Análisis Profundo, rankings y consejos estratégicos de Lectura Rápida) y `tracker.js` (análisis semanal e histórico mensual).
- **Navegación del Dock Principal**:
  - Corregido el registro de eventos en `dock.js` donde los botones de `Calendario` y `Tracker` no respondían a los clics del usuario debido a la ausencia de listeners de delegación a `App.Tracker.switchView`.
- **Gestos de Trackpad con Dos Dedos**:
  - Adjuntado el listener de eventos `wheel` sobre `window` en `initRoutineTrackerEvents` para reanudar el deslizamiento horizontal entre vistas.
  - Protección de llamadas a `event.preventDefault()` con comprobación `event.cancelable` para evitar violaciones de rendimiento y excepciones por eventos pasivos de desplazamiento del navegador.
- **Fluidez y Atasco en la Animación de Transición de Vistas**:
  - Solucionado el problema donde la animación entre vistas se quedaba pillada o congelada. Se implementó un forzado de reflow síncrono (`void el.offsetWidth`) y limpieza garantizada de las clases CSS `view-transition-forward` y `view-transition-back` mediante temporizador desacoplado de 240 ms.
- **Blindaje Null-Safe Crítico en Renderizado y Arranque (`checklistTasks`)**:
  - Corregida la excepción fatal `Uncaught TypeError: Cannot read properties of null (reading 'checklistTasks')` en `calendar.js` (línea 164) que congelaba la ejecución de JavaScript e impedía que los botones de navegación se enlazaran.
  - Carga síncrona inmediata de `App.Storage.loadState()` en el inicio de `main.js` y asignación de estado de reserva predeterminado en `storage.js`, erradicando cualquier periodo donde `App.State.state` pudiera ser nulo.
  - Blindaje con encadenamiento opcional (*optional chaining*) en todas las referencias a `checklistTasks` en `calendar.js`, `tasks.js`, `stats.js`, `tracker.js`, `storage.js` y `main.js`.
- **Blindaje Null-Safe contra Excepciones `Cannot read properties of null (reading 'split')`**:
  - `App.Utils.parseKey`: validación robusta ante claves nulas o indefinidas con retorno seguro de tuplas numéricas válidas.
  - `tasks.js`: comprobación estricta de cadenas antes de invocar `.split('T')` en `completedAt`, parsing seguro de enlaces vinculados a tareas (`taskLinkEl` y `checklistTaskLinkEl`) y clave de proyecto más exigente (`mostDemandingKey`).
  - `tracker.js`: control null-safe en claves de mes (`shiftMonthKey`, `formatMonthKeyTitle`, `getRoutineMonthStats`, `renderRoutineTracker`) para evitar caídas ante estados no inicializados.
  - Protección ante elementos ausentes en el DOM (`taskStatsChartEl.innerHTML`).
- **Eliminación del Aviso de Origen Único en Chromium (`file:///`)**:
  - Retirada la meta-etiqueta restrictiva Content-Security-Policy en `index.html` que causaba la advertencia `Unsafe attempt to load URL file:///... 'file:' URLs are treated as unique security origins` al abrir el archivo en local mediante doble clic, asegurando consola limpia e interoperabilidad total.
- **Detección de Soporte de File System Access API**:
  - Corregida la discordancia de nomenclatura en `storage.js` (`supported` vs `isFsSupported` y `connected` vs `isConnected`) que causaba que el botón de conexión apareciese erróneamente deshabilitado.
  - Detección explícita del protocolo `file:///` con mensajes claros en la interfaz indicando la disponibilidad inmediata y segura de `localStorage` para almacenamiento persistente.

### Changed
- **Gran Refactorización Arquitectural Modular**:
  - Transición completa desde una estructura monolítica a una arquitectura modular desacoplada de 4 capas:
    - `core/`: `constants.js`, `utils.js`, `state.js`
    - `infrastructure/`: `storage.js`
    - `features/`: `calendar.js`, `tracker.js`, `tasks.js`, `stats.js`, `insights.js`, `periods.js`, `settings.js`
    - `ui/`: `theme.js`, `dock.js`, `day-panel.js`
    - Entrypoint: `main.js`
  - Eliminación del modal flotante restrictivo de Ajustes; la configuración ahora reside en una vista dedicada, espaciosa y ergonómica.
  - Actualización de la versión del sistema a **v4.0.0** en `constants.js`, `index.html` y documentación oficial.

### Security
- **Aislamiento Local-First Absoluto**:
  - Cero conexiones a servidores remotos, cero analíticas, cero rastreadores y cero telemetría.
  - Compatibilidad completa y persistente en modo desconectado (offline).
- **Seguridad y Privacidad de la Web Audio API**:
  - La síntesis de sonido háptico mecánico (`App.Sound`) se realiza 100% en local y en memoria RAM del navegador a través de osciladores nativos (`OscillatorNode`, `GainNode`).
  - No descarga archivos de audio externos, no realiza peticiones HTTP/WebSocket, no almacena datos de audio y no expone ninguna API de micrófono ni captura de audio.
  - 100% seguro para uso privado en disco local y 100% seguro para commitear y subir a GitHub público sin riesgo alguno de fuga de datos ni llaves de acceso.
- **Blindaje contra Cross-Site Scripting (XSS)**:
  - Sanitización universal de entradas de usuario (nombres de perfil, asignaturas, notas, hábitos, tareas) mediante `App.Utils.escapeHtml`.
- **Protección de Almacenamiento e Integridad**:
  - Prevención de contaminación de prototipos y validación estricta de esquemas al importar copias de seguridad JSON.
  - Generación de identificadores de perfil únicos mediante marcas de tiempo y entropía pseudoaleatoria (`Date.now() + Math.random()`).
- **Compatibilidad con Entornos Restringidos**:
  - Funcionamiento transparente tanto bajo el sandbox de `file:///` como en entornos HTTP locales autenticados (`http://localhost:8080`).


## [3.3.0] - 2026-10-11

### Added
- **Persistencia Física Local-First en Disco (File System Access API)**:
  - Capacidad nativa para conectar una carpeta local en el disco duro mediante `window.showDirectoryPicker` y persistir automáticamente todos los datos en archivos físicos JSON (`settings.json`, `calendar.json`, `tasks.json`, `tracker.json`, `manifest.json`) y subdirectorio de documentos (`documents/avatar.png`).
  - Almacenamiento seguro del puntero de directorio (`FileSystemDirectoryHandle`) en IndexedDB (`DEFLOG_Storage_v1`) para reconexión silenciosa y transparente tras recargar la página.
  - Sincronización continua desacoplada con fallback automático a `localStorage` para navegadores o entornos sin soporte de FS Access API, garantizando 100% de operatividad y cero dependencias npm.
- **Dock Lateral de Perfil con Subnavegación Multinivel**:
  - Sustitución de listas monolíticas de ajustes por una navegación lateral ergonómica de 2 niveles integrada en la vista de perfil:
    - **Nivel 1**: Conmutación principal entre `⚙️ Ajustes` e `📊 Informe`.
    - **Nivel 2 (Ajustes)**: Particionado estricto de tarjetas donde **solo una tarjeta está visible a la vez** (`👤 Identidad`, `🎨 Aspecto`, `⏱️ Metas`, `📚 Materias`, `📅 Cursos`, `💾 Disco`, `ℹ️ Acerca`), con botón `↩️ Menú` para volver al nivel 1.
    - **Nivel 2 (Informe)**: Conmutación entre `📚 Estudio` y `📋 Hábitos`, sincronizada con los pills superiores de categoría.
- **Sistema de Iluminación Hover Exclusiva**:
  - Al situar el cursor sobre cualquier pestaña de navegación del dock o sobre los pills de categoría (`📚 Estudio` vs `📋 Hábitos`), únicamente el elemento activo bajo el cursor se ilumina intensamente con el color de acento y resplandor, mientras las pestañas inactivas se mantienen atenuadas sin interferencias visuales.
- **Subida y Gestión de Foto de Perfil Propia**:
  - Soporte para subir fotos de avatar personalizadas (`image/*`) desde el disco con previsualización instantánea.
  - Almacenamiento dual: en base64 DataURL en el estado local y como archivo físico binario `documents/avatar.png` en la carpeta física conectada.
  - Campos de ocupación/rol y enfoque actual / biografía configurables y sincronizados en tiempo real en la cabecera hero del perfil.
- **Circuito Cerrado de Navegación por Gestos de Trackpad**:
  - Conexión cíclica continua entre las 3 vistas principales (`Calendario` <-> `Tracker` <-> `Perfil`), permitiendo envolver la navegación tanto al deslizar a la izquierda como a la derecha sin topar con finales cerrados:
    - En `Perfil`: deslizar a la derecha navega a `Calendario`; deslizar a la izquierda navega a `Tracker`.
    - En `Calendario`: deslizar a la derecha navega a `Tracker`; deslizar a la izquierda navega a `Perfil`.
    - En `Tracker`: deslizar a la derecha navega a `Calendario`; deslizar a la izquierda navega a `Perfil`.
- **Optimización y Simetría del Gráfico Semanal con Panel de Digest Ejecutivo**:
  - Reequilibrio espacial de la tarjeta de comparativa semana a semana con un layout de dos columnas que incluye un panel de métricas ejecutivas digest (Semana pico 🏆, Media semanal 📊, Consistencia de metas 🎯 y Barra de reparto porcentual de dedicación ⚖️), equilibrando perfectamente la altura y simetría junto a la tarjeta de Diversificación Radial.
- **Dock Liquid Glass de 3 botones principales**:
  - Reemplazo del botón "Inicio" por el acceso directo a **Perfil** (`👤 #tabProfile`), consolidando una barra de navegación inferior limpia y minimalista con exactamente 3 secciones: **Calendario**, **Tracker** y **Perfil**.
  - Navegación fluida por gestos táctiles en trackpad sincronizada bidireccionalmente.
- **Dashboard Completo de Perfil (`#paneProfileMain`)**:
  - Nueva vista a página completa que sustituye las ventanas emergentes y modales superpuestos por un espacio de control directivo integrado.
  - Tarjeta principal de héroe (Hero Card) con avatar de usuario, nombre de perfil editable, subtítulo y badges de estado.
  - Sección dedicada de "Acerca de la Aplicación" en Ajustes que aloja la información de versión y arquitectura.
- **Motor Multi-Perfil con Almacenamiento Aislado**:
  - Soporte completo para múltiples perfiles de usuario con espacios de almacenamiento totalmente independientes (`LOG-calendar-profile-state-<id>`).
  - Manifiesto dinámico de perfiles (`log_calendar_profiles_manifest-v1`) con gestión de perfil activo (`log_calendar_active_profile_id`).
  - Operaciones CRUD directas desde la cabecera de perfil: conmutador desplegable, creación de nuevos perfiles (`+ Nuevo`), renombrado rápido (`✎ Renombrar`) y borrado seguro (`🗑 Borrar`) con protección para preservar siempre al menos un perfil activo.
  - Migración transparente y retrocompatible de datos existentes sin pérdida de información y compatibilidad total con exportación/importación JSON.
- **Informe Avanzado de Rendimiento (Estudio & Calendario)**:
  - Ribón de KPIs ejecutivos interactivos: Puntuación Global (0-100), Índice de Regularidad (fórmula simplificada sin términos matemáticos confusos), Meta Diaria configurada y Tendencia Semanal (WoW).
  - Acceso directo a configuración de metas desde la tarjeta de Objetivo Diario.
  - Gráfico de barras SVG de comparativa semana a semana (Estudio vs Hobbies) con etiquetas limpias y tira interactiva al pasar el cursor.
  - Gráfico de diversificación y equilibrio radial (Donut SVG) con reparto porcentual entre materias y proyectos.
  - Correlación visual de energía/ánimo (1 a 5 ★) vs dedicación real en horas.
  - Patrón semanal de trabajo con identificación automática de días pico de productividad.
  - Matriz de diagnóstico estratégico por asignatura cruzando recencia, dificultad y tareas atrasadas.
  - Tres directrices estratégicas accionables de crecimiento calculadas según los patrones reales del usuario.
- **Módulo de Analítica Avanzada para el Tracker de Hábitos**:
  - Selector superior de categorías en el Informe Avanzado para conmutar al instante entre `📚 Estudio & Calendario` y `📋 Hábitos & Tracker`.
  - Tasa de adherencia global a rutinas (%) comparando hábitos completados vs compromisos programados.
  - Índice de racha media activa y racha máxima consecutiva.
  - Comparativa de evolución de hábitos semanal (WoW) con diferencial de checks.
  - Identificación automática de Hábito Estrella (mayor fidelidad) y Hábito en Riesgo para aplicar la técnica del hábito ancla.
  - Gráfico de barras SVG de cumplimiento semanal de rutinas.
  - Distribución de hábitos por día de la semana para detectar desconexión en sábados y domingos.
  - Matriz de Salud de Hábitos con barras de progreso, racha actual y badges de estado ("Consolidado", "En Progreso", "En Riesgo").
  - Tres directrices estratégicas accionables de rutinas orientadas a proteger rachas y reducir fricción.
- **Dinamización Interactiva del Modal de Detalle de Métricas (`#insightsDetailModal`)**:
  - Sustitución de los antiguos bloques estáticos de texto por un sistema dinámico de 3 pestañas:
    - `📖 Significado`: Explicación didáctica del propósito de la métrica.
    - `🔍 Tu Diagnóstico`: Evaluación en tiempo real de tu puntuación con frase diagnóstica y consejo clave.
    - `💡 Escenarios & Consejos`: Desglose clasificado por niveles con recomendaciones específicas.
  - Vinculación interactiva de todas las tarjetas métricas (tanto de Calendario como de Tracker).
- **Enlace Directo de Análisis Completo en Calendario**:
  - El botón `#moreStatsBtn` ("Ver más / análisis completo") del panel lateral del calendario ahora navega directamente a la pestaña `Informe Avanzado` del Perfil, unificando la experiencia y eliminando modales redundantes.

### Changed
- Refactorización integral de la arquitectura hacia una estructura modular estricta dividida en `core/`, `infrastructure/`, `features/` y `ui/`, eliminando código monolítico y mejorando la mantenibilidad a largo plazo.
- Eliminación del modal flotante restrictivo de Ajustes; la configuración ahora reside en una vista dedicada, espaciosa y ergonómica.
- Actualización de la versión del sistema a **v3.3.0** en `constants.js`, `index.html` y documentación.

### Security
- Persistencia física local-first sin intermediación de servidores externos ni telemetría: los datos permanecen 100% bajo control físico del usuario en su propio equipo.
- Sanitización estricta de todas las entradas del usuario (nombres de perfil, hábitos, notas, asignaturas) mediante `App.Utils.escapeHtml` para blindaje integral contra ataques Cross-Site Scripting (XSS).
- Validación robusta de esquemas durante la importación de archivos de respaldo JSON con validación de tipo y claves para prevenir contaminación de prototipos e inyección de datos corruptos.
- Manejo seguro de identificadores de perfil (`profile-<timestamp>-<random>`) generados localmente sin colisiones.
- Ejecución 100% local en entorno cliente, compatible con el protocolo `file:///` sin requerir conexión externa ni dependencias de terceros.

## [3.2.3] - 2026-10-08

### Added
- **Indicador dinámico de última actualización en la cabecera**: nuevo indicador en la esquina superior derecha (lado opuesto del título principal) con tipografía fina y discreta que muestra en tiempo real cuándo fue la última vez que se introdujo un dato en la aplicación.
  - Identifica con precisión la sección y el elemento modificado: si fue en el Calendario (detallando la asignatura o hobby concreto, nota del día, valoración o evento), en el Tracker (detallando el hábito marcado o editado) o en Tareas.
  - Contador dinámico de tiempo relativo que se actualiza periódicamente ("hace un momento", "hace 5 min", "hoy a las..."), con punto de estado verde esmeralda que emite un pulso suave al guardar y tooltip con fecha y hora completas al pasar el cursor.
  - Persistencia automática en el almacenamiento local y compatibilidad con copias de seguridad JSON.

## [3.2.2] - 2026-10-06

### Fixed
- **Conteo del cumplimiento global del Tracker**: el total refleja todos los días marcados en la matriz, incluso cuando se supera el objetivo. Cada hábito muestra sus registros frente a su objetivo mensual, igual que el ranking; los porcentajes se limitan al 100 %.

## [3.2.1] - 2026-10-03

### Added
- **Resumen histórico de meses anteriores en el Tracker**: nueva tarjeta en la columna principal del tracker que aprovecha el espacio disponible para mostrar los meses previos en un carrusel fluido con flechas de desplazamiento lateral, soporte nativo de gestos táctiles con dos dedos en trackpad, porcentaje de cumplimiento global, barra de progreso, ratio de hábitos completados, días activos, hábito estrella y tendencia interactiva hacia cada mes.
- **Ocultación y expansión dinámica de meses en el historial**: botón para descartar u ocultar meses individuales (`×`) con opción de restaurar meses ocultos. Si quedan pocos meses visibles (1 o 2), las tarjetas se expanden automáticamente para aprovechar todo el ancho disponible mostrando información enriquecida (top 3 hábitos con barras de progreso, desglose de mejor día y métricas adicionales), evitando cualquier hueco vacío.

## [3.1.1] - 2026-09-29

### Changed
- **Formato compacto en el calendario**: las horas de cada día se muestran como `2h 20'` o `45'` cuando está activo el formato de horas y minutos.

### Fixed
- **Contador de horas totales del día**: mostraba el total en decimal crudo (ej. `4,92`) en lugar de respetar el formato legible (`4 h 55 min`). Ahora usa `formatTime` y el layout apila las horas arriba y la etiqueta debajo.
- **Formato global en estadísticas y conteos**: total global, carga ponderada, medias diarias, mejor día, desglose por bloques/tierlists (asignaturas, deporte, hobbies), rankings avanzados e informes respetan de forma unificada el formato configurado (`hh:mm` o decimal).
- El tiempo de las asignaturas conserva el formato de entrada elegido (`hh:mm` o decimal) al actualizar el día seleccionado.

## [3.1.0] - 2026-09-27

### Added
- **Formato de registro de tiempo configurable** en Ajustes > Perfil: horas decimales (`1,5`) u horas y minutos normales (`1:30`) para asignaturas y hobbies.

### Changed
- Los totales y chips del panel diario respetan el formato elegido sin alterar los datos ni cálculos ya guardados.

### Fixed
- La matriz del Tracker conserva su desplazamiento horizontal al volver a la vista, actualizar una marca o recargar la aplicación.

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
