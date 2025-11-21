import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'tonal' | 'outlined' | 'text';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'filled', 
  size = 'md', 
  isLoading, 
  className = '', 
  disabled,
  icon,
  ...props 
}) => {
  // Material 3 / Gemini Design Tokens
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-full disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group";
  
  const variants = {
    filled: "bg-primary text-[#04080F] hover:shadow-[0_4px_12px_rgba(168,199,250,0.3)] active:scale-95",
    tonal: "bg-surface-highlight text-text-primary hover:bg-[#3C3D40] active:scale-95",
    outlined: "border border-accent text-primary hover:bg-primary-dim",
    text: "bg-transparent text-primary hover:bg-primary-dim"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm gap-2",
    md: "px-6 py-3 text-base gap-2",
    lg: "px-8 py-4 text-lg gap-3"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Loading Spinner */}
      {isLoading && (
        <svg className="animate-spin -ml-1 h-4 w-4 text-current absolute left-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {/* Icon */}
      {!isLoading && icon && <span className="text-current">{icon}</span>}
      
      <span className={isLoading ? 'opacity-0' : 'opacity-100'}>{children}</span>

      {/* Subtle Hover Glow */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
    </button>
  );
};