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
  return (
    <PageLayout gradient="thinking" maxWidth="4xl" showLogo={false}>
      <Timer
        timeLeft={timeLeft}
        totalTime={game?.settings.thinkTime || 5}
        label={isHost ? 'Players are reading the question' : 'Read the question carefully'}
        variant="thinking"
      />

      {/* Question Display - Host Screen */}
      {isHost && (
        <HostThinkingScreen currentQuestion={currentQuestion} />
      )}

      {/* Player Device - Waiting */}
      {isPlayer && (
        <PlayerThinkingScreen currentQuestion={currentQuestion} />
      )}
    </PageLayout>
  );
} 