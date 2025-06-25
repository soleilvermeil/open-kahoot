import { Trophy } from 'lucide-react';
import type { Player } from '@/types/game';

interface LeaderboardProps {
  players: Player[];
  title?: string;
  subtitle?: string;
  showPodium?: boolean;
  className?: string;
}

export default function Leaderboard({ 
  players, 
  title = "Leaderboard",
  subtitle,
  showPodium = true,
  className = ""
}: LeaderboardProps) {
  const getPodiumStyle = (index: number) => {
    if (!showPodium) return 'bg-white/10 border-white/20';
    
    switch (index) {
      case 0:
        return 'bg-yellow-500/30 border-yellow-400 ring-2 ring-yellow-300 scale-105';
      case 1:
        return 'bg-gray-300/30 border-gray-400';
      case 2:
        return 'bg-orange-600/30 border-orange-500';
      default:
        return 'bg-white/10 border-white/20';
    }
  };

  const getPositionBadgeStyle = (index: number) => {
    if (!showPodium) return 'bg-slate-600';
    
    switch (index) {
      case 0:
        return 'bg-yellow-500';
      case 1:
        return 'bg-gray-500';
      case 2:
        return 'bg-orange-600';
      default:
        return 'bg-slate-600';
    }
  };

  return (
    <div className={className}>
      {(title || subtitle) && (
        <div className="text-center mb-8">
          <Trophy className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
          <h1 className="text-4xl text-white mb-4 font-jua">{title}</h1>
          {subtitle && (
            <p className="text-white/80 text-xl">{subtitle}</p>
          )}
        </div>
      )}

      <div className="space-y-4">
        {players.map((player, index) => (
          <div
            key={player.id}
            className={`flex items-center justify-between p-6 rounded-lg border-2 transition-all ${getPodiumStyle(index)}`}
          >
            <div className="flex items-center gap-6">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${getPositionBadgeStyle(index)}`}>
                {index + 1}
              </div>
              <div>
                <div className="text-white font-bold text-xl">{player.name}</div>
                {index === 0 && showPodium && (
                  <div className="text-yellow-300 font-semibold">👑 Leader</div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold text-2xl">{player.score}</div>
              <div className="text-white/70 text-sm">points</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 