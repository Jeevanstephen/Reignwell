import { useState, useEffect, useCallback } from 'react';
import {
  getWaterToday, addWater, removeWater, getWaterGoal, setWaterGoal,
} from '../lib/waterTracking';

export interface WaterState {
  currentMl: number;      // today's intake
  goalMl: number;         // daily goal
  pct: number;            // 0–1 fraction of goal reached
  isGoalMet: boolean;
  loading: boolean;
  add250: () => Promise<void>;
  add500: () => Promise<void>;
  remove250: () => Promise<void>;
  updateGoal: (ml: number) => Promise<void>;
}

export function useWater(): WaterState {
  const [currentMl, setCurrentMl] = useState(0);
  const [goalMl, setGoalMl] = useState(2500);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getWaterToday(), getWaterGoal()]).then(([water, goal]) => {
      setCurrentMl(water);
      setGoalMl(goal);
      setLoading(false);
    });
  }, []);

  const add250 = useCallback(async () => {
    const next = await addWater(250);
    setCurrentMl(next);
  }, []);

  const add500 = useCallback(async () => {
    const next = await addWater(500);
    setCurrentMl(next);
  }, []);

  const remove250 = useCallback(async () => {
    const next = await removeWater(250);
    setCurrentMl(next);
  }, []);

  const updateGoal = useCallback(async (ml: number) => {
    await setWaterGoal(ml);
    setGoalMl(ml);
  }, []);

  const pct = goalMl > 0 ? Math.min(currentMl / goalMl, 1) : 0;

  return {
    currentMl,
    goalMl,
    pct,
    isGoalMet: currentMl >= goalMl,
    loading,
    add250,
    add500,
    remove250,
    updateGoal,
  };
}
