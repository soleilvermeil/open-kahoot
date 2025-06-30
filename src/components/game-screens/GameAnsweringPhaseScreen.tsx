import { Clock } from 'lucide-react';
import { getGradient } from '@/lib/palette';
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
  return (
    <div className={`min-h-screen ${getGradient('answering')} p-8`}>
      <div className="container mx-auto max-w-4xl">
        {/* Timer */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <p className="text-white/80 text-lg">
            {isHost ? 'Players are choosing their answers' : 'Choose your answer!'}
          </p>
          <div className="w-full bg-white/20 rounded-full h-3 mt-4">
            <div 
              className="bg-white h-3 rounded-full transition-all duration-1000 ease-linear"
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

        {/* Player Device - Show answer choices or waiting screen */}
        {isPlayer && (
          <>
            {hasAnswered ? (
              <PlayerWaitingScreen />
            ) : (
              <PlayerAnsweringScreen onSubmitAnswer={onSubmitAnswer} />
            )}
          </>
        )}
      </div>
    </div>
  );
} 