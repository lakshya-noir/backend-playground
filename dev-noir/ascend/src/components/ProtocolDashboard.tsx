import { AppState } from '../types';
import ThreeDProgress from './ThreeDProgress';
import PomodoroTimer from './PomodoroTimer';
import CourseCard from './CourseCard';
import CalendarView from './CalendarView';
import SignalWidget from './SignalWidget';
import BreakOverlay from './BreakOverlay';
import { AnimatePresence } from 'motion/react';

interface Props {
  state: AppState;
  onUpdateTask: (courseId: string, taskId: string, progress: number) => void;
  onUpdateNotes: (courseId: string, notes: string) => void;
  onUpdateDate: (courseId: string, date: string) => void;
  isBreakActive: boolean;
  setIsBreakActive: (val: boolean) => void;
  onStartFocus: () => void;
  workDuration: number;
  setWorkDuration: (v: number) => void;
}

export default function ProtocolDashboard({ 
  state, 
  onUpdateTask, 
  onUpdateNotes, 
  onUpdateDate,
  isBreakActive,
  setIsBreakActive,
  onStartFocus,
  workDuration,
  setWorkDuration,
}: Props) {
  return (
    <div className="space-y-16">
      {/* Top Section: Analytics & Timer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-stretch">
        <div className="lg:col-span-2 ascend-glass p-12 flex flex-col md:flex-row items-center gap-16 rounded-[32px] border-white/5 bg-black/40">
           <div className="w-full md:w-1/2">
             <h2 className="text-[10px] font-bold text-fire/30 uppercase tracking-[0.4em] mb-10 px-2">Combustion Analytics</h2>
             <ThreeDProgress courses={state.courses} />
           </div>
           
           <div className="w-full md:w-1/2 flex flex-col justify-center gap-8">
              <div className="space-y-6">
                <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Ignition Matrix</h4>
                <div className="space-y-6">
                  {state.courses.map(course => {
                    const progress = Math.round(course.tasks.reduce((acc, t) => acc + t.progress, 0) / course.tasks.length);
                    return (
                      <div key={course.id} className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-bold text-white/40 tracking-widest">{course.code}</span>
                          <span className="text-[11px] font-bold text-fire-glow tabular-nums">{progress}%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                           <div className="h-full burning-bar opacity-80" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    );
                   })}
                </div>
              </div>
           </div>
        </div>
        
        <div className="lg:col-span-1">
          <PomodoroTimer 
            isBreakActive={isBreakActive} 
            setIsBreakActive={setIsBreakActive} 
            onStartFocus={onStartFocus}
            workDuration={workDuration}
            setWorkDuration={setWorkDuration}
          />
        </div>
      </div>

      {/* Main Grid: 6 Course Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {state.courses.map(course => (
          <CourseCard 
            key={course.id} 
            course={course} 
            onUpdateTask={onUpdateTask}
            onUpdateNotes={onUpdateNotes}
            onUpdateDate={onUpdateDate}
          />
        ))}
      </div>

      {/* Calendar: Bottom Section */}
      <div className="w-full">
         <CalendarView courses={state.courses} />
      </div>
    </div>
  );
}
