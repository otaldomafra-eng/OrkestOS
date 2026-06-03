import { Flame, Clock } from 'lucide-react';
import Card from './Card';
import ToggleSwitch from './ToggleSwitch';
import { useXP } from '../hooks/useXP';
import { XP_VALUES } from '../data/gamification';

const HabitCard = ({ habit, onComplete }) => {
  const { addXP } = useXP();
  const isCompletedToday = new Date(habit.lastCompleted).toDateString() === new Date().toDateString();

  const handleComplete = (e) => {
    e.stopPropagation();
    if (!isCompletedToday) {
      addXP(XP_VALUES.habit, 'hábito diário');
    }
    onComplete && onComplete(habit.id);
  };

  return (
      <Card
        className={`
          cursor-pointer transition-all duration-300
          ${isCompletedToday
            ? 'bg-[rgba(59,158,255,0.08)] border-accent-blue/40'
            : ''
          }
        `}
        onClick={() => onComplete && onComplete(habit.id)}
        data-testid={`habit-card-${habit.id}`}
      >
        {/* TOP ROW */}
        <div className="flex justify-between items-start mb-3">

          {/* TYPE BADGE */}
          <div className={`
    px-3 py-1 rounded-full text-xs font-medium
    ${habit.type === 'build'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
            }
  `}>
            {habit.type === 'build' ? 'Construir hábito' : 'Romper hábito'}
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3">

            {/* TOGGLE SWITCH */}
            <ToggleSwitch
              checked={isCompletedToday}
              onChange={handleComplete}
            />

            {/* STREAK */}
            <div className="flex items-center gap-1 bg-accent-yellow/10 px-2 py-1 rounded-lg">
              <Flame size={14} className="text-accent-yellow" />
              <span className="text-sm font-bold text-accent-yellow">
                {habit.streak}
              </span>
            </div>

          </div>
        </div>

        {/* TITLE */}
        <h3 className="text-lg md:text-xl font-semibold text-ink mb-2 leading-tight">
          {habit.name}
        </h3>

        {/* TIME */}
        {habit.startTime && habit.endTime && (
          <div className="flex items-center text-sm text-mute mb-2">
            <Clock size={14} className="mr-2" />
            <span>{habit.startTime} → {habit.endTime}</span>
          </div>
        )}

        {/* MODE + STATUS */}
        <div className="flex items-center justify-between mt-3">

          {/* MODE */}
          <span className="text-xs text-ash">
            {habit.mode === '21-day' ? 'Desafio de 21 Dias' : 'Permanente'}
          </span>

          {/* COMPLETION STATUS */}
          {isCompletedToday && (
            <span className="text-xs text-accent-blue font-medium">
              ✔ Concluído Hoje
            </span>
          )}
        </div>

      </Card>
  );
};

export default HabitCard;
