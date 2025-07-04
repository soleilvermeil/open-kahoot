'use client';

import { useSearchParams } from 'next/navigation';
import GameAnsweringPhaseScreen from '@/components/game-screens/GameAnsweringPhaseScreen';
import { mockGame, mockQuestions } from '@/lib/debug-data';

export default function DebugGameAnsweringPage() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view') || 'host';
  
  const isHost = view === 'host';
  const isPlayer = view === 'player';

  const handleSubmitAnswer = (answerIndex: number) => {
    console.log('Submit answer:', answerIndex);
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