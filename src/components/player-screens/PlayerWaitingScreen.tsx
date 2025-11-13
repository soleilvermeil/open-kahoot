import { Check } from 'lucide-react';
import AnimatedIcon from '@/components/AnimatedIcon';

export default function PlayerWaitingScreen() {
  return (
    <div className="bg-white rounded-lg p-8 border border-gray-300">
      <div className="text-center">
        <AnimatedIcon 
          icon={Check} 
          size="md" 
          iconColor="text-black"
        />
        <h2 className="text-3xl text-black mb-4 font-jua">
          Answer Submitted!
        </h2>
        <p className="text-gray-600 text-lg">
          Waiting for other players to answer...
        </p>
      </div>
    </div>
  );
} 