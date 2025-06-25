'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, Lock } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { getSocket } from '@/lib/socket-client';
import type { Game } from '@/types/game';
import Button from '@/components/Button';
import PageLayout from '@/components/PageLayout';
import Card from '@/components/Card';
import Input from '@/components/Input';
import LoadingScreen from '@/components/LoadingScreen';

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
    <Card className="w-full max-w-md">
      <div className="text-center mb-8">
        {/* <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gamepad2 className="w-8 h-8 text-white" />
        </div> */}
        <h1 className="text-3xl text-white mb-2 font-jua">Join Game</h1>
        {/* <p className="text-white/80">Enter the game PIN and your name to play</p> */}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">

          <Input
            label="Game PIN"
            type="tel"
            inputMode="numeric"
            value={pin}
            onChange={pinLocked ? undefined : (e) => {
              setPin(e.target.value.replace(/\D/g, '').slice(0, 6));
              setError(''); // Clear error when user starts typing
            }}
            readOnly={pinLocked}
            variant="center"
            placeholder="000000"
            maxLength={6}
            className={pinLocked ? 'bg-white/10 border-white/20 cursor-not-allowed' : ''}
          />
          {pinLocked && (
            <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
          )}
        </div>

        <Input
          label="Your Name"
          type="text"
          value={playerName}
          onChange={(e) => {
            setPlayerName(e.target.value.slice(0, 20));
            setError(''); // Clear error when user starts typing
          }}
          placeholder="Enter your name..."
          maxLength={20}
          // error={error}
        />

        {error && (
          <div className="bg-red-500 border border-none rounded-lg p-3">
            <p className="text-white text-sm">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={!pin || !playerName || isJoining || pin.length !== 6}
          variant="black"
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
    </Card>
  );
}

export default function JoinPage() {
  return (
    <PageLayout gradient="join" maxWidth="md">
      <div className="flex items-center justify-center">
        <Suspense fallback={
          <Card className="w-full max-w-md">
            <LoadingScreen title="Loading..." size="sm" />
          </Card>
        }>
          <JoinGameForm />
        </Suspense>
      </div>
    </PageLayout>
  );
} 