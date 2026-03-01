export type EntityType = 'task' | 'habit' | 'objective' | 'journal';

export type HabitType = 'yesno' | 'numeric' | 'timer';

export type Habit = {
  id: string;
  name: string;
  description?: string;
  frequency: string; // "daily" | "weekly:Mon,Wed,Fri" | "everyXdays:3"
  type: HabitType;
  targetValue?: number;
  unit?: string;
  category?: string;
  color?: string;
  reminderTime?: string; // HH:mm
  isActive: boolean;
  objectiveIds?: string[]; // Link to objectives
  createdAt: Date;
  archivedAt?: Date;
};

export type HabitLog = {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  value?: number;
  note?: string;
  createdAt: Date;
};

export type Objective = {
  id: string;
  title: string;
  description?: string;
  targetValue: number; // e.g. 100% or 1000km
  currentValue: number;
  unit: string; // e.g. "%", "km", "sesiones"
  deadline?: Date;
  color?: string;
  isActive: boolean;
  createdAt: Date;
};

export type Task = {
  id: string;
  type: EntityType;
  title: string;
  description?: string;
  date: Date;
  completed: boolean;
  color?: string;
  migrated?: boolean;
  // Journal specific
  content?: string;
  tags?: string[];
};

export type ViewMode = 'today' | 'week' | 'month' | 'archive' | 'habits' | 'objectives';

export type DayClosure = {
  date: string; // YYYY-MM-DD
  summary: string;
  closedAt: Date;
};

export type UserStats = {
  discipline: { exp: number; level: number };
  consistency: { exp: number; level: number };
  totalExp: number;
  level: number;
};
