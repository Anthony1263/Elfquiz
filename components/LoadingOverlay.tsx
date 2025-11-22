
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingOverlayProps {
  isProcessingPdf?: boolean;
}

const loadingMessages = [
  "Consulting the Archives...",
  "Brewing Knowledge Potions...",
  "Summoning Exam Questions...",
  "Calibrating Magic Wands...",
  "Polishing Pixels...",
];

const pdfMessages = [
  "Reading Ancient Scrolls...",
  "Deciphering Runes...",
  "Extracting Wisdom...",
  "Binding Context Spell...",
];

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isProcessingPdf }) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const messages = isProcessingPdf ? pdfMessages : loadingMessages;

  useEffect(() => {
    const msgInterval = setInterval(() => {
        setMsgIndex(prev => (prev + 1) % messages.length);
    }, 2500);

    // Fake progress bar for visual feedback
    const progressInterval = setInterval(() => {
        setProgress(prev => {
            if (prev >= 100) return 0;
            return prev + Math.random() * 5; // Random increments
        });
    }, 200);

    return () => {
        clearInterval(msgInterval);
        clearInterval(progressInterval);
    };
  }, [messages.length]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505]/95 backdrop-blur-xl text-white font-pixel">
      
      {/* Ambient Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]"
            animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      <div className="relative flex flex-col items-center z-10">
         
         {/* PIXEL ART GRIMOIRE ANIMATION */}
         <div className="relative w-32 h-32 mb-8">
            {/* Floating Magic Particles */}
            {[...Array(12)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-secondary"
                    initial={{ x: 64, y: 64, opacity: 0, scale: 0 }}
                    animate={{ 
                        y: -40,
                        x: 64 + (Math.random() - 0.5) * 100,
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                        rotate: Math.random() * 90
                    }}
                    transition={{ 
                        duration: 2 + Math.random(), 
                        repeat: Infinity, 
                        delay: Math.random() * 2,
                        ease: "easeOut"
                    }}
                    style={{
                        imageRendering: 'pixelated',
                        boxShadow: '0 0 8px #E2B6FF' // Glow
                    }}
                />
            ))}

            {/* The Pixel Book SVG */}
            <motion.svg 
                viewBox="0 0 32 32" 
                className="w-full h-full drop-shadow-[0_0_30px_rgba(168,199,250,0.4)]"
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{ shapeRendering: "crispEdges" }} // Ensures pixel art look
            >
                {/* Back Cover */}
                <rect x="2" y="6" width="28" height="22" fill="#2D2E30" />
                <rect x="0" y="8" width="32" height="20" fill="#1E1F20" />
                
                {/* Pages (Layered) */}
                <rect x="4" y="10" width="24" height="16" fill="#F3F4F6" />
                <rect x="4" y="25" width="24" height="2" fill="#D1D5DB" /> {/* Page shadow */}
                
                {/* Spine / Binding */}
                <rect x="15" y="10" width="2" height="16" fill="#E5E7EB" />
                
                {/* Cover Details */}
                <rect x="0" y="8" width="4" height="20" fill="#3B82F6" /> {/* Spine Color */}
                <rect x="28" y="8" width="4" height="20" fill="#3B82F6" /> {/* Edge Color */}
                
                {/* Magic Rune on Page (Animated) */}
                <motion.g
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <rect x="8" y="14" width="6" height="2" fill="#A8C7FA" />
                    <rect x="8" y="18" width="4" height="2" fill="#A8C7FA" />
                    <rect x="19" y="14" width="6" height="2" fill="#A8C7FA" />
                    <rect x="19" y="18" width="4" height="2" fill="#A8C7FA" />
                    <rect x="19" y="22" width="5" height="2" fill="#A8C7FA" />
                </motion.g>

                {/* Magical Glow Overlay */}
                <rect x="4" y="10" width="24" height="16" fill="#A8C7FA" fillOpacity="0.1" />
            </motion.svg>
         </div>

         {/* Text Container */}
         <div className="h-12 flex flex-col items-center">
            <AnimatePresence mode="wait">
                <motion.p
                key={msgIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-2xl md:text-3xl text-primary tracking-wide text-center"
                >
                {messages[msgIndex]}
                </motion.p>
            </AnimatePresence>
         </div>

         {/* Retro Loading Bar */}
         <div className="mt-8 w-64 h-4 bg-[#1E1F20] border-2 border-white/20 p-0.5 rounded-sm relative">
            <motion.div 
                className="h-full bg-secondary relative overflow-hidden"
                style={{ width: `${Math.min(progress, 100)}%` }}
            >
                {/* Shine effect on bar */}
                <motion.div 
                    className="absolute top-0 bottom-0 w-10 bg-white/30 skew-x-12"
                    animate={{ x: [-20, 300] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
            </motion.div>
         </div>
         <p className="mt-2 text-xs text-white/40 tracking-widest uppercase">Loading Resources...</p>
      </div>
    </div>
  );
};
