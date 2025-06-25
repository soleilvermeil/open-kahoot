interface Feature {
  emoji: string;
  title: string;
  description: string;
}

interface FeatureGridProps {
  features: Feature[];
}

export default function FeatureGrid({ features }: FeatureGridProps) {
  return (
    <div className="max-w-3xl mx-auto mt-16 text-center">
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="text-white">
            <div className="text-4xl mb-2">{feature.emoji}</div>
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-white/70">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 