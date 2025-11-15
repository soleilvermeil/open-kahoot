'use client';

import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import Card from '@/components/Card';
import LoadingScreen from '@/components/LoadingScreen';

// Join Screen Components
import JoinGameFormScreen from '@/components/join-screens/JoinGameFormScreen';



export default function JoinPage() {
  const { t } = useTranslation();
  
  return (
    <PageLayout gradient="join" maxWidth="md" centerVertically={true}>
      <div className="flex items-center justify-center">
        <Suspense fallback={
          <Card className="w-full max-w-md">
            <LoadingScreen title={t('join.loading')} size="sm" />
          </Card>
        }>
          <JoinGameFormScreen />
        </Suspense>
      </div>
    </PageLayout>
  );
} 