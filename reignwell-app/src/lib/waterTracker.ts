let _entries: number[] = []; // ml values
// TODO: Achu replaces with AsyncStorage persistence

export function getWaterToday() { return _entries.reduce((a, b) => a + b, 0); }
export function addWater(ml: number) { _entries.push(ml); }
export function undoWater() { _entries.pop(); }
export const GOAL_ML = 2500;
