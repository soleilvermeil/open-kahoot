'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import GameErrorScreen from '@/components/game-screens/GameErrorScreen';
import { useTranslation } from 'react-i18next';

function GameErrorContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const error = searchParams?.get('error') || t('screens.gameError.gameNotFound');

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