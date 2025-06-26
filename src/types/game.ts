export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct answer (0-3)
  timeLimit: number; // Time limit in seconds
}

export interface GameSettings {
  thinkTime: number; // Time to show question before allowing answers (in seconds)
  answerTime: number; // Time allowed to answer (in seconds)
}

export interface Game {
  id: string;
  pin: string;
  hostId: string;
  title: string;
  questions: Question[];
  settings: GameSettings;
  currentQuestionIndex: number;
  status: 'waiting' | 'started' | 'question' | 'results' | 'leaderboard' | 'finished';
  players: Player[];
  questionStartTime?: number;
  phaseStartTime?: number;
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
  leaderboardShown: (leaderboard: Player[]) => void;
  gameFinished: (finalScores: Player[]) => void;
  playerJoined: (player: Player) => void;
  playerReconnected: (player: Player) => void;
  playerLeft: (playerId: string) => void;
  playerDisconnected: (playerId: string) => void;
  error: (message: string) => void;
  playerAnswered: (playerId: string) => void;
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
} 