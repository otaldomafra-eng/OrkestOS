import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData';
import Card from '../components/Card';
import GradientButton from '../components/GradientButton';
import InputField from '../components/InputField';
import { motion } from 'framer-motion';

const Onboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { addGoal, addProject, addTask } = useData();
  const idCounter = useRef(0);
  const [step, setStep] = useState(1);
  const [goals, setGoals] = useState([]);
  const [currentGoal, setCurrentGoal] = useState({ title: '', type: 'mid-term' });
  const [executionMap, setExecutionMap] = useState({}); // goalId -> { projects: [], tasks: [] }
  const [currentExecution, setCurrentExecution] = useState({ type: 'task', title: '', deadline: '' });

  const predefinedGoals = [
    'Desenvolvedor de Software',
    'Servidor Público',
    'Cientista de Dados',
    'Aprender Novas Habilidades',
    'Crescimento Profissional',
    'Bem-estar Mental',
    'Liberdade Financeira',
    'Melhor Rotina de Sono'
  ];

  // Step 1: Add Goals
  const handleAddGoal = () => {
    if (!currentGoal.title.trim()) return;
    const newGoal = {
      id: `temp-${++idCounter.current}`,
      title: currentGoal.title,
      type: currentGoal.type
    };
    setGoals([...goals, newGoal]);
    setCurrentGoal({ title: '', type: 'mid-term' });
  };

  const handleAddPredefinedGoal = (goalTitle) => {
    const newGoal = {
      id: `temp-${++idCounter.current}`,
      title: goalTitle,
      type: 'mid-term'
    };
    setGoals([...goals, newGoal]);
  };

  const handleRemoveGoal = (goalId) => {
    setGoals(goals.filter(g => g.id !== goalId));
    const newMap = { ...executionMap };
    delete newMap[goalId];
    setExecutionMap(newMap);
  };

  const handleStep1Next = () => {
    if (goals.length === 0) {
      alert('Por favor, adicione pelo menos uma meta para continuar');
      return;
    }
    setStep(2);
  };

  // Step 2: Map Goals to Execution
  const [selectedGoalForMapping, setSelectedGoalForMapping] = useState(null);

  const handleAddExecution = () => {
    if (!currentExecution.title.trim() || !selectedGoalForMapping) return;

    const goalMap = executionMap[selectedGoalForMapping] || { projects: [], tasks: [] };

    if (currentExecution.type === 'project') {
      goalMap.projects.push({
        id: `temp-${++idCounter.current}`,
        title: currentExecution.title,
        deadline: currentExecution.deadline
      });
    } else {
      goalMap.tasks.push({
        id: `temp-${++idCounter.current}`,
        title: currentExecution.title,
        deadline: currentExecution.deadline
      });
    }

    setExecutionMap({ ...executionMap, [selectedGoalForMapping]: goalMap });
    setCurrentExecution({ type: 'task', title: '', deadline: '' });
  };

  const handleStep2Next = () => {
    setStep(3);
  };

  // Step 3: Initialize System
  const handleFinishOnboarding = () => {
    setLoading(true);
    // Create all goals
    const goalIdMap = {};
    goals.forEach(goal => {
      const createdGoal = addGoal(goal);
      goalIdMap[goal.id] = createdGoal.id;
    });

    // Create all projects and tasks
    Object.keys(executionMap).forEach(tempGoalId => {
      const realGoalId = goalIdMap[tempGoalId];
      const { projects, tasks } = executionMap[tempGoalId];

      // Create projects
      projects.forEach(project => {
        addProject({
          ...project,
          goalId: realGoalId
        });

        // If project has no tasks, you might want to add a default task
      });

      // Create tasks
      tasks.forEach(task => {
        addTask({
          ...task,
          goalId: realGoalId,
          createdFrom: 'onboarding'
        });
      });
    });

    // Set onboarding flag
    localStorage.setItem('Orkest_hasOnboarded', 'true');

    // Navigate to dashboard
    setTimeout(() => {
      // existing logic
      navigate('/dashboard');
    }, 800);

  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <motion.h1 className="text-4xl young-serif-regular font-bold text-ink mb-2"
            animate={{
              textShadow: [
                "0px 0px 0px rgba(99,102,241,0)",        // no glow
                "0px 0px 20px rgba(99,102,241,0.8)",     // glow
                "0px 0px 0px rgba(99,102,241,0)"         // back to normal
              ]
            }}

            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}>
            Orkest<span className="bg-gradient-to-r from-indigo-400 baloo-2-700 md:text-5xl to-violet-400 bg-clip-text text-transparent">OS</span>
          </motion.h1>
          <p className="text-charcoal">Configure seu Sistema Operacional de Vida</p>
          <div className="flex items-center justify-center mt-6">

            {[1, 2, 3].map((s, index) => (
              <div key={s} className="flex items-center">

                {/* Circle */}
                <motion.div
                  className={`
          w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold
          ${step > s
                      ? "bg-accent-blue text-ink"
                      : step === s
                        ? "bg-accent-blue text-ink"
                        : "bg-surface-elevated text-charcoal"
                    }
        `}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: step === s ? 1.1 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {s}
                </motion.div>

                {/* Line (except last) */}
                {index < 2 && (
                  <div className="w-16 h-1 mx-2 relative overflow-hidden rounded-full bg-surface-elevated">

                    <motion.div
                      className="absolute top-0 left-0 h-full bg-accent-blue"
                      animate={{
                        width: step > s ? "100%" : "0%"
                      }}
                      transition={{ duration: 0.5 }}
                    />

                  </div>
                )}

              </div>
            ))}

          </div>
        </div>

        <Card className="
bg-surface-card 
border border-hairline-strong 
rounded-xl p-6
">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}>
            {step === 1 && (
              <div data-testid="onboarding-step-1">
                <h2 className="text-2xl font-bold young-serif-regular text-ink mb-2">Etapa 1: Defina suas Metas</h2>
                <p className="text-charcoal mb-6">Vamos definir o que o sucesso significa para você.</p>

                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="Titulo da meta"
                      value={currentGoal.title}
                      onChange={(e) => setCurrentGoal({ ...currentGoal, title: e.target.value })}
                      placeholder="Digite o título da meta"
                      data-testid="goal-title-input"
                    />
                    <div>
                      <label className="block text-charcoal text-sm font-medium mb-2">Categoria</label>
                      <select
                        value={currentGoal.type}
                        onChange={(e) => setCurrentGoal({ ...currentGoal, type: e.target.value })}
                        className="w-full bg-white/5 text-white border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-accent-blue/50"
                        data-testid="goal-type-select"
                      >
                        <option value="final">Meta Final</option>
                        <option value="long-term">Meta de Longo Prazo</option>
                        <option value="mid-term">Meta de Médio Prazo</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleAddGoal}
                    className="w-full py-3 bg-accent-blue text-ink hover:opacity-90 active:scale-95 transition-all duration-300
        rounded-lg"
                    data-testid="add-goal-btn"
                  >
                    + Adicionar Meta
                  </button>
                </div>

                {goals.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-ink font-semibold mb-3">Suas Metas ({goals.length})</h3>
                    <div className="space-y-2">
                      {goals.map(goal => (
                        <div
                          key={goal.id}
                          className="flex items-center justify-between p-3 bg-surface-elevated border border-hairline-strong
hover:scale-[1.01] transition-all rounded-lg"
                          data-testid={`goal-item-${goal.id}`}
                        >
                          <div>
                            <p className="text-ink font-medium">{goal.title}</p>
                            <span className="text-xs text-charcoal capitalize">{goal.type}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveGoal(goal.id)}
                            className="text-red-400 hover:text-red-300"
                            data-testid={`remove-goal-${goal.id}`}
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-ink font-semibold mb-3">Ou escolha entre sugestões:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {predefinedGoals.map(goal => (
                      <button
                        key={goal}
                        onClick={() => handleAddPredefinedGoal(goal)}
                        className="
p-3 text-sm 
bg-surface-elevated text-charcoal border border-hairline-strong
hover:scale-[1.02] hover:bg-surface-card
transition-all duration-300 rounded-lg
"
                        data-testid={`predefined-goal-${goal.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                <GradientButton onClick={handleStep1Next} className="w-full" variant="primary" data-testid="step-1-next-btn">
                  Próximo: Mapear para Execução
                </GradientButton>
              </div>
            )}

            {step === 2 && (
              <div data-testid="onboarding-step-2">
                <h2 className="text-2xl font-bold text-ink mb-2">Etapa 2: Mapear para Execução</h2>
                <p className="text-charcoal mb-6">Divida metas em etapas acionáveis...</p>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-charcoal text-sm font-medium mb-2">Selecionar Meta</label>
                    <select
                      value={selectedGoalForMapping || ''}
                      onChange={(e) => setSelectedGoalForMapping(e.target.value)}
                      className="w-full bg-white/5 text-white border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-accent-blue/50"
                      data-testid="select-goal-mapping"
                    >
                      <option value="">Escolha uma meta...</option>
                      {goals.map(goal => (
                        <option key={goal.id} value={goal.id}>{goal.title}</option>
                      ))}
                    </select>
                  </div>

                  {selectedGoalForMapping && (
                    <>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentExecution({ ...currentExecution, type: 'project' })}
                          className={`flex-1 py-2 rounded-lg transition-all border border-hairline-strong duration-300 ${currentExecution.type === 'project'
                            ? 'bg-accent-blue text-ink'
                            : 'bg-surface-elevated text-charcoal'
                            }`}
                          data-testid="execution-type-project"
                        >
                          Projeto
                        </button>
                        <button
                          onClick={() => setCurrentExecution({ ...currentExecution, type: 'task' })}
                          className={`flex-1 py-2 rounded-lg transition-all border border-hairline-strong duration-300 ${currentExecution.type === 'task'
                            ? 'bg-accent-blue text-ink'
                            : 'bg-surface-elevated text-charcoal'
                            }`}
                          data-testid="execution-type-task"
                        >
                          Tarefa Avulsa
                        </button>
                      </div>

                      <InputField
                        label={currentExecution.type === 'project' ? 'Titulo do projeto' : 'Titulo da tarefa'}
                        value={currentExecution.title}
                        onChange={(e) => setCurrentExecution({ ...currentExecution, title: e.target.value })}
                        placeholder={`Digite o título ${currentExecution.type === 'project' ? 'do projeto' : 'da tarefa'}`}
                        data-testid="execution-title-input"
                      />

                      <InputField
                        label="Prazo (Opcional)"
                        type="date"
                        value={currentExecution.deadline}
                        onChange={(e) => setCurrentExecution({ ...currentExecution, deadline: e.target.value })}
                        data-testid="execution-deadline-input"
                      />

                      <button
                        onClick={handleAddExecution}
                        className="
w-full py-3 
bg-accent-green text-ink
active:scale-95 
transition-all duration-300 
rounded-lg
"
                        data-testid="add-execution-btn"
                      >
                        + Adicionar {currentExecution.type === 'project' ? 'Projeto' : 'Tarefa'}
                      </button>
                    </>
                  )}
                </div>

                {Object.keys(executionMap).length > 0 && (
                  <div className="max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600">
                    <h3 className="text-ink font-semibold mb-3">Execução Mapeada</h3>
                    {goals.map(goal => {
                      const map = executionMap[goal.id];
                      if (!map || (map.projects.length === 0 && map.tasks.length === 0)) return null;

                      return (
                        <div key={goal.id} className="mb-4 p-3 bg-surface-elevated rounded-lg">
                          <p className="text-accent-blue font-semibold mb-2">{goal.title}</p>
                          {map.projects.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs text-charcoal mb-1">Projetos:</p>
                              {map.projects.map(p => (
                                <p key={p.id} className="text-sm text-charcoal ml-3">â€¢ {p.title}</p>
                              ))}
                            </div>
                          )}
                          {map.tasks.length > 0 && (
                            <div>
                              <p className="text-xs text-charcoal mb-1">Tarefas:</p>
                              {map.tasks.map(t => (
                                <p key={t.id} className="text-sm text-charcoal ml-3">â€¢ {t.title}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                          className="flex-1 py-3 bg-surface-elevated hover:bg-surface-card text-ink rounded-lg transition-colors"
                    data-testid="step-2-back-btn"
                  >
                    Back
                  </button>
                  <GradientButton onClick={handleStep2Next} className="flex-1" variant="primary" data-testid="step-2-next-btn">
                    Próximo: Inicializar
                  </GradientButton>
                </div>
              </div>
            )}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >

              {step === 3 && (
                <div data-testid="onboarding-step-3">
                  <h2 className="text-2xl font-bold text-ink mb-2">Etapa 3: Sistema Pronto!</h2>
                  <p className="text-charcoal mb-6">Seu sistema está pronto! Seu OrkestOS está sendo inicializado...</p>

                  <div className="bg-surface-elevated rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <motion.p
                          className="text-3xl young-serif-regular font-bold text-accent-blue "
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          {goals.length}
                        </motion.p>
                        <p className="text-sm text-charcoal">Metas</p>
                      </div>
                      <div>
                        <motion.p
                          className="text-3xl young-serif-regular font-bold text-accent-blue "
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          {Object.values(executionMap).reduce((sum, map) => sum + map.projects.length, 0)}
                        </motion.p>
                        <p className="text-sm text-charcoal">Projetos</p>
                      </div>
                      <div>
                        <motion.p
                          className="text-3xl young-serif-regular font-bold text-accent-blue "
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          {Object.values(executionMap).reduce((sum, map) => sum + map.tasks.length, 0)}
                        </motion.p>
                        <p className="text-sm text-charcoal">Tarefas</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-ink text-sm">â�""</div>
                      <p className="text-ink">Rastreador de metas populated</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-ink text-sm">â�""</div>
                      <p className="text-ink">Rastreador de projetos initialized</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-ink text-sm">â�""</div>
                      <p className="text-ink">Tarefas avulsas ready</p>
                    </div>
                  </div>

                  <p className="text-charcoal text-sm mb-6">
                    Você pode adicionar mais metas, projetos, tarefas e hábitos a qualquer momento na seção Rastreadores.
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(2)}
                            className="flex-1 py-3 bg-surface-elevated hover:bg-surface-card text-ink rounded-lg transition-colors"
                      data-testid="step-3-back-btn"
                    >
                    Voltar
                    </button>
                    <GradientButton onClick={handleFinishOnboarding} className="flex-1" variant="primary" data-testid="finish-onboarding-btn">
                      {loading ? "Inicializando..." : "Entrar no painel"}
                    </GradientButton>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
