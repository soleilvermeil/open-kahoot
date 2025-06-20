'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Clock, Trophy, ChevronRight, Eye, Users } from 'lucide-react';
import { getSocket } from '@/lib/socket-client';
import type { Game, Question, GameStats, Player } from '@/types/game';

export default function GamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const gameId = params.id as string;
  const isHost = searchParams.get('host') === 'true';
  const isPlayer = searchParams.get('player') === 'true';

  const [game, setGame] = useState<Game | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [phase, setPhase] = useState<'thinking' | 'answering'>('thinking');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [questionStats, setQuestionStats] = useState<GameStats | null>(null);
  const [finalScores, setFinalScores] = useState<Player[]>([]);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'started' | 'thinking' | 'answering' | 'results' | 'finished'>('waiting');

  useEffect(() => {
    const socket = getSocket();

    socket.on('gameStarted', (gameData: Game) => {
      setGame(gameData);
      setGameStatus('started');
    });

    socket.on('thinkingPhase', (question: Question, thinkTime: number) => {
      setCurrentQuestion(question);
      setTimeLeft(thinkTime);
      setPhase('thinking');
      setSelectedAnswer(null);
      setHasAnswered(false);
      setQuestionStats(null);
      setGameStatus('thinking');
      
      // Timer countdown for thinking phase
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    });

    socket.on('answeringPhase', (answerTime: number) => {
      setTimeLeft(answerTime);
      setPhase('answering');
      setGameStatus('answering');
      
      // Timer countdown for answering phase
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    });

    socket.on('questionEnded', (stats: GameStats) => {
      setQuestionStats(stats);
      setGameStatus('results');
    });

    socket.on('gameFinished', (scores: Player[]) => {
      setFinalScores(scores);
      setGameStatus('finished');
    });

    socket.on('playerAnswered', (playerId: string) => {
      console.log('Player answered:', playerId);
    });

    return () => {
      socket.off('gameStarted');
      socket.off('thinkingPhase');
      socket.off('answeringPhase');
      socket.off('questionEnded');
      socket.off('gameFinished');
      socket.off('playerAnswered');
    };
  }, []);

  const submitAnswer = (answerIndex: number) => {
    if (hasAnswered || !currentQuestion || phase !== 'answering') return;
    
    setSelectedAnswer(answerIndex);
    setHasAnswered(true);
    
    const socket = getSocket();
    socket.emit('submitAnswer', gameId, currentQuestion.id, answerIndex);
  };

  const nextQuestion = () => {
    const socket = getSocket();
    socket.emit('nextQuestion', gameId);
  };

  // Choice button colors for players
  const choiceColors = [
    'bg-red-500 hover:bg-red-600 border-red-400',
    'bg-blue-500 hover:bg-blue-600 border-blue-400', 
    'bg-yellow-500 hover:bg-yellow-600 border-yellow-400',
    'bg-green-500 hover:bg-green-600 border-green-400'
  ];

  // Waiting screen
  if (gameStatus === 'waiting' || gameStatus === 'started') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            {gameStatus === 'waiting' ? 'Waiting for game to start...' : 'Game Starting!'}
          </h1>
          <p className="text-white/80 text-xl">Get ready to answer some questions!</p>
        </div>
      </div>
    );
  }

  // Final results screen
  if (gameStatus === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-500 to-orange-500 p-8">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <Trophy className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-white mb-4">Game Over!</h1>
              <p className="text-white/80 text-xl">Final Results</p>
            </div>

            <div className="space-y-4">
              {finalScores.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    index === 0 
                      ? 'bg-yellow-500/30 border border-yellow-400/50' 
                      : index === 1
                      ? 'bg-gray-300/30 border border-gray-400/50'
                      : index === 2
                      ? 'bg-orange-600/30 border border-orange-500/50'
                      : 'bg-white/10 border border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-white">
                      {index + 1}
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                    </div>
                    <div className="text-white font-semibold text-lg">{player.name}</div>
                  </div>
                  <div className="text-white font-bold text-xl">{player.score}</div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <button
                onClick={() => window.location.href = '/'}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Thinking Phase - Show only question for host, waiting message for players
  if (gameStatus === 'thinking' && currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 p-8">
        <div className="container mx-auto max-w-4xl">
          {/* Timer */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Eye className="w-8 h-8 text-white" />
              <span className="text-4xl font-bold text-white">{timeLeft}</span>
            </div>
            <p className="text-white/80 text-lg">
              {isHost ? 'Players are reading the question' : 'Read the question carefully'}
            </p>
            <div className="w-full bg-white/20 rounded-full h-3 mt-4">
              <div 
                className="bg-yellow-400 h-3 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${(timeLeft / (game?.settings.thinkTime || 5)) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Display - Host Screen */}
          {isHost && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
              <h1 className="text-5xl font-bold text-white text-center leading-tight">
                {currentQuestion.question}
              </h1>
            </div>
          )}

          {/* Player Device - Waiting */}
          {isPlayer && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
              <div className="animate-pulse">
                <Users className="w-16 h-16 text-white/60 mx-auto mb-4" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Get Ready!</h2>
              <p className="text-white/80 text-lg">Look at the main screen and read the question</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Answering Phase
  if (gameStatus === 'answering' && currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 p-8">
        <div className="container mx-auto max-w-4xl">
          {/* Timer */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="w-8 h-8 text-white" />
              <span className="text-4xl font-bold text-white">{timeLeft}</span>
            </div>
            <p className="text-white/80 text-lg">
              {isHost ? 'Players are choosing their answers' : 'Choose your answer!'}
            </p>
            <div className="w-full bg-white/20 rounded-full h-3 mt-4">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${(timeLeft / (game?.settings.answerTime || 30)) * 100}%` }}
              />
            </div>
          </div>

          {/* Host Screen - Show question and full answer choices */}
          {isHost && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h1 className="text-4xl font-bold text-white text-center leading-tight mb-8">
                {currentQuestion.question}
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-xl border-2 ${choiceColors[index].split(' ')[0]} ${choiceColors[index].split(' ')[1]} ${choiceColors[index].split(' ')[2]} text-white`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="font-semibold text-xl">{option}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-6 text-white/80 text-lg">
                Players are choosing their answers on their devices
              </div>
            </div>
          )}

          {/* Player Device - Show only colored choice buttons */}
          {isPlayer && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white text-center mb-8">
                Choose your answer:
              </h2>
              <div className="grid grid-cols-2 gap-6">
                {['A', 'B', 'C', 'D'].map((letter, index) => (
                  <button
                    key={letter}
                    onClick={() => submitAnswer(index)}
                    disabled={hasAnswered}
                    className={`h-24 rounded-xl font-bold text-3xl text-white transition-all transform hover:scale-105 border-4 ${
                      hasAnswered && selectedAnswer === index
                        ? `${choiceColors[index]} ring-4 ring-white/50`
                        : hasAnswered
                        ? 'bg-gray-500/50 text-white/50 cursor-not-allowed border-gray-400'
                        : `${choiceColors[index]} hover:scale-110`
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>

              {hasAnswered && (
                <div className="text-center mt-6">
                  <p className="text-white text-xl">Answer submitted! Waiting for others...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Results screen - Now safe to show correct answers
  if (gameStatus === 'results' && questionStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-blue-600 p-8">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-6">
                {questionStats.question.question}
              </h1>
              <p className="text-white/80 text-2xl">
                {questionStats.correctAnswers} out of {questionStats.totalPlayers} players got it right!
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {questionStats.answers.map((answer, index) => (
                <div key={index} className="relative">
                  <div className={`flex items-center justify-between p-6 rounded-lg border-2 ${
                    index === questionStats.question.correctAnswer
                      ? 'bg-green-500/30 border-green-400 ring-2 ring-green-300'
                      : 'bg-white/10 border-white/20'
                  }`}>
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl ${
                        choiceColors[index].split(' ')[0]
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-white font-semibold text-xl">
                        {questionStats.question.options[index]}
                      </span>
                      {index === questionStats.question.correctAnswer && (
                        <span className="text-green-300 font-bold text-lg">✓ CORRECT</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-white font-bold text-xl">{answer.count}</span>
                      <span className="text-white/80 text-lg">({answer.percentage}%)</span>
                    </div>
                  </div>
                  <div 
                    className={`absolute bottom-0 left-0 h-2 rounded-b-lg transition-all duration-1000 ${
                      index === questionStats.question.correctAnswer ? 'bg-green-400' : 'bg-blue-400'
                    }`}
                    style={{ width: `${answer.percentage}%` }}
                  />
                </div>
              ))}
            </div>

            {isHost && (
              <div className="text-center">
                <button
                  onClick={nextQuestion}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center gap-2 mx-auto transition-colors"
                >
                  Next Question
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}

            {isPlayer && (
              <div className="text-center">
                <p className="text-white/80 text-lg">Waiting for host to continue...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
      <div className="text-white text-center">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
      </div>
    </div>
  );
} 