/**
 * Local calendar date parts (timezone-adjusted), matching legacy Date.prototype.toLocalDate.
 */
export function toLocalDate(date = new Date()) {
  const tzoffset = date.getTimezoneOffset() * 60000;
  const formattedDateStr = new Date(date.getTime() - tzoffset).toISOString();
  return {
    year: formattedDateStr.substring(0, 4),
    month: parseInt(formattedDateStr.substring(5, 7), 10),
    day: parseInt(formattedDateStr.substring(8, 10), 10),
  };
}
