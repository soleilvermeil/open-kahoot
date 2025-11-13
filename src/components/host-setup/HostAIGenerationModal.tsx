'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';

interface HostAIGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateQuestions: (subject: string, language: 'english' | 'french', accessKey: string, questionCount: number) => Promise<void>;
}

const subjectPlaceholders = {
  english: 'e.g., World War II, Photosynthesis, JavaScript Basics...',
  french: 'ex: Seconde Guerre mondiale, Photosynthèse, Bases de JavaScript...'
};

export default function HostAIGenerationModal({ 
  isOpen,
  onClose,
  onGenerateQuestions 
}: HostAIGenerationModalProps) {
  const [subject, setSubject] = useState('');
  const [language, setLanguage] = useState<'english' | 'french'>('english');
  const [accessKey, setAccessKey] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!subject.trim()) {
      alert('Please enter a subject for the quiz.');
      return;
    }

    if (!accessKey.trim()) {
      alert('Please enter the AI generation access key.');
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
    <Modal isOpen={isOpen} onClose={handleClose} title="AI Quiz Generation">
      <p className="text-gray-600 text-sm mb-6">
        Let AI create quiz questions for you! Select a language and enter a subject.
      </p>

      <div className="space-y-4">

        <Input
        label="Access Key"
        type="password"
        placeholder="Enter AI generation access key"
        value={accessKey}
        onChange={(e) => setAccessKey(e.target.value)}
        disabled={isGenerating}
        />

        <div className="space-y-2">
          <label className="block text-black text-sm font-medium">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'english' | 'french')}
            disabled={isGenerating}
            className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&>option]:text-black [&>option]:bg-white"
          >
            <option value="english">English</option>
            <option value="french">Français</option>
          </select>
        </div>

        <Input
          label="Subject"
          placeholder={subjectPlaceholders[language]}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={isGenerating}
        />

        <div className="space-y-2">
          <label className="block text-black text-sm font-medium">
            Number of Questions
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={questionCount}
            onChange={(e) => setQuestionCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
            disabled={isGenerating}
            className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
            {isGenerating ? 'Generating...' : 'Generate Questions'}
          </Button>
        </div>
      </div>

      <p className="text-gray-500 text-sm mt-4 text-center">
        ⚠️ AI-generated content may contain inaccuracies. Please review and verify all questions before use.
      </p>
    </Modal>
  );
}

