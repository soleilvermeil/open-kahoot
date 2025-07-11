'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import GameFinalResultsScreen from '@/components/game-screens/GameFinalResultsScreen';
import { mockFinalScores } from '@/lib/debug-data';

function GameFinalResultsContent() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view') || 'host';
  
  const isHost = view === 'host';

  const handleDownloadLogs = () => {
    // Removed console.log
  };

  return (
    <GameFinalResultsScreen
      finalScores={mockFinalScores}
      isHost={isHost}
      onDownloadLogs={handleDownloadLogs}
    />
  );
}

export default function DebugGameFinalResultsPage() {
  return (
    <Suspense fallback={<GameFinalResultsScreen finalScores={[]} isHost={true} onDownloadLogs={() => {}} />}>
      <GameFinalResultsContent />
    </Suspense>
  );
} 