import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { Course } from '../types';
import { cn } from '../lib/utils';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Props {
  courses: Course[];
}

export default function CalendarView({ courses }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDayExams = (day: Date) => {
    return courses.filter(c => isSameDay(parseISO(c.examDate), day));
  };

  const nextMonth = () => setCurrentDate(new Date(new Date(currentDate).setMonth(currentDate.getMonth() + 1)));
  const prevMonth = () => setCurrentDate(new Date(new Date(currentDate).setMonth(currentDate.getMonth() - 1)));

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="ascend-glass rounded-[24px] overflow-hidden border-white/5">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">{format(currentDate, 'MMMM')}</h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-1 hover:bg-white/5 rounded-full transition-colors"><ChevronLeft className="w-4 h-4 text-white/40" /></button>
          <button onClick={nextMonth} className="p-1 hover:bg-white/5 rounded-full transition-colors"><ChevronRight className="w-4 h-4 text-white/40" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-white/5">
        {dayNames.map((name, i) => (
          <div key={`${name}-${i}`} className="py-3 text-center text-[10px] font-bold text-fire/40 uppercase">
            {name}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {/* Placeholder for days before month start */}
        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {days.map(day => {
          const dayExams = getDayExams(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div 
              key={day.toISOString()} 
              className={cn(
                "aspect-square p-2 relative flex flex-col items-center",
                isToday && "bg-fire/10"
              )}
            >
              <span className={cn(
                "text-[10px] font-medium tabular-nums",
                isToday ? "text-fire text-fire-glow font-bold" : "text-white/30"
              )}>
                {format(day, 'd')}
              </span>
              
              <div className="mt-1.5 flex flex-wrap justify-center gap-1">
                {dayExams.map(course => (
                  <div 
                    key={course.id} 
                    className="w-1 h-1 bg-fire rounded-full fire-glow"
                    title={course.name}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
