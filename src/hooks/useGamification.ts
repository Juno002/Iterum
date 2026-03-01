import { useState, useEffect } from 'react';
import { UserStats } from '../types';

const EXP_PER_LEVEL = 100;

export function useGamification() {
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('iterum_user_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse user stats', e);
      }
    }
    return {
      discipline: { exp: 0, level: 1 },
      consistency: { exp: 0, level: 1 },
      totalExp: 0,
      level: 1,
    };
  });

  useEffect(() => {
    localStorage.setItem('iterum_user_stats', JSON.stringify(stats));
  }, [stats]);

  const addExp = (amount: number, type: 'discipline' | 'consistency') => {
    setStats(prev => {
      const newTotalExp = prev.totalExp + amount;
      const newLevel = Math.floor(newTotalExp / EXP_PER_LEVEL) + 1;
      
      const categoryStats = prev[type];
      const newCategoryExp = categoryStats.exp + amount;
      const newCategoryLevel = Math.floor(newCategoryExp / EXP_PER_LEVEL) + 1;

      return {
        ...prev,
        totalExp: newTotalExp,
        level: newLevel,
        [type]: {
          exp: newCategoryExp,
          level: newCategoryLevel
        }
      };
    });
  };

  return { stats, addExp };
}
