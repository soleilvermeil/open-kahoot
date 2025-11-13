import { useEffect } from 'react';
import { GameStats } from '@/types/game';
import { getChoiceColor } from '@/lib/palette';
import Button from '@/components/Button';
import { ChevronRight } from 'lucide-react';
import { useCountdownMusic } from '@/lib/useCountdownMusic';

interface HostResultsScreenProps {
  questionStats: GameStats;
  onShowLeaderboard: () => void;
}

export default function HostResultsScreen({ 
  questionStats, 
  onShowLeaderboard 
}: HostResultsScreenProps) {
  const { playGong } = useCountdownMusic();

  // Play gong sound when results phase starts (only once)
  useEffect(() => {
    playGong();
  }, [playGong]); // Add missing dependency

  // Choice button colors for display - extract base color class
  const choiceColorClasses = [
    'bg-rose-500', // A
    'bg-blue-600', // B
    'bg-amber-400', // C
    'bg-emerald-500' // D
  ];

  return (
    <div className="bg-white rounded-lg p-8 border border-gray-300">
      <div className="text-center mb-8">
        <h1 className="text-4xl text-black mb-6 font-jua">
          {questionStats.question.question}
        </h1>
        {questionStats.question.explanation && (
          <p className="text-gray-600 text-xl mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            {questionStats.question.explanation}
          </p>
        )}
        <p className="text-gray-600 text-2xl">
          {questionStats.correctAnswers} out of {questionStats.totalPlayers} players got it right!
        </p>
      </div>

      <div className="text-center mb-8">
        <Button
          onClick={onShowLeaderboard}
          variant="primary"
          size="xl"
          icon={ChevronRight}
          iconPosition="right"
          className="mx-auto"
        >
          Show Leaderboard
        </Button>
      </div>

      <div className="space-y-4">
        {questionStats.answers.map((answer, index) => {
          const baseColor = choiceColorClasses[index];
          const opacity = index === questionStats.question.correctAnswer ? 'opacity-100' : 'opacity-40';
          
          return (
            <div key={index} className="relative rounded-lg border-2 border-gray-300 overflow-hidden">
              {/* Progress zone - fills the rectangle */}
              <div 
                className={`absolute inset-0 ${baseColor} ${opacity} transition-all duration-1000`}
                style={{ width: `${answer.percentage}%` }}
              />
              
              {/* Content on top */}
              <div className="relative flex items-center justify-between p-6 z-10">
              <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl ${baseColor} ${opacity}`}>
                  {String.fromCharCode(65 + index)}
                </div>
                  <span className="text-black font-semibold text-xl">
                  {questionStats.question.options[index]}
                </span>
              </div>
              <div className="flex items-center gap-4">
                  <span className="text-black font-bold text-xl">{answer.count}</span>
                  <span className="text-gray-600 text-lg">({answer.percentage}%)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 