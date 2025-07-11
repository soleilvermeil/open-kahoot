export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct answer (0-3)
  timeLimit: number; // Time limit in seconds
  explanation?: string;
  image?: string;
}

export interface AnswerRecord {
  playerId: string;
  playerName: string;
  questionIndex: number;
  questionId: string;
  answerIndex: number | null; // null if no answer was given
  answerTime?: number;
  responseTime: number; // milliseconds from question start
  pointsEarned: number;
  wasCorrect: boolean;
  hasDyslexiaSupport: boolean; // New field for dyslexia support tracking
}

export interface GameSettings {
  thinkTime: number; // Time to show question before allowing answers (in seconds)
  answerTime: number; // Time allowed to answer (in seconds)
}

export type GamePhase = 'waiting' | 'preparation' | 'thinking' | 'answering' | 'results' | 'leaderboard' | 'finished';

export interface Game {
  id: string;
  pin: string;
  hostId: string;
  title: string;
  questions: Question[];
  settings: GameSettings;
  currentQuestionIndex: number;
  status: GamePhase;
  phase: GamePhase; // Current gameplay phase
  players: Player[];
  questionStartTime?: number;
  phaseStartTime?: number;
  phaseEndTime?: number;
  gameLoopActive?: boolean; // Whether the gameplay loop is running
  answerHistory: AnswerRecord[]; // Historical record of all answers
}

export interface Player {
  id: string; // This is now the persistent player ID (UUID)
  socketId: string; // Current socket connection ID
  name: string;
  score: number;
  isHost: boolean;
  currentAnswer?: number;
  answerTime?: number;
  isConnected: boolean; // Track connection status
  hasDyslexiaSupport?: boolean; // New field for dyslexia support
}

export interface GameStats {
  question: Question;
  answers: {
    optionIndex: number;
    count: number;
    percentage: number;
  }[];
  correctAnswers: number;
  totalPlayers: number;
}

export interface PersonalResult {
  wasCorrect: boolean;
  pointsEarned: number;
  totalScore: number;
  position: number;
  pointsBehind: number;
  nextPlayerName: string | null;
  explanation?: string;
}

// Socket Events
export interface ServerToClientEvents {
  gameJoined: (game: Game) => void;
  gameStarted: (game: Game) => void;
  questionStarted: (question: Question, timeLimit: number) => void;
  thinkingPhase: (question: Question, thinkTime: number) => void;
  answeringPhase: (answerTime: number) => void;
  questionEnded: (stats: GameStats) => void;
  hostResults: (stats: GameStats) => void;
  personalResult: (result: PersonalResult) => void;
  leaderboardShown: (leaderboard: Player[], game: Game) => void;
  gameFinished: (finalScores: Player[]) => void;
  playerJoined: (player: Player) => void;
  playerReconnected: (player: Player) => void;
  playerLeft: (playerId: string) => void;
  playerDisconnected: (playerId: string) => void;
  error: (message: string) => void;
  playerAnswered: (playerId: string) => void;
  gameLogs: (tsvData: string, filename: string) => void;
  gameUpdated: (game: Game) => void;
}

export interface ClientToServerEvents {
  createGame: (title: string, questions: Question[], settings: GameSettings, callback: (game: Game) => void) => void;
  joinGame: (pin: string, playerName: string, persistentId?: string, callback?: (success: boolean, game?: Game, playerId?: string) => void) => void;
  validateGame: (gameId: string, callback: (valid: boolean, game?: Game) => void) => void;
  startGame: (gameId: string) => void;
  submitAnswer: (gameId: string, questionId: string, answerIndex: number, persistentId?: string) => void;
  nextQuestion: (gameId: string) => void;
  showLeaderboard: (gameId: string) => void;
  endGame: (gameId: string) => void;
  downloadGameLogs: (gameId: string) => void;
  toggleDyslexiaSupport: (gameId: string, playerId: string) => void;
}