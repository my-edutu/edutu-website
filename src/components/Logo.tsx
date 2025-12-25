import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 48 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <image href="/Edutu.svg" width={size} height={size} />
    </svg>
  );
};

export default Logo;