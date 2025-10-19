'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import Card from '@/components/Card';
import Button from '@/components/Button';
import HostAIGenerationModal from '@/components/host-setup/HostAIGenerationModal';

export default function AIGenerationDebugPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGenerateQuestions = async (subject: string, language: 'english' | 'french', accessKey: string, questionCount: number) => {
    try {
      console.log('AI Generation requested:', { subject, language, accessKey, questionCount });
      
      // Call the API endpoint
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject, language, accessKey, questionCount }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate questions');
      }

      if (!data.success || !data.questions) {
        throw new Error('Invalid response from API');
      }

      // Display the generated questions
      console.log('Generated questions:', data.questions);
      
      const questionsText = data.questions.map((q: {
        question: string;
        correct: string;
        wrong1: string;
        wrong2: string;
        wrong3: string;
        explanation?: string;
      }, i: number) => 
        `\n${i + 1}. ${q.question}\n   ✓ ${q.correct}\n   ✗ ${q.wrong1}\n   ✗ ${q.wrong2}\n   ✗ ${q.wrong3}${q.explanation ? `\n   💡 ${q.explanation}` : ''}`
      ).join('\n');

      alert(`Successfully generated ${data.questions.length} questions!${questionsText}`);
      
    } catch (error) {
      console.error('Error generating questions:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to generate questions'}`);
    }
  };

  return (
    <PageLayout gradient="host" maxWidth="4xl">
      <Card>
        <h2 className="text-3xl text-white mb-8 text-center font-jua">AI Generation Modal - Debug</h2>
        
        <div>
          <div className="text-center mb-6">
            <p className="text-white/80 mb-4">
              This page demonstrates the AI generation modal functionality.
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="black"
              size="lg"
              icon={Sparkles}
            >
              Open AI Generation Modal
            </Button>
          </div>
          
          <p className="text-white/60 text-center mt-4">
            Click the button to open the modal and test AI question generation.
          </p>
        </div>
      </Card>

      <HostAIGenerationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerateQuestions={handleGenerateQuestions}
      />
    </PageLayout>
  );
}

