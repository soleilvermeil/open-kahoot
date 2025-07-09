import { Check, X } from 'lucide-react';
import { PersonalResult } from '@/types/game';
import AnimatedIcon from '@/components/AnimatedIcon';

interface PlayerResultsScreenProps {
  personalResult: PersonalResult;
}

export default function PlayerResultsScreen({ personalResult }: PlayerResultsScreenProps) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
      {/* Result Header */}
      <div className="mb-8">
        <AnimatedIcon 
          icon={personalResult.wasCorrect ? Check : X }
          size="lg"
        />
        <h1 className="text-4xl sm:text-5xl text-white mb-4 font-jua">
          {personalResult.wasCorrect ? 'Correct!' : 'Incorrect!'}
        </h1>
      </div>

      {/* Points Earned */}
      <div className="bg-white/10 rounded-xl p-6 mb-6 border border-white/20">
        <p className="text-white/80 text-lg mb-2">Points Earned This Question</p>
        <p className="text-4xl font-bold text-white">
          +{personalResult.pointsEarned}
        </p>
        <p className="text-white/80 text-lg mt-2">Total Score: {personalResult.totalScore}</p>
      </div>

      {/* Position & Competition */}
      <div className="bg-white/10 rounded-xl p-6 mb-6 border border-white/20">
        <p className="text-white/80 text-lg mb-2">Current Position</p>
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="text-4xl font-bold text-white">#{personalResult.position}</span>
        </div>
        
        {personalResult.pointsBehind > 0 ? (
          <div className="text-center">
            <p className="text-white/80 text-lg">
              {personalResult.pointsBehind} points behind{' '}
              <span className="font-bold text-white">{personalResult.nextPlayerName}</span>
            </p>
            <p className="text-yellow-300 font-semibold text-lg mt-2">
              Catch up on the next question!
            </p>
          </div>
        ) : (
          <p className="text-yellow-300 font-semibold text-lg">
            You&apos;re in the lead! Keep it up!
          </p>
        )}
      </div>

      {/* Waiting Message */}
      <div className="text-center">
        <p className="text-white/80 text-lg">Waiting for host to continue...</p>
        <div className="flex justify-center mt-4">
          <div className="animate-pulse flex space-x-1">
            <div className="w-2 h-2 bg-white/60 rounded-full"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 