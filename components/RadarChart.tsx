
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface DataPoint {
  subject: string;
  score: number; // 0-100
  fullMark: number;
}

interface WeaknessRadarProps {
  data: DataPoint[];
}

export const WeaknessRadar: React.FC<WeaknessRadarProps> = ({ data }) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="currentColor" strokeOpacity={0.1} />
          <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.6 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Mastery"
            dataKey="score"
            stroke="#B388FF"
            strokeWidth={3}
            fill="#B388FF"
            fillOpacity={0.3}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1E1F20', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            itemStyle={{ color: '#B388FF' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};