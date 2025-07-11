import { v4 as uuidv4 } from 'uuid';
import type { Game, Question, GameSettings, GamePhase } from '@/types/game';
import { gameConfig } from '@/lib/config';

export class GameManager {
  private games: Map<string, Game> = new Map();
  private gamesByPin: Map<string, string> = new Map(); // pin -> gameId

  createGame(hostSocketId: string, title: string, questions: Question[], settings: GameSettings): Game {
    const gameId = uuidv4();
    const hostId = uuidv4(); // Generate persistent ID for host
    const pin = this.generatePin();
    
    const game: Game = {
      id: gameId,
      pin,
      hostId: hostId,
      title,
      questions,
      settings,
      currentQuestionIndex: -1,
      status: 'waiting',
      phase: 'waiting',
      players: [{
        id: hostId,
        socketId: hostSocketId,
        name: 'Host',
        score: 0,
        isHost: true,
        isConnected: true
      }],
      gameLoopActive: false,
      answerHistory: []
    };

    this.games.set(gameId, game);
    this.gamesByPin.set(pin, gameId);
    
    // Removed console.log
    
    return game;
  }

  getGame(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }

  getGameByPin(pin: string): Game | undefined {
    const gameId = this.gamesByPin.get(pin);
    const game = gameId ? this.games.get(gameId) : undefined;
    // Removed console.log
    if (this.games.size > 0) {
      // Removed console.log
    }
    return game;
  }

  deleteGame(gameId: string): void {
    const game = this.games.get(gameId);
    if (game) {
      this.gamesByPin.delete(game.pin);
      this.games.delete(gameId);
    }
  }

  updateGameStatus(gameId: string, status: GamePhase): void {
    const game = this.games.get(gameId);
    if (game) {
      game.status = status;
    }
  }

  updateGamePhase(gameId: string, phase: GamePhase): void {
    const game = this.games.get(gameId);
    if (game) {
      game.phase = phase;
      game.status = phase; // Keep status in sync with phase for backwards compatibility
    }
  }

  updateCurrentQuestion(gameId: string, questionIndex: number): void {
    const game = this.games.get(gameId);
    if (game) {
      game.currentQuestionIndex = questionIndex;
    }
  }

  setQuestionStartTime(gameId: string, startTime: number): void {
    const game = this.games.get(gameId);
    if (game) {
      game.questionStartTime = startTime;
    }
  }

  setPhaseStartTime(gameId: string, startTime: number): void {
    const game = this.games.get(gameId);
    if (game) {
      game.phaseStartTime = startTime;
    }
  }

  getCurrentQuestion(game: Game): Question | undefined {
    return game.questions[game.currentQuestionIndex];
  }

  isGameFinished(game: Game): boolean {
    return game.currentQuestionIndex >= game.questions.length - 1;
  }

  private generatePin(): string {
    const pinLength = gameConfig.pinLength;
    const min = Math.pow(10, pinLength - 1);
    const max = Math.pow(10, pinLength) - 1;
    const pin = Math.floor(min + Math.random() * (max - min + 1)).toString();
    // Ensure pin is unique
    if (this.gamesByPin.has(pin)) {
      return this.generatePin();
    }
    return pin;
  }

  // Debug methods
  getAllGames(): Game[] {
    return Array.from(this.games.values());
  }

  getGameCount(): number {
    return this.games.size;
  }
} 