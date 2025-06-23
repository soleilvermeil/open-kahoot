import Button from './Button';

interface PageLayoutProps {
  children: React.ReactNode;
  gradient: 'loading' | 'error' | 'join' | 'host' | 'leaderboard' | 'finished' | 'thinking' | 'answering' | 'results' | 'waiting';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl';
  showLogo?: boolean;
}

export default function PageLayout({ 
  children, 
  gradient, 
  maxWidth = '4xl',
  showLogo = true 
}: PageLayoutProps) {
  const gradientClasses = {
    loading: 'bg-gradient-to-br from-gray-600 to-gray-800',
    error: 'bg-gradient-to-br from-red-600 to-red-800',
    join: 'bg-gradient-to-br from-green-500 to-blue-500',
    host: 'bg-gradient-to-br from-orange-500 to-red-500',
    leaderboard: 'bg-gradient-to-br from-purple-600 to-indigo-600',
    finished: 'bg-gradient-to-br from-yellow-500 to-orange-500',
    thinking: 'bg-gradient-to-br from-indigo-600 to-purple-600',
    answering: 'bg-gradient-to-br from-blue-600 to-purple-600',
    results: 'bg-gradient-to-br from-green-600 to-blue-600',
    waiting: 'bg-gradient-to-br from-purple-600 to-blue-600'
  };

  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md', 
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl'
  };

  return (
    <div className={`min-h-screen ${gradientClasses[gradient]} p-8`}>
      <div className={`container mx-auto ${maxWidthClasses[maxWidth]}`}>
        {showLogo && (
          <div className="text-center mb-8">
            <Button
              onClick={() => window.location.href = '/'}
              variant="ghost"
              className="text-4xl font-galindo"
            >
              Open Kahoot!
            </Button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
} 