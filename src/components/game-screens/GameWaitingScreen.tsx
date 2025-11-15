import { Hourglass } from 'lucide-react';
import { getGradient } from '@/lib/palette';
import AnimatedIcon from '@/components/AnimatedIcon';
import type { GamePhase } from '@/types/game';
import PendingLayout from '@/components/PendingLayout'

interface GameWaitingScreenProps {
  gameStatus: GamePhase | 'waiting-results';
}

export default function GameWaitingScreen({ gameStatus }: GameWaitingScreenProps) {
  return (
    <PendingLayout
      icon={Hourglass}
      title={gameStatus === 'waiting' ? 'Waiting for game to start...' : 'Game Starting!'}
      description="Get ready to answer some questions!"
    />
  );
}