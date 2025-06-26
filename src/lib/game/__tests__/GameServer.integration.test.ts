import { GameServer } from '../GameServer';
import type { Question, GameSettings, ServerToClientEvents, ClientToServerEvents } from '@/types/game';
import type { Server as SocketIOServer } from 'socket.io';

// Mock Socket.IO for testing
const mockIo = {
  on: jest.fn(),
  to: jest.fn(() => ({ emit: jest.fn() })),
  emit: jest.fn(),
  close: jest.fn(),
} as unknown as SocketIOServer<ClientToServerEvents, ServerToClientEvents>;

describe('GameServer Integration', () => {
  let gameServer: GameServer;

  const mockQuestions: Question[] = [
    {
      id: '1',
      question: 'What is 2+2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 1,
      timeLimit: 30
    }
  ];

  const mockSettings: GameSettings = {
    thinkTime: 5,
    answerTime: 30
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    gameServer = new GameServer(mockIo);
  });

  afterEach(() => {
    gameServer.shutdown();
  });

  describe('GameServer initialization', () => {
    it('should initialize with all managers', () => {
      expect(gameServer.getGameManager()).toBeDefined();
      expect(gameServer.getPlayerManager()).toBeDefined();
      expect(gameServer.getQuestionManager()).toBeDefined();
      expect(gameServer.getTimerManager()).toBeDefined();
    });

    it('should provide accurate stats for empty server', () => {
      const stats = gameServer.getStats();
      
      expect(stats.totalGames).toBe(0);
      expect(stats.games).toEqual([]);
    });
  });

  describe('Game lifecycle integration', () => {
    it('should create game and track it in stats', () => {
      const gameManager = gameServer.getGameManager();
      const game = gameManager.createGame('host-1', 'Test Game', mockQuestions, mockSettings);
      
      const stats = gameServer.getStats();
      
      expect(stats.totalGames).toBe(1);
      expect(stats.games).toHaveLength(1);
      expect(stats.games[0]).toMatchObject({
        id: game.id,
        pin: game.pin,
        status: 'waiting',
        playerCount: 1, // Host only
        currentQuestion: 0, // currentQuestionIndex -1 + 1
        totalQuestions: 1
      });
    });

    it('should handle complete game flow through managers', () => {
      const gameManager = gameServer.getGameManager();
      const playerManager = gameServer.getPlayerManager();
      const questionManager = gameServer.getQuestionManager();
      
      // Create game
      const game = gameManager.createGame('host-1', 'Test Game', mockQuestions, mockSettings);
      
      // Add players
      const joinResult = playerManager.joinGame(game, 'player-1', 'Player 1');
      expect(joinResult.success).toBe(true);
      
      // Start game and first question
      const question = questionManager.startNextQuestion(game);
      expect(question).toEqual(mockQuestions[0]);
      expect(game.status).toBe('question');
      
      // Submit answer
      const answerSubmitted = playerManager.submitAnswer(game, 'player-1', 1);
      expect(answerSubmitted).toBe(true);
      
      // Update scores
      playerManager.updateScores(game, 1);
      const leaderboard = playerManager.getLeaderboard(game);
      expect(leaderboard[0].score).toBeGreaterThan(0);
      
      // Check if game is finished
      expect(questionManager.isLastQuestion(game)).toBe(true);
    });
  });

  describe('Manager coordination', () => {
    it('should coordinate timer and question management', () => {
      const gameManager = gameServer.getGameManager();
      const timerManager = gameServer.getTimerManager();
      const questionManager = gameServer.getQuestionManager();
      
      const game = gameManager.createGame('host-1', 'Test Game', mockQuestions, mockSettings);
      
      // Start question
      questionManager.startNextQuestion(game);
      
      // Set thinking phase timer
      const mockCallback = jest.fn();
      timerManager.setThinkingPhaseTimer(game.id, mockCallback, 5);
      
      expect(timerManager.hasTimer(game.id, 'thinkingPhase')).toBe(true);
      expect(timerManager.getActiveTimerCount(game.id)).toBe(1);
    });

    it('should clean up all game resources on shutdown', () => {
      const gameManager = gameServer.getGameManager();
      const timerManager = gameServer.getTimerManager();
      
      // Create multiple games with timers
      const game1 = gameManager.createGame('host-1', 'Game 1', mockQuestions, mockSettings);
      const game2 = gameManager.createGame('host-2', 'Game 2', mockQuestions, mockSettings);
      
      timerManager.setTimer(game1.id, 'test-timer-1', jest.fn(), 10000);
      timerManager.setTimer(game2.id, 'test-timer-2', jest.fn(), 10000);
      
      expect(timerManager.getActiveTimerCount(game1.id)).toBe(1);
      expect(timerManager.getActiveTimerCount(game2.id)).toBe(1);
      
      // Shutdown should clear all timers
      gameServer.shutdown();
      
      expect(timerManager.getActiveTimerCount(game1.id)).toBe(0);
      expect(timerManager.getActiveTimerCount(game2.id)).toBe(0);
    });
  });

  describe('Error handling', () => {
    it('should handle manager errors gracefully', () => {
      const gameManager = gameServer.getGameManager();
      
      // Try to get non-existent game
      const nonExistentGame = gameManager.getGame('invalid-id');
      expect(nonExistentGame).toBeUndefined();
      
      // Server should still be functional
      const stats = gameServer.getStats();
      expect(stats.totalGames).toBe(0);
    });
  });
}); 