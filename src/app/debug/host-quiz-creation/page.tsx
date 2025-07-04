'use client';

import { useState } from 'react';
import HostQuizCreationScreen from '@/components/host-setup/HostQuizCreationScreen';
import { mockQuestions, mockGameSettings } from '@/lib/debug-data';
import type { Question, GameSettings } from '@/types/game';

export default function DebugHostQuizCreationPage() {
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [gameSettings, setGameSettings] = useState<GameSettings>(mockGameSettings);

  const handleUpdateSettings = (settings: GameSettings) => {
    setGameSettings(settings);
  };

  const handleAddQuestion = (index?: number) => {
    console.log('Add question at index:', index);
  };

  const handleAppendTSV = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Append TSV at index:', index);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File import:', event.target.files);
  };

  const handleUpdateQuestion = (index: number, field: keyof Question, value: string | number) => {
    console.log('Update question:', index, field, value);
  };

  const handleUpdateOption = (questionIndex: number, optionIndex: number, value: string) => {
    console.log('Update option:', questionIndex, optionIndex, value);
  };

  const handleRemoveQuestion = (index: number) => {
    console.log('Remove question:', index);
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    console.log('Move question:', index, direction);
  };

  const handleDownloadTSV = () => {
    console.log('Download TSV');
  };

  const handleCreateGame = () => {
    console.log('Create game');
  };

  return (
    <HostQuizCreationScreen
      questions={questions}
      gameSettings={gameSettings}
      onUpdateSettings={handleUpdateSettings}
      onAddQuestion={handleAddQuestion}
      onAppendTSV={handleAppendTSV}
      onFileImport={handleFileImport}
      onUpdateQuestion={handleUpdateQuestion}
      onUpdateOption={handleUpdateOption}
      onRemoveQuestion={handleRemoveQuestion}
      onMoveQuestion={handleMoveQuestion}
      onDownloadTSV={handleDownloadTSV}
      onCreateGame={handleCreateGame}
    />
  );
} 