import { UserCog } from 'lucide-react';
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