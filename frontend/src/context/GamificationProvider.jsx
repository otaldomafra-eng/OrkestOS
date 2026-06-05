import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GamificationContext } from './GamificationContext';
import {
  getLevelForXP,
  getNextLevel,
  getLevelProgress,
  ACHIEVEMENTS,
} from '../data/gamification';

const STORAGE_KEY = 'orkest_gamification';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupted — reset
  }
  return {
    totalXP: 0,
    unlockedAchievements: [],
    stats: {
      tasksCompleted: 0,
      goalsCompleted: 0,
      projectsCompleted: 0,
      pomodorosCompleted: 0,
      maxStreak: 0,
      dailyPlan100Streak: 0,
      notesCreated: 0,
      maxHabitStreak: 0,
      morningTasks: 0,
      nightTasks: 0,
    },
  };
}

export default function GamificationProvider({ children }) {
  const [state, setState] = useState(loadState);
  const [xpToasts, setXPToasts] = useState([]);
  const [levelUpQueue, setLevelUpQueue] = useState([]);
  const toastIdRef = useRef(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addXP = useCallback((amount, reason = '', statUpdates = {}) => {
    setState((prev) => {
      const newXP = prev.totalXP + amount;
      const oldLevel = getLevelForXP(prev.totalXP).level;
      const newLevel = getLevelForXP(newXP).level;

      if (newLevel > oldLevel) {
        const lvlData = getLevelForXP(newXP);
        setLevelUpQueue((q) => [...q, { level: newLevel, title: lvlData.title }]);
      }

      const newStats = { ...prev.stats, ...statUpdates };
      const allStats = { ...newStats, totalXP: newXP, level: newLevel };
      const newUnlocked = ACHIEVEMENTS.filter(
        (a) =>
          !prev.unlockedAchievements.includes(a.id) &&
          a.check(allStats)
      ).map((a) => a.id);

      return {
        totalXP: newXP,
        unlockedAchievements: [...prev.unlockedAchievements, ...newUnlocked],
        stats: newStats,
      };
    });

    const id = ++toastIdRef.current;
    setXPToasts((t) => [...t, { id, amount, reason }]);
    setTimeout(() => setXPToasts((t) => t.filter((x) => x.id !== id)), 2500);
  }, []);

  const dismissLevelUp = useCallback(() => {
    setLevelUpQueue((q) => q.slice(1));
  }, []);

  const levelData = getLevelForXP(state.totalXP);
  const nextLevel = getNextLevel(levelData.level);
  const progress = getLevelProgress(state.totalXP);

  const value = {
    totalXP: state.totalXP,
    level: levelData.level,
    levelTitle: levelData.title,
    nextLevelXP: nextLevel?.minXP ?? null,
    levelProgress: progress,
    unlockedAchievements: state.unlockedAchievements,
    stats: state.stats,
    addXP,
    xpToasts,
    levelUpQueue,
    dismissLevelUp,
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
}
