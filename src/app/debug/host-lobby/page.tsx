'use client';

import HostGameLobbyScreen from '@/components/host-setup/HostGameLobbyScreen';
import { mockGame } from '@/lib/debug-data';

export default function DebugHostLobbyPage() {
  const joinUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000'}/join?pin=${mockGame.pin}`;

  const handleStartGame = () => {
    console.log('Start game');
  };

  const handleToggleDyslexiaSupport = (playerId: string) => {
    console.log('Toggle dyslexia support for player:', playerId);
  };

  return (
    <HostGameLobbyScreen
      game={mockGame}
      joinUrl={joinUrl}
      onStartGame={handleStartGame}
      onToggleDyslexiaSupport={handleToggleDyslexiaSupport}
    />
  );
} 