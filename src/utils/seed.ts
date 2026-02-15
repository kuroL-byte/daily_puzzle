export function getDailySeed() {
  const today = new Date().toISOString().slice(0, 10);
  return today.split("-").join("");
}
