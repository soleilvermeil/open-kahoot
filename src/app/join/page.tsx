'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, Gamepad2, Lock } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { getSocket } from '@/lib/socket-client';
import type { Game } from '@/types/game';
import Button from '@/components/Button';

function JoinGameForm() {
  const [pin, setPin] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [pinLocked, setPinLocked] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Auto-fill PIN from URL parameter
    const pinFromUrl = searchParams.get('pin');
    if (pinFromUrl) {
      setPin(pinFromUrl);
      setPinLocked(true);
    }
  }, [searchParams]);

  const joinGame = async () => {
    if (!pin || !playerName) return;
    
    setIsJoining(true);
    setError('');
    
    const socket = getSocket();
    
    // Get or generate persistent player ID
    const storageKey = `player_id_${pin}`;
    let persistentId = localStorage.getItem(storageKey);
    
    if (!persistentId) {
      persistentId = uuidv4();
      localStorage.setItem(storageKey, persistentId);
    }
    
    socket.emit('joinGame', pin, playerName, persistentId, (success: boolean, game?: Game, playerId?: string) => {
      setIsJoining(false);
      
      if (success && game && playerId) {
        // Store the player ID for this game
        localStorage.setItem(storageKey, playerId);
        router.push(`/game/${game.id}?player=true`);
      } else {
        setError('Game not found or already started. Please check the PIN and try again.');
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    joinGame();
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 w-full max-w-md">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gamepad2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 font-jua">Join Game</h1>
        <p className="text-white/80">Enter the game PIN and your name to play</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Game PIN
          </label>
          <div className="relative">
            <input
              type="text"
              value={pin}
              onChange={pinLocked ? undefined : (e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              readOnly={pinLocked}
              className={`w-full px-4 py-3 rounded-lg border text-white text-center text-2xl font-bold placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                pinLocked 
                  ? 'bg-white/10 border-white/20 cursor-not-allowed' 
                  : 'bg-white/20 border-white/30'
              }`}
              placeholder="000000"
              maxLength={6}
            />
            {pinLocked && (
              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
            )}
          </div>
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
            className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            placeholder="Enter your name..."
            maxLength={20}
          />
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={!pin || !playerName || isJoining || pin.length !== 6}
          variant="success"
          size="lg"
          fullWidth
          loading={isJoining}
          icon={LogIn}
        >
          Join Game
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-white/60 text-sm">
          Don&apos;t have a PIN? Ask the host to share it with you.
        </p>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-500 p-8">
      <div className="container mx-auto max-w-md">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <Button
            onClick={() => window.location.href = '/'}
            variant="ghost"
            className="text-4xl font-galindo"
          >
            Open Kahoot!
          </Button>
        </div>
        
        <div className="flex items-center justify-center">
          <Suspense fallback={
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 w-full max-w-md">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                <p className="text-white mt-4">Loading...</p>
              </div>
            </div>
          }>
            <JoinGameForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
} 