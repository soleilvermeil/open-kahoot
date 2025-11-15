import { Clock } from 'lucide-react';
import PendingLayout from '@/components/PendingLayout';

interface GameWaitingForResultsScreenProps {
  isHost: boolean;
}

export default function GameWaitingForResultsScreen({ isHost }: GameWaitingForResultsScreenProps) {
  return (
    <PendingLayout
      icon={Clock}
      title={isHost ? 'Calculating results...' : 'Getting your results ready...'}
      description={isHost ? 'Preparing the results for all players' : 'Hold tight, we\'re calculating your score!'}
    />
  );
} 