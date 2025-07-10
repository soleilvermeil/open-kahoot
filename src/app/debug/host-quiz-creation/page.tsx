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
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      question: 'New Question',
      timeLimit: 30,
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctAnswer: 0
    };
    
    setQuestions(prevQuestions => {
      if (typeof index === 'number') {
        const newQuestions = [...prevQuestions];
        newQuestions.splice(index, 0, newQuestion);
        return newQuestions;
      }
      return [...prevQuestions, newQuestion];
    });
  };

  const handleAppendTSV = (index: number) => {
    // Removed console.log
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Removed console.log
  };

  const handleUpdateQuestion = (index: number, field: keyof Question, value: string | number) => {
    // Removed console.log
  };

  const handleUpdateOption = (questionIndex: number, optionIndex: number, value: string) => {
    // Removed console.log
  };

  const handleRemoveQuestion = (index: number) => {
    // Removed console.log
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    // Removed console.log
  };

  const handleDownloadTSV = () => {
    // Removed console.log
  };

  const handleCreateGame = () => {
    // Removed console.log
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