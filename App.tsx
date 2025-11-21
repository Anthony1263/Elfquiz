
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
import { Logo } from './components/Logo';
import { IntroSplash } from './components/IntroSplash';

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
                <Logo className="w-6 h-6" />
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
  const formattedDate = date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long' });

  return (
    <div className="p-6 lg:p-10 max-w-[1600px] mx-auto w-full animate-fade-in pb-24 md:pb-10 md:pl-28 relative z-10">
      
      {/* Header: Title Left, Profile Right */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-start mb-8 gap-6 relative">
         <div>
            <div className="flex items-center gap-3 mb-2">
                <Logo className="w-8 h-8 text-primary" />
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-text-primary tracking-tight">
                    Quiz Elf
                </h1>
            </div>
            <p className="text-text-secondary font-medium text-sm md:text-base">{formattedDate}</p>
         </div>
         
         {/* Profile Widget Top Right */}
         <div 
            onClick={onProfileClick}
            className="absolute top-0 right-0 bg-surface/80 backdrop-blur-md rounded-full pl-5 pr-2 py-2 border border-white/10 shadow-lg cursor-pointer hover:scale-105 transition-transform flex items-center gap-4 group max-w-[260px]"
         >
             <div className="flex flex-col items-end min-w-0">
                 <span className="text-xs font-bold text-text-primary truncate w-full text-right">{user.username}</span>
                 <div className="flex items-center gap-2 mt-0.5">
                     <span className="text-[10px] text-text-secondary truncate max-w-[100px] hidden sm:block text-right">
                        {user.educationLevel}
                     </span>
                    <span className="text-[10px] font-bold text-secondary whitespace-nowrap">{stats.xp} XP</span>
                 </div>
                 {/* Mini XP Bar */}
                 <div className="w-20 h-1 bg-surface-highlight rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-secondary w-3/4"></div>
                 </div>
             </div>
             
             {/* Animated Avatar */}
             <motion.div 
                className="relative w-10 h-10 flex-shrink-0"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
                 <motion.div 
                    className="absolute -inset-1 rounded-full bg-gradient-to-tr from-secondary to-primary opacity-70 blur-sm"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                 />
                 <img src={user.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt="User" className="w-full h-full rounded-full bg-surface object-cover relative z-10" />
             </motion.div>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* --- LEFT COLUMN (The Feed) --- */}
        <div className="col-span-1 xl:col-span-8 flex flex-col gap-8">
            
            {/* 1. Weekly Challenge */}
            <div className="bg-gradient-to-br from-[#240046] via-[#3c096c] to-[#10002b] rounded-[40px] p-8 text-white shadow-xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/20 rounded-full blur-[80px] animate-pulse-slow"></div>
                 <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/20 rounded-full blur-[60px]"></div>
                 <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

                 <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-yellow-300 mb-2 border border-yellow-500/30">
                            <span className="animate-pulse">✦</span> Special Event
                        </div>
                        <h3 className="text-3xl font-heading font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-yellow-200">Grand Scholar's Challenge</h3>
                        <p className="opacity-80 max-w-md text-sm leading-relaxed">Prove your mastery across 3 domains to unlock the legendary 'Archmage' badge and 500 XP.</p>
                    </div>
                    <Button onClick={() => onStartQuiz("Weekly Challenge")} className="bg-white text-[#240046] font-bold px-8 py-4 rounded-xl hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)] whitespace-nowrap">
                        Accept Challenge
                    </Button>
                 </div>
            </div>

            {/* 2. Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div onClick={onStreakClick} className="cursor-pointer">
                    <StatsCard 
                        title="Daily Streak" 
                        value={`${stats.streak} Days`} 
                        icon="🔥" 
                        colorClass="bg-[#FFEFD5] dark:bg-[#FFDFB3]" 
                        isPrimary
                    />
                 </div>
                 
                 {/* Expanded Stats to replace old MasteryCard */}
                  <StatsCard 
                    title="Questions" 
                    value={history.reduce((acc, h) => acc + h.total, 0).toString()} 
                    icon="📚" 
                 />
                  <StatsCard 
                    title="Avg Accuracy" 
                    value={`${stats.accuracy}%`} 
                    icon="🎯" 
                 />
                  <StatsCard 
                    title="Focus Time" 
                    value="4.2h" 
                    icon="⏳" 
                 />
            </div>

            {/* 3. Recommended Focus */}
            <div 
                onClick={() => onStartQuiz("Kinematics & Motion")}
                className="w-full p-8 rounded-[40px] bg-[#A8C7FA] relative overflow-hidden cursor-pointer group min-h-[240px] flex flex-col justify-between transition-all hover:scale-[1.01] shadow-xl shadow-blue-500/10"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/30 rounded-full blur-[60px] -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700"></div>
                
                <div className="relative z-10 text-[#04080F]">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 text-xs font-bold mb-4 backdrop-blur-md">
                        Recommended Focus
                    </div>
                    <h2 className="text-4xl font-heading font-bold mb-2 leading-none">
                        Kinematics <br/> & Motion
                    </h2>
                    <div className="flex items-center gap-2 mt-4 opacity-80 font-medium">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        Accuracy dropped by 12%
                    </div>
                </div>

                <div className="absolute bottom-8 right-8 h-12 w-12 rounded-full bg-[#04080F] text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    ➜
                </div>
             </div>

             {/* 4. Your Courses (Split Grid) */}
             <div>
                <h3 className="text-xl font-heading font-bold text-text-primary mb-6">Your Courses</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {myCourses.map((course: any) => (
                        <div 
                            key={course.id} 
                            onClick={() => onStartQuiz(course.topic)} 
                            className="cursor-pointer group"
                        >
                            <div 
                                className="p-4 md:p-5 rounded-[32px] transition-all relative overflow-hidden h-full min-h-[160px] md:min-h-[180px] flex flex-col justify-end hover:scale-[1.02] hover:shadow-lg"
                                style={{ backgroundColor: course.theme.bg, color: course.theme.text }}
                            >
                                <div className="absolute right-2 top-2 text-4xl opacity-20 rotate-12 group-hover:scale-110 transition-transform">{course.theme.icon}</div>
                                <div className="relative z-10">
                                    <h4 className="text-lg md:text-xl font-bold mb-1 leading-tight break-words">{course.topic.split(':')[0]}</h4>
                                    <p className="font-medium opacity-70 text-xs md:text-sm line-clamp-2">{course.topic.split(':')[1] || 'General Review'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        </div>

        {/* --- RIGHT COLUMN (Context) --- */}
        <div className="col-span-1 xl:col-span-4 space-y-6">
            
            {/* Unified Mastery Hub */}
            <MasteryHub 
                xp={stats.xp}
                masteryCount={stats.mastery}
                level={user.masteryLevel}
                radarData={radarData}
            />

        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isStreakOpen, setIsStreakOpen] = useState(false);
  
  const [sessionState, setSessionState] = useState<'dashboard' | 'quiz' | 'report'>('dashboard');
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [activeMode, setActiveMode] = useState<'practice' | 'exam'>('practice');
  const [currentQuizConfig, setCurrentQuizConfig] = useState<QuizConfig | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [lastResult, setLastResult] = useState<QuizResult | null>(null);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
      const storedUser = localStorage.getItem('examflow_user');
      if (storedUser) {
          setUser(JSON.parse(storedUser));
      }
  }, []);

  const toggleTheme = () => {
      if (isDark) {
          document.documentElement.classList.remove('dark');
      } else {
          document.documentElement.classList.add('dark');
      }
      setIsDark(!isDark);
  };

  const handleLogin = (newUser: UserProfile) => {
      setUser(newUser);
      if (newUser.streak > 0) setIsStreakOpen(true);
  };

  const handleUpdateProfile = (updatedUser: UserProfile) => {
      setUser(updatedUser);
  };

  const handleLogout = () => {
      localStorage.removeItem('examflow_user');
      setUser(null);
      setIsProfileOpen(false);
  };

  const handleStartQuizRequest = (topic?: string) => {
      if (topic) {
          startQuiz({ 
              topic, 
              questionCount: 5, 
              difficulty: 'medium', 
              mode: 'practice' 
          });
      } else {
          setIsConfigOpen(true);
      }
  };

  const startQuiz = async (config: QuizConfig, pdfText?: string) => {
    setIsConfigOpen(false);
    setIsGenerating(true);
    setCurrentQuizConfig(config);
    try {
      const questions = await generateQuizQuestions(
          config.topic, 
          config.questionCount, 
          config.difficulty, 
          { level: user?.educationLevel || 'General', field: user?.fieldOfStudy || 'General' },
          pdfText
      );
      setActiveQuestions(questions);
      setActiveMode(config.mode);
      setSessionState('quiz');
    } catch (error) {
      console.error("Failed to generate quiz", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuizComplete = (data: { score: number; total: number; answers: UserAnswer[]; timeTaken: number }) => {
    const accuracy = Math.round((data.score / data.total) * 100);
    const xpEarned = (data.score * 10) + (accuracy === 100 ? 50 : 0);
    const result: QuizResult = {
        id: Math.random().toString(36).substr(2, 9),
        topic: currentQuizConfig?.topic || 'General Session',
        score: data.score,
        total: data.total,
        accuracy,
        xpEarned,
        timeTaken: data.timeTaken,
        timestamp: Date.now(),
        difficulty: currentQuizConfig?.difficulty || 'medium'
    };
    setHistory(prev => [...prev, result]);
    setLastResult(result);
    setSessionState('report');
    
    if (user) {
        const today = new Date();
        const todayStr = today.toDateString();
        const lastActiveStr = user.lastActiveDate;
        
        let newStreak = user.streak;
        
        // Streak Logic: Only increment if active yesterday. Keep same if active today. Reset otherwise.
        if (lastActiveStr !== todayStr) {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();
            
            if (lastActiveStr === yesterdayStr) {
                newStreak++;
            } else if (!lastActiveStr) {
                 // First time ever
                 newStreak = 1;
            } else {
                // Streak broken, but active today so starts at 1
                newStreak = 1;
            }
        }
        
        // Level Up Logic
        const newXP = user.xp + xpEarned;
        let newLevel = user.masteryLevel;
        if (newXP > 5000) newLevel = 'Scholar';
        else if (newXP > 1000) newLevel = 'Intermediate';

        const newUser = { 
            ...user, 
            streak: newStreak, 
            xp: newXP, 
            masteryLevel: newLevel,
            lastActiveDate: todayStr 
        };
        setUser(newUser);
        localStorage.setItem('examflow_user', JSON.stringify(newUser));
        
        // Show streak modal if it's a new day and streak increased
        if (newStreak > user.streak) {
             setTimeout(() => setIsStreakOpen(true), 1000);
        }
    }
  };

    // Calculate Stats based on History
  const stats = useMemo(() => {
    const totalQuizzes = history.length;
    const totalCorrect = history.reduce((acc, curr) => acc + curr.score, 0);
    const totalQuestions = history.reduce((acc, curr) => acc + curr.total, 0);
    const totalXP = history.reduce((acc, curr) => acc + curr.xpEarned, 0);
    const avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const streak = user?.streak || 0;
    
    return { streak, mastery: totalCorrect, xp: totalXP + (user?.xp || 0), accuracy: avgAccuracy };
  }, [history, user]);

  const radarData = useMemo(() => {
      if (history.length === 0) {
          return [
            { subject: 'Bio', score: 50, fullMark: 100 },
            { subject: 'Chem', score: 50, fullMark: 100 },
            { subject: 'Phys', score: 50, fullMark: 100 },
            { subject: 'Hist', score: 50, fullMark: 100 },
            { subject: 'Math', score: 50, fullMark: 100 },
          ];
      }
      const topicStats: Record<string, { total: number, count: number }> = {};
      history.forEach(h => {
          let key = h.topic.split(' ')[0].substring(0, 4);
          if (h.topic.startsWith('PDF:')) key = 'RAG';
          if (!topicStats[key]) topicStats[key] = { total: 0, count: 0 };
          topicStats[key].total += h.accuracy;
          topicStats[key].count += 1;
      });
      return Object.keys(topicStats).map(key => ({
          subject: key,
          score: Math.round(topicStats[key].total / topicStats[key].count),
          fullMark: 100
      }));
  }, [history]);

  const myCourses = useMemo(() => {
      const recentTopics = [...new Set(history.map(h => h.topic))].slice(0, 4);
      const defaults = ["Biology: Cell Structure", "History: World War II", "Physics: Thermodynamics", "Lit: Shakespeare"];
      const merged = [...recentTopics, ...defaults].slice(0, 8);
      
      return merged.map((topic: string, index) => {
          const colorIndex = topic.length % 4;
          const colors = [
              { bg: '#FFABAB', hover: '#FF9E9E', text: '#3d0000', icon: '🧪' },
              { bg: '#FFE57F', hover: '#FFD740', text: '#3d3000', icon: '📐' },
              { bg: '#B9FBC0', hover: '#98F5A4', text: '#003d09', icon: '🧬' },
              { bg: '#A7C7E7', hover: '#8FB8E0', text: '#001a3d', icon: '🔭' },
          ];
          return { id: index, topic, theme: colors[colorIndex] };
      });
  }, [history]);

  if (!user) {
      return <AuthModal onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-transparent text-text-primary font-sans selection:bg-primary/30 overflow-x-hidden transition-colors duration-300 relative">
      
      {/* Background Animation Layer */}
      <SeasonalBackground season={user.themeSeason} />

      <AnimatePresence>
        {showIntro && <IntroSplash onComplete={() => setShowIntro(false)} />}
      </AnimatePresence>

      {isGenerating && <LoadingOverlay isProcessingPdf={false} />}

      {sessionState === 'dashboard' ? (
          <>
            <Dashboard 
                onStartQuiz={handleStartQuizRequest} 
                history={history} 
                user={user}
                onProfileClick={() => setIsProfileOpen(true)}
                onStreakClick={() => setIsStreakOpen(true)}
                stats={stats}
                radarData={radarData}
                myCourses={myCourses}
            />
            <FloatingDock 
                isDark={isDark} 
                toggleTheme={toggleTheme} 
                onHome={() => {}}
                onNewSession={() => setIsConfigOpen(true)}
                onProfileClick={() => setIsProfileOpen(true)}
                activeView="dashboard"
                userAvatar={user.avatarUrl}
            />
          </>
        ) : sessionState === 'quiz' ? (
          <div className="h-screen w-full fixed inset-0 z-50 bg-background">
            <QuizEngine 
              questions={activeQuestions} 
              mode={activeMode}
              onExit={() => setSessionState('dashboard')}
              onComplete={handleQuizComplete}
            />
          </div>
        ) : (
            <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
                {lastResult && (
                    <ReportCard 
                        result={lastResult} 
                        onHome={() => setSessionState('dashboard')} 
                    />
                )}
            </div>
        )}

      <QuizConfigModal 
          isOpen={isConfigOpen} 
          isGenerating={isGenerating}
          onClose={() => setIsConfigOpen(false)} 
          onStart={startQuiz} 
      />

      <ProfileModal
        user={user}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onUpdate={handleUpdateProfile}
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
