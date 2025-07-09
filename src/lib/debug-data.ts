import type { Game, Question, GameSettings, Player, GameStats, PersonalResult } from '@/types/game';

export const mockQuestions: Question[] = [
  {
    id: '1',
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswer: 2,
    timeLimit: 30,
    explanation: 'Paris is the capital of France, known for its art, fashion, and culture.'
  },
  {
    id: '2',
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: 1,
    timeLimit: 30,
    explanation: 'Mars is called the Red Planet because of its reddish appearance, caused by iron oxide on its surface.'
  },
  {
    id: '3',
    question: 'Who painted the Mona Lisa?',
    options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Claude Monet'],
    correctAnswer: 2,
    timeLimit: 30,
    explanation: 'The Mona Lisa was painted by the Italian artist Leonardo da Vinci, who was born in 1452 in the town of Vinci, Italy.'
  },
  {
    id: '4',
    question: 'What is the largest ocean on Earth?',
    options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
    correctAnswer: 3,
    timeLimit: 30,
    explanation: 'The Pacific Ocean is the largest and deepest of the world\'s five oceans.'
  },
  {
    id: '5',
    question: 'Which programming language is known for its simplicity and readability?',
    options: ['JavaScript', 'Python', 'C++', 'Assembly'],
    correctAnswer: 1,
    timeLimit: 30,
  }
];

export const mockGameSettings: GameSettings = {
  thinkTime: 5,
  answerTime: 30
};

export const mockPlayers: Player[] = [
  {
    id: 'host-1',
    socketId: 'socket-host',
    name: 'Host',
    score: 0,
    isHost: true,
    isConnected: true
  },
  {
    id: 'player-1',
    socketId: 'socket-alice',
    name: 'Alice',
    score: 1250,
    isHost: false,
    isConnected: true
  },
  {
    id: 'player-2',
    socketId: 'socket-bob',
    name: 'Bob',
    score: 1100,
    isHost: false,
    isConnected: true
  },
  {
    id: 'player-3',
    socketId: 'socket-charlie',
    name: 'Charlie',
    score: 950,
    isHost: false,
    isConnected: true
  },
  {
    id: 'player-4',
    socketId: 'socket-david',
    name: 'David',
    score: 800,
    isHost: false,
    isConnected: true
  },
  {
    id: 'player-5',
    socketId: 'socket-eve',
    name: 'Eve',
    score: 650,
    isHost: false,
    isConnected: false
  }
];

export const mockGame: Game = {
  id: 'debug-game-1',
  pin: '123456',
  hostId: 'host-1',
  title: 'Debug Quiz - General Knowledge',
  questions: mockQuestions,
  settings: mockGameSettings,
  currentQuestionIndex: 2,
  status: 'thinking',
  phase: 'thinking',
  players: mockPlayers,
  gameLoopActive: true,
  answerHistory: []
};

export const mockGameStats: GameStats = {
  question: mockQuestions[2],
  answers: [
    { optionIndex: 0, count: 1, percentage: 20 },
    { optionIndex: 1, count: 0, percentage: 0 },
    { optionIndex: 2, count: 3, percentage: 60 },
    { optionIndex: 3, count: 1, percentage: 20 }
  ],
  correctAnswers: 3,
  totalPlayers: 5
};

export const mockPersonalResultCorrect: PersonalResult = {
  wasCorrect: true,
  pointsEarned: 850,
  totalScore: 2100,
  position: 1,
  pointsBehind: 0,
  nextPlayerName: null,
  explanation: 'Paris is the capital of France, known for its art, fashion, and culture.'
};

export const mockPersonalResultIncorrect: PersonalResult = {
  wasCorrect: false,
  pointsEarned: 0,
  totalScore: 1250,
  position: 3,
  pointsBehind: 200,
  nextPlayerName: 'Bob',
  explanation: 'The Mona Lisa was painted by the Italian artist Leonardo da Vinci, who was born in 1452 in the town of Vinci, Italy.'
};

export const mockLeaderboard: Player[] = [
  {
    id: 'player-1',
    socketId: 'socket-alice',
    name: 'Alice',
    score: 2100,
    isHost: false,
    isConnected: true
  },
  {
    id: 'player-2',
    socketId: 'socket-bob',
    name: 'Bob',
    score: 1900,
    isHost: false,
    isConnected: true
  },
  {
    id: 'player-3',
    socketId: 'socket-charlie',
    name: 'Charlie',
    score: 1750,
    isHost: false,
    isConnected: true
  },
  {
    id: 'player-4',
    socketId: 'socket-david',
    name: 'David',
    score: 1400,
    isHost: false,
    isConnected: true
  },
  {
    id: 'player-5',
    socketId: 'socket-eve',
    name: 'Eve',
    score: 1100,
    isHost: false,
    isConnected: false
  }
];

export const mockFinalScores: Player[] = [
  {
    id: 'player-1',
    socketId: 'socket-alice',
    name: 'Alice',
    score: 4250,
    isHost: false,
    isConnected: true
  },
  {
    id: 'player-2',
    socketId: 'socket-bob',
    name: 'Bob',
    score: 3900,
    isHost: false,
    isConnected: true
  },
  {
    id: 'player-3',
    socketId: 'socket-charlie',
    name: 'Charlie',
    score: 3550,
    isHost: false,
    isConnected: true
  },
  {
    id: 'player-4',
    socketId: 'socket-david',
    name: 'David',
    score: 2800,
    isHost: false,
    isConnected: true
  },
  {
    id: 'player-5',
    socketId: 'socket-eve',
    name: 'Eve',
    score: 2100,
    isHost: false,
    isConnected: false
  }
]; 