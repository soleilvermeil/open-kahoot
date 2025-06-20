const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Game Server Logic
class GameServer {
  constructor(io) {
    this.io = io;
    this.games = new Map();
    this.gamesByPin = new Map();
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Player connected:', socket.id);

      socket.on('createGame', (title, questions, settings, callback) => {
        const game = this.createGame(socket.id, title, questions, settings);
        socket.join(game.id);
        callback(game);
      });

      socket.on('joinGame', (pin, playerName, callback) => {
        const result = this.joinGame(socket.id, pin, playerName);
        if (result.success && result.game) {
          socket.join(result.game.id);
          this.io.to(result.game.id).emit('playerJoined', 
            result.game.players.find(p => p.id === socket.id)
          );
        }
        callback(result.success, result.game);
      });

      socket.on('startGame', (gameId) => {
        const game = this.games.get(gameId);
        if (game && this.isHost(socket.id, game)) {
          this.startGame(game);
        }
      });

      socket.on('submitAnswer', (gameId, questionId, answerIndex) => {
        const game = this.games.get(gameId);
        if (game && game.status === 'answering') {
          this.submitAnswer(socket.id, game, questionId, answerIndex);
        }
      });

      socket.on('nextQuestion', (gameId) => {
        const game = this.games.get(gameId);
        if (game && this.isHost(socket.id, game)) {
          this.nextQuestion(game);
        }
      });

      socket.on('endGame', (gameId) => {
        const game = this.games.get(gameId);
        if (game && this.isHost(socket.id, game)) {
          this.endGame(game);
        }
      });

      socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        this.handleDisconnect(socket.id);
      });
    });
  }

  createGame(hostId, title, questions, settings) {
    const gameId = uuidv4();
    const pin = this.generatePin();
    
    const game = {
      id: gameId,
      pin,
      hostId,
      title,
      questions,
      settings,
      currentQuestionIndex: -1,
      status: 'waiting',
      players: [{
        id: hostId,
        name: 'Host',
        score: 0,
        isHost: true
      }]
    };

    this.games.set(gameId, game);
    this.gamesByPin.set(pin, gameId);
    
    return game;
  }

  joinGame(playerId, pin, playerName) {
    const gameId = this.gamesByPin.get(pin);
    if (!gameId) {
      return { success: false };
    }

    const game = this.games.get(gameId);
    if (!game || game.status !== 'waiting') {
      return { success: false };
    }

    const existingPlayer = game.players.find(p => p.id === playerId);
    if (existingPlayer) {
      return { success: true, game };
    }

    const player = {
      id: playerId,
      name: playerName,
      score: 0,
      isHost: false
    };

    game.players.push(player);
    return { success: true, game };
  }

  startGame(game) {
    game.status = 'started';
    this.io.to(game.id).emit('gameStarted', game);
    
    setTimeout(() => {
      this.nextQuestion(game);
    }, 2000);
  }

  nextQuestion(game) {
    game.currentQuestionIndex++;
    
    if (game.currentQuestionIndex >= game.questions.length) {
      this.endGame(game);
      return;
    }

    const question = game.questions[game.currentQuestionIndex];
    game.status = 'thinking';
    game.phaseStartTime = Date.now();

    // Reset player answers
    game.players.forEach(player => {
      player.currentAnswer = undefined;
      player.answerTime = undefined;
    });

    // Start thinking phase - show question only
    this.io.to(game.id).emit('thinkingPhase', question, game.settings.thinkTime);

    // After think time, start answering phase
    setTimeout(() => {
      if (game.status === 'thinking') {
        this.startAnsweringPhase(game);
      }
    }, game.settings.thinkTime * 1000);
  }

  startAnsweringPhase(game) {
    game.status = 'answering';
    game.questionStartTime = Date.now();
    
    this.io.to(game.id).emit('answeringPhase', game.settings.answerTime);

    // Auto-end question after answer time
    setTimeout(() => {
      if (game.status === 'answering') {
        this.endQuestion(game);
      }
    }, game.settings.answerTime * 1000);
  }

  submitAnswer(playerId, game, questionId, answerIndex) {
    const player = game.players.find(p => p.id === playerId);
    const question = game.questions[game.currentQuestionIndex];
    
    if (!player || !question || question.id !== questionId || player.currentAnswer !== undefined) {
      return;
    }

    const answerTime = Date.now() - (game.questionStartTime || 0);
    player.currentAnswer = answerIndex;
    player.answerTime = answerTime;

    // Calculate score (more points for correct answers and faster responses)
    if (answerIndex === question.correctAnswer) {
      const timeBonus = Math.max(0, (game.settings.answerTime * 1000 - answerTime) / 1000);
      const points = Math.round(1000 + (timeBonus * 10));
      player.score += points;
    }

    this.io.to(game.id).emit('playerAnswered', playerId);

    // Check if all players have answered
    const answeredPlayers = game.players.filter(p => !p.isHost && p.currentAnswer !== undefined);
    const totalPlayers = game.players.filter(p => !p.isHost);
    
    if (answeredPlayers.length === totalPlayers.length && totalPlayers.length > 0) {
      this.endQuestion(game);
    }
  }

  endQuestion(game) {
    game.status = 'results';
    const question = game.questions[game.currentQuestionIndex];
    const nonHostPlayers = game.players.filter(p => !p.isHost);
    
    const answerCounts = [0, 0, 0, 0];
    nonHostPlayers.forEach(player => {
      if (player.currentAnswer !== undefined) {
        answerCounts[player.currentAnswer]++;
      }
    });

    const stats = {
      question,
      answers: answerCounts.map((count, index) => ({
        optionIndex: index,
        count,
        percentage: nonHostPlayers.length > 0 ? Math.round((count / nonHostPlayers.length) * 100) : 0
      })),
      correctAnswers: answerCounts[question.correctAnswer],
      totalPlayers: nonHostPlayers.length
    };

    this.io.to(game.id).emit('questionEnded', stats);
  }

  endGame(game) {
    game.status = 'finished';
    const finalScores = game.players
      .filter(p => !p.isHost)
      .sort((a, b) => b.score - a.score);
    
    this.io.to(game.id).emit('gameFinished', finalScores);
    
    setTimeout(() => {
      this.gamesByPin.delete(game.pin);
      this.games.delete(game.id);
    }, 5 * 60 * 1000);
  }

  handleDisconnect(playerId) {
    for (const [gameId, game] of this.games) {
      const playerIndex = game.players.findIndex(p => p.id === playerId);
      if (playerIndex !== -1) {
        const player = game.players[playerIndex];
        
        if (player.isHost) {
          this.endGame(game);
        } else {
          game.players.splice(playerIndex, 1);
          this.io.to(gameId).emit('playerLeft', playerId);
        }
        break;
      }
    }
  }

  isHost(playerId, game) {
    return game.hostId === playerId;
  }

  generatePin() {
    let pin;
    do {
      pin = Math.floor(100000 + Math.random() * 900000).toString();
    } while (this.gamesByPin.has(pin));
    return pin;
  }
}

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  new GameServer(io);

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
}); 