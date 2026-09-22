import { initCalendar } from "./modules/calendar.js";
import { initDayPanel } from "./modules/day-panel.js";
import { initDock } from "./modules/dock.js";
import { initEvents } from "./modules/events.js";
import { initSettings } from "./modules/settings.js";
import { initStats } from "./modules/stats.js";
import { initTasks } from "./modules/tasks.js";
import { initTheme } from "./modules/theme.js";
import { initTracker } from "./modules/tracker.js";

function bootstrap() {
  if (!window.LOGCalendar) return;
  [initTheme, initDock, initCalendar, initDayPanel, initEvents, initTasks, initTracker, initStats, initSettings].forEach((init) => init());
}

bootstrap();
