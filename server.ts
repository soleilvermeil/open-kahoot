import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { GameServer } from './src/lib/game';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000');

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Allow larger payloads (e.g. base64-encoded images) by raising the default 1 MB limit
  const io = new SocketIOServer(httpServer, {
    // 100 MB – adjust as needed but keep a sensible upper bound
    maxHttpBufferSize: 1e8,
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Initialize the modular GameServer
  const gameServer = new GameServer(io);
  
  // Graceful shutdown handling
  process.on('SIGTERM', () => {
    console.log('📡 [SERVER] Received SIGTERM, shutting down gracefully...');
    gameServer.shutdown();
    httpServer.close(() => {
      console.log('📡 [SERVER] HTTP server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('📡 [SERVER] Received SIGINT, shutting down gracefully...');
    gameServer.shutdown();
    httpServer.close(() => {
      console.log('📡 [SERVER] HTTP server closed');
      process.exit(0);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error('📡 [SERVER] Server error:', err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`📡 [SERVER] Ready on http://${hostname}:${port}`);
      console.log(`🎮 [GAME_SERVER] Game server initialized with modular architecture`);
    });
}); 