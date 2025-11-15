import { Eye } from 'lucide-react';
import PendingLayout from '@/components/PendingLayout';

export default function PlayerThinkingScreen() {
  return (
    <div className="text-center w-full flex flex-col items-center justify-center">
    <PendingLayout
      icon={Eye}
      title="Get Ready!"
      description="Look at the main screen and read the question"
      ignoreMinHeight
    />
    </div>
  );
} 