import React, { useState } from 'react';
import {
  CheckCircle2,
  Flame,
  Target,
  Edit2,
  MoreVertical,
  MessageSquare,
  Save,
} from 'lucide-react';
import { Habit, HabitLog } from '../types';
import { cn } from '../utils';
import { calculateCurrentStreak } from '../utils/habitUtils';
import { motion, AnimatePresence } from 'motion/react';

interface HabitCardProps {
  habit: Habit;
  logs: HabitLog[];
  onToggle: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onAddNote?: (id: string, note: string) => void;
  compact?: boolean;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  logs,
  onToggle,
  onEdit,
  onAddNote,
  compact = false,
}) => {
  const [isReflecting, setIsReflecting] = useState(false);
  const [note, setNote] = useState('');

  const streak = calculateCurrentStreak(logs, habit);
  const todayStr = new Date().toISOString().split('T')[0];
  const currentLog = logs.find((l) => l.habitId === habit.id && l.date === todayStr);
  const isCompletedToday = currentLog?.completed || false;

  const handleSaveNote = () => {
    if (onAddNote) {
      onAddNote(habit.id, note);
      setIsReflecting(false);
    }
  };

  const [prevLogId, setPrevLogId] = useState<string | undefined>(currentLog?.id);
  if (currentLog?.id !== prevLogId) {
    setNote(currentLog?.note || '');
    setPrevLogId(currentLog?.id);
  }

  if (compact) {
    return (
      <div className="iterum-card flex items-center justify-between border-none p-4 transition-all hover:translate-x-1">
        <div className="flex items-center gap-4">
          <button onClick={() => onToggle(habit.id)} className="flex-shrink-0">
            {isCompletedToday ? (
              <div className="bg-accent shadow-accent/20 flex h-8 w-8 items-center justify-center rounded-full shadow-lg">
                <CheckCircle2 className="text-bg-primary h-5 w-5" />
              </div>
            ) : (
              <div className="border-border-subtle hover:border-accent h-8 w-8 rounded-full border-2 transition-colors" />
            )}
          </button>
          <div>
            <h4
              className={cn(
                'text-sm font-bold',
                isCompletedToday && 'text-text-muted line-through',
              )}
            >
              {habit.name}
            </h4>
            <div className="text-text-muted flex items-center gap-2 text-[10px] font-bold tracking-wider uppercase">
              <Flame className={cn('h-3 w-3', streak > 0 ? 'text-accent' : 'text-text-muted')} />
              {streak} días
            </div>
          </div>
        </div>
        {isCompletedToday && onAddNote && (
          <button
            onClick={() => setIsReflecting(!isReflecting)}
            className={cn(
              'rounded-full p-2 transition-colors',
              currentLog?.note ? 'text-accent bg-accent/10' : 'text-text-muted hover:text-accent',
            )}
          >
            <MessageSquare className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      layout
      className="iterum-card group relative flex flex-col gap-4 overflow-hidden p-6"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold tracking-tight">{habit.name}</h3>
            {habit.category && (
              <span className="bg-accent/10 text-accent border-accent/20 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase">
                {habit.category}
              </span>
            )}
          </div>
          <p className="text-text-muted text-xs font-medium tracking-widest uppercase">
            {habit.frequency === 'daily' ? 'Cada día' : habit.frequency}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isCompletedToday && (
            <button
              onClick={() => setIsReflecting(!isReflecting)}
              className={cn(
                'rounded-full p-2 transition-all',
                currentLog?.note
                  ? 'text-accent bg-accent/10'
                  : 'text-text-muted hover:text-accent opacity-0 group-hover:opacity-100',
              )}
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onEdit(habit)}
            className="text-text-muted hover:text-accent p-2 opacity-0 transition-all group-hover:opacity-100"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button className="text-text-muted hover:text-accent p-2">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isReflecting && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-end gap-2 pt-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="¿Cómo te sentiste hoy con este hábito?"
                className="iterum-input h-20 flex-1 resize-none py-2 text-sm"
                autoFocus
              />
              <button
                onClick={handleSaveNote}
                className="bg-accent text-bg-primary rounded-[12px] p-3 transition-all hover:opacity-90"
              >
                <Save className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-2 flex items-end justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold tracking-wider uppercase',
              streak > 0 ? 'bg-accent/10 text-accent' : 'bg-bg-secondary text-text-muted',
            )}
          >
            <Flame className="h-4 w-4" />
            {streak} días racha
          </div>

          <div className="bg-bg-secondary text-text-muted flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold tracking-wider uppercase">
            <Target className="h-4 w-4" />
            {habit.type === 'numeric' ? `${habit.targetValue} ${habit.unit}` : 'Check'}
          </div>
        </div>

        <button
          onClick={() => onToggle(habit.id)}
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-2xl shadow-xl transition-all duration-500',
            isCompletedToday
              ? 'bg-accent text-bg-primary shadow-accent/30 scale-95'
              : 'bg-bg-secondary text-text-muted hover:bg-accent/10 hover:text-accent border-border-subtle border',
          )}
        >
          {isCompletedToday ? (
            <CheckCircle2 className="h-8 w-8" />
          ) : (
            <div className="h-6 w-6 rounded-full border-2 border-current" />
          )}
        </button>
      </div>

      {/* Progress Bar for Numeric Habits (Optional Visual) */}
      {habit.type === 'numeric' && (
        <div className="bg-bg-secondary mt-2 h-1.5 w-full overflow-hidden rounded-full">
          <div
            className="bg-accent h-full transition-all duration-1000"
            style={{ width: isCompletedToday ? '100%' : '0%' }}
          />
        </div>
      )}
    </motion.div>
  );
};
