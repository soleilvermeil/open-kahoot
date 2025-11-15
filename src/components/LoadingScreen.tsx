interface LoadingScreenProps {
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingScreen({ 
  title, 
  description, 
  size = 'md' 
}: LoadingScreenProps) {
  const sizeClasses = {
    sm: { spinner: 'h-8 w-8', title: 'text-xl', description: 'text-base' },
    md: { spinner: 'h-12 w-12', title: 'text-2xl', description: 'text-lg' },
    lg: { spinner: 'h-16 w-16', title: 'text-3xl', description: 'text-xl' }
  };

  const classes = sizeClasses[size];

  return (
    <div className="text-center">
      <div className={`animate-spin rounded-full ${classes.spinner} border-b-2 border-black mx-auto mb-4`}></div>
      <h1 className={`${classes.title} text-black mb-2 font-jua`}>{title}</h1>
      {description && (
        <p className={`text-gray-600 ${classes.description}`}>{description}</p>
      )}
    </div>
  );
} 