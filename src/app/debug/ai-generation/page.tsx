'use client';

import HostAIGenerationSection from '@/components/host-setup/HostAIGenerationSection';
import PageLayout from '@/components/PageLayout';
import Card from '@/components/Card';

export default function AIGenerationDebugPage() {
  const handleGenerateQuestions = async (subject: string, language: 'english' | 'french') => {
    console.log('AI Generation requested:', { subject, language });
    alert(`AI generation requested!\nSubject: ${subject}\nLanguage: ${language}\n\n(AI logic not yet implemented)`);
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

