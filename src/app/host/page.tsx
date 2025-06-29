'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Play, Users, Settings, Upload, MonitorPlay, Download } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';


import { getSocket } from '@/lib/socket-client';
import type { Question, Game, Player, GameSettings } from '@/types/game';
import Button from '@/components/Button';
import PageLayout from '@/components/PageLayout';
import Card from '@/components/Card';
import GamePinDisplay from '@/components/GamePinDisplay';
import PlayerList from '@/components/PlayerList';
import QuestionEditor from '@/components/QuestionEditor';
import AddQuestionButton from '@/components/AddQuestionButton';

export default function HostPage() {
  const [gameTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    thinkTime: 5,
    answerTime: 20
  });
  const [game, setGame] = useState<Game | null>(null);

  const router = useRouter();

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

    return () => {
      socket.off('playerJoined');
      socket.off('playerLeft');
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
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('File must contain at least a header row and one data row');
    }

    const headers = lines[0].split('\t').map(h => h.trim().toLowerCase());
    const requiredColumns = ['question', 'correct', 'wrong1', 'wrong2', 'wrong3'];
    
    // Check if all required columns exist
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    const columnIndexes = {
      question: headers.indexOf('question'),
      correct: headers.indexOf('correct'),
      wrong1: headers.indexOf('wrong1'),
      wrong2: headers.indexOf('wrong2'),
      wrong3: headers.indexOf('wrong3')
    };

    const parsedQuestions: Question[] = [];

    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split('\t');
      
      if (columns.length < 5) continue; // Skip incomplete rows

      const questionText = columns[columnIndexes.question]?.trim();
      const correctAnswer = columns[columnIndexes.correct]?.trim();
      const wrong1 = columns[columnIndexes.wrong1]?.trim();
      const wrong2 = columns[columnIndexes.wrong2]?.trim();
      const wrong3 = columns[columnIndexes.wrong3]?.trim();

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
        timeLimit: 30 // Default time limit
      });
    }

    return parsedQuestions;
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
      console.log(`Successfully imported ${importedQuestions.length} questions`);
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
      console.log(`Successfully appended ${importedQuestions.length} questions at position ${index}`);
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
    const title = gameTitle || 'Quiz Game'; // Use default title if none provided
    socket.emit('createGame', title, questions, gameSettings, (createdGame: Game) => {
      setGame(createdGame);
    });
  };

  const startGame = () => {
    if (!game) return;
    
    const socket = getSocket();
    socket.emit('startGame', game.id);
    router.push(`/game/${game.id}?host=true`);
  };



  const getJoinUrl = () => {
    if (!game) return '';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl}/join?pin=${game.pin}`;
  };

  const downloadTSV = () => {
    if (questions.length === 0) return;

    // Create TSV content
    const headers = ['question', 'correct', 'wrong1', 'wrong2', 'wrong3'];
    const tsvContent = [
      headers.join('\t'), // Header row
      ...questions.map(q => {
        // Get correct answer and wrong answers
        const correctAnswer = q.options[q.correctAnswer];
        const wrongAnswers = q.options.filter((_, index) => index !== q.correctAnswer);
        
        // Ensure we have exactly 3 wrong answers by padding with empty strings if needed
        while (wrongAnswers.length < 3) {
          wrongAnswers.push('');
        }
        
        return [
          q.question,
          correctAnswer,
          wrongAnswers[0],
          wrongAnswers[1],
          wrongAnswers[2]
        ].join('\t');
      })
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([tsvContent], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    link.download = `quiz-${timestamp}.tsv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };



  if (game) {
    const playersOnly = game.players.filter(p => !p.isHost);
    
    return (
      <PageLayout gradient="host" maxWidth="6xl">
        <Card>
          <div className="text-center mb-8">
            <h2 className="text-3xl text-white mb-4 font-jua">{game.title}</h2>
            
            <GamePinDisplay 
              pin={game.pin}
              joinUrl={getJoinUrl()}
            />
            
            {/* <div className="space-y-2">
              <p className="text-white/80">Share this PIN with players to join the game</p>
              <div className="text-white/60 text-sm">
                Think Time: {game.settings.thinkTime}s • Answer Time: {game.settings.answerTime}s
              </div>
            </div> */}
          </div>

          {/* Separator line */}
          <div className="border-t border-white/20 mb-8"></div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl text-white flex items-center gap-2 font-jua">
                <Users className="w-6 h-6" />
                Players ({playersOnly.length})
              </h2>
              <Button
                onClick={startGame}
                disabled={playersOnly.length === 0}
                variant="black"
                size="lg"
                icon={Play}
              >
                Start Game
              </Button>
            </div>
            
            <PlayerList 
              players={playersOnly}
              emptyMessage="Waiting for players to join..."
              columns={3}
            />
          </div>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout gradient="host" maxWidth="4xl">
      <Card>
          <h2 className="text-3xl text-white mb-8 text-center font-jua">Create Your Quiz</h2>

          {/* Quiz Title field hidden for now */}
          {/* <div className="mb-8">
            <label className="block text-white text-lg font-semibold mb-2">
              Quiz Title
            </label>
            <input
              type="text"
              value={gameTitle}
              onChange={(e) => setGameTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Enter your quiz title..."
            />
          </div> */}

          {/* Game Settings */}
          <div className="mb-8 bg-white/5 rounded-lg p-6 border border-white/20">
            <h2 className="text-2xl text-white mb-4 flex items-center gap-2 font-jua">
              <Settings className="w-6 h-6" />
              Game Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-medium mb-2">
                  Think Time (seconds)
                </label>
                <p className="text-white/70 text-sm mb-2">
                  Time to show question before allowing answers
                </p>
                <select
                  value={gameSettings.thinkTime}
                  onChange={(e) => setGameSettings(prev => ({ ...prev, thinkTime: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-white/50 [&>option]:text-black [&>option]:bg-white"
                >
                  <option value={5}>5 seconds</option>
                  <option value={10}>10 seconds</option>
                  <option value={20}>20 seconds</option>
                </select>
              </div>
              <div>
                <label className="block text-white font-medium mb-2">
                  Answer Time (seconds)
                </label>
                <p className="text-white/70 text-sm mb-2">
                  Time allowed to submit answers
                </p>
                <select
                  value={gameSettings.answerTime}
                  onChange={(e) => setGameSettings(prev => ({ ...prev, answerTime: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-white/50 [&>option]:text-black [&>option]:bg-white"
                >
                  <option value={20}>20 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>60 seconds</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl text-white font-jua">Questions</h2>
            </div>

            {questions.length === 0 ? (
              <div className="bg-white/5 rounded-lg p-8 border border-white/20 text-center">
                <p className="text-white/80 text-lg mb-4 font-jua">Create Your First Question</p>
                <p className="text-white/60 mb-6">Choose how you&apos;d like to add questions to your quiz:</p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    onClick={() => addQuestion(0)}
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
                      onChange={handleFileImport}
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
            ) : (
              <div>
                <AddQuestionButton onAddQuestion={addQuestion} onAppendTSV={handleAppendTSV} index={0} />
                
                {questions.map((question, questionIndex) => (
                  <div key={question.id}>
                    <QuestionEditor
                      question={question}
                      questionIndex={questionIndex}
                      totalQuestions={questions.length}
                      onUpdateQuestion={updateQuestion}
                      onUpdateOption={updateOption}
                      onRemoveQuestion={removeQuestion}
                      onMoveQuestion={moveQuestion}
                    />
                    <AddQuestionButton onAddQuestion={addQuestion} onAppendTSV={handleAppendTSV} index={questionIndex + 1} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {questions.length > 0 && (
            <div className="text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={downloadTSV}
                  variant="black"
                  size="lg"
                  icon={Download}
                >
                  Download TSV
                </Button>
                <Button
                  onClick={createGame}
                  disabled={questions.some(q => !q.question || q.options.some(o => !o))}
                  variant="black"
                  size="lg"
                  icon={MonitorPlay}
                >
                  Create Game
                </Button>
              </div>
            </div>
          )}
        </Card>
      </PageLayout>
    );
} 