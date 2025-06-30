import { Users, Play } from 'lucide-react';
import type { Game } from '@/types/game';
import PageLayout from '@/components/PageLayout';
import Card from '@/components/Card';
import GamePinDisplay from '@/components/GamePinDisplay';
import PlayerList from '@/components/PlayerList';
import Button from '@/components/Button';

interface HostGameLobbyScreenProps {
  game: Game;
  joinUrl: string;
  onStartGame: () => void;
}

export default function HostGameLobbyScreen({ 
  game, 
  joinUrl, 
  onStartGame 
}: HostGameLobbyScreenProps) {
  const playersOnly = game.players.filter(p => !p.isHost);

  return (
    <PageLayout gradient="host" maxWidth="6xl">
      <Card>
        <div className="text-center mb-8">
          <h2 className="text-3xl text-white mb-4 font-jua">{game.title}</h2>
          
          <GamePinDisplay 
            pin={game.pin}
            joinUrl={joinUrl}
          />
        </div>

        {/* Separator line */}
        <div className="border-t border-white/20 mb-8"></div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl text-white flex items-center gap-2 font-jua">
              <Users className="w-6 h-6" />
              Players ({playersOnly.length})
            </h2>
            <Button
              onClick={onStartGame}
              disabled={playersOnly.length === 0}
              variant="black"
              size="lg"
              icon={Play}
            >
              Start Game
            </Button>
          </div>
          
          <PlayerList 
            players={playersOnly}
            emptyMessage="Waiting for players to join..."
            columns={3}
          />
        </div>
      </Card>
    </PageLayout>
  );
} 