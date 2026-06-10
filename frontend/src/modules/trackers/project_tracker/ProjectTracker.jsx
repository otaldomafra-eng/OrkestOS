import { useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { useApp } from '../../../hooks/useApp';
import { useData } from '../../../hooks/useData';
import ProjectCard from '../../../components/ProjectCard';
import { motion } from 'framer-motion';
import { useXP } from '../../../hooks/useXP';
import { XP_VALUES } from '../../../data/gamification';
import { showToast } from '../../../utils/toastHelper';
import ProjectWorkflowView from '../../../components/ProjectWorkflowView';
import AddProjectModal from '../../../components/AddProjectModal';
import TrackerPageHeader from '../../../components/TrackerPageHeader';
import EmptyState from '../../../components/EmptyState';

const ProjectTracker = () => {
  const { toggleTaskCompletion } = useApp();
  const {
    projects,
    goals,
    addProject,
    updateProject,
    calculateProjectProgress,
    getTasksByProject,
    addTask,
  } = useData();

  const [selectedProject, setSelectedProject] = useState(null);
  const [showAddProject, setShowAddProject] = useState(false);
  const { addXP, stats } = useXP();

  const handleCompleteProject = (project) => {
    const progress = calculateProjectProgress(project.id);
    if (progress < 100) {
      showToast({ message: 'Complete todas as tarefas do projeto primeiro', status: 'warning' });
      return;
    }
    addXP(XP_VALUES.project, 'projeto concluído', {
      projectsCompleted: (stats?.projectsCompleted ?? 0) + 1,
    });
    showToast({ message: 'Projeto concluído! +200 XP', status: 'success' });
  };

  const handleAddProject = (projectData) => {
    addProject(projectData);
    setShowAddProject(false);
  };

  const handleAddTask = (taskData) => {
    if (!selectedProject) return;
    addTask({
      ...taskData,
      projectId: selectedProject.id,
      goalId: selectedProject.goalId,
      createdFrom: 'project'
    });
  };

  const handleUpdateProject = (projectId, data) => {
    updateProject(projectId, data);
    setSelectedProject(prev => prev ? { ...prev, ...data } : prev);
  };

  if (selectedProject) {
    const projectTasks = getTasksByProject(selectedProject.id);
    const progress = calculateProjectProgress(selectedProject.id);
    const linkedGoal = goals.find(g => g.id === selectedProject.goalId);

    return (
      <ProjectWorkflowView
        project={selectedProject}
        tasks={projectTasks}
        linkedGoal={linkedGoal}
        progress={progress}
        onBack={() => setSelectedProject(null)}
        onAddTask={handleAddTask}
        onToggleTask={toggleTaskCompletion}
        onCompleteProject={handleCompleteProject}
        onUpdateProject={handleUpdateProject}
        showXP={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-canvas pb-20 px-4 pt-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <TrackerPageHeader
            title="Rastreador de projetos"
            subtitle="Gerencie projetos vinculados às suas metas"
            actionLabel="Novo Projeto"
            onAction={() => setShowAddProject(true)}
            actionIcon={<Plus size={18} />}
          />
        </motion.div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => {
              const linkedGoal = goals.find(g => g.id === project.goalId);
              return (
                <motion.div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.03 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProjectCard
                    project={project}
                    progress={calculateProjectProgress(project.id)}
                    linkedGoal={linkedGoal?.title}
                  />
                </motion.div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Target size={64} className="animate-pulse" />}
            title="Nenhum projeto ainda"
            description="Comece a construir seu sistema de execução"
            actionLabel="Adicionar Primeiro Projeto"
            onAction={() => setShowAddProject(true)}
          />
        )}
      </div>

      <AddProjectModal
        isOpen={showAddProject}
        onClose={() => setShowAddProject(false)}
        onSubmit={handleAddProject}
        goals={goals}
        title="Criar novo projeto"
      />
    </div>
  );
};

export default ProjectTracker;
