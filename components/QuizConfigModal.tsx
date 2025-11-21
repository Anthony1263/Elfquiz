import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { QuizConfig } from '../types';
import { extractTextFromPdf } from '../services/pdfService';

interface QuizConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (config: QuizConfig, pdfText?: string) => void;
  isGenerating: boolean;
}

type AnalysisState = 'idle' | 'processing' | 'ready' | 'error';

export const QuizConfigModal: React.FC<QuizConfigModalProps> = ({ isOpen, onClose, onStart, isGenerating }) => {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState<'easy'|'medium'|'hard'>('medium');
  const [mode, setMode] = useState<'practice'|'exam'>('practice');
  
  // PDF State
  const [file, setFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState<string | undefined>(undefined);
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen && !isGenerating) return null;
  if (isGenerating) return null; 

  const handleStart = () => {
    onStart({ 
      topic: file ? `PDF: ${file.name}` : (topic || 'General Knowledge'), 
      questionCount: count, 
      difficulty, 
      mode 
    }, pdfText);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setTopic(selectedFile.name.replace('.pdf', ''));
      setAnalysisState('processing');
      
      try {
        const text = await extractTextFromPdf(selectedFile);
        setPdfText(text);
        setAnalysisState('ready');
      } catch (error) {
        console.error(error);
        setAnalysisState('error');
        // Reset after error
        setTimeout(() => {
            setFile(null);
            setAnalysisState('idle');
        }, 3000);
      }
    }
  };

  const clearFile = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFile(null);
    setPdfText(undefined);
    setTopic('');
    setAnalysisState('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-[#000]/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-xl bg-[#1E1F20] border-t sm:border border-[#444746] rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Drag Handle for Mobile */}
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-12 h-1.5 bg-white/20 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-8 pt-6 pb-2 z-10 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-heading font-semibold text-white">Session Setup</h2>
            <p className="text-text-secondary text-sm">Configure your study parameters</p>
          </div>
          <button onClick={onClose} className="p-2 bg-surface-highlight rounded-full hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-8 py-6 space-y-8 overflow-y-auto custom-scrollbar">
          
          {/* 1. Input Method Selection */}
          <div className="space-y-4">
             <div className="h-24 relative w-full">
                <AnimatePresence mode="wait">
                    {!file ? (
                        <motion.div
                            key="text-input"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute inset-0"
                        >
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2 block">Subject / Topic</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input 
                                        type="text" 
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        className="w-full h-14 bg-surface-highlight border-2 border-transparent focus:border-primary/50 focus:bg-[#252628] rounded-2xl px-4 text-white outline-none transition-all placeholder:text-text-disabled font-medium"
                                        placeholder="e.g. Organic Chemistry..."
                                        autoFocus
                                    />
                                </div>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="h-14 w-14 flex-shrink-0 bg-surface-highlight border-2 border-dashed border-text-disabled/50 rounded-2xl flex items-center justify-center hover:border-primary hover:text-primary hover:bg-primary/5 transition-all group"
                                    title="Upload PDF"
                                >
                                    <svg className="w-6 h-6 text-text-secondary group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="file-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute inset-0"
                        >
                             <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2 block">Context Source</label>
                            <div className="w-full h-14 bg-surface-highlight/50 border border-primary/30 rounded-2xl flex items-center justify-between px-4 overflow-hidden relative">
                                {/* Progress Bar Background */}
                                {analysisState === 'processing' && (
                                    <motion.div 
                                        className="absolute bottom-0 left-0 h-1 bg-primary"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                )}

                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`p-2 rounded-lg ${analysisState === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-primary/20 text-primary'}`}>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    <div className="flex flex-col truncate">
                                        <span className="text-sm font-medium text-white truncate">{file.name}</span>
                                        <span className="text-[10px] uppercase tracking-wider font-bold">
                                            {analysisState === 'processing' && <span className="text-primary">Analyzing...</span>}
                                            {analysisState === 'ready' && <span className="text-success">Ready for Context</span>}
                                            {analysisState === 'error' && <span className="text-red-400">Parsing Failed</span>}
                                        </span>
                                    </div>
                                </div>
                                <button onClick={clearFile} className="p-2 hover:bg-white/10 rounded-full text-text-secondary hover:text-white">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
             </div>
             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" className="hidden" />
          </div>

          <div className="h-px bg-[#444746]/50 w-full" />

          {/* 2. Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             
             {/* Difficulty */}
             <div className="space-y-3">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Difficulty</label>
                <div className="flex bg-surface-highlight p-1 rounded-2xl border border-accent/30">
                    {['easy', 'medium', 'hard'].map((d) => (
                        <button
                        key={d}
                        onClick={() => setDifficulty(d as any)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                            difficulty === d ? 'bg-[#444746] text-white shadow-lg' : 'text-text-secondary hover:text-white'
                        }`}
                        >
                        {d}
                        </button>
                    ))}
                </div>
             </div>

             {/* Count */}
             <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold text-text-secondary uppercase tracking-widest">
                    <label>Depth</label>
                    <span className="text-primary">{count} Questions</span>
                </div>
                <div className="h-12 bg-surface-highlight rounded-2xl px-4 flex items-center border border-accent/30">
                     <input 
                        type="range" 
                        min="3" 
                        max="20" 
                        step="1"
                        value={count} 
                        onChange={(e) => setCount(Number(e.target.value))}
                        className="w-full h-1.5 bg-[#444746] rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>
             </div>
          </div>

          {/* 3. Mode Selection Cards */}
          <div className="space-y-3">
             <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Exam Mode</label>
             <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => setMode('practice')}
                    className={`p-4 rounded-[24px] text-left border-2 transition-all relative overflow-hidden ${mode === 'practice' ? 'border-secondary bg-secondary/10' : 'border-transparent bg-surface-highlight hover:bg-[#252628]'}`}
                >
                    <div className="relative z-10">
                        <div className={`font-bold text-sm mb-1 ${mode === 'practice' ? 'text-secondary' : 'text-text-primary'}`}>Practice</div>
                        <div className="text-xs text-text-secondary">Untimed • Hints</div>
                    </div>
                </button>
                <button 
                    onClick={() => setMode('exam')}
                    className={`p-4 rounded-[24px] text-left border-2 transition-all relative overflow-hidden ${mode === 'exam' ? 'border-primary bg-primary/10' : 'border-transparent bg-surface-highlight hover:bg-[#252628]'}`}
                >
                    <div className="relative z-10">
                         <div className={`font-bold text-sm mb-1 ${mode === 'exam' ? 'text-primary' : 'text-text-primary'}`}>Simulation</div>
                         <div className="text-xs text-text-secondary">Strict Timer • Proctor</div>
                    </div>
                </button>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#444746] bg-[#1E1F20] flex justify-end gap-3">
            <Button variant="text" onClick={onClose} className="text-text-secondary hover:text-white rounded-xl">Cancel</Button>
            <Button 
              variant="filled" 
              onClick={handleStart}
              disabled={(!topic && !file) || analysisState === 'processing' || analysisState === 'error'}
              className="px-8 rounded-xl bg-white text-black hover:bg-gray-200"
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            >
              Start Session
            </Button>
        </div>
      </motion.div>
    </div>
  );
};