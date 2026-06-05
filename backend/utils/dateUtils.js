export const getTodayStr = () => new Date().toISOString().split('T')[0];

export const isToday = (dateStr) => dateStr === getTodayStr();

export const isCompletedToday = (lastCompleted) => {
  if (!lastCompleted) return false;
  const d = new Date(lastCompleted);
  return d.toISOString().split('T')[0] === getTodayStr();
};
