'use client';

import HostAIGenerationSection from '@/components/host-setup/HostAIGenerationSection';
import PageLayout from '@/components/PageLayout';
import Card from '@/components/Card';

export default function AIGenerationDebugPage() {
  const handleGenerateQuestions = async (subject: string, language: 'english' | 'french') => {
    // Generate the prompt based on language
    const prompts = {
      english: `Create 5 multiple-choice quiz questions about "${subject}".

For each question, provide:
- The question text
- 4 answer options (1 correct, 3 incorrect)
- The correct answer
- An optional explanation

Format the response as a TSV (tab-separated values) with columns: question, correct, wrong1, wrong2, wrong3, explanation

Make the questions engaging, educational, and appropriate for a quiz game.`,
      french: `Créez 5 questions de quiz à choix multiples sur "${subject}".

Pour chaque question, fournissez :
- Le texte de la question
- 4 options de réponse (1 correcte, 3 incorrectes)
- La réponse correcte
- Une explication optionnelle

Formatez la réponse en TSV (valeurs séparées par des tabulations) avec les colonnes : question, correct, wrong1, wrong2, wrong3, explanation

Rendez les questions engageantes, éducatives et appropriées pour un jeu de quiz.`
    };

    const prompt = prompts[language];
    
    // Log to console for debugging
    console.log('AI Generation requested:', { subject, language });
    console.log('Prompt:', prompt);
    
    // Display the prompt for debugging
    alert(`AI generation requested!\n\nSubject: ${subject}\nLanguage: ${language}\n\n--- PROMPT ---\n${prompt}\n\n(AI logic not yet implemented)`);
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

