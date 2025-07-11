import { useEffect, useRef, useState, useCallback } from 'react';

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

  // Use useCallback to keep the same function reference between renders so
  // that React effects depending on these callbacks do NOT re-run on every
  // component re-render (e.g. every second during a countdown).

  const playRandomCountdown = useCallback(() => {
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
    audioRef.current.loop = false; // Countdown tracks should not loop
 
    audioRef.current.play().catch((error) => {
      console.warn('Failed to play countdown music:', error);
    });
  }, []);

  const playGong = useCallback(() => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Create and play gong sound
    audioRef.current = new Audio(GONG_SOUND);
    audioRef.current.volume = 0.7; // Slightly louder for impact
    audioRef.current.loop = false; // Gong should only play once
 
    audioRef.current.play().catch((error) => {
      console.warn('Failed to play gong sound:', error);
    });
  }, []);

  const startLobbyMusic = useCallback(() => {
    // If lobby music is already playing, do NOT restart it.
    if (lobbyAudioRef.current && !lobbyAudioRef.current.paused) {
      return;
    }

    // Stop any countdown/gong music first, but don't interfere with blup sounds
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // Either resume existing lobby track (if paused) or create a new one
    if (!lobbyAudioRef.current) {
      lobbyAudioRef.current = new Audio(LOBBY_MUSIC);
      lobbyAudioRef.current.loop = true; // Loop the lobby music
      lobbyAudioRef.current.volume = 0.4; // Lower volume for background music
    }

    setIsInLobby(true);
    
    lobbyAudioRef.current.play().catch((error) => {
      console.warn('Failed to play lobby music:', error);
    });
  }, []);

  const stopLobbyMusic = useCallback(() => {
    if (lobbyAudioRef.current) {
      lobbyAudioRef.current.pause();
      lobbyAudioRef.current.currentTime = 0;
      lobbyAudioRef.current = null;
    }
    setIsInLobby(false);
  }, []);

  const playBlup = useCallback(() => {
    // Only play blup sound if we're in lobby phase
    if (!isInLobby) return;
    
    // Create a separate audio instance for blup (don't interrupt lobby music)
    const blupAudio = new Audio(BLUP_SOUND);
    blupAudio.volume = 0.8;
    
    // Play blup sound alongside lobby music
    blupAudio.play().catch((error) => {
      console.warn('Failed to play blup sound:', error);
    });
  }, [isInLobby]);

  const stopMusic = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const stopAllMusic = useCallback(() => {
    stopMusic();
    stopLobbyMusic();
  }, [stopMusic, stopLobbyMusic]);

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