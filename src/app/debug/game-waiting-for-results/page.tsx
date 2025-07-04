'use client';

import { useSearchParams } from 'next/navigation';
import GameWaitingForResultsScreen from '@/components/game-screens/GameWaitingForResultsScreen';

export default function DebugGameWaitingForResultsPage() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view') || 'host';
  
  const isHost = view === 'host';

  return (
    <GameWaitingForResultsScreen isHost={isHost} />
  );
} 