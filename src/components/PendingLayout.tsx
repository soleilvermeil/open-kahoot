import React from 'react'
import { getGradient } from '@/lib/palette';
import AnimatedIcon from '@/components/AnimatedIcon';
import { LucideIcon } from 'lucide-react';

interface PendingLayoutProps {
  icon?: LucideIcon;
  iconColor?: string;
  title: string;
  description: string;
  ignoreMinHeight?: boolean;
}

const PendingLayout = ({ icon, iconColor, title, description, ignoreMinHeight }: PendingLayoutProps) => {
    return (
        <div className={`${ignoreMinHeight ? '' : 'min-h-screen'} ${getGradient('waiting')} flex items-center justify-center p-8`}>
          <div className="text-center">
            {icon && (
              <AnimatedIcon icon={icon} size="md" iconColor={iconColor || "text-indigo-400"} className="mb-4" />
            )}
            <h1 className="text-3xl font-bold text-black mb-4">
              {title}
            </h1>
            <p className="text-gray-600 text-lg">
              {description}
            </p>
            <div className="flex justify-center mt-6">
              <div className="animate-pulse flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      );
}

export default PendingLayout