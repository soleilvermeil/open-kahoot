# ![Open Kahoot!](banner.png)

A real-time multiplayer quiz game inspired by Kahoot!, built with Next.js, Socket.io, and TypeScript.

## Features

- Real-time multiplayer gameplay
- Custom quiz creation with multiple-choice questions
- TSV import/export for questions

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone and install**
   ```bash
   git clone https://github.com/soleilvermeil/open-kahoot.git
   cd open-kahoot
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

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   
   **On Windows:**
   ```bash
   set NODE_ENV=production && node server.js
   ```
   
   **On Mac/Linux:**
   ```bash
   npm run start
   ```

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
NEXT_PUBLIC_APP_URL=https://www.yourdomain.com
```

Create a `.env.local` file in the root directory to set these values.

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** and test them locally
4. **Commit your changes**: `git commit -m "Add your feature"`
5. **Push to your fork**: `git push origin feature/your-feature-name`
6. **Open a Pull Request**

Please ensure your code follows the existing style and passes linting (`npm run lint`).

## Disclaimer

- Not affiliated with Kahoot! AS. Kahoot! is a trademark of Kahoot! AS.
- A not negligible portion of this codebase was developed with the assistance of AI (Claude 4 Sonnet).
