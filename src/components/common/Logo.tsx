
import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  color = 'dark' 
}) => {
  const sizeClasses = {
    small: 'text-xl',
    medium: 'text-2xl',
    large: 'text-3xl'
  };
  
  const colorClasses = {
    light: 'text-white',
    dark: 'text-primary'
  };
  
  return (
    <Link to="/" className="flex items-center">
      <span className={`font-bold ${sizeClasses[size]} ${colorClasses[color]}`}>
        TechPinoy
      </span>
    </Link>
  );
};
