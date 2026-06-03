import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import Card from './Card';
import GradientButton from './GradientButton';

const Timer = ({ defaultMinutes = 25 }) => {
  const [timeLeft, setTimeLeft] = useState(defaultMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setModo] = useState('focus'); // 'focus' or 'break'

  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      const id = setTimeout(() => setIsRunning(false), 0);
      return () => clearTimeout(id);
    }
  }, [timeLeft, isRunning]);

  useEffect(() => {
    let interval = null;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const switchModo = (newModo) => {
    setModo(newModo);
    setIsRunning(false);
    setTimeLeft(newModo === 'focus' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Card data-testid="timer-widget">
      <div className="text-center">
        <div className="flex gap-2 justify-center mb-6">
          <button
            onClick={() => switchModo('focus')}
            className={`px-4 py-2 rounded-lg transition-all ${
              mode === 'focus'
                ? 'bg-accent-blue text-ink'
                : 'bg-surface-elevated text-mute hover:bg-surface-deep'
            }`}
            data-testid="timer-focus-btn"
          >
            Foco (25m)
          </button>
          <button
            onClick={() => switchModo('break')}
            className={`px-4 py-2 rounded-lg transition-all ${
              mode === 'break'
                ? 'bg-accent-green text-ink'
                : 'bg-surface-elevated text-mute hover:bg-surface-deep'
            }`}
            data-testid="timer-break-btn"
          >
            Pausa (5m)
          </button>
        </div>

        <div className="text-6xl font-bold text-ink mb-6" data-testid="timer-display">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={toggleTimer}
            data-testid="timer-toggle-btn"
            className="p-4 bg-accent-blue hover:opacity-80 rounded-full transition-opacity"
          >
            {isRunning ? <Pause size={24} className="text-ink" /> : <Play size={24} className="text-ink" />}
          </button>
          <button
            onClick={resetTimer}
            data-testid="timer-reset-btn"
            className="p-4 bg-surface-elevated hover:bg-stone rounded-full transition-colors"
          >
            <RotateCcw size={24} className="text-ink" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default Timer;