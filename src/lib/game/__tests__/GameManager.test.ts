import { GameManager } from '../GameManager';
import type { GameSettings, Question } from '@/types/game';

describe('GameManager', () => {
  let gameManager: GameManager;
  const mockQuestions: Question[] = [
    {
      id: '1',
      question: 'What is 2+2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 1,
      timeLimit: 30
    },
    {
      id: '2', 
      question: 'What is the capital of France?',
      options: ['London', 'Berlin', 'Paris', 'Rome'],
      correctAnswer: 2,
      timeLimit: 30
    }
  ];
  
  const mockSettings: GameSettings = {
    thinkTime: 5,
    answerTime: 30
  };

  beforeEach(() => {
    gameManager = new GameManager();
  });

  describe('createGame', () => {
    it('should create a game with unique ID and PIN', () => {
      const game = gameManager.createGame('host-socket-1', 'Test Game', mockQuestions, mockSettings);
      
      expect(game.id).toBeDefined();
      expect(game.pin).toMatch(/^\d{6}$/); // 6-digit PIN
      expect(game.title).toBe('Test Game');
      expect(game.questions).toEqual(mockQuestions);
      expect(game.settings).toEqual(mockSettings);
      expect(game.status).toBe('waiting');
      expect(game.currentQuestionIndex).toBe(-1);
      expect(game.players).toHaveLength(1);
      expect(game.players[0].isHost).toBe(true);
    });

    it('should generate unique PINs for multiple games', () => {
      const game1 = gameManager.createGame('host-1', 'Game 1', mockQuestions, mockSettings);
      const game2 = gameManager.createGame('host-2', 'Game 2', mockQuestions, mockSettings);
      
      expect(game1.pin).not.toBe(game2.pin);
    });

    it('should create host player with correct properties', () => {
      const game = gameManager.createGame('host-socket-1', 'Test Game', mockQuestions, mockSettings);
      const host = game.players[0];
      
      expect(host.name).toBe('Host');
      expect(host.socketId).toBe('host-socket-1');
      expect(host.score).toBe(0);
      expect(host.isHost).toBe(true);
      expect(host.isConnected).toBe(true);
    });
  });

  describe('getGame', () => {
    it('should return game by ID', () => {
      const createdGame = gameManager.createGame('host-1', 'Test Game', mockQuestions, mockSettings);
      const retrievedGame = gameManager.getGame(createdGame.id);
      
      expect(retrievedGame).toEqual(createdGame);
    });

    it('should return undefined for non-existent game ID', () => {
      const result = gameManager.getGame('non-existent-id');
      expect(result).toBeUndefined();
    });
  });

  describe('getGameByPin', () => {
    it('should return game by PIN', () => {
      const createdGame = gameManager.createGame('host-1', 'Test Game', mockQuestions, mockSettings);
      const retrievedGame = gameManager.getGameByPin(createdGame.pin);
      
      expect(retrievedGame).toEqual(createdGame);
    });

    it('should return undefined for non-existent PIN', () => {
      const result = gameManager.getGameByPin('999999');
      expect(result).toBeUndefined();
    });
  });

  describe('updateGameStatus', () => {
    it('should update game status', () => {
      const game = gameManager.createGame('host-1', 'Test Game', mockQuestions, mockSettings);
      gameManager.updateGameStatus(game.id, 'started');
      
      const updatedGame = gameManager.getGame(game.id);
      expect(updatedGame?.status).toBe('started');
    });
  });

  describe('getCurrentQuestion', () => {
    it('should return undefined when no question is active', () => {
      const game = gameManager.createGame('host-1', 'Test Game', mockQuestions, mockSettings);
      const currentQuestion = gameManager.getCurrentQuestion(game);
      
      expect(currentQuestion).toBeUndefined();
    });

    it('should return current question when index is valid', () => {
      const game = gameManager.createGame('host-1', 'Test Game', mockQuestions, mockSettings);
      gameManager.updateCurrentQuestion(game.id, 0);
      
      const currentQuestion = gameManager.getCurrentQuestion(game);
      expect(currentQuestion).toEqual(mockQuestions[0]);
    });
  });

  describe('isGameFinished', () => {
    it('should return true when all questions are completed', () => {
      const game = gameManager.createGame('host-1', 'Test Game', mockQuestions, mockSettings);
      gameManager.updateCurrentQuestion(game.id, mockQuestions.length - 1);
      
      expect(gameManager.isGameFinished(game)).toBe(true);
    });

    it('should return false when questions remain', () => {
      const game = gameManager.createGame('host-1', 'Test Game', mockQuestions, mockSettings);
      gameManager.updateCurrentQuestion(game.id, 0);
      
      expect(gameManager.isGameFinished(game)).toBe(false);
    });
  });

  describe('deleteGame', () => {
    it('should remove game from storage', () => {
      const game = gameManager.createGame('host-1', 'Test Game', mockQuestions, mockSettings);
      gameManager.deleteGame(game.id);
      
      expect(gameManager.getGame(game.id)).toBeUndefined();
      expect(gameManager.getGameByPin(game.pin)).toBeUndefined();
    });
  });
}); 