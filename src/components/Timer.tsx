import { Clock, Eye } from 'lucide-react';

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
  const progressColor = variant === 'thinking' ? 'bg-yellow-400' : 'bg-white';

  return (
    <div className={`text-center mb-8 ${className}`}>
      <div className="flex items-center justify-center gap-2 mb-4">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <p className="text-white/80 text-lg">{label}</p>
      <div className="w-full bg-white/20 rounded-full h-3 mt-4">
        <div 
          className={`${progressColor} h-3 rounded-full transition-all duration-1000 ease-linear`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
} 