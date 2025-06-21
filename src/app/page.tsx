'use client';

import Link from 'next/link';
import { Users, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center">
          <div className="py-12 mb-8">
            <h1 className="text-7xl text-white font-galindo">Open Kahoot!</h1>
          </div>
        </div>

        {/* Action Cards */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Host Game Card */}
          <Link href="/host" className="group">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="text-center">
                <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4 font-jua">Host Game</h2>
                <p className="text-white/80 text-lg mb-6">
                  Create your own quiz with custom questions and let players join with a game pin
                </p>
                <div className="bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold group-hover:bg-orange-600 transition-colors">
                  Create Game →
                </div>
              </div>
            </div>
          </Link>

          {/* Join Game Card */}
          <Link href="/join" className="group">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4 font-jua">Join Game</h2>
                <p className="text-white/80 text-lg mb-6">
                  Enter a game pin to join an existing quiz and compete with other players
                </p>
                <div className="bg-green-500 text-white py-3 px-6 rounded-lg font-semibold group-hover:bg-green-600 transition-colors">
                  Join Game →
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Features */}
        <div className="max-w-3xl mx-auto mt-16 text-center">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-white">
              <div className="text-4xl mb-2">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Real-time</h3>
              <p className="text-white/70">
                Instant synchronization across all devices
              </p>
            </div>
            <div className="text-white">
              <div className="text-4xl mb-2">🏆</div>
              <h3 className="text-lg font-semibold mb-2">Competitive</h3>
              <p className="text-white/70">
                Faster answers earn more points
              </p>
            </div>
            <div className="text-white">
              <div className="text-4xl mb-2">🎯</div>
              <h3 className="text-lg font-semibold mb-2">Custom Quizzes</h3>
              <p className="text-white/70">
                Create your own questions and answers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
