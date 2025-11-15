'use client';

import { LogOut, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import Card from '@/components/Card';
import Leaderboard from '@/components/Leaderboard';
import type { Player } from '@/types/game';

interface GameFinalResultsScreenProps {
  finalScores: Player[];
  isHost: boolean;
  onDownloadLogs: () => void;
}

export default function GameFinalResultsScreen({ 
  finalScores, 
  isHost, 
  onDownloadLogs 
}: GameFinalResultsScreenProps) {
  const { t } = useTranslation();
  
  const hostButtons = [
    {
      text: t('screens.finalLeaderboard.downloadLogs'),
      onClick: onDownloadLogs,
      icon: Download,
      iconPosition: 'left' as const,
      variant: 'primary' as const
    },
    {
      text: t('screens.finalLeaderboard.backToHome'),
      onClick: () => window.location.href = '/',
      icon: LogOut,
      iconPosition: 'right' as const,
      variant: 'primary' as const
    }
  ];

  const playerButtons = [
    {
      text: t('screens.finalLeaderboard.backToHome'),
      onClick: () => window.location.href = '/',
      icon: LogOut,
      iconPosition: 'right' as const
    }
  ];

  return (
    <PageLayout gradient="waiting" maxWidth="4xl" showLogo={false}>
      {isHost ? (
        <Card>
          <Leaderboard
            players={finalScores}
            title={t('screens.finalLeaderboard.title')}
            subtitle={t('screens.finalLeaderboard.subtitle')}
            buttons={hostButtons}
          />
        </Card>
      ) : (
        <Card>
          <Leaderboard
            players={finalScores}
            title={t('screens.finalLeaderboard.title')}
            subtitle={t('screens.finalLeaderboard.subtitle')}
            buttons={playerButtons}
            showIcon={false}
          />
        </Card>
      )}
    </PageLayout>
  );
} 