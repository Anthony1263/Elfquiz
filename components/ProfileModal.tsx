
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { UserProfile } from '../types';

interface ProfileModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedUser: UserProfile) => void;
  onLogout: () => void;
}

const AVATAR_SEEDS = ['Felix', 'Aneka', 'Milo', 'Bella', 'Oscar', 'Lily', 'Leo', 'Zoe', 'Max', 'Ruby'];
const SEASONS = ['spring', 'summer', 'autumn', 'winter'];

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, isOpen, onClose, onUpdate, onLogout }) => {
  const [username, setUsername] = useState(user.username);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatarUrl);
  const [eduLevel, setEduLevel] = useState(user.educationLevel || 'Undergraduate');
  const [major, setMajor] = useState(user.fieldOfStudy || 'General Studies');
  const [season, setSeason] = useState<'spring'|'summer'|'autumn'|'winter'>(user.themeSeason || 'summer');

  if (!isOpen) return null;

  const handleSave = () => {
    const updatedUser = { 
        ...user, 
        username, 
        avatarUrl: selectedAvatar,
        educationLevel: eduLevel,
        fieldOfStudy: major,
        themeSeason: season
    };
    localStorage.setItem('examflow_user', JSON.stringify(updatedUser));
    onUpdate(updatedUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
       
       <motion.div 
         initial={{ opacity: 0, scale: 0.95, y: 20 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         exit={{ opacity: 0, scale: 0.95, y: 20 }}
         className="bg-[#1E1F20] border border-white/10 rounded-[40px] p-8 max-w-lg w-full shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto custom-scrollbar"
       >
         <div className="flex justify-between items-center mb-8">
             <h2 className="text-2xl font-heading font-bold text-white">Edit Profile</h2>
             <button onClick={onClose} className="p-2 hover:bg-surface-highlight rounded-full">
                 <svg className="w-6 h-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
         </div>

         {/* Username Input */}
         <div className="mb-6">
            <label className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-2 block ml-2">Display Name</label>
            <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-surface-highlight border border-white/5 rounded-2xl px-4 py-3 text-white focus:border-primary outline-none"
            />
         </div>

         {/* Academic Context Input */}
         <div className="mb-8 grid grid-cols-2 gap-4">
            <div>
                <label className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-2 block ml-2">Level</label>
                <select 
                    value={eduLevel}
                    onChange={(e) => setEduLevel(e.target.value)}
                    className="w-full bg-surface-highlight border border-white/5 rounded-2xl px-4 py-3 text-white focus:border-primary outline-none appearance-none"
                >
                    <option>High School</option>
                    <option>Undergraduate</option>
                    <option>Graduate</option>
                    <option>Professional</option>
                </select>
            </div>
            <div>
                <label className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-2 block ml-2">Focus</label>
                <input 
                    type="text" 
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    className="w-full bg-surface-highlight border border-white/5 rounded-2xl px-4 py-3 text-white focus:border-primary outline-none"
                />
            </div>
         </div>
        
         {/* Season Selector */}
         <div className="mb-8">
            <label className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4 block ml-2">App Atmosphere</label>
            <div className="flex gap-2">
                {SEASONS.map((s) => (
                    <button
                        key={s}
                        onClick={() => setSeason(s as any)}
                        className={`flex-1 py-3 rounded-xl capitalize text-sm font-bold transition-all ${
                            season === s 
                            ? 'bg-white text-black scale-105 shadow-lg' 
                            : 'bg-surface-highlight text-text-secondary hover:text-white'
                        }`}
                    >
                        {s}
                    </button>
                ))}
            </div>
         </div>

         {/* Avatar Grid */}
         <div className="mb-8">
            <label className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4 block ml-2">Choose Avatar</label>
            <div className="grid grid-cols-5 gap-3">
                {AVATAR_SEEDS.map((seed) => {
                    const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                    const isSelected = selectedAvatar === url;
                    return (
                        <motion.button 
                            key={seed}
                            onClick={() => setSelectedAvatar(url)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`relative rounded-full aspect-square overflow-hidden transition-all ${isSelected ? 'ring-4 ring-primary' : 'opacity-70 hover:opacity-100'}`}
                        >
                            <img src={url} alt={seed} className="w-full h-full bg-surface-highlight" />
                            {isSelected && (
                                <motion.div 
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute inset-0 bg-primary/20 flex items-center justify-center"
                                >
                                    <svg className="w-4 h-4 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                </motion.div>
                            )}
                        </motion.button>
                    )
                })}
            </div>
         </div>

         <div className="flex gap-4 pt-4 border-t border-white/5">
             <Button variant="outlined" onClick={onLogout} className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl">
                 Log Out
             </Button>
             <Button variant="filled" onClick={handleSave} className="flex-[2] bg-white text-black hover:bg-gray-200 rounded-xl">
                 Save Changes
             </Button>
         </div>

       </motion.div>
    </div>
  );
};