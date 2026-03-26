import React from 'react';
import { Target, Calendar, ChevronRight, Edit2, CheckCircle2, Circle } from 'lucide-react';
import { Objective, Milestone } from '../types';
import { cn } from '../utils';
import { motion } from 'motion/react';

interface ObjectiveCardProps {
  objective: Objective;
  onEdit: (objective: Objective) => void;
  onToggleMilestone?: (objectiveId: string, milestoneId: string) => void;
}

export const ObjectiveCard: React.FC<ObjectiveCardProps> = ({
  objective,
  onEdit,
  onToggleMilestone,
}) => {
  const progress = Math.min(
    100,
    Math.round((objective.currentValue / objective.targetValue) * 100),
  );
  const completedMilestones = objective.milestones?.filter((m) => m.completed).length || 0;
  const totalMilestones = objective.milestones?.length || 0;

  return (
    <motion.div
      layout
      className="iterum-card group relative flex flex-col gap-6 overflow-hidden p-6"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold tracking-tight">{objective.title}</h3>
          </div>
          {objective.description && (
            <p className="text-text-muted line-clamp-2 text-sm">{objective.description}</p>
          )}
        </div>

        <button
          onClick={() => onEdit(objective)}
          className="text-text-muted hover:text-accent p-2 opacity-0 transition-all group-hover:opacity-100"
        >
          <Edit2 className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-text-muted text-[10px] font-bold tracking-widest uppercase">
              Progreso
            </span>
            <span className="text-accent text-2xl font-bold">
              {objective.currentValue}{' '}
              <span className="text-text-muted text-sm font-medium">
                / {objective.targetValue} {objective.unit}
              </span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold">{progress}%</span>
          </div>
        </div>

        <div className="bg-bg-secondary border-border-subtle h-3 overflow-hidden rounded-full border dark:border-[--dark-border-subtle] dark:bg-[--dark-bg-secondary]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="bg-accent h-full rounded-full shadow-[0_0_12px_rgba(201,147,90,0.3)]"
            style={{ backgroundColor: objective.color }}
          />
        </div>
      </div>

      {objective.milestones && objective.milestones.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-text-muted text-[10px] font-bold tracking-widest uppercase">
              Hitos ({completedMilestones}/{totalMilestones})
            </span>
          </div>
          <div className="space-y-2">
            {objective.milestones.map((milestone) => (
              <button
                key={milestone.id}
                onClick={() => onToggleMilestone?.(objective.id, milestone.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-[12px] border p-2.5 text-left transition-all',
                  milestone.completed
                    ? 'bg-accent/5 border-accent/20 text-text-primary'
                    : 'bg-bg-secondary/50 border-border-subtle text-text-muted hover:border-accent/30',
                )}
              >
                {milestone.completed ? (
                  <CheckCircle2 className="text-accent h-4 w-4 shrink-0" />
                ) : (
                  <Circle className="text-text-muted/30 h-4 w-4 shrink-0" />
                )}
                <span
                  className={cn(
                    'text-xs font-medium',
                    milestone.completed && 'line-through opacity-60',
                  )}
                >
                  {milestone.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-border-subtle flex items-center justify-between border-t pt-2 dark:border-[--dark-border-subtle]">
        <div className="flex items-center gap-4">
          {objective.deadline && (
            <div className="text-text-muted flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(objective.deadline).toLocaleDateString()}
            </div>
          )}
        </div>

        <div className="text-accent flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
          Detalles
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </motion.div>
  );
};
