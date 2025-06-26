import { Server as SocketIOServer } from 'socket.io';
import type { 
  ServerToClientEvents,
  ClientToServerEvents 
} from '@/types/game';
import { GameServer } from './game';

export { GameServer } from './game';

// Legacy export for backward compatibility
export const createGameServer = (io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>) => {
  return new GameServer(io);
}; 