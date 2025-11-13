'use client';

import Link from 'next/link';
import { Eye, Users, Play, Clock, Trophy, Settings, LogIn } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import Card from '@/components/Card';

export default function DebugIndexPage() {
  const debugScreens = [
    {
      title: 'Host Setup',
      screens: [
        { name: 'Quiz Creation', path: '/debug/host-quiz-creation', icon: Settings },
        { name: 'Game Lobby', path: '/debug/host-lobby', icon: Users },
      ]
    },
    {
      title: 'Join Flow',
      screens: [
        { name: 'Join Game Form', path: '/debug/join-form', icon: LogIn },
      ]
    },
    {
      title: 'Game Phases (Host View)',
      screens: [
        { name: 'Waiting Screen', path: '/debug/game-waiting', icon: Clock },
        { name: 'Thinking Phase', path: '/debug/game-thinking?view=host', icon: Eye },
        { name: 'Answering Phase', path: '/debug/game-answering?view=host', icon: Play },
        { name: 'Results Phase', path: '/debug/game-results?view=host', icon: Trophy },
        { name: 'Leaderboard', path: '/debug/game-leaderboard', icon: Trophy },
        { name: 'Final Results', path: '/debug/game-final-results?view=host', icon: Trophy },
      ]
    },
    {
      title: 'Game Phases (Player View)',
      screens: [
        { name: 'Thinking Phase', path: '/debug/game-thinking?view=player', icon: Eye },
        { name: 'Answering Phase', path: '/debug/game-answering?view=player', icon: Play },
        { name: 'Answering Phase (Answered)', path: '/debug/game-answering-answered', icon: Play },
        { name: 'Results Phase (Correct)', path: '/debug/game-results?view=player&result=correct', icon: Trophy },
        { name: 'Results Phase (Incorrect)', path: '/debug/game-results?view=player&result=incorrect', icon: Trophy },
        { name: 'Player Waiting', path: '/debug/game-player-waiting', icon: Clock },
        { name: 'Final Results', path: '/debug/game-final-results?view=player', icon: Trophy },
      ]
    },
    {
      title: 'System Screens',
      screens: [
        { name: 'Validation Screen', path: '/debug/game-validation', icon: Clock },
        { name: 'Waiting for Results (Host)', path: '/debug/game-waiting-for-results?view=host', icon: Clock },
        { name: 'Waiting for Results (Player)', path: '/debug/game-waiting-for-results?view=player', icon: Clock },
        { name: 'Error Screen', path: '/debug/game-error', icon: Eye },
        { name: 'Fallback Screen', path: '/debug/game-fallback', icon: Eye },
      ]
    },
  ];

  return (
    <PageLayout gradient="host" maxWidth="4xl">
      <Card>
        <div className="text-center mb-8">
          <h1 className="text-3xl text-black mb-2 font-jua">Debug Screens</h1>
          <p className="text-gray-600">Preview all game layouts and phases</p>
        </div>

        <div className="space-y-8">
          {debugScreens.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h2 className="text-xl text-black mb-4 font-jua">{section.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.screens.map((screen, screenIndex) => (
                  <Link
                    key={screenIndex}
                    href={screen.path}
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-300"
                  >
                    <div className="flex items-center gap-3">
                      <screen.icon className="w-5 h-5 text-black" />
                      <span className="text-black text-sm font-medium">{screen.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </PageLayout>
  );
} 