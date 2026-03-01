import React from 'react';
import { Target, Calendar, ChevronRight, Edit2 } from 'lucide-react';
import { Objective } from '../types';
import { cn } from '../utils';
import { motion } from 'motion/react';

interface ObjectiveCardProps {
  objective: Objective;
  onEdit: (objective: Objective) => void;
}

export const ObjectiveCard: React.FC<ObjectiveCardProps> = ({ objective, onEdit }) => {
  const progress = Math.min(100, Math.round((objective.currentValue / objective.targetValue) * 100));
  
  return (
    <motion.div 
      layout
      className="iterum-card p-6 flex flex-col gap-6 group relative overflow-hidden"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold tracking-tight">{objective.title}</h3>
          </div>
          {objective.description && (
            <p className="text-sm text-text-muted line-clamp-2">{objective.description}</p>
          )}
        </div>
        
        <button 
          onClick={() => onEdit(objective)}
          className="p-2 text-text-muted hover:text-accent opacity-0 group-hover:opacity-100 transition-all"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Progreso</span>
            <span className="text-2xl font-bold text-accent">
              {objective.currentValue} <span className="text-sm font-medium text-text-muted">/ {objective.targetValue} {objective.unit}</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold">{progress}%</span>
          </div>
        </div>

        <div className="h-3 bg-bg-secondary dark:bg-[--dark-bg-secondary] rounded-full overflow-hidden border border-border-subtle dark:border-[--dark-border-subtle]">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-accent rounded-full shadow-[0_0_12px_rgba(201,147,90,0.3)]"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border-subtle dark:border-[--dark-border-subtle]">
        <div className="flex items-center gap-4">
          {objective.deadline && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(objective.deadline).toLocaleDateString()}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-accent">
          Detalles
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </motion.div>
  );
};
