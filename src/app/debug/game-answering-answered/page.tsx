'use client';

import GameAnsweringPhaseScreen from '@/components/game-screens/GameAnsweringPhaseScreen';
import { mockGame, mockQuestions } from '@/lib/debug-data';

export default function DebugGameAnsweringAnsweredPage() {

  return (
    <GameAnsweringPhaseScreen
      currentQuestion={mockQuestions[2]}
      timeLeft={15}
      game={mockGame}
      isHost={false}
      isPlayer={true}
      onSubmitAnswer={() => {}}
      hasAnswered={true}
    />
  );
} 