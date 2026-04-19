import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import * as THREE from 'three';


interface Props {
  task: { name: string };
  duration: number;
  onEnd: (progressBoost: number) => void;
}

export default function FocusMode({ task, duration, onEnd }: Props) {
  const timeRef = useRef(duration * 60);
  const [_, forceRender] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const rainCanvasRef = useRef<HTMLCanvasElement>(null);
  const lastStrikeTime = useRef<number>(0);

  useEffect(() => {
    let interval: any;
    if (isActive && timeRef.current > 0) {
      interval = setInterval(() => {
        timeRef.current -= 1;
        forceRender(t => t + 1);
        if (timeRef.current <= 0) {
          onEnd(15);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, onEnd]);

  // --- Rain Canvas Effect ---
  useEffect(() => {
    const canvas = rainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const streaks = Array.from({ length: 200 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      len: 15 + Math.random() * 10,
    }));

    const updateRain = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Fixed opacity to prevent 'blinking'
      ctx.strokeStyle = 'rgba(180, 220, 255, 0.25)';
      ctx.lineWidth = 0.5;

      streaks.forEach(s => {
        s.y += 18;
        s.x += 3;

        if (s.y > canvas.height) {
          s.y = -s.len;
          s.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + 3, s.y + s.len);
        ctx.stroke();
      });

      animId = requestAnimationFrame(updateRain);
    };

    updateRain();
    return () => cancelAnimationFrame(animId);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Three.js Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x00000F);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 500;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // --- Atmospheric Clouds ---
    const cloudPlanes: THREE.Mesh[] = [];
    const cloudGeom = new THREE.PlaneGeometry(3000, 2000);
    
    for (let i = 0; i < 3; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0x000818,
        transparent: true,
        opacity: 0.15 + i * 0.1,
        side: THREE.DoubleSide
      });
      const cloud = new THREE.Mesh(cloudGeom, mat);
      cloud.position.z = -200 - i * 300;
      cloud.position.x = (Math.random() - 0.5) * 1000;
      scene.add(cloud);
      cloudPlanes.push(cloud);
    }

    // --- Lightning Engine ---
    const activeBolts: { line: THREE.Line; startTime: number; duration: number; light?: THREE.PointLight }[] = [];

    const createBolt = (start: THREE.Vector3, end: THREE.Vector3, depth: number, opacity: number = 1.0): THREE.Line => {
      const points: THREE.Vector3[] = [start];
      
      const subdivide = (p1: THREE.Vector3, p2: THREE.Vector3, level: number) => {
        if (level <= 0) return;
        
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        const dist = p1.distanceTo(p2);
        const offset = dist * 0.4;
        
        mid.x += (Math.random() - 0.5) * offset;
        mid.y += (Math.random() - 0.5) * offset;
        mid.z += (Math.random() - 0.5) * offset;
        
        subdivide(p1, mid, level - 1);
        points.push(mid);
        subdivide(mid, p2, level - 1);
      };

      subdivide(start, end, depth);
      points.push(end);

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ 
        color: 0x00BFFF, 
        transparent: true, 
        opacity,
        linewidth: 2, // Bolder bolts
      });
      
      return new THREE.Line(geometry, material);
    };

    const spawnLightning = () => {
      // Calculate actual visible boundaries at z=0
      const vFOV = THREE.MathUtils.degToRad(camera.fov);
      const visibleHeight = 2 * Math.tan(vFOV / 2) * Math.abs(camera.position.z);
      const visibleWidth = visibleHeight * (window.innerWidth / window.innerHeight);

      const topEdge = visibleHeight / 2;
      const bottomEdge = -visibleHeight / 2;
      const leftEdge = -visibleWidth / 2;
      const rightEdge = visibleWidth / 2;
      
      lastStrikeTime.current = performance.now();
      
      const startX = (Math.random() - 0.5) * visibleWidth;
      const start = new THREE.Vector3(startX, topEdge, 0); // Spawning from top edge
      const end = new THREE.Vector3(
        startX + (Math.random() - 0.5) * 400, 
        bottomEdge - 100, // Striking past the bottom edge
        0
      );
      
      const mainBolt = createBolt(start, end, 6);
      scene.add(mainBolt);

      // Ambient Glow Flash
      const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      const flash = new THREE.PointLight(0x00BFFF, 6, 1200);
      flash.position.copy(midPoint);
      scene.add(flash);

      activeBolts.push({ line: mainBolt, startTime: performance.now(), duration: 150, light: flash });

      // Branching
      if (Math.random() < 0.3) {
        const branchCount = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < branchCount; i++) {
          const branchStart = start.clone().lerp(end, Math.random() * 0.5);
          const branchOffset = new THREE.Vector3(
            (Math.random() - 0.5) * 500,
            -Math.random() * 600,
            (Math.random() - 0.5) * 150
          );
          const branchEnd = branchStart.clone().add(branchOffset);
          const branchBolt = createBolt(branchStart, branchEnd, 3, 0.7);
          scene.add(branchBolt);
          activeBolts.push({ line: branchBolt, startTime: performance.now(), duration: 150 });
        }
      }
    };

    // Cadence Control
    let nextBoltTime = performance.now() + 1000;
    let surgeTime = performance.now() + 5000;

    const animate = (time: number) => {
      // Cloud drift
      cloudPlanes.forEach((cp, i) => {
        cp.position.x += (0.2 + i * 0.1);
        if (cp.position.x > 1500) cp.position.x = -1500;
      });

      // Spawn Logic
      if (time > nextBoltTime) {
        spawnLightning();
        nextBoltTime = time + 800 + Math.random() * 400;
      }

      if (time > surgeTime) {
        // Trigger Surge
        for (let i = 0; i < 4; i++) {
          setTimeout(() => spawnLightning(), i * 80);
        }
        surgeTime = time + 4000 + Math.random() * 2000;
      }

      // Cleanup & Fading
      for (let i = activeBolts.length - 1; i >= 0; i--) {
        const bolt = activeBolts[i];
        const elapsed = time - bolt.startTime;
        
        if (elapsed > bolt.duration) {
          scene.remove(bolt.line);
          bolt.line.geometry.dispose();
          (bolt.line.material as THREE.Material).dispose();
          if (bolt.light) {
             scene.remove(bolt.light);
             bolt.light.dispose();
          }
          activeBolts.splice(i, 1);
        } else {
          const fade = 1 - (elapsed / bolt.duration);
          const mat = bolt.line.material as THREE.LineBasicMaterial;
          mat.opacity = 0.9 * fade;
          if (bolt.light) {
            const lightFade = 1 - (elapsed / 200);
            bolt.light.intensity = 2 * Math.max(0, lightFade);
          }
        }
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    let animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer.dispose();
    };
  }, []);

  const mins = Math.floor(timeRef.current / 60);
  const secs = timeRef.current % 60;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-[#00000F] flex flex-col items-center justify-center overflow-hidden"
    >
      <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none" />
      <canvas ref={rainCanvasRef} className="fixed inset-0 z-[1] pointer-events-none" />
      
      {/* Cinematic Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,#000_150%)] z-[5] pointer-events-none" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 flex flex-col items-center gap-12"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-fire/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="text-[140px] font-normal tracking-[0.05em] text-white tabular-nums leading-none text-fire-glow font-timer">
          {mins}:{secs.toString().padStart(2, '0')}
        </div>

        <div className="mt-8">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-fire/50 font-['Courier_New',_monospace]">
            // ATMOSPHERE COMPROMISED
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
