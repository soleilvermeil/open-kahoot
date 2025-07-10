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
        // Removed console.log
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
      // Removed console.log
      return player;
    }
    return undefined;
  }

  removePlayer(playerId: string, game: Game): boolean {
    const playerIndex = game.players.findIndex(p => p.id === playerId);
    if (playerIndex !== -1) {
      const player = game.players[playerIndex];
      game.players.splice(playerIndex, 1);
      // Removed console.log
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
      // Removed console.log
      return false;
    }

    player.currentAnswer = answerIndex;
    player.answerTime = Date.now();
    
    // Removed console.log
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

  storeAnswersToHistory(game: Game): void {
    const question = game.questions[game.currentQuestionIndex];
    if (!question) return;

    const questionStartTime = game.questionStartTime || Date.now();

    game.players.forEach(player => {
      if (!player.isHost) {
        const responseTime = player.answerTime ? (player.answerTime - questionStartTime) : 0;
        const wasCorrect = player.currentAnswer === question.correctAnswer;
        
        // Calculate points earned for this question
        let pointsEarned = 0;
        if (wasCorrect && player.currentAnswer !== undefined) {
          const answerTimeLimit = game.settings.answerTime * 1000;
          const timeUsedRatio = responseTime / answerTimeLimit;
          
          // Apply dyslexia support: 20% slower score reduction
          let adjustedTimeUsedRatio = timeUsedRatio;
          if (player.hasDyslexiaSupport) {
            adjustedTimeUsedRatio = timeUsedRatio * 0.8; // 20% reduction in time penalty
          }
          
          pointsEarned = Math.max(0, Math.round(1000 * (1 - adjustedTimeUsedRatio)));
        }

        const answerRecord = {
          playerId: player.id,
          playerName: player.name,
          questionIndex: game.currentQuestionIndex,
          questionId: question.id,
          answerIndex: player.currentAnswer ?? null,
          answerTime: player.answerTime,
          responseTime: responseTime,
          pointsEarned: pointsEarned,
          wasCorrect: wasCorrect && player.currentAnswer !== undefined,
          hasDyslexiaSupport: player.hasDyslexiaSupport || false
        };

        game.answerHistory.push(answerRecord);
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
        
        // Apply dyslexia support: 20% slower score reduction
        let adjustedTimeUsedRatio = timeUsedRatio;
        if (player.hasDyslexiaSupport) {
          adjustedTimeUsedRatio = timeUsedRatio * 0.8; // 20% reduction in time penalty
        }
        
        const pointsEarned = Math.max(0, Math.round(maxPoints * (1 - adjustedTimeUsedRatio)));
        player.score += pointsEarned;
        
        const supportStatus = player.hasDyslexiaSupport ? ' (with dyslexia support)' : '';
        // Removed console.log
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

  generateGameLogsTSV(game: Game): string {
    const headers = [
      'question_index',
      'question_datetime',
      'question_string',
      'proposition_correct',
      'proposition_wrong1',
      'proposition_wrong2',
      'proposition_wrong3',
      'question_explanation',
      'player_id',
      'player_nickname',
      'choice_string',
      'choice_datetime',
      'has_dyslexia_support'
    ];

    const rows: string[] = [headers.join('\t')];

    // Sort answers by question index, then by player name
    const sortedAnswers = [...game.answerHistory].sort((a, b) => {
      if (a.questionIndex !== b.questionIndex) {
        return a.questionIndex - b.questionIndex;
      }
      return a.playerName.localeCompare(b.playerName);
    });

    sortedAnswers.forEach(answerRecord => {
      const question = game.questions[answerRecord.questionIndex];
      if (!question) return;

      // Get question start time for this specific question
      // Since we don't store per-question start times, we'll estimate based on answer time
      const questionStartTime = answerRecord.answerTime ? 
        new Date(answerRecord.answerTime - answerRecord.responseTime) : 
        new Date();
      
      const questionDatetime = questionStartTime.toISOString();
      const choiceDatetime = answerRecord.answerTime ? 
        new Date(answerRecord.answerTime).toISOString() : 
        '';

      // Separate correct and wrong propositions
      const correctProposition = question.options[question.correctAnswer];
      const wrongPropositions = question.options.filter((_, index) => index !== question.correctAnswer);
      
      // Pad wrong propositions to ensure we have exactly 3 (fill with empty strings if needed)
      while (wrongPropositions.length < 3) {
        wrongPropositions.push('');
      }

      const choiceString = answerRecord.answerIndex !== null 
        ? question.options[answerRecord.answerIndex] 
        : '';

      const row = [
        answerRecord.questionIndex.toString(),
        questionDatetime,
        question.question.replace(/\t/g, ' '), // Remove tabs from question text
        correctProposition.replace(/\t/g, ' '),
        wrongPropositions[0].replace(/\t/g, ' '),
        wrongPropositions[1].replace(/\t/g, ' '),
        wrongPropositions[2].replace(/\t/g, ' '),
        (question.explanation || '').replace(/\t/g, ' '),
        answerRecord.playerId,
        answerRecord.playerName.replace(/\t/g, ' '),
        choiceString.replace(/\t/g, ' '),
        choiceDatetime,
        answerRecord.hasDyslexiaSupport ? 'true' : 'false'
      ];

      rows.push(row.join('\t'));
    });

    return rows.join('\n');
  }

  // New method to toggle dyslexia support for a player
  toggleDyslexiaSupport(game: Game, playerId: string): boolean {
    const player = this.getPlayerById(playerId, game);
    if (!player || player.isHost) {
      return false;
    }

    player.hasDyslexiaSupport = !player.hasDyslexiaSupport;
    // Removed console.log
    return true;
  }
} 