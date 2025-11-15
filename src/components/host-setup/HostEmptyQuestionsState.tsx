'use client';

import { useTranslation } from 'react-i18next';
import { Plus, Upload, Sparkles } from 'lucide-react';
import Button from '@/components/Button';

interface HostEmptyQuestionsStateProps {
  onAddQuestion: (index: number) => void;
  onFileImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenAIModal: () => void;
}

export default function HostEmptyQuestionsState({ 
  onAddQuestion, 
  onFileImport,
  onOpenAIModal 
}: HostEmptyQuestionsStateProps) {
  const { t } = useTranslation();
  
  return (
    <div className="bg-gray-50 rounded-lg p-8 border border-gray-300 text-center">
      <p className="text-black text-lg mb-4 font-subtitle">{t('host.quizCreation.createFirstQuestion')}</p>
      <p className="text-gray-600 mb-6">{t('host.quizCreation.chooseHowToStart')}</p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button
          onClick={() => onAddQuestion(0)}
          variant="primary"
          size="lg"
          icon={Plus}
        >
          {t('host.quizCreation.createQuestion')}
        </Button>
        
        <div className="text-gray-400 text-sm">{t('host.quizCreation.or')}</div>
        
        <div className="relative">
          <input
            type="file"
            accept=".tsv,.txt"
            onChange={onFileImport}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button variant="primary" size="lg" icon={Upload}>
            {t('host.quizCreation.importTSV')}
          </Button>
        </div>

        <div className="text-gray-400 text-sm">{t('host.quizCreation.or')}</div>

        <Button
          onClick={onOpenAIModal}
          variant="primary"
          size="lg"
          icon={Sparkles}
        >
          {t('host.quizCreation.askAI')}
        </Button>
      </div>
      
      <p className="text-gray-500 text-sm mt-4">
        {t('host.quizCreation.tsvInfo')}
      </p>
    </div>
  );
} 