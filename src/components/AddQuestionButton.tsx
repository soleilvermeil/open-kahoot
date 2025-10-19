'use client';

import { Plus, Upload, Sparkles } from 'lucide-react';
import Button from '@/components/Button';

interface AddQuestionButtonProps {
  onAddQuestion: (index: number) => void;
  onAppendTSV: (index: number, event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenAIModal: () => void;
  index: number;
}

export default function AddQuestionButton({ onAddQuestion, onAppendTSV, onOpenAIModal, index }: AddQuestionButtonProps) {
  return (
    <div className="flex items-center py-2 gap-4">
      <div className="flex-1 h-px bg-white/20"></div>
      
      <div className="flex gap-2">
        <Button
          onClick={() => onAddQuestion(index)}
          variant="pill"
          size="sm"
          icon={Plus}
        >
          Add Question
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
            Append TSV
          </Button>
        </div>

        <Button
          onClick={onOpenAIModal}
          variant="pill"
          size="sm"
          icon={Sparkles}
        >
          Ask AI
        </Button>
      </div>
      
      <div className="flex-1 h-px bg-white/20"></div>
    </div>
  );
} 