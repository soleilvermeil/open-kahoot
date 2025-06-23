'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Clock, Trophy, ChevronRight, Eye, Users, AlertCircle } from 'lucide-react';
import { getSocket } from '@/lib/socket-client';
import type { Game, Question, GameStats, Player, PersonalResult } from '@/types/game';
import Button from '@/components/Button';

export default function GamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
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
  const [personalResult, setPersonalResult] = useState<PersonalResult | null>(null);
  const [finalScores, setFinalScores] = useState<Player[]>([]);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'started' | 'question' | 'results' | 'leaderboard' | 'finished'>('waiting');
  const [gameError, setGameError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const socket = getSocket();

    // Check if this is a player trying to rejoin a game
    const urlParams = new URLSearchParams(window.location.search);
    const isPlayer = urlParams.get('player') === 'true';
    
    if (isPlayer) {
      // Player is rejoining - first validate game to get the PIN
      socket.emit('validateGame', gameId, (valid: boolean, gameData?: Game) => {
        if (valid && gameData) {
          // Game exists, now check if we have a stored player ID for this game's PIN
          const gamePin = gameData.pin;
          const storedId = localStorage.getItem(`player_id_${gamePin}`) || undefined;
          
          if (storedId) {
            // We have a stored player ID, try to rejoin
            const playerName = gameData.players.find(p => p.id === storedId)?.name || 'Player';
            
            socket.emit('joinGame', gamePin, playerName, storedId, (success: boolean, game?: Game) => {
              setIsValidating(false);
              if (success && game) {
                setGame(game);
                setGameStatus(game.status);
              } else {
                setGameError('Unable to rejoin game. You may have been removed.');
                setTimeout(() => router.push('/'), 3000);
              }
            });
          } else {
            // No stored player ID for this game
            setIsValidating(false);
            setGameError('No player data found for this game. Please join the game again.');
            setTimeout(() => router.push('/'), 3000);
          }
        } else {
          setIsValidating(false);
          setGameError('Game not found or no longer available');
          setTimeout(() => router.push('/'), 3000);
        }
      });
    } else {
      // Host validation - just validate game exists
      socket.emit('validateGame', gameId, (valid: boolean, gameData?: Game) => {
        setIsValidating(false);
        if (valid && gameData) {
          setGame(gameData);
          setGameStatus(gameData.status);
        } else {
          setGameError('Game not found or no longer available');
          setTimeout(() => router.push('/'), 3000);
        }
      });
    }

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
      setPersonalResult(null);
      setGameStatus('question');
      
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
      setGameStatus('question');
      
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
      // Add a 1-second delay before showing results to let players see their final choice
      setTimeout(() => {
        setGameStatus('results');
      }, 1000);
    });

    socket.on('personalResult', (result: PersonalResult) => {
      setPersonalResult(result);
    });

    socket.on('leaderboardShown', (leaderboardData: Player[]) => {
      setLeaderboard(leaderboardData);
      if (isHost) {
        setGameStatus('leaderboard');
      }
      // Players stay on their personal result screen
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
      socket.off('personalResult');
      socket.off('leaderboardShown');
      socket.off('gameFinished');
      socket.off('playerAnswered');
    };
  }, []);

  const submitAnswer = (answerIndex: number) => {
    if (hasAnswered || !currentQuestion || phase !== 'answering') return;
    
    setSelectedAnswer(answerIndex);
    setHasAnswered(true);
    
    // Get persistent player ID from localStorage
    const gamePin = game?.pin;
    const persistentId = gamePin ? localStorage.getItem(`player_id_${gamePin}`) || undefined : undefined;
    
    const socket = getSocket();
    socket.emit('submitAnswer', gameId, currentQuestion.id, answerIndex, persistentId);
  };

  const nextQuestion = () => {
    const socket = getSocket();
    socket.emit('nextQuestion', gameId);
  };

  const showLeaderboard = () => {
    const socket = getSocket();
    socket.emit('showLeaderboard', gameId);
  };

  // Choice button colors for players
  const choiceColors = [
    'bg-red-500 hover:bg-red-600 border-red-400',
    'bg-blue-500 hover:bg-blue-600 border-blue-400', 
    'bg-yellow-500 hover:bg-yellow-600 border-yellow-400',
    'bg-green-500 hover:bg-green-600 border-green-400'
  ];

  // Loading/Validation screen
  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-white mb-2 font-jua">Validating game...</h1>
          <p className="text-white/80">Please wait while we check the game status</p>
        </div>
      </div>
    );
  }

  // Error screen
  if (gameError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4 font-jua">Game Not Found</h1>
          <p className="text-white/80 text-xl mb-6">{gameError}</p>
          <p className="text-white/60 mb-4">Redirecting to home page...</p>
          <Button
            onClick={() => router.push('/')}
            variant="secondary"
            size="lg"
          >
            Go Home Now
          </Button>
        </div>
      </div>
    );
  }

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
          <h1 className="text-4xl font-bold text-white mb-4 font-jua">
            {gameStatus === 'waiting' ? 'Waiting for game to start...' : 'Game Starting!'}
          </h1>
          <p className="text-white/80 text-xl">Get ready to answer some questions!</p>
        </div>
      </div>
    );
  }

  // Leaderboard screen
  if (gameStatus === 'leaderboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-600 p-8">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <Trophy className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-white mb-4 font-jua">Current Leaderboard</h1>
              <p className="text-white/80 text-xl">
                Question {game?.currentQuestionIndex! + 1} of {game?.questions.length} completed
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {leaderboard.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-6 rounded-lg border-2 transition-all ${
                    index === 0 
                      ? 'bg-yellow-500/30 border-yellow-400 ring-2 ring-yellow-300 scale-105' 
                      : index === 1
                      ? 'bg-gray-300/30 border-gray-400'
                      : index === 2
                      ? 'bg-orange-600/30 border-orange-500'
                      : 'bg-white/10 border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                      index === 0 
                        ? 'bg-yellow-500' 
                        : index === 1
                        ? 'bg-gray-500'
                        : index === 2
                        ? 'bg-orange-600'
                        : 'bg-slate-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-white font-bold text-xl">{player.name}</div>
                      {index === 0 && (
                        <div className="text-yellow-300 font-semibold">👑 Leader</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-2xl">{player.score}</div>
                    <div className="text-white/70 text-sm">points</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Host controls */}
            {isHost && (
              <div className="text-center">
                <Button
                  onClick={nextQuestion}
                  variant="primary"
                  size="xl"
                  icon={ChevronRight}
                  iconPosition="right"
                  className="mx-auto"
                >
                  {game?.currentQuestionIndex! + 1 >= game?.questions.length! ? 'Finish Game' : 'Next Question'}
                </Button>
              </div>
            )}
          </div>
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
              <h1 className="text-4xl font-bold text-white mb-4 font-jua">Game Over!</h1>
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
                    </div>
                    <div className="text-white font-semibold text-lg">{player.name}</div>
                  </div>
                  <div className="text-white font-bold text-xl">{player.score}</div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button
                onClick={() => window.location.href = '/'}
                variant="primary"
                size="xl"
              >
                Play Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Thinking Phase - Show only question for host, waiting message for players
  if (gameStatus === 'question' && phase === 'thinking' && currentQuestion) {
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
              <h1 className="text-5xl font-bold text-white text-center leading-tight font-jua">
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
  if (gameStatus === 'question' && phase === 'answering' && currentQuestion) {
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
              <h1 className="text-4xl font-bold text-white text-center leading-tight mb-8 font-jua">
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
              <h2 className="text-3xl font-bold text-white text-center mb-8 font-jua">
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

  // Results screen - Different views for host and players
  if (gameStatus === 'results') {
    // Host view - Show full statistics
    if (isHost && questionStats) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-600 to-blue-600 p-8">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-6 font-jua">
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

              <div className="text-center">
                <Button
                  onClick={showLeaderboard}
                  variant="primary"
                  size="xl"
                  icon={ChevronRight}
                  iconPosition="right"
                  className="mx-auto"
                >
                  Show Leaderboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Player view - Show personal competitive results
    if (isPlayer && personalResult) {
      return (
        <div className={`min-h-screen bg-gradient-to-br ${
          personalResult.wasCorrect 
            ? 'from-green-600 to-emerald-600' 
            : 'from-red-600 to-pink-600'
        } p-8`}>
          <div className="container mx-auto max-w-2xl">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
              {/* Result Header */}
              <div className="mb-8">
                <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                  personalResult.wasCorrect ? 'bg-green-500/30' : 'bg-red-500/30'
                }`}>
                  {personalResult.wasCorrect ? (
                    <span className="text-6xl text-green-300">✓</span>
                  ) : (
                    <span className="text-6xl text-red-300">✗</span>
                  )}
                </div>
                <h1 className="text-5xl font-bold text-white mb-4 font-jua">
                  {personalResult.wasCorrect ? 'Correct!' : 'Incorrect!'}
                </h1>
              </div>

              {/* Points Earned */}
              <div className="bg-white/10 rounded-xl p-6 mb-6">
                <p className="text-white/80 text-lg mb-2">Points Earned This Question</p>
                <p className="text-4xl font-bold text-white">
                  +{personalResult.pointsEarned}
                </p>
                <p className="text-white/80 text-lg mt-2">Total Score: {personalResult.totalScore}</p>
              </div>

              {/* Position & Competition */}
              <div className="bg-white/10 rounded-xl p-6 mb-6">
                <p className="text-white/80 text-lg mb-2">Current Position</p>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <span className="text-4xl font-bold text-white">#{personalResult.position}</span>
                </div>
                
                {personalResult.pointsBehind > 0 ? (
                  <div className="text-center">
                    <p className="text-white/80 text-lg">
                      {personalResult.pointsBehind} points behind{' '}
                      <span className="font-bold text-white">{personalResult.nextPlayerName}</span>
                    </p>
                    <p className="text-yellow-300 font-semibold text-lg mt-2">
                      Catch up on the next question!
                    </p>
                  </div>
                ) : (
                  <p className="text-yellow-300 font-semibold text-lg">
                    You're in the lead! Keep it up!
                  </p>
                )}
              </div>

              {/* Waiting Message */}
              <div className="text-center">
                <p className="text-white/80 text-lg">Waiting for host to continue...</p>
                <div className="flex justify-center mt-4">
                  <div className="animate-pulse flex space-x-1">
                    <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Fallback if data isn't ready yet
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-pulse">
            <Trophy className="w-16 h-16 text-white/60 mx-auto mb-4" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Getting your results ready...</h1>
          <p className="text-white/80 text-lg">Hold tight, we're calculating scores!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-8">
      <div className="text-center">
        <div className="animate-pulse">
          <Users className="w-16 h-16 text-white/60 mx-auto mb-4" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Waiting for the next question...</h1>
        <p className="text-white/80 text-lg">The host is preparing something exciting!</p>
        <div className="flex justify-center mt-6">
          <div className="animate-pulse flex space-x-1">
            <div className="w-2 h-2 bg-white/60 rounded-full"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 