'use client';

import JoinGameFormScreen from '@/components/join-screens/JoinGameFormScreen';
import PageLayout from '@/components/PageLayout';

export default function DebugJoinFormPage() {
  return (
    <PageLayout gradient="join" maxWidth="md">
      <JoinGameFormScreen />
    </PageLayout>
  );
} 