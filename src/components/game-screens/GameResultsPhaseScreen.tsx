import { Trophy } from 'lucide-react';
import { getGradient } from '@/lib/palette';
import AnimatedIcon from '@/components/AnimatedIcon';
import HostResultsScreen from '@/components/host-screens/HostResultsScreen';
import PlayerResultsScreen from '@/components/player-screens/PlayerResultsScreen';
import type { GameStats, PersonalResult } from '@/types/game';

interface GameResultsPhaseScreenProps {
  isHost: boolean;
  isPlayer: boolean;
  questionStats: GameStats | null;
  personalResult: PersonalResult | null;
  onShowLeaderboard: () => void;
}

export default function GameResultsPhaseScreen({ 
  isHost, 
  isPlayer, 
  questionStats, 
  personalResult, 
  onShowLeaderboard 
}: GameResultsPhaseScreenProps) {
  // Host view - Show full statistics
  if (isHost && questionStats) {
    return (
      <div className={`min-h-dvh overflow-hidden ${getGradient('results')} p-8`}>
        <div className="container mx-auto max-w-4xl">
          <HostResultsScreen 
            questionStats={questionStats}
            onShowLeaderboard={onShowLeaderboard}
          />
        </div>
      </div>
    );
  }

  // Player view - Show personal competitive results
  if (isPlayer && personalResult) {
    return (
      <div className={`min-h-dvh overflow-hidden ${getGradient(personalResult.wasCorrect ? 'correct' : 'incorrect')} p-8`}>
        <div className="container mx-auto max-w-2xl">
          <PlayerResultsScreen personalResult={personalResult} />
        </div>
      </div>
    );
  }

  // Fallback if data isn't ready yet
  return (
    <div className={`min-h-dvh overflow-hidden ${getGradient('waiting')} flex items-center justify-center p-8`}>
      <div className="text-center">
        <AnimatedIcon icon={Trophy} size="md" iconColor="text-white/60" className="mb-4" />
        <h1 className="text-3xl font-bold text-white mb-4">Getting your results ready...</h1>
        <p className="text-white/80 text-lg">Hold tight, we&apos;re calculating scores!</p>
      </div>
    </div>
  );
} 