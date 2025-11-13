import { Users } from 'lucide-react';
import { getGradient } from '@/lib/palette';
import AnimatedIcon from '@/components/AnimatedIcon';

export default function GameFallbackScreen() {
  return (
    <div className={`min-h-screen ${getGradient('waiting')} flex items-center justify-center p-8`}>
      <div className="text-center">
        <AnimatedIcon icon={Users} size="md" iconColor="text-gray-400" className="mb-4" />
        <h1 className="text-3xl font-bold text-black mb-4">Waiting for the next question...</h1>
        <p className="text-gray-600 text-lg">The host is preparing something exciting!</p>

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