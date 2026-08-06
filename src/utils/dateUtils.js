/**
 * Safely format event dates to prevent "Invalid Date" displays.
 * @param {string|Date} dateVal - Input date string or Date object
 * @returns {string} Formatted date string (e.g., "12 Aug 2026") or "Date TBD"
 */
export function formatEventDate(dateVal) {
  if (!dateVal) return 'Date TBD';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return 'Date TBD';
  
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
