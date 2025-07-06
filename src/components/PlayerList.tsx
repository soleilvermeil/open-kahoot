import { Brain } from 'lucide-react';
import type { Player } from '@/types/game';

interface PlayerListProps {
  players: Player[];
  title?: string;
  emptyMessage?: string;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  showDyslexiaControls?: boolean;
  onToggleDyslexiaSupport?: (playerId: string) => void;
}

export default function PlayerList({ 
  players, 
  title,
  emptyMessage = "Waiting for players to join...",
  className = "",
  columns = 3,
  showDyslexiaControls = false,
  onToggleDyslexiaSupport
}: PlayerListProps) {
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2", 
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  };

  const handleToggleDyslexiaSupport = (playerId: string) => {
    if (onToggleDyslexiaSupport) {
      onToggleDyslexiaSupport(playerId);
    }
  };

  return (
    <div className={className}>
      {title && (
        <h2 className="text-2xl text-white mb-4 font-jua">
          {title} ({players.length})
        </h2>
      )}
      
      {players.length > 0 ? (
        <div className={`grid ${columnClasses[columns]} gap-4`}>
          {players.map((player) => (
            <div
              key={player.id}
              className="bg-white/20 rounded-lg p-4 text-center relative"
            >
              <div className="text-white font-semibold">{player.name}</div>
              {player.score !== undefined && (
                <div className="text-white/80 text-sm mt-1">{player.score} points</div>
              )}
              
              {showDyslexiaControls && (
                <div className="mt-2 flex items-center justify-center">
                  <button
                    onClick={() => handleToggleDyslexiaSupport(player.id)}
                    className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                      player.hasDyslexiaSupport 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-white/20 text-white/70 hover:bg-white/30'
                    }`}
                    title={player.hasDyslexiaSupport ? 'Dyslexia support enabled' : 'Enable dyslexia support'}
                  >
                    <Brain className="w-3 h-3 mr-1" />
                    {player.hasDyslexiaSupport ? 'ON' : 'OFF'}
                  </button>
                </div>
              )}
              
              {player.hasDyslexiaSupport && (
                <div className="absolute top-1 right-1" title="Dyslexia support enabled">
                  <Brain className="w-4 h-4 text-purple-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-white/60 py-8">
          {emptyMessage}
        </div>
      )}
    </div>
  );
} 