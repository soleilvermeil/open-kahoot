'use client';

import { useSearchParams } from 'next/navigation';
import GameFinalResultsScreen from '@/components/game-screens/GameFinalResultsScreen';
import { mockFinalScores } from '@/lib/debug-data';

export default function DebugGameFinalResultsPage() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view') || 'host';
  
  const isHost = view === 'host';

  const handleDownloadLogs = () => {
    console.log('Download logs');
  };

  return (
    <GameFinalResultsScreen
      finalScores={mockFinalScores}
      isHost={isHost}
      onDownloadLogs={handleDownloadLogs}
    />
  );
} 