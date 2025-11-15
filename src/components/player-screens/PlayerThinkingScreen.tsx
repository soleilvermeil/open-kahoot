'use client';

import { Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PendingLayout from '@/components/PendingLayout';

export default function PlayerThinkingScreen() {
  const { t } = useTranslation();
  
  return (
    <div className="text-center w-full flex flex-col items-center justify-center">
    <PendingLayout
      icon={Eye}
      title={t('screens.playerThinking.title')}
      description={t('screens.playerThinking.description')}
      ignoreMinHeight
    />
    </div>
  );
} 