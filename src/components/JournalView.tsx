import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Task, WeeklyInsight } from '../types';
import { cn } from '../utils';
import { Search, Tag, Calendar, BookOpen, ChevronRight } from 'lucide-react';

interface JournalViewProps {
  tasks: Task[];
  weeklyInsights?: WeeklyInsight[];
  onEdit: (task: Task) => void;
  onViewInsight?: (insight: WeeklyInsight) => void;
}

export function JournalView({
  tasks,
  weeklyInsights = [],
  onEdit,
  onViewInsight,
}: JournalViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const journalEntries = useMemo(() => {
    return tasks
      .filter((t) => t.type === 'journal')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [tasks]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    journalEntries.forEach((entry) => {
      entry.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  }, [journalEntries]);

  const filteredEntries = useMemo(() => {
    return journalEntries.filter((entry) => {
      const matchesSearch =
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = !selectedTag || entry.tags?.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [journalEntries, searchQuery, selectedTag]);

  return (
    <div className="animate-in fade-in space-y-10 duration-700">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="text-text-muted absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar en tus reflexiones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="iterum-input w-full pl-12"
          />
        </div>

        <div className="no-scrollbar flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setSelectedTag(null)}
            className={cn(
              'rounded-full px-4 py-2 text-xs font-bold tracking-widest whitespace-nowrap uppercase transition-all',
              !selectedTag
                ? 'bg-accent text-bg-primary shadow-accent/20 shadow-lg'
                : 'bg-bg-secondary text-text-muted hover:text-accent',
            )}
          >
            Todos
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold tracking-widest whitespace-nowrap uppercase transition-all',
                selectedTag === tag
                  ? 'bg-accent text-bg-primary shadow-accent/20 shadow-lg'
                  : 'bg-bg-secondary text-text-muted hover:text-accent',
              )}
            >
              <Tag className="h-3 w-3" />
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-8">
        {weeklyInsights.length > 0 && (
          <section className="space-y-6">
            <h3 className="text-accent flex items-center gap-3 text-xs font-bold tracking-[0.2em] uppercase">
              <span className="bg-accent h-1.5 w-1.5 rounded-full"></span>
              Sabiduría Semanal
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {weeklyInsights.map((insight, idx) => (
                <div
                  key={idx}
                  onClick={() => onViewInsight?.(insight)}
                  className="bg-accent/5 border-accent/20 hover:bg-accent/10 group cursor-pointer rounded-[24px] border p-6 transition-all"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-accent flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
                      <BookOpen className="h-3 w-3" />
                      {insight.generatedAt
                        ? format(new Date(insight.generatedAt), 'dd MMM yyyy', { locale: es })
                        : 'Reciente'}
                    </div>
                    <ChevronRight className="text-accent h-4 w-4 opacity-0 transition-all group-hover:opacity-100" />
                  </div>
                  <p className="line-clamp-2 text-sm font-medium italic">
                    &quot;{insight.weeklyWisdom}&quot;
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-6">
          <h3 className="text-text-muted flex items-center gap-3 text-xs font-bold tracking-[0.2em] uppercase">
            <span className="bg-text-muted/30 h-1.5 w-1.5 rounded-full"></span>
            Entradas del Diario
          </h3>
          <div className="grid gap-8">
            {filteredEntries.map((entry) => (
              <article
                key={entry.id}
                onClick={() => onEdit(entry)}
                className="group bg-bg-primary border-border-subtle hover:border-accent/40 hover:shadow-accent/5 cursor-pointer rounded-[32px] border p-8 transition-all duration-500 hover:shadow-2xl dark:border-[--dark-border-subtle] dark:bg-[--dark-bg-primary]"
              >
                <div className="flex flex-col gap-8 md:flex-row">
                  <div className="flex-shrink-0 md:w-48">
                    <div className="text-accent mb-2 flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(entry.date), 'dd MMM yyyy', { locale: es })}
                    </div>
                    <h3 className="group-hover:text-accent text-xl leading-tight font-bold transition-colors">
                      {entry.title}
                    </h3>
                  </div>

                  <div className="flex-1 space-y-4">
                    <p className="text-text-muted line-clamp-3 leading-relaxed italic dark:text-[--dark-text-muted]">
                      &quot;{entry.content || 'Sin contenido...'}&quot;
                    </p>

                    <div className="border-border-subtle flex items-center justify-between border-t pt-4 dark:border-[--dark-border-subtle]">
                      <div className="flex gap-2">
                        {entry.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="text-accent/60 bg-accent/5 rounded-md px-2 py-1 text-[9px] font-bold tracking-widest uppercase"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="text-accent flex translate-x-4 items-center gap-2 text-xs font-bold tracking-widest uppercase opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                        Leer más
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {filteredEntries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-bg-secondary mb-6 flex h-20 w-20 items-center justify-center rounded-[32px]">
              <BookOpen className="text-text-muted h-10 w-10 opacity-20" />
            </div>
            <h3 className="mb-2 text-xl font-bold">No se encontraron reflexiones</h3>
            <p className="text-text-muted">Prueba con otros términos de búsqueda o etiquetas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
