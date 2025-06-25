# Open Kahoot! 🎯

A real-time multiplayer quiz game inspired by Kahoot!, built with Next.js, Socket.io, and TypeScript.

## Features

- Real-time multiplayer gameplay
- Custom quiz creation with multiple-choice questions
- Game PINs for easy joining
- Live leaderboards and scoring
- Player reconnection support
- TSV import/export for questions
- Responsive design

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone and install**
   ```bash
   git clone https://github.com/your-username/open-kahoot-next-ai-v2.git
   cd open-kahoot-next-ai-v2
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open browser**
   
   Navigate to `http://localhost:3000`

## Development

### Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - Code linting

### Tech Stack
- Next.js 15 + React 19
- TypeScript
- Socket.io (real-time)
- Tailwind CSS
- Framer Motion

## Project Structure

```
src/
├── app/           # Next.js pages
├── components/    # UI components  
├── lib/           # Socket setup & utilities
└── types/         # TypeScript definitions
```

## Environment Variables

Optional environment variables you can set:

```bash
# Base URL for sharing links
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

Create a `.env.local` file in the root directory to set these values.

---

**Disclaimer:** Not affiliated with Kahoot! AS. Kahoot! is a trademark of Kahoot! AS.
