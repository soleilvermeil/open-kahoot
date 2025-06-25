import type { Player } from '@/types/game';

interface PlayerListProps {
  players: Player[];
  title?: string;
  emptyMessage?: string;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export default function PlayerList({ 
  players, 
  title,
  emptyMessage = "Waiting for players to join...",
  className = "",
  columns = 3
}: PlayerListProps) {
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2", 
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
              className="bg-white/20 rounded-lg p-4 text-center"
            >
              <div className="text-white font-semibold">{player.name}</div>
              {player.score !== undefined && (
                <div className="text-white/80 text-sm mt-1">{player.score} points</div>
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