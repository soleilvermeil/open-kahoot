# Open Kahoot! 🎮

A real-time multiplayer quiz application inspired by Kahoot!, built with Next.js, Socket.io, and TailwindCSS.

## Features ✨

- **Host Games**: Create custom quizzes with questions and 4 multiple-choice answers
- **Real-time Multiplayer**: Players join using a 6-digit PIN
- **Live Competition**: Faster answers earn more points
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Score-based Ranking**: Leaderboard with final results

## How It Works 🎯

### For Hosts:
1. Click "Host Game" on the homepage
2. Create your quiz by adding questions with 4 options each
3. Mark the correct answer and set time limits (15-60 seconds)
4. Generate a game PIN and share it with players
5. Start the game when players have joined
6. Control the game flow (next question, view results)

### For Players:
1. Click "Join Game" on the homepage
2. Enter the 6-digit PIN provided by the host
3. Enter your name
4. Wait for the host to start the game
5. Answer questions as fast as possible for more points!

## Technology Stack 🛠️

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Real-time Communication**: Socket.io
- **Icons**: Lucide React
- **Styling**: TailwindCSS with custom gradients and animations

## Getting Started 🚀

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone and navigate to the project**:
   ```bash
   cd open-kahoot
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## Game Flow 📋

1. **Lobby**: Host creates game, players join with PIN
2. **Game Start**: Host starts the game
3. **Questions**: Players answer multiple-choice questions within time limit
4. **Results**: View answer statistics after each question
5. **Final Scores**: Leaderboard showing winners

## Scoring System 🏆

- **Correct Answer**: Points proportional to speed
- **Immediate Answer**: 1000 points (full speed)
- **Half Time**: 500 points (50% speed)
- **Wrong Answer**: 0 points

Formula: `Points = 1000 * (remaining_time / total_time)`

## Real-time Features ⚡

- **Live Player Updates**: See players join/leave in real-time
- **Synchronized Questions**: All players see questions simultaneously
- **Instant Answer Feedback**: Visual confirmation when answers are submitted
- **Live Statistics**: Real-time answer distribution charts

## Game Controls 🎮

### Host Controls:
- Create questions with customizable time limits
- Start/control game flow
- View live answer statistics
- Progress to next questions
- End game

### Player Controls:
- Join games with PIN
- Submit answers within time limit
- View personal and game results

## Architecture 🏗️

```
open-kahoot/
├── src/
│   ├── app/                  # Next.js app router pages
│   │   ├── page.tsx         # Homepage
│   │   ├── host/page.tsx    # Host game creation
│   │   ├── join/page.tsx    # Player join interface
│   │   └── game/[id]/page.tsx # Game interface
│   ├── lib/                 # Utilities
│   │   ├── socket-client.ts # Socket.io client
│   │   └── socket-server.ts # Socket.io server logic
│   └── types/               # TypeScript definitions
│       └── game.ts          # Game-related types
├── server.js                # Custom Socket.io server
└── package.json
```

## API Events 📡

### Client to Server:
- `createGame(title, questions, callback)`
- `joinGame(pin, playerName, callback)`
- `startGame(gameId)`
- `submitAnswer(gameId, questionId, answerIndex)`
- `nextQuestion(gameId)`

### Server to Client:
- `gameJoined(game)`
- `gameStarted(game)`
- `questionStarted(question, timeLimit)`
- `questionEnded(stats)`
- `gameFinished(finalScores)`
- `playerJoined(player)`
- `playerLeft(playerId)`

## Contributing 🤝

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## Future Enhancements 🔮

- [ ] User accounts and saved quizzes
- [ ] Question categories and difficulty levels
- [ ] Voice/video chat during games
- [ ] Mobile app version
- [ ] Advanced analytics and reporting
- [ ] Custom branding options
- [ ] Integration with educational platforms

## License 📄

This project is open source and available under the [MIT License](LICENSE).

## Support 💬

If you encounter any issues or have questions:
1. Check the existing issues
2. Create a new issue with detailed description
3. Include steps to reproduce any bugs

---

**Ready to quiz? Start hosting your first game now!** 🎊
