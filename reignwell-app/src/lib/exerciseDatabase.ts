export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  emoji: string;
}

export const exercises: Exercise[] = [
  { id: '1',  name: 'Bench Press',      muscle: 'Chest',     emoji: '🏋️' },
  { id: '2',  name: 'Squat',            muscle: 'Legs',      emoji: '🦵' },
  { id: '3',  name: 'Pull-up',          muscle: 'Back',      emoji: '💪' },
  { id: '4',  name: 'Deadlift',         muscle: 'Back',      emoji: '🔩' },
  { id: '5',  name: 'Shoulder Press',   muscle: 'Shoulders', emoji: '🤸' },
  { id: '6',  name: 'Bicep Curl',       muscle: 'Arms',      emoji: '💪' },
  { id: '7',  name: 'Tricep Pushdown',  muscle: 'Arms',      emoji: '🦾' },
  { id: '8',  name: 'Lat Pulldown',     muscle: 'Back',      emoji: '🔽' },
  { id: '9',  name: 'Leg Press',        muscle: 'Legs',      emoji: '🦵' },
  { id: '10', name: 'Plank',            muscle: 'Core',      emoji: '🧘' },
  { id: '11', name: 'Romanian Deadlift',muscle: 'Legs',      emoji: '🏋️' },
  { id: '12', name: 'Incline Press',    muscle: 'Chest',     emoji: '📐' },
  { id: '13', name: 'Cable Row',        muscle: 'Back',      emoji: '🔗' },
  { id: '14', name: 'Lateral Raise',    muscle: 'Shoulders', emoji: '↔️' },
  { id: '15', name: 'Leg Curl',         muscle: 'Legs',      emoji: '🦵' },
];
