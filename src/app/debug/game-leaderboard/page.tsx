'use client';

import GameLeaderboardScreen from '@/components/game-screens/GameLeaderboardScreen';
import { mockGame, mockLeaderboard } from '@/lib/debug-data';

export default function DebugGameLeaderboardPage() {
  const handleNextQuestion = () => {
    // Removed console.log
  };

  return (
    <GameLeaderboardScreen
      leaderboard={mockLeaderboard}
      game={mockGame}
      onNextQuestion={handleNextQuestion}
    />
  );
} 