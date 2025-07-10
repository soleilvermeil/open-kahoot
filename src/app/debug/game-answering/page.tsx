'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import GameAnsweringPhaseScreen from '@/components/game-screens/GameAnsweringPhaseScreen';
import { mockGame, mockQuestions } from '@/lib/debug-data';

function GameAnsweringContent() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view') || 'host';
  
  const isHost = view === 'host';
  const isPlayer = view === 'player';

  const handleSubmitAnswer = (answerIndex: number) => {
    // Removed console.log
  };

  return (
    <GameAnsweringPhaseScreen
      currentQuestion={mockQuestions[2]}
      timeLeft={15}
      game={mockGame}
      isHost={isHost}
      isPlayer={isPlayer}
      onSubmitAnswer={handleSubmitAnswer}
      hasAnswered={false}
    />
  );
}

export default function DebugGameAnsweringPage() {
  return (
    <Suspense fallback={<GameAnsweringPhaseScreen currentQuestion={mockQuestions[0]} timeLeft={15} game={mockGame} isHost={true} isPlayer={false} onSubmitAnswer={() => {}} hasAnswered={false} />}>
      <GameAnsweringContent />
    </Suspense>
  );
} 