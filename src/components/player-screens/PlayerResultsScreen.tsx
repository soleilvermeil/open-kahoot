import { Check, X } from 'lucide-react';
import AnimatedIcon from '@/components/AnimatedIcon';
import GlassPanel from '../GlassPanel';
import { PersonalResult } from '@/types/game';

interface PlayerResultsScreenProps {
  personalResult: PersonalResult;
}

export default function PlayerResultsScreen({ personalResult }: PlayerResultsScreenProps) {
  return (
    <GlassPanel className="text-center">
      {/* Result Header */}
      <div className="mb-8">
        <h2 className={`text-6xl font-jua mb-2 ${personalResult.wasCorrect ? 'text-green-400' : 'text-red-500'}`}>
          {personalResult.wasCorrect ? 'Correct!' : 'Incorrect'}
        </h2>
        <p className="text-2xl text-white/80">
          {personalResult.wasCorrect ? `You've earned ${personalResult.pointsEarned} points` : "Better luck next time!"}
        </p>
      </div>
      
      <AnimatedIcon icon={personalResult.wasCorrect ? Check : X} />

      {/* Score Info */}
      <div className="mt-8">
        <p className="text-3xl text-white">
          Total Score: <span className="font-bold">{personalResult.totalScore}</span>
        </p>
        <div className="h-1 w-full bg-white/20 rounded-full my-4" />
        <div className="text-xl text-white/80 flex justify-around">
          <span>Position: <span className="font-bold text-blue-400">#{personalResult.position}</span></span>
        </div>
      </div>
    </GlassPanel>
  );
} 