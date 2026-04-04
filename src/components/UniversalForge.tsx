import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';
import { cn } from '../utils';
import { parseIntent, ForgingIntent } from '../utils/intentParser';
import { feedback } from '../utils/feedback';
import { useTaskStore } from '../store/useTaskStore';

interface UniversalForgeProps {
  isFabExpanded: boolean;
}

export function UniversalForge({ isFabExpanded }: UniversalForgeProps) {
  const [isForging, setIsForging] = useState(false);
  const [text, setText] = useState('');
  const [intent, setIntent] = useState<ForgingIntent>('task');
  const inputRef = useRef<HTMLInputElement>(null);
  const addTask = useTaskStore(state => state.addTask);

  useEffect(() => {
    if (isForging && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isForging]);

  useEffect(() => {
    const parsed = parseIntent(text);
    setIntent(parsed.type);
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsForging(false);
      setText('');
      // Need a subtle suck-in sound/vibration here
    }
    
    // Shift+Enter detailed panel logic goes here (to be implemented)
    
    if (e.key === 'Enter' && !e.shiftKey) {
      if (!text.trim()) return;
      
      const parsed = parseIntent(text);
      if (!parsed.cleanText) return;

      // Persist based on intent
      if (parsed.type === 'task') {
        feedback.tap();
        addTask({
          title: parsed.cleanText,
          description: '',
          date: new Date(),
          type: 'task'
        });
      } else if (parsed.type === 'habit') {
        feedback.tap();
        // Call habit store (mocked for now, assumes you add Habit functionality similar to Task)
        console.log("Create Habit:", parsed.cleanText);
      } else if (parsed.type === 'goal') {
        feedback.success(); // Heavier sound for goals
        console.log("Create Goal:", parsed.cleanText);
      } else if (parsed.type === 'journal') {
        feedback.undo(); // Soft sound for reflection
        console.log("Log Reflection:", parsed.cleanText);
      }

      setIsForging(false);
      setText('');
    }
  };

  // Determine dynamic styling based on intent
  const getDynamicStyles = () => {
    if (intent === 'journal') {
      return "backdrop-blur-xl bg-opacity-40 bg-[#0C0C0C] border border-[#1a202c] shadow-[0_0_20px_rgba(26,32,44,0.5)] caret-blue-900 dark:caret-blue-300";
    }
    if (intent === 'goal') {
      return "bg-bg-primary shadow-[0_0_15px_rgba(201,147,90,0.4)] border border-accent/50";
    }
    // Default task/habit
    return "bg-bg-primary border border-border-subtle shadow-2xl";
  };

  const getPlaceholder = () => {
    if (intent === 'journal') return "Ecribe en el vacío...";
    if (intent === 'goal') return "Define tu cúspide...";
    if (intent === 'habit') return "Define tu disciplina diaria...";
    return "¿Qué vas a forjar?";
  };

  return (
    <motion.div 
      className="fixed bottom-8 left-0 right-0 flex justify-center z-40 px-4"
      animate={{ y: (!isForging && !isFabExpanded) ? 20 : 0 }}
      layout
    >
      <AnimatePresence mode="wait">
        {!isForging ? (
          /* The FAB State */
          <motion.button
            key="fab"
            layoutId="forge-container"
            onClick={() => setIsForging(true)}
            className="flex items-center justify-center rounded-full bg-accent text-bg-primary shadow-2xl transition-all active:scale-90 overflow-hidden"
            animate={{
              width: isFabExpanded ? 160 : 56,
              height: 56,
              borderRadius: 28,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <AnimatePresence mode="wait">
              {isFabExpanded ? (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-bold tracking-[0.1em] text-sm uppercase">FORJAR</span>
                </motion.div>
              ) : (
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Plus className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ) : (
          /* The Command Palette State */
          <motion.div
            key="palette"
            layoutId="forge-container"
            initial={{ width: 160, height: 56, borderRadius: 28 }}
            animate={{ 
              width: intent === 'goal' ? '100%' : '90%', 
              maxWidth: intent === 'goal' ? '800px' : '500px',
              height: intent === 'goal' ? 64 : 56, 
              borderRadius: 16 
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={cn(
              "flex items-center px-4 overflow-hidden transition-all duration-300",
              getDynamicStyles()
            )}
          >
            {/* Visual Intent Prefix Indicator */}
            <div className="mr-3 flex items-center justify-center shrink-0">
               {intent === 'task' && <div className="h-2 w-2 rounded-full bg-text-muted opacity-50" />}
               {intent === 'habit' && <div className="h-3 w-3 rounded border border-accent rotate-45" />}
               {intent === 'journal' && <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />}
               {intent === 'goal' && <div className="h-3 w-3 rounded-sm bg-accent shadow-[0_0_8px_rgba(201,147,90,0.8)]" />}
            </div>

            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (!text) setIsForging(false);
              }}
              placeholder={getPlaceholder()}
              className={cn(
                "w-full h-full bg-transparent outline-none placeholder:opacity-40 transition-all",
                intent === 'journal' ? "font-serif text-white text-lg" : "font-sans text-text-primary",
                intent === 'goal' ? "text-xl font-bold tracking-tight" : "text-base"
              )}
              spellCheck={false}
              autoComplete="off"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
