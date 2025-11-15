import { card } from '@/lib/palette';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`${card.primary} rounded-lg p-8 ${className} shadow-[0px_20px_30px_-10px_rgba(0,_0,_0,_0.1)]`}>
      {children}
    </div>
  );
} 