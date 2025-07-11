'use client';

import { useState } from 'react';
import HostQuizCreationScreen from '@/components/host-setup/HostQuizCreationScreen';
import { mockQuestions, mockGameSettings } from '@/lib/debug-data';
import type { Question, GameSettings } from '@/types/game';

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
    />
  );
} 