export const SOURCE_BADGE_CONFIG = {
  task: {
    label: 'Tarefa',
    className: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  },
  habit: {
    label: 'Hábito',
    className: 'bg-green-500/20 text-green-300 border border-green-500/30',
  },
  manual: {
    label: 'Manual',
    className: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
  },
};

export function getSourceBadge(source) {
  return SOURCE_BADGE_CONFIG[source] ?? SOURCE_BADGE_CONFIG.manual;
}
