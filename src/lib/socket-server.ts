import { Server as SocketIOServer } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import type { 
  Game, 
  Player, 
  Question, 
  GameStats,
  GameSettings,
  ServerToClientEvents,
  ClientToServerEvents 
} from '@/types/game';

export class GameServer {
  private io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>;
  private games: Map<string, Game> = new Map();
  private gamesByPin: Map<string, string> = new Map(); // pin -> gameId

  constructor(io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>) {
    this.io = io;
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Player connected:', socket.id);

      socket.on('createGame', (title, questions, settings, callback) => {
        const game = this.createGame(socket.id, title, questions, settings);
        socket.join(game.id);
        callback(game);
      });

      socket.on('joinGame', (pin, playerName, callback) => {
        const result = this.joinGame(socket.id, pin, playerName);
        if (result.success && result.game) {
          socket.join(result.game.id);
          this.io.to(result.game.id).emit('playerJoined', 
            result.game.players.find(p => p.id === socket.id)!
          );
        }
        callback(result.success, result.game);
      });

      socket.on('startGame', (gameId) => {
        const game = this.games.get(gameId);
        if (game && this.isHost(socket.id, game)) {
          this.startGame(game);
        }
      });

      socket.on('submitAnswer', (gameId, questionId, answerIndex) => {
        const game = this.games.get(gameId);
        if (game && game.status === 'question') {
          this.submitAnswer(socket.id, game, questionId, answerIndex);
        }
      });

      socket.on('nextQuestion', (gameId) => {
        const game = this.games.get(gameId);
        if (game && this.isHost(socket.id, game)) {
          this.nextQuestion(game);
        }
      });

      socket.on('endGame', (gameId) => {
        const game = this.games.get(gameId);
        if (game && this.isHost(socket.id, game)) {
          this.endGame(game);
        }
      });

      socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        this.handleDisconnect(socket.id);
      });
    });
  }

  private createGame(hostId: string, title: string, questions: Question[], settings: GameSettings): Game {
    const gameId = uuidv4();
    const pin = this.generatePin();
    
    const game: Game = {
      id: gameId,
      pin,
      hostId,
      title,
      questions,
      settings,
      currentQuestionIndex: -1,
      status: 'waiting',
      players: [{
        id: hostId,
        name: 'Host',
        score: 0,
        isHost: true
      }]
    };

    this.games.set(gameId, game);
    this.gamesByPin.set(pin, gameId);
    
    return game;
  }

  private joinGame(playerId: string, pin: string, playerName: string): { success: boolean; game?: Game } {
    const gameId = this.gamesByPin.get(pin);
    if (!gameId) {
      return { success: false };
    }

    const game = this.games.get(gameId);
    if (!game || game.status !== 'waiting') {
      return { success: false };
    }

    // Check if player already exists
    const existingPlayer = game.players.find(p => p.id === playerId);
    if (existingPlayer) {
      return { success: true, game };
    }

    const player: Player = {
      id: playerId,
      name: playerName,
      score: 0,
      isHost: false
    };

    game.players.push(player);
    return { success: true, game };
  }

  private startGame(game: Game) {
    game.status = 'started';
    this.io.to(game.id).emit('gameStarted', game);
    
    // Start first question after a short delay
    setTimeout(() => {
      this.nextQuestion(game);
    }, 2000);
  }

  private nextQuestion(game: Game) {
    game.currentQuestionIndex++;
    
    if (game.currentQuestionIndex >= game.questions.length) {
      this.endGame(game);
      return;
    }

    const question = game.questions[game.currentQuestionIndex];
    game.status = 'question';
    game.questionStartTime = Date.now();

    // Reset player answers
    game.players.forEach(player => {
      player.currentAnswer = undefined;
      player.answerTime = undefined;
    });

    this.io.to(game.id).emit('questionStarted', question, question.timeLimit);

    // Auto-end question after time limit
    setTimeout(() => {
      if (game.status === 'question') {
        this.endQuestion(game);
      }
    }, question.timeLimit * 1000);
  }

  private submitAnswer(playerId: string, game: Game, questionId: string, answerIndex: number) {
    const player = game.players.find(p => p.id === playerId);
    const question = game.questions[game.currentQuestionIndex];
    
    if (!player || !question || question.id !== questionId || player.currentAnswer !== undefined) {
      return;
    }

    const answerTime = Date.now() - (game.questionStartTime || 0);
    player.currentAnswer = answerIndex;
    player.answerTime = answerTime;

    // Calculate score (more points for correct answers and faster responses)
    if (answerIndex === question.correctAnswer) {
      const timeBonus = Math.max(0, (question.timeLimit * 1000 - answerTime) / 1000);
      const points = Math.round(1000 + (timeBonus * 10));
      player.score += points;
    }

    this.io.to(game.id).emit('playerAnswered', playerId);

    // Check if all players have answered
    const answeredPlayers = game.players.filter(p => !p.isHost && p.currentAnswer !== undefined);
    const totalPlayers = game.players.filter(p => !p.isHost);
    
    if (answeredPlayers.length === totalPlayers.length && totalPlayers.length > 0) {
      this.endQuestion(game);
    }
  }

  private endQuestion(game: Game) {
    game.status = 'results';
    const question = game.questions[game.currentQuestionIndex];
    const nonHostPlayers = game.players.filter(p => !p.isHost);
    
    // Calculate answer statistics
    const answerCounts = [0, 0, 0, 0];
    nonHostPlayers.forEach(player => {
      if (player.currentAnswer !== undefined) {
        answerCounts[player.currentAnswer]++;
      }
    });

    const stats: GameStats = {
      question,
      answers: answerCounts.map((count, index) => ({
        optionIndex: index,
        count,
        percentage: nonHostPlayers.length > 0 ? Math.round((count / nonHostPlayers.length) * 100) : 0
      })),
      correctAnswers: answerCounts[question.correctAnswer],
      totalPlayers: nonHostPlayers.length
    };

    // Send general stats to host
    this.io.to(game.id).emit('questionEnded', stats);

    // Send personalized results to each player
    nonHostPlayers.forEach(player => {
      const wasCorrect = player.currentAnswer === question.correctAnswer;
      let pointsEarned = 0;
      
      if (wasCorrect && player.answerTime) {
        const timeBonus = Math.max(0, (question.timeLimit * 1000 - player.answerTime) / 1000);
        pointsEarned = Math.round(1000 + (timeBonus * 10));
      }

      // Calculate position and points behind next player
      const sortedPlayers = [...nonHostPlayers].sort((a, b) => b.score - a.score);
      const playerPosition = sortedPlayers.findIndex(p => p.id === player.id);
      const nextPlayer = sortedPlayers[playerPosition - 1];
      const pointsBehind = nextPlayer ? nextPlayer.score - player.score : 0;

      const personalResult = {
        wasCorrect,
        pointsEarned,
        totalScore: player.score,
        position: playerPosition + 1,
        pointsBehind,
        nextPlayerName: nextPlayer?.name || null
      };

      this.io.to(player.id).emit('personalResult', personalResult);
    });
  }

  private endGame(game: Game) {
    game.status = 'finished';
    const finalScores = game.players
      .filter(p => !p.isHost)
      .sort((a, b) => b.score - a.score);
    
    this.io.to(game.id).emit('gameFinished', finalScores);
    
    // Clean up game after 5 minutes
    setTimeout(() => {
      this.gamesByPin.delete(game.pin);
      this.games.delete(game.id);
    }, 5 * 60 * 1000);
  }

  private handleDisconnect(playerId: string) {
    for (const [gameId, game] of this.games) {
      const playerIndex = game.players.findIndex(p => p.id === playerId);
      if (playerIndex !== -1) {
        const player = game.players[playerIndex];
        
        if (player.isHost) {
          // If host disconnects, end the game
          this.endGame(game);
        } else {
          // Remove player from game
          game.players.splice(playerIndex, 1);
          this.io.to(gameId).emit('playerLeft', playerId);
        }
        break;
      }
    }
  }

  private isHost(playerId: string, game: Game): boolean {
    return game.hostId === playerId;
  }

  private generatePin(): string {
    let pin;
    do {
      pin = Math.floor(100000 + Math.random() * 900000).toString();
    } while (this.gamesByPin.has(pin));
    return pin;
  }
} 