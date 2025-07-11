export class TimerManager {
  private timers: Map<string, Map<string, NodeJS.Timeout>> = new Map();

  setTimer(gameId: string, timerType: string, callback: () => void, delay: number): void {
    if (!this.timers.has(gameId)) {
      this.timers.set(gameId, new Map());
    }

    const gameTimers = this.timers.get(gameId)!;
    
    // Clear existing timer of same type
    this.clearTimer(gameId, timerType);
    
    const wrappedCallback = () => {
      try {
        callback();
      } catch (error) {
        console.error(`Timer callback error for ${gameId}:${timerType}:`, error);
      } finally {
        // Clean up the timer reference
        gameTimers.delete(timerType);
        if (gameTimers.size === 0) {
          this.timers.delete(gameId);
        }
      }
    };

    const timer = setTimeout(wrappedCallback, delay);
    gameTimers.set(timerType, timer);
    
    // Removed console.log
  }

  clearTimer(gameId: string, timerType: string): boolean {
    const gameTimers = this.timers.get(gameId);
    if (!gameTimers) return false;

    const timer = gameTimers.get(timerType);
    if (!timer) return false;

    clearTimeout(timer);
    gameTimers.delete(timerType);
    
    if (gameTimers.size === 0) {
      this.timers.delete(gameId);
    }

    // Removed console.log
    return true;
  }

  clearAllTimers(gameId: string): void {
    const gameTimers = this.timers.get(gameId);
    if (!gameTimers) return;

    const timerCount = gameTimers.size;
    gameTimers.forEach((timer, timerType) => {
      clearTimeout(timer);
      console.log(`[TIMER] Cleared timer ${timerType} for game ${gameId}`);
    });

    this.timers.delete(gameId);
    console.log(`[TIMER] Cleared all timers (${timerCount}) for game ${gameId}`);
  }

  hasTimer(gameId: string, timerType: string): boolean {
    const gameTimers = this.timers.get(gameId);
    return gameTimers?.has(timerType) ?? false;
  }

  getActiveTimerCount(gameId: string): number {
    return this.timers.get(gameId)?.size ?? 0;
  }

  getActiveTimers(gameId: string): string[] {
    const gameTimers = this.timers.get(gameId);
    const activeTimers = gameTimers ? Array.from(gameTimers.keys()) : [];
    console.log(`[TIMER] Active timers for game ${gameId}: ${activeTimers.length}`);
    return activeTimers;
  }

  logActiveTimers(gameId: string): void {
    const activeTimers = this.getActiveTimers(gameId);
    if (activeTimers.length > 0) {
      console.log(`[TIMER] Active timers for game ${gameId}: ${activeTimers.join(', ')}`);
    } else {
      console.log(`[TIMER] No active timers for game ${gameId}`);
    }
  }

  logAllTimers(): void {
    const allGames = Array.from(this.timers.keys());
    if (allGames.length === 0) {
      console.log(`[TIMER] No active timers in any game`);
      return;
    }

    console.log(`[TIMER] Active timers across ${allGames.length} games:`);
    allGames.forEach(gameId => {
      const activeTimers = this.getActiveTimers(gameId);
      console.log(`[TIMER] Game ${gameId}: ${activeTimers.length} timers - ${activeTimers.join(', ')}`);
    });
  }

  // Timer type constants for consistency
  static readonly TIMER_TYPES = {
    THINKING_PHASE: 'thinkingPhase',
    ANSWERING_PHASE: 'answeringPhase',
    HOST_RECONNECT: 'hostReconnect',
    PLAYER_CLEANUP: 'playerCleanup'
  } as const;

  // Helper methods for common timer operations
  setThinkingPhaseTimer(gameId: string, callback: () => void, thinkTime: number): void {
    this.setTimer(gameId, TimerManager.TIMER_TYPES.THINKING_PHASE, callback, thinkTime * 1000);
  }

  setAnsweringPhaseTimer(gameId: string, callback: () => void, answerTime: number): void {
    this.setTimer(gameId, TimerManager.TIMER_TYPES.ANSWERING_PHASE, callback, answerTime * 1000);
  }

  setHostReconnectTimer(gameId: string, callback: () => void, delay: number = 30000): void {
    this.setTimer(gameId, TimerManager.TIMER_TYPES.HOST_RECONNECT, callback, delay);
  }

  setPlayerCleanupTimer(gameId: string, playerId: string, callback: () => void, delay: number = 60000): void {
    const timerType = `${TimerManager.TIMER_TYPES.PLAYER_CLEANUP}_${playerId}`;
    this.setTimer(gameId, timerType, callback, delay);
  }

  clearPlayerCleanupTimer(gameId: string, playerId: string): boolean {
    const timerType = `${TimerManager.TIMER_TYPES.PLAYER_CLEANUP}_${playerId}`;
    return this.clearTimer(gameId, timerType);
  }
} 