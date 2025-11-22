
import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  colorClass?: string; // Expecting full tailwind classes for bg/border/text
  className?: string; // Allow structural overrides (grid spans, sizes)
  isPrimary?: boolean;
  onClick?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  colorClass = "bg-[#1C1C1E] border-white/5 text-white", // Default fallback
  className = "",
  onClick
}) => {
  
  // Default to aspect-square unless overridden in className
  const aspectRatioClass = className.includes('aspect-') ? '' : 'aspect-square';

  return (
    <div 
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-[32px] p-6 flex flex-col justify-between
        border hover:scale-[1.02] transition-transform cursor-default shadow-lg
        ${aspectRatioClass}
        ${colorClass}
        ${className}
        ${onClick ? 'cursor-pointer active:scale-95' : ''}
      `}
    >
       {/* Background Gradient for subtle depth */}
       <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none mix-blend-overlay"></div>

       {/* Icon Bubble */}
       <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center text-xl mb-auto backdrop-blur-sm">
           {icon}
       </div>

       {/* Content */}
       <div className="z-10 mt-4">
           <h3 className="text-3xl lg:text-4xl font-heading font-bold tracking-tight mb-1 leading-none text-inherit">
             {value}
           </h3>
           <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 text-inherit">
             {title}
           </p>
       </div>
    </div>
  );
};
