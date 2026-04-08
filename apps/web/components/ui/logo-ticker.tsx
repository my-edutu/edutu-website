'use client';
import React from 'react';

const logos = [
  { name: 'Harvard', text: '🏛️ Harvard' },
  { name: 'Oxford', text: '🏛️ Oxford' },
  { name: 'MIT', text: '🏛️ MIT' },
  { name: 'Stanford', text: '🏛️ Stanford' },
  { name: 'Yale', text: '🏛️ Yale' },
  { name: 'Cambridge', text: '🏛️ Cambridge' },
  { name: 'Imperial', text: '🏛️ Imperial' },
  { name: 'UCL', text: '🏛️ UCL' },
  { name: 'Princeton', text: '🏛️ Princeton' },
  { name: 'Columbia', text: '🏛️ Columbia' },
  { name: 'Yong World', text: '🌍 One Young World' },
  { name: 'Mastercard', text: '💳 Mastercard' },
  { name: 'ANU', text: '🏛️ ANU' },
  { name: 'University of Melbourne', text: '🏛️ Melbourne' },
  { name: 'University of Sydney', text: '🏛️ Sydney' },
  { name: 'UNSW', text: '🏛️ UNSW' },
];

const duplicatedLogos = [...logos, ...logos, ...logos];

export function LogoTicker() {
  const firstLine = duplicatedLogos.slice(0, Math.floor(duplicatedLogos.length / 2));
  const secondLine = duplicatedLogos.slice(Math.floor(duplicatedLogos.length / 2));

  return (
    <div className="w-full overflow-hidden py-12 bg-slate-50 border-t border-b border-slate-200">
      <div className="text-center mb-8">
        <p className="text-lg font-medium text-slate-700">
          Get opportunities from leading institutions worldwide
        </p>
      </div>
      
      <div className="flex flex-col gap-6">
        <div className="flex gap-12 items-center animate-[scroll-left_30s_linear_infinite]">
          {firstLine.map((logo, i) => (
            <span 
              key={`first-${i}`} 
              className="text-lg font-medium text-slate-500 whitespace-nowrap hover:text-slate-800 transition-colors"
            >
              {logo.text}
            </span>
          ))}
        </div>
        
        <div className="flex gap-12 items-center animate-[scroll-right_30s_linear_infinite]">
          {secondLine.map((logo, i) => (
            <span 
              key={`second-${i}`} 
              className="text-lg font-medium text-slate-500 whitespace-nowrap hover:text-slate-800 transition-colors"
            >
              {logo.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}