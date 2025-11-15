'use client';

import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PendingLayout from '@/components/PendingLayout'

export default function PlayerWaitingScreen() {
  const { t } = useTranslation();
  
  return (
    <PendingLayout
      icon={Check}
      title={t('screens.playerWaiting.title')}
      description={t('screens.playerWaiting.description')}
    />
  );
} 