'use client';

import { useSearchParams } from 'next/navigation';
import GameErrorScreen from '@/components/game-screens/GameErrorScreen';

export default function DebugGameErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Game not found or no longer available';

  return (
    <GameErrorScreen error={error} />
  );
} 