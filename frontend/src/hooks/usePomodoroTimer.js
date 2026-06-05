import { useState, useEffect, useRef } from 'react';
import { useXP } from './useXP';
import { XP_VALUES } from '../data/gamification';

const DURATIONS = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
};

export function usePomodoroTimer() {
  const [mode, setMode] = useState('work'); // work | shortBreak | longBreak
  const [minutes, setMinutes] = useState(DURATIONS.work);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
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
          setMode('longBreak');
          setMinutes(DURATIONS.longBreak);
        } else {
          setMode('shortBreak');
          setMinutes(DURATIONS.shortBreak);
        }
      } else {
        setMode('work');
        setMinutes(DURATIONS.work);
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
    setIsActive(prev => !prev);

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const reset = () => {
    setIsActive(false);
    setSeconds(0);
    setMinutes(DURATIONS[mode] ?? DURATIONS.work);
  };

  const switchMode = (newMode) => {
    setIsActive(false);
    setMode(newMode);
    setSeconds(0);
    setMinutes(DURATIONS[newMode] ?? DURATIONS.work);
  };

  return {
    mode,
    setMode: switchMode,
    minutes,
    seconds,
    isActive,
    pomodoroCount,
    toggleTimer,
    reset,
  };
}
