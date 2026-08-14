# Rastreador de estudios y hábitos

LOG es una pequeña aplicación web local para registrar tiempo de estudio, actividades extra, hábitos diarios, notas, eventos y valoraciones desde una vista de calendario y un tracker de rutinas mensual.

Es intencionalmente simple. No intenta reemplazar Notion, Google Calendar, un gestor de tareas ni un sistema completo de productividad. El objetivo es más acotado: llevar un registro rápido de lo que estudiaste, cuánto tiempo te tomó, qué solicitudes o fechas límite se acercan, cumplir tus hábitos del mes y verificar si tu balance de estudio actual tiene sentido.

---

## Qué hace

- **Seguimiento diario basado en calendario**: Registro de horas de estudio y actividad por día.
- **Horas por asignatura**: Organización del tiempo dedicado a cada materia.
- **Bloques opcionales de actividades extra (Hobbies)**: Registro de lectura, deporte o cualquier afición.
- **Notas y valoraciones diarias con estrellas**: Puntúa la productividad de tu jornada del 1 al 5.
- **Eventos importantes**: Solicitudes, fechas límite, avisos y recordatorios.
- **Exámenes vinculados**: Los eventos de examen pueden vincularse a una asignatura para calcular el riesgo académico.
- **Dificultad configurable**: Ajuste de dificultad (1 a 5) para cada asignatura.
- **Tracker de Rutinas y Hábitos Mensual (`📋 Tracker`)**:
  - Matriz mensual interactiva con cuadritos de registro inspirados en el gráfico de contribuciones (*commits*) de GitHub.
  - Edición directa de días objetivo desde la columna **OBJETIVO** de la propia tabla, sin necesidad de entrar a editar el hábito.
  - Gráfico de tendencia diaria en curva fluida y análisis semanal por barras.
  - Gráfico de dona (Donut Chart) con el porcentaje de cumplimiento mensual global y ranking Top 10 de rutinas.
- **Barra de navegación flotante**:
  - Pestañas para cambiar instantáneamente entre **`📅 Calendario`**, **`📋 Tracker`** y el botón **`🏠 Inicio`**.
  - Menú desplegable (*popover*) animado para Exportar, Importar (abriendo el selector de archivos del SO en ventana aparte) y acceder a Ajustes.
- **Gestor de tareas integrado (`Checklist`)**: Búsqueda avanzada, mini-calendario interactivo para filtrar vencimientos por fecha y análisis específicos de tareas.
- **Estadísticas avanzadas**: Totales, promedios, patrones por día de la semana y cálculo de riesgo académico.
- **Importación/exportación de una copia local en JSON**.

---

## Modelo de privacidad

Este proyecto **no tiene backend ni análisis**. Los datos se guardan exclusivamente en el navegador con `localStorage`.

Eso significa:

- Esta aplicación **no envía nada a un servidor**.
- Un reinicio o limpieza del navegador puede borrar tus datos.
- Utiliza el botón de **exportar** con regularidad para conservar copias de seguridad de tus datos importantes.
- Los archivos JSON exportados pueden contener registros personales, **así que no los subas al repositorio**.
- **La versión del repositorio está vacía a propósito**: no incluye registros de estudio, ni hábitos de prueba, ni calendarios personales, ni archivos de recuperación.

---

## Cómo usar

Abre `index.html` en un navegador web.

### Configuración típica:

1. Abre el menú **`🏠 Inicio`** en la barra flotante inferior y selecciona **Ajustes** (o el botón del engranaje).
2. Agrega tus asignaturas y asigna a cada una una dificultad del 1 al 5.
3. Agrega hobbies u otros bloques de actividad no relacionados con el estudio si quieres registrarlos.
4. Cambia a la vista **`📋 Tracker`** y usa **+ Añadir Hábito** para crear tus rutinas diarias (ej. Beber agua, Leer 20 min). Puedes cambiar los días objetivo directamente desde la celda de la columna **OBJETIVO**.
5. Selecciona un día en el calendario para registrar horas de estudio, notas, eventos y una valoración diaria.
6. Usa "Ver más" para revisar estadísticas más profundas.
7. Exporta una copia JSON desde `🏠 Inicio` cuando quieras conservar tus datos.

---

## Eventos y exámenes

Los eventos se crean desde una ventana modal.

- Cuando el tipo de evento es **Examen**, la aplicación pide la asignatura relacionada. Esto se usa en la sección de riesgo académico, así la aplicación no tiene que adivinarlo a partir del texto del evento.
- Si la asignatura aún no existe, se puede crear desde el mismo modal del evento.

---

## Tracker de Rutinas y Hábitos (`📋 Tracker`)

La vista de Tracker te permite llevar un control constante de tus hábitos mes a mes:

- **Cuadritos estilo GitHub**: Cada casilla marcada se rellena como un cuadrado sólido compacto con bordes redondeados y efecto hover interactivo.
- **Edición en línea de objetivos**: Modifica los días objetivo al mes directamente escribiendo sobre la celda de la columna `OBJETIVO` sin romper tu flujo de trabajo.
- **Análisis semanal e historia de tendencia**: Revisa tu curva de rendimiento diario y el desglose de cumplimiento semana a semana.

---

## Gestor de Tareas (Lista de verificación)

La versión integra un gestor de tareas completo que comparte la configuración de tus asignaturas y actividades registradas en el calendario.

### Características Principales:
- **Conmutador rápido**: Navega fluidamente usando la barra flotante inferior en lugar de botones pesados.
- **Relación Calendario-Checklist**: Puedes asociar cada tarea a una asignatura o actividad. La vista incluye un mini calendario interactivo a la derecha; al hacer clic en un día del calendario, la lista de tareas se filtra automáticamente para mostrar solo los vencimientos de esa fecha.
- **Buscador y filtros inteligentes**: Una barra de búsqueda avanzada con filtros superpuestos te permite buscar por texto o filtrar por asignaturas, aficiones, dificultad y estado (pendientes, completadas, atrasadas).
- **Métricas y estadísticas avanzadas (sección inferior)**:
  - **Racha de completado**: Días consecutivos logrando completar al menos una tarea.
  - **Vencimientos próximos**: Panel con las tareas programadas para los siguientes 7 días.
  - **Dificultad promedio**: Estimación de la carga de dificultad en tus tareas pendientes.
  - **Item más exigente**: Identificación dinámica de la asignatura o hobby con mayor volumen de trabajo pendiente.
- **Detalle de tareas**: Al hacer clic sobre cualquier tarea se abre una ventana modal con detalles (descripción larga, vinculación, dificultad y fecha límite).
- **Flujo de completado ágil**: El checkbox de la tarjeta de tarea permite marcarla como completada/pendiente con un clic directo. Las tareas completadas se atenúan de forma predeterminada para que puedas desmarcarlas si te equivocas.

---

## Riesgo académico

El ranking de "Riesgo académico" es una estimación, no una predicción. Combina:

- dificultad de la asignatura,
- horas ya estudiadas,
- cobertura estimada contra un objetivo simple,
- días restantes hasta el próximo examen vinculado.

La idea es resaltar lo que puede necesitar atención, no decidir lo que debes estudiar.

---

## Importación y exportación

El botón de exportar (ubicado dentro de `🏠 Inicio` en la barra inferior) descarga un respaldo JSON que contiene:

- asignaturas configuradas,
- dificultad de las asignaturas,
- bloques extra (hobbies),
- hábitos y marcas mensuales del tracker,
- registros diarios,
- notas,
- valoraciones,
- eventos personalizados,
- eventos predeterminados descartados,
- categorías de eventos personalizados.

El botón de importación abre una ventana del explorador de archivos para seleccionar ese formato exportado y restaurar el estado local.

---

## Notas de desarrollo

Esta aplicación **no usa frameworks complejos ni procesos de compilación**.

El código se organiza en algunas áreas prácticas:

- carga, normalización y guardado de estado,
- renderizado del calendario,
- edición del día seleccionado,
- tracker de hábitos con matriz mensual e histogramas SVG,
- creación y edición de eventos,
- ajustes,
- estadísticas,
- importación/exportación,
- ayudas de fecha y formato.

Como los datos del usuario se muestran en varios lugares, el texto que ingresa a plantillas HTML se escapa. El texto de eventos en el panel del día se renderiza con `textContent`.

---

## Limitaciones

- Los datos viven en un solo perfil del navegador a menos que exportes/importes.
- No hay sincronización automática entre dispositivos.
- El puntaje de riesgo es una heurística aproximada.
- El almacenamiento del navegador puede limpiarse por el usuario o por los ajustes del navegador.

---

## Guía de Instalación Rápida (Para todos los públicos)

No necesitas saber programar ni instalar nada raro para usar esta aplicación. Sigue estos sencillos pasos según tu sistema operativo.

### Paso 1: Descargar el proyecto
1. Ve a la parte superior de esta página de GitHub.
2. Busca el botón verde que dice **"Code"** y haz clic en él.
3. En el menú que se despliega, haz clic en **"Download ZIP"**.
4. Busca el archivo descargado en tu computadora y descomprímelo (clic derecho -> *Extraer todo*). Guarda esa carpeta en un lugar seguro donde no la vayas a borrar sin querer (por ejemplo, en tus *Documentos*).

---

### Paso 2: Configurar Acceso Directo (Opcional pero recomendado)

Para abrir el rastreador con un solo clic desde tu escritorio como si fuera una aplicación normal, sigue estos pasos:

#### En Windows (Windows 7, 10, 11)
1. Entra en la carpeta que acabas de descomprimir.
2. Busca el archivo llamado `index.html`.
3. Haz clic derecho sobre él.
4. En el menú, selecciona **"Mostrar más opciones"** (si estás en Windows 11) y luego haz clic en **"Enviar a" -> "Escritorio (crear acceso directo)"**.
5. Ve a tu escritorio, verás el nuevo acceso directo. Hazle clic derecho y dale a **"Propiedades"**.
6. En la pestaña *"Acceso directo"*, haz clic en el botón **"Cambiar icono..."**.
7. Haz clic en **"Examinar"**, entra en la carpeta del proyecto, ve a la carpeta `assets` y selecciona el archivo `logo_acceso_directo.ico`. ¡Listo! Ya tienes tu aplicación con su icono.

#### En macOS (Mac)
1. Abre la carpeta del proyecto en el Finder.
2. Mantén pulsadas las teclas **Alt (Opción)** y **Comando (⌘)** a la vez.
3. Haz clic en el archivo `index.html` y, sin soltar las teclas, arrástralo hasta tu Escritorio. Esto creará un alias (acceso directo).
4. Para cambiarle el icono: haz clic derecho sobre el acceso directo del escritorio y dale a **"Obtener información"**.
5. Abre la carpeta `assets` del proyecto, arrastra la imagen `logo_acceso_directo.png` y suéltala justo encima del iconito pequeño que sale arriba a la izquierda en la ventana de información.

#### En Linux (Ubuntu, Mint, etc.)
1. Ve a tu escritorio, haz clic derecho en un espacio vacío y selecciona **"Crear un lanzador" (Create Launcher)** o **"Crear enlace"**.
2. En el campo **Nombre**, ponle el título del proyecto (ej. *Study Tracker*).
3. En el campo **Comando o Destino**, haz clic en examinar y selecciona el archivo `index.html` de la carpeta del proyecto.
4. Haz clic en el icono por defecto que te da el sistema para cambiarlo, busca la carpeta `assets` y selecciona la imagen `logo_acceso_directo.png`.
