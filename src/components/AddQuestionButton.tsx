'use client';

import { useTranslation } from 'react-i18next';
import { Plus, Upload, Sparkles } from 'lucide-react';
import Button from '@/components/Button';

interface AddQuestionButtonProps {
  onAddQuestion: (index: number) => void;
  onAppendTSV: (index: number, event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenAIModal: () => void;
  index: number;
}

export default function AddQuestionButton({ onAddQuestion, onAppendTSV, onOpenAIModal, index }: AddQuestionButtonProps) {
  const { t } = useTranslation();
  
  return (
    <div className="flex items-center py-2 gap-4">
      <div className="flex-1 h-px bg-gray-300"></div>
      
      <div className="flex gap-2">
        <Button
          onClick={() => onAddQuestion(index)}
          variant="pill"
          size="sm"
          icon={Plus}
        >
          {t('host.quizCreation.addQuestion')}
        </Button>
        
        <div className="relative">
          <input
            type="file"
            accept=".tsv,.txt"
            onChange={(e) => onAppendTSV(index, e)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button
            variant="pill"
            size="sm"
            icon={Upload}
          >
            {t('host.quizCreation.appendTSV')}
          </Button>
        </div>

        <Button
          onClick={onOpenAIModal}
          variant="pill"
          size="sm"
          icon={Sparkles}
        >
          {t('host.quizCreation.askAI')}
        </Button>
      </div>
      
      <div className="flex-1 h-px bg-gray-300"></div>
    </div>
  );
} 