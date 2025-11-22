
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WeaknessRadar } from './RadarChart';

interface MasteryHubProps {
  xp: number;
  masteryCount: number;
  level: string; // Novice, Intermediate, Scholar
  radarData: any[];
}

export const MasteryHub: React.FC<MasteryHubProps> = ({ xp, masteryCount, level, radarData }) => {
  const [activeTab, setActiveTab] = useState<'core' | 'map'>('core');

  const getColors = () => {
    switch(level) {
        case 'Scholar': return ['#FCD34D', '#F59E0B', '#B45309']; // Gold
        case 'Advanced': return ['#D8B4FE', '#A855F7', '#7E22CE']; // Purple
        default: return ['#67E8F9', '#06B6D4', '#0E7490']; // Cyan
    }
  };
  const [light, mid, dark] = getColors();

  return (
    <div className="bg-[#1C1C1E] rounded-[40px] p-6 border border-white/5 h-[420px] flex flex-col relative overflow-hidden shadow-xl group">
        
        {/* Header & Tabs */}
        <div className="flex items-center justify-between mb-4 z-20 relative">
            <h3 className="text-lg font-bold text-white ml-2">Knowledge Hub</h3>
            <div className="flex bg-[#121212] rounded-full p-1 border border-white/5">
                <button 
                    onClick={() => setActiveTab('core')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'core' ? 'bg-white text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
                >
                    Rank
                </button>
                <button 
                    onClick={() => setActiveTab('map')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'map' ? 'bg-white text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
                >
                    Map
                </button>
            </div>
        </div>

        <AnimatePresence mode="wait">
            {activeTab === 'core' ? (
                <motion.div 
                    key="core"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex-1 flex flex-col items-center justify-center relative"
                >
                     {/* Background Glow */}
                    <div className="absolute inset-0 opacity-20 bg-gradient-to-b from-transparent to-black/50"></div>

                    {/* Mana Core Visualization */}
                    <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                        {/* Rings */}
                        <motion.div className="absolute inset-0 rounded-full border border-white/10" animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }}>
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white/30 blur-[1px]"></div>
                        </motion.div>
                        <motion.div className="absolute inset-4 rounded-full border border-white/5" animate={{ rotate: -360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
                             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full" style={{ backgroundColor: light }}></div>
                        </motion.div>

                        {/* The Living Blob */}
                        <motion.div
                            className="w-24 h-24 rounded-full blur-lg"
                            style={{ background: `radial-gradient(circle at 30% 30%, ${light}, ${mid}, ${dark})` }}
                            animate={{ scale: [1, 1.15, 1], filter: [`blur(12px)`, `blur(16px)`, `blur(12px)`] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div 
                            className="absolute w-24 h-24 rounded-full bg-white/10 mix-blend-overlay"
                            animate={{ opacity: [0.1, 0.3, 0.1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        />
                    </div>

                    <div className="text-center z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#121212] border border-white/10 backdrop-blur-md mb-3 shadow-lg">
                            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: light }}></span>
                            <span className="text-xs font-bold uppercase tracking-widest text-white">{level}</span>
                        </div>
                        <div className="text-4xl font-heading font-bold text-white tracking-tight mb-1">{masteryCount}</div>
                        <p className="text-xs font-mono text-gray-400">Total XP: {xp.toLocaleString()}</p>
                    </div>
                </motion.div>
            ) : (
                <motion.div 
                    key="map"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex-1 h-full w-full relative"
                >
                    <WeaknessRadar data={radarData} />
                    {radarData.every(d => d.score === 50) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#1C1C1E]/80 backdrop-blur-sm z-10">
                            <p className="text-xs font-bold text-gray-300 px-4 py-2 bg-[#121212] border border-white/10 rounded-full shadow-lg">Complete quizzes to populate map</p>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};
