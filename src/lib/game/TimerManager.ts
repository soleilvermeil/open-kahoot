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
    
    console.log(`⏰ [TIMER_SET] ${gameId}:${timerType} set for ${delay}ms`);
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

    console.log(`⏰ [TIMER_CLEARED] ${gameId}:${timerType}`);
    return true;
  }

  clearAllTimers(gameId: string): void {
    const gameTimers = this.timers.get(gameId);
    if (!gameTimers) return;

    const timerCount = gameTimers.size;
    gameTimers.forEach((timer, timerType) => {
      clearTimeout(timer);
      console.log(`⏰ [TIMER_CLEARED] ${gameId}:${timerType}`);
    });

    this.timers.delete(gameId);
    console.log(`⏰ [ALL_TIMERS_CLEARED] Cleared ${timerCount} timers for game ${gameId}`);
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
    return gameTimers ? Array.from(gameTimers.keys()) : [];
  }

  logActiveTimers(gameId: string): void {
    const activeTimers = this.getActiveTimers(gameId);
    if (activeTimers.length > 0) {
      console.log(`⏰ [ACTIVE_TIMERS] Game ${gameId}: ${activeTimers.join(', ')}`);
    } else {
      console.log(`⏰ [ACTIVE_TIMERS] Game ${gameId}: No active timers`);
    }
  }

  logAllTimers(): void {
    const allGames = Array.from(this.timers.keys());
    if (allGames.length === 0) {
      console.log('⏰ [ALL_TIMERS] No active timers in any game');
      return;
    }

    console.log('⏰ [ALL_TIMERS] Active timers across all games:');
    allGames.forEach(gameId => {
      const activeTimers = this.getActiveTimers(gameId);
      console.log(`  Game ${gameId}: ${activeTimers.length > 0 ? activeTimers.join(', ') : 'None'}`);
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