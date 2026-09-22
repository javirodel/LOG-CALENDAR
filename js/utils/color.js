export function normalizeColor(value, fallback = "#2563eb") {
  return /^#[0-9a-f]{6}$/i.test(String(value)) ? value.toLowerCase() : fallback;
}

export function hexToRgb(hex) {
  const value = normalizeColor(hex).slice(1);
  return { r: parseInt(value.slice(0, 2), 16), g: parseInt(value.slice(2, 4), 16), b: parseInt(value.slice(4, 6), 16) };
}

export function readableColor(hex) {
  const { r, g, b } = hexToRgb(hex);
  return r * 0.299 + g * 0.587 + b * 0.114 > 160 ? "#111827" : "#ffffff";
}
