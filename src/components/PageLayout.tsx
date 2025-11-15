import { gradients } from '@/lib/palette';
import Link from 'next/link';

interface PageLayoutProps {
  children: React.ReactNode;
  gradient: 'loading' | 'error' | 'join' | 'host' | 'leaderboard' | 'finished' | 'thinking' | 'answering' | 'results' | 'waiting' | 'home';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl';
  showLogo?: boolean;
  diagonalPattern?: 'none' | 'subtle' | 'standard' | 'dense' | 'reverse' | 'crosshatch';
  centerVertically?: boolean;
}

export default function PageLayout({ 
  children, 
  gradient, 
  maxWidth = '4xl',
  showLogo = true,
  centerVertically = false
}: PageLayoutProps) {
  const gradientClasses = gradients;

  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md', 
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl'
  };

  const isPurpleBackground = gradient === 'leaderboard' || gradient === 'finished';
  const textColor = isPurpleBackground ? 'text-white' : 'text-black';

  return (
    <div className={`min-h-screen ${gradientClasses[gradient]} p-8 ${centerVertically ? 'flex flex-col justify-center' : ''}`}>
      <div className={`container mx-auto ${maxWidthClasses[maxWidth]}`}>
        {showLogo && (
          <Link href="/" className={`text-4xl font-title mb-8 text-center ${textColor} block`}>Open Kahoot!</Link>
        )}
        {children}
      </div>
    </div>
  );
} 