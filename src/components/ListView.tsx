import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, Circle, Clock, Edit2, Trash2 } from 'lucide-react';
import { Task } from '../types';
import { cn } from '../utils';

interface ListViewProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export function ListView({ tasks, onToggle, onDelete, onEdit }: ListViewProps) {
  const sortedTasks = [...tasks].sort((a, b) => a.date.getTime() - b.date.getTime());

  const groupedTasks = sortedTasks.reduce(
    (acc, task) => {
      const dateKey = format(task.date, 'yyyy-MM-dd');
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(task);
      return acc;
    },
    {} as Record<string, Task[]>,
  );

  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    if (isToday(date)) return 'Hoy';
    if (isTomorrow(date)) return 'Mañana';
    if (isYesterday(date)) return 'Ayer';
    return format(date, "EEEE, d 'de' MMMM", { locale: es });
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900">
          <Clock className="h-8 w-8 text-zinc-400 dark:text-zinc-600" />
        </div>
        <h3 className="mb-1 text-lg font-medium text-zinc-900 dark:text-zinc-100">No hay tareas</h3>
        <p className="max-w-sm text-zinc-500 dark:text-zinc-400">
          No se encontraron tareas. Comienza agregando una nueva o usa la búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {Object.entries(groupedTasks).map(([dateString, dayTasks]) => (
        <div key={dateString} className="space-y-6">
          <h2 className="text-accent flex items-center gap-3 text-xs font-bold tracking-[0.2em] uppercase">
            <span className="bg-accent h-1.5 w-1.5 rounded-full"></span>
            {getDateLabel(dateString)}
          </h2>

          <div className="space-y-3">
            {dayTasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  'group iterum-card flex items-center gap-5 border-none p-5 transition-all hover:translate-x-1',
                  task.completed && 'opacity-50 grayscale-[0.5]',
                )}
              >
                <button
                  onClick={() => onToggle(task.id)}
                  className="flex-shrink-0 transition-all duration-300"
                >
                  {task.completed ? (
                    <div className="bg-accent flex h-6 w-6 items-center justify-center rounded-full">
                      <CheckCircle2 className="text-bg-primary h-4 w-4" />
                    </div>
                  ) : (
                    <div className="border-border-subtle group-hover:border-accent h-6 w-6 rounded-full border-2 transition-colors" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-3">
                    <h3
                      className={cn(
                        'truncate text-lg font-semibold transition-all',
                        task.completed && 'text-text-muted line-through',
                      )}
                    >
                      {task.title}
                    </h3>
                    {task.type !== 'task' && (
                      <span className="bg-accent/10 text-accent border-accent/20 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                        {task.type}
                      </span>
                    )}
                    {task.migrated && (
                      <span className="bg-accent-secondary/10 text-accent-secondary border-accent-secondary/20 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                        retrasado
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p
                      className={cn(
                        'text-text-muted line-clamp-1 text-sm',
                        task.completed && 'line-through',
                      )}
                    >
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="text-text-muted flex items-center gap-1 text-xs font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    {format(task.date, 'HH:mm')}
                  </div>
                  <div className="bg-border-subtle h-4 w-[1px]" />
                  <button
                    onClick={() => onEdit(task)}
                    className="text-text-muted hover:text-accent p-1.5 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(task.id)}
                    className="text-text-muted hover:text-accent-secondary p-1.5 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
