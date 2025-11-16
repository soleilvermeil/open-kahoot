'use client';

import { useTranslation } from 'react-i18next';
import { getChoiceColor } from '@/lib/palette';

interface PlayerAnsweringScreenProps {
  onSubmitAnswer: (answerIndex: number) => void;
}

export default function PlayerAnsweringScreen({ 
  onSubmitAnswer
}: PlayerAnsweringScreenProps) {
  const { t } = useTranslation();
  
  return (
    <div className="w-full flex flex-col justify-center sm:bg-white sm:rounded-lg sm:p-8 sm:border sm:border-gray-300 sm:shadow-[0px_20px_30px_-10px_rgba(0,_0,_0,_0.1)]">
      <h2 className="text-3xl text-black text-center mb-8 font-subtitle">
        {t('screens.answering.playerTitle')}
      </h2>
      <div className="grid grid-cols-2 gap-4 flex-1">
        {['A', 'B', 'C', 'D'].map((letter, index) => (
          <button
            key={letter}
            onClick={() => onSubmitAnswer(index)}
            className={`h-full min-h-32 rounded-xl font-bold text-4xl text-white transition-all transform hover:scale-105 border-4 ${getChoiceColor(index)} hover:scale-105`}
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
} 