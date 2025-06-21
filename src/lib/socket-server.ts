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
      console.log(`🔌 [CONNECTION] Player connected: ${socket.id}`);

      socket.on('createGame', (title, questions, settings, callback) => {
        console.log(`🎮 [CREATE_GAME] Host ${socket.id} creating game: "${title}" with ${questions.length} questions`);
        const game = this.createGame(socket.id, title, questions, settings);
        socket.join(game.id);
        console.log(`✅ [CREATE_GAME] Game created successfully - PIN: ${game.pin}, ID: ${game.id}`);
        callback(game);
      });

      socket.on('joinGame', (pin, playerName, persistentId, callback) => {
        // Handle both old and new callback signatures
        const actualCallback = typeof persistentId === 'function' ? persistentId : callback;
        const actualPersistentId = typeof persistentId === 'string' ? persistentId : null;
        
        console.log(`👤 [JOIN_GAME] Player ${socket.id} joining game PIN: ${pin} as "${playerName}" ${actualPersistentId ? `(reconnecting with ID: ${actualPersistentId})` : '(new player)'}`);
        
        const result = this.joinGame(socket.id, pin, playerName, actualPersistentId);
        if (result.success && result.game) {
          socket.join(result.game.id);
          const connectedPlayers = result.game.players.filter(p => !p.isHost && p.isConnected).length;
          console.log(`✅ [JOIN_GAME] Player "${playerName}" ${result.isReconnection ? 'reconnected to' : 'joined'} game ${pin} (${connectedPlayers} connected players)`);
          
          const player = result.game.players.find(p => p.id === result.playerId);
          if (result.isReconnection) {
            this.io.to(result.game.id).emit('playerReconnected', player!);
          } else {
            this.io.to(result.game.id).emit('playerJoined', player!);
          }
        } else {
          console.log(`❌ [JOIN_GAME] Failed to join game PIN: ${pin} - ${!this.gamesByPin.has(pin) ? 'Game not found' : result.game?.status !== 'waiting' ? 'Game already started' : 'Unknown error'}`);
        }
        
        if (actualCallback) {
          actualCallback(result.success, result.game, result.playerId);
        }
      });

      socket.on('validateGame', (gameId, callback) => {
        console.log(`🔍 [VALIDATE_GAME] Checking game: ${gameId}`);
        const game = this.games.get(gameId);
        const hasActiveHost = game?.players.some(p => p.isHost && p.isConnected);
        const isValid = !!game && !!hasActiveHost;
        console.log(`${isValid ? '✅' : '❌'} [VALIDATE_GAME] Game ${gameId} validation: ${isValid ? 'VALID' : 'INVALID'} (exists: ${!!game}, active host: ${!!hasActiveHost})`);
        if (isValid) {
          socket.join(game.id);
          callback(true, game);
        } else {
          callback(false);
        }
      });

      socket.on('startGame', (gameId) => {
        console.log(`🚀 [START_GAME] Host ${socket.id} attempting to start game: ${gameId}`);
        const game = this.games.get(gameId);
        if (game && this.isHost(socket.id, game)) {
          const playerCount = game.players.filter(p => !p.isHost && p.isConnected).length;
          console.log(`✅ [START_GAME] Starting game ${game.pin} with ${playerCount} players`);
          this.startGame(game);
        } else {
          console.log(`❌ [START_GAME] Failed to start game - ${!game ? 'Game not found' : 'Not authorized (not host)'}`);
        }
      });

      socket.on('submitAnswer', (gameId, questionId, answerIndex, persistentId) => {
        const game = this.games.get(gameId);
        // Try to find player by persistent ID first, then fall back to socket ID
        const player = persistentId 
          ? game?.players.find(p => p.id === persistentId)
          : game?.players.find(p => p.socketId === socket.id);
        console.log(`📝 [SUBMIT_ANSWER] Player "${player?.name || 'Unknown'}" (${persistentId || socket.id}) submitting answer ${answerIndex} for question ${questionId}`);
        if (game && game.status === 'question') {
          this.submitAnswer(persistentId || socket.id, game, questionId, answerIndex, !!persistentId);
        } else {
          console.log(`❌ [SUBMIT_ANSWER] Rejected - ${!game ? 'Game not found' : `Game status is '${game.status}', expected 'question'`}`);
        }
      });

      socket.on('nextQuestion', (gameId) => {
        console.log(`➡️ [NEXT_QUESTION] Host ${socket.id} requesting next question for game: ${gameId}`);
        const game = this.games.get(gameId);
        if (game && this.isHost(socket.id, game)) {
          if (game.status === 'leaderboard') {
            console.log(`✅ [NEXT_QUESTION] Moving to next question (${game.currentQuestionIndex + 2}/${game.questions.length})`);
            this.nextQuestion(game);
          } else {
            console.log(`❌ [NEXT_QUESTION] Failed - Game status is '${game.status}', expected 'leaderboard'`);
          }
        } else {
          console.log(`❌ [NEXT_QUESTION] Failed - ${!game ? 'Game not found' : 'Not authorized (not host)'}`);
        }
      });

      socket.on('showLeaderboard', (gameId) => {
        console.log(`🏆 [SHOW_LEADERBOARD] Host ${socket.id} requesting leaderboard for game: ${gameId}`);
        const game = this.games.get(gameId);
        if (game && this.isHost(socket.id, game)) {
          console.log(`✅ [SHOW_LEADERBOARD] Showing leaderboard for game ${game.pin}`);
          this.showLeaderboard(game);
        } else {
          console.log(`❌ [SHOW_LEADERBOARD] Failed - ${!game ? 'Game not found' : 'Not authorized (not host)'}`);
        }
      });

      socket.on('endGame', (gameId) => {
        console.log(`🏁 [END_GAME] Host ${socket.id} ending game: ${gameId}`);
        const game = this.games.get(gameId);
        if (game && this.isHost(socket.id, game)) {
          console.log(`✅ [END_GAME] Ending game ${game.pin}`);
          this.endGame(game);
        } else {
          console.log(`❌ [END_GAME] Failed - ${!game ? 'Game not found' : 'Not authorized (not host)'}`);
        }
      });

      socket.on('disconnect', () => {
        console.log(`🔌 [DISCONNECT] Player disconnected: ${socket.id}`);
        this.handleDisconnect(socket.id);
      });
    });
  }

  private createGame(hostSocketId: string, title: string, questions: Question[], settings: GameSettings): Game {
    const gameId = uuidv4();
    const hostId = uuidv4(); // Generate persistent ID for host
    const pin = this.generatePin();
    
    const game: Game = {
      id: gameId,
      pin,
      hostId: hostId, // Use persistent ID
      title,
      questions,
      settings,
      currentQuestionIndex: -1,
      status: 'waiting',
      players: [{
        id: hostId,
        socketId: hostSocketId,
        name: 'Host',
        score: 0,
        isHost: true,
        isConnected: true
      }]
    };

    this.games.set(gameId, game);
    this.gamesByPin.set(pin, gameId);
    
    return game;
  }

  private joinGame(socketId: string, pin: string, playerName: string, persistentId: string | null = null): { success: boolean; game?: Game; playerId?: string; isReconnection?: boolean } {
    const gameId = this.gamesByPin.get(pin);
    if (!gameId) {
      return { success: false };
    }

    const game = this.games.get(gameId);
    if (!game) {
      return { success: false };
    }

    // Check if this is a reconnection (player with persistent ID already exists)
    if (persistentId) {
      const existingPlayer = game.players.find(p => p.id === persistentId);
      if (existingPlayer) {
        // Reconnection: update socket ID and connection status
        existingPlayer.socketId = socketId;
        existingPlayer.isConnected = true;
        console.log(`Player ${existingPlayer.name} reconnected to game ${game.pin}`);
        return { success: true, game, playerId: persistentId, isReconnection: true };
      }
    }

    // For new joins, only allow during waiting phase
    if (game.status !== 'waiting') {
      return { success: false };
    }

    // Generate new persistent ID if not provided
    const playerId = persistentId || uuidv4();

    const player: Player = {
      id: playerId,
      socketId: socketId,
      name: playerName,
      score: 0,
      isHost: false,
      isConnected: true
    };

    game.players.push(player);
    console.log(`New player ${playerName} joined game ${game.pin}`);
    return { success: true, game, playerId: playerId, isReconnection: false };
  }

  private startGame(game: Game) {
    console.log(`🎯 [GAME_START] Game ${game.pin} starting with ${game.players.filter(p => !p.isHost && p.isConnected).length} players`);
    game.status = 'started';
    this.io.to(game.id).emit('gameStarted', game);
    
    // Start first question after a short delay
    setTimeout(() => {
      console.log(`⏰ [GAME_START] Starting first question for game ${game.pin} after 2s delay`);
      this.nextQuestion(game);
    }, 2000);
  }

  private nextQuestion(game: Game) {
    game.currentQuestionIndex++;
    
    if (game.currentQuestionIndex >= game.questions.length) {
      console.log(`🏁 [NEXT_QUESTION] No more questions, ending game ${game.pin}`);
      this.endGame(game);
      return;
    }

    const question = game.questions[game.currentQuestionIndex];
    console.log(`❓ [NEXT_QUESTION] Starting question ${game.currentQuestionIndex + 1}/${game.questions.length} for game ${game.pin}: "${question.question}" (${question.timeLimit}s)`);
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
        console.log(`⏰ [QUESTION_TIMEOUT] Question ${game.currentQuestionIndex + 1} timed out for game ${game.pin}`);
        this.endQuestion(game);
      }
    }, question.timeLimit * 1000);
  }

  private submitAnswer(playerId: string, game: Game, questionId: string, answerIndex: number, isPersistentId: boolean = false) {
    // Find player by persistent ID or socket ID
    const player = isPersistentId 
      ? game.players.find(p => p.id === playerId)
      : game.players.find(p => p.socketId === playerId);
    const question = game.questions[game.currentQuestionIndex];
    
    if (!player || !question || question.id !== questionId || player.currentAnswer !== undefined) {
      console.log(`❌ [SUBMIT_ANSWER] Rejected answer from ${playerId} - ${!player ? 'Player not found' : !question ? 'Question not found' : question.id !== questionId ? 'Wrong question ID' : 'Already answered'}`);
      return;
    }

    const answerTime = Date.now() - (game.questionStartTime || 0);
    player.currentAnswer = answerIndex;
    player.answerTime = answerTime;

    // Calculate score (more points for correct answers and faster responses)
    const isCorrect = answerIndex === question.correctAnswer;
    let pointsEarned = 0;
    if (isCorrect) {
      const timeBonus = Math.max(0, (question.timeLimit * 1000 - answerTime) / 1000);
      pointsEarned = Math.round(1000 + (timeBonus * 10));
      player.score += pointsEarned;
    }

    console.log(`✅ [SUBMIT_ANSWER] Player "${player.name}" answered ${answerIndex} (${isCorrect ? 'CORRECT' : 'WRONG'}) in ${Math.round(answerTime)}ms, earned ${pointsEarned} points (total: ${player.score})`);

    this.io.to(game.id).emit('playerAnswered', player.id);

    // Check if all connected players have answered
    const connectedPlayers = game.players.filter(p => !p.isHost && p.isConnected);
    const answeredPlayers = connectedPlayers.filter(p => p.currentAnswer !== undefined);
    
    // Debug logging to understand the state
    const allPlayers = game.players.filter(p => !p.isHost);
    console.log(`📊 [ANSWER_CHECK] Game ${game.pin} player status:`);
    allPlayers.forEach(p => {
      console.log(`  - ${p.name}: connected=${p.isConnected}, answered=${p.currentAnswer !== undefined}, socketId=${p.socketId}`);
    });
    console.log(`📊 [ANSWER_CHECK] Game ${game.pin}: ${answeredPlayers.length}/${connectedPlayers.length} connected players have answered (${allPlayers.length} total players)`);
    
    if (answeredPlayers.length === connectedPlayers.length && connectedPlayers.length > 0) {
      console.log(`🎯 [ALL_ANSWERED] All connected players answered, ending question early for game ${game.pin}`);
      this.endQuestion(game);
    }
  }

  private endQuestion(game: Game) {
    console.log(`📊 [END_QUESTION] Ending question ${game.currentQuestionIndex + 1} for game ${game.pin}`);
    game.status = 'results';
    const question = game.questions[game.currentQuestionIndex];
    const nonHostPlayers = game.players.filter(p => !p.isHost);
    const connectedPlayers = nonHostPlayers.filter(p => p.isConnected);
    const answeredPlayers = nonHostPlayers.filter(p => p.currentAnswer !== undefined);
    
    console.log(`📈 [QUESTION_STATS] Game ${game.pin}: ${answeredPlayers.length}/${connectedPlayers.length} connected players answered (${nonHostPlayers.length - connectedPlayers.length} disconnected)`);
    
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

    console.log(`📊 [ANSWER_BREAKDOWN] Game ${game.pin}: [${answerCounts.join(', ')}] (correct answer: ${question.correctAnswer}, ${stats.correctAnswers} got it right)`);

    // Send general stats to host
    this.io.to(game.id).emit('questionEnded', stats);

    // Send personalized results to each player
    let personalResultsSent = 0;
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

      if (player.isConnected && player.socketId) {
        this.io.to(player.socketId).emit('personalResult', personalResult);
        personalResultsSent++;
      }
    });
    
    console.log(`📤 [PERSONAL_RESULTS] Sent personal results to ${personalResultsSent}/${connectedPlayers.length} connected players for game ${game.pin}`);
  }

  private showLeaderboard(game: Game) {
    console.log(`🏆 [SHOW_LEADERBOARD] Showing leaderboard for game ${game.pin}`);
    game.status = 'leaderboard';
    
    // Get current leaderboard (sorted by score)
    const leaderboard = game.players
      .filter(p => !p.isHost)
      .sort((a, b) => b.score - a.score);
    
    console.log(`📊 [LEADERBOARD] Current standings for game ${game.pin}:`);
    leaderboard.forEach((player, index) => {
      console.log(`  ${index + 1}. ${player.name}: ${player.score} points`);
    });
    
    this.io.to(game.id).emit('leaderboardShown', leaderboard);
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

  private handleDisconnect(socketId: string) {
    // Find player by socket ID and mark as disconnected
    for (const [gameId, game] of this.games) {
      const player = game.players.find(p => p.socketId === socketId);
      if (player) {
        player.isConnected = false;
        console.log(`💔 [PLAYER_DISCONNECT] Player "${player.name}" (${player.isHost ? 'HOST' : 'PLAYER'}) disconnected from game ${game.pin}`);
        
        if (player.isHost) {
          // If host disconnects, notify players but keep game alive for a while
          console.log(`⚠️ [HOST_DISCONNECT] Host disconnected from game ${game.pin}, giving 2 minutes to reconnect`);
          this.io.to(gameId).emit('playerDisconnected', player.id);
          
          // Give host 2 minutes to reconnect, then end game
          setTimeout(() => {
            const currentPlayer = game.players.find(p => p.id === player.id);
            if (currentPlayer && !currentPlayer.isConnected) {
              console.log(`💀 [HOST_TIMEOUT] Host didn't reconnect within 2 minutes, ending game ${game.pin}`);
              this.endGame(game);
            } else {
              console.log(`✅ [HOST_RECONNECT] Host reconnected to game ${game.pin} within timeout`);
            }
          }, 120000); // 2 minutes
        } else {
          // Regular player disconnected
          const connectedPlayers = game.players.filter(p => !p.isHost && p.isConnected).length;
          console.log(`👋 [PLAYER_DISCONNECT] Regular player disconnected, ${connectedPlayers} players still connected to game ${game.pin}`);
          console.log(`🔍 [DISCONNECT_DEBUG] Game ${game.pin} status: ${game.status}, current question: ${game.currentQuestionIndex + 1}`);
          this.io.to(gameId).emit('playerDisconnected', player.id);
          
          // Remove player after 5 minutes if they don't reconnect
          setTimeout(() => {
            const currentPlayer = game.players.find(p => p.id === player.id);
            if (currentPlayer && !currentPlayer.isConnected) {
              const playerIndex = game.players.findIndex(p => p.id === player.id);
              if (playerIndex !== -1) {
                game.players.splice(playerIndex, 1);
                this.io.to(gameId).emit('playerLeft', player.id);
                console.log(`🗑️ [PLAYER_CLEANUP] Removed inactive player "${player.name}" from game ${game.pin} after 5 minutes`);
              }
            } else {
              console.log(`✅ [PLAYER_RECONNECT] Player "${player.name}" reconnected to game ${game.pin} within timeout`);
            }
          }, 300000); // 5 minutes
        }
        break;
      }
    }
  }

  private isHost(socketId: string, game: Game): boolean {
    // Find player by socket ID and check if they are the host
    const player = game.players.find(p => p.socketId === socketId);
    return player ? player.isHost : false;
  }

  private generatePin(): string {
    let pin;
    do {
      pin = Math.floor(100000 + Math.random() * 900000).toString();
    } while (this.gamesByPin.has(pin));
    return pin;
  }
} 