import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

// Define a simple schema that matches the TSV format
const QuizResponseSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      correct: z.string(),
      wrong1: z.string(),
      wrong2: z.string(),
      wrong3: z.string(),
      explanation: z.string()
    })
  )
});

export async function POST(request: NextRequest) {
  try {
    const { subject, language } = await request.json();

    if (!subject || !language) {
      return NextResponse.json(
        { error: 'Subject and language are required' },
        { status: 400 }
      );
    }

    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey });

    // Generate the prompt based on language
    const prompts = {
      english: `Create 5 multiple-choice quiz questions about "${subject}".

For each question, provide:
- The question text
- 4 answer options (1 correct, 3 incorrect)
- The correct answer
- An optional explanation

Make the questions engaging, educational, and appropriate for a quiz game.`,
      french: `Créez 5 questions de quiz à choix multiples sur "${subject}".

Pour chaque question, fournissez :
- Le texte de la question
- 4 options de réponse (1 correcte, 3 incorrectes)
- La réponse correcte
- Une explication optionnelle

Rendez les questions engageantes, éducatives et appropriées pour un jeu de quiz.`
    };

    const prompt = prompts[language as keyof typeof prompts] || prompts.english;

    // Add JSON schema instructions to the prompt
    const jsonInstructions = `

You must respond with a valid JSON object in the following format:
{
  "questions": [
    {
      "question": "question text here",
      "correct": "correct answer",
      "wrong1": "first wrong answer",
      "wrong2": "second wrong answer",
      "wrong3": "third wrong answer",
      "explanation": "explanation of the answer"
    }
  ]
}`;

    // Call OpenAI API with JSON mode
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: language === 'french' 
            ? 'Vous êtes un expert en création de quiz éducatifs. Créez des questions claires, précises et engageantes en français. Répondez toujours avec un JSON valide.'
            : 'You are an expert at creating educational quizzes. Create clear, accurate, and engaging questions. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt + jsonInstructions
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse and validate the response with Zod
    const jsonResponse = JSON.parse(content);
    const parsed = QuizResponseSchema.parse(jsonResponse);

    return NextResponse.json({
      success: true,
      questions: parsed.questions
    });

  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate questions', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

