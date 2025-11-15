'use client';

import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PendingLayout from '@/components/PendingLayout';

interface GameWaitingForResultsScreenProps {
  isHost: boolean;
}

export default function GameWaitingForResultsScreen({ isHost }: GameWaitingForResultsScreenProps) {
  const { t } = useTranslation();
  
  return (
    <PendingLayout
      icon={Clock}
      title={isHost ? t('screens.gameWaitingForResults.hostTitle') : t('screens.gameWaitingForResults.playerTitle')}
      description={isHost ? t('screens.gameWaitingForResults.hostDescription') : t('screens.gameWaitingForResults.playerDescription')}
    />
  );
} 