'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import GameWaitingForResultsScreen from '@/components/game-screens/GameWaitingForResultsScreen';

function GameWaitingForResultsContent() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view') || 'host';
  
  const isHost = view === 'host';

  return (
    <GameWaitingForResultsScreen isHost={isHost} />
  );
}

export default function DebugGameWaitingForResultsPage() {
  return (
    <Suspense fallback={<GameWaitingForResultsScreen isHost={true} />}>
      <GameWaitingForResultsContent />
    </Suspense>
  );
} 