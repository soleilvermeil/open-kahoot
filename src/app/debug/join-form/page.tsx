'use client';

import { Suspense } from 'react';
import JoinGameFormScreen from '@/components/join-screens/JoinGameFormScreen';
import PageLayout from '@/components/PageLayout';

export default function DebugJoinFormPage() {
  return (
    <PageLayout gradient="join" maxWidth="md">
      <Suspense fallback={<div className="w-full max-w-md p-8 bg-white rounded-lg border border-gray-300 text-black">Loading...</div>}>
        <JoinGameFormScreen />
      </Suspense>
    </PageLayout>
  );
} 