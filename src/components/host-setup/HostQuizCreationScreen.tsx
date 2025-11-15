'use client';

import { useState } from 'react';
import { Download, MonitorPlay } from 'lucide-react';
import type { Question, GameSettings } from '@/types/game';
import PageLayout from '@/components/PageLayout';
import Card from '@/components/Card';
import Button from '@/components/Button';
import HostGameSettingsSection from './HostGameSettingsSection';
import HostQuestionsSection from './HostQuestionsSection';
import HostAIGenerationModal from './HostAIGenerationModal';

interface HostQuizCreationScreenProps {
  questions: Question[];
  gameSettings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  onAddQuestion: (index?: number) => void;
  onAppendTSV: (index: number, event: React.ChangeEvent<HTMLInputElement>) => void;
  onFileImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdateQuestion: (index: number, field: keyof Question, value: string | number) => void;
  onUpdateOption: (questionIndex: number, optionIndex: number, value: string) => void;
  onRemoveQuestion: (index: number) => void;
  onMoveQuestion: (index: number, direction: 'up' | 'down') => void;
  onDownloadTSV: () => void;
  onCreateGame: () => void;
  onGenerateAIQuestions: (subject: string, language: 'english' | 'french', accessKey: string, questionCount: number) => Promise<void>;
}

export default function HostQuizCreationScreen({
  questions,
  gameSettings,
  onUpdateSettings,
  onAddQuestion,
  onAppendTSV,
  onFileImport,
  onUpdateQuestion,
  onUpdateOption,
  onRemoveQuestion,
  onMoveQuestion,
  onDownloadTSV,
  onCreateGame,
  onGenerateAIQuestions
}: HostQuizCreationScreenProps) {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const isFormValid = !questions.some(q => !q.question || q.options.some(o => !o));

  return (
    <PageLayout gradient="host" maxWidth="4xl">
      <Card>
        <h2 className="text-3xl text-black mb-8 text-center font-jua">Create Your Quiz</h2>

        <HostGameSettingsSection 
          gameSettings={gameSettings}
          onUpdateSettings={onUpdateSettings}
        />

        <HostQuestionsSection
          questions={questions}
          onAddQuestion={onAddQuestion}
          onAppendTSV={onAppendTSV}
          onFileImport={onFileImport}
          onUpdateQuestion={onUpdateQuestion}
          onUpdateOption={onUpdateOption}
          onRemoveQuestion={onRemoveQuestion}
          onMoveQuestion={onMoveQuestion}
          onOpenAIModal={() => setIsAIModalOpen(true)}
        />

        {questions.length > 0 && (
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={onDownloadTSV}
                variant="primary"
                size="lg"
                icon={Download}
              >
                Download TSV
              </Button>
              <Button
                onClick={onCreateGame}
                disabled={!isFormValid}
                variant="primary"
                size="lg"
                icon={MonitorPlay}
              >
                Create Game
              </Button>
            </div>
          </div>
        )}
      </Card>

      <HostAIGenerationModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onGenerateQuestions={onGenerateAIQuestions}
      />
    </PageLayout>
  );
} 