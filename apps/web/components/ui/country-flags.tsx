'use client';
import React, { useEffect, useState } from 'react';

const countries = [
  { code: 'US', flag: '🇺🇸', name: 'United States' },
  { code: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'AU', flag: '🇦🇺', name: 'Australia' },
  { code: 'CA', flag: '🇨🇦', name: 'Canada' },
  { code: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: 'FR', flag: '🇫🇷', name: 'France' },
  { code: 'NL', flag: '🇳🇱', name: 'Netherlands' },
  { code: 'SE', flag: '🇸🇪', name: 'Sweden' },
  { code: 'JP', flag: '🇯🇵', name: 'Japan' },
  { code: 'KR', flag: '🇰🇷', name: 'South Korea' },
  { code: 'SG', flag: '🇸🇬', name: 'Singapore' },
  { code: 'NZ', flag: '🇳🇿', name: 'New Zealand' },
  { code: 'IE', flag: '🇮🇪', name: 'Ireland' },
  { code: 'CH', flag: '🇨🇭', name: 'Switzerland' },
  { code: 'ES', flag: '🇪🇸', name: 'Spain' },
  { code: 'IT', flag: '🇮🇹', name: 'Italy' },
  { code: 'NO', flag: '🇳🇴', name: 'Norway' },
  { code: 'DK', flag: '🇩🇰', name: 'Denmark' },
  { code: 'FI', flag: '🇫🇮', name: 'Finland' },
  { code: 'BE', flag: '🇧🇪', name: 'Belgium' },
  { code: 'AT', flag: '🇦🇹', name: 'Austria' },
  { code: 'PT', flag: '🇵🇹', name: 'Portugal' },
  { code: 'PL', flag: '🇵🇱', name: 'Poland' },
  { code: 'CZ', flag: '🇨🇿', name: 'Czech Republic' },
  { code: 'HU', flag: '🇭🇺', name: 'Hungary' },
  { code: 'GR', flag: '🇬🇷', name: 'Greece' },
  { code: 'IL', flag: '🇮🇱', name: 'Israel' },
  { code: 'HK', flag: '🇭🇰', name: 'Hong Kong' },
  { code: 'IN', flag: '🇮🇳', name: 'India' },
  { code: 'ZA', flag: '🇿🇦', name: 'South Africa' },
  { code: 'BR', flag: '🇧🇷', name: 'Brazil' },
];

const duplicatedCountries = [...countries, ...countries, ...countries];

export function CountryFlags() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev >= 150) return 0;
        return prev + 1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const firstLine = duplicatedCountries.slice(0, Math.floor(duplicatedCountries.length / 2));
  const secondLine = duplicatedCountries.slice(Math.floor(duplicatedCountries.length / 2));

  return (
    <div className="w-full overflow-hidden py-8 bg-white dark:bg-zinc-950">
      <div className="text-center mb-8">
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Used by students across{' '}
          <span className="font-bold text-zinc-900 dark:text-white">{count}+</span>{' '}
          countries
        </p>
      </div>
      
      <div className="flex flex-col gap-4">
        {/* First line - moves right */}
        <div className="flex gap-8 animate-[scroll-left_20s_linear_infinite]">
          {firstLine.map((country, i) => (
            <span 
              key={`first-${i}`} 
              className="text-2xl shrink-0" 
              title={country.name}
            >
              {country.flag}
            </span>
          ))}
        </div>
        
        {/* Second line - moves left */}
        <div className="flex gap-8 animate-[scroll-right_20s_linear_infinite]">
          {secondLine.map((country, i) => (
            <span 
              key={`second-${i}`} 
              className="text-2xl shrink-0" 
              title={country.name}
            >
              {country.flag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}