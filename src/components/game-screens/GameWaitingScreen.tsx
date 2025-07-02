import { Hourglass } from 'lucide-react';
import { getGradient } from '@/lib/palette';
import AnimatedIcon from '@/components/AnimatedIcon';
import type { GamePhase } from '@/types/game';

interface GameWaitingScreenProps {
  gameStatus: GamePhase | 'waiting-results';
}

export default function GameWaitingScreen({ gameStatus }: GameWaitingScreenProps) {
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