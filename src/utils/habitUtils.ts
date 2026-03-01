import { format, isSameDay, parseISO, startOfDay, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Habit, HabitLog } from '../types';

export function shouldHabitOccurOnDate(frequency: string, date: Date): boolean {
  const dayName = format(date, 'EEE', { locale: es }).toLowerCase(); // lun, mar, mié, jue, vie, sáb, dom
  
  if (frequency === 'daily') return true;
  
  if (frequency.startsWith('weekly:')) {
    const days = frequency.split(':')[1].toLowerCase().split(',');
    // Map English-ish short names to Spanish short names if necessary, 
    // but let's assume the user input or system uses standard short codes.
    // For simplicity, let's use: mon, tue, wed, thu, fri, sat, sun mapping.
    const dayMap: Record<string, string> = {
      'mon': 'lun', 'tue': 'mar', 'wed': 'mié', 'thu': 'jue', 'fri': 'vie', 'sat': 'sáb', 'sun': 'dom',
      'monday': 'lun', 'tuesday': 'mar', 'wednesday': 'mié', 'thursday': 'jue', 'friday': 'vie', 'saturday': 'sáb', 'sunday': 'dom'
    };
    
    const normalizedDays = days.map(d => dayMap[d] || d);
    return normalizedDays.includes(dayName);
  }
  
  if (frequency.startsWith('everyXdays:')) {
    const x = parseInt(frequency.split(':')[1], 10);
    // This usually needs a reference start date. Let's assume createdAt or a fixed epoch.
    // For now, let's keep it simple: days since epoch % x === 0.
    const daysSinceEpoch = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
    return daysSinceEpoch % x === 0;
  }
  
  return false;
}

export function calculateCurrentStreak(logs: HabitLog[], habit: Habit): number {
  if (!logs.length) return 0;
  
  const sortedLogs = [...logs]
    .filter(l => l.habitId === habit.id && l.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
  if (!sortedLogs.length) return 0;

  let streak = 0;
  let checkDate = startOfDay(new Date());
  
  // If today is a habit day and not completed, we check from yesterday
  const todayCompleted = sortedLogs.find(l => isSameDay(parseISO(l.date), checkDate));
  
  if (!todayCompleted) {
    // If today is a habit day but not yet completed, the streak might still be alive from yesterday
    if (shouldHabitOccurOnDate(habit.frequency, checkDate)) {
      checkDate = subDays(checkDate, 1);
    } else {
      // If today is NOT a habit day, we check from the last day it SHOULD have occurred
      while (!shouldHabitOccurOnDate(habit.frequency, checkDate)) {
        checkDate = subDays(checkDate, 1);
      }
    }
  }

  // Now count backwards
  let currentIdx = 0;
  while (true) {
    if (shouldHabitOccurOnDate(habit.frequency, checkDate)) {
      const log = sortedLogs.find(l => isSameDay(parseISO(l.date), checkDate));
      if (log && log.completed) {
        streak++;
      } else {
        // If it was a habit day and not completed, streak ends
        // Exception: if checkDate is today and we haven't completed it yet, 
        // we already handled that by moving checkDate to yesterday.
        break;
      }
    }
    checkDate = subDays(checkDate, 1);
    
    // Safety break
    if (streak > 1000) break;
  }

  return streak;
}
