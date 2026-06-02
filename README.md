# Study Tracker

LOG es una pequeña app web local para registrar tiempo de estudio, actividades extra, notas, eventos y valoraciones diarias desde una vista de calendario.

Es intencionalmente simple. No intenta reemplazar Notion, Google Calendar, un gestor de tareas ni un sistema completo de productividad. El objetivo es más acotado: llevar un registro rápido de lo que estudiaste, cuánto tiempo te tomó, qué exámenes o fechas límite se acercan y si tu balance de estudio actual tiene sentido.

## Qué hace

- Seguimiento diario basado en calendario.
- Horas por asignatura.
- Bloques opcionales de actividades extra.
- Notas y valoraciones diarias con estrellas.
- Eventos importantes como exámenes, fechas límite y recordatorios.
- Los eventos de examen pueden vincularse a una asignatura.
- Se puede configurar la dificultad de cada asignatura.
- Estadísticas de totales, promedios, rachas, patrones por día de la semana y riesgo académico.
- Importación/exportación de una copia local en JSON.
- **Gestor de tareas integrado (Checklist)** (en la versión extendida), con búsqueda avanzada, mini-calendario mensual interactivo para filtrado y analíticas específicas de tareas.

## Modelo de privacidad

Este proyecto no tiene backend ni analíticas. Los datos se guardan en el navegador con `localStorage`.

Eso significa:

- Esta app no envía nada a un servidor.
- Un reinicio del navegador puede borrar tus datos.
- Usa el botón de exportar con regularidad si los datos importan.
- Los JSON exportados pueden contener registros personales, así que no los subas al repositorio.

La versión del repositorio está vacía a propósito: no incluye registros de estudio, ni calendarios personales, ni archivos de recuperación.

## Cómo usar

Abre `index.html` en un navegador.

Configuración típica:

1. Abre ajustes con el botón del engranaje.
2. Agrega tus asignaturas y asigna a cada una una dificultad del 1 al 5.
3. Agrega hobbies u otros bloques de actividad no relacionados con el estudio si quieres registrarlos.
4. Selecciona un día en el calendario.
5. Registra horas de estudio, notas, eventos y una valoración diaria.
6. Usa "Ver más" para revisar estadísticas más profundas.
7. Exporta una copia cuando quieras conservar tus datos.

## Eventos y exámenes

Los eventos se crean desde una ventana modal.

Cuando el tipo de evento es `Examen`, la app pide la asignatura relacionada. Esto se usa en la sección de riesgo académico, así la app no tiene que adivinarlo a partir del texto del evento.

Si la asignatura aún no existe, se puede crear desde el mismo modal del evento.

## Gestor de Tareas (Checklist)

La versión extendida en la carpeta `checklist-version/` integra un gestor de tareas completo que comparte la configuración de tus asignaturas y actividades registradas en el calendario.

### Características Principales:
- **Conmutador rápido:** Un botón flotante y difuminado en la parte inferior central permite alternar instantáneamente entre la vista de Calendario y la vista de Tareas (Checklist).
- **Relación Calendario-Checklist:** Puedes asociar cada tarea a una asignatura o actividad. La vista incluye un mini-calendario interactivo a la derecha; al hacer clic en un día del calendario, la lista de tareas se filtra automáticamente para mostrar solo los vencimientos de esa fecha.
- **Buscador y filtros inteligentes:** Una barra de búsqueda avanzada con filtros superpuestos te permite buscar por texto o filtrar por asignaturas, hobbies, dificultad y estado (pendientes, completadas, atrasadas).
- **Métricas y estadísticas avanzadas (sección inferior):**
  - **Racha de completado:** Días consecutivos logrando completar al menos una tarea.
  - **Vencimientos próximos:** Panel con las tareas programadas para los siguientes 7 días.
  - **Dificultad promedio:** Estimación de la carga de dificultad en tus tareas pendientes.
  - **Item más exigente:** Identificación dinámica de la asignatura o hobby con mayor volumen de trabajo pendiente.
- **Detalle de tareas:** Al hacer clic sobre cualquier tarea se abre una ventana modal con detalles (descripción larga, vinculación, dificultad y fecha límite).
- **Flujo de completado ágil:** El checkbox de la tarjeta de tarea permite marcarla como completada/pendiente con un clic directo. Las tareas completadas se atenúan de forma predeterminada para que puedas desmarcarlas si te equivocas.

## Riesgo académico

El ranking de "Riesgo académico" es una estimación, no una predicción. Combina:

- dificultad de la asignatura,
- horas ya estudiadas,
- cobertura estimada contra un objetivo simple,
- días restantes hasta el próximo examen vinculado.

La idea es resaltar lo que puede necesitar atención, no decidir lo que debes estudiar.

## Importación y exportación

El botón de exportar descarga un respaldo JSON que contiene:

- asignaturas configuradas,
- dificultad de las asignaturas,
- bloques extra,
- registros diarios,
- notas,
- valoraciones,
- eventos personalizados,
- eventos predeterminados descartados,
- categorías de eventos personalizadas.

El botón de importar acepta ese formato exportado y restaura el estado local.

No subas respaldos exportados a un repositorio público sin revisar su contenido.


## Notas de desarrollo

Esta app no usa frameworks. No hay paso de compilación.

El código se organiza en algunas áreas prácticas:

- carga, normalización y guardado de estado,
- renderizado del calendario,
- edición del día seleccionado,
- creación y edición de eventos,
- ajustes,
- estadísticas,
- importación/exportación,
- ayudas de fecha y formato.

Como los datos del usuario se muestran en varios lugares, el texto que entra a plantillas HTML se escapa. El texto de eventos en el panel del día se renderiza con `textContent`.

## Limitaciones

- Los datos viven en un solo perfil del navegador a menos que exportes/importes.
- No hay sincronización entre dispositivos.
- El puntaje de riesgo es una heurística aproximada.
- El almacenamiento del navegador puede limpiarse por el usuario o por ajustes del navegador.

## 🚀 Guía de Instalación Rápida (Para todos los públicos)

No necesitas saber programar ni instalar nada raro para usar esta aplicación. Sigue estos sencillos pasos según tu sistema operativo.

### Paso 1: Descargar el proyecto
1. Ve a la parte superior de esta página de GitHub.
2. Busca el botón verde que dice **"Code"** y haz clic en él.
3. En el menú que se despliega, haz clic en **"Download ZIP"**.
4. Busca el archivo descargado en tu ordenador y **descomprímelo** (clic derecho -> Extraer todo). Guarda esa carpeta en un lugar seguro donde no la vayas a borrar sin querer (por ejemplo, en tus Documentos).

---

### 2. Configurar Acceso Directo (Opcional pero recomendado)

Para abrir el tracker con un solo clic desde tu escritorio como si fuera una app normal, sigue estos pasos:

#### 🪟 En Windows (Windows 7, 10, 11)
1. Entra en la carpeta que acabas de descomprimir.
2. Busca el archivo llamado `index.html`.
3. Haz **clic derecho** sobre él.
4. En el menú, selecciona **"Mostrar más opciones"** (si estás en Windows 11) y luego haz clic en **"Enviar a" -> "Escritorio (crear acceso directo)"**.
5. Ve a tu escritorio, verás el nuevo acceso directo. Hazle clic derecho y dale a **"Propiedades"**.
6. En la pestaña "Acceso directo", haz clic en el botón **"Cambiar icono..."**.
7. Haz clic en **"Examinar"**, entra en la carpeta del proyecto, ve a la carpeta `assets` y selecciona el archivo de imagen que hay dentro. ¡Listo! Ya tienes tu app con su icono.

#### 🍏 En macOS (Mac)
1. Abre la carpeta del proyecto en el Finder.
2. Mantén pulsadas las teclas `Alt` (Option) y `Comando` (⌘) a la vez.
3. Haz clic en el archivo `index.html` y, **sin soltar las teclas**, arrástralo hasta tu Escritorio. Esto creará un alias (acceso directo).
4. Para cambiarle el icono: haz clic derecho sobre el acceso directo del escritorio y dale a **"Obtener información"**.
5. Abre la carpeta `assets` del proyecto, arrastra la imagen del icono y **suéltala justo encima del iconito pequeño que sale arriba a la izquierda** en la ventana de información.

#### 🐧 En Linux (Ubuntu, Mint, etc.)
1. Ve a tu escritorio, haz clic derecho en un espacio vacío y selecciona **"Crear un lanzador"** (Create Launcher) o "Crear enlace".
2. En el campo **Nombre**, ponle el título del proyecto (ej. `Study Tracker`).
3. En el campo **Comando** o **Destino**, haz clic en examinar y selecciona el archivo `index.html` de la carpeta del proyecto.
4. Haz clic en el icono por defecto que te da el sistema para cambiarlo, busca la carpeta `assets` y selecciona la imagen, si no lo estaba ya.
