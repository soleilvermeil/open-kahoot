/**
 * Application configuration with environment variable loading and defaults
 */

interface AppConfig {
  app: {
    url: string;
  };
  game: {
    pinLength: number;
  };
  features: {
    showRandomNickname: boolean;
  };
}

/**
 * Load and validate environment variables with defaults
 */
function loadConfig(): AppConfig {
  // App configuration
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Game configuration
  const pinLengthEnv = process.env.NEXT_PUBLIC_GAME_PIN_LENGTH || '6';
  const pinLength = parseInt(pinLengthEnv, 10);
  
  // Validate PIN length
  if (isNaN(pinLength) || pinLength < 3 || pinLength > 10) {
    console.warn(`Invalid NEXT_PUBLIC_GAME_PIN_LENGTH: "${pinLengthEnv}". Using default value 6.`);
  }
  
  // Feature flags
  const showRandomNicknameEnv = process.env.NEXT_PUBLIC_SHOW_RANDOM_NICKNAME || '0';
  const showRandomNickname = showRandomNicknameEnv === '1';
  
  return {
    app: {
      url: appUrl,
    },
    game: {
      pinLength: (isNaN(pinLength) || pinLength < 3 || pinLength > 10) ? 6 : pinLength,
    },
    features: {
      showRandomNickname,
    },
  };
}

// Export the configuration singleton
export const config = loadConfig();

// Export individual config sections for convenience
export const { app: appConfig, game: gameConfig, features: featureConfig } = config;

// Type exports for external use
export type { AppConfig }; 