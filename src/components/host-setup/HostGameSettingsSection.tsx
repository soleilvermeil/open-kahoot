import { Settings } from 'lucide-react';
import type { GameSettings } from '@/types/game';
import { accent } from '@/lib/palette';

interface HostGameSettingsSectionProps {
  gameSettings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
}

export default function HostGameSettingsSection({ 
  gameSettings, 
  onUpdateSettings 
}: HostGameSettingsSectionProps) {
  return (
    <div className="mb-8 bg-gray-50 rounded-lg p-6 border border-gray-300">
      <h2 className="text-2xl text-black mb-4 flex items-center gap-2 font-jua">
        <Settings className="w-6 h-6" />
        Game Settings
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-black font-medium mb-2">
            Think Time (seconds)
          </label>
          <p className="text-gray-600 text-sm mb-2">
            Time to show question before allowing answers
          </p>
          <select
            value={gameSettings.thinkTime}
            onChange={(e) => onUpdateSettings({ ...gameSettings, thinkTime: parseInt(e.target.value) })}
            className={`w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-black focus:outline-none focus:ring-2 ${accent.ringFocus} ${accent.borderFocus} [&>option]:text-black [&>option]:bg-white`}
          >
            <option value={5}>5 seconds</option>
            <option value={10}>10 seconds</option>
            <option value={20}>20 seconds</option>
          </select>
        </div>
        <div>
          <label className="block text-black font-medium mb-2">
            Answer Time (seconds)
          </label>
          <p className="text-gray-600 text-sm mb-2">
            Time allowed to submit answers
          </p>
          <select
            value={gameSettings.answerTime}
            onChange={(e) => onUpdateSettings({ ...gameSettings, answerTime: parseInt(e.target.value) })}
            className={`w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-black focus:outline-none focus:ring-2 ${accent.ringFocus} ${accent.borderFocus} [&>option]:text-black [&>option]:bg-white`}
          >
            <option value={20}>20 seconds</option>
            <option value={30}>30 seconds</option>
            <option value={60}>60 seconds</option>
          </select>
        </div>
      </div>
    </div>
  );
} 