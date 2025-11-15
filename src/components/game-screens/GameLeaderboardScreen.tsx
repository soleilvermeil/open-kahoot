import { ChevronRight } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import Card from '@/components/Card';
import Leaderboard from '@/components/Leaderboard';
import type { Player, Game } from '@/types/game';

interface GameLeaderboardScreenProps {
  leaderboard: Player[];
  game: Game | null;
  onNextQuestion: () => void;
}

export default function GameLeaderboardScreen({ 
  leaderboard, 
  game, 
  onNextQuestion 
}: GameLeaderboardScreenProps) {
  const isLastQuestion = (game?.currentQuestionIndex ?? 0) + 1 >= (game?.questions.length ?? 0);

  return (
    <PageLayout gradient="waiting" maxWidth="4xl" showLogo={false}>
      <Card>
        <Leaderboard
          players={leaderboard}
          title="Current Leaderboard"
          subtitle={`Question ${(game?.currentQuestionIndex ?? 0) + 1} of ${game?.questions.length ?? 0} completed`}
          buttons={[{
            text: isLastQuestion ? 'Finish Game' : 'Next Question',
            onClick: onNextQuestion,
            icon: ChevronRight,
            iconPosition: 'right'
          }]}
        />
      </Card>
    </PageLayout>
  );
} 