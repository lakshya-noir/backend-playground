import { Shield, Clock, BookMarked, Edit3, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Course } from '../types';
import { cn } from '../lib/utils';
import { differenceInDays, parseISO, format } from 'date-fns';

interface Props {
  key?: string | number;
  course: Course;
  onUpdateTask: (courseId: string, taskId: string, progress: number) => void;
  onUpdateNotes: (courseId: string, notes: string) => void;
  onUpdateDate: (courseId: string, date: string) => void;
}

export default function CourseCard({ course, onUpdateTask, onUpdateNotes, onUpdateDate }: Props) {
  const averageProgress = Math.round(course.tasks.reduce((acc, t) => acc + t.progress, 0) / course.tasks.length);
  
  const examDate = parseISO(course.examDate);
  const today = new Date();
  const daysLeft = differenceInDays(examDate, today);

  const getStatusColor = (days: number) => {
    if (days < 2) return 'text-amber-fire font-bold';
    return 'text-white/40';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className="ascend-glass flex flex-col h-full hover:bg-white/[0.06] transition-all group overflow-hidden border-white/5 min-h-[420px]"
    >
      <div className="p-8 flex flex-col gap-6 shrink-0">
        <div className="flex justify-between items-start">
          <div className="space-y-1.5">
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-fire/40 tracking-[0.2em]">{course.code.toUpperCase()}</span>
                <div className="w-1 h-1 rounded-full bg-fire/20" />
             </div>
             <h3 className="text-xl font-medium text-white/90 tracking-tight leading-tight">{course.name}</h3>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-3xl font-light tabular-nums tracking-tighter text-fire-glow">{averageProgress}%</span>
             <span className={cn("text-[10px] uppercase font-bold mt-1 tracking-[0.2em]", getStatusColor(daysLeft))}>
               {daysLeft < 0 ? 'Ignited' : `${daysLeft}d left`}
             </span>
          </div>
        </div>

        {/* PROGRESS TRACK */}
        <div className="h-[3px] w-full bg-white/6 rounded-full border border-white/[0.08]">
           <motion.div 
             className="h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.3)] rounded-full"
             initial={{ width: 0 }}
             whileInView={{ width: `${averageProgress}%` }}
             transition={{ duration: 1.2, ease: "easeOut" }}
           />
        </div>
      </div>

      <div className="px-8 py-8 border-t border-white/5 space-y-10 flex-1">
        <div className="space-y-8">
          {course.tasks.map((task) => (
            <div key={task.id} className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2 group/task">
                  <ChevronRight className="w-3 h-3 text-fire/40" />
                  <span className="text-[11px] font-medium text-white/40 tracking-wide uppercase">{task.name}</span>
                </div>
                <span className="text-[11px] font-bold text-fire/60 tabular-nums">{task.progress}%</span>
              </div>
              <div className="relative h-[3px] w-full bg-white/6 rounded-full border border-white/[0.08] flex items-center">
                <div 
                  className="absolute inset-y-0 left-0 bg-white shadow-[0_0_8px_rgba(255,255,255,0.3)] rounded-full"
                  style={{ width: `${task.progress}%` }}
                />
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={task.progress}
                  onInput={(e) => onUpdateTask(course.id, task.id, parseInt((e.target as HTMLInputElement).value))}
                  className="absolute inset-0 w-full h-full bg-transparent appearance-none cursor-pointer z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[14px] [&::-webkit-slider-thumb]:h-[14px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(255,255,255,0.8)] [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-20 transition-all active:[&::-webkit-slider-thumb]:scale-125 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-[14px] [&::-moz-range-thumb]:h-[14px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_0_6px_rgba(255,255,255,0.8)] [&::-moz-range-thumb]:border-none"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6 pt-2">
           <div className="flex flex-col gap-2">
             <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">Ignition Date</label>
             <input 
               type="date"
               value={course.examDate.split('T')[0]}
               onChange={(e) => onUpdateDate(course.id, new Date(e.target.value).toISOString())}
               className="bg-transparent border-none text-xs text-white/50 focus:ring-0 p-0 cursor-pointer hover:text-white transition-colors"
             />
           </div>
           
           <div className="flex flex-col gap-2 bg-black/20 p-3 rounded-lg border border-white/5 focus-within:border-white/20 focus-within:bg-black/40 transition-all">
             <textarea 
               value={course.notes}
               onChange={(e) => onUpdateNotes(course.id, e.target.value)}
               className="w-full bg-transparent border-none p-0 text-xs text-white/30 focus:text-white/60 focus:ring-0 focus:outline-none resize-none min-h-[100px] leading-relaxed"
             />
           </div>
        </div>
      </div>
    </motion.div>
  );
}
