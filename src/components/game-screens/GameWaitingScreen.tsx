'use client';

import { Hourglass } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { GamePhase } from '@/types/game';
import PendingLayout from '@/components/PendingLayout'

interface GameWaitingScreenProps {
  gameStatus: GamePhase | 'waiting-results';
}

export default function GameWaitingScreen({ gameStatus }: GameWaitingScreenProps) {
  const { t } = useTranslation();
  
  return (
    <PendingLayout
      icon={Hourglass}
      title={gameStatus === 'waiting' ? t('screens.gameWaiting.waitingTitle') : t('screens.gameWaiting.startingTitle')}
      description={t('screens.gameWaiting.description')}
    />
  );
}