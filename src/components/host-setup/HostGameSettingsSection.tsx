'use client';

import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  
  return (
    <div className="mb-8 bg-gray-50 rounded-lg p-6 border border-gray-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-black font-medium mb-2">
            {t('host.settings.thinkTime')}
          </label>
          <p className="text-gray-600 text-sm mb-2">
            {t('host.settings.thinkTimeDescription')}
          </p>
          <select
            value={gameSettings.thinkTime}
            onChange={(e) => onUpdateSettings({ ...gameSettings, thinkTime: parseInt(e.target.value) })}
            className={`w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-black focus:outline-none focus:ring-2 ${accent.ringFocus} ${accent.borderFocus} [&>option]:text-black [&>option]:bg-white`}
          >
            <option value={5}>{t('host.settings.default')} (5 {t('host.settings.seconds')})</option>
            <option value={10}>{t('host.settings.longer')} (10 {t('host.settings.seconds')})</option>
            <option value={20}>{t('host.settings.longest')} (20 {t('host.settings.seconds')})</option>
          </select>
        </div>
        <div>
          <label className="block text-black font-medium mb-2">
            {t('host.settings.answerTime')}
          </label>
          <p className="text-gray-600 text-sm mb-2">
            {t('host.settings.answerTimeDescription')}
          </p>
          <select
            value={gameSettings.answerTime}
            onChange={(e) => onUpdateSettings({ ...gameSettings, answerTime: parseInt(e.target.value) })}
            className={`w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-black focus:outline-none focus:ring-2 ${accent.ringFocus} ${accent.borderFocus} [&>option]:text-black [&>option]:bg-white`}
          >
            <option value={20}>{t('host.settings.default')} (20 {t('host.settings.seconds')})</option>
            <option value={30}>{t('host.settings.longer')} (30 {t('host.settings.seconds')})</option>
            <option value={60}>{t('host.settings.longest')} (60 {t('host.settings.seconds')})</option>
          </select>
        </div>
      </div>
    </div>
  );
} 