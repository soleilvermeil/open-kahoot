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
      console.log(`🔌 [CONNECTION] Player connected: ${socket.id}`);

      socket.on('createGame', (title, questions, settings, callback) => {
        console.log(`🎮 [CREATE_GAME] Host ${socket.id} creating game: "${title}" with ${questions.length} questions`);
        const game = this.createGame(socket.id, title, questions, settings);
        socket.join(game.id);
        console.log(`✅ [CREATE_GAME] Game created successfully - PIN: ${game.pin}, ID: ${game.id}`);
        callback(game);
      });

      socket.on('joinGame', (pin, playerName, persistentId, callback) => {
        // Handle both old and new callback signatures
        const actualCallback = typeof persistentId === 'function' ? persistentId : callback;
        const actualPersistentId = typeof persistentId === 'string' ? persistentId : null;
        
        console.log(`👤 [JOIN_GAME] Player ${socket.id} joining game PIN: ${pin} as "${playerName}" ${actualPersistentId ? `(reconnecting with ID: ${actualPersistentId})` : '(new player)'}`);
        
        const result = this.joinGame(socket.id, pin, playerName, actualPersistentId);
        if (result.success && result.game) {
          socket.join(result.game.id);
          const connectedPlayers = result.game.players.filter(p => !p.isHost && p.isConnected).length;
          console.log(`✅ [JOIN_GAME] Player "${playerName}" ${result.isReconnection ? 'reconnected to' : 'joined'} game ${pin} (${connectedPlayers} connected players)`);
          
          const player = result.game.players.find(p => p.id === result.playerId);
          if (result.isReconnection) {
            this.io.to(result.game.id).emit('playerReconnected', player);
          } else {
            this.io.to(result.game.id).emit('playerJoined', player);
          }
        } else {
          console.log(`❌ [JOIN_GAME] Failed to join game PIN: ${pin} - ${!this.gamesByPin.has(pin) ? 'Game not found' : result.game?.status !== 'waiting' ? 'Game already started' : 'Unknown error'}`);
        }
        
        if (actualCallback) {
          actualCallback(result.success, result.game, result.playerId);
        }
      });

      socket.on('validateGame', (gameId, callback) => {
        const game = this.games.get(gameId);
        if (game && game.players.find(p => p.isHost)) {
          socket.join(game.id);
          callback(true, game);
        } else {
          callback(false);
        }
      });

      socket.on('startGame', (gameId) => {
        const game = this.games.get(gameId);
        if (game && this.isHost(socket.id, game)) {
          this.startGame(game);
        }
      });

      socket.on('submitAnswer', (gameId, questionId, answerIndex, persistentId) => {
        const game = this.games.get(gameId);
        // Try to find player by persistent ID first, then fall back to socket ID
        const player = persistentId 
          ? game?.players.find(p => p.id === persistentId)
          : game?.players.find(p => p.socketId === socket.id);
        console.log(`📝 [SUBMIT_ANSWER] Player "${player?.name || 'Unknown'}" (${persistentId || socket.id}) submitting answer ${answerIndex} for question ${questionId}`);
        if (game && game.status === 'answering') {
          this.submitAnswer(persistentId || socket.id, game, questionId, answerIndex, !!persistentId);
        } else {
          console.log(`❌ [SUBMIT_ANSWER] Rejected - ${!game ? 'Game not found' : `Game status is '${game.status}', expected 'answering'`}`);
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
        console.log(`🔌 [DISCONNECT] Player disconnected: ${socket.id}`);
        this.handleDisconnect(socket.id);
      });
    });
  }

  createGame(hostSocketId, title, questions, settings) {
    const gameId = uuidv4();
    const hostId = uuidv4(); // Generate persistent ID for host
    const pin = this.generatePin();
    
    const game = {
      id: gameId,
      pin,
      hostId: hostId, // Use persistent ID
      title,
      questions,
      settings,
      currentQuestionIndex: -1,
      status: 'waiting',
      players: [{
        id: hostId,
        socketId: hostSocketId,
        name: 'Host',
        score: 0,
        isHost: true,
        isConnected: true
      }]
    };

    this.games.set(gameId, game);
    this.gamesByPin.set(pin, gameId);
    
    return game;
  }

  joinGame(socketId, pin, playerName, persistentId = null) {
    const gameId = this.gamesByPin.get(pin);
    if (!gameId) {
      return { success: false };
    }

    const game = this.games.get(gameId);
    if (!game) {
      return { success: false };
    }

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
      return { success: false, reason: 'Game already started' };
    }

    // Generate new persistent ID if not provided
    const playerId = persistentId || uuidv4();

    const player = {
      id: playerId,
      socketId: socketId,
      name: playerName,
      score: 0,
      isHost: false,
      isConnected: true
    };

    game.players.push(player);
    console.log(`New player ${playerName} joined game ${game.pin}`);
    return { success: true, game, playerId: playerId, isReconnection: false };
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

  submitAnswer(playerId, game, questionId, answerIndex, isPersistentId = false) {
    // Find player by persistent ID or socket ID
    const player = isPersistentId 
      ? game.players.find(p => p.id === playerId)
      : game.players.find(p => p.socketId === playerId);
    const question = game.questions[game.currentQuestionIndex];
    
    if (!player || !question || question.id !== questionId || player.currentAnswer !== undefined) {
      console.log(`❌ [SUBMIT_ANSWER] Rejected answer from ${playerId} - ${!player ? 'Player not found' : !question ? 'Question not found' : question.id !== questionId ? 'Wrong question ID' : 'Already answered'}`);
      return;
    }

    const answerTime = Date.now() - (game.questionStartTime || 0);
    player.currentAnswer = answerIndex;
    player.answerTime = answerTime;

    // Calculate score (more points for correct answers and faster responses)
    const isCorrect = answerIndex === question.correctAnswer;
    let pointsEarned = 0;
    if (isCorrect) {
      const timeBonus = Math.max(0, (game.settings.answerTime * 1000 - answerTime) / 1000);
      pointsEarned = Math.round(1000 + (timeBonus * 10));
      player.score += pointsEarned;
    }

    console.log(`✅ [SUBMIT_ANSWER] Player "${player.name}" answered ${answerIndex} (${isCorrect ? 'CORRECT' : 'WRONG'}) in ${Math.round(answerTime)}ms, earned ${pointsEarned} points (total: ${player.score})`);

    this.io.to(game.id).emit('playerAnswered', player.id);

    // Check if all connected players have answered
    const connectedPlayers = game.players.filter(p => !p.isHost && p.isConnected);
    const answeredPlayers = connectedPlayers.filter(p => p.currentAnswer !== undefined);
    
    // Debug logging to understand the state
    const allPlayers = game.players.filter(p => !p.isHost);
    console.log(`📊 [ANSWER_CHECK] Game ${game.pin} player status:`);
    allPlayers.forEach(p => {
      console.log(`  - ${p.name}: connected=${p.isConnected}, answered=${p.currentAnswer !== undefined}, socketId=${p.socketId}`);
    });
    console.log(`📊 [ANSWER_CHECK] Game ${game.pin}: ${answeredPlayers.length}/${connectedPlayers.length} connected players have answered (${allPlayers.length} total players)`);
    
    if (answeredPlayers.length === connectedPlayers.length && connectedPlayers.length > 0) {
      console.log(`🎯 [ALL_ANSWERED] All connected players answered, ending question early for game ${game.pin}`);
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

    // Send general stats to host
    this.io.to(game.id).emit('questionEnded', stats);

    // Send personalized results to each player
    nonHostPlayers.forEach(player => {
      const wasCorrect = player.currentAnswer === question.correctAnswer;
      let pointsEarned = 0;
      
      if (wasCorrect && player.answerTime) {
        const timeBonus = Math.max(0, (game.settings.answerTime * 1000 - player.answerTime) / 1000);
        pointsEarned = Math.round(1000 + (timeBonus * 10));
      }

      // Calculate position and points behind next player
      const sortedPlayers = [...nonHostPlayers].sort((a, b) => b.score - a.score);
      const playerPosition = sortedPlayers.findIndex(p => p.id === player.id);
      const nextPlayer = sortedPlayers[playerPosition - 1];
      const pointsBehind = nextPlayer ? nextPlayer.score - player.score : 0;

      const personalResult = {
        wasCorrect,
        pointsEarned,
        totalScore: player.score,
        position: playerPosition + 1,
        pointsBehind,
        nextPlayerName: nextPlayer?.name || null
      };

      this.io.to(player.socketId).emit('personalResult', personalResult);
    });
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

  handleDisconnect(socketId) {
    // Find player by socket ID and mark as disconnected
    for (const [gameId, game] of this.games) {
      const player = game.players.find(p => p.socketId === socketId);
      if (player) {
        player.isConnected = false;
        console.log(`💔 [PLAYER_DISCONNECT] Player "${player.name}" (${player.isHost ? 'HOST' : 'PLAYER'}) disconnected from game ${game.pin}`);
        
        if (player.isHost) {
          // If host disconnects, notify players but keep game alive for a while
          console.log(`⚠️ [HOST_DISCONNECT] Host disconnected from game ${game.pin}, giving 2 minutes to reconnect`);
          this.io.to(gameId).emit('playerDisconnected', player.id);
          
          // Give host 2 minutes to reconnect, then end game
          setTimeout(() => {
            const currentPlayer = game.players.find(p => p.id === player.id);
            if (currentPlayer && !currentPlayer.isConnected) {
              console.log(`💀 [HOST_TIMEOUT] Host didn't reconnect within 2 minutes, ending game ${game.pin}`);
              this.endGame(game);
            } else {
              console.log(`✅ [HOST_RECONNECT] Host reconnected to game ${game.pin} within timeout`);
            }
          }, 120000); // 2 minutes
        } else {
          // Regular player disconnected
          const connectedPlayers = game.players.filter(p => !p.isHost && p.isConnected).length;
          console.log(`👋 [PLAYER_DISCONNECT] Regular player disconnected, ${connectedPlayers} players still connected to game ${game.pin}`);
          console.log(`🔍 [DISCONNECT_DEBUG] Game ${game.pin} status: ${game.status}, current question: ${game.currentQuestionIndex + 1}`);
          this.io.to(gameId).emit('playerDisconnected', player.id);
          
          // Remove player after 5 minutes if they don't reconnect
          setTimeout(() => {
            const currentPlayer = game.players.find(p => p.id === player.id);
            if (currentPlayer && !currentPlayer.isConnected) {
              const playerIndex = game.players.findIndex(p => p.id === player.id);
              if (playerIndex !== -1) {
                game.players.splice(playerIndex, 1);
                this.io.to(gameId).emit('playerLeft', player.id);
                console.log(`🗑️ [PLAYER_CLEANUP] Removed inactive player "${player.name}" from game ${game.pin} after 5 minutes`);
              }
            } else {
              console.log(`✅ [PLAYER_RECONNECT] Player "${player.name}" reconnected to game ${game.pin} within timeout`);
            }
          }, 300000); // 5 minutes
        }
        break;
      }
    }
  }

  isHost(socketId, game) {
    // Find player by socket ID and check if they are the host
    const player = game.players.find(p => p.socketId === socketId);
    return player && player.isHost;
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