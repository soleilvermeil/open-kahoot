'use client';

import { Suspense } from 'react';
import PageLayout from '@/components/PageLayout';
import Card from '@/components/Card';
import LoadingScreen from '@/components/LoadingScreen';

// Join Screen Components
import JoinGameFormScreen from '@/components/join-screens/JoinGameFormScreen';



export default function JoinPage() {
  return (
    <PageLayout gradient="join" maxWidth="md">
      <div className="flex items-center justify-center">
        <Suspense fallback={
          <Card className="w-full max-w-md">
            <LoadingScreen title="Loading..." size="sm" />
          </Card>
        }>
          <JoinGameFormScreen />
        </Suspense>
      </div>
    </PageLayout>
  );
} 