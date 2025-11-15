import { Ban } from 'lucide-react';
import Button from './Button';
import PendingLayout from '@/components/PendingLayout'
import { getGradient } from '@/lib/palette';
import AnimatedIcon from '@/components/AnimatedIcon';

interface ErrorScreenProps {
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  autoRedirect?: {
    url: string;
    delay: number;
    message: string;
  };
}

export default function ErrorScreen({
  title,
  message,
  actionText,
  onAction,
  autoRedirect
}: ErrorScreenProps) {
  return (
    <>
      <div className={`min-h-screen ${getGradient('waiting')} flex items-center justify-center p-8`}>
        <div className="text-center">
          <AnimatedIcon icon={Ban} size="md" iconBgColor="bg-red-200" iconColor="text-red-500" className="mb-4" />
          <h1 className="text-3xl font-bold text-black mb-4">
            {title}
          </h1>
          <p className="text-gray-600 text-lg">
            {message}
          </p>
          <div className="mt-8">
            {autoRedirect && (
              <p className="text-gray-500 mb-4">{autoRedirect.message}</p>
            )}

            {actionText && onAction && (
              <Button
                onClick={onAction}
                variant="primary"
                size="lg"
              >
                {actionText}
              </Button>
            )}
          </div>
        </div>
      </div>

    </>
  );
} 