import { STORAGE_KEY } from "./constants.js";

// State remains owned by the compatibility engine during this incremental split.
export function getState() {
  return window.LOGCalendar?.state;
}

export function saveState() {
  window.LOGCalendar?.saveState();
}

export function persist() {
  window.LOGCalendar?.persist();
}

export { STORAGE_KEY };
