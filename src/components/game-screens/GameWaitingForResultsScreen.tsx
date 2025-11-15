import { Clock } from 'lucide-react';
import { getGradient } from '@/lib/palette';
import AnimatedIcon from '@/components/AnimatedIcon';

interface GameWaitingForResultsScreenProps {
  isHost: boolean;
}

export default function GameWaitingForResultsScreen({ isHost }: GameWaitingForResultsScreenProps) {
  return (
    <div className={`min-h-screen ${getGradient('waiting')} flex items-center justify-center p-8`}>
      <div className="text-center">
        <AnimatedIcon icon={Clock} size="md" iconColor="text-gray-400" className="mb-4" />
        <h1 className="text-3xl font-bold text-black mb-4">
          {isHost ? 'Calculating results...' : 'Getting your results ready...'}
        </h1>
        <p className="text-gray-600 text-lg">
          {isHost ? 'Preparing the results for all players' : 'Hold tight, we\'re calculating your score!'}
        </p>
        <div className="flex justify-center mt-6">
          <div className="animate-pulse flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 