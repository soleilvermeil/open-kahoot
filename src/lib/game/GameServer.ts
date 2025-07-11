import { Server as SocketIOServer } from 'socket.io';
import type { 
  ServerToClientEvents,
  ClientToServerEvents 
} from '@/types/game';
import { GameManager } from './GameManager';
import { PlayerManager } from './PlayerManager';
import { QuestionManager } from './QuestionManager';
import { TimerManager } from './TimerManager';
import { GameplayLoop } from './GameplayLoop';
import { EventHandlers } from './EventHandlers';

export class GameServer {
  private io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>;
  private gameManager: GameManager;
  private playerManager: PlayerManager;
  private questionManager: QuestionManager;
  private timerManager: TimerManager;
  private gameplayLoop: GameplayLoop;
  private eventHandlers: EventHandlers;

  constructor(io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>) {
    this.io = io;
    
    // Initialize all managers
    this.gameManager = new GameManager();
    this.playerManager = new PlayerManager();
    this.questionManager = new QuestionManager();
    this.timerManager = new TimerManager();
    
    // Initialize gameplay loop
    this.gameplayLoop = new GameplayLoop(
      this.io,
      this.gameManager,
      this.playerManager,
      this.questionManager,
      this.timerManager
    );
    
    // Initialize event handlers with all the managers
    this.eventHandlers = new EventHandlers(
      this.io,
      this.gameManager,
      this.playerManager,
      this.questionManager,
      this.gameplayLoop
    );
    
    // Set up event handling
    this.eventHandlers.setupEventHandlers();
    
    // Removed console.log
  }

  // Public API methods for external access if needed
  getGameManager(): GameManager {
    return this.gameManager;
  }

  getPlayerManager(): PlayerManager {
    return this.playerManager;
  }

  getQuestionManager(): QuestionManager {
    return this.questionManager;
  }

  getTimerManager(): TimerManager {
    return this.timerManager;
  }

  getGameplayLoop(): GameplayLoop {
    return this.gameplayLoop;
  }

  // Debug and monitoring methods
  getStats() {
    return {
      totalGames: this.gameManager.getGameCount(),
      games: this.gameManager.getAllGames().map(game => ({
        id: game.id,
        pin: game.pin,
        status: game.status,
        phase: game.phase,
        gameLoopActive: game.gameLoopActive,
        playerCount: this.playerManager.getConnectedPlayers(game).length + 1, // +1 for host
        currentQuestion: game.currentQuestionIndex + 1,
        totalQuestions: game.questions.length
      }))
    };
  }

  // Graceful shutdown
  shutdown(): void {
    // Removed console.log
    
    // Stop all gameplay loops and clear all timers
    this.gameManager.getAllGames().forEach(game => {
      this.gameplayLoop.stopGameLoop(game.id);
      this.timerManager.clearAllTimers(game.id);
    });
    
    // Removed console.log
  }
} 