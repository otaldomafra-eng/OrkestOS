import { Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Card from './Card';
import DonutChart from './DonutChart';
import AreaBadge from './AreaBadge';
import { WORKFLOW_TYPE_ICON } from '../data/workflowConfig';

const ProjectCard = ({ project, progress, linkedGoal, onClick }) => {
  const getTimeRemaining = (deadline) => {
    if (!deadline) return 'Sem prazo';
    try {
      return formatDistanceToNow(new Date(deadline), { addSuffix: true });
    } catch {
      return 'Invalid date';
    }
  };

  const typeIcon = WORKFLOW_TYPE_ICON[project.workflowType] || '📁';

  return (
    <Card
      className="hover:scale-105 transition-transform duration-300 cursor-pointer"
      onClick={onClick}
      data-testid={`project-card-${project.id}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-[rgba(17,255,153,0.1)] text-accent-green rounded-xl text-xl">
          {typeIcon}
        </div>
        {linkedGoal && (
          <span className="text-xs px-3 py-1 rounded-full bg-[rgba(59,158,255,0.1)] text-accent-blue">
            {linkedGoal}
          </span>
        )}
      </div>

      <h3 className="text-lg font-bold text-ink mb-1">{project.title}</h3>

      {project.currentPhase && (
        <p className="text-xs text-white/40 mb-2">📍 {project.currentPhase}</p>
      )}

      {project.areaId && (
        <div className="mb-2">
          <AreaBadge areaId={project.areaId} />
        </div>
      )}

      {project.deadline && (
        <div className="flex items-center text-mute text-sm mb-4">
          <Calendar size={14} className="mr-2" />
          <span>{getTimeRemaining(project.deadline)}</span>
        </div>
      )}

      <div className="flex justify-center">
        <DonutChart value={progress} size={100} strokeWidth={8} color="#10b981" />
      </div>
    </Card>
  );
};

export default ProjectCard;
