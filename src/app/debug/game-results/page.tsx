'use client';

import { useSearchParams } from 'next/navigation';
import GameResultsPhaseScreen from '@/components/game-screens/GameResultsPhaseScreen';
import { mockGameStats, mockPersonalResultCorrect, mockPersonalResultIncorrect } from '@/lib/debug-data';

export default function DebugGameResultsPage() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view') || 'host';
  const result = searchParams.get('result') || 'correct';
  
  const isHost = view === 'host';
  const isPlayer = view === 'player';

  const handleShowLeaderboard = () => {
    console.log('Show leaderboard');
  };

  const personalResult = result === 'correct' ? mockPersonalResultCorrect : mockPersonalResultIncorrect;

  return (
    <GameResultsPhaseScreen
      isHost={isHost}
      isPlayer={isPlayer}
      questionStats={isHost ? mockGameStats : null}
      personalResult={isPlayer ? personalResult : null}
      onShowLeaderboard={handleShowLeaderboard}
    />
  );
} 