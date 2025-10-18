'use client';

import HostQuizCreationScreen from '@/components/host-setup/HostQuizCreationScreen';
import { mockQuestions, mockGameSettings } from '@/lib/debug-data';

export default function DebugHostQuizCreationPage() {

  return (
    <HostQuizCreationScreen
      questions={mockQuestions}
      gameSettings={mockGameSettings}
      onUpdateSettings={() => {}}
      onAddQuestion={() => {}}
      onAppendTSV={() => {}}
      onFileImport={() => {}}
      onUpdateQuestion={() => {}}
      onUpdateOption={() => {}}
      onRemoveQuestion={() => {}}
      onMoveQuestion={() => {}}
      onDownloadTSV={() => {}}
      onCreateGame={() => {}}
      onGenerateAIQuestions={async (subject: string, language: 'english' | 'french', password: string) => {
        console.log('AI generation in debug mode', { subject, language, password });
      }}
    />
  );
} 