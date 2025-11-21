
import React from 'react';
import { motion } from 'framer-motion';

interface MasteryCardProps {
  xp: number;
  masteryCount: number;
  level: string; // Novice, Intermediate, Scholar
}

export const MasteryCard: React.FC<MasteryCardProps> = ({ xp, masteryCount, level }) => {
  
  // Determine Core Color based on Level
  const getColors = () => {
    switch(level) {
        case 'Scholar': return ['#FCD34D', '#F59E0B', '#B45309']; // Gold/Amber
        case 'Advanced': return ['#D8B4FE', '#A855F7', '#7E22CE']; // Purple
        default: return ['#67E8F9', '#06B6D4', '#0E7490']; // Cyan/Blue
    }
  };

  const [light, mid, dark] = getColors();

  return (
    <div className="relative overflow-hidden rounded-[32px] p-6 min-h-[140px] flex items-center justify-between bg-[#1E1F20] border border-white/5 shadow-xl group cursor-pointer hover:scale-[1.02] transition-transform">
        
        {/* Background Glow */}
        <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-black to-transparent"></div>

        <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: light }}></span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">{level}</span>
                </div>
                <h3 className="text-3xl font-heading font-bold text-white tracking-tight">{masteryCount}</h3>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mt-1 opacity-70">Knowledge Points</p>
            </div>
            
            <div className="mt-4 text-xs font-mono text-white/40">
                XP: {xp.toLocaleString()}
            </div>
        </div>

        {/* The Mana Core Visualization */}
        <div className="relative w-24 h-24 flex items-center justify-center">
            
            {/* Outer Orbit Ring */}
            <motion.div 
                className="absolute inset-0 rounded-full border border-white/10"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/50 blur-[1px]"></div>
            </motion.div>

            {/* Inner Orbit Ring */}
            <motion.div 
                className="absolute inset-2 rounded-full border border-white/5"
                animate={{ rotate: -360 }}
                transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
            >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: light }}></div>
            </motion.div>

            {/* The Living Core */}
            <motion.div
                className="w-12 h-12 rounded-full blur-md"
                style={{
                    background: `radial-gradient(circle at 30% 30%, ${light}, ${mid}, ${dark})`
                }}
                animate={{ 
                    scale: [1, 1.2, 1],
                    filter: [`blur(8px)`, `blur(12px)`, `blur(8px)`]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Core Highlight */}
            <motion.div 
                className="absolute w-12 h-12 rounded-full bg-white/20 mix-blend-overlay"
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
            />

        </div>
    </div>
  );
};