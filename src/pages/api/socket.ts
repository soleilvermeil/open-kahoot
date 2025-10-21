import type { NextApiRequest, NextApiResponse } from 'next';
import type { Server as HTTPServer } from 'http';
import type { Socket } from 'net';
import { Server as SocketIOServer } from 'socket.io';

import { GameServer } from '@/lib/game';
import { SOCKET_PATH } from '@/lib/socket-config';
import type { ClientToServerEvents, ServerToClientEvents } from '@/types/game';

type SocketServer = HTTPServer & {
  io?: SocketIOServer<ClientToServerEvents, ServerToClientEvents>;
  gameServer?: GameServer;
};

type NextApiResponseWithSocket = NextApiResponse & {
  socket: Socket & {
    server: SocketServer;
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

function initializeSocketServer(res: NextApiResponseWithSocket) {
  if (res.socket.server.io) {
    return;
  }

  const httpServer = res.socket.server;
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    path: SOCKET_PATH,
    addTrailingSlash: false,
    maxHttpBufferSize: 1e8,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  res.socket.server.io = io;
  res.socket.server.gameServer = new GameServer(io);
}

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponseWithSocket,
) {
  initializeSocketServer(res);

  res.end();
}
