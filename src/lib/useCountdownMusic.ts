import { useEffect, useRef, useState } from 'react';

const COUNTDOWN_TRACKS = [
  '/music/countdown 01.mp3',
  '/music/countdown 02.mp3',
  '/music/countdown 03.mp3',
  '/music/countdown 04.mp3'
];

const GONG_SOUND = '/music/gong.mp3';
const LOBBY_MUSIC = '/music/lobby.mp3';
const BLUP_SOUND = '/music/blup.mp3';

export function useCountdownMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lobbyAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isInLobby, setIsInLobby] = useState(false);

  const playRandomCountdown = () => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Select a random track
    const randomIndex = Math.floor(Math.random() * COUNTDOWN_TRACKS.length);
    const selectedTrack = COUNTDOWN_TRACKS[randomIndex];

    // Create and play new audio
    audioRef.current = new Audio(selectedTrack);
    audioRef.current.volume = 0.6; // Set volume to 60%
    
    audioRef.current.play().catch((error) => {
      console.warn('Failed to play countdown music:', error);
    });
  };

  const playGong = () => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Create and play gong sound
    audioRef.current = new Audio(GONG_SOUND);
    audioRef.current.volume = 0.7; // Slightly louder for impact
    
    audioRef.current.play().catch((error) => {
      console.warn('Failed to play gong sound:', error);
    });
  };

  const startLobbyMusic = () => {
    // Stop any countdown/gong music first, but don't interfere with blup sounds
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // Create and play lobby music (looping)
    lobbyAudioRef.current = new Audio(LOBBY_MUSIC);
    lobbyAudioRef.current.volume = 0.4; // Lower volume for background music
    lobbyAudioRef.current.loop = true; // Loop the lobby music
    setIsInLobby(true);
    
    lobbyAudioRef.current.play().catch((error) => {
      console.warn('Failed to play lobby music:', error);
    });
  };

  const stopLobbyMusic = () => {
    if (lobbyAudioRef.current) {
      lobbyAudioRef.current.pause();
      lobbyAudioRef.current.currentTime = 0;
      lobbyAudioRef.current = null;
    }
    setIsInLobby(false);
  };

  const playBlup = () => {
    // Only play blup sound if we're in lobby phase
    if (!isInLobby) return;
    
    // Create a separate audio instance for blup (don't interrupt lobby music)
    const blupAudio = new Audio(BLUP_SOUND);
    blupAudio.volume = 0.8;
    
    // Play blup sound alongside lobby music
    blupAudio.play().catch((error) => {
      console.warn('Failed to play blup sound:', error);
    });
  };

  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const stopAllMusic = () => {
    stopMusic();
    stopLobbyMusic();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (lobbyAudioRef.current) {
        lobbyAudioRef.current.pause();
        lobbyAudioRef.current = null;
      }
    };
  }, []);

  return { 
    playRandomCountdown, 
    playGong, 
    startLobbyMusic, 
    stopLobbyMusic, 
    playBlup, 
    stopMusic, 
    stopAllMusic,
    isInLobby 
  };
} 