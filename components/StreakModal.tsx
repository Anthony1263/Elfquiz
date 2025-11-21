
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';

interface StreakModalProps {
  isOpen: boolean;
  streakCount: number;
  onClose: () => void;
}

export const StreakModal: React.FC<StreakModalProps> = ({ isOpen, streakCount, onClose }) => {
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const todayIndex = new Date().getDay();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative w-full max-w-[360px] bg-[#1C1C1E] rounded-[32px] p-8 text-center shadow-2xl border border-white/5 overflow-hidden"
          >
             {/* Top Right Icon (Share/Export) */}
             <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
             </button>
             
             {/* Close X */}
             <button onClick={onClose} className="absolute top-6 left-6 text-white/50 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>

             {/* Floating Particles (Decor) */}
             <motion.div 
                className="absolute top-20 left-10 w-2 h-3 bg-orange-400 rounded-full"
                animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
             />
             <motion.div 
                className="absolute top-16 right-20 w-1.5 h-1.5 bg-red-400 rounded-full"
                animate={{ y: [0, -15, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
             />

             {/* Flame Graphic */}
             <div className="relative w-40 h-40 mx-auto mt-8 mb-4">
                 <svg viewBox="0 0 100 120" className="w-full h-full overflow-visible">
                     {/* Outer Flame (Blue/Teal) */}
                     <motion.path 
                        d="M50 120C80 120 95 95 95 65C95 35 60 0 50 0C40 0 5 35 5 65C5 95 20 120 50 120Z"
                        fill="#99F6E4" // Teal-200
                        initial={{ scale: 0.9 }}
                        animate={{ 
                            scale: [0.95, 1.05, 0.95],
                            d: [
                                "M50 120C80 120 95 95 95 65C95 35 60 0 50 0C40 0 5 35 5 65C5 95 20 120 50 120Z",
                                "M50 120C85 120 90 90 90 65C90 30 65 -5 50 -5C35 -5 10 30 10 65C10 90 15 120 50 120Z",
                                "M50 120C80 120 95 95 95 65C95 35 60 0 50 0C40 0 5 35 5 65C5 95 20 120 50 120Z"
                            ]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                     />
                     {/* Inner Flame (Pink) */}
                     <motion.path 
                        d="M50 115C70 115 80 90 80 65C80 40 55 10 50 10C45 10 20 40 20 65C20 90 30 115 50 115Z"
                        fill="#FDA4AF" // Rose-300
                        initial={{ y: 5 }}
                        animate={{ 
                            y: [5, 0, 5],
                            scale: [1, 1.05, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                     />
                     {/* Core (White) */}
                     <motion.path 
                        d="M50 110C60 110 65 90 65 70C65 55 55 30 50 30C45 30 35 55 35 70C35 90 40 110 50 110Z"
                        fill="#FFFFFF"
                        animate={{ opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                     />
                 </svg>
                 
                 {/* Number Overlay */}
                 <div className="absolute inset-0 flex items-center justify-center pt-6">
                     <span className="text-6xl font-heading font-bold text-[#1C1C1E] tracking-tighter">{streakCount}</span>
                 </div>
             </div>

             {/* Text */}
             <h3 className="text-2xl font-heading font-medium text-white mb-8">
                {streakCount} straight days of<br/> learning new words
             </h3>

             {/* Bubbles Row */}
             <div className="bg-[#2C2C2E] rounded-2xl p-4 mb-8 flex justify-between items-center">
                {days.map((day, i) => {
                    const isCompleted = i <= todayIndex && (todayIndex - i) < streakCount;
                    const isToday = i === todayIndex;
                    return (
                        <div key={day} className="flex flex-col items-center gap-2">
                            <span className="text-[10px] font-bold text-white/40 uppercase">{day}</span>
                            {isCompleted ? (
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: i * 0.1 }}
                                    className="w-8 h-8 rounded-full bg-[#99F6E4] flex items-center justify-center relative shadow-[0_0_10px_rgba(153,246,228,0.4)]"
                                >
                                    {/* Checkmark */}
                                    <svg className="w-4 h-4 text-[#1C1C1E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    {/* Star Decor */}
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full"></div>
                                </motion.div>
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-white/10"></div>
                            )}
                        </div>
                    )
                })}
             </div>
             
             <p className="text-xs text-white/60 mb-6">Keep it up! You'll have a 7-day streak soon</p>

             {/* Button */}
             <Button 
                className="w-full bg-[#99F6E4] text-[#1C1C1E] hover:bg-[#5EEAD4] font-bold rounded-full py-4 text-lg transition-all active:scale-95"
                onClick={onClose}
             >
                I commit to 7 days
             </Button>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};