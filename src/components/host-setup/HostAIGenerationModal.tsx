'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import { accent } from '@/lib/palette';

interface HostAIGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateQuestions: (subject: string, language: 'english' | 'french', accessKey: string, questionCount: number) => Promise<void>;
}

export default function HostAIGenerationModal({ 
  isOpen,
  onClose,
  onGenerateQuestions 
}: HostAIGenerationModalProps) {
  const { t } = useTranslation();
  const [subject, setSubject] = useState('');
  const [language, setLanguage] = useState<'english' | 'french'>('english');
  const [accessKey, setAccessKey] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  const subjectPlaceholders = {
    english: 'e.g., World War II, Photosynthesis, JavaScript Basics...',
    french: 'ex: Seconde Guerre mondiale, Photosynthèse, Bases de JavaScript...'
  };

  const handleGenerate = async () => {
    if (!subject.trim()) {
      alert(t('host.aiModal.errorSubject'));
      return;
    }

    if (!accessKey.trim()) {
      alert(t('host.aiModal.errorAccessKey'));
      return;
    }

    setIsGenerating(true);
    try {
      await onGenerateQuestions(subject, language, accessKey, questionCount);
      // Reset form and close modal on success
      setSubject('');
      setAccessKey('');
      setQuestionCount(5);
      onClose();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('host.aiModal.title')}>
      <p className="text-gray-600 text-sm mb-6">
        {t('host.aiModal.description')}
      </p>

      <div className="space-y-4">

        <Input
        label={t('host.aiModal.accessKey')}
        type="password"
        placeholder={t('host.aiModal.accessKeyPlaceholder')}
        value={accessKey}
        onChange={(e) => setAccessKey(e.target.value)}
        disabled={isGenerating}
        />

        <div className="space-y-2">
          <label className="block text-black text-sm font-medium">
            {t('host.aiModal.language')}
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'english' | 'french')}
            disabled={isGenerating}
            className={`w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-black focus:outline-none focus:ring-2 ${accent.ringFocus} ${accent.borderFocus} cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&>option]:text-black [&>option]:bg-white`}
          >
            <option value="english">{t('host.aiModal.english')}</option>
            <option value="french">{t('host.aiModal.french')}</option>
          </select>
        </div>

        <Input
          label={t('host.aiModal.subject')}
          placeholder={subjectPlaceholders[language]}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={isGenerating}
        />

        <div className="space-y-2">
          <label className="block text-black text-sm font-medium">
            {t('host.aiModal.numberOfQuestions')}
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={questionCount}
            onChange={(e) => setQuestionCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
            disabled={isGenerating}
            className={`w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:ring-2 ${accent.ringFocus} ${accent.borderFocus} disabled:opacity-50 disabled:cursor-not-allowed`}
          />
        </div>

        <div className="flex justify-center pt-2">
          <Button
            onClick={handleGenerate}
            disabled={!subject.trim() || !accessKey.trim() || isGenerating}
            loading={isGenerating}
            variant="primary"
            size="md"
            icon={Sparkles}
          >
            {isGenerating ? t('host.aiModal.generating') : t('host.aiModal.generateQuestions')}
          </Button>
        </div>
      </div>

      <p className="text-gray-500 text-sm mt-4 text-center">
        {t('host.aiModal.warning')}
      </p>
    </Modal>
  );
}

