import { Trophy, LucideIcon } from 'lucide-react';
import type { Player } from '@/types/game';
import Button from './Button';
import AnimatedIcon from './AnimatedIcon';
import { palette } from '@/lib/palette';

interface LeaderboardProps {
  players: Player[];
  title?: string;
  subtitle?: string;
  showPodium?: boolean;
  showIcon?: boolean;
  className?: string;
  buttons?: {
    text: string;
    onClick: () => void;
    icon?: LucideIcon;
    iconPosition?: 'left' | 'right';
    variant?: 'link' | 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline' | 'pill' | 'black';
  }[];
}

export default function Leaderboard({ 
  players, 
  title = "Leaderboard",
  subtitle,
  showPodium = true,
  showIcon = true,
  className = "",
  buttons
}: LeaderboardProps) {
  return (
    <div className="">
      {(title || subtitle) && (
        <div className="text-center mb-8">
          {showIcon && (
            <AnimatedIcon icon={Trophy} size="xl" iconColor="text-black" />
          )}
          <h1 className="text-4xl text-black mb-4 font-jua">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 text-xl">{subtitle}</p>
          )}
        </div>
      )}

      {buttons && buttons.length > 0 && (
        <div className="text-center mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {buttons.map((button, index) => (
              <Button
                key={index}
                onClick={button.onClick}
                variant={button.variant || "primary"}
                size="xl"
                icon={button.icon}
                iconPosition={button.iconPosition}
                className="mx-auto sm:mx-0"
              >
                {button.text}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {players.map((player, index) => (
          <div
            key={player.id}
            className="flex items-center justify-between p-4 rounded-lg border border-gray-300 bg-white"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${palette.accent.bg}`}>
                {index + 1}
              </div>
              <div className="text-black font-semibold text-lg">{player.name}</div>
            </div>
            <div className="text-right">
              <div className="text-black font-bold text-xl">{player.score}</div>
              <div className="text-gray-500 text-xs">points</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 