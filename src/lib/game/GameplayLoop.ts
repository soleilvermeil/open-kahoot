import { Server as SocketIOServer } from 'socket.io';
import type { 
  ServerToClientEvents, 
  ClientToServerEvents,
  Game,
  GamePhase
} from '@/types/game';
import { GameManager } from './GameManager';
import { PlayerManager } from './PlayerManager';
import { QuestionManager } from './QuestionManager';
import { TimerManager } from './TimerManager';

export class GameplayLoop {
  private phaseCallbacks: Map<string, (() => void) | null> = new Map();

  constructor(
    private io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>,
    private gameManager: GameManager,
    private playerManager: PlayerManager,
    private questionManager: QuestionManager,
    private timerManager: TimerManager
  ) {}

  /**
   * Starts the gameplay loop for a game
   */
  startGameLoop(game: Game): void {
    if (game.gameLoopActive) {
      console.log(`⚠️ [GAMEPLAY_LOOP] Loop already active for game ${game.pin}`);
      return;
    }

    console.log(`🎮 [GAMEPLAY_LOOP] Starting gameplay loop for game ${game.pin}`);
    this.gameManager.updateGamePhase(game.id, 'preparation');
    game.gameLoopActive = true;
    
    this.schedulePhase(game, 'preparation', 0);
  }

  /**
   * Stops the gameplay loop for a game
   */
  stopGameLoop(gameId: string): void {
    // Clear all timers for this game
    this.timerManager.clearAllTimers(gameId);
    this.phaseCallbacks.delete(gameId);
    
    const game = this.gameManager.getGame(gameId);
    if (game) {
      game.gameLoopActive = false;
      console.log(`🛑 [GAMEPLAY_LOOP] Stopped gameplay loop for game ${game.pin}`);
    }
  }

  /**
   * Immediately transitions to a specific phase (for events like early question end)
   */
  transitionToPhase(game: Game, phase: GamePhase): void {
    if (!game.gameLoopActive) {
      console.log(`⚠️ [GAMEPLAY_LOOP] Cannot transition - loop not active for game ${game.pin}`);
      return;
    }

    // Clear existing timers to prevent race conditions
    this.timerManager.clearAllTimers(game.id);

    console.log(`🔄 [GAMEPLAY_LOOP] Force transitioning to ${phase} for game ${game.pin}`);
    this.schedulePhase(game, phase, 0);
  }

  /**
   * Schedules the next phase with a delay
   */
  private schedulePhase(game: Game, phase: GamePhase, delay: number): void {
    const timerType = `phase_${phase}`;
    
    this.timerManager.setTimer(game.id, timerType, () => {
      this.executePhase(game, phase);
    }, delay);
    
    if (delay > 0) {
      console.log(`⏰ [GAMEPLAY_LOOP] Scheduled ${phase} phase in ${delay}ms for game ${game.pin}`);
    }
  }

  /**
   * Executes a specific game phase
   */
  private executePhase(game: Game, phase: GamePhase): void {
    console.log(`▶️ [GAMEPLAY_LOOP] Executing ${phase} phase for game ${game.pin}`);
    
    this.gameManager.updateGamePhase(game.id, phase);
    const now = Date.now();
    game.phaseStartTime = now;

    switch (phase) {
      case 'preparation':
        this.executePreprationPhase(game);
        break;
      case 'thinking':
        this.executeThinkingPhase(game);
        break;
      case 'answering':
        this.executeAnsweringPhase(game);
        break;
      case 'results':
        this.executeResultsPhase(game);
        break;
      case 'leaderboard':
        this.executeLeaderboardPhase(game);
        break;
      case 'finished':
        this.executeFinishedPhase(game);
        break;
      default:
        console.error(`❌ [GAMEPLAY_LOOP] Unknown phase: ${phase}`);
    }
  }

  private executePreprationPhase(game: Game): void {
    console.log(`🔧 [PREPARATION] Preparing next question for game ${game.pin}`);
    
    // Clear previous answers
    this.playerManager.clearAnswers(game);
    
    // Try to start next question
    const question = this.questionManager.startNextQuestion(game);
    if (!question) {
      // No more questions - finish the game
      this.schedulePhase(game, 'finished', 100);
      return;
    }

    console.log(`📋 [PREPARATION] Question ${game.currentQuestionIndex + 1}/${game.questions.length} prepared: "${question.question}"`);
    
    // Transition to thinking phase
    this.schedulePhase(game, 'thinking', 500);
  }

  private executeThinkingPhase(game: Game): void {
    const question = this.questionManager.getCurrentQuestion(game);
    if (!question) {
      console.error(`❌ [THINKING] No current question for game ${game.pin}`);
      return;
    }

    console.log(`💭 [THINKING] Starting thinking phase for game ${game.pin} (${game.settings.thinkTime}s)`);
    
    // Emit thinking phase to all clients
    this.io.to(game.id).emit('thinkingPhase', question, game.settings.thinkTime);
    
    // Schedule answering phase using TimerManager
    this.timerManager.setThinkingPhaseTimer(game.id, () => {
      this.executePhase(game, 'answering');
    }, game.settings.thinkTime);
  }

  private executeAnsweringPhase(game: Game): void {
    console.log(`📝 [ANSWERING] Starting answering phase for game ${game.pin} (${game.settings.answerTime}s)`);
    
    // Set question start time for scoring
    this.gameManager.setQuestionStartTime(game.id, Date.now());
    
    // Emit answering phase to all clients
    this.io.to(game.id).emit('answeringPhase', game.settings.answerTime);
    
    // Schedule results phase using TimerManager
    this.timerManager.setAnsweringPhaseTimer(game.id, () => {
      this.executePhase(game, 'results');
    }, game.settings.answerTime);
    
    // Set up callback to check if we can end early
    this.phaseCallbacks.set(game.id, () => {
      const activePlayers = game.players.filter(p => !p.isHost && p.isConnected);
      const totalActivePlayers = activePlayers.length;
      
      // Only allow early transition if there are active players and all have answered
      if (totalActivePlayers > 0 && this.questionManager.hasAllPlayersAnswered(game)) {
        console.log(`⚡ [ANSWERING] All ${totalActivePlayers} players answered - ending phase early for game ${game.pin}`);
        // Clear the answering phase timer and transition immediately
        this.timerManager.clearTimer(game.id, TimerManager.TIMER_TYPES.ANSWERING_PHASE);
        this.executePhase(game, 'results');
      }
    });
  }

  private executeResultsPhase(game: Game): void {
    console.log(`📊 [RESULTS] Starting results phase for game ${game.pin}`);
    
    const currentQuestion = this.questionManager.getCurrentQuestion(game);
    if (!currentQuestion) return;

    // Update scores
    this.playerManager.updateScores(game, currentQuestion.correctAnswer);
    
    // Get and emit stats
    const stats = this.questionManager.getQuestionStats(game);
    if (stats) {
      this.io.to(game.id).emit('questionEnded', stats);
      
      // Send host results
      const host = this.playerManager.getHost(game);
      if (host && host.isConnected) {
        this.io.to(host.socketId).emit('hostResults', stats);
      }
      
      // Send personal results to players
      game.players.forEach((player) => {
        if (!player.isHost) {
          const personalResult = this.questionManager.getPersonalResult(game, player.id);
          if (personalResult) {
            this.io.to(player.socketId).emit('personalResult', personalResult);
          }
        }
      });
    }

    // Clear the answering phase callback
    this.phaseCallbacks.set(game.id, null);
    
    // Stay in results phase - host will manually trigger leaderboard
    console.log(`⏸️ [RESULTS] Results phase active - waiting for host to show leaderboard`);
  }

  private executeLeaderboardPhase(game: Game): void {
    console.log(`🏆 [LEADERBOARD] Starting leaderboard phase for game ${game.pin}`);
    
    const leaderboard = this.playerManager.getLeaderboard(game);
    this.io.to(game.id).emit('leaderboardShown', leaderboard);
    
    // Stay in leaderboard phase - host will manually trigger next question or finish game
    const isLastQuestion = this.questionManager.isLastQuestion(game);
    console.log(`⏸️ [LEADERBOARD] Leaderboard phase active - waiting for host to ${isLastQuestion ? 'finish game' : 'start next question'}`);
  }

  private executeFinishedPhase(game: Game): void {
    console.log(`🏁 [FINISHED] Game ${game.pin} finished`);
    
    this.gameManager.updateGamePhase(game.id, 'finished');
    const finalResults = this.playerManager.getFinalResults(game);
    this.io.to(game.id).emit('gameFinished', finalResults);
    
    // Stop the gameplay loop
    this.stopGameLoop(game.id);
    
    // Clean up game after a delay
    this.timerManager.setTimer(game.id, 'game_cleanup', () => {
      this.gameManager.deleteGame(game.id);
    }, 30000);
  }

  /**
   * Called when a player submits an answer - checks if we can end answering phase early
   */
  onPlayerAnswered(game: Game): void {
    const callback = this.phaseCallbacks.get(game.id);
    if (callback && game.phase === 'answering') {
      callback();
    }
  }

  /**
   * Sync a newly connected player/host to the current game phase
   */
  syncPlayerToCurrentPhase(game: Game, socketId: string, isHost: boolean): void {
    if (!game.gameLoopActive) return;

    console.log(`🔄 [SYNC] Syncing ${isHost ? 'host' : 'player'} to ${game.phase} phase in game ${game.pin}`);

    switch (game.phase) {
      case 'thinking':
        const question = this.questionManager.getCurrentQuestion(game);
        if (question) {
          const elapsed = Date.now() - (game.phaseStartTime || 0);
          const remaining = Math.max(0, game.settings.thinkTime - Math.floor(elapsed / 1000));
          if (remaining > 0) {
            this.io.to(socketId).emit('thinkingPhase', question, remaining);
          }
        }
        break;
        
      case 'answering':
        const currentQuestion = this.questionManager.getCurrentQuestion(game);
        if (currentQuestion) {
          // For answering phase, show thinking first then answering
          this.io.to(socketId).emit('thinkingPhase', currentQuestion, game.settings.thinkTime);
          
          const delay = isHost ? 2000 : 100; // Host gets longer delay for UX
          setTimeout(() => {
            const elapsed = Date.now() - (game.questionStartTime || 0);
            const remaining = Math.max(0, game.settings.answerTime - Math.floor(elapsed / 1000));
            if (remaining > 0) {
              this.io.to(socketId).emit('answeringPhase', remaining);
            }
          }, delay);
        }
        break;
        
      case 'leaderboard':
        const leaderboard = this.playerManager.getLeaderboard(game);
        this.io.to(socketId).emit('leaderboardShown', leaderboard);
        break;
        
      case 'finished':
        const finalResults = this.playerManager.getFinalResults(game);
        this.io.to(socketId).emit('gameFinished', finalResults);
        break;
    }
  }
} 