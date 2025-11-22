
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatsCard } from './components/StatsCard';
import { MasteryHub } from './components/MasteryHub';
import { Button } from './components/Button';
import { QuizConfigModal } from './components/QuizConfigModal';
import { QuizEngine } from './components/QuizEngine';
import { LoadingOverlay } from './components/LoadingOverlay';
import { ReportCard } from './components/ReportCard';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { StreakModal } from './components/StreakModal';
import { SeasonalBackground } from './components/SeasonalBackground';
import { generateQuizQuestions } from './services/geminiService';
import { Question, QuizConfig, QuizResult, UserAnswer, UserProfile } from './types';
import { IntroSplash } from './components/IntroSplash';
import { CourseCard } from './components/CourseCard';

// --- Floating Dock Navigation ---
interface FloatingDockProps {
  isDark: boolean;
  toggleTheme: () => void;
  onHome: () => void;
  onNewSession: () => void;
  onProfileClick: () => void;
  activeView: string;
  userAvatar?: string;
}

const FloatingDock: React.FC<FloatingDockProps> = ({ isDark, toggleTheme, onHome, onNewSession, onProfileClick, activeView, userAvatar }) => (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-6 md:top-1/2 md:-translate-y-1/2 md:bottom-auto z-50">
        {/* Liquid Glass Container */}
        <div className="bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 p-3 rounded-[32px] flex md:flex-col items-center gap-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] transition-all duration-300 animate-fade-in backdrop-saturate-150">
             
             {/* Home / Brand */}
             <button 
                onClick={onHome}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-transform active:scale-95 shadow-sm ${activeView === 'dashboard' ? 'bg-text-primary text-background' : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}
             >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </button>
            
            <div className="w-px h-8 md:w-8 md:h-px bg-white/10 mx-1 md:mx-0"></div>

            {/* Primary Action: New Quiz */}
            <NavButton 
                onClick={onNewSession} 
                isActive={false}
                label="New Session"
                className="bg-primary text-[#04080F] hover:bg-white shadow-lg shadow-primary/20"
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>} 
            />
            
            {/* Theme Toggle */}
            <NavButton 
                onClick={toggleTheme} 
                label={isDark ? "Light Mode" : "Dark Mode"}
                icon={
                    isDark ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    )
                } 
            />
        </div>
    </nav>
);

const NavButton = ({ icon, isActive, onClick, className = "", label }: { icon: React.ReactNode, isActive?: boolean, onClick?: () => void, className?: string, label?: string }) => (
    <button 
        onClick={onClick} 
        title={label}
        className={`
            w-12 h-12 rounded-[20px] flex items-center justify-center transition-all duration-300 group relative
            ${className ? className : isActive ? 'bg-text-primary text-background' : 'text-text-secondary hover:text-text-primary hover:bg-white/10'}
        `}
    >
        {icon}
    </button>
);

interface DashboardProps {
    onStartQuiz: (topic?: string) => void;
    history: QuizResult[];
    user: UserProfile;
    onProfileClick: () => void;
    onStreakClick: () => void;
    stats: any;
    radarData: any;
    myCourses: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ onStartQuiz, history, user, onProfileClick, onStreakClick, stats, radarData, myCourses }) => {
  const date = new Date();
  // Format: "Sat Nov 22" (No comma)
  const formattedDate = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).replace(',', '');

  return (
    <div className="p-4 md:p-10 max-w-[1600px] mx-auto w-full animate-fade-in pb-24 md:pb-10 md:pl-28 relative z-10">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-8 gap-3 relative z-20">
         
         {/* Left: Brand + Date */}
         <div className="flex items-center gap-3">
            <div className="flex flex-col leading-none">
                <h1 className="text-5xl font-pixel text-text-primary tracking-tight">
                    Qz
                </h1>
                <p className="text-text-secondary font-bold text-[10px] uppercase tracking-widest mt-1 ml-0.5">{formattedDate}</p>
            </div>
         </div>
         
         {/* Right: Stats (Streak -> Profile Group) */}
         <div className="flex items-center gap-3 ml-auto">
             
             {/* Streak Badge */}
             <motion.button
                onClick={onStreakClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 rounded-[20px] bg-[#FDF2F8] dark:bg-[#2C1A05] border border-pink-200 dark:border-orange-500/30 shadow-sm h-12"
             >
                 <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                 >
                     <span className="text-xl">🔥</span>
                 </motion.div>
                 <span className="font-bold text-pink-900 dark:text-orange-100 text-xs whitespace-nowrap">{user.streak} Days</span>
             </motion.button>

             {/* Profile & XP Group Pill */}
             <div 
                onClick={onProfileClick}
                className="flex items-center gap-3 pl-5 pr-1.5 py-1.5 rounded-[24px] bg-surface border border-white/10 shadow-lg cursor-pointer hover:bg-surface-highlight transition-all h-12 group"
             >
                 <div className="flex flex-col items-end justify-center h-full">
                    <span className="text-xs font-bold text-text-primary leading-none mb-0.5">{user.username}</span>
                    <span className="text-[10px] font-black text-secondary uppercase tracking-wider leading-none mb-1">{stats.xp.toLocaleString()} XP</span>
                    
                    {/* Mini Progress Bar */}
                    <div className="w-16 h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: '65%' }} 
                           className="h-full bg-secondary"
                        />
                    </div>
                 </div>

                 <div className="relative w-9 h-9">
                     <motion.div 
                        className="absolute -inset-1 rounded-full bg-gradient-to-tr from-secondary to-primary opacity-0 group-hover:opacity-50 blur-sm transition-opacity duration-300"
                     />
                     <img 
                        src={user.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
                        alt="User" 
                        className="w-full h-full rounded-full bg-surface-highlight object-cover relative z-10 border border-white/10" 
                    />
                 </div>
             </div>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* --- LEFT COLUMN (The Feed) --- */}
        <div className="col-span-1 xl:col-span-8 flex flex-col gap-8">
            
            {/* 1. Weekly Challenge */}
            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="bg-[#cbd2d5] rounded-[40px] p-8 text-[#131314] shadow-xl relative overflow-hidden group border border-white/20"
            >
                 {/* Animated Blob */}
                 <motion.div 
                    className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none"
                    animate={{ 
                        scale: [1, 1.1, 1], 
                        rotate: [0, 10, 0],
                        opacity: [0.4, 0.6, 0.4]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                 />

                 <div className="relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="inline-block px-3 py-1 rounded-full bg-black/5 font-bold text-[10px] uppercase tracking-widest mb-4"
                    >
                        Weekly Goal
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="text-4xl md:text-5xl font-heading font-bold mb-4 leading-tight"
                    >
                        Master the<br/>Arcane Arts
                    </motion.h2>
                    
                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex -space-x-3">
                            {[1,2,3].map((i, index) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + (index * 0.1) }}
                                    className="w-8 h-8 rounded-full bg-white/30 border-2 border-[#E2B6FF] flex items-center justify-center text-[10px] font-bold"
                                >
                                    {String.fromCharCode(64+i)}
                                </motion.div>
                            ))}
                        </div>
                        <motion.span 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.8 }}
                            transition={{ delay: 0.8 }}
                            className="text-sm font-medium"
                        >
                            +420 Scholars joined
                        </motion.span>
                    </div>
                    
                    <motion.div whileTap={{ scale: 0.95 }}>
                        <Button onClick={() => onStartQuiz('Arcane Arts')} className="bg-[#131314] text-white border-none hover:bg-black rounded-xl shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5">Accept Challenge</Button>
                    </motion.div>
                 </div>
            </motion.div>

            {/* 2. Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 <StatsCard 
                    title="Questions" 
                    value={stats.questionsAnswered} 
                    icon={<span className="text-2xl">📚</span>}
                    colorClass="bg-[#E2EFD3] text-[#14532d]"
                 />
                 <StatsCard 
                    title="Avg Accuracy" 
                    value={`${stats.accuracy}%`} 
                    icon={<span className="text-2xl">🎯</span>}
                    colorClass="bg-[#faf3eb] text-[#451a03]"
                 />
                 {/* Focus Time - Full width on mobile to ensure visibility */}
                 <StatsCard 
                    title="Focus Time" 
                    value={`${Math.round(stats.focusMinutes/60)}h`} 
                    icon={<span className="text-2xl">⏳</span>}
                    colorClass="bg-[#E2dddc] text-[#1f2937]"
                    className="col-span-2 md:col-span-1 aspect-auto md:aspect-square"
                 />
            </div>

            {/* 3. My Courses / Modules */}
            <div>
                <div className="flex justify-between items-center mb-4 px-2">
                    <h3 className="text-lg font-bold text-text-primary">Your Modules</h3>
                    <button className="text-xs font-bold text-primary uppercase tracking-widest hover:text-white transition-colors">View All</button>
                </div>
                <CourseCard courses={myCourses} onStart={onStartQuiz} />
            </div>
        </div>

        {/* --- RIGHT COLUMN (Analysis) --- */}
        <div className="col-span-1 xl:col-span-4 flex flex-col gap-6">
            
            {/* Mastery Hub */}
            <MasteryHub 
                xp={stats.xp} 
                masteryCount={radarData.filter((d: any) => d.score > 80).length}
                level={user.masteryLevel}
                radarData={radarData}
            />

            {/* Recent Activity List */}
            <div className="bg-surface border border-white/5 rounded-[32px] p-6 flex-1 min-h-[300px]">
                <h3 className="text-lg font-bold text-text-primary mb-6 px-2">Recent Sessions</h3>
                <div className="space-y-4">
                    {history.length === 0 ? (
                        <div className="text-center text-text-secondary py-10 text-sm">No magic performed yet.</div>
                    ) : (
                        history.slice(0, 4).map((session) => (
                            <div key={session.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-surface-highlight transition-colors group cursor-default">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${session.score/session.total >= 0.7 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {Math.round((session.score / session.total) * 100)}%
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-text-primary truncate">{session.topic}</h4>
                                    <p className="text-xs text-text-secondary">{new Date(session.timestamp).toLocaleDateString()}</p>
                                </div>
                                <div className="text-xs font-bold text-text-secondary">
                                    +{session.xpEarned} XP
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [view, setView] = useState<'dashboard' | 'quiz' | 'report'>('dashboard');
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isStreakOpen, setIsStreakOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  // Load user from local storage
  useEffect(() => {
    const storedUser = localStorage.getItem('examflow_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Theme toggle
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleLogin = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('examflow_user');
    setUser(null);
    setView('dashboard');
  };

  const handleStartQuiz = async (config: QuizConfig, pdfText?: string) => {
    setIsConfigOpen(false);
    setIsGenerating(true);
    
    // Mock or API call
    const userContext = {
        level: user?.educationLevel || 'Undergraduate',
        field: user?.fieldOfStudy || 'General'
    };

    try {
        const generatedQuestions = await generateQuizQuestions(config.topic, config.questionCount, config.difficulty, userContext, pdfText);
        setQuestions(generatedQuestions);
        setQuizConfig(config);
        setView('quiz');
    } catch (error) {
        console.error("Failed to generate quiz", error);
        // Handle error (maybe show toast)
    } finally {
        setIsGenerating(false);
    }
  };

  const handleQuizComplete = (results: { score: number; total: number; answers: UserAnswer[]; timeTaken: number }) => {
    if (!quizConfig) return;

    const xpEarned = results.score * 10 + (results.score === results.total ? 50 : 0);
    const newResult: QuizResult = {
      id: Date.now().toString(),
      topic: quizConfig.topic,
      score: results.score,
      total: results.total,
      accuracy: (results.score / results.total) * 100,
      xpEarned,
      timeTaken: results.timeTaken,
      timestamp: Date.now(),
      difficulty: quizConfig.difficulty
    };

    setQuizResult(newResult);
    setHistory(prev => [newResult, ...prev]);
    
    // Update User XP/Stats (local state only for demo)
    if (user) {
        const updatedUser = { ...user, xp: user.xp + xpEarned, streak: user.streak }; // Mock streak logic
        setUser(updatedUser);
        localStorage.setItem('examflow_user', JSON.stringify(updatedUser));
    }

    setView('report');
  };

  // Mock Data for Dashboard
  const stats = {
    xp: user?.xp || 0,
    questionsAnswered: history.reduce((acc, curr) => acc + curr.total, 0) + 420, // + mock base
    accuracy: history.length > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.accuracy, 0) / history.length) : 85,
    focusMinutes: history.reduce((acc, curr) => acc + curr.timeTaken, 0) / 60 + 2500 // + mock base
  };

  const radarData = [
    { subject: 'Organic Chem', score: 80, fullMark: 100 },
    { subject: 'Calculus', score: 45, fullMark: 100 },
    { subject: 'History', score: 90, fullMark: 100 },
    { subject: 'Physics', score: 60, fullMark: 100 },
    { subject: 'Literature', score: 75, fullMark: 100 },
  ];
  
  const myCourses = [
      { id: 1, topic: "Science: Organic Chemistry", theme: { bg: "#dcfce7", hover: "#bbf7d0", text: "#14532d", icon: "🧪" } },
      { id: 2, topic: "Math: Calculus II", theme: { bg: "#dbeafe", hover: "#bfdbfe", text: "#1e3a8a", icon: "∫" } },
      { id: 3, topic: "History: World War II", theme: { bg: "#fee2e2", hover: "#fecaca", text: "#7f1d1d", icon: "🌍" } },
      { id: 4, topic: "CS: Algorithms", theme: { bg: "#f3e8ff", hover: "#e9d5ff", text: "#581c87", icon: "💻" } },
  ];

  if (showSplash) {
    return <IntroSplash onComplete={() => setShowSplash(false)} />;
  }

  if (!user) {
    return <AuthModal onLogin={handleLogin} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans text-text-primary selection:bg-primary/30 ${isDark ? 'dark' : ''}`}>
       <SeasonalBackground season={user.themeSeason} />
       
       {/* Floating Nav */}
       <FloatingDock 
          isDark={isDark} 
          toggleTheme={() => setIsDark(!isDark)}
          onHome={() => setView('dashboard')}
          onNewSession={() => setIsConfigOpen(true)}
          onProfileClick={() => setIsProfileOpen(true)}
          activeView={view}
          userAvatar={user.avatarUrl}
       />

       {/* Main Content Area */}
       <main className="relative z-10">
          {view === 'dashboard' && (
              <Dashboard 
                onStartQuiz={(topic) => {
                    // Quick start logic or open modal with topic preset
                    setIsConfigOpen(true);
                }}
                history={history}
                user={user}
                onProfileClick={() => setIsProfileOpen(true)}
                onStreakClick={() => setIsStreakOpen(true)}
                stats={stats}
                radarData={radarData}
                myCourses={myCourses}
              />
          )}

          {view === 'quiz' && (
              <QuizEngine 
                 questions={questions}
                 mode={quizConfig?.mode || 'practice'}
                 onExit={() => setView('dashboard')}
                 onComplete={handleQuizComplete}
              />
          )}
       </main>

       {/* Modals & Overlays */}
       <AnimatePresence>
           {view === 'report' && quizResult && (
               <ReportCard result={quizResult} onHome={() => setView('dashboard')} />
           )}
       </AnimatePresence>
       
       <QuizConfigModal 
          isOpen={isConfigOpen} 
          onClose={() => setIsConfigOpen(false)}
          onStart={handleStartQuiz}
          isGenerating={isGenerating}
       />

       {isGenerating && <LoadingOverlay />}

       <ProfileModal 
          user={user}
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          onUpdate={(u) => setUser(u)}
          onLogout={handleLogout}
       />

       <StreakModal 
          isOpen={isStreakOpen}
          streakCount={user.streak}
          onClose={() => setIsStreakOpen(false)}
       />
    </div>
  );
};

export default App;
