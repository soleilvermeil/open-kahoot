import { useEffect } from 'react';
import { Hourglass } from 'lucide-react';
import { getGradient } from '@/lib/palette';
import AnimatedIcon from '@/components/AnimatedIcon';
import type { GamePhase } from '@/types/game';
import { useCountdownMusic } from '@/lib/useCountdownMusic';
import { getSocket } from '@/lib/socket-client';
import type { Player } from '@/types/game';

interface GameWaitingScreenProps {
  gameStatus: GamePhase | 'waiting-results';
}

export default function GameWaitingScreen({ gameStatus }: GameWaitingScreenProps) {
  const { startLobbyMusic, stopLobbyMusic, playBlup } = useCountdownMusic();

  useEffect(() => {
    // Only play lobby music during actual waiting phase (not during game starting preparation or waiting for results)
    const isWaitingPhase = gameStatus === 'waiting';
    
    if (isWaitingPhase) {
      startLobbyMusic();

      // Listen for player join events to play blup sound
      const socket = getSocket();
      
      const handlePlayerJoined = (player: Player) => {
        console.log('Player joined:', player.name);
        playBlup();
      };

      socket.on('playerJoined', handlePlayerJoined);

      return () => {
        socket.off('playerJoined', handlePlayerJoined);
      };
    } else {
      // Stop lobby music when game is starting or in other phases
      stopLobbyMusic();
    }

    // Cleanup when component unmounts
    return () => {
      if (isWaitingPhase) {
        stopLobbyMusic();
      }
    };
  }, [gameStatus, startLobbyMusic, stopLobbyMusic, playBlup]);

  return (
    <div className={`min-h-screen ${getGradient('waiting')} flex items-center justify-center p-8`}>
      <div className="text-center">
        <AnimatedIcon icon={Hourglass} />
        <h1 className="text-4xl text-white mb-4 font-jua">
          {gameStatus === 'waiting' ? 'Waiting for game to start...' : 'Game Starting!'}
        </h1>
        <p className="text-white/80 text-xl">Get ready to answer some questions!</p>
      </div>
    </div>
  );
} 