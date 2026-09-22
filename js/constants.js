export const APP_VERSION = "3.0.1";
export const STORAGE_KEY = "LOG-calendar-local-state-v1";
export const DARK_MODE_KEY = "LOG-calendar-dark-mode";
export const NEW_CATEGORY_VALUE = "__new__";

export const EVENT_CATEGORIES = {
  exam: { label: "Examen", className: "exam-note" },
  deadline: { label: "Entrega", className: "deadline-note" },
  review: { label: "Repaso clave", className: "review-note" },
  personal: { label: "Aviso", className: "personal-note" },
  academic: { label: "Académico", className: "academic-note" },
  holiday: { label: "Festivo", className: "holiday-note" },
  project: { label: "Proyecto", className: "project-note" },
  sport: { label: "Deporte", className: "sport-note" },
  community: { label: "Comunidad", className: "community-note" },
  weekend: { label: "Fin de semana", className: "" },
};

export const EVENT_PRIORITY = [
  "exam", "deadline", "holiday", "academic", "review", "project",
  "sport", "community", "personal", "weekend",
];
