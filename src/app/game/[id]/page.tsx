'use client';

import { useEffect, useReducer } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { getSocket } from '@/lib/socket-client';
import type { Game, Question, GameStats, Player, PersonalResult, GamePhase } from '@/types/game';
// Game Screen Components
import GameValidationScreen from '@/components/game-screens/GameValidationScreen';
import GameErrorScreen from '@/components/game-screens/GameErrorScreen';
import GameWaitingScreen from '@/components/game-screens/GameWaitingScreen';
import GameLeaderboardScreen from '@/components/game-screens/GameLeaderboardScreen';
import GameFinalResultsScreen from '@/components/game-screens/GameFinalResultsScreen';
import GameThinkingPhaseScreen from '@/components/game-screens/GameThinkingPhaseScreen';
import GameWaitingForResultsScreen from '@/components/game-screens/GameWaitingForResultsScreen';
import GameAnsweringPhaseScreen from '@/components/game-screens/GameAnsweringPhaseScreen';
import GameResultsPhaseScreen from '@/components/game-screens/GameResultsPhaseScreen';
import GameFallbackScreen from '@/components/game-screens/GameFallbackScreen';

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
  | { type: 'SHOW_LEADERBOARD'; payload: { leaderboard: Player[]; game: Game } }
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
        leaderboard: action.payload.leaderboard,
        game: action.payload.game,
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
  const params = useParams<{ id?: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const gameId = params?.id ?? null;
  const isHost = searchParams?.get('host') === 'true';
  const isPlayer = searchParams?.get('player') === 'true';

  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    const socket = getSocket();

    if (!gameId) {
      dispatch({ type: 'SET_VALIDATING', payload: false });
      dispatch({ type: 'SET_GAME_ERROR', payload: 'Game not found or no longer available' });
      return;
    }

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
      // Removed console.log
      dispatch({ type: 'GAME_STARTED', payload: gameData });
    });

    socket.on('thinkingPhase', (question: Question, thinkTime: number) => {
      // Removed console.log
      dispatch({ type: 'START_THINKING_PHASE', payload: { question, thinkTime } });
    });

    socket.on('answeringPhase', (answerTime: number) => {
      // Removed console.log
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

    socket.on('leaderboardShown', (leaderboardData: Player[], gameData: Game) => {
      dispatch({ type: 'SHOW_LEADERBOARD', payload: { leaderboard: leaderboardData, game: gameData } });
      // Players stay on their personal result screen
    });

    socket.on('gameFinished', (scores: Player[]) => {
      dispatch({ type: 'GAME_FINISHED', payload: scores });
    });

    socket.on('playerAnswered', (playerId: string) => {
      console.log(`[PIN ${state.game?.pin}] Player answered: ${playerId}`);
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
      // Removed console.log
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
    if (!gameId) return;

    socket.emit('submitAnswer', gameId, state.currentQuestion.id, answerIndex, persistentId);
  };

  const nextQuestion = () => {
    const socket = getSocket();
    if (!gameId) return;
    socket.emit('nextQuestion', gameId);
  };

  const showLeaderboard = () => {
    const socket = getSocket();
    if (!gameId) return;
    socket.emit('showLeaderboard', gameId);
  };

  const downloadLogs = () => {
    const socket = getSocket();
    if (!gameId) return;
    socket.emit('downloadGameLogs', gameId);
  };



  // Loading/Validation screen
  if (state.isValidating) {
    return <GameValidationScreen />;
  }

  // Error screen
  if (state.gameError) {
    return <GameErrorScreen error={state.gameError} />;
  }

  // Waiting screen
  if (state.gameStatus === 'waiting' || state.gameStatus === 'preparation') {
    return <GameWaitingScreen gameStatus={state.gameStatus} />;
  }

  // Leaderboard screen - only shown to hosts, players stay on results
  if (state.gameStatus === 'leaderboard' && isHost) {
    return (
      <GameLeaderboardScreen 
        leaderboard={state.leaderboard}
        game={state.game}
        onNextQuestion={nextQuestion}
      />
    );
  }

  // Final results screen
  if (state.gameStatus === 'finished') {
    return (
      <GameFinalResultsScreen 
        finalScores={state.finalScores}
        isHost={isHost}
        onDownloadLogs={downloadLogs}
      />
    );
  }

  // Thinking Phase - Show only question for host, waiting message for players
  if (state.gameStatus === 'thinking' && state.phase === 'thinking' && state.currentQuestion) {
    // Removed console.log
    return (
      <GameThinkingPhaseScreen 
        currentQuestion={state.currentQuestion}
        timeLeft={state.timeLeft}
        game={state.game}
        isHost={isHost}
        isPlayer={isPlayer}
      />
    );
  }

  // Waiting for results screen - shows after question ends but before results are revealed
  if (state.gameStatus === 'waiting-results') {
    return <GameWaitingForResultsScreen isHost={isHost} />;
  }

  // Answering Phase
  if (state.gameStatus === 'answering' && state.phase === 'answering' && state.currentQuestion) {
    return (
      <GameAnsweringPhaseScreen 
        currentQuestion={state.currentQuestion}
        timeLeft={state.timeLeft}
        game={state.game}
        isHost={isHost}
        isPlayer={isPlayer}
        onSubmitAnswer={submitAnswer}
        hasAnswered={state.hasAnswered}
      />
    );
  }

  // Results screen - Different views for host and players
  if (state.gameStatus === 'results') {
    return (
      <GameResultsPhaseScreen 
        isHost={isHost}
        isPlayer={isPlayer}
        questionStats={state.questionStats}
        personalResult={state.personalResult}
        onShowLeaderboard={showLeaderboard}
      />
    );
  }

  // Removed console.log
  
  return <GameFallbackScreen />;
} 