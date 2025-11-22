
import React from 'react';

interface Course {
    id: number;
    topic: string;
    theme: {
        bg: string;
        hover: string;
        text: string;
        icon: string;
    };
}

interface CourseCardProps {
    courses: Course[];
    onStart: (topic: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ courses, onStart }) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
      {courses.map((course) => (
        <div 
          key={course.id}
          onClick={() => onStart(course.topic)}
          className="min-w-[200px] md:min-w-[240px] p-6 rounded-[32px] cursor-pointer transition-all hover:scale-[1.02] relative group overflow-hidden flex-shrink-0"
          style={{ backgroundColor: course.theme.bg }}
        >
           {/* Background Icon Faded */}
           <div className="absolute -right-4 -bottom-4 opacity-10 transform rotate-12 scale-150 text-6xl grayscale transition-transform group-hover:rotate-0">
              {course.theme.icon}
           </div>

           <div className="relative z-10 flex flex-col h-full justify-between min-h-[120px]">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm mb-4 text-xl">
                 {course.theme.icon}
              </div>
              <div>
                 <h4 className="text-xl font-heading font-bold leading-tight mb-1" style={{ color: course.theme.text }}>
                    {course.topic.split(': ')[1] || course.topic}
                 </h4>
                 <span className="text-xs font-bold uppercase tracking-wider opacity-60" style={{ color: course.theme.text }}>
                    {course.topic.split(': ')[0] || 'Module'}
                 </span>
              </div>
           </div>
        </div>
      ))}
    </div>
  );
};
