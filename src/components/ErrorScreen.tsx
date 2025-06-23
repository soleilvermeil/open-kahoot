import { AlertCircle } from 'lucide-react';
import Button from './Button';

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
    <div className="text-center">
      <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
      <h1 className="text-4xl font-bold text-white mb-4 font-jua">{title}</h1>
      <p className="text-white/80 text-xl mb-6">{message}</p>
      
      {autoRedirect && (
        <p className="text-white/60 mb-4">{autoRedirect.message}</p>
      )}
      
      {actionText && onAction && (
        <Button
          onClick={onAction}
          variant="secondary"
          size="lg"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
} 