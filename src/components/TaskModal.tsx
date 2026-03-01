import { useState, useEffect, FormEvent } from 'react';
import { X, Zap, Target, BookOpen, Repeat } from 'lucide-react';
import { format } from 'date-fns';
import { Task, EntityType } from '../types';
import { cn } from '../utils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'completed'>) => void;
  initialDate?: Date;
  taskToEdit?: Task;
}

const COLORS = [
  '#C9935A', // Amber (Iterum)
  '#A0522D', // Terracotta (Iterum)
  '#ef4444', // red
  '#22c55e', // green
  '#3b82f6', // blue
  '#a855f7', // purple
  '#64748b', // slate
];

const ENTITY_TYPES: { type: EntityType; label: string; icon: any }[] = [
  { type: 'task', label: 'Tarea', icon: Zap },
  { type: 'habit', label: 'Hábito', icon: Repeat },
  { type: 'objective', label: 'Objetivo', icon: Target },
  { type: 'journal', label: 'Nota', icon: BookOpen },
];

export function TaskModal({ isOpen, onClose, onSave, initialDate = new Date(), taskToEdit }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [type, setType] = useState<EntityType>('task');

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description || '');
        setDateStr(format(taskToEdit.date, 'yyyy-MM-dd'));
        setTimeStr(format(taskToEdit.date, 'HH:mm'));
        setColor(taskToEdit.color || COLORS[0]);
        setType(taskToEdit.type || 'task');
      } else {
        setDateStr(format(initialDate, 'yyyy-MM-dd'));
        setTimeStr(format(initialDate, 'HH:mm'));
        setTitle('');
        setDescription('');
        setColor(COLORS[0]);
        setType('task');
      }
    }
  }, [isOpen, initialDate, taskToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dateStr || !timeStr) return;

    const combinedDate = new Date(`${dateStr}T${timeStr}`);

    onSave({
      title: title.trim(),
      description: description.trim(),
      date: combinedDate,
      color,
      type,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/40 dark:bg-black/60 backdrop-blur-md">
      <div 
        className="bg-bg-primary dark:bg-[--dark-bg-primary] rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-border-subtle dark:border-[--dark-border-subtle]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-border-subtle dark:border-[--dark-border-subtle]">
          <h2 className="text-xl font-bold">
            {taskToEdit ? 'Editar' : 'Capturar'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-text-muted hover:text-accent bg-bg-secondary dark:bg-[--dark-bg-secondary] rounded-[12px] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Entity Type Selector */}
          <div className="grid grid-cols-4 gap-2">
            {ENTITY_TYPES.map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() => setType(item.type)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-[16px] border transition-all",
                  type === item.type 
                    ? "bg-accent/10 border-accent text-accent shadow-sm" 
                    : "bg-bg-secondary dark:bg-[--dark-bg-secondary] border-border-subtle dark:border-[--dark-border-subtle] text-text-muted opacity-60 hover:opacity-100"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="title" className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">
              Título
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="iterum-input w-full text-lg font-semibold"
              placeholder="¿Qué tienes en mente?"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">
                Fecha
              </label>
              <input
                id="date"
                type="date"
                required
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="iterum-input w-full [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">
                Hora
              </label>
              <input
                id="time"
                type="time"
                required
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="iterum-input w-full [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">
              Descripción
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="iterum-input w-full resize-none"
              placeholder="Añade contexto o detalles..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-3">
              Color
            </label>
            <div className="flex items-center gap-3">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-7 h-7 rounded-full transition-all border-2",
                    color === c ? "scale-125 border-text-primary shadow-lg" : "border-transparent hover:scale-110"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-bold text-text-muted hover:text-text-primary transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="iterum-button-primary"
            >
              {taskToEdit ? 'Guardar Cambios' : 'Capturar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
