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
      console.log(`[PIN ${game.pin}] Game loop already active, ignoring start request`);
      return;
    }

    console.log(`[PIN ${game.pin}] Starting game loop with ${game.players.length} players (${game.players.filter(p => !p.isHost).length} active players)`);
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
      console.log(`[PIN ${game.pin}] Game loop stopped`);
    }
  }

  /**
   * Immediately transitions to a specific phase (for events like early question end)
   */
  transitionToPhase(game: Game, phase: GamePhase): void {
    if (!game.gameLoopActive) {
      console.log(`[PIN ${game.pin}] Cannot transition - game loop not active`);
      return;
    }

    // Clear existing timers to prevent race conditions
    this.timerManager.clearAllTimers(game.id);

    console.log(`[PIN ${game.pin}] Manual transition to phase: ${phase}`);
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
      console.log(`[PIN ${game.pin}] Scheduled phase ${phase} with delay ${delay}ms`);
    }
  }

  /**
   * Executes a specific game phase
   */
  private executePhase(game: Game, phase: GamePhase): void {
    console.log(`[PIN ${game.pin}] Phase: ${phase} | Question: ${game.currentQuestionIndex + 1}/${game.questions.length} | Players: ${game.players.filter(p => !p.isHost && p.isConnected).length}`);
    
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
        console.error(`❌ [PIN ${game.pin}] Unknown phase: ${phase}`);
    }
  }

  private executePreprationPhase(game: Game): void {
    // Store answer history before clearing answers (only if we've had at least one question)
    if (game.currentQuestionIndex >= 0) {
      this.playerManager.storeAnswersToHistory(game);
      console.log(`[PIN ${game.pin}] Stored answer history for question ${game.currentQuestionIndex}`);
    }
    
    // Clear previous answers
    this.playerManager.clearAnswers(game);
    
    // Try to start next question
    const question = this.questionManager.startNextQuestion(game);
    if (!question) {
      // No more questions - finish the game
      console.log(`[PIN ${game.pin}] No more questions, finishing game`);
      this.schedulePhase(game, 'finished', 100);
      return;
    }

    // Transition to thinking phase
    this.schedulePhase(game, 'thinking', 500);
  }

  private executeThinkingPhase(game: Game): void {
    const question = this.questionManager.getCurrentQuestion(game);
    if (!question) {
      console.error(`❌ [PIN ${game.pin}] No current question for game`);
      return;
    }

    console.log(`[PIN ${game.pin}] Thinking phase | Question: "${question.question.substring(0, 30)}${question.question.length > 30 ? '...' : ''}" | Duration: ${game.settings.thinkTime}s`);
    
    // Emit thinking phase to all clients
    this.io.to(game.id).emit('thinkingPhase', question, game.settings.thinkTime);
    
    // Schedule answering phase using TimerManager
    this.timerManager.setThinkingPhaseTimer(game.id, () => {
      this.executePhase(game, 'answering');
    }, game.settings.thinkTime);
  }

  private executeAnsweringPhase(game: Game): void {
    const activePlayers = game.players.filter(p => !p.isHost && p.isConnected);
    console.log(`[PIN ${game.pin}] Answering phase | Duration: ${game.settings.answerTime}s | Active players: ${activePlayers.length}`);
    
    // Set question start time for scoring
    this.gameManager.setQuestionStartTime(game.id, Date.now());
    
    // Emit answering phase to all clients
    this.io.to(game.id).emit('answeringPhase', game.settings.answerTime);
    
    // Schedule results phase using TimerManager
    this.timerManager.setAnsweringPhaseTimer(game.id, () => {
      console.log(`[PIN ${game.pin}] Answering time expired, moving to results`);
      this.executePhase(game, 'results');
    }, game.settings.answerTime);
    
    // Set up callback to check if we can end early
    this.phaseCallbacks.set(game.id, () => {
      const activePlayers = game.players.filter(p => !p.isHost && p.isConnected);
      const totalActivePlayers = activePlayers.length;
      const answeredCount = this.questionManager.getAnsweredPlayerCount(game);
      
      // Only allow early transition if there are active players and all have answered
      if (totalActivePlayers > 0 && this.questionManager.hasAllPlayersAnswered(game)) {
        console.log(`[PIN ${game.pin}] All players (${answeredCount}/${totalActivePlayers}) answered, ending answering phase early`);
        // Clear the answering phase timer and transition immediately
        this.timerManager.clearTimer(game.id, TimerManager.TIMER_TYPES.ANSWERING_PHASE);
        this.executePhase(game, 'results');
      }
    });
  }

  private executeResultsPhase(game: Game): void {
    const currentQuestion = this.questionManager.getCurrentQuestion(game);
    if (!currentQuestion) {
      console.error(`❌ [PIN ${game.pin}] No current question for results phase`);
      return;
    }

    // Update scores
    this.playerManager.updateScores(game, currentQuestion.correctAnswer);
    
    // Get and emit stats
    const stats = this.questionManager.getQuestionStats(game);
    if (stats) {
      const correctAnswerCount = stats.answers.find(a => a.optionIndex === currentQuestion.correctAnswer)?.count || 0;
      console.log(`[PIN ${game.pin}] Results | Correct: ${correctAnswerCount}/${stats.totalPlayers} | Avg score: ${Math.round(game.players.filter(p => !p.isHost).reduce((sum, p) => sum + p.score, 0) / Math.max(1, game.players.filter(p => !p.isHost).length))}`);
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
    console.log(`[PIN ${game.pin}] Waiting for host to continue to leaderboard`);
  }

  private executeLeaderboardPhase(game: Game): void {
    const leaderboard = this.playerManager.getLeaderboard(game);
    const topPlayer = leaderboard.length > 0 ? leaderboard[0] : null;
    
    console.log(`[PIN ${game.pin}] Leaderboard | Players: ${leaderboard.length} | Top: ${topPlayer ? `${topPlayer.name} (${topPlayer.score})` : 'none'}`);
    this.io.to(game.id).emit('leaderboardShown', leaderboard, game);
    
    // Stay in leaderboard phase - host will manually trigger next question or finish game
    const isLastQuestion = this.questionManager.isLastQuestion(game);
    console.log(`[PIN ${game.pin}] ${isLastQuestion ? 'Final leaderboard shown' : 'Waiting for host to continue to next question'}`);
  }

  private executeFinishedPhase(game: Game): void {
    // Store final question's answer history
    if (game.currentQuestionIndex >= 0) {
      this.playerManager.storeAnswersToHistory(game);
    }
    
    this.gameManager.updateGamePhase(game.id, 'finished');
    const finalResults = this.playerManager.getFinalResults(game);
    
    const sortedPlayers = [...game.players].filter(p => !p.isHost).sort((a, b) => b.score - a.score);
    const winner = sortedPlayers.length > 0 ? sortedPlayers[0] : null;
    console.log(`[PIN ${game.pin}] Game finished | Questions: ${game.questions.length} | Winner: ${winner ? `${winner.name} (${winner.score})` : 'none'}`);
    
    this.io.to(game.id).emit('gameFinished', finalResults);
    
    // Stop the gameplay loop
    this.stopGameLoop(game.id);
    
    // Clean up game after a delay
    this.timerManager.setTimer(game.id, 'game_cleanup', () => {
      console.log(`[PIN ${game.pin}] Cleaning up game resources after 30s delay`);
      this.gameManager.deleteGame(game.id);
    }, 30000);
  }

  /**
   * Called when a player submits an answer - checks if we can end answering phase early
   */
  onPlayerAnswered(game: Game): void {
    const answeredCount = this.questionManager.getAnsweredPlayerCount(game);
    const totalPlayers = game.players.filter(p => !p.isHost && p.isConnected).length;
    
    console.log(`[PIN ${game.pin}] Player answered | Progress: ${answeredCount}/${totalPlayers}`);
    
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

    const playerType = isHost ? 'Host' : 'Player';
    const currentQuestion = game.currentQuestionIndex >= 0 ? 
      `Question ${game.currentQuestionIndex + 1}/${game.questions.length}` : 'No question';
    
    console.log(`[PIN ${game.pin}] ${playerType} reconnected | Phase: ${game.phase} | ${currentQuestion}`);

    switch (game.phase) {
      case 'thinking':
        const question = this.questionManager.getCurrentQuestion(game);
        if (question) {
          const elapsed = Date.now() - (game.phaseStartTime || 0);
          const remaining = Math.max(0, game.settings.thinkTime - Math.floor(elapsed / 1000));
          if (remaining > 0) {
            console.log(`[PIN ${game.pin}] Syncing to thinking phase | Remaining: ${remaining}s`);
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
              console.log(`[PIN ${game.pin}] Syncing to answering phase | Remaining: ${remaining}s`);
              this.io.to(socketId).emit('answeringPhase', remaining);
            }
          }, delay);
        }
        break;
        
      case 'leaderboard':
        const leaderboard = this.playerManager.getLeaderboard(game);
        console.log(`[PIN ${game.pin}] Syncing to leaderboard phase`);
        this.io.to(socketId).emit('leaderboardShown', leaderboard, game);
        break;
        
      case 'finished':
        const finalResults = this.playerManager.getFinalResults(game);
        console.log(`[PIN ${game.pin}] Syncing to finished phase`);
        this.io.to(socketId).emit('gameFinished', finalResults);
        break;
    }
  }
} 