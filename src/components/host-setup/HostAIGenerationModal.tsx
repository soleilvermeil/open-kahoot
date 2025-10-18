'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';

interface HostAIGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateQuestions: (subject: string, language: 'english' | 'french', accessKey: string) => Promise<void>;
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
      await onGenerateQuestions(subject, language, accessKey);
      // Reset form and close modal on success
      setSubject('');
      setAccessKey('');
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
      <p className="text-white/80 text-sm mb-6">
        Let AI create quiz questions for you! Select a language and enter a subject.
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-white text-sm font-medium">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'english' | 'french')}
            disabled={isGenerating}
            className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="english" className="bg-slate-800">English</option>
            <option value="french" className="bg-slate-800">Français</option>
          </select>
        </div>

        <Input
          label="Subject"
          placeholder={subjectPlaceholders[language]}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={isGenerating}
        />

        <Input
          label="Access Key"
          type="password"
          placeholder="Enter AI generation access key"
          value={accessKey}
          onChange={(e) => setAccessKey(e.target.value)}
          disabled={isGenerating}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button
            onClick={handleClose}
            disabled={isGenerating}
            variant="pill"
            size="md"
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!subject.trim() || !accessKey.trim() || isGenerating}
            loading={isGenerating}
            variant="black"
            size="md"
            icon={Sparkles}
          >
            {isGenerating ? 'Generating...' : 'Generate Questions'}
          </Button>
        </div>
      </div>

      <p className="text-white/40 text-sm mt-6 text-center">
        The AI will generate 5 multiple-choice questions based on your subject.
      </p>
    </Modal>
  );
}

