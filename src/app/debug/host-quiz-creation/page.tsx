'use client';

import { useState } from 'react';
import HostQuizCreationScreen from '@/components/host-setup/HostQuizCreationScreen';
import { mockQuestions, mockGameSettings } from '@/lib/debug-data';
import type { Question, GameSettings } from '@/types/game';

export default function DebugHostQuizCreationPage() {
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [gameSettings, setGameSettings] = useState<GameSettings>(mockGameSettings);

  return (
    <HostQuizCreationScreen
      questions={questions}
      gameSettings={gameSettings}
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
    />
  );
} 