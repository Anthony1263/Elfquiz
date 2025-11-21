
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { UserProfile } from '../types';
import { Logo } from './Logo';

interface AuthModalProps {
  onLogin: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
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
      username: isSignUp ? username : email.split('@')[0],
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${isSignUp ? username : email}`,
      streak: 1, // Start fresh
      xp: 0,
      masteryLevel: 'Novice',
      educationLevel: isSignUp ? eduLevel : 'Undergraduate',
      fieldOfStudy: isSignUp ? major : 'General Studies',
      lastActiveDate: new Date().toDateString() // Mark today as active
    };

    localStorage.setItem('examflow_user', JSON.stringify(mockUser));
    setIsLoading(false);
    onLogin(mockUser);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#050505] text-text-primary p-4 overflow-hidden">
      {/* Vibrant Background Mesh - Brighter */}
      <div className="absolute inset-0">
         <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/40 rounded-full blur-[100px] animate-pulse-slow"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-secondary/40 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* High Contrast Glass Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-[40px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
            
            {/* Neon Line */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-success"></div>

            <div className="text-center mb-8">
                <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-20 h-20 mx-auto mb-4 bg-black/40 rounded-2xl flex items-center justify-center shadow-lg border border-white/20"
                >
                    <Logo className="w-12 h-12" />
                </motion.div>
                <h1 className="text-3xl font-heading font-bold text-white mb-1 tracking-tight drop-shadow-lg">
                    {isSignUp ? "Join the Guild" : "Quiz Elf"}
                </h1>
                <p className="text-white/70 font-medium text-sm">
                    {isSignUp ? "Begin your mastery journey." : "Log in to access your portal."}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                    <>
                        <div className="space-y-1">
                            <input 
                                type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3.5 text-white focus:bg-black/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-white/40 font-medium"
                                placeholder="Scholar Name"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                                <select value={eduLevel} onChange={(e) => setEduLevel(e.target.value)} className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3.5 text-white focus:border-secondary outline-none appearance-none font-medium">
                                    <option>High School</option>
                                    <option>Undergraduate</option>
                                    <option>Graduate</option>
                                    <option>Professional</option>
                                </select>
                            </div>
                            <input type="text" required value={major} onChange={(e) => setMajor(e.target.value)} className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3.5 text-white focus:border-secondary outline-none placeholder-white/40 font-medium" placeholder="Major" />
                        </div>
                    </>
                )}

                <input 
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3.5 text-white focus:bg-black/50 focus:border-primary outline-none transition-all placeholder-white/40 font-medium"
                    placeholder="Email Address"
                />

                <input 
                    type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3.5 text-white focus:bg-black/50 focus:border-primary outline-none transition-all placeholder-white/40 font-medium"
                    placeholder="Password"
                />

                <Button 
                    type="submit" 
                    variant="filled" 
                    isLoading={isLoading}
                    className="w-full rounded-xl py-4 font-bold text-lg mt-4 bg-white text-black hover:bg-gray-200 border-none shadow-lg shadow-white/10"
                >
                    {isSignUp ? "Create Account" : "Enter Portal"}
                </Button>
            </form>

            <div className="mt-6 text-center">
                <button 
                    onClick={() => setIsSignUp(!isSignUp)} 
                    className="text-sm text-white/70 hover:text-white transition-colors"
                >
                    {isSignUp ? "Already have an account? " : "New here? "}
                    <span className="text-primary font-bold underline decoration-2 underline-offset-4">
                        {isSignUp ? "Log In" : "Sign Up"}
                    </span>
                </button>
            </div>

        </div>
      </motion.div>
    </div>
  );
};
