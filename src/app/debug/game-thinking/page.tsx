'use client';

import { useSearchParams } from 'next/navigation';
import GameThinkingPhaseScreen from '@/components/game-screens/GameThinkingPhaseScreen';
import { mockGame, mockQuestions } from '@/lib/debug-data';

export default function DebugGameThinkingPage() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view') || 'host';
  
  const isHost = view === 'host';
  const isPlayer = view === 'player';

  return (
    <GameThinkingPhaseScreen
      currentQuestion={mockQuestions[2]}
      timeLeft={3}
      game={mockGame}
      isHost={isHost}
      isPlayer={isPlayer}
    />
  );
} 