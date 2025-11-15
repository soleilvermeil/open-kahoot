'use client';

import { UserCog } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PendingLayout from '@/components/PendingLayout';

export default function GameFallbackScreen() {
  const { t } = useTranslation();
  
  return (
    <PendingLayout
      icon={UserCog}
      title={t('screens.gameFallback.title')}
      description={t('screens.gameFallback.description')}
    />
  );
} 