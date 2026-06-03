import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, CalendarDays, LucideTrophy } from 'lucide-react';
import { useDailyPlan } from '../../hooks/useDailyPlan';
import Card from '../../components/Card';
import { motion } from 'framer-motion'
import Bag from '../../components/Bag';
import GradientButton from '../../components/GradientButton';
import { Link } from 'react-router-dom';
import { useXP } from '../../hooks/useXP';
import { XP_VALUES } from '../../data/gamification';

const FocusRoom = () => {
  const { dailyPlan, toggleDailyPlanTaskCompletion } = useDailyPlan();

  // Pomodoro Timer State
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setModo] = useState('work'); // work, shortBreak, longBreak
  const [pomodoroCount, setPomodoroCount] = useState(0);

  const { addXP } = useXP();
  const pomodoroCountRef = useRef(pomodoroCount);

  useEffect(() => {
    if (pomodoroCount > pomodoroCountRef.current) {
      addXP(XP_VALUES.pomodoro, 'pomodoro');
    }
    pomodoroCountRef.current = pomodoroCount;
  }, [pomodoroCount, addXP]);

  useEffect(() => {
    const handleTimerComplete = () => {
      setIsActive(false);

      if (mode === 'work') {
        const newCount = pomodoroCount + 1;
        setPomodoroCount(newCount);

        if (newCount % 4 === 0) {
          setModo('longBreak');
          setMinutes(15);
        } else {
          setModo('shortBreak');
          setMinutes(5);
        }
      } else {
        setModo('work');
        setMinutes(25);
      }

      setSeconds(0);

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Timer Completo!', {
          body: mode === 'work' ? 'Hora de fazer uma pausa!' : 'Hora de trabalhar!',
        });
      }
    };

    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            handleTimerComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, mode, pomodoroCount]);

  const toggleTimer = () => {
    setIsActive(!isActive);

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setSeconds(0);
    if (mode === 'work') setMinutes(25);
    else if (mode === 'shortBreak') setMinutes(5);
    else setMinutes(15);
  };

  const switchModo = (newModo) => {
    setIsActive(false);
    setModo(newModo);
    setSeconds(0);
    if (newModo === 'work') setMinutes(25);
    else if (newModo === 'shortBreak') setMinutes(5);
    else setMinutes(15);
  };

  // Get today's planned tasks from dailyPlan
  const todayPlannedTasks = dailyPlan?.plannedTasks || [];
  const pendingPlannedTasks = todayPlannedTasks.filter(t => !t.completed).slice(0, 8);
  const hasPlannedTasks = todayPlannedTasks.length > 0;

  const getModoColor = () => {
    if (mode === 'work') return 'from-red-600 to-yellow-600';
    if (mode === 'shortBreak') return 'from-green-600 to-emerald-600';
    return 'from-blue-600 to-cyan-600';
  };

  const getModoText = () => {
    if (mode === 'work') return 'Tempo de Foco';
    if (mode === 'shortBreak') return 'Pausa Curta';
    return 'Pausa Longa';
  };

  const getSourceBadge = (source) => {
    if (source === 'task') return { label: 'Tarefa', color: 'bg-blue-500/20 text-blue-400' };
    if (source === 'habit') return { label: 'Hábito', color: 'bg-green-500/20 text-green-400' };
    return { label: 'Manual', color: 'bg-accent-blue/20 text-accent-blue' };
  };

  return (
    <div className="min-h-screen bg-canvas pb-20 px-4 pt-6 relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            className="text-3xl md:text-4xl young-serif-regular font-extrabold text-ink mb-2"
            animate={{
              textShadow: [
                "0px 0px 0px rgba(99,102,241,0)",
                "0px 0px 15px rgba(99,102,241,0.6)",
                "0px 0px 0px rgba(99,102,241,0)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Sala de foco
          </motion.h1>
          <p className="text-charcoal">Minimize distrações, maximize a produtividade</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timer Section */}
          <div className="lg:col-span-2">
            <Card className="relative overflow-hidden text-center bg-surface-card border border-hairline-strong">
              {/* Modo Selector */}
              <div className="flex justify-center gap-2 mb-6">
                <button
                  onClick={() => switchModo('work')}
                  className={`px-4 py-2 rounded-lg border cursor-pointer border-hairline-strong transition-all duration-300 ${mode === 'work'
                    ? 'bg-red-600 text-ink'
                    : 'bg-surface-elevated text-charcoal hover:bg-surface-card'
                    }`}
                  data-testid="mode-work"
                >
                  Foco
                </button>
                <button
                  onClick={() => switchModo('shortBreak')}
                  className={`px-4 py-2 rounded-lg border cursor-pointer border-hairline-strong transition-all duration-300 ${mode === 'shortBreak'
                    ? 'bg-green-600 text-ink'
                    : 'bg-surface-elevated text-charcoal hover:bg-surface-card'
                    }`}
                  data-testid="mode-short-break"
                >
                  Pausa Curta
                </button>
                <button
                  onClick={() => switchModo('longBreak')}
                  className={`px-4 py-2 rounded-lg border cursor-pointer border-hairline-strong transition-all duration-300 ${mode === 'longBreak'
                    ? 'bg-blue-600 text-ink'
                    : 'bg-surface-elevated text-charcoal hover:bg-surface-card'
                    }`}
                  data-testid="mode-long-break"
                >
                  Pausa Longa
                </button>
              </div>

              {/* Timer Display */}
              <motion.div
                animate={{ scale: isActive ? [1, 1.02, 1] : 1 }}
                transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
              >
                {/* Timer */}

                <div className={`bg-gradient-to-r flex flex-col items-center ${getModoColor()} rounded-2xl p-12 mb-6`}>
                  <p className="text-ink text-xl mb-4">{getModoText()}</p>
                  <div className="text-8xl font-bold text-ink mb-4" data-testid="timer-display">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </div>
                  <p className="text-ink mt-4 text-sm">
                    Sessões Concluídas: <span className="text-ink font-semibold">{pomodoroCount}</span>
                  </p>
                </div>
              </motion.div>

              {/* Timer Controls */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={toggleTimer}
                  data-testid="timer-toggle"
                  className={`bg-gradient-to-r ${getModoColor()} hover:opacity-90 text-ink px-8 py-4 rounded-xl
hover:scale-105 cursor-pointer active:scale-95 transition-all flex items-center gap-2 text-lg font-semibold`}
                >
                  {isActive ? (
                    <>
                      <Pause size={24} />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play size={24} />
                      Iniciar
                    </>
                  )}
                </button>
                <button
                  onClick={resetTimer}
                  data-testid="timer-reset"
                  className="bg-surface-elevated hover:bg-surface-card text-ink px-6 py-4 rounded-xl
hover:scale-110 active:scale-95 cursor-pointer transition-all"
                >
                  <RotateCcw size={24} />
                </button>
              </div>
            </Card>

            {/* Notes Section */}
            {/* Focus Workspace */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-6"
            >

              {/* 🧠 BAG (MAIN AREA) */}
              <div>
                <div className="bg-surface-card border border-hairline-strong rounded-xl p-4 min-h-[92vh] flex flex-col">

                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-ink text-lg font-semibold">
                      Notas de Foco
                    </h2>
                    <span className="text-xs text-charcoal">
                      Modo Deep Work
                    </span>
                  </div>

                  {/* Bag */}
                  <div className="flex-1 min-h-0">
                    <Bag />
                  </div>

                </div>
              </div>
            </motion.div>
          </div>

          {/* Today's Tasks */}
          <div className="lg:col-span-1">
            <Card className='bg-surface-card border border-hairline-strong'>

              <h2 className="text-xl font-bold text-ink mb-4">Tarefas planejadas para hoje</h2>
              {hasPlannedTasks && pendingPlannedTasks.length > 0 ? (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {pendingPlannedTasks.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-3 bg-surface-elevated rounded-lg border border-hairline-strong hover:border-accent-blue/50 transition-all"
                      data-testid={`focus-task-${item.id}`}
                    >

                      <div className="flex items-start gap-2">
                        {/* Time */}
                        <div className="text-center min-w-[50px]">
                          <p className="text-xs text-accent-blue font-semibold">{item.startTime}</p>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${item.completed ? 'line-through text-charcoal' : 'text-ink'}`}>
                            {item.title}
                          </h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getSourceBadge(item.source).color} inline-block mt-1`}>
                            {getSourceBadge(item.source).label}
                          </span>
                        </div>

                        {/* Completion Toggle */}
                        <button
                          onClick={() => toggleDailyPlanTaskCompletion(item.id)}
                          className={`p-2 rounded-lg transition-all flex-shrink-0 ${item.completed
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-700/50 text-charcoal hover:bg-green-500/20 hover:text-green-400'
                            }`}
                          data-testid={`toggle-focus-task-${item.id}`}
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : !hasPlannedTasks ? (
                <Card className="mb-6 bg-surface-card border border-hairline-strong">
                  <div className="text-center py-8">
                    <CalendarDays size={48} className="text-accent-blue mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-ink mb-2">Planeje seu dia para manter a produtividade</h3>
                    <p className="text-charcoal mb-4">
                      Crie um plano diário estruturado para maximizar sua produtividade
                    </p>
                    <Link to="/trackers/daily-tasks">
                      <GradientButton variant="primary" data-testid="plan-now-btn">
                        Planejar Agora
                      </GradientButton>
                    </Link>
                  </div>
                </Card>

              ) : hasPlannedTasks && pendingPlannedTasks.length == 0 && (
                <Card className="mb-6 bg-surface-card border border-hairline-strong">
                  <div className="text-center py-8">
                    <LucideTrophy size={48} className="text-accent-blue mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-ink mb-2">"Hooray !!"</h3>
                    <h3 className="text-xl font-bold text-ink mb-2">Todas as tarefas de hoje estão concluídas.</h3>
                    <p className="text-charcoal mb-4">
                      Planeje-se, continue se superando...
                    </p>
                    <Link to="/trackers/daily-tasks">
                      <GradientButton variant="primary" data-testid="plan-now-btn">
                        Planejar
                      </GradientButton>
                    </Link>
                  </div>
                </Card>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusRoom;