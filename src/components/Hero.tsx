interface HeroProps {
  title: string;
  className?: string;
}

export default function Hero({ title, className = "" }: HeroProps) {
  return (
    <div className={`text-center ${className}`}>
      <div className="py-4 mb-8 md:py-12">
        <h1 className="text-4xl md:text-7xl text-black font-title">{title}</h1>
      </div>
    </div>
  );
} 