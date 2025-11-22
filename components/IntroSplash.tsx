
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface IntroSplashProps {
  onComplete: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3500); // Slightly longer to allow animation to play out
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 z-[200] bg-[#121212] flex items-center justify-center overflow-hidden"
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      <div className="relative flex flex-col items-center">
        
        {/* Impact Cloud (appears when landing) */}
        <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-10 bg-white/20 rounded-full blur-xl"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 2, 2.5] }}
            transition={{ delay: 0.6, duration: 0.5 }}
        />

        {/* The Falling Text */}
        <motion.div
            initial={{ y: -800, opacity: 1, rotate: -10 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            transition={{ 
                type: "spring", 
                stiffness: 120, 
                damping: 12, 
                mass: 2,
                delay: 0.2 
            }}
            className="relative z-10 flex flex-col items-center"
        >
            <span className="text-9xl font-pixel font-bold text-white">Qz</span>
            
            {/* The Book popping up */}
            <motion.div
                className="absolute -right-8 -bottom-2"
                initial={{ scale: 0, opacity: 0, rotate: -45 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ delay: 1.2, type: "spring" }}
            >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="#A8C7FA" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="#A8C7FA" stroke="#A8C7FA" strokeWidth="2" />
                </svg>
            </motion.div>
        </motion.div>

        <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="text-5xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mt-8 tracking-tight"
        >
            Quiz Elf
        </motion.h1>

        <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            className="text-text-secondary mt-2 font-medium tracking-widest uppercase text-sm"
        >
            Your Magical Study Companion
        </motion.p>
      </div>
    </motion.div>
  );
};
