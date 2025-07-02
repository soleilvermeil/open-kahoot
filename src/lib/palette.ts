// Color Palette for Open Kahoot Application
// Centralized color definitions for consistent styling

export const palette = {
  // Primary colors for correct/incorrect states
  correct: {
    primary: 'bg-green-400',
    secondary: 'bg-green-500',
    tertiary: 'bg-green-600',
    border: 'border-green-400',
    ring: 'ring-green-300',
    text: 'text-green-300',
    background: 'bg-green-500/30'
  },
  
  incorrect: {
    primary: 'bg-red-400',
    secondary: 'bg-red-500',
    tertiary: 'bg-red-600',
    border: 'border-red-400',
    ring: 'ring-red-300',
    text: 'text-red-300',
    background: 'bg-red-500/30'
  },

  // Button variant colors
  buttons: {
    primary: {
      background: 'bg-blue-600',
      hover: 'hover:bg-blue-700',
      text: 'text-white'
    },
    secondary: {
      background: 'bg-white/20',
      hover: 'hover:bg-white/30',
      text: 'text-white'
    },
    success: {
      background: 'bg-green-600',
      hover: 'hover:bg-green-700',
      text: 'text-white'
    },
    danger: {
      background: 'bg-red-600',
      hover: 'hover:bg-red-700',
      text: 'text-white'
    },
    warning: {
      background: 'bg-yellow-600',
      hover: 'hover:bg-yellow-700',
      text: 'text-white'
    },
    ghost: {
      background: 'bg-transparent',
      hover: 'hover:bg-white/10',
      text: 'text-white'
    }
  },

  // Action card variants
  actionCards: {
    host: {
      icon: 'bg-orange-500',
      button: 'bg-orange-500',
      buttonHover: 'group-hover:bg-orange-600'
    },
    join: {
      icon: 'bg-green-500',
      button: 'bg-green-500',
      buttonHover: 'group-hover:bg-green-600'
    }
  },

  // Answer choice colors (A, B, C, D)
  choices: {
    a: 'bg-rose-500 hover:bg-rose-600 border-rose-400',
    b: 'bg-blue-600 hover:bg-blue-700 border-blue-500',
    c: 'bg-amber-400 hover:bg-amber-500 border-amber-300',
    d: 'bg-emerald-500 hover:bg-emerald-600 border-emerald-400'
  },

  // Timer colors
  timer: {
    thinking: 'bg-white',
    answering: 'bg-white',
    progress: 'bg-white/20'
  },

  // Background gradients for different page states
  // gradients: {
  //   loading: 'bg-gradient-to-br from-gray-600 to-gray-800',
  //   error: 'bg-gradient-to-br from-red-600 to-red-800',
  //   join: 'bg-gradient-to-br from-green-500 to-blue-500',
  //   host: 'bg-gradient-to-br from-orange-500 to-red-500',
  //   leaderboard: 'bg-gradient-to-br from-purple-600 to-indigo-600',
  //   finished: 'bg-gradient-to-br from-yellow-500 to-orange-500',
  //   thinking: 'bg-gradient-to-br from-indigo-600 to-purple-600',
  //   answering: 'bg-gradient-to-br from-blue-600 to-purple-600',
  //   results: 'bg-gradient-to-br from-green-600 to-blue-600',
  //   waiting: 'bg-gradient-to-br from-purple-600 to-blue-600',
  //   home: 'bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500'
  // },
  gradients: {
    loading: 'bg-gradient-to-br from-indigo-600 to-violet-600', // Purple
    error: 'bg-gradient-to-br from-orange-500 via-red-500 to-rose-500', // Orange
    join: 'bg-gradient-to-br from-green-500 to-blue-500', // Green
    host: 'bg-gradient-to-br from-orange-500 via-red-500 to-rose-500', // Orange
    leaderboard: 'bg-gradient-to-br from-indigo-600 to-violet-600', // Purple
    finished: 'bg-gradient-to-br from-indigo-600 to-violet-600', // Purple
    thinking: 'bg-gradient-to-br from-indigo-600 to-violet-600', // Purple
    answering: 'bg-gradient-to-br from-indigo-600 to-violet-600', // Purple
    results: 'bg-gradient-to-br from-indigo-600 to-violet-600', // Purple
    correct: 'bg-gradient-to-br from-green-500 to-blue-500', // Green
    incorrect: 'bg-gradient-to-br from-orange-500 via-red-500 to-rose-500', // Orange
    waiting: 'bg-gradient-to-br from-indigo-600 to-violet-600', // Purple
    home: 'bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500', // HOME ONLY
  },


  // Glass morphism and transparency effects
  glass: {
    primary: 'bg-white/10 backdrop-blur-lg border border-white/20',
    secondary: 'bg-white/20 backdrop-blur-lg border border-white/30',
    hover: 'hover:bg-white/20',
    strong: 'bg-white/30 backdrop-blur-lg border border-white/40'
  },

  // Text colors
  text: {
    primary: 'text-white',
    secondary: 'text-white/80',
    tertiary: 'text-white/60',
    quaternary: 'text-white/40',
    accent: 'text-yellow-300'
  },

  // Status colors
  status: {
    online: 'bg-green-500',
    offline: 'bg-gray-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500'
  }
} as const;

// Uncomment the line below to use consolidated gradients (reduces from 11 to 7 unique gradients)
// palette.gradients = palette.gradients_consolidated;

// Helper functions for dynamic color selection
export const getChoiceColor = (index: number): string => {
  const colors = [
    palette.choices.a,
    palette.choices.b, 
    palette.choices.c,
    palette.choices.d
  ];
  return colors[index] || palette.choices.a;
};

export const getGradient = (variant: keyof typeof palette.gradients): string => {
  return palette.gradients[variant];
};

export const getButtonStyle = (variant: keyof typeof palette.buttons): string => {
  const button = palette.buttons[variant];
  return `${button.background} ${button.hover} ${button.text}`;
};

// Export individual palettes for easier imports
export const { correct, incorrect, buttons, gradients, glass, text, choices, actionCards } = palette; 