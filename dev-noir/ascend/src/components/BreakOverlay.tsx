import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const SUGGESTIONS = [
  "Go for a walk",
  "Drink water",
  "Box breathe: 4-4-4-4",
  "Look out a window for 2 min",
  "Stretch"
];

export default function BreakOverlay() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SUGGESTIONS.length);
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="ascend-glass p-12 rounded-[24px] h-[200px] flex flex-col items-center justify-center relative overflow-hidden bg-fire/5 border-fire/20"
    >
      <div className="absolute top-6 left-8 flex items-center gap-3">
         <div className="w-1.5 h-1.5 rounded-full bg-amber-fire shadow-[0_0_8px_#FFFFFF] animate-pulse" />
         <span className="text-[10px] font-bold tracking-[0.4em] text-amber-fire/80 uppercase">REPOSE</span>
      </div>
      
      <div className="h-24 flex items-center justify-center px-12">
        <AnimatePresence mode="wait">
          <motion.p
            key={SUGGESTIONS[index]}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="text-lg font-medium text-white/70 text-center italic tracking-tight"
          >
            {SUGGESTIONS[index]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-6 w-full flex justify-center gap-1.5 opacity-20">
         {SUGGESTIONS.map((_, i) => (
           <div 
             key={i} 
             className={cn(
               "h-1 transition-all duration-500 rounded-full",
               i === index ? "w-6 bg-fire" : "w-1.5 bg-white"
             )} 
           />
         ))}
      </div>
    </motion.div>
  );
}
