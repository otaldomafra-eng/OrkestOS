import { Check, Calendar, Flag } from 'lucide-react';
import { format } from 'date-fns';
import { useXP } from '../hooks/useXP';
import { XP_VALUES } from '../data/gamification';

const TaskItem = ({ task, onToggle, onDelete }) => {
  const { addXP } = useXP();
  const isLate = task.deadline && new Date(task.deadline) < new Date() && !task.completed;

  const handleToggle = () => {
    if (!task.completed) {
      const amount = task.important ? XP_VALUES.task_important : XP_VALUES.task_normal;
      addXP(amount, task.important ? 'tarefa importante' : 'tarefa');
    }
    onToggle(task.id);
  };

  return (
      <div 
        className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
          task.completed 
            ? 'bg-green-900/20 border-green-500/50' 
            : isLate
            ? 'bg-red-600/10 border-red-400/50'
            : 'bg-surface-deep border-hairline-strong'
        }`}
        data-testid={`task-item-${task.id}`}
      >
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={handleToggle}
          data-testid={`task-toggle-${task.id}`}
          className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-all flex-shrink-0 ${
            task.completed 
              ? 'bg-accent-green border-accent-green' 
              : 'border-mute hover:border-charcoal'
          }`}
        >
          {task.completed && <Check size={16} className="text-ink" />}
        </button>
        
        <div className="flex-1 min-w-0">
          <p className={`font-medium ${
            task.completed 
              ? 'text-mute line-through' 
              : 'text-ink'
          }`}>
            {task.title}
          </p>
          
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {task.deadline && (
              <div className="flex items-center text-xs text-mute">
                <Calendar size={12} className="mr-1" />
                {format(new Date(task.deadline), "dd 'de' MMM 'de' yyyy")}
              </div>
            )}
            
            {task.isImportant && (
              <div className="flex items-center text-xs text-accent-yellow">
                <Flag size={12} className="mr-1" />
                Importante
              </div>
            )}
            
            {isLate && (
              <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">
                Atrasada
              </span>
            )}
          </div>
        </div>
      </div>
      
      {onDelete && (
        <button
          onClick={() => onDelete(task.id)}
          data-testid={`task-delete-${task.id}`}
          className="text-ash hover:text-accent-red transition-colors ml-2"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default TaskItem;