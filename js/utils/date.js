export const parseKey = (key) => {
  const [year, month, day] = String(key).split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const toDateKey = (date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
export const addMonths = (date, amount) => new Date(date.getFullYear(), date.getMonth() + amount, 1);
export const isValidDateKey = (key) => /^\d{4}-\d{2}-\d{2}$/.test(String(key));
