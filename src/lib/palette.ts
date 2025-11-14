// Color Palette for Open Kahoot Application
// Flat design with white/black and purple/white colors

// Accent color (purple) - centralized for easy theme changes
// Change these values to change the accent color throughout the app
const accentColor = {
  bg: 'bg-indigo-600',
  bgHover: 'hover:bg-indigo-700',
  bgLight: 'bg-indigo-500',
  text: 'text-indigo-600',
  textHover: 'hover:text-indigo-700',
  border: 'border-indigo-500',
  borderHover: 'border-indigo-600',
  ring: 'ring-indigo-500/50',
  ringFocus: 'focus:ring-indigo-500/50',
  borderFocus: 'focus:border-indigo-500'
};

export const palette = {
  // Accent color - centralized for easy theme changes
  accent: accentColor,

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

  // Button variant colors - flat design
  buttons: {
    primary: {
      background: accentColor.bg,
      hover: accentColor.bgHover,
      text: 'text-white'
    },
    secondary: {
      background: 'bg-white',
      hover: 'hover:bg-gray-100',
      text: 'text-black',
      border: 'border border-gray-300'
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
      hover: 'hover:bg-gray-100',
      text: 'text-black'
    }
  },

  // Action card variants - flat design
  actionCards: {
    host: {
      icon: accentColor.bg,
      button: accentColor.bg,
      buttonHover: `group-${accentColor.bgHover}`
    },
    join: {
      icon: accentColor.bg,
      button: accentColor.bg,
      buttonHover: `group-${accentColor.bgHover}`
    }
  },

  // Answer choice colors (A, B, C, D) - KEEP THESE AS IS
  choices: {
    a: 'bg-rose-500 hover:bg-rose-600 border-rose-400',
    b: 'bg-blue-600 hover:bg-blue-700 border-blue-500',
    c: 'bg-amber-400 hover:bg-amber-500 border-amber-300',
    d: 'bg-emerald-500 hover:bg-emerald-600 border-emerald-400'
  },

  // Timer colors
  timer: {
    thinking: accentColor.bg,
    answering: 'bg-white',
    progress: 'bg-gray-200'
  },

  // Background colors for different page states - flat design
  gradients: {
    loading: 'bg-transparent', // Transparent to show body background pattern
    error: 'bg-transparent', // Transparent to show body background pattern
    join: 'bg-transparent', // Transparent to show body background pattern
    host: 'bg-transparent', // Transparent to show body background pattern
    leaderboard: accentColor.bg, // Purple background
    finished: accentColor.bg, // Purple background
    thinking: 'bg-transparent', // Transparent to show body background pattern
    answering: 'bg-transparent', // Transparent to show body background pattern
    results: 'bg-transparent', // Transparent to show body background pattern
    correct: 'bg-green-500', // Green for correct
    incorrect: 'bg-red-500', // Red for incorrect
    waiting: 'bg-transparent', // Transparent to show body background pattern
    home: 'bg-transparent', // Transparent to show body background pattern
  },

  // Flat card styles (replacing glass morphism)
  card: {
    primary: 'bg-white border border-gray-300',
    secondary: 'bg-white border border-gray-200',
    hover: 'hover:bg-gray-50',
    strong: `${accentColor.bg} border ${accentColor.borderHover}`
  },

  // Text colors - flat design
  text: {
    primary: 'text-black', // Black on white
    secondary: 'text-gray-600',
    tertiary: 'text-gray-400',
    quaternary: 'text-gray-300',
    accent: accentColor.text,
    // White text for purple backgrounds
    onPurple: 'text-white',
    onPurpleSecondary: 'text-white/90',
    onPurpleTertiary: 'text-white/70'
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
export const { correct, incorrect, buttons, gradients, card, text, choices, actionCards, accent } = palette;
