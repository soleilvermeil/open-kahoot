import { Clock, Eye } from 'lucide-react';
import { palette } from '@/lib/palette';

interface TimerProps {
  timeLeft: number;
  totalTime: number;
  label: string;
  variant?: 'thinking' | 'answering';
  className?: string;
}

export default function Timer({ 
  timeLeft, 
  totalTime, 
  label, 
  variant = 'answering',
  className = ""
}: TimerProps) {
  const percentage = (timeLeft / totalTime) * 100;
  const Icon = variant === 'thinking' ? Eye : Clock;
  const progressColor = variant === 'thinking' ? palette.accent.bg : palette.timer.answering;
  const iconColor = variant === 'thinking' ? 'text-black' : 'text-black';
  const labelColor = variant === 'thinking' ? 'text-black' : 'text-gray-600';

  return (
    <div className={`text-center mb-8 ${className}`}>
      <div className="flex items-center justify-center gap-2 mb-4">
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
      <p className={`${labelColor} text-lg`}>{label}</p>
      <div className={`w-full ${palette.timer.progress} rounded-full h-3 mt-4`}>
        <div 
          className={`${progressColor} h-3 rounded-full transition-all duration-1000 ease-linear`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
} 