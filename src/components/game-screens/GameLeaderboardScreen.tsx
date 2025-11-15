'use client';

import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const isLastQuestion = (game?.currentQuestionIndex ?? 0) + 1 >= (game?.questions.length ?? 0);
  const currentQuestion = (game?.currentQuestionIndex ?? 0) + 1;
  const totalQuestions = game?.questions.length ?? 0;

  return (
    <PageLayout gradient="waiting" maxWidth="4xl" showLogo={false}>
      <Card>
        <Leaderboard
          players={leaderboard}
          title={t('screens.leaderboard.title')}
          subtitle={t('screens.leaderboard.questionProgress', { current: currentQuestion, total: totalQuestions })}
          buttons={[{
            text: isLastQuestion ? t('screens.leaderboard.finishGame') : t('screens.leaderboard.nextQuestion'),
            onClick: onNextQuestion,
            icon: ChevronRight,
            iconPosition: 'right'
          }]}
        />
      </Card>
    </PageLayout>
  );
} 