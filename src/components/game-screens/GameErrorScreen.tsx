'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import ErrorScreen from '@/components/ErrorScreen';

interface GameErrorScreenProps {
  error: string;
}

export default function GameErrorScreen({ error }: GameErrorScreenProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <ErrorScreen
          title={t('screens.gameError.title')}
          message={error}
          actionText={t('screens.gameError.goHome')}
          onAction={() => router.push('/')}
          autoRedirect={{
            url: '/',
            delay: 3000,
            message: t('screens.gameError.redirecting')
          }}
        />
      </div>
  );
} 