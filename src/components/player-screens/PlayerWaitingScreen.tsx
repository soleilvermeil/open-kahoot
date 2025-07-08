import { Check } from 'lucide-react';
import AnimatedIcon from '@/components/AnimatedIcon';
import GlassPanel from '../GlassPanel';

export default function PlayerWaitingScreen() {
  return (
    <GlassPanel>
      <div className="text-center">
        <AnimatedIcon 
          icon={Check} 
          size="md" 
          iconColor="text-white"
        />
        <h2 className="text-3xl text-white mb-4 font-jua">
          Answer Submitted!
        </h2>
        <p className="text-white/70 text-lg">
          Waiting for other players to answer...
        </p>
      </div>
    </GlassPanel>
  );
} 