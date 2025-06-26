import { TimerManager } from '../TimerManager';

// Mock setTimeout and clearTimeout
jest.useFakeTimers();

describe('TimerManager', () => {
  let timerManager: TimerManager;
  const gameId = 'test-game-1';
  let callbackMock: jest.Mock;

  beforeEach(() => {
    timerManager = new TimerManager();
    callbackMock = jest.fn();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('setTimer', () => {
    it('should set a timer and execute callback after delay', () => {
      timerManager.setTimer(gameId, 'test-timer', callbackMock, 5000);
      
      expect(callbackMock).not.toHaveBeenCalled();
      expect(timerManager.hasTimer(gameId, 'test-timer')).toBe(true);
      
      jest.advanceTimersByTime(5000);
      
      expect(callbackMock).toHaveBeenCalledTimes(1);
      expect(timerManager.hasTimer(gameId, 'test-timer')).toBe(false);
    });

    it('should replace existing timer of same type', () => {
      const firstCallback = jest.fn();
      const secondCallback = jest.fn();
      
      timerManager.setTimer(gameId, 'test-timer', firstCallback, 5000);
      timerManager.setTimer(gameId, 'test-timer', secondCallback, 3000);
      
      jest.advanceTimersByTime(5000);
      
      expect(firstCallback).not.toHaveBeenCalled();
      expect(secondCallback).toHaveBeenCalledTimes(1);
    });

    it('should handle callback errors gracefully', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Test error');
      });
      
      timerManager.setTimer(gameId, 'error-timer', errorCallback, 1000);
      
      expect(() => {
        jest.advanceTimersByTime(1000);
      }).not.toThrow();
      
      expect(errorCallback).toHaveBeenCalled();
      expect(timerManager.hasTimer(gameId, 'error-timer')).toBe(false);
    });
  });

  describe('clearTimer', () => {
    it('should clear existing timer', () => {
      timerManager.setTimer(gameId, 'test-timer', callbackMock, 5000);
      
      const cleared = timerManager.clearTimer(gameId, 'test-timer');
      
      expect(cleared).toBe(true);
      expect(timerManager.hasTimer(gameId, 'test-timer')).toBe(false);
      
      jest.advanceTimersByTime(5000);
      expect(callbackMock).not.toHaveBeenCalled();
    });

    it('should return false for non-existent timer', () => {
      const cleared = timerManager.clearTimer(gameId, 'non-existent');
      expect(cleared).toBe(false);
    });
  });

  describe('clearAllTimers', () => {
    it('should clear all timers for a game', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();
      
      timerManager.setTimer(gameId, 'timer1', callback1, 5000);
      timerManager.setTimer(gameId, 'timer2', callback2, 3000);
      timerManager.setTimer('other-game', 'timer3', callback3, 2000);
      
      timerManager.clearAllTimers(gameId);
      
      expect(timerManager.getActiveTimerCount(gameId)).toBe(0);
      expect(timerManager.getActiveTimerCount('other-game')).toBe(1);
      
      jest.advanceTimersByTime(5000);
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
      expect(callback3).toHaveBeenCalled();
    });
  });

  describe('hasTimer', () => {
    it('should return true for existing timer', () => {
      timerManager.setTimer(gameId, 'test-timer', callbackMock, 5000);
      expect(timerManager.hasTimer(gameId, 'test-timer')).toBe(true);
    });

    it('should return false for non-existent timer', () => {
      expect(timerManager.hasTimer(gameId, 'non-existent')).toBe(false);
    });
  });

  describe('getActiveTimerCount', () => {
    it('should return correct count of active timers', () => {
      expect(timerManager.getActiveTimerCount(gameId)).toBe(0);
      
      timerManager.setTimer(gameId, 'timer1', jest.fn(), 5000);
      expect(timerManager.getActiveTimerCount(gameId)).toBe(1);
      
      timerManager.setTimer(gameId, 'timer2', jest.fn(), 3000);
      expect(timerManager.getActiveTimerCount(gameId)).toBe(2);
      
      timerManager.clearTimer(gameId, 'timer1');
      expect(timerManager.getActiveTimerCount(gameId)).toBe(1);
    });
  });

  describe('getActiveTimers', () => {
    it('should return list of active timer types', () => {
      timerManager.setTimer(gameId, 'timer1', jest.fn(), 5000);
      timerManager.setTimer(gameId, 'timer2', jest.fn(), 3000);
      
      const activeTimers = timerManager.getActiveTimers(gameId);
      
      expect(activeTimers).toContain('timer1');
      expect(activeTimers).toContain('timer2');
      expect(activeTimers).toHaveLength(2);
    });
  });

  describe('helper methods', () => {
    it('should set thinking phase timer with correct delay', () => {
      timerManager.setThinkingPhaseTimer(gameId, callbackMock, 10);
      
      expect(timerManager.hasTimer(gameId, TimerManager.TIMER_TYPES.THINKING_PHASE)).toBe(true);
      
      jest.advanceTimersByTime(10000);
      expect(callbackMock).toHaveBeenCalled();
    });

    it('should set answering phase timer with correct delay', () => {
      timerManager.setAnsweringPhaseTimer(gameId, callbackMock, 30);
      
      expect(timerManager.hasTimer(gameId, TimerManager.TIMER_TYPES.ANSWERING_PHASE)).toBe(true);
      
      jest.advanceTimersByTime(30000);
      expect(callbackMock).toHaveBeenCalled();
    });

    it('should set player cleanup timer with unique identifier', () => {
      const playerId = 'player-123';
      timerManager.setPlayerCleanupTimer(gameId, playerId, callbackMock);
      
      const expectedTimerType = `${TimerManager.TIMER_TYPES.PLAYER_CLEANUP}_${playerId}`;
      expect(timerManager.hasTimer(gameId, expectedTimerType)).toBe(true);
      
      const cleared = timerManager.clearPlayerCleanupTimer(gameId, playerId);
      expect(cleared).toBe(true);
      expect(timerManager.hasTimer(gameId, expectedTimerType)).toBe(false);
    });
  });
}); 