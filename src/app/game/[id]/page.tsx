'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Clock, Trophy, ChevronRight, Users, Hourglass } from 'lucide-react';
import { getSocket } from '@/lib/socket-client';
import { getGradient } from '@/lib/palette';
import type { Game, Question, GameStats, Player, PersonalResult } from '@/types/game';
import Button from '@/components/Button';
import PageLayout from '@/components/PageLayout';
import Card from '@/components/Card';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import Timer from '@/components/Timer';
import Leaderboard from '@/components/Leaderboard';
import AnimatedIcon from '@/components/AnimatedIcon';
import HostThinkingScreen from '@/components/host-screens/HostThinkingScreen';
import HostAnsweringScreen from '@/components/host-screens/HostAnsweringScreen';
import HostResultsScreen from '@/components/host-screens/HostResultsScreen';
import PlayerThinkingScreen from '@/components/player-screens/PlayerThinkingScreen';
import PlayerAnsweringScreen from '@/components/player-screens/PlayerAnsweringScreen';
import PlayerResultsScreen from '@/components/player-screens/PlayerResultsScreen';

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
      console.log('🎮 [CLIENT] Received gameStarted event:', gameData);
      setGame(gameData);
      setGameStatus('started');
    });

    socket.on('thinkingPhase', (question: Question, thinkTime: number) => {
      console.log('📋 [CLIENT] Received thinkingPhase event:', question.question, 'thinkTime:', thinkTime);
      setCurrentQuestion(question);
      setTimeLeft(thinkTime);
      setPhase('thinking');
      setSelectedAnswer(null);
      setHasAnswered(false);
      setQuestionStats(null);
      setPersonalResult(null);
      setGameStatus('question');
    });

    socket.on('answeringPhase', (answerTime: number) => {
      console.log('⏰ [CLIENT] Received answeringPhase event, answerTime:', answerTime);
      setTimeLeft(answerTime);
      setPhase('answering');
      setGameStatus('question');
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
  }, [gameId, isHost, router]);

  // Timer effect for question countdown
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (timeLeft > 0 && (phase === 'thinking' || phase === 'answering')) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timeLeft, phase]);

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



  // Loading/Validation screen
  if (isValidating) {
    return (
      <PageLayout gradient="loading" showLogo={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingScreen 
            title="Validating game..." 
            description="Please wait while we check the game status"
          />
        </div>
      </PageLayout>
    );
  }

  // Error screen
  if (gameError) {
    return (
      <PageLayout gradient="error" showLogo={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <ErrorScreen
            title="Game Not Found"
            message={gameError}
            actionText="Go Home Now"
            onAction={() => router.push('/')}
            autoRedirect={{
              url: '/',
              delay: 3000,
              message: 'Redirecting to home page...'
            }}
          />
        </div>
      </PageLayout>
    );
  }

  // Waiting screen
  if (gameStatus === 'waiting' || gameStatus === 'started') {
    return (
      <div className={`min-h-screen ${getGradient('waiting')} flex items-center justify-center p-8`}>
        <div className="text-center">
          <AnimatedIcon icon={Hourglass} />
          <h1 className="text-4xl text-white mb-4 font-jua">
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
      <PageLayout gradient="leaderboard" maxWidth="4xl" showLogo={false}>
        <Card>
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 font-jua">Current Leaderboard</h1>
            <p className="text-white/80 text-xl">
              Question {(game?.currentQuestionIndex ?? 0) + 2} of {game?.questions.length ?? 0} completed
            </p>
          </div>

          {/* Host controls */}
          {isHost && (
            <div className="text-center mb-8">
              <Button
                onClick={nextQuestion}
                variant="black"
                size="xl"
                icon={ChevronRight}
                iconPosition="right"
                className="mx-auto"
              >
                {(game?.currentQuestionIndex ?? 0) + 1 >= (game?.questions.length ?? 0) ? 'Finish Game' : 'Next Question'}
              </Button>
            </div>
          )}

          <Leaderboard
            players={leaderboard}
            title=""
            subtitle=""
          />
        </Card>
      </PageLayout>
    );
  }

  // Final results screen
  if (gameStatus === 'finished') {
    return (
      <PageLayout gradient="finished" maxWidth="4xl" showLogo={false}>
        <Card>
          <Leaderboard
            players={finalScores}
            title="Game Over!"
            subtitle="Final Results"
            className="mb-8"
          />

          <div className="text-center">
            <Button
              onClick={() => window.location.href = '/'}
              variant="black"
              size="xl"
            >
              Back to Home
            </Button>
          </div>
        </Card>
      </PageLayout>
    );
  }

  // Thinking Phase - Show only question for host, waiting message for players
  if (gameStatus === 'question' && phase === 'thinking' && currentQuestion) {
    console.log('📋 [CLIENT] Rendering thinking phase for game status:', gameStatus, 'phase:', phase, 'hasQuestion:', !!currentQuestion);
    return (
      <PageLayout gradient="thinking" maxWidth="4xl" showLogo={false}>
        <Timer
          timeLeft={timeLeft}
          totalTime={game?.settings.thinkTime || 5}
          label={isHost ? 'Players are reading the question' : 'Read the question carefully'}
          variant="thinking"
        />

        {/* Question Display - Host Screen */}
        {isHost && (
          <HostThinkingScreen currentQuestion={currentQuestion} />
        )}

        {/* Player Device - Waiting */}
        {isPlayer && (
          <PlayerThinkingScreen />
        )}
      </PageLayout>
    );
  }

  // Answering Phase
  if (gameStatus === 'question' && phase === 'answering' && currentQuestion) {
    return (
      <div className={`min-h-screen ${getGradient('answering')} p-8`}>
        <div className="container mx-auto max-w-4xl">
          {/* Timer */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="w-8 h-8 text-white" />
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
            <HostAnsweringScreen 
              currentQuestion={currentQuestion}
              timeLeft={timeLeft}
              answerTime={game?.settings.answerTime || 30}
            />
          )}

          {/* Player Device - Show only colored choice buttons */}
          {isPlayer && (
            <PlayerAnsweringScreen 
              onSubmitAnswer={submitAnswer}
              hasAnswered={hasAnswered}
              selectedAnswer={selectedAnswer}
            />
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
        <div className={`min-h-screen ${getGradient('results')} p-8`}>
          <div className="container mx-auto max-w-4xl">
            <HostResultsScreen 
              questionStats={questionStats}
              onShowLeaderboard={showLeaderboard}
            />
          </div>
        </div>
      );
    }

    // Player view - Show personal competitive results
    if (isPlayer && personalResult) {
      return (
        <div className={`min-h-screen ${getGradient(personalResult.wasCorrect ? 'correct' : 'incorrect')} p-8`}>
          <div className="container mx-auto max-w-2xl">
            <PlayerResultsScreen personalResult={personalResult} />
          </div>
        </div>
      );
    }

    // Fallback if data isn't ready yet
    return (
      <div className={`min-h-screen ${getGradient('waiting')} flex items-center justify-center p-8`}>
        <div className="text-center">
          <AnimatedIcon icon={Trophy} size="md" iconColor="text-white/60" className="mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">Getting your results ready...</h1>
          <p className="text-white/80 text-lg">Hold tight, we&apos;re calculating scores!</p>
        </div>
      </div>
    );
  }

  console.log('🚨 [CLIENT] Falling through to waiting screen. Game status:', gameStatus, 'phase:', phase, 'hasQuestion:', !!currentQuestion, 'isHost:', isHost, 'isPlayer:', isPlayer);
  
  return (
    <div className={`min-h-screen ${getGradient('waiting')} flex items-center justify-center p-8`}>
      <div className="text-center">
        <AnimatedIcon icon={Users} size="md" iconColor="text-white/60" className="mb-4" />
        <h1 className="text-3xl font-bold text-white mb-4">Waiting for the next question...</h1>
        <p className="text-white/80 text-lg">The host is preparing something exciting!</p>
        <div className="text-white/60 text-sm mt-4">
          Debug: status={gameStatus}, phase={phase}, hasQuestion={!!currentQuestion}
        </div>
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