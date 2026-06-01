# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

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
