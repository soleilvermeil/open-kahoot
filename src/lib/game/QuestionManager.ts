import type { Game, Question, GameStats, PersonalResult } from '@/types/game';

export class QuestionManager {
  startNextQuestion(game: Game): Question | null {
    const nextIndex = game.currentQuestionIndex + 1;
    
    if (nextIndex >= game.questions.length) {
      return null; // No more questions
    }

    game.currentQuestionIndex = nextIndex;
    // Don't set status here - let GameplayLoop manage phases

    const question = game.questions[nextIndex];
    console.log(`📋 [QUESTION_START] Prepared question ${nextIndex + 1}/${game.questions.length}: "${question.question}"`);
    
    return question;
  }

  getCurrentQuestion(game: Game): Question | undefined {
    if (game.currentQuestionIndex < 0 || game.currentQuestionIndex >= game.questions.length) {
      return undefined;
    }
    return game.questions[game.currentQuestionIndex];
  }

  getQuestionStats(game: Game): GameStats | undefined {
    const question = this.getCurrentQuestion(game);
    if (!question) return undefined;

    const players = game.players.filter(p => !p.isHost);
    const totalPlayers = players.length;
    
    // Count answers for each option
    const answerCounts = new Array(question.options.length).fill(0);
    let correctAnswers = 0;
    
    players.forEach(player => {
      if (player.currentAnswer !== undefined) {
        answerCounts[player.currentAnswer]++;
        if (player.currentAnswer === question.correctAnswer) {
          correctAnswers++;
        }
      }
    });

    // Calculate percentages
    const answers = answerCounts.map((count, index) => ({
      optionIndex: index,
      count,
      percentage: totalPlayers > 0 ? Math.round((count / totalPlayers) * 100) : 0
    }));

    return {
      question,
      answers,
      correctAnswers,
      totalPlayers
    };
  }

  getPersonalResult(game: Game, playerId: string): PersonalResult | undefined {
    const player = game.players.find(p => p.id === playerId);
    const question = this.getCurrentQuestion(game);
    
    if (!player || !question || player.isHost) {
      return undefined;
    }

    const wasCorrect = player.currentAnswer === question.correctAnswer;
    
    // Calculate points earned for this question
    let pointsEarned = 0;
    if (wasCorrect) {
      const questionStartTime = game.questionStartTime || Date.now();
      const responseTime = (player.answerTime || Date.now()) - questionStartTime;
      const answerTimeLimit = game.settings.answerTime * 1000;
      const maxPoints = 1000;
      const timeBonus = 500;
      const timeBonusPoints = Math.max(0, timeBonus * (1 - responseTime / answerTimeLimit));
      pointsEarned = Math.round(maxPoints + timeBonusPoints);
    }

    // Get leaderboard to determine position
    const leaderboard = game.players
      .filter(p => !p.isHost)
      .sort((a, b) => b.score - a.score);
    
    const position = leaderboard.findIndex(p => p.id === playerId) + 1;
    
    // Calculate points behind leader and get next player info
    let pointsBehind = 0;
    let nextPlayerName: string | null = null;
    
    if (position > 1) {
      const playerAbove = leaderboard[position - 2];
      pointsBehind = playerAbove.score - player.score;
      nextPlayerName = playerAbove.name;
    }

    return {
      wasCorrect,
      pointsEarned,
      totalScore: player.score,
      position,
      pointsBehind,
      nextPlayerName
    };
  }

  hasAllPlayersAnswered(game: Game): boolean {
    const activePlayers = game.players.filter(p => !p.isHost && p.isConnected);
    return activePlayers.every(p => p.currentAnswer !== undefined);
  }

  getAnsweredPlayerCount(game: Game): number {
    return game.players.filter(p => !p.isHost && p.currentAnswer !== undefined).length;
  }

  getTotalActivePlayerCount(game: Game): number {
    return game.players.filter(p => !p.isHost && p.isConnected).length;
  }

  isLastQuestion(game: Game): boolean {
    return game.currentQuestionIndex >= game.questions.length - 1;
  }

  getQuestionProgress(game: Game): { current: number; total: number } {
    return {
      current: game.currentQuestionIndex + 1,
      total: game.questions.length
    };
  }
} 