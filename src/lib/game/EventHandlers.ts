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
import { GameplayLoop } from './GameplayLoop';

export class EventHandlers {
  constructor(
    private io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>,
    private gameManager: GameManager,
    private playerManager: PlayerManager,
    private questionManager: QuestionManager,
    private gameplayLoop: GameplayLoop
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

      socket.on('downloadGameLogs', (gameId) => {
        this.handleDownloadGameLogs(socket, gameId);
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
        
        // Check if this is a host or player
        const isHost = host && host.socketId === socket.id;
        
        // Sync to current game phase if game loop is active
        if (game.gameLoopActive) {
          this.gameplayLoop.syncPlayerToCurrentPhase(game, socket.id, !!isHost);
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
      
      // Start the gameplay loop
      this.io.to(game.id).emit('gameStarted', game);
      this.gameplayLoop.startGameLoop(game);
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

      if (game.phase !== 'answering') {
        console.log(`❌ [SUBMIT_ANSWER] Rejected - Game phase is '${game.phase}', expected 'answering'`);
        return;
      }

      const success = this.playerManager.submitAnswer(game, persistentId || socket.id, answerIndex, !!persistentId);
      if (success && player) {
        this.io.to(game.id).emit('playerAnswered', player.id);
        
        // Notify gameplay loop that a player answered (might trigger early phase transition)
        this.gameplayLoop.onPlayerAnswered(game);
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

      if (game.phase !== 'leaderboard') {
        console.log(`❌ [NEXT_QUESTION] Failed - Game phase is '${game.phase}', expected 'leaderboard'`);
        return;
      }

      console.log(`✅ [NEXT_QUESTION] Moving to next question (${game.currentQuestionIndex + 1}/${game.questions.length})`);
      this.gameplayLoop.transitionToPhase(game, 'preparation');
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

      console.log(`✅ [SHOW_LEADERBOARD] Transitioning to leaderboard for game ${game.pin}`);
      this.gameplayLoop.transitionToPhase(game, 'leaderboard');
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
      this.gameplayLoop.transitionToPhase(game, 'finished');
    } catch (error) {
      console.error(`❌ [END_GAME] Error ending game:`, error);
    }
  }

  private handleDownloadGameLogs(socket: Socket, gameId: string): void {
    console.log(`📄 [DOWNLOAD_LOGS] Host ${socket.id} requesting game logs for: ${gameId}`);
    
    try {
      const game = this.gameManager.getGame(gameId);
      if (!game) {
        console.log(`❌ [DOWNLOAD_LOGS] Game not found: ${gameId}`);
        socket.emit('error', 'Game not found');
        return;
      }

      if (!this.playerManager.isHost(socket.id, game)) {
        console.log(`❌ [DOWNLOAD_LOGS] Not authorized (not host)`);
        socket.emit('error', 'Not authorized');
        return;
      }

      if (game.phase !== 'finished') {
        console.log(`❌ [DOWNLOAD_LOGS] Game not finished yet (current phase: ${game.phase})`);
        socket.emit('error', 'Game must be finished to download logs');
        return;
      }

      const tsvData = this.playerManager.generateGameLogsTSV(game);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `game-${game.pin}-logs-${timestamp}.tsv`;
      
      console.log(`✅ [DOWNLOAD_LOGS] Sending logs for game ${game.pin} (${game.answerHistory.length} answer records)`);
      socket.emit('gameLogs', tsvData, filename);
    } catch (error) {
      console.error(`❌ [DOWNLOAD_LOGS] Error generating logs:`, error);
      socket.emit('error', 'Failed to generate logs');
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
            console.log(`🏁 [HOST_DISCONNECT] Host disconnected, ending game ${game.pin} immediately`);
            this.gameplayLoop.transitionToPhase(game, 'finished');
          } else {
            console.log(`👋 [PLAYER_DISCONNECT] Player ${player.name} disconnected from game ${game.pin}`);
            // Note: We could implement reconnection logic here if needed
          }
          break;
        }
      }
    } catch (error) {
      console.error(`❌ [DISCONNECT] Error handling disconnect:`, error);
    }
  }
} 