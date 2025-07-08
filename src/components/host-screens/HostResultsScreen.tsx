import { useEffect } from 'react';
import GlassPanel from '../GlassPanel';
import { GameStats } from '@/types/game';
import { getChoiceColor, correct, incorrect } from '@/lib/palette';
import { BarChart, CheckCircle, XCircle } from 'lucide-react';

interface HostResultsScreenProps {
  questionStats: GameStats;
}

export default function HostResultsScreen({ questionStats }: HostResultsScreenProps) {
  useEffect(() => {
    const gong = new Audio('/music/gong.mp3');
    gong.play();
  }, []);

  return (
    <GlassPanel>
      <div className="text-center mb-8">
        <h1 className="text-4xl text-white mb-6 font-jua">
          {questionStats.question.question}
        </h1>
        <p className="text-white/80 text-2xl">
          {questionStats.correctAnswers} out of {questionStats.totalPlayers} players got it right!
        </p>
      </div>

      <div className="space-y-4">
        {questionStats.answers.map((answer, index) => {
          const isCorrectAnswer = index === questionStats.question.correctAnswer;
          const choiceColor = getChoiceColor(index);
          const Icon = isCorrectAnswer ? CheckCircle : XCircle;
          const iconColor = isCorrectAnswer ? correct.text : incorrect.text;

          return (
            <div key={index} className={`p-4 rounded-xl flex items-center justify-between ${choiceColor}`}>
              <div className="flex items-center">
                <Icon className={`w-6 h-6 mr-3 ${iconColor}`} />
                <span className="font-bold text-white text-lg">
                  {questionStats.question.options[index]}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-white font-semibold mr-3">
                  {answer.count}
                </span>
                <BarChart className="w-5 h-5 text-white/70" />
              </div>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
} 