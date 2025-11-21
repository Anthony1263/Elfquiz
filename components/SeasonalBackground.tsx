
import React from 'react';
import { motion } from 'framer-motion';

interface SeasonalBackgroundProps {
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
}

export const SeasonalBackground: React.FC<SeasonalBackgroundProps> = ({ season = 'summer' }) => {
  const containerStyle = "fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-background transition-colors duration-1000";

  // ULTRA-OPTIMIZED: Reduced count to 6, removed rotation, increased size/opacity for visibility
  const renderParticles = (count: number, colors: string[], type: 'circle' | 'leaf' | 'snowflake') => {
    return Array.from({ length: count }).map((_, i) => {
      const randomX = Math.random() * 100;
      const delay = Math.random() * 5;
      const duration = 20 + Math.random() * 10; 
      const size = 20 + Math.random() * 40; // Large particles
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      return (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            backgroundColor: color,
            width: size,
            height: size,
            left: `${randomX}%`,
            top: -100,
            opacity: 0.6, // High visibility
            willChange: 'transform',
          }}
          animate={{
            y: ['0vh', '110vh'],
            // Simple translation only for performance
          }}
          transition={{
            duration: duration,
            repeat: Infinity,
            delay: delay,
            ease: "linear"
          }}
        />
      );
    });
  };

  const getGradient = () => {
    switch(season) {
        case 'winter': return 'from-[#1e293b] to-[#0f172a]';
        case 'spring': return 'from-[#064e3b] to-[#022c22]';
        case 'autumn': return 'from-[#451a03] to-[#291508]';
        default: return 'from-[#0c4a6e] to-[#082f49]';
    }
  };

  return (
    <div className={containerStyle}>
      {/* Stronger Gradient opacity for mood */}
      <div className={`absolute inset-0 bg-gradient-to-b ${getGradient()} opacity-30`}></div>

      {season === 'winter' && renderParticles(6, ['#FFFFFF', '#E2E8F0'], 'snowflake')}
      {season === 'autumn' && renderParticles(6, ['#f59e0b', '#ea580c'], 'leaf')}
      {season === 'spring' && renderParticles(6, ['#fbcfe8', '#f472b6', '#86efac'], 'circle')}
      {season === 'summer' && (
        <>
            <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-yellow-400/20 rounded-full blur-[100px]" />
            {renderParticles(5, ['#fde047', '#7dd3fc'], 'circle')}
        </>
      )}
    </div>
  );
};