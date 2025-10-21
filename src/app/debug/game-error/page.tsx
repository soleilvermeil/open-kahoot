'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import GameErrorScreen from '@/components/game-screens/GameErrorScreen';

function GameErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error') || 'Game not found or no longer available';

  return (
    <GameErrorScreen error={error} />
  );
}

export default function DebugGameErrorPage() {
  return (
    <Suspense fallback={<GameErrorScreen error="Loading..." />}>
      <GameErrorContent />
    </Suspense>
  );
} 