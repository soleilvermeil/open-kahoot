'use client';

import { Users, Zap } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import Hero from '@/components/Hero';
import ActionCard from '@/components/ActionCard';
import FeatureGrid from '@/components/FeatureGrid';

export default function Home() {
  const features = [
    {
      emoji: '⚡',
      title: 'Real-time',
      description: 'Instant synchronization across all devices'
    },
    {
      emoji: '🏆',
      title: 'Competitive', 
      description: 'Faster answers earn more points'
    },
    {
      emoji: '🎯',
      title: 'Custom Quizzes',
      description: 'Create your own questions and answers'
    }
  ];

  return (
    <PageLayout gradient="home" showLogo={false}>
      <Hero title="Open Kahoot!" />
      
      {/* Action Cards */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        <ActionCard
          href="/host"
          icon={Users}
          variant="host"
          title="Host Game"
          description="Create your own quiz with custom questions and let players join with a game pin"
          buttonText="Create Game →"
        />
        
        <ActionCard
          href="/join"
          icon={Zap}
          variant="join"
          title="Join Game"
          description="Enter a game pin to join an existing quiz and compete with other players"
          buttonText="Join Game →"
        />
      </div>

      <FeatureGrid features={features} />
    </PageLayout>
  );
}
