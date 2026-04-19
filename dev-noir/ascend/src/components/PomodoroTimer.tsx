import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';


interface Props {
  isBreakActive: boolean;
  setIsBreakActive: (val: boolean) => void;
  onStartFocus: () => void;
  workDuration: number;
  setWorkDuration: (v: number) => void;
}

export default function PomodoroTimer({ 
  isBreakActive, 
  setIsBreakActive, 
  onStartFocus, 
  workDuration, 
  setWorkDuration,
}: Props) {
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
// ... existing state/effects ...
  useEffect(() => {
    setTimeLeft(workDuration * 60);
  }, [workDuration]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timerRef.current!);
      setIsActive(false);
      
      const nextIsBreak = !isBreakActive;
      setIsBreakActive(nextIsBreak);
      setTimeLeft((nextIsBreak ? 5 : workDuration) * 60); 
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, isBreakActive, workDuration, setIsBreakActive]);

  const toggleTimer = () => {
    if (!isBreakActive) {
      onStartFocus();
    } else {
      setIsActive(!isActive);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreakActive(false);
    setTimeLeft(workDuration * 60);
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const percentage = (timeLeft / (workDuration * 60)) * 100;
  const durationOptions = [30, 60, 90];

  return (
    <div 
      ref={cardRef} 
      className="ascend-glass p-8 rounded-[32px] relative overflow-hidden flex flex-col items-center justify-between min-h-[460px] bg-black/60 shadow-2xl border-white/5"
    >
      <div className="w-full flex justify-between items-center mb-6">
        <span className="text-[10px] font-bold tracking-[0.4em] text-fire uppercase">
          {isBreakActive ? 'Repose' : 'Combustion'}
        </span>
        <div className={cn(
          "w-2 h-2 rounded-full",
          isActive ? "bg-fire fire-glow animate-pulse" : "bg-fire/20"
        )} />
      </div>

      <div className="flex flex-col items-center">
        <div className="text-8xl font-light tracking-tighter tabular-nums text-white/90 mb-8 text-fire-glow">
          {formatTime(timeLeft)}
        </div>
        
        <div className="w-64 h-1 bg-white/5 rounded-full relative overflow-hidden">
          <motion.div 
            className="h-full burning-bar shadow-none"
            initial={{ width: '100%' }}
            animate={{ width: `${percentage}%` }}
            transition={{ ease: "linear", duration: 1 }}
          />
        </div>
      </div>

      <div className="w-full space-y-8">
        {!isBreakActive && (
          <div className="segmented-control p-1.5 bg-black/40 border-white/5 shadow-inner">
            {durationOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setWorkDuration(opt)}
                className={cn(
                  "segmented-item flex-1",
                  workDuration === opt && "segmented-item-active"
                )}
              >
                {opt}m
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={toggleTimer}
            className="flex-1 py-5 bg-fire/80 hover:bg-fire text-black rounded-[20px] transition-all flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-[11px] fire-glow active:scale-95"
          >
            {isBreakActive ? (isActive ? <Pause /> : <Play />) : <Play className="fill-current" />}
            {isBreakActive ? (isActive ? 'Suspend' : 'Ignite') : 'Ignite'}
          </button>
          <button
            onClick={resetTimer}
            className="w-16 h-16 bg-white/5 hover:bg-white/10 text-white rounded-[20px] transition-all flex items-center justify-center border border-white/5 active:scale-90"
          >
            <RotateCcw className="w-5 h-5 text-white/30 hover:text-white transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
}
