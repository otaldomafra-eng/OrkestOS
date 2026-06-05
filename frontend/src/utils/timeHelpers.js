/**
 * Converte uma string "HH:MM" em minutos totais.
 * @param {string} timeStr
 * @returns {number}
 */
export function parseTimeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Retorna true se a diferença (endTime - startTime) for >= minMinutes.
 * @param {string} startTime - "HH:MM"
 * @param {string} endTime   - "HH:MM"
 * @param {number} minMinutes - duração mínima em minutos (padrão 30)
 * @returns {boolean}
 */
export function validateMinDuration(startTime, endTime, minMinutes = 30) {
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);
  return endMinutes - startMinutes >= minMinutes;
}

/**
 * Retorna uma string legível com a duração entre dois horários.
 * Exemplos: "1h 30min", "45min", "2h"
 * @param {string} startTime - "HH:MM"
 * @param {string} endTime   - "HH:MM"
 * @returns {string}
 */
export function formatDuration(startTime, endTime) {
  const totalMinutes = parseTimeToMinutes(endTime) - parseTimeToMinutes(startTime);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}min`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${minutes}min`;
}
