'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MonitorCog, MonitorPlay } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import Hero from '@/components/Hero';
import ActionCard from '@/components/ActionCard';

export default function Home() {
  const { t, i18n } = useTranslation();

  // Debug: Log detected language
  useEffect(() => {
    console.log('🌐 Detected Language:', i18n.language);
    console.log('🌐 Browser Language:', navigator.language);
    console.log('🌐 All Browser Languages:', navigator.languages);
    console.log('🌐 Stored in localStorage:', localStorage.getItem('i18nextLng'));
  }, [i18n.language]);

  return (
    <PageLayout gradient="home" showLogo={false}>
      {/* Language Debug Indicator */}
      <div className="fixed top-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg text-sm font-mono z-50">
        <div className="flex items-center gap-2">
          <span>🌐</span>
          <span>Language: {i18n.language.toUpperCase()}</span>
        </div>
        <div className="text-xs text-gray-300 mt-1">
          Browser: {typeof window !== 'undefined' ? navigator.language : 'N/A'}
        </div>
      </div>
      
      <Hero title={t('home.title')} />
      
      {/* Action Cards */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        <ActionCard
          href="/join"
          icon={MonitorPlay}
          variant="join"
          title={t('home.play.title')}
          description={t('home.play.description')}
          buttonText={t('home.play.button')}
        />
        <ActionCard
          href="/host"
          icon={MonitorCog}
          variant="host"
          title={t('home.host.title')}
          description={t('home.host.description')}
          buttonText={t('home.host.button')}
        />
      </div>

      {/* <FeatureGrid features={features} /> */}
      
      {/* Footer */}
      <div className="max-w-4xl mx-auto mt-16 text-center space-y-4">
        <div className="text-gray-500 text-sm">
          <p>
            {t('home.footer.disclaimer')}
          </p>
        </div>
        
        <div className="text-gray-600">
          <a 
            href="https://github.com/soleilvermeil/open-kahoot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:text-black transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            {t('home.footer.github')}
          </a>
        </div>
      </div>
    </PageLayout>
  );
}
