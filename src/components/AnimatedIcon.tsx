'use client';

import { LucideIcon } from 'lucide-react';

interface AnimatedIconProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  iconColor?: string;
  iconBgColor?: string;
}

export default function AnimatedIcon({ 
  icon: Icon, 
  size = 'lg',
  className = '',
  iconColor = 'text-white',
  iconBgColor = 'bg-white'
}: AnimatedIconProps) {
  const sizeStyles = {
    sm: {
      container: 'w-16 h-16',
      icon: 'w-8 h-8'
    },
    md: {
      container: 'w-20 h-20',
      icon: 'w-10 h-10'
    },
    lg: {
      container: 'w-24 h-24',
      icon: 'w-12 h-12'
    },
    xl: {
      container: 'w-32 h-32',
      icon: 'w-16 h-16'
    }
  };

        return (
    <div className="animate-pulse">
      <div className={`${sizeStyles[size].container} ${className.includes('bg-') ? '' : iconBgColor} rounded-full flex items-center justify-center mx-auto mb-6 ${className}`}>
        <Icon className={`${sizeStyles[size].icon} ${iconColor}`} />
      </div>
    </div>
  );
} 