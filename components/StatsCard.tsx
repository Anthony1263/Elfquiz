
import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  colorClass?: string; // Expects a tailwind class like 'bg-yellow-500'
  isPrimary?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  colorClass,
  isPrimary = false
}) => {
  
  // Base styles for the card container
  const containerStyles = `
    relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
    rounded-[32px] p-5 flex flex-col justify-between min-h-[140px] border border-white/5
  `;

  // Determine background: Use specific color if provided (for primary widgets), else use surface color
  const bgStyles = colorClass 
    ? `${colorClass} text-[#131314]` // Primary cards usually have dark text on pastel backgrounds
    : `bg-surface text-text-primary`;

  return (
    <div className={`${containerStyles} ${bgStyles}`}>
       
       {/* Background Decor for visual depth */}
       <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>

       <div className="flex justify-between items-start z-10">
           <div className={`
             w-10 h-10 rounded-full flex items-center justify-center text-lg backdrop-blur-sm
             ${colorClass ? 'bg-black/10' : 'bg-surface-highlight'}
           `}>
               {icon}
           </div>
           {trend && (
               <div className={`
                 px-2 py-1 rounded-full text-xs font-bold flex items-center
                 ${colorClass ? 'bg-black/10' : 'bg-surface-highlight'}
               `}>
                   {trend}
               </div>
           )}
       </div>

       <div className="mt-4 z-10">
           <h3 className="text-3xl font-heading font-bold tracking-tight">
             {value}
           </h3>
           <p className={`text-xs font-bold uppercase tracking-wider mt-1 ${colorClass ? 'opacity-60' : 'text-text-secondary'}`}>
             {title}
           </p>
       </div>
    </div>
  );
};