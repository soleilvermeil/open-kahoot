import { Check } from 'lucide-react';
import { getGradient } from '@/lib/palette';
import AnimatedIcon from '@/components/AnimatedIcon';
import PendingLayout from '@/components/PendingLayout'

export default function PlayerWaitingScreen() {
  return (
    <PendingLayout
      icon={Check}
      title="Answer submitted!"
      description="Your answer has been received. Waiting for other players to finish answering before results are shown."
    />
  );
} 