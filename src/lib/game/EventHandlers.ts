import { Server as SocketIOServer, Socket } from 'socket.io';
import type { 
  ServerToClientEvents, 
  ClientToServerEvents,
  Question,
  GameSettings,
  Game
} from '@/types/game';
import { GameManager } from './GameManager';
import { PlayerManager } from './PlayerManager';
import { QuestionManager } from './QuestionManager';
import { TimerManager } from './TimerManager';

export class EventHandlers {
  constructor(
    private io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>,
    private gameManager: GameManager,
    private playerManager: PlayerManager,
    private questionManager: QuestionManager,
    private timerManager: TimerManager
  ) {}

  setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`🔌 [CONNECTION] Player connected: ${socket.id}`);

      socket.on('createGame', (title, questions, settings, callback) => {
        console.log(`📥 [SOCKET_EVENT] Received createGame event from ${socket.id} - title: "${title}", questions: ${questions?.length || 'undefined'}, settings:`, settings);
        this.handleCreateGame(socket, title, questions, settings, callback);
      });

      socket.on('joinGame', (pin, playerName, persistentId, callback) => {
        this.handleJoinGame(socket, pin, playerName, persistentId, callback);
      });

      socket.on('validateGame', (gameId, callback) => {
        this.handleValidateGame(socket, gameId, callback);
      });

      socket.on('startGame', (gameId) => {
        this.handleStartGame(socket, gameId);
      });

      socket.on('submitAnswer', (gameId, questionId, answerIndex, persistentId) => {
        this.handleSubmitAnswer(socket, gameId, questionId, answerIndex, persistentId);
      });

      socket.on('nextQuestion', (gameId) => {
        this.handleNextQuestion(socket, gameId);
      });

      socket.on('showLeaderboard', (gameId) => {
        this.handleShowLeaderboard(socket, gameId);
      });

      socket.on('endGame', (gameId) => {
        this.handleEndGame(socket, gameId);
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  private handleCreateGame(
    socket: Socket,
    title: string,
    questions: Question[],
    settings: GameSettings,
    callback: (game: Game) => void
  ): void {
    console.log(`🎮 [CREATE_GAME] Host ${socket.id} creating game: "${title}" with ${questions.length} questions`);
    
    try {
      const game = this.gameManager.createGame(socket.id, title, questions, settings);
      socket.join(game.id);
      console.log(`✅ [CREATE_GAME] Game created successfully - PIN: ${game.pin}, ID: ${game.id}`);
      callback(game);
    } catch (error) {
      console.error(`❌ [CREATE_GAME] Error creating game:`, error);
      socket.emit('error', 'Failed to create game');
    }
  }

  private handleJoinGame(
    socket: Socket,
    pin: string,
    playerName: string,
    persistentId?: string | ((success: boolean, game?: Game, playerId?: string) => void),
    callback?: (success: boolean, game?: Game, playerId?: string) => void
  ): void {
    // Handle both old and new callback signatures
    const actualCallback = typeof persistentId === 'function' ? persistentId : callback;
    const actualPersistentId = typeof persistentId === 'string' ? persistentId : null;
    
    console.log(`👤 [JOIN_GAME] Player ${socket.id} joining game PIN: ${pin} as "${playerName}" ${actualPersistentId ? `(reconnecting with ID: ${actualPersistentId})` : '(new player)'}`);
    
    try {
      const game = this.gameManager.getGameByPin(pin);
      if (!game) {
        console.log(`❌ [JOIN_GAME] Game not found for PIN: ${pin}`);
        actualCallback?.(false);
        return;
      }

      const result = this.playerManager.joinGame(game, socket.id, playerName, actualPersistentId);
      
      if (result.success && result.game) {
        socket.join(result.game.id);
        const connectedPlayers = this.playerManager.getConnectedPlayers(result.game).length;
        console.log(`✅ [JOIN_GAME] Player "${playerName}" ${result.isReconnection ? 'reconnected to' : 'joined'} game ${pin} (${connectedPlayers} connected players)`);
        
        const player = this.playerManager.getPlayerById(result.playerId!, result.game);
        if (result.isReconnection) {
          this.io.to(result.game.id).emit('playerReconnected', player!);
          // Cancel cleanup timer for reconnected player
          if (actualPersistentId) {
            this.timerManager.clearPlayerCleanupTimer(result.game.id, actualPersistentId);
          }
        } else {
          this.io.to(result.game.id).emit('playerJoined', player!);
        }
      } else {
        console.log(`❌ [JOIN_GAME] Failed to join game PIN: ${pin} - ${game.status !== 'waiting' ? 'Game already started' : 'Unknown error'}`);
      }
      
      actualCallback?.(result.success, result.game, result.playerId);
    } catch (error) {
      console.error(`❌ [JOIN_GAME] Error joining game:`, error);
      actualCallback?.(false);
    }
  }

  private handleValidateGame(
    socket: Socket,
    gameId: string,
    callback: (valid: boolean, game?: Game) => void
  ): void {
    console.log(`🔍 [VALIDATE_GAME] Checking game: ${gameId}`);
    
    try {
      const game = this.gameManager.getGame(gameId);
      const host = game ? this.playerManager.getHost(game) : undefined;
      const hasActiveHost = host?.isConnected ?? false;
      const isValid = !!game && hasActiveHost;
      
      console.log(`${isValid ? '✅' : '❌'} [VALIDATE_GAME] Game ${gameId} validation: ${isValid ? 'VALID' : 'INVALID'} (exists: ${!!game}, active host: ${hasActiveHost})`);
      
      if (isValid) {
        socket.join(game.id);
        console.log(`🏠 [ROOM_JOIN] Socket ${socket.id} joined room ${game.id} during validation`);
        
        // If this is a host connecting and the game is in progress, send current state
        const isHost = host && host.socketId === socket.id;
        if (isHost && game.status === 'question') {
          const currentQuestion = this.questionManager.getCurrentQuestion(game);
          if (currentQuestion) {
            // Check which phase we're currently in by looking at active timers
            const hasThinkingTimer = this.timerManager.hasTimer(game.id, TimerManager.TIMER_TYPES.THINKING_PHASE);
            const hasAnsweringTimer = this.timerManager.hasTimer(game.id, TimerManager.TIMER_TYPES.ANSWERING_PHASE);
            
            if (hasAnsweringTimer && game.questionStartTime) {
              // We're in answering phase - send thinking phase first, then answering after proper delay
              const elapsed = Date.now() - game.questionStartTime;
              const remaining = Math.max(0, game.settings.answerTime - Math.floor(elapsed / 1000));
              if (remaining > 0) {
                console.log(`📤 [SYNC_HOST] Host connecting during answering phase - showing thinking phase first`);
                socket.emit('thinkingPhase', currentQuestion, game.settings.thinkTime);
                // Give enough time for thinking phase to render (2 seconds)
                setTimeout(() => {
                  console.log(`📤 [SYNC_HOST] Now transitioning to answering phase with ${remaining}s remaining`);
                  socket.emit('answeringPhase', remaining);
                }, 2000);
              }
            } else if (hasThinkingTimer) {
              // We're still in thinking phase
              console.log(`📤 [SYNC_HOST] Host connecting during thinking phase - sending current question`);
              socket.emit('thinkingPhase', currentQuestion, game.settings.thinkTime);
            } else {
              // Fallback - send thinking phase
              console.log(`📤 [SYNC_HOST] Host connecting - no active phase timer, defaulting to thinking phase`);
              socket.emit('thinkingPhase', currentQuestion, game.settings.thinkTime);
            }
          }
        }
        
        callback(true, game);
      } else {
        callback(false);
      }
    } catch (error) {
      console.error(`❌ [VALIDATE_GAME] Error validating game:`, error);
      callback(false);
    }
  }

  private handleStartGame(socket: Socket, gameId: string): void {
    console.log(`🚀 [START_GAME] Host ${socket.id} attempting to start game: ${gameId}`);
    
    try {
      const game = this.gameManager.getGame(gameId);
      if (!game) {
        console.log(`❌ [START_GAME] Game not found: ${gameId}`);
        socket.emit('error', 'Game not found');
        return;
      }

      if (!this.playerManager.isHost(socket.id, game)) {
        console.log(`❌ [START_GAME] Not authorized (not host)`);
        socket.emit('error', 'Not authorized');
        return;
      }

      // Ensure host socket is in the game room
      socket.join(game.id);
      console.log(`🏠 [ROOM_JOIN] Host ${socket.id} joined room ${game.id}`);

      const playerCount = this.playerManager.getConnectedPlayers(game).length;
      console.log(`✅ [START_GAME] Starting game ${game.pin} with ${playerCount} players`);
      
      this.startGame(game);
    } catch (error) {
      console.error(`❌ [START_GAME] Error starting game:`, error);
      socket.emit('error', 'Failed to start game');
    }
  }

  private handleSubmitAnswer(
    socket: Socket,
    gameId: string,
    questionId: string,
    answerIndex: number,
    persistentId?: string
  ): void {
    try {
      const game = this.gameManager.getGame(gameId);
      if (!game) {
        console.log(`❌ [SUBMIT_ANSWER] Game not found: ${gameId}`);
        return;
      }

      const player = persistentId 
        ? this.playerManager.getPlayerById(persistentId, game)
        : this.playerManager.getPlayerBySocketId(socket.id, game);

      console.log(`📝 [SUBMIT_ANSWER] Player "${player?.name || 'Unknown'}" (${persistentId || socket.id}) submitting answer ${answerIndex} for question ${questionId}`);

      if (game.status !== 'question') {
        console.log(`❌ [SUBMIT_ANSWER] Rejected - Game status is '${game.status}', expected 'question'`);
        return;
      }

      const success = this.playerManager.submitAnswer(game, persistentId || socket.id, answerIndex, !!persistentId);
      if (success && player) {
        this.io.to(game.id).emit('playerAnswered', player.id);
        
        // Check if all players have answered
        if (this.questionManager.hasAllPlayersAnswered(game)) {
          console.log(`⏰ [ALL_ANSWERED] All players answered, ending question early`);
          this.timerManager.clearTimer(game.id, TimerManager.TIMER_TYPES.ANSWERING_PHASE);
          this.endQuestion(game);
        }
      }
    } catch (error) {
      console.error(`❌ [SUBMIT_ANSWER] Error submitting answer:`, error);
    }
  }

  private handleNextQuestion(socket: Socket, gameId: string): void {
    console.log(`➡️ [NEXT_QUESTION] Host ${socket.id} requesting next question for game: ${gameId}`);
    
    try {
      const game = this.gameManager.getGame(gameId);
      if (!game) {
        console.log(`❌ [NEXT_QUESTION] Game not found: ${gameId}`);
        return;
      }

      if (!this.playerManager.isHost(socket.id, game)) {
        console.log(`❌ [NEXT_QUESTION] Not authorized (not host)`);
        return;
      }

      if (game.status !== 'leaderboard') {
        console.log(`❌ [NEXT_QUESTION] Failed - Game status is '${game.status}', expected 'leaderboard'`);
        return;
      }

      console.log(`✅ [NEXT_QUESTION] Moving to next question (${game.currentQuestionIndex + 2}/${game.questions.length})`);
      this.nextQuestion(game);
    } catch (error) {
      console.error(`❌ [NEXT_QUESTION] Error moving to next question:`, error);
    }
  }

  private handleShowLeaderboard(socket: Socket, gameId: string): void {
    console.log(`🏆 [SHOW_LEADERBOARD] Host ${socket.id} requesting leaderboard for game: ${gameId}`);
    
    try {
      const game = this.gameManager.getGame(gameId);
      if (!game) {
        console.log(`❌ [SHOW_LEADERBOARD] Game not found: ${gameId}`);
        return;
      }

      if (!this.playerManager.isHost(socket.id, game)) {
        console.log(`❌ [SHOW_LEADERBOARD] Not authorized (not host)`);
        return;
      }

      console.log(`✅ [SHOW_LEADERBOARD] Showing leaderboard for game ${game.pin}`);
      this.showLeaderboard(game);
    } catch (error) {
      console.error(`❌ [SHOW_LEADERBOARD] Error showing leaderboard:`, error);
    }
  }

  private handleEndGame(socket: Socket, gameId: string): void {
    console.log(`🏁 [END_GAME] Host ${socket.id} ending game: ${gameId}`);
    
    try {
      const game = this.gameManager.getGame(gameId);
      if (!game) {
        console.log(`❌ [END_GAME] Game not found: ${gameId}`);
        return;
      }

      if (!this.playerManager.isHost(socket.id, game)) {
        console.log(`❌ [END_GAME] Not authorized (not host)`);
        return;
      }

      console.log(`✅ [END_GAME] Ending game ${game.pin}`);
      this.endGame(game);
    } catch (error) {
      console.error(`❌ [END_GAME] Error ending game:`, error);
    }
  }

  private handleDisconnect(socket: Socket): void {
    console.log(`🔌 [DISCONNECT] Player disconnected: ${socket.id}`);
    
    try {
      // Find which game this socket was part of
      for (const game of this.gameManager.getAllGames()) {
        const player = this.playerManager.getPlayerBySocketId(socket.id, game);
        if (player) {
          this.playerManager.disconnectPlayer(socket.id, game);
          this.io.to(game.id).emit('playerDisconnected', player.id);
          
          if (player.isHost) {
            console.log(`⏰ [HOST_DISCONNECT] Host disconnected, starting 30s reconnection timer for game ${game.pin}`);
            this.timerManager.setHostReconnectTimer(game.id, () => {
              console.log(`⏰ [HOST_TIMEOUT] Host failed to reconnect, ending game ${game.pin}`);
              this.endGame(game);
            });
          } else {
            console.log(`⏰ [PLAYER_DISCONNECT] Starting 60s cleanup timer for player ${player.name} in game ${game.pin}`);
            this.timerManager.setPlayerCleanupTimer(game.id, player.id, () => {
              console.log(`⏰ [PLAYER_TIMEOUT] Removing player ${player.name} from game ${game.pin}`);
              this.playerManager.removePlayer(player.id, game);
              this.io.to(game.id).emit('playerLeft', player.id);
            });
          }
          break;
        }
      }
    } catch (error) {
      console.error(`❌ [DISCONNECT] Error handling disconnect:`, error);
    }
  }

  // Game flow methods (these will use the modular services)
  private startGame(game: Game): void {
    this.gameManager.updateGameStatus(game.id, 'started');
    this.io.to(game.id).emit('gameStarted', game);
    this.nextQuestion(game);
  }

  private nextQuestion(game: Game): void {
    const question = this.questionManager.startNextQuestion(game);
    if (!question) {
      this.endGame(game);
      return;
    }

    this.playerManager.clearAnswers(game);
    this.gameManager.setPhaseStartTime(game.id, Date.now());
    
    console.log(`📤 [EMIT_THINKING_PHASE] Emitting thinkingPhase to room ${game.id} with question: "${question.question}"`);
    this.io.to(game.id).emit('thinkingPhase', question, game.settings.thinkTime);
    
    this.timerManager.setThinkingPhaseTimer(game.id, () => {
      this.startAnsweringPhase(game);
    }, game.settings.thinkTime);
  }

  private startAnsweringPhase(game: Game): void {
    this.gameManager.setQuestionStartTime(game.id, Date.now());
    this.io.to(game.id).emit('answeringPhase', game.settings.answerTime);
    
    this.timerManager.setAnsweringPhaseTimer(game.id, () => {
      this.endQuestion(game);
    }, game.settings.answerTime);
  }

  private endQuestion(game: Game): void {
    const currentQuestion = this.questionManager.getCurrentQuestion(game);
    if (!currentQuestion) return;

    this.playerManager.updateScores(game, currentQuestion.correctAnswer);
    
    const stats = this.questionManager.getQuestionStats(game);
    if (stats) {
      this.io.to(game.id).emit('questionEnded', stats);
      
      // Send personal results
      game.players.forEach((player: import('@/types/game').Player) => {
        if (!player.isHost) {
          const personalResult = this.questionManager.getPersonalResult(game, player.id);
          if (personalResult) {
            this.io.to(player.socketId).emit('personalResult', personalResult);
          }
        }
      });
    }
  }

  private showLeaderboard(game: Game): void {
    this.gameManager.updateGameStatus(game.id, 'leaderboard');
    const leaderboard = this.playerManager.getLeaderboard(game);
    this.io.to(game.id).emit('leaderboardShown', leaderboard);
  }

  private endGame(game: Game): void {
    this.gameManager.updateGameStatus(game.id, 'finished');
    this.timerManager.clearAllTimers(game.id);
    
    const finalResults = this.playerManager.getFinalResults(game);
    this.io.to(game.id).emit('gameFinished', finalResults);
    
    // Clean up game after a delay
    setTimeout(() => {
      this.gameManager.deleteGame(game.id);
    }, 30000);
  }
} 