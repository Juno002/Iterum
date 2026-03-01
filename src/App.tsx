import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  LayoutGrid, 
  Plus, 
  Sparkles, 
  Search, 
  Moon, 
  Sun, 
  Target, 
  Zap, 
  BookOpen,
  Archive as ArchiveIcon,
  ChevronRight,
  Repeat
} from 'lucide-react';
import { useTasks } from './hooks/useTasks';
import { useHabits } from './hooks/useHabits';
import { ViewMode, Task, Habit } from './types';
import { cn } from './utils';
import { shouldHabitOccurOnDate } from './utils/habitUtils';
import { ListView } from './components/ListView';
import { CalendarView } from './components/CalendarView';
import { TaskModal } from './components/TaskModal';
import { HabitModal } from './components/HabitModal';
import { HabitCard } from './components/HabitCard';
import { AISuggestionModal } from './components/AISuggestionModal';

export default function App() {
  const { tasks, addTask, updateTask, deleteTask, toggleTask } = useTasks();
  const { habits, logs, addHabit, updateHabit, deleteHabit, toggleHabitLog } = useHabits();
  
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
  const [habitToEdit, setHabitToEdit] = useState<Habit | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setTaskToEdit(undefined);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleEditHabit = (habit: Habit) => {
    setHabitToEdit(habit);
    setIsHabitModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setTimeout(() => setTaskToEdit(undefined), 200);
  };

  const handleCloseHabitModal = () => {
    setIsHabitModalOpen(false);
    setTimeout(() => setHabitToEdit(undefined), 200);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'completed'>) => {
    if (taskToEdit) {
      updateTask(taskToEdit.id, taskData);
    } else if (taskData.type === 'habit') {
      // If user captured a "habit" from the quick capture modal, 
      // convert it to a simple yesno habit.
      addHabit({
        name: taskData.title,
        description: taskData.description,
        frequency: 'daily',
        type: 'yesno',
        color: taskData.color,
      });
    } else {
      addTask(taskData);
    }
  };

  const handleSaveHabit = (habitData: Omit<Habit, 'id' | 'isActive' | 'createdAt'>) => {
    if (habitToEdit) {
      updateHabit(habitToEdit.id, habitData);
    } else {
      addHabit(habitData);
    }
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHabits = habits.filter(h => 
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const todayHabits = habits.filter(h => h.isActive && shouldHabitOccurOnDate(h.frequency, new Date()));

  const navItems: { mode: ViewMode; label: string; icon: any }[] = [
    { mode: 'today', label: 'Hoy', icon: Zap },
    { mode: 'habits', label: 'Hábitos', icon: Repeat },
    { mode: 'week', label: 'Semana', icon: LayoutGrid },
    { mode: 'month', label: 'Mes', icon: CalendarIcon },
    { mode: 'archive', label: 'Archivo', icon: ArchiveIcon },
  ];

  return (
    <div className="min-h-screen bg-bg-primary dark:bg-[--dark-bg-primary] text-text-primary dark:text-[--dark-text-primary] font-sans transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-bg-primary/80 dark:bg-[--dark-bg-primary]/80 backdrop-blur-xl border-b border-border-subtle dark:border-[--dark-border-subtle]">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 bg-accent rounded-[12px] flex items-center justify-center shadow-lg shadow-accent/20">
              <span className="text-bg-primary font-bold text-xl">I</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight hidden md:block">Iterum</h1>
          </div>
          
          <nav className="hidden lg:flex items-center bg-bg-secondary dark:bg-[--dark-bg-secondary] p-1.5 rounded-[18px] border border-border-subtle dark:border-[--dark-border-subtle]">
            {navItems.map((item) => (
              <button
                key={item.mode}
                onClick={() => setViewMode(item.mode)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 rounded-[14px] text-sm font-medium transition-all duration-300",
                  viewMode === item.mode 
                    ? "bg-bg-primary dark:bg-[--dark-bg-primary] text-accent shadow-sm" 
                    : "text-text-muted dark:text-[--dark-text-muted] hover:text-text-primary dark:hover:text-[--dark-text-primary]"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="relative group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="iterum-input pl-10 w-48 focus:w-64"
              />
            </div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 text-text-muted hover:text-accent bg-bg-secondary dark:bg-[--dark-bg-secondary] rounded-[14px] border border-border-subtle dark:border-[--dark-border-subtle] transition-all"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsAIModalOpen(true)}
              className="p-2.5 text-accent bg-accent/10 hover:bg-accent/20 rounded-[14px] transition-all"
              title="Sugerir IA"
            >
              <Sparkles className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setHabitToEdit(undefined);
                  setIsHabitModalOpen(true);
                }}
                className="p-2.5 text-text-muted hover:text-accent bg-bg-secondary dark:bg-[--dark-bg-secondary] rounded-[14px] border border-border-subtle dark:border-[--dark-border-subtle] transition-all"
                title="Nuevo Hábito"
              >
                <Repeat className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setSelectedDate(new Date());
                  setTaskToEdit(undefined);
                  setIsTaskModalOpen(true);
                }}
                className="iterum-button-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Capturar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col gap-10">
          {/* View Header */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-accent font-semibold uppercase tracking-widest text-xs">
              {viewMode === 'today' && <Zap className="w-3 h-3" />}
              {viewMode === 'habits' && <Repeat className="w-3 h-3" />}
              {viewMode === 'week' && <LayoutGrid className="w-3 h-3" />}
              {viewMode === 'month' && <CalendarIcon className="w-3 h-3" />}
              {viewMode === 'today' ? 'Ejecución' : viewMode.toUpperCase()}
            </div>
            <h2 className="text-4xl font-bold capitalize">
              {viewMode === 'today' ? 'Hoy' : viewMode === 'habits' ? 'Hábitos' : viewMode}
            </h2>
            {viewMode === 'today' && (
              <p className="text-text-muted dark:text-[--dark-text-muted]">
                {filteredTasks.filter(t => !t.completed).length} ítems prioritarios para hoy.
              </p>
            )}
          </div>

          {/* Dynamic View Rendering */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-12">
              {viewMode === 'habits' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredHabits.map(habit => (
                    <HabitCard 
                      key={habit.id} 
                      habit={habit} 
                      logs={logs} 
                      onToggle={(id) => toggleHabitLog(id, new Date())}
                      onEdit={handleEditHabit}
                    />
                  ))}
                  {filteredHabits.length === 0 && (
                    <div className="col-span-full py-20 text-center iterum-card border-dashed">
                      <p className="text-text-muted">No hay hábitos activos. Crea uno para empezar.</p>
                    </div>
                  )}
                </div>
              ) : viewMode === 'today' || viewMode === 'week' ? (
                <div className="space-y-12">
                  {viewMode === 'today' && todayHabits.length > 0 && (
                    <section className="space-y-6">
                      <h3 className="text-xs font-bold text-accent uppercase tracking-[0.2em] flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                        Hábitos de Hoy
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {todayHabits.map(habit => (
                          <HabitCard 
                            key={habit.id} 
                            habit={habit} 
                            logs={logs} 
                            onToggle={(id) => toggleHabitLog(id, new Date())}
                            onEdit={handleEditHabit}
                            compact
                          />
                        ))}
                      </div>
                    </section>
                  )}
                  
                  <ListView 
                    tasks={filteredTasks} 
                    onToggle={toggleTask} 
                    onDelete={deleteTask}
                    onEdit={handleEditTask}
                  />
                </div>
              ) : (
                <CalendarView 
                  tasks={filteredTasks} 
                  onDateSelect={handleDateSelect}
                  onToggle={toggleTask}
                  onEdit={handleEditTask}
                />
              )}
            </div>

            {/* Sidebar - Contextual Info */}
            <aside className="lg:col-span-4 space-y-8">
              <section className="iterum-card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold flex items-center gap-2">
                    <Target className="w-5 h-5 text-accent-secondary" />
                    Objetivos
                  </h3>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Proyecto Iterum</span>
                      <span className="text-accent">65%</span>
                    </div>
                    <div className="h-2 bg-bg-primary dark:bg-[--dark-bg-primary] rounded-full overflow-hidden">
                      <div className="h-full bg-accent w-[65%] rounded-full" />
                    </div>
                  </div>
                </div>
              </section>

              <section className="iterum-card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-accent" />
                    Journal
                  </h3>
                  <button className="text-xs text-accent font-semibold">NUEVO</button>
                </div>
                <p className="text-sm text-text-muted dark:text-[--dark-text-muted] italic">
                  "El foco no es lo que haces, sino lo que dejas de hacer..."
                </p>
              </section>
            </aside>
          </div>
        </div>
      </main>

      {/* Modals */}
      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={handleCloseTaskModal} 
        onSave={handleSaveTask}
        initialDate={selectedDate}
        taskToEdit={taskToEdit}
      />

      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={handleCloseHabitModal}
        onSave={handleSaveHabit}
        habitToEdit={habitToEdit}
      />
      
      <AISuggestionModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onApply={(suggestedTasks) => {
          suggestedTasks.forEach(t => addTask(t));
          setIsAIModalOpen(false);
        }}
      />
    </div>
  );
}
