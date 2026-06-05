import { Target, Calendar } from 'lucide-react';
import Card from './Card';
import ProgressBar from './ProgressBar';
import { GOAL_TYPE_CONFIG } from '../data/goalConfig';

const GoalCard = ({ goal, progress, onClick }) => {

  const handleGoalClick = (goal) => {
    onClick?.(goal);
  };

  const getTypeStyle = (type) => GOAL_TYPE_CONFIG[type] || GOAL_TYPE_CONFIG['mid-term'];

  const getStatus = () => {
    if (progress >= 80) return { text: 'No Caminho', style: 'bg-green-500/20 text-green-400' };
    if (progress >= 50) return { text: 'Em andamento', style: 'bg-yellow-500/20 text-yellow-400' };
    return { text: 'Atrasada', style: 'bg-red-500/20 text-red-400' };
  };

  const status = getStatus();

  return (
    <Card
      className="hover:scale-105 transition-all duration-300 cursor-pointer"
      onClick={()=>handleGoalClick(goal)}
      data-testid={`goal-card-${goal.id}`}
    >
      {/* TOP */}
      <div className="flex items-start justify-between mb-3">
        
        {/* Icon */}
        <div className={`p-3 ${getTypeStyle(goal.type).bg} ${getTypeStyle(goal.type).text} rounded-xl`}>
          <Target size={22} />
        </div>

        {/* Status Badge */}
        <span className={`text-xs px-3 py-1 rounded-full ${status.style}`}>
          {status.text}
        </span>
      </div>

      {/* TITLE */}
      <h3 className="text-lg md:text-xl font-bold text-ink mb-1">
        {goal.title}
      </h3>

      {/* TYPE */}
      <span className={`inline-block text-xs px-3 py-1 rounded-full capitalize mb-3 ${getTypeStyle(goal.type).bg} ${getTypeStyle(goal.type).text} ${getTypeStyle(goal.type).border}`}>
        {getTypeStyle(goal.type).label || goal.type || 'meta'}
      </span>

      {/* DESCRIPTION */}
      {goal.description && (
        <p className="text-mute text-sm mb-4 line-clamp-2">
          {goal.description}
        </p>
      )}

      {/* PROGRESS SECTION */}
      <div className="flex flex-col items-center justify-between mb-4">

        {/* Percentage */}
        <div className="text-right mb-2">
          <p className="text-2xl font-bold text-ink">{progress}%</p>
          <p className="text-xs text-mute">Progresso</p>
        </div>
        <ProgressBar showLabel={false} progress={progress} className="mb-3" />
      </div>

      {/* DEADLINE */}
      {goal.deadline && (
        <div className="flex items-center text-mute text-xs border-t border-hairline pt-3">
          <Calendar size={14} className="mr-2" />
          <span>Prazo: {goal.deadline}</span>
        </div>
      )}
    </Card>
  );
};

export default GoalCard;