import { ShieldCheck } from 'lucide-react';
import { getGradient } from '@/lib/palette';
import AnimatedIcon from '@/components/AnimatedIcon';
import PendingLayout from '@/components/PendingLayout';

export default function GameValidationScreen() {
  return (
    <PendingLayout
      icon={ShieldCheck}
      title="Connecting to game..."
      description="We&apos;re checking if the game is still active and verifying your connection. This ensures you can join or continue playing."
    />
  );
} 