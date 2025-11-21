
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { QuizResult } from '../types';

interface ReportCardProps {
  result: QuizResult;
  onHome: () => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ result, onHome }) => {
  const [count, setCount] = useState(0);
  
  // Animate score counting up
  useEffect(() => {
    const duration = 1500; // 1.5s
    const steps = 60;
    const intervalTime = duration / steps;
    const increment = result.score / steps;
    
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= result.score) {
        setCount(result.score);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [result.score]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121212]/90 backdrop-blur-xl animate-fade-in">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="bg-[#1E1F20] border border-white/10 rounded-[48px] p-10 max-w-md w-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col items-center"
      >
        {/* Background Glow */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-secondary/20 rounded-full blur-[80px] pointer-events-none"></div>

        {/* Header */}
        <h2 className="text-text-secondary font-bold uppercase tracking-[0.2em] text-xs mb-8 z-10">Session Complete</h2>
        
        {/* Score Circle */}
        <div className="relative w-56 h-56 flex items-center justify-center mb-8">
            {/* SVG Ring Background */}
            <svg className="w-full h-full transform -rotate-90 overflow-visible">
                {/* Track */}
                <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-surface-highlight opacity-30" />
                {/* Progress */}
                <motion.circle 
                    cx="112" cy="112" r="100" 
                    stroke="currentColor" strokeWidth="12" 
                    fill="transparent" 
                    className={`${result.accuracy >= 80 ? 'text-success' : result.accuracy >= 50 ? 'text-[#FCD34D]' : 'text-[#FDA4AF]'}`}
                    strokeDasharray={628} // 2 * pi * 100
                    initial={{ strokeDashoffset: 628 }}
                    animate={{ strokeDashoffset: 628 - (628 * result.accuracy) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                    strokeLinecap="round"
                />
            </svg>
            
            <div className="absolute flex flex-col items-center">
                <span className="text-7xl font-heading font-bold text-white tracking-tighter">{count}</span>
                <span className="text-text-secondary font-medium text-lg mt-1">/ {result.total}</span>
            </div>
        </div>

        <h1 className="text-2xl font-heading font-bold text-white mb-2 text-center leading-tight px-4">{result.topic}</h1>
        
        {/* XP Badge */}
        <div className="bg-gradient-to-r from-[#FCD34D] to-[#F59E0B] text-[#451a03] px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 mb-8 shadow-lg shadow-amber-500/20">
            <span>+{result.xpEarned} XP Earned</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" /></svg>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 w-full mb-8">
            <div className="bg-surface-highlight/50 rounded-[24px] p-4 text-center border border-white/5">
                <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Status</div>
                <div className={`text-lg font-bold ${result.accuracy >= 70 ? 'text-success' : 'text-text-primary'}`}>
                    {result.accuracy >= 70 ? 'Passed' : 'Review'}
                </div>
            </div>
            <div className="bg-surface-highlight/50 rounded-[24px] p-4 text-center border border-white/5">
                <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Accuracy</div>
                <div className="text-lg font-bold text-white">{Math.round(result.accuracy)}%</div>
            </div>
            <div className="bg-surface-highlight/50 rounded-[24px] p-4 text-center border border-white/5">
                <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Time</div>
                <div className="text-lg font-bold text-white">{formatTime(result.timeTaken)}</div>
            </div>
        </div>

        <Button onClick={onHome} variant="filled" className="w-full rounded-[20px] bg-white text-black hover:bg-gray-200 font-bold py-4 shadow-xl shadow-white/5 transition-transform hover:scale-[1.02] active:scale-95">
            Return to Dashboard
        </Button>
      </motion.div>
    </div>
  );
};