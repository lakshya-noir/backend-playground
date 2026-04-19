import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import { motion } from 'motion/react';
import { Course } from '../types';

interface Props {
  courses: Course[];
}

export default function ThreeDProgress({ courses }: Props) {
  // Ensure we have all 6 subjects in order for the hexagonal symmetry
  const subjects = ['CIE', 'LA', 'MPCA', 'CN', 'DAA', 'OS'];
  const data = subjects.map(s => {
    const course = courses.find(c => c.code === s);
    const totalProgress = course 
      ? course.tasks.reduce((acc, task) => acc + task.progress, 0) / course.tasks.length 
      : 0;
    return {
      subject: s,
      value: totalProgress,
      fullMark: 100,
    };
  });

  const overallProgress = Math.round(data.reduce((acc, d) => acc + d.value, 0) / subjects.length);

  return (
    <div className="relative w-full aspect-square max-w-[280px] mx-auto flex items-center justify-center group">
      <div className="absolute inset-0 flex items-center justify-center">
         <ResponsiveContainer width="100%" height="100%">
           <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
             <PolarGrid stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3 " />
             <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700 }} 
             />
             <Radar
               name="Ignition"
               dataKey="value"
               stroke="#FFFFFF"
               fill="#FFFFFF"
               fillOpacity={0.25}
               className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]"
             />
           </RadarChart>
         </ResponsiveContainer>
      </div>

      <div className="relative flex flex-col items-center pointer-events-none">
        <span className="text-6xl font-light text-white tabular-nums tracking-tighter text-fire-glow">{overallProgress}%</span>
      </div>
    </div>
  );
}
