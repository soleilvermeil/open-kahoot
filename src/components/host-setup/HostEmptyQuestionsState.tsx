import { Plus, Upload } from 'lucide-react';
import Button from '@/components/Button';

interface HostEmptyQuestionsStateProps {
  onAddQuestion: (index: number) => void;
  onFileImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function HostEmptyQuestionsState({ 
  onAddQuestion, 
  onFileImport 
}: HostEmptyQuestionsStateProps) {
  return (
    <div className="bg-white/5 rounded-lg p-8 border border-white/20 text-center">
      <p className="text-white/80 text-lg mb-4 font-jua">Create Your First Question</p>
      <p className="text-white/60 mb-6">Choose how you&apos;d like to add questions to your quiz:</p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button
          onClick={() => onAddQuestion(0)}
          variant="black"
          size="lg"
          icon={Plus}
        >
          Create Question
        </Button>
        
        <div className="text-white/40 text-sm">or</div>
        
        <div className="relative">
          <input
            type="file"
            accept=".tsv,.txt"
            onChange={onFileImport}
            className="absolute inset-0 w-full h-full opacity-0"
          />
          <Button variant="black" size="lg" icon={Upload}>
            Import TSV File
          </Button>
        </div>
      </div>
      
      <p className="text-white/40 text-sm mt-4">
        TSV files should contain columns: question, correct, wrong1, wrong2, wrong3
      </p>
    </div>
  );
} 