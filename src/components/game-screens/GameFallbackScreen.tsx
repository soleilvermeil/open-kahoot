import { UserCog } from 'lucide-react';
import { getGradient } from '@/lib/palette';
import AnimatedIcon from '@/components/AnimatedIcon';
import PendingLayout from '@/components/PendingLayout';

export default function GameFallbackScreen() {
  return (
    <PendingLayout
      icon={UserCog}
      title="Waiting for the host..."
      description="The host is preparing the next question."
    />
  );
} 