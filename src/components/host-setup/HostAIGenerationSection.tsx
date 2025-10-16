'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';

interface HostAIGenerationSectionProps {
  onGenerateQuestions: (subject: string, language: 'english' | 'french') => void;
}

const subjectPlaceholders = {
  english: 'e.g., World War II, Photosynthesis, JavaScript Basics...',
  french: 'ex: Seconde Guerre mondiale, Photosynthèse, Bases de JavaScript...'
};

export default function HostAIGenerationSection({ 
  onGenerateQuestions 
}: HostAIGenerationSectionProps) {
  const [subject, setSubject] = useState('');
  const [language, setLanguage] = useState<'english' | 'french'>('english');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!subject.trim()) {
      alert('Please enter a subject for the quiz.');
      return;
    }

    setIsGenerating(true);
    try {
      await onGenerateQuestions(subject, language);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white/5 rounded-lg p-6 border border-white/20 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-white" />
        <h3 className="text-xl text-white font-jua">AI Quiz Generation</h3>
      </div>

      <p className="text-white/80 text-sm mb-4">
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
            className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
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

        <div className="flex justify-center pt-2">
          <Button
            onClick={handleGenerate}
            disabled={!subject.trim() || isGenerating}
            loading={isGenerating}
            variant="black"
            size="lg"
            icon={Sparkles}
          >
            {isGenerating ? 'Generating...' : 'Ask AI'}
          </Button>
        </div>
      </div>

      <p className="text-white/40 text-sm mt-4 text-center">
        The AI will generate multiple-choice questions based on your subject.
      </p>
    </div>
  );
}

