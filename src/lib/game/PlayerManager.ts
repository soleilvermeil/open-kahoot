import { v4 as uuidv4 } from 'uuid';
import type { Game, Player } from '@/types/game';

export interface JoinGameResult {
  success: boolean;
  game?: Game;
  playerId?: string;
  isReconnection?: boolean;
}

export class PlayerManager {
  joinGame(game: Game, socketId: string, playerName: string, persistentId: string | null = null): JoinGameResult {
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

    // Check if player name already exists
    if (game.players.some(p => p.name === playerName && !p.isHost)) {
      return { success: false };
    }

    // Create new player
    const playerId = uuidv4();
    const newPlayer: Player = {
      id: playerId,
      socketId,
      name: playerName,
      score: 0,
      isHost: false,
      isConnected: true
    };

    game.players.push(newPlayer);
    return { success: true, game, playerId, isReconnection: false };
  }

  disconnectPlayer(socketId: string, game: Game): Player | undefined {
    const player = game.players.find(p => p.socketId === socketId);
    if (player) {
      player.isConnected = false;
      console.log(`Player ${player.name} disconnected from game ${game.pin}`);
      return player;
    }
    return undefined;
  }

  removePlayer(playerId: string, game: Game): boolean {
    const playerIndex = game.players.findIndex(p => p.id === playerId);
    if (playerIndex !== -1) {
      const player = game.players[playerIndex];
      game.players.splice(playerIndex, 1);
      console.log(`Player ${player.name} removed from game ${game.pin}`);
      return true;
    }
    return false;
  }

  getPlayerBySocketId(socketId: string, game: Game): Player | undefined {
    return game.players.find(p => p.socketId === socketId);
  }

  getPlayerById(playerId: string, game: Game): Player | undefined {
    return game.players.find(p => p.id === playerId);
  }

  getConnectedPlayers(game: Game): Player[] {
    return game.players.filter(p => p.isConnected && !p.isHost);
  }

  getHost(game: Game): Player | undefined {
    return game.players.find(p => p.isHost);
  }

  isHost(socketId: string, game: Game): boolean {
    const player = this.getPlayerBySocketId(socketId, game);
    return player?.isHost ?? false;
  }

  submitAnswer(game: Game, playerId: string, answerIndex: number, isPersistentId: boolean = false): boolean {
    const player = isPersistentId 
      ? this.getPlayerById(playerId, game)
      : this.getPlayerBySocketId(playerId, game);

    if (!player || player.isHost) {
      return false;
    }

    // Don't allow duplicate answers
    if (player.currentAnswer !== undefined) {
      console.log(`Player ${player.name} already answered question`);
      return false;
    }

    player.currentAnswer = answerIndex;
    player.answerTime = Date.now();
    
    console.log(`✅ [ANSWER_RECORDED] Player "${player.name}" answered ${answerIndex}`);
    return true;
  }

  clearAnswers(game: Game): void {
    game.players.forEach(player => {
      if (!player.isHost) {
        delete player.currentAnswer;
        delete player.answerTime;
      }
    });
  }

  updateScores(game: Game, correctAnswer: number): void {
    const questionStartTime = game.questionStartTime || Date.now();
    const maxPoints = 1000;
    
    game.players.forEach(player => {
      if (!player.isHost && player.currentAnswer === correctAnswer) {
        // Calculate time-based score (linear decrease from 1000 to 0)
        const responseTime = (player.answerTime || Date.now()) - questionStartTime;
        const answerTimeLimit = game.settings.answerTime * 1000;
        const timeUsedRatio = responseTime / answerTimeLimit;
        
        const pointsEarned = Math.max(0, Math.round(maxPoints * (1 - timeUsedRatio)));
        player.score += pointsEarned;
        
        console.log(`Player ${player.name} earned ${pointsEarned} points (total: ${player.score})`);
      }
    });
  }

  getLeaderboard(game: Game): Player[] {
    return game.players
      .filter(p => !p.isHost)
      .sort((a, b) => b.score - a.score);
  }

  getFinalResults(game: Game): Player[] {
    return this.getLeaderboard(game);
  }
} 