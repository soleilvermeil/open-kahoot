'use client';

import HostAIGenerationSection from '@/components/host-setup/HostAIGenerationSection';
import PageLayout from '@/components/PageLayout';
import Card from '@/components/Card';

export default function AIGenerationDebugPage() {
  const handleGenerateQuestions = async (subject: string, language: 'english' | 'french', accessKey: string) => {
    try {
      console.log('AI Generation requested:', { subject, language, accessKey });
      
      // Call the API endpoint
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject, language, accessKey }),
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
        <h2 className="text-3xl text-white mb-8 text-center font-jua">AI Generation Section - Debug</h2>
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl text-white font-jua">Questions</h3>
          </div>
          
          <HostAIGenerationSection onGenerateQuestions={handleGenerateQuestions} />
          
          <p className="text-white/60 text-center mt-4">
            This shows how the AI Generation section appears within the Questions section.
          </p>
        </div>
      </Card>
    </PageLayout>
  );
}

