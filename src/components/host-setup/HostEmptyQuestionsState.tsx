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
          Create Question
        </Button>
        
        <div className="text-gray-400 text-sm">or</div>
        
        <div className="relative">
          <input
            type="file"
            accept=".tsv,.txt"
            onChange={onFileImport}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button variant="primary" size="lg" icon={Upload}>
            Import TSV File
          </Button>
        </div>

        <div className="text-gray-400 text-sm">or</div>

        <Button
          onClick={onOpenAIModal}
          variant="primary"
          size="lg"
          icon={Sparkles}
        >
          Ask AI
        </Button>
      </div>
      
      <p className="text-gray-500 text-sm mt-4">
        TSV files should contain columns: question, correct, wrong1, wrong2, wrong3, and optionally explanation.
      </p>
    </div>
  );
} 