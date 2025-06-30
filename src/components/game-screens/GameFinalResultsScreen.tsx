import { LogOut, Download } from 'lucide-react';
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
  const hostButtons = [
    {
      text: "Download Game Logs",
      onClick: onDownloadLogs,
      icon: Download,
      iconPosition: 'left' as const,
      variant: 'black' as const
    },
    {
      text: "Back to Home",
      onClick: () => window.location.href = '/',
      icon: LogOut,
      iconPosition: 'right' as const,
      variant: 'black' as const
    }
  ];

  const playerButtons = [
    {
      text: "Back to Home",
      onClick: () => window.location.href = '/',
      icon: LogOut,
      iconPosition: 'right' as const
    }
  ];

  return (
    <PageLayout gradient="finished" maxWidth="4xl" showLogo={false}>
      <Card>
        <Leaderboard
          players={finalScores}
          title="Game Over!"
          subtitle="Final Results"
          buttons={isHost ? hostButtons : playerButtons}
        />
      </Card>
    </PageLayout>
  );
} 