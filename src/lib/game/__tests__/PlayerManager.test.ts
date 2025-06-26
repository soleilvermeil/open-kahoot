import { PlayerManager } from '../PlayerManager';
import type { Game, Player, GameSettings, Question } from '@/types/game';

describe('PlayerManager', () => {
  let playerManager: PlayerManager;
  let mockGame: Game;

  const mockQuestions: Question[] = [
    {
      id: '1',
      question: 'Test question',
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 1,
      timeLimit: 30
    }
  ];

  const mockSettings: GameSettings = {
    thinkTime: 5,
    answerTime: 30
  };

  beforeEach(() => {
    playerManager = new PlayerManager();
    mockGame = {
      id: 'game-1',
      pin: '123456',
      hostId: 'host-1',
      title: 'Test Game',
      questions: mockQuestions,
      settings: mockSettings,
      currentQuestionIndex: -1,
      status: 'waiting',
      players: [{
        id: 'host-1',
        socketId: 'socket-host',
        name: 'Host',
        score: 0,
        isHost: true,
        isConnected: true
      }]
    };
  });

  describe('joinGame', () => {
    it('should allow player to join game in waiting status', () => {
      const result = playerManager.joinGame(mockGame, 'socket-1', 'Player1');
      
      expect(result.success).toBe(true);
      expect(result.game).toBe(mockGame);
      expect(result.playerId).toBeDefined();
      expect(result.isReconnection).toBe(false);
      expect(mockGame.players).toHaveLength(2);
      
      const newPlayer = mockGame.players.find(p => !p.isHost);
      expect(newPlayer?.name).toBe('Player1');
      expect(newPlayer?.socketId).toBe('socket-1');
      expect(newPlayer?.isConnected).toBe(true);
    });

    it('should not allow joining game that has started', () => {
      mockGame.status = 'started';
      const result = playerManager.joinGame(mockGame, 'socket-1', 'Player1');
      
      expect(result.success).toBe(false);
      expect(mockGame.players).toHaveLength(1); // Only host
    });

    it('should not allow duplicate player names', () => {
      playerManager.joinGame(mockGame, 'socket-1', 'Player1');
      const result = playerManager.joinGame(mockGame, 'socket-2', 'Player1');
      
      expect(result.success).toBe(false);
      expect(mockGame.players).toHaveLength(2); // Host + first player only
    });

    it('should allow reconnection with persistent ID', () => {
      // First join
      const firstJoin = playerManager.joinGame(mockGame, 'socket-1', 'Player1');
      const playerId = firstJoin.playerId!;
      
      // Disconnect
      playerManager.disconnectPlayer('socket-1', mockGame);
      
      // Reconnect
      const reconnectResult = playerManager.joinGame(mockGame, 'socket-2', 'Player1', playerId);
      
      expect(reconnectResult.success).toBe(true);
      expect(reconnectResult.isReconnection).toBe(true);
      expect(reconnectResult.playerId).toBe(playerId);
      
      const player = playerManager.getPlayerById(playerId, mockGame);
      expect(player?.socketId).toBe('socket-2');
      expect(player?.isConnected).toBe(true);
    });
  });

  describe('submitAnswer', () => {
    let playerId: string;

    beforeEach(() => {
      const result = playerManager.joinGame(mockGame, 'socket-1', 'Player1');
      playerId = result.playerId!;
      mockGame.currentQuestionIndex = 0;
      mockGame.questionStartTime = Date.now();
    });

    it('should record valid answer', () => {
      const success = playerManager.submitAnswer(mockGame, 'socket-1', 2);
      
      expect(success).toBe(true);
      const player = playerManager.getPlayerBySocketId('socket-1', mockGame);
      expect(player?.currentAnswer).toBe(2);
      expect(player?.answerTime).toBeDefined();
    });

    it('should not allow duplicate answers', () => {
      playerManager.submitAnswer(mockGame, 'socket-1', 2);
      const secondSubmit = playerManager.submitAnswer(mockGame, 'socket-1', 3);
      
      expect(secondSubmit).toBe(false);
      const player = playerManager.getPlayerBySocketId('socket-1', mockGame);
      expect(player?.currentAnswer).toBe(2); // Still the first answer
    });

    it('should not allow host to submit answers', () => {
      const success = playerManager.submitAnswer(mockGame, 'socket-host', 1);
      
      expect(success).toBe(false);
    });

    it('should work with persistent player ID', () => {
      const success = playerManager.submitAnswer(mockGame, playerId, 1, true);
      
      expect(success).toBe(true);
      const player = playerManager.getPlayerById(playerId, mockGame);
      expect(player?.currentAnswer).toBe(1);
    });
  });

  describe('updateScores', () => {
    let playerId1: string;
    let playerId2: string;

    beforeEach(() => {
      const result1 = playerManager.joinGame(mockGame, 'socket-1', 'Player1');
      const result2 = playerManager.joinGame(mockGame, 'socket-2', 'Player2');
      playerId1 = result1.playerId!;
      playerId2 = result2.playerId!;
      
      mockGame.currentQuestionIndex = 0;
      mockGame.questionStartTime = Date.now() - 5000; // 5 seconds ago
      mockGame.settings.answerTime = 30;
    });

    it('should award points for correct answers', () => {
      // Player 1 answers correctly
      playerManager.submitAnswer(mockGame, 'socket-1', 1); // Correct answer
      // Player 2 answers incorrectly
      playerManager.submitAnswer(mockGame, 'socket-2', 0); // Wrong answer
      
      playerManager.updateScores(mockGame, 1); // Correct answer is index 1
      
      const player1 = playerManager.getPlayerById(playerId1, mockGame);
      const player2 = playerManager.getPlayerById(playerId2, mockGame);
      
      expect(player1?.score).toBeGreaterThan(0);
      expect(player2?.score).toBe(0);
    });

    it('should include time bonus for faster answers', () => {
      const now = Date.now();
      mockGame.questionStartTime = now - 1000; // 1 second ago
      
      // Set up two players with correct answers but different response times
      const player1 = mockGame.players.find(p => p.name === 'Player1')!;
      const player2 = mockGame.players.find(p => p.name === 'Player2')!;
      
      player1.currentAnswer = 1;
      player1.answerTime = now - 500; // Answered quickly
      
      player2.currentAnswer = 1;
      player2.answerTime = now - 100; // Answered very quickly
      
      playerManager.updateScores(mockGame, 1);
      
      // Player 2 should have more points due to faster response
      expect(player2.score).toBeGreaterThan(player1.score);
    });
  });

  describe('getLeaderboard', () => {
    beforeEach(() => {
      playerManager.joinGame(mockGame, 'socket-1', 'Player1');
      playerManager.joinGame(mockGame, 'socket-2', 'Player2');
      playerManager.joinGame(mockGame, 'socket-3', 'Player3');
    });

    it('should return players sorted by score', () => {
      // Manually set scores
      const players = mockGame.players.filter(p => !p.isHost);
      players[0].score = 500;
      players[1].score = 1000;
      players[2].score = 250;
      
      const leaderboard = playerManager.getLeaderboard(mockGame);
      
      expect(leaderboard).toHaveLength(3);
      expect(leaderboard[0].score).toBe(1000);
      expect(leaderboard[1].score).toBe(500);
      expect(leaderboard[2].score).toBe(250);
    });

    it('should not include host in leaderboard', () => {
      const leaderboard = playerManager.getLeaderboard(mockGame);
      
      expect(leaderboard.every(p => !p.isHost)).toBe(true);
    });
  });

  describe('disconnectPlayer', () => {
    it('should mark player as disconnected', () => {
      playerManager.joinGame(mockGame, 'socket-1', 'Player1');
      const disconnectedPlayer = playerManager.disconnectPlayer('socket-1', mockGame);
      
      expect(disconnectedPlayer?.isConnected).toBe(false);
      expect(disconnectedPlayer?.name).toBe('Player1');
    });

    it('should return undefined for non-existent socket', () => {
      const result = playerManager.disconnectPlayer('non-existent', mockGame);
      expect(result).toBeUndefined();
    });
  });
}); 