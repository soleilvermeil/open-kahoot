'use client';

import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import Timer from '@/components/Timer';
import HostThinkingScreen from '@/components/host-screens/HostThinkingScreen';
import PlayerThinkingScreen from '@/components/player-screens/PlayerThinkingScreen';
import type { Question, Game } from '@/types/game';

interface GameThinkingPhaseScreenProps {
  currentQuestion: Question;
  timeLeft: number;
  game: Game | null;
  isHost: boolean;
  isPlayer: boolean;
}

export default function GameThinkingPhaseScreen({ 
  currentQuestion, 
  timeLeft, 
  game, 
  isHost, 
  isPlayer 
}: GameThinkingPhaseScreenProps) {
  const { t } = useTranslation();
  
  return (
    <PageLayout gradient="thinking" maxWidth="4xl" showLogo={false}>
      <div className="flex flex-col min-h-[calc(100vh-4rem)]">
        <Timer
          timeLeft={timeLeft}
          totalTime={game?.settings.thinkTime || 5}
          label={isHost ? t('screens.gameThinkingPhase.hostLabel') : t('screens.gameThinkingPhase.playerLabel')}
          variant="thinking"
        />

        {/* Question Display - Host Screen */}
        {isHost && (
          <HostThinkingScreen currentQuestion={currentQuestion} />
        )}

        {/* Player Device - Waiting */}
        {isPlayer && (
          <div className="flex-1 flex">
            <PlayerThinkingScreen />
          </div>
        )}
      </div>
    </PageLayout>
  );
} 