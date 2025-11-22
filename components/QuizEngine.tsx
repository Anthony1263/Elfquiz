
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question, UserAnswer, SRSData, QuestionType, GradingResult } from '../types';
import { Button } from './Button';
import { getAiFeedback, gradeHandwrittenEssay } from '../services/geminiService';

interface QuizEngineProps {
  questions: Question[];
  mode: 'practice' | 'exam';
  onExit: () => void;
  onComplete: (results: { score: number; total: number; answers: UserAnswer[]; timeTaken: number }) => void;
}

// SM-2 Algo
const calculateSM2 = (grade: number, previous: SRSData): SRSData => {
  let { interval, repetition, easeFactor } = previous;
  if (grade >= 3) {
    if (repetition === 0) interval = 1;
    else if (repetition === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetition += 1;
    easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  } else {
    repetition = 0;
    interval = 1;
  }
  if (easeFactor < 1.3) easeFactor = 1.3;
  return { interval, repetition, easeFactor, nextReviewDate: Date.now() + interval * 24 * 60 * 60 * 1000 };
};

const initialSRS: SRSData = { interval: 0, repetition: 0, easeFactor: 2.5, nextReviewDate: Date.now() };

export const QuizEngine: React.FC<QuizEngineProps> = ({ questions, mode, onExit, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [srsProgress, setSrsProgress] = useState<Record<string, SRSData>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(questions.length * 60);
  const [cheatCount, setCheatCount] = useState(0);
  const [startTime] = useState(Date.now());

  // Essay State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!questions || questions.length === 0) return <div className="p-8 text-center text-text-primary">Initializing Engine...</div>;

  const currentQuestion = questions[currentIndex];
  const hasAnsweredCurrent = !!answers[currentQuestion.id];

  useEffect(() => {
    if (mode !== 'exam' || isSubmitted) return;
    const handleVisibilityChange = () => document.hidden && setCheatCount(c => c + 1);
    const handleBlur = () => setCheatCount(c => c + 1);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [mode, isSubmitted]);

  useEffect(() => {
    if (mode === 'exam' && !isSubmitted && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmitQuiz();
    }
  }, [mode, timeLeft, isSubmitted]);

  useEffect(() => {
    setSelectedFile(null);
    setImagePreview(null);
  }, [currentIndex]);

  const handleOptionSelect = (optionId: string) => {
    if (isSubmitted || (mode === 'practice' && hasAnsweredCurrent)) return;
    const isCorrect = optionId === currentQuestion.correctOptionId;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: { questionId: currentQuestion.id, selectedOptionId: optionId, isCorrect, timestamp: Date.now() }
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGradeEssay = async () => {
    if (!selectedFile) return;
    setIsGrading(true);
    try {
      const result: GradingResult = await gradeHandwrittenEssay(selectedFile, currentQuestion.stem, currentQuestion.rubric);
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: {
          questionId: currentQuestion.id,
          isCorrect: result.score_out_of_100 >= 60,
          gradingResult: result,
          essayImage: imagePreview || undefined,
          timestamp: Date.now()
        }
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsGrading(false);
    }
  };

  const handleSRSLog = (grade: number) => {
    const updatedSRS = calculateSM2(grade, srsProgress[currentQuestion.id] || initialSRS);
    setSrsProgress(prev => ({ ...prev, [currentQuestion.id]: updatedSRS }));
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitted(true);
    handleFinish();
  };

  const handleFinish = () => {
    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - startTime) / 1000);
    onComplete({ 
      score: Object.values(answers).filter((a: UserAnswer) => a.isCorrect).length, 
      total: questions.length, 
      answers: Object.values(answers), 
      timeTaken 
    });
  };

  const handleNext = () => {
      if (currentIndex < questions.length - 1) {
          setCurrentIndex(prev => prev + 1);
      } else {
          handleSubmitQuiz();
      }
  };

  const formatTime = (s: number) => {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 pb-32 relative min-h-screen flex flex-col">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
            <Button variant="tonal" size="sm" onClick={onExit} className="rounded-xl bg-surface-highlight hover:bg-white/10">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                <span>Exit</span>
            </Button>

            <div className="flex items-center gap-4">
                {mode === 'exam' && (
                    <div className={`px-4 py-2 rounded-full font-mono font-bold text-lg ${timeLeft < 60 ? 'bg-red-500/20 text-red-400' : 'bg-surface-highlight text-primary'}`}>
                        {formatTime(timeLeft)}
                    </div>
                )}
                <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Progress</span>
                    <span className="text-lg font-heading font-bold text-white">{currentIndex + 1} / {questions.length}</span>
                </div>
            </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
            <motion.div 
                key={currentIndex}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-[#1E1F20] border border-white/10 rounded-[40px] p-8 shadow-2xl relative overflow-hidden flex-1 flex flex-col"
            >
                 <div className="mb-8">
                    {currentQuestion.vignette && (
                        <div className="bg-surface-highlight/30 border-l-4 border-secondary p-4 rounded-r-xl mb-6 text-sm italic text-text-secondary">
                            {currentQuestion.vignette}
                        </div>
                    )}
                    <h2 className="text-2xl md:text-3xl font-heading font-bold text-white leading-tight">
                        {currentQuestion.stem}
                    </h2>
                 </div>

                 {/* MCQ Options */}
                 {currentQuestion.type === QuestionType.MCQ && (
                    <div className="space-y-3">
                        {currentQuestion.options.map((opt) => {
                            const isSelected = answers[currentQuestion.id]?.selectedOptionId === opt.id;
                            const isCorrect = opt.id === currentQuestion.correctOptionId;
                            const showResult = hasAnsweredCurrent || isSubmitted;
                            
                            let stateClasses = "bg-surface-highlight border-transparent text-text-secondary hover:bg-[#2C2C2E] hover:text-white";
                            if (showResult) {
                                if (isCorrect) stateClasses = "bg-green-500/20 border-green-500 text-green-400";
                                else if (isSelected) stateClasses = "bg-red-500/20 border-red-500 text-red-400";
                                else stateClasses = "opacity-50 grayscale";
                            } else if (isSelected) {
                                stateClasses = "bg-primary text-[#04080F] border-primary";
                            }

                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => handleOptionSelect(opt.id)}
                                    disabled={showResult}
                                    className={`w-full p-5 rounded-2xl border-2 text-left font-medium text-lg transition-all duration-200 flex justify-between items-center group ${stateClasses}`}
                                >
                                    <span>{opt.text}</span>
                                    {showResult && isCorrect && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                    {showResult && isSelected && !isCorrect && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>}
                                </button>
                            )
                        })}
                    </div>
                 )}

                 {/* Essay Interface */}
                 {currentQuestion.type === QuestionType.ESSAY && (
                     <div className="flex flex-col gap-4">
                        {!imagePreview ? (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-3 border-dashed border-surface-highlight rounded-3xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-surface-highlight/10 transition-all group"
                            >
                                <div className="w-16 h-16 bg-surface-highlight rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <svg className="w-8 h-8 text-text-secondary group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <p className="font-bold text-text-secondary group-hover:text-primary">Upload Handwriting</p>
                                <p className="text-xs text-text-secondary/50 mt-2">Take a photo of your written answer</p>
                            </div>
                        ) : (
                            <div className="relative rounded-3xl overflow-hidden h-64 bg-black">
                                <img src={imagePreview} alt="Answer" className="w-full h-full object-contain" />
                                {hasAnsweredCurrent && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                                        <div className="text-5xl font-bold text-white mb-2">
                                            {answers[currentQuestion.id].gradingResult?.score_out_of_100}
                                            <span className="text-2xl text-white/50">/100</span>
                                        </div>
                                        <p className="text-white/80 font-medium">Graded by AI</p>
                                    </div>
                                )}
                                {!hasAnsweredCurrent && (
                                    <button onClick={() => {setImagePreview(null); setSelectedFile(null);}} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                )}
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                        
                        {!hasAnsweredCurrent && (
                            <Button 
                                onClick={handleGradeEssay} 
                                disabled={!selectedFile || isGrading}
                                isLoading={isGrading}
                                className="w-full py-4 rounded-2xl font-bold bg-primary text-[#04080F]"
                            >
                                {isGrading ? 'Analyzing Handwriting...' : 'Submit & Grade'}
                            </Button>
                        )}
                     </div>
                 )}
            </motion.div>
        </AnimatePresence>

        {/* AI Feedback / Explanation Section */}
        <AnimatePresence>
            {hasAnsweredCurrent && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mt-6 p-6 md:p-8 rounded-[32px] bg-[#F0F4F8] dark:bg-[#2D2E30] border border-white/20 shadow-xl relative overflow-hidden"
                >
                    {/* Decorative background blob */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -mr-8 -mt-8"></div>
                    
                    <div className="relative z-10">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-600 dark:text-gray-400">
                                {currentQuestion.type === QuestionType.MCQ ? 'Instant Insight' : 'AI Grading Feedback'}
                            </h3>
                        </div>

                        {/* Content */}
                        <div className="text-[#131314] dark:text-[#E3E3E3] text-lg leading-relaxed font-medium">
                            {currentQuestion.type === QuestionType.MCQ ? (
                                <p>{currentQuestion.explanation}</p>
                            ) : (
                                <div className="space-y-4">
                                    <p className="italic text-slate-700 dark:text-gray-300">"{answers[currentQuestion.id].gradingResult?.feedback_summary}"</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-2xl border border-green-200 dark:border-green-900/50">
                                            <h4 className="font-bold text-green-800 dark:text-green-400 text-xs uppercase mb-2">Strengths</h4>
                                            <ul className="list-disc list-inside text-sm text-green-900 dark:text-green-200">
                                                {answers[currentQuestion.id].gradingResult?.key_strengths.map((s, i) => <li key={i}>{s}</li>)}
                                            </ul>
                                        </div>
                                        <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-2xl border border-orange-200 dark:border-orange-900/50">
                                            <h4 className="font-bold text-orange-800 dark:text-orange-400 text-xs uppercase mb-2">Improvements</h4>
                                            <ul className="list-disc list-inside text-sm text-orange-900 dark:text-orange-200">
                                                {answers[currentQuestion.id].gradingResult?.areas_for_improvement.map((s, i) => <li key={i}>{s}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Floating Next Button */}
        <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none">
            <AnimatePresence>
                {hasAnsweredCurrent && (
                    <motion.button
                        initial={{ scale: 0.5, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.5, opacity: 0, y: 50 }}
                        onClick={handleNext}
                        className="pointer-events-auto px-8 py-4 bg-white text-black font-bold text-lg rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] hover:scale-105 active:scale-95 transition-transform flex items-center gap-3"
                    >
                        <span>{currentIndex === questions.length - 1 ? 'Finish Session' : 'Next Question'}</span>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    </div>
  );
};
