import { Clock } from 'lucide-react';
import { getGradient, accent } from '@/lib/palette';
import HostAnsweringScreen from '@/components/host-screens/HostAnsweringScreen';
import PlayerAnsweringScreen from '@/components/player-screens/PlayerAnsweringScreen';
import PlayerWaitingScreen from '@/components/player-screens/PlayerWaitingScreen';
import type { Question, Game } from '@/types/game';

interface GameAnsweringPhaseScreenProps {
  currentQuestion: Question;
  timeLeft: number;
  game: Game | null;
  isHost: boolean;
  isPlayer: boolean;
  onSubmitAnswer: (answerIndex: number) => void;
  hasAnswered: boolean;
}

export default function GameAnsweringPhaseScreen({ 
  currentQuestion, 
  timeLeft, 
  game, 
  isHost, 
  isPlayer, 
  onSubmitAnswer, 
  hasAnswered
}: GameAnsweringPhaseScreenProps) {
  // If player has answered, show full-screen waiting screen (no timer or container)
  if (isPlayer && hasAnswered) {
    return <PlayerWaitingScreen />;
  }

  return (
    <div className={`min-h-screen ${getGradient('answering')} p-8`}>
      <div className="container mx-auto max-w-4xl flex flex-col min-h-[calc(100vh-4rem)]">
        {/* Timer */}
        <div className="hidden sm:block text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-8 h-8 text-black" />
          </div>
          <p className="text-gray-600 text-lg">
            {isHost ? 'Players are choosing their answers' : 'Choose your answer!'}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
            <div 
              className={`${accent.bg} h-3 rounded-full transition-all duration-1000 ease-linear`}
              style={{ width: `${(timeLeft / (game?.settings.answerTime || 30)) * 100}%` }}
            />
          </div>
        </div>

        {/* Host Screen - Show question and full answer choices */}
        {isHost && (
          <HostAnsweringScreen 
            currentQuestion={currentQuestion}
            timeLeft={timeLeft}
            answerTime={game?.settings.answerTime || 30}
          />
        )}

        {/* Player Device - Show answer choices */}
        {isPlayer && !hasAnswered && (
          <div className="flex-1 flex">
            <PlayerAnsweringScreen onSubmitAnswer={onSubmitAnswer} />
          </div>
        )}
      </div>
    </div>
  );
} 