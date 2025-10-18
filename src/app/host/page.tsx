'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import Papa from 'papaparse';
import jschardet from 'jschardet';
import * as iconv from 'iconv-lite';
import { getSocket } from '@/lib/socket-client';
import { appConfig } from '@/lib/config';
import { useBeforeUnload } from '@/lib/hooks/useBeforeUnload';
import type { Question, Game, Player, GameSettings } from '@/types/game';

// Host Setup Components
import HostGameLobbyScreen from '@/components/host-setup/HostGameLobbyScreen';
import HostQuizCreationScreen from '@/components/host-setup/HostQuizCreationScreen';

export default function HostPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    thinkTime: 5,
    answerTime: 20
  });
  const [game, setGame] = useState<Game | null>(null);

  const router = useRouter();
  
  // Enable beforeunload when there are questions to prevent accidental data loss
  const { clearNavigationFlag } = useBeforeUnload({
    enabled: questions.length > 0,
    message: 'You have unsaved questions in your quiz. Are you sure you want to leave?'
  });

  useEffect(() => {
    const socket = getSocket();
    
    socket.on('playerJoined', (player: Player) => {
      setGame(prev => prev ? {
        ...prev,
        players: [...prev.players.filter(p => p.id !== player.id), player]
      } : null);
    });

    socket.on('playerLeft', (playerId: string) => {
      setGame(prev => prev ? {
        ...prev,
        players: prev.players.filter(p => p.id !== playerId)
      } : null);
    });

    socket.on('gameUpdated', (updatedGame: Game) => {
      setGame(updatedGame);
    });

    return () => {
      socket.off('playerJoined');
      socket.off('playerLeft');
      socket.off('gameUpdated');
    };
  }, []);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const parseTsvFile = async (file: File): Promise<Question[]> => {
    // Read file as ArrayBuffer to handle encoding properly
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Detect encoding
    const detected = jschardet.detect(buffer);
    const encoding = detected.encoding || 'utf-8';
    
    // Removed console.log
    
    // Convert to UTF-8 text
    const text = iconv.decode(buffer, encoding);
    
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        delimiter: '\t',
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim().toLowerCase(),
        complete: (results) => {
          try {
            const data = results.data as Record<string, string>[];
            
            if (data.length === 0) {
              throw new Error('File must contain at least one data row');
            }

            const requiredColumns = ['question', 'correct', 'wrong1', 'wrong2', 'wrong3'];
            const headers = Object.keys(data[0] || {});
            
            // Check if all required columns exist
            const missingColumns = requiredColumns.filter(col => !headers.includes(col));
            if (missingColumns.length > 0) {
              throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
            }

            const parsedQuestions: Question[] = [];

            for (const row of data) {
              const questionText = row.question?.trim();
              const correctAnswer = row.correct?.trim();
              const wrong1 = row.wrong1?.trim();
              const wrong2 = row.wrong2?.trim();
              const wrong3 = row.wrong3?.trim();
              const explanation = row.explanation?.trim();
              const image = row.image?.trim();

              if (!questionText || !correctAnswer || !wrong1 || !wrong2 || !wrong3) {
                continue; // Skip rows with empty required fields
              }

              // Create answer array and shuffle
              const answers = [correctAnswer, wrong1, wrong2, wrong3];
              const shuffledAnswers = shuffleArray(answers);
              const correctIndex = shuffledAnswers.indexOf(correctAnswer);

              parsedQuestions.push({
                id: uuidv4(),
                question: questionText,
                options: shuffledAnswers,
                correctAnswer: correctIndex,
                timeLimit: 30, // Default time limit
                explanation: explanation || undefined,
                image: image || undefined
              });
            }

            resolve(parsedQuestions);
          } catch (error) {
            reject(error);
          }
        },
        error: (error: unknown) => {
          const errorMessage = error && typeof error === 'object' && 'message' in error 
            ? String(error.message) 
            : 'Unknown parsing error';
          reject(new Error(`Failed to parse TSV file: ${errorMessage}`));
        }
      });
    });
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedQuestions = await parseTsvFile(file);
      setQuestions(importedQuestions);
      
      // Reset file input
      event.target.value = '';
      
      // Show success message (you could add a toast notification here)
      // Removed console.log
    } catch (error) {
      console.error('Import error:', error);
      alert(`Error importing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      event.target.value = '';
    }
  };

  const handleAppendTSV = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedQuestions = await parseTsvFile(file);
      
      // Insert the imported questions at the specified index
      const newQuestions = [...questions];
      newQuestions.splice(index, 0, ...importedQuestions);
      setQuestions(newQuestions);
      
      // Reset file input
      event.target.value = '';
      
      // Show success message
      // Removed console.log
    } catch (error) {
      console.error('Append error:', error);
      alert(`Error appending file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      event.target.value = '';
    }
  };

  const addQuestion = (index?: number) => {
    const newQuestion: Question = {
      id: uuidv4(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      timeLimit: 30
    };
    
    if (index !== undefined) {
      // Insert at specific position
      const newQuestions = [...questions];
      newQuestions.splice(index, 0, newQuestion);
      setQuestions(newQuestions);
    } else {
      // Add at the end (fallback)
      setQuestions([...questions, newQuestion]);
    }
  };

  const updateQuestion = (index: number, field: keyof Question, value: string | number) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newQuestions.length) return;
    
    // Swap the questions
    [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];
    setQuestions(newQuestions);
  };

  const createGame = () => {
    if (questions.length === 0) return;
    
    const socket = getSocket();
    const title = 'Quiz Game'; // Default title
    socket.emit('createGame', title, questions, gameSettings, (createdGame: Game) => {
      setGame(createdGame);
      clearNavigationFlag(); // Clear flag since game is created and questions are saved
    });
  };

  const startGame = () => {
    if (!game) return;
    
    const socket = getSocket();
    socket.emit('startGame', game.id);
    clearNavigationFlag(); // Clear flag since this is intentional navigation
    router.push(`/game/${game.id}?host=true`);
  };

  const toggleDyslexiaSupport = (playerId: string) => {
    if (!game) return;
    
    const socket = getSocket();
    socket.emit('toggleDyslexiaSupport', game.id, playerId);
  };

  const getJoinUrl = () => {
    if (!game) return '';
    return `${appConfig.url}/join?pin=${game.pin}`;
  };

  const downloadTSV = () => {
    if (questions.length === 0) {
      alert('There are no questions to export.');
      return;
    }

    // Create TSV content
    const tsvContent = Papa.unparse({
      fields: ['question', 'correct', 'wrong1', 'wrong2', 'wrong3', 'explanation', 'image'],
      data: questions.map(q => {
        const wrongOptions = q.options.filter((_, i) => i !== q.correctAnswer);
        return {
          question: q.question,
          correct: q.options[q.correctAnswer],
          wrong1: wrongOptions[0] || '',
          wrong2: wrongOptions[1] || '',
          wrong3: wrongOptions[2] || '',
          explanation: q.explanation || '',
          image: q.image || ''
        };
      })
    }, {
      delimiter: '\t'
    });

    // Create a blob and download link
    const blob = new Blob([`\ufeff${tsvContent}`], { type: 'text/tab-separated-values;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    link.download = `quiz-${timestamp}.tsv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateAIQuestions = async (subject: string, language: 'english' | 'french', accessKey: string) => {
    try {
      // Call the API endpoint
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject, language, accessKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate questions');
      }

      if (!data.success || !data.questions) {
        throw new Error('Invalid response from API');
      }

      // Convert AI response to Question objects
      const newQuestions: Question[] = data.questions.map((q: {
        question: string;
        correct: string;
        wrong1: string;
        wrong2: string;
        wrong3: string;
        explanation?: string;
      }) => {
        // Create answer array and shuffle
        const answers = [q.correct, q.wrong1, q.wrong2, q.wrong3];
        const shuffledAnswers = shuffleArray(answers);
        const correctIndex = shuffledAnswers.indexOf(q.correct);

        return {
          id: uuidv4(),
          question: q.question,
          options: shuffledAnswers,
          correctAnswer: correctIndex,
          timeLimit: 30,
          explanation: q.explanation || undefined
        };
      });

      // Append the new questions to existing ones
      setQuestions([...questions, ...newQuestions]);

      // Show success message
      alert(`Successfully generated ${newQuestions.length} questions!`);
      
    } catch (error) {
      console.error('Error generating questions:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to generate questions'}`);
    }
  };

  if (game) {
    return (
      <HostGameLobbyScreen 
        game={game}
        joinUrl={getJoinUrl()}
        onStartGame={startGame}
        onToggleDyslexiaSupport={toggleDyslexiaSupport}
      />
    );
  }

  return (
    <HostQuizCreationScreen
      questions={questions}
      gameSettings={gameSettings}
      onUpdateSettings={setGameSettings}
      onAddQuestion={addQuestion}
      onAppendTSV={handleAppendTSV}
      onFileImport={handleFileImport}
      onUpdateQuestion={updateQuestion}
      onUpdateOption={updateOption}
      onRemoveQuestion={removeQuestion}
      onMoveQuestion={moveQuestion}
      onDownloadTSV={downloadTSV}
      onCreateGame={createGame}
      onGenerateAIQuestions={handleGenerateAIQuestions}
    />
  );
} 