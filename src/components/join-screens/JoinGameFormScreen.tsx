'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, Lock, Dice6 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { getSocket } from '@/lib/socket-client';
import type { Game } from '@/types/game';
import { gameConfig, featureConfig } from '@/lib/config';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';

export default function JoinGameFormScreen() {
  const [pin, setPin] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [pinLocked, setPinLocked] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const pinLength = gameConfig.pinLength;

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

  const generateRandomNickname = () => {
    const prefixes = [
      'Swift', 'Mighty', 'Shadow', 'Fire', 'Ice', 'Storm', 'Wild', 'Dark', 'Bright', 'Silent',
      'Golden', 'Silver', 'Red', 'Blue', 'Green', 'Purple', 'Cosmic', 'Lightning', 'Thunder', 'Frost',
      'Wolf', 'Eagle', 'Tiger', 'Dragon', 'Lion', 'Bear', 'Fox', 'Hawk', 'Shark', 'Raven',
      'Steel', 'Crystal', 'Phantom', 'Mystic', 'Savage', 'Noble', 'Royal', 'Ancient', 'Blazing', 'Frozen'
    ];
    
    const suffixes = [
      'Hunter', 'Warrior', 'Mage', 'Knight', 'Ninja', 'Master', 'Legend', 'Hero', 'Champion', 'Guardian',
      'Blade', 'Arrow', 'Shield', 'Staff', 'Sword', 'Bow', 'Hammer', 'Axe', 'Spear', 'Dagger',
      'Slayer', 'Breaker', 'Rider', 'Walker', 'Runner', 'Jumper', 'Striker', 'Fighter', 'Crusher', 'Bender',
      'Wing', 'Claw', 'Fang', 'Eye', 'Heart', 'Soul', 'Spirit', 'Force', 'Power', 'Storm'
    ];
    
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    setPlayerName(`${randomPrefix}${randomSuffix}`);
    setError(''); // Clear error when generating name
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    joinGame();
  };

  return (
    <Card className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl text-black mb-2 font-jua">Join Game</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Game PIN"
          type="tel"
          inputMode="numeric"
          value={pin}
          onChange={pinLocked ? undefined : (e) => {
            setPin(e.target.value.replace(/\D/g, '').slice(0, pinLength));
            setError(''); // Clear error when user starts typing
          }}
          readOnly={pinLocked}
          variant="center"
          placeholder={"0".repeat(pinLength)}
          maxLength={pinLength}
          className={pinLocked ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : ''}
          icon={pinLocked ? Lock : undefined}
        />

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
          actionButton={featureConfig.showRandomNickname ? {
            icon: Dice6,
            onClick: generateRandomNickname,
            title: "Generate random nickname"
          } : undefined}
        />

        {error && (
          <div className="bg-red-500 border border-none rounded-lg p-3">
            <p className="text-white text-sm">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={!pin || !playerName || isJoining || pin.length !== pinLength}
          variant="primary"
          size="lg"
          fullWidth
          loading={isJoining}
          icon={LogIn}
        >
          Join Game
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">
          Don&apos;t have a PIN? Ask the host to share it with you.
        </p>
      </div>
    </Card>
  );
} 