
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question, UserAnswer, SRSData, QuestionType, GradingResult } from '../types';
import { Button } from './Button';
import { gradeHandwrittenEssay } from '../services/geminiService';

interface QuizEngineProps {
  questions: Question[];
  mode: 'practice' | 'exam';
  onExit: () => void;
  onComplete: (results: { score: number; total: number; answers: UserAnswer[]; timeTaken: number }) => void;
}

// SM-2 Algorithm for Spaced Repetition
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
  const [timeLeft, setTimeLeft] = useState(questions.length * 60); // 1 min per question default
  const [cheatCount, setCheatCount] = useState(0);
  const [startTime] = useState(Date.now());

  // Essay State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [essayText, setEssayText] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!questions || questions.length === 0) return <div className="p-8 text-center text-text-primary">Initializing Engine...</div>;

  const currentQuestion = questions[currentIndex];
  const hasAnsweredCurrent = !!answers[currentQuestion.id];

  // Anti-cheat & Timer
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

  // Reset essay state on question change
  useEffect(() => {
    setSelectedFile(null);
    setImagePreview(null);
    setEssayText('');
    setGradingResult(null);
    
    // Restore previous answer if exists
    if (answers[currentQuestion.id]) {
      if (answers[currentQuestion.id].essayText) setEssayText(answers[currentQuestion.id].essayText!);
      if (answers[currentQuestion.id].gradingResult) setGradingResult(answers[currentQuestion.id].gradingResult!);
    }
  }, [currentIndex, currentQuestion.id, answers]);

  const handleOptionSelect = (optionId: string) => {
    if (isSubmitted || (mode === 'practice' && hasAnsweredCurrent)) return;
    
    const isCorrect = optionId === currentQuestion.correctOptionId;
    
    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedOptionId: optionId,
      isCorrect,
      timestamp: Date.now(),
    };

    setAnswers(prev => ({ ...prev, [currentQuestion.id]: newAnswer }));

    // Update SRS immediately in practice mode
    if (mode === 'practice') {
       const grade = isCorrect ? 5 : 0;
       const previousSRS = srsProgress[currentQuestion.id] || initialSRS;
       const newSRS = calculateSM2(grade, previousSRS);
       setSrsProgress(prev => ({ ...prev, [currentQuestion.id]: newSRS }));
    }
  };

  const handleEssayUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGradeEssay = async () => {
    if (!selectedFile && !essayText) return;
    setIsGrading(true);

    let result: GradingResult;
    
    if (selectedFile) {
        // Grade Image
        result = await gradeHandwrittenEssay(selectedFile, currentQuestion.stem, currentQuestion.rubric);
    } else {
        // Simple text grading mock (fallback)
        result = {
            handwriting_transcription: essayText,
            is_legible: true,
            score_out_of_100: Math.min(100, essayText.length > 50 ? 85 : 40), 
            key_strengths: ["Clear attempt"],
            areas_for_improvement: ["Expand on details"],
            corrected_version: essayText,
            feedback_summary: "Good effort (Text grading simulation)"
        };
    }

    setGradingResult(result);
    
    const newAnswer: UserAnswer = {
        questionId: currentQuestion.id,
        essayText,
        essayImage: imagePreview || undefined,
        gradingResult: result,
        isCorrect: result.score_out_of_100 >= 70,
        timestamp: Date.now()
    };
    
    setAnswers(prev => ({...prev, [currentQuestion.id]: newAnswer}));
    setIsGrading(false);
  };

  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
    let totalScore = 0;
    const answerList = Object.values(answers) as UserAnswer[];
    
    // Calculate Score
    answerList.forEach(ans => {
        if (ans.isCorrect) totalScore++;
    });

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    onComplete({ score: totalScore, total: questions.length, answers: answerList, timeTaken });
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col h-full bg-background text-text-primary">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-surface">
        <div className="flex items-center gap-4">
            <Button variant="text" size="sm" onClick={onExit} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}>
                Exit
            </Button>
            <div className="h-6 w-px bg-white/10"></div>
            <div className="text-sm font-bold text-text-secondary">
                Q{currentIndex + 1} <span className="opacity-50">/ {questions.length}</span>
            </div>
        </div>
        
        <div className="flex items-center gap-4">
            {mode === 'exam' && (
                 <div className={`font-mono text-lg font-bold ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-primary'}`}>
                     {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                 </div>
            )}
            <div className="w-32 h-2 bg-surface-highlight rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
            <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
            >
                {/* Question Stem */}
                <div className="space-y-4">
                    {currentQuestion.vignette && (
                        <div className="p-6 rounded-[24px] bg-surface-highlight/50 border border-white/5 text-sm leading-relaxed text-text-secondary italic">
                            {currentQuestion.vignette}
                        </div>
                    )}
                    <h2 className="text-2xl md:text-3xl font-heading font-bold leading-tight">
                        {currentQuestion.stem}
                    </h2>
                </div>

                {/* Options / Essay Input */}
                {currentQuestion.type === QuestionType.MCQ ? (
                    <div className="grid grid-cols-1 gap-3">
                        {currentQuestion.options.map((option) => {
                            const isSelected = answers[currentQuestion.id]?.selectedOptionId === option.id;
                            const showResult = (isSubmitted || (mode === 'practice' && hasAnsweredCurrent));
                            const isCorrect = option.id === currentQuestion.correctOptionId;
                            const isWrongSelection = isSelected && !isCorrect;
                            
                            let className = "p-5 rounded-[20px] text-left font-medium transition-all border-2 relative overflow-hidden group ";
                            
                            if (showResult) {
                                if (isCorrect) className += "bg-green-500/10 border-green-500 text-green-400";
                                else if (isWrongSelection) className += "bg-red-500/10 border-red-500 text-red-400";
                                else className += "border-transparent bg-surface-highlight opacity-50";
                            } else {
                                if (isSelected) className += "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(168,199,250,0.2)]";
                                else className += "border-transparent bg-surface-highlight hover:bg-[#3C3D40] text-text-primary";
                            }

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => handleOptionSelect(option.id)}
                                    disabled={showResult}
                                    className={className}
                                >
                                    <div className="flex items-center justify-between relative z-10">
                                        <span>{option.text}</span>
                                        {showResult && isCorrect && (
                                            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        )}
                                        {showResult && isWrongSelection && (
                                            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Essay Interface */}
                        <div className="bg-surface-highlight rounded-[24px] p-6 border border-white/5">
                            <textarea
                                value={essayText}
                                onChange={(e) => setEssayText(e.target.value)}
                                placeholder="Type your answer here..."
                                disabled={isSubmitted || !!gradingResult}
                                className="w-full h-40 bg-transparent border-none focus:ring-0 text-text-primary resize-none placeholder-text-secondary/50"
                            />
                            
                            {/* Image Upload for Handwriting */}
                            <div className="mt-4 flex items-center gap-4 border-t border-white/10 pt-4">
                                <input type="file" ref={fileInputRef} onChange={handleEssayUpload} className="hidden" accept="image/*" />
                                <Button 
                                    variant="tonal" 
                                    size="sm" 
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isSubmitted || !!gradingResult}
                                    icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                                >
                                    Upload Handwriting
                                </Button>
                                {imagePreview && (
                                    <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-white/20">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        {!gradingResult && (
                                            <button onClick={() => setImagePreview(null)} className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 hover:opacity-100">
                                                x
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {!gradingResult && (
                            <div className="flex justify-end">
                                <Button 
                                    onClick={handleGradeEssay} 
                                    isLoading={isGrading} 
                                    disabled={(!essayText && !selectedFile) || isGrading}
                                    variant="filled"
                                >
                                    Submit & Grade
                                </Button>
                            </div>
                        )}

                        {/* AI Feedback Display */}
                        {gradingResult && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-gradient-to-br from-surface-highlight to-[#252628] rounded-[24px] p-6 border border-white/10"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold uppercase tracking-widest text-secondary">AI Feedback</span>
                                    <span className={`text-xl font-bold ${gradingResult.score_out_of_100 >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {gradingResult.score_out_of_100}/100
                                    </span>
                                </div>
                                <p className="text-sm text-text-secondary mb-4">{gradingResult.feedback_summary}</p>
                                
                                <div className="space-y-2">
                                    <div className="text-xs font-bold text-green-400/80 uppercase">Strengths</div>
                                    <ul className="list-disc list-inside text-sm text-text-primary space-y-1">
                                        {gradingResult.key_strengths.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}

                {/* Explanation (MCQ Practice Mode) */}
                {mode === 'practice' && hasAnsweredCurrent && currentQuestion.type === QuestionType.MCQ && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-[24px] bg-blue-500/10 border border-blue-500/20 text-blue-200"
                    >
                        <div className="flex items-center gap-2 mb-2 text-sm font-bold uppercase tracking-wide text-blue-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Explanation
                        </div>
                        <p className="leading-relaxed">{currentQuestion.explanation}</p>
                    </motion.div>
                )}

            </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div className="p-6 border-t border-white/10 bg-surface flex justify-between items-center">
        <Button 
            variant="tonal" 
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="w-12 h-12 rounded-full p-0 flex items-center justify-center bg-surface-highlight hover:bg-white/10"
        >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Button>

        {currentIndex === questions.length - 1 ? (
            <Button 
                variant="filled" 
                onClick={handleSubmitQuiz}
                className="px-8 bg-white text-black hover:bg-gray-200 font-bold rounded-full shadow-lg shadow-white/10"
            >
                {isSubmitted ? "View Report" : "Submit Exam"}
            </Button>
        ) : (
            <Button 
                variant="filled" 
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="px-8 rounded-full"
            >
                Next
            </Button>
        )}
      </div>
    </div>
  );
};
