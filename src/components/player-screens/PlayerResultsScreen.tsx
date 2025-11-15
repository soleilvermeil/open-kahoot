'use client';

import { useTranslation } from 'react-i18next';
import { PersonalResult } from '@/types/game';

interface PlayerResultsScreenProps {
  personalResult: PersonalResult;
}

export default function PlayerResultsScreen({ personalResult }: PlayerResultsScreenProps) {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white rounded-lg p-8 border border-gray-300 text-center w-full flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Result Header */}
      <div className="mb-8">
        {/* <AnimatedIcon 
          icon={personalResult.wasCorrect ? Check : X }
          size="sm"
          iconColor={personalResult.wasCorrect ? correct.text : incorrect.text}
          iconBgColor={personalResult.wasCorrect ? correct.primary : incorrect.primary}
        /> */}
        <h1 className="text-4xl sm:text-5xl text-black mb-4 font-subtitle">
          {personalResult.wasCorrect ? t('screens.results.correct') : t('screens.results.incorrect')}
        </h1>
      </div>

      {/* Points Earned */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
        <p className="text-gray-600 text-lg mb-2">{t('screens.results.pointsEarned')}</p>
        <p className="text-4xl font-bold text-black">
          +{personalResult.pointsEarned}
        </p>
        <p className="text-gray-600 text-lg mt-2">{t('screens.results.totalScore')} {personalResult.totalScore}</p>
      </div>

      {/* Position & Competition */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
        <p className="text-gray-600 text-lg mb-2">{t('screens.results.currentPosition')}</p>
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="text-4xl font-bold text-black">#{personalResult.position}</span>
        </div>
        
        {personalResult.pointsBehind > 0 ? (
          <div className="text-center">
            <p className="text-gray-600 text-lg">
              {personalResult.pointsBehind} {t('screens.results.pointsBehind')}{' '}
              <span className="font-bold text-black">{personalResult.nextPlayerName}</span>
            </p>
          </div>
        ) : (
          <p className={`font-semibold text-lg`}>
            {t('screens.results.inTheLead')}
          </p>
        )}
      </div>

      {/* Spacer to push waiting message to bottom */}
      <div className="flex-1"></div>

      {/* Waiting Message */}
      <div className="text-center">
        <p className="text-gray-600 text-lg">{t('screens.results.waitingForHost')}</p>
        <div className="flex justify-center mt-4">
          <div className="animate-pulse flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 