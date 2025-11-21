
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
    {/* Pixel Art Elf Hat (Purple/Green) */}
    <rect x="10" y="2" width="4" height="2" fill="#E2B6FF" />
    <rect x="8" y="4" width="8" height="2" fill="#E2B6FF" />
    <rect x="6" y="6" width="12" height="2" fill="#E2B6FF" />
    
    {/* Face (Skin Tone) */}
    <rect x="7" y="8" width="10" height="6" fill="#FCD34D" />
    
    {/* Eyes */}
    <rect x="9" y="10" width="2" height="2" fill="#131314" />
    <rect x="14" y="10" width="2" height="2" fill="#131314" />
    
    {/* Ears */}
    <rect x="5" y="9" width="2" height="4" fill="#FCD34D" />
    <rect x="17" y="9" width="2" height="4" fill="#FCD34D" />
    
    {/* Body/Tunic */}
    <rect x="6" y="14" width="12" height="8" fill="#69F0AE" />
    
    {/* Book (Blue) */}
    <rect x="13" y="16" width="6" height="5" fill="#A8C7FA" />
    <rect x="14" y="17" width="4" height="3" fill="white" />
  </svg>
);