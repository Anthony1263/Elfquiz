
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';

interface LoadingOverlayProps {
  isProcessingPdf?: boolean;
}

const loadingMessages = [
  "Consulting the Archives...",
  "Brewing Knowledge Potions...",
  "Summoning Exam Questions...",
  "Calibrating Magic Wands...",
];

const pdfMessages = [
  "Reading Ancient Scrolls...",
  "Deciphering Runes...",
  "Extracting Wisdom...",
  "Binding Context Spell...",
];

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isProcessingPdf }) => {
  const [scene, setScene] = useState<'elf' | 'leaves'>('elf');
  const [msgIndex, setMsgIndex] = useState(0);
  
  const messages = isProcessingPdf ? pdfMessages : loadingMessages;

  useEffect(() => {
    // Randomly pick a scene on mount
    setScene(Math.random() > 0.5 ? 'elf' : 'leaves');

    const interval = setInterval(() => {
        setMsgIndex(prev => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#121212] text-white">
      
      {/* Scene Container */}
      <div className="relative w-64 h-48 mb-8 rounded-[32px] bg-surface-highlight/10 border border-white/5 overflow-hidden flex items-center justify-center shadow-[0_0_40px_rgba(168,199,250,0.1)]">
         
         {scene === 'elf' ? (
             <div className="relative w-full h-full overflow-hidden">
                 {/* Moving Ground */}
                 <div className="absolute bottom-0 w-full h-8 bg-[#2D2E30]"></div>
                 
                 {/* Crossing Pixel Elf */}
                 <motion.div
                    className="absolute bottom-4"
                    initial={{ x: -60 }}
                    animate={{ x: 300 }} 
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                 >
                    {/* Walking Bob */}
                    <motion.div
                         animate={{ y: [0, -4, 0] }}
                         transition={{ duration: 0.2, repeat: Infinity }}
                    >
                        <Logo className="w-16 h-16" />
                    </motion.div>
                 </motion.div>

                 {/* Passing Trees (Decor) */}
                 {[1, 2, 3].map(i => (
                     <motion.div
                        key={i}
                        className="absolute bottom-8 w-4 h-12 bg-white/5 rounded-t-full"
                        initial={{ x: 300 }}
                        animate={{ x: -50 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: i * 1 }}
                     />
                 ))}
             </div>
         ) : (
             <div className="relative w-full h-full">
                 {/* Tree Trunk */}
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-32 bg-[#5D4037] rounded-t-lg opacity-50"></div>
                 
                 {/* Falling Leaves */}
                 {Array.from({length: 8}).map((_, i) => (
                     <motion.div
                        key={i}
                        className="absolute w-3 h-3 bg-orange-400 rounded-tl-lg rounded-br-lg"
                        initial={{ top: -20, left: `${Math.random() * 100}%`, opacity: 0 }}
                        animate={{ 
                            top: 200, 
                            opacity: [0, 1, 0],
                            rotate: 360,
                            x: Math.random() * 40 - 20
                        }}
                        transition={{ 
                            duration: 2.5, 
                            repeat: Infinity, 
                            delay: i * 0.4,
                            ease: "linear"
                        }}
                     />
                 ))}
             </div>
         )}
      </div>

      {/* Text */}
      <AnimatePresence mode="wait">
        <motion.p
          key={msgIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-xl font-heading font-medium text-primary tracking-wide"
        >
          {messages[msgIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};