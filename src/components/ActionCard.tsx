import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface ActionCardProps {
  href: string;
  icon: LucideIcon;
  variant: 'host' | 'join';
  title: string;
  description: string;
  buttonText: string;
}

export default function ActionCard({
  href,
  icon: Icon,
  variant,
  title,
  description,
  buttonText
}: ActionCardProps) {
  const variantStyles = {
    host: {
      iconColor: 'bg-orange-500',
      buttonColor: 'bg-orange-500',
      hoverButtonColor: 'group-hover:bg-orange-600'
    },
    join: {
      iconColor: 'bg-green-500', 
      buttonColor: 'bg-green-500',
      hoverButtonColor: 'group-hover:bg-green-600'
    }
  };

  const styles = variantStyles[variant];

  return (
    <Link href={href} className="group">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
        <div className="text-center">
          <div className={`w-20 h-20 ${styles.iconColor} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
            <Icon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 font-jua">{title}</h2>
          <p className="text-white/80 text-lg mb-6">{description}</p>
          <div className={`${styles.buttonColor} text-white py-3 px-6 rounded-lg font-semibold ${styles.hoverButtonColor} transition-colors`}>
            {buttonText}
          </div>
        </div>
      </div>
    </Link>
  );
} 