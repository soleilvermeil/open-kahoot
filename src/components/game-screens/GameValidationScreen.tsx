'use client';

import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PendingLayout from '@/components/PendingLayout';

export default function GameValidationScreen() {
  const { t } = useTranslation();
  
  return (
    <PendingLayout
      icon={ShieldCheck}
      title={t('screens.gameValidation.title')}
      description={t('screens.gameValidation.description')}
    />
  );
} 