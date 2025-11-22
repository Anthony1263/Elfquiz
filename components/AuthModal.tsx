
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { UserProfile } from '../types';

interface AuthModalProps {
  onLogin: (user: UserProfile) => void;
}

type AuthStep = 'onboarding' | 'method' | 'login' | 'signup';

const ONBOARDING_SLIDES = [
  {
    id: 1,
    title: "Master Your Craft",
    desc: "AI-powered questions tailored to your specific field of study.",
    color: "bg-[#A8C7FA]", // Primary Blue
    text: "text-[#04080F]",
    icon: (
      <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" className="opacity-20" />
        <path d="M50 10V50L80 80" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 2,
    title: "Track Progress",
    desc: "Visualize your strengths and weaknesses with detailed analytics.",
    color: "bg-[#E2B6FF]", // Secondary Purple
    text: "text-[#2E004B]",
    icon: (
      <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
        <rect x="20" y="40" width="15" height="40" rx="4" fill="currentColor" />
        <rect x="45" y="20" width="15" height="60" rx="4" fill="currentColor" className="opacity-50" />
        <rect x="70" y="50" width="15" height="30" rx="4" fill="currentColor" className="opacity-80" />
      </svg>
    )
  },
  {
    id: 3,
    title: "Build Streaks",
    desc: "Consistency is key. Keep your flame alive every single day.",
    color: "bg-[#FCD34D]", // Amber
    text: "text-[#451a03]",
    icon: (
      <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
        <path d="M50 90C75 90 85 70 85 50C85 25 50 5 50 5C50 5 15 25 15 50C15 70 25 90 50 90Z" stroke="currentColor" strokeWidth="8" />
        <path d="M50 80C60 80 65 65 65 55C65 45 50 30 50 30C50 30 35 45 35 55C35 65 40 80 50 80Z" fill="currentColor" />
      </svg>
    )
  }
];

export const AuthModal: React.FC<AuthModalProps> = ({ onLogin }) => {
  const [step, setStep] = useState<AuthStep>('onboarding');
  const [slideIndex, setSlideIndex] = useState(0);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [eduLevel, setEduLevel] = useState('Undergraduate');
  const [major, setMajor] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockUser: UserProfile = {
      id: Math.random().toString(36).substr(2, 9),
      email: email,
      username: step === 'signup' ? username : email.split('@')[0] || 'Scholar',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${step === 'signup' ? username : email}`,
      streak: 1,
      xp: 0,
      masteryLevel: 'Novice',
      educationLevel: step === 'signup' ? eduLevel : 'Undergraduate',
      fieldOfStudy: step === 'signup' ? major : 'General Studies',
      lastActiveDate: new Date().toDateString()
    };

    localStorage.setItem('examflow_user', JSON.stringify(mockUser));
    setIsLoading(false);
    onLogin(mockUser);
  };

  // Handle Onboarding Carousel
  const handleNextSlide = () => {
    if (slideIndex < ONBOARDING_SLIDES.length - 1) {
      setSlideIndex(prev => prev + 1);
    } else {
      setStep('method');
    }
  };

  // Variants for page transitions
  const pageVariants = {
    initial: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0, scale: 0.95 }),
    animate: { x: 0, opacity: 1, scale: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0, scale: 0.95 })
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#1C1C1E] sm:bg-[#000000]/80 sm:backdrop-blur-sm sm:p-4 overflow-hidden">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <motion.div 
           className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-primary/5 rounded-full blur-[120px]"
           animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
           transition={{ duration: 8, repeat: Infinity }}
         />
         <motion.div 
           className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-secondary/5 rounded-full blur-[120px]"
           animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
           transition={{ duration: 10, repeat: Infinity, delay: 1 }}
         />
      </div>

      {/* Main Card Container */}
      <div className="relative w-full h-full sm:h-auto sm:max-w-[400px] sm:aspect-[9/19] md:aspect-[9/16] lg:h-[800px] flex flex-col">
        <AnimatePresence mode="wait" custom={1}>
          
          {/* === VIEW 1: ONBOARDING CAROUSEL === */}
          {step === 'onboarding' && (
            <motion.div
              key="onboarding"
              className="flex-1 bg-[#1E1F20] sm:rounded-[48px] relative overflow-hidden flex flex-col shadow-2xl border border-white/5"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            >
               {/* Image/Art Area */}
               <div className={`flex-[1.2] ${ONBOARDING_SLIDES[slideIndex].color} relative transition-colors duration-500 flex items-center justify-center overflow-hidden rounded-b-[48px]`}>
                  <motion.div
                    key={slideIndex}
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className={`relative z-10 ${ONBOARDING_SLIDES[slideIndex].text}`}
                  >
                    {ONBOARDING_SLIDES[slideIndex].icon}
                  </motion.div>
                  
                  {/* Decorative Background Patterns */}
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
               </div>

               {/* Content Area */}
               <div className="flex-1 px-8 pt-10 pb-8 flex flex-col justify-between bg-[#1E1F20]">
                  <div>
                    <motion.h2 
                      key={`t-${slideIndex}`}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-4xl font-heading font-bold text-white mb-4"
                    >
                      {ONBOARDING_SLIDES[slideIndex].title}
                    </motion.h2>
                    <motion.p 
                      key={`d-${slideIndex}`}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-lg text-text-secondary leading-relaxed"
                    >
                      {ONBOARDING_SLIDES[slideIndex].desc}
                    </motion.p>
                  </div>

                  <div className="flex items-center justify-between mt-8">
                    {/* Dots Indicator */}
                    <div className="flex gap-2">
                      {ONBOARDING_SLIDES.map((_, i) => (
                        <div 
                          key={i} 
                          className={`h-2 rounded-full transition-all duration-300 ${i === slideIndex ? `w-8 ${ONBOARDING_SLIDES[slideIndex].color}` : 'w-2 bg-white/20'}`}
                        />
                      ))}
                    </div>

                    {/* Next Button */}
                    <button 
                      onClick={handleNextSlide}
                      className={`w-16 h-16 rounded-full ${ONBOARDING_SLIDES[slideIndex].color} flex items-center justify-center text-black shadow-lg transition-transform active:scale-90`}
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                  </div>
               </div>
            </motion.div>
          )}

          {/* === VIEW 2: SELECTION METHOD === */}
          {step === 'method' && (
             <motion.div
                key="method"
                variants={pageVariants}
                custom={1}
                initial="initial" animate="animate" exit="exit"
                className="flex-1 bg-[#1E1F20] sm:rounded-[48px] p-8 flex flex-col justify-center shadow-2xl border border-white/5 relative overflow-hidden"
             >
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
                
                <div className="relative z-10 mb-12 text-center">
                    <div className="inline-block p-4 rounded-3xl bg-white/5 border border-white/10 mb-6 shadow-xl">
                        <span className="text-5xl font-pixel text-white">Qz</span>
                    </div>
                    <h1 className="text-3xl font-heading font-bold text-white">Welcome, Scholar.</h1>
                    <p className="text-text-secondary mt-2">Choose how you want to begin.</p>
                </div>

                <div className="space-y-4 relative z-10">
                    <button 
                      onClick={() => setStep('login')}
                      className="w-full p-6 rounded-[32px] bg-[#2D2E30] border border-white/5 hover:bg-white/10 transition-all group text-left flex items-center justify-between"
                    >
                        <div>
                            <div className="text-lg font-bold text-white group-hover:text-primary transition-colors">I have an account</div>
                            <div className="text-sm text-text-secondary">Continue your journey</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </div>
                    </button>

                    <button 
                      onClick={() => setStep('signup')}
                      className="w-full p-6 rounded-[32px] bg-primary text-[#04080F] shadow-xl shadow-primary/10 hover:scale-[1.02] transition-all text-left flex items-center justify-between"
                    >
                         <div>
                            <div className="text-lg font-bold">I'm new here</div>
                            <div className="text-sm opacity-70">Create a new profile</div>
                        </div>
                         <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </div>
                    </button>
                </div>
                
                <button onClick={() => setStep('onboarding')} className="mt-12 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-white transition-colors text-center">
                    Back to Intro
                </button>
             </motion.div>
          )}

          {/* === VIEW 3: LOGIN === */}
          {step === 'login' && (
             <motion.div
                key="login"
                variants={pageVariants}
                custom={1}
                initial="initial" animate="animate" exit="exit"
                className="flex-1 bg-[#1E1F20] sm:rounded-[48px] p-8 flex flex-col shadow-2xl border border-white/5"
             >
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => setStep('method')} className="w-10 h-10 rounded-full bg-[#2D2E30] flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="font-pixel text-2xl text-white/50">Qz</span>
                </div>

                <div className="mb-8">
                    <h2 className="text-3xl font-heading font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-text-secondary">Enter your credentials to access the archives.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
                    <div className="space-y-4">
                        <div className="group">
                            <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2 ml-4">Email</label>
                            <input 
                                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-16 bg-[#2D2E30] rounded-[24px] px-6 text-white outline-none border-2 border-transparent focus:border-primary transition-all placeholder:text-white/20 font-medium"
                                placeholder="archmage@academy.com"
                            />
                        </div>
                        <div className="group">
                             <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2 ml-4">Password</label>
                            <input 
                                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-16 bg-[#2D2E30] rounded-[24px] px-6 text-white outline-none border-2 border-transparent focus:border-primary transition-all placeholder:text-white/20 font-medium"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="mt-auto">
                        <Button 
                            type="submit" 
                            isLoading={isLoading}
                            className="w-full py-5 rounded-[24px] bg-white text-black font-bold text-lg hover:bg-gray-200 shadow-xl transition-transform active:scale-95"
                        >
                            Sign In
                        </Button>
                    </div>
                </form>
             </motion.div>
          )}

          {/* === VIEW 4: SIGNUP === */}
          {step === 'signup' && (
             <motion.div
                key="signup"
                variants={pageVariants}
                custom={1}
                initial="initial" animate="animate" exit="exit"
                className="flex-1 bg-[#1E1F20] sm:rounded-[48px] p-8 flex flex-col shadow-2xl border border-white/5 overflow-y-auto custom-scrollbar"
             >
                 <div className="flex items-center justify-between mb-6">
                    <button onClick={() => setStep('method')} className="w-10 h-10 rounded-full bg-[#2D2E30] flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="font-heading font-bold text-white text-lg">Create Profile</span>
                    <div className="w-10" /> 
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-4">
                    <div className="grid grid-cols-[auto_1fr] gap-4 items-center bg-[#2D2E30] p-4 rounded-[32px] border border-white/5">
                        <div className="w-16 h-16 rounded-full bg-[#1C1C1E] overflow-hidden border border-white/10 relative">
                             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username || 'new'}`} alt="avatar" className="w-full h-full" />
                        </div>
                        <div className="pr-2">
                            <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Username</label>
                            <input 
                                type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-transparent text-white font-bold text-xl outline-none placeholder:text-white/20"
                                placeholder="Name"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <input 
                            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-14 bg-[#2D2E30] rounded-[20px] px-6 text-white outline-none border-2 border-transparent focus:border-secondary transition-all placeholder:text-white/30 font-medium"
                            placeholder="Email Address"
                        />
                        
                        <div className="grid grid-cols-2 gap-3">
                             <select 
                                value={eduLevel} onChange={(e) => setEduLevel(e.target.value)}
                                className="w-full h-14 bg-[#2D2E30] rounded-[20px] px-4 text-white outline-none border-2 border-transparent focus:border-secondary appearance-none text-sm font-bold"
                            >
                                <option>High School</option>
                                <option>Undergraduate</option>
                                <option>Graduate</option>
                            </select>
                             <input 
                                type="text" required value={major} onChange={(e) => setMajor(e.target.value)}
                                className="w-full h-14 bg-[#2D2E30] rounded-[20px] px-6 text-white outline-none border-2 border-transparent focus:border-secondary transition-all placeholder:text-white/30 font-medium text-sm"
                                placeholder="Major"
                            />
                        </div>

                        <input 
                            type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-14 bg-[#2D2E30] rounded-[20px] px-6 text-white outline-none border-2 border-transparent focus:border-secondary transition-all placeholder:text-white/30 font-medium"
                            placeholder="Create Password"
                        />
                    </div>

                    <Button 
                        type="submit" 
                        isLoading={isLoading}
                        className="w-full py-5 mt-4 rounded-[24px] bg-secondary text-[#2E004B] font-bold text-lg hover:opacity-90 shadow-xl shadow-secondary/20 transition-transform active:scale-95"
                    >
                        Start Journey
                    </Button>
                </form>
             </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};
