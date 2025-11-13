import { card } from '@/lib/palette';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`${card.primary} rounded-lg p-8 ${className}`}>
      {children}
    </div>
  );
} 