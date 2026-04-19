/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AppState, Course } from './types';
import ProtocolDashboard from './components/ProtocolDashboard';
import FocusMode from './components/FocusMode';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';


const INITIAL_COURSES: Course[] = [
  {
    id: 'cie',
    code: 'CIE',
    name: 'Entrepreneurship & Innovation',
    examDate: '2026-04-25T09:00:00Z',
    notes: '',
    tasks: [
      { id: 'cie-u3', name: 'Unit 3: Business Model Canvas', progress: 0 },
      { id: 'cie-u4', name: 'Unit 4: Scaling & Exit Strategies', progress: 0 },
    ]
  },
  {
    id: 'la',
    code: 'LA',
    name: 'Linear Algebra',
    examDate: '2026-04-27T09:00:00Z',
    notes: '',
    tasks: [
      { id: 'la-u3', name: 'Unit 3: Eigenvalues & Vectors', progress: 0 },
      { id: 'la-u4', name: 'Unit 4: Orthogonality & Least Squares', progress: 0 },
    ]
  },
  {
    id: 'mpca',
    code: 'MPCA',
    name: 'Microprocessors & Computer Architecture',
    examDate: '2026-04-28T09:00:00Z',
    notes: '',
    tasks: [
      { id: 'mpca-u3', name: 'Unit 3: ARM Instruction Set', progress: 0 },
      { id: 'mpca-u4', name: 'Unit 4: Pipelining & Cache', progress: 0 },
    ]
  },
  {
    id: 'cn',
    code: 'CN',
    name: 'Computer Networks',
    examDate: '2026-04-29T09:00:00Z',
    notes: '',
    tasks: [
      { id: 'cn-u3', name: 'Unit 3: Transport Layer', progress: 0 },
      { id: 'cn-u4', name: 'Unit 4: Application Layer & Security', progress: 0 },
    ]
  },
  {
    id: 'daa',
    code: 'DAA',
    name: 'Design and Analysis of Algorithms',
    examDate: '2026-04-30T09:00:00Z',
    notes: '',
    tasks: [
      { id: 'daa-u3', name: 'Unit 3: Dynamic Programming & Greedy', progress: 0 },
      { id: 'daa-u4', name: 'Unit 4: NP-Completeness & Approximation', progress: 0 },
    ]
  },
  {
    id: 'os',
    code: 'OS',
    name: 'Operating Systems',
    examDate: '2026-05-02T09:00:00Z',
    notes: '',
    tasks: [
      { id: 'os-u3', name: 'Unit 3: Memory Management', progress: 0 },
      { id: 'os-u4', name: 'Unit 4: File Systems & I/O', progress: 0 },
    ]
  }
];

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('protocol_vanguard_state');
    if (saved) return JSON.parse(saved);
    return {
      courses: INITIAL_COURSES,
      lastUsedPomodoroSettings: { work: 30, break: 5 }
    };
  });

  const [loading, setLoading] = useState(true);
  const [isBreakActive, setIsBreakActive] = useState(false);
  
  // Focus Mode Logic
  const [focusState, setFocusState] = useState<'IDLE' | 'SELECTING' | 'ACTIVE'>('IDLE');
  const [selectedTask, setSelectedTask] = useState<{courseId: string, taskId: string, name: string} | null>(null);
  const [workDuration, setWorkDuration] = useState(30);

  useEffect(() => {
    localStorage.setItem('protocol_vanguard_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleUpdateTask = (courseId: string, taskId: string, progress: number) => {
    setState(prev => ({
      ...prev,
      courses: prev.courses.map(c => 
        c.id === courseId 
          ? { ...c, tasks: c.tasks.map(t => t.id === taskId ? { ...t, progress } : t) }
          : c
      )
    }));
  };

  const onSessionEnd = (progressBoost: number) => {
    if (selectedTask) {
      const currentCourse = state.courses.find(c => c.id === selectedTask.courseId);
      const currentTask = currentCourse?.tasks.find(t => t.id === selectedTask.taskId);
      
      if (currentTask) {
        const newProgress = Math.min(100, currentTask.progress + progressBoost);
        handleUpdateTask(selectedTask.courseId, selectedTask.taskId, newProgress);
      }
    }
    setFocusState('IDLE');
    setSelectedTask(null);
  };

  const handleUpdateNotes = (courseId: string, notes: string) => {
    setState(prev => ({
      ...prev,
      courses: prev.courses.map(c => c.id === courseId ? { ...c, notes } : c)
    }));
  };

  const handleUpdateDate = (courseId: string, examDate: string) => {
    setState(prev => ({
      ...prev,
      courses: prev.courses.map(c => c.id === courseId ? { ...c, examDate } : c)
    }));
  };

  const allTasks = state.courses.flatMap(c => 
    c.tasks.map(t => ({ courseId: c.id, courseName: c.code, taskId: t.id, taskName: t.name }))
  );

  const [istDate, setIstDate] = useState('');

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      // IST is UTC+5:30
      const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      const month = (istTime.getUTCMonth() + 1).toString().padStart(2, '0');
      const day = istTime.getUTCDate().toString().padStart(2, '0');
      setIstDate(`${month}·${day}`);
    };
    updateDate();
    const timer = setInterval(updateDate, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-near-black pb-20 selection:bg-fire/30 selection:text-white">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loader"
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-near-black flex flex-col items-center justify-center p-6"
          >
             <div className="w-24 h-0.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                   initial={{ x: '-100%' }}
                   animate={{ x: '100%' }}
                   transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                   className="w-full h-full bg-fire shadow-[0_0_10px_#FFFFFF]"
                />
             </div>
             <motion.span 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="mt-4 text-[10px] tracking-[0.5em] text-fire font-bold uppercase"
             >
               Ascending
             </motion.span>
          </motion.div>
        ) : focusState === 'ACTIVE' && selectedTask ? (
           <FocusMode 
              task={selectedTask}
              duration={workDuration}
              onEnd={onSessionEnd}
           />
        ) : (
          <motion.main 
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto px-6 pt-16 relative"
          >
            {/* FOCUS SELECTION OVERLAY */}
            <AnimatePresence>
               {focusState === 'SELECTING' && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <motion.div 
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       exit={{ opacity: 0 }}
                       className="absolute inset-0 bg-near-black/85 backdrop-blur-[24px]"
                       onClick={() => setFocusState('IDLE')}
                    />
                    <motion.div 
                       initial={{ scale: 0.9, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       exit={{ scale: 0.9, opacity: 0 }}
                       className="relative w-full max-w-2xl bg-white/[0.04] backdrop-blur-[30px] border border-white/10 rounded-[24px] p-8 shadow-2xl"
                    >
                       <h2 className="text-xl font-bold text-white mb-6 tracking-wide text-center uppercase">Select Tactical Objective</h2>
                       <div className="grid grid-cols-2 gap-4 mb-8">
                         {allTasks.map(task => (
                           <button
                             key={task.taskId}
                             onClick={() => setSelectedTask({ courseId: task.courseId, taskId: task.taskId, name: task.taskName })}
                             className={cn(
                               "text-left p-4 rounded-xl border transition-all",
                               selectedTask?.taskId === task.taskId 
                                 ? "border-white/60 bg-white/10 shadow-lg" 
                                 : "border-white/5 bg-white/5 hover:bg-white/[0.08]"
                             )}
                           >
                             <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">{task.courseName}</div>
                             <div className="text-sm font-medium text-white/70 truncate">{task.taskName}</div>
                           </button>
                         ))}
                       </div>
                       <button
                         disabled={!selectedTask}
                         onClick={() => {
                           setFocusState('ACTIVE');
                         }}
                         className="w-full py-4 bg-white text-black rounded-xl font-bold uppercase tracking-[0.2em] transition-opacity disabled:opacity-30 shadow-xl"
                       >
                         Lock In
                       </button>
                    </motion.div>
                  </div>
               )}
            </AnimatePresence>

            {/* ASCEND HEADER */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 px-4">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-fire fire-glow animate-pulse" />
                  <span className="text-[10px] font-bold tracking-[0.3em] text-fire/60 uppercase">Operational Status: Peak</span>
                </div>
                <h1 className="text-6xl md:text-8xl ascend-title">
                  ASCEND
                </h1>
              </div>

              <div className="flex gap-8 items-center border-l border-white/5 pl-8 h-20">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Interval</span>
                  <span className="text-xl font-medium text-fire fire-glow tabular-nums tracking-tighter uppercase">{istDate}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">State</span>
                  <span className="text-xl font-medium text-fire fire-glow tabular-nums tracking-tighter uppercase">Nominal</span>
                </div>
              </div>
            </header>

            <ProtocolDashboard 
              state={state} 
              onUpdateTask={handleUpdateTask}
              onUpdateNotes={handleUpdateNotes}
              onUpdateDate={handleUpdateDate}
              isBreakActive={isBreakActive}
              setIsBreakActive={setIsBreakActive}
              onStartFocus={() => setFocusState('SELECTING')}
              workDuration={workDuration}
              setWorkDuration={setWorkDuration}
            />
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
