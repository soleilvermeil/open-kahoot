'use client';

import { useEffect, useReducer } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Clock, Trophy, ChevronRight, Users, Hourglass, LogOut, Download } from 'lucide-react';
import { getSocket } from '@/lib/socket-client';
import { getGradient } from '@/lib/palette';
import type { Game, Question, GameStats, Player, PersonalResult, GamePhase } from '@/types/game';
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

// Game state management
interface GameState {
  game: Game | null;
  currentQuestion: Question | null;
  timeLeft: number;
  phase: 'thinking' | 'answering';
  selectedAnswer: number | null;
  hasAnswered: boolean;
  questionStats: GameStats | null;
  personalResult: PersonalResult | null;
  finalScores: Player[];
  leaderboard: Player[];
  gameStatus: GamePhase | 'waiting-results';
  gameError: string | null;
  isValidating: boolean;
}

type GameAction =
  | { type: 'SET_VALIDATING'; payload: boolean }
  | { type: 'SET_GAME_ERROR'; payload: string }
  | { type: 'SET_GAME_DATA'; payload: { game: Game; status: GamePhase } }
  | { type: 'START_THINKING_PHASE'; payload: { question: Question; thinkTime: number } }
  | { type: 'START_ANSWERING_PHASE'; payload: { answerTime: number } }
  | { type: 'SUBMIT_ANSWER'; payload: { answerIndex: number } }
  | { type: 'QUESTION_ENDED'; payload: GameStats }
  | { type: 'WAITING_FOR_RESULTS' }
  | { type: 'PERSONAL_RESULT'; payload: PersonalResult }
  | { type: 'SHOW_LEADERBOARD'; payload: Player[] }
  | { type: 'GAME_FINISHED'; payload: Player[] }
  | { type: 'TICK_TIMER' }
  | { type: 'GAME_STARTED'; payload: Game };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_VALIDATING':
      return { ...state, isValidating: action.payload };
      
    case 'SET_GAME_ERROR':
      return { ...state, gameError: action.payload, isValidating: false };
      
    case 'SET_GAME_DATA':
      return { 
        ...state, 
        game: action.payload.game, 
        gameStatus: action.payload.status, 
        isValidating: false 
      };
      
    case 'GAME_STARTED':
      return { 
        ...state, 
        game: action.payload, 
        gameStatus: 'preparation'
      };
      
    case 'START_THINKING_PHASE':
      return {
        ...state,
        currentQuestion: action.payload.question,
        timeLeft: action.payload.thinkTime,
        phase: 'thinking',
        selectedAnswer: null,
        hasAnswered: false,
        questionStats: null,
        personalResult: null,
        gameStatus: 'thinking'
      };
      
    case 'START_ANSWERING_PHASE':
      return {
        ...state,
        timeLeft: action.payload.answerTime,
        phase: 'answering',
        gameStatus: 'answering'
      };
      
    case 'SUBMIT_ANSWER':
      return {
        ...state,
        selectedAnswer: action.payload.answerIndex,
        hasAnswered: true
      };
      
    case 'QUESTION_ENDED':
      return {
        ...state,
        questionStats: action.payload,
        gameStatus: 'results'
      };
      
    case 'WAITING_FOR_RESULTS':
      return {
        ...state,
        gameStatus: 'waiting-results'
      };
      
    case 'PERSONAL_RESULT':
      return {
        ...state,
        personalResult: action.payload,
        gameStatus: 'results'
      };
      
    case 'SHOW_LEADERBOARD':
      return {
        ...state,
        leaderboard: action.payload,
        gameStatus: 'leaderboard'
      };
      
    case 'GAME_FINISHED':
      return {
        ...state,
        finalScores: action.payload,
        gameStatus: 'finished'
      };
      
    case 'TICK_TIMER':
      return {
        ...state,
        timeLeft: Math.max(0, state.timeLeft - 1)
      };
      
    default:
      return state;
  }
}

const initialState: GameState = {
  game: null,
  currentQuestion: null,
  timeLeft: 0,
  phase: 'thinking',
  selectedAnswer: null,
  hasAnswered: false,
  questionStats: null,
  personalResult: null,
  finalScores: [],
  leaderboard: [],
  gameStatus: 'waiting',
  gameError: null,
  isValidating: true,
};

export default function GamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const gameId = params.id as string;
  const isHost = searchParams.get('host') === 'true';
  const isPlayer = searchParams.get('player') === 'true';

  const [state, dispatch] = useReducer(gameReducer, initialState);

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
              dispatch({ type: 'SET_VALIDATING', payload: false });
              if (success && game) {
                dispatch({ type: 'SET_GAME_DATA', payload: { game: game, status: game.status } });
              } else {
                dispatch({ type: 'SET_GAME_ERROR', payload: 'Unable to rejoin game. You may have been removed.' });
                setTimeout(() => router.push('/'), 3000);
              }
            });
          } else {
            // No stored player ID for this game
            dispatch({ type: 'SET_VALIDATING', payload: false });
            dispatch({ type: 'SET_GAME_ERROR', payload: 'No player data found for this game. Please join the game again.' });
            setTimeout(() => router.push('/'), 3000);
          }
        } else {
          dispatch({ type: 'SET_VALIDATING', payload: false });
          dispatch({ type: 'SET_GAME_ERROR', payload: 'Game not found or no longer available' });
          setTimeout(() => router.push('/'), 3000);
        }
      });
    } else {
      // Host validation - just validate game exists
      socket.emit('validateGame', gameId, (valid: boolean, gameData?: Game) => {
        dispatch({ type: 'SET_VALIDATING', payload: false });
        if (valid && gameData) {
          dispatch({ type: 'SET_GAME_DATA', payload: { game: gameData, status: gameData.status } });
        } else {
          dispatch({ type: 'SET_GAME_ERROR', payload: 'Game not found or no longer available' });
          setTimeout(() => router.push('/'), 3000);
        }
      });
    }

    socket.on('gameStarted', (gameData: Game) => {
      console.log('🎮 [CLIENT] Received gameStarted event:', gameData);
      dispatch({ type: 'GAME_STARTED', payload: gameData });
    });

    socket.on('thinkingPhase', (question: Question, thinkTime: number) => {
      console.log('📋 [CLIENT] Received thinkingPhase event:', question.question, 'thinkTime:', thinkTime);
      dispatch({ type: 'START_THINKING_PHASE', payload: { question, thinkTime } });
    });

    socket.on('answeringPhase', (answerTime: number) => {
      console.log('⏰ [CLIENT] Received answeringPhase event, answerTime:', answerTime);
      dispatch({ type: 'START_ANSWERING_PHASE', payload: { answerTime } });
    });

    socket.on('questionEnded', () => {
      // Both host and players wait for 1 second before results are shown
      dispatch({ type: 'WAITING_FOR_RESULTS' });
    });

    socket.on('personalResult', (result: PersonalResult) => {
      dispatch({ type: 'PERSONAL_RESULT', payload: result });
    });

    socket.on('hostResults', (stats: GameStats) => {
      dispatch({ type: 'QUESTION_ENDED', payload: stats });
    });

    socket.on('leaderboardShown', (leaderboardData: Player[]) => {
      dispatch({ type: 'SHOW_LEADERBOARD', payload: leaderboardData });
      // Players stay on their personal result screen
    });

    socket.on('gameFinished', (scores: Player[]) => {
      dispatch({ type: 'GAME_FINISHED', payload: scores });
    });

    socket.on('playerAnswered', (playerId: string) => {
      console.log('Player answered:', playerId);
    });

    socket.on('gameLogs', (tsvData: string, filename: string) => {
      // Create and download the TSV file
      const blob = new Blob([tsvData], { type: 'text/tab-separated-values' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      console.log(`📄 Downloaded game logs: ${filename}`);
    });

    return () => {
      socket.off('gameStarted');
      socket.off('thinkingPhase');
      socket.off('answeringPhase');
      socket.off('questionEnded');
      socket.off('hostResults');
      socket.off('personalResult');
      socket.off('leaderboardShown');
      socket.off('gameFinished');
      socket.off('playerAnswered');
      socket.off('gameLogs');
    };
  }, [gameId, isHost, router]);

  // Timer effect for question countdown
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (state.timeLeft > 0 && (state.phase === 'thinking' || state.phase === 'answering')) {
      timer = setInterval(() => {
        dispatch({ type: 'TICK_TIMER' });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [state.timeLeft, state.phase]);

  const submitAnswer = (answerIndex: number) => {
    if (state.hasAnswered || !state.currentQuestion || state.phase !== 'answering') return;
    
    dispatch({ type: 'SUBMIT_ANSWER', payload: { answerIndex } });
    
    // Get persistent player ID from localStorage
    const gamePin = state.game?.pin;
    const persistentId = gamePin ? localStorage.getItem(`player_id_${gamePin}`) || undefined : undefined;
    
    const socket = getSocket();
    socket.emit('submitAnswer', gameId, state.currentQuestion.id, answerIndex, persistentId);
  };

  const nextQuestion = () => {
    const socket = getSocket();
    socket.emit('nextQuestion', gameId);
  };

  const showLeaderboard = () => {
    const socket = getSocket();
    socket.emit('showLeaderboard', gameId);
  };

  const downloadLogs = () => {
    const socket = getSocket();
    socket.emit('downloadGameLogs', gameId);
  };



  // Loading/Validation screen
  if (state.isValidating) {
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
  if (state.gameError) {
    return (
      <PageLayout gradient="error" showLogo={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <ErrorScreen
            title="Game Not Found"
            message={state.gameError}
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
  if (state.gameStatus === 'waiting' || state.gameStatus === 'preparation') {
    return (
      <div className={`min-h-screen ${getGradient('waiting')} flex items-center justify-center p-8`}>
        <div className="text-center">
          <AnimatedIcon icon={Hourglass} />
          <h1 className="text-4xl text-white mb-4 font-jua">
            {state.gameStatus === 'waiting' ? 'Waiting for game to start...' : 'Game Starting!'}
          </h1>
          <p className="text-white/80 text-xl">Get ready to answer some questions!</p>
        </div>
      </div>
    );
  }

  // Leaderboard screen - only shown to hosts, players stay on results
  if (state.gameStatus === 'leaderboard' && isHost) {
    return (
      <PageLayout gradient="leaderboard" maxWidth="4xl" showLogo={false}>
        <Card>
          <Leaderboard
            players={state.leaderboard}
            title="Current Leaderboard"
            subtitle={`Question ${(state.game?.currentQuestionIndex ?? 0) + 2} of ${state.game?.questions.length ?? 0} completed`}
            buttons={[{
              text: (state.game?.currentQuestionIndex ?? 0) + 1 >= (state.game?.questions.length ?? 0) ? 'Finish Game' : 'Next Question',
              onClick: nextQuestion,
              icon: ChevronRight,
              iconPosition: 'right'
            }]}
          />
        </Card>
      </PageLayout>
    );
  }

  // Final results screen
  if (state.gameStatus === 'finished') {
    return (
      <PageLayout gradient="finished" maxWidth="4xl" showLogo={false}>
        <Card>
          <Leaderboard
            players={state.finalScores}
            title="Game Over!"
            subtitle="Final Results"
            buttons={isHost ? [
              {
                text: "Download Game Logs",
                onClick: downloadLogs,
                icon: Download,
                iconPosition: 'left',
                variant: 'black'
              },
              {
                text: "Back to Home",
                onClick: () => window.location.href = '/',
                icon: LogOut,
                iconPosition: 'right',
                variant: 'black'
              }
            ] : [
              {
                text: "Back to Home",
                onClick: () => window.location.href = '/',
                icon: LogOut,
                iconPosition: 'right'
              }
            ]}
          />
        </Card>
      </PageLayout>
    );
  }

  // Thinking Phase - Show only question for host, waiting message for players
  if (state.gameStatus === 'thinking' && state.phase === 'thinking' && state.currentQuestion) {
    console.log('📋 [CLIENT] Rendering thinking phase for game status:', state.gameStatus, 'phase:', state.phase, 'hasQuestion:', !!state.currentQuestion);
    return (
      <PageLayout gradient="thinking" maxWidth="4xl" showLogo={false}>
        <Timer
          timeLeft={state.timeLeft}
          totalTime={state.game?.settings.thinkTime || 5}
          label={isHost ? 'Players are reading the question' : 'Read the question carefully'}
          variant="thinking"
        />

        {/* Question Display - Host Screen */}
        {isHost && (
          <HostThinkingScreen currentQuestion={state.currentQuestion} />
        )}

        {/* Player Device - Waiting */}
        {isPlayer && (
          <PlayerThinkingScreen />
        )}
      </PageLayout>
    );
  }

  // Waiting for results screen - shows after question ends but before results are revealed
  if (state.gameStatus === 'waiting-results') {
    return (
      <div className={`min-h-screen ${getGradient('waiting')} flex items-center justify-center p-8`}>
        <div className="text-center">
          <AnimatedIcon icon={Clock} size="md" iconColor="text-white/60" className="mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">
            {isHost ? 'Calculating results...' : 'Getting your results ready...'}
          </h1>
          <p className="text-white/80 text-lg">
            {isHost ? 'Preparing the results for all players' : 'Hold tight, we\'re calculating your score!'}
          </p>
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

  // Answering Phase
  if (state.gameStatus === 'answering' && state.phase === 'answering' && state.currentQuestion) {
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
                style={{ width: `${(state.timeLeft / (state.game?.settings.answerTime || 30)) * 100}%` }}
              />
            </div>
          </div>

          {/* Host Screen - Show question and full answer choices */}
          {isHost && (
            <HostAnsweringScreen 
              currentQuestion={state.currentQuestion}
              timeLeft={state.timeLeft}
              answerTime={state.game?.settings.answerTime || 30}
            />
          )}

          {/* Player Device - Show only colored choice buttons */}
          {isPlayer && (
            <PlayerAnsweringScreen 
              onSubmitAnswer={submitAnswer}
              hasAnswered={state.hasAnswered}
              selectedAnswer={state.selectedAnswer}
            />
          )}
        </div>
      </div>
    );
  }

  // Results screen - Different views for host and players
  if (state.gameStatus === 'results') {
    // Host view - Show full statistics
    if (isHost && state.questionStats) {
      return (
        <div className={`min-h-screen ${getGradient('results')} p-8`}>
          <div className="container mx-auto max-w-4xl">
            <HostResultsScreen 
              questionStats={state.questionStats}
              onShowLeaderboard={showLeaderboard}
            />
          </div>
        </div>
      );
    }

    // Player view - Show personal competitive results
    if (isPlayer && state.personalResult) {
      return (
        <div className={`min-h-screen ${getGradient(state.personalResult.wasCorrect ? 'correct' : 'incorrect')} p-8`}>
          <div className="container mx-auto max-w-2xl">
            <PlayerResultsScreen personalResult={state.personalResult} />
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

  console.log('🚨 [CLIENT] Falling through to waiting screen. Game status:', state.gameStatus, 'phase:', state.phase, 'hasQuestion:', !!state.currentQuestion, 'isHost:', isHost, 'isPlayer:', isPlayer);
  
  return (
    <div className={`min-h-screen ${getGradient('waiting')} flex items-center justify-center p-8`}>
      <div className="text-center">
        <AnimatedIcon icon={Users} size="md" iconColor="text-white/60" className="mb-4" />
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