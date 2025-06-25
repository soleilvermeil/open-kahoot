interface HeroProps {
  title: string;
  className?: string;
}

export default function Hero({ title, className = "" }: HeroProps) {
  return (
    <div className={`text-center ${className}`}>
      <div className="py-12 mb-8">
        <h1 className="text-7xl text-white font-galindo">{title}</h1>
      </div>
    </div>
  );
} 