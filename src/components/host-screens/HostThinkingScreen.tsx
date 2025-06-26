import { Question } from '@/types/game';
import Card from '@/components/Card';

interface HostThinkingScreenProps {
  currentQuestion: Question;
}

export default function HostThinkingScreen({ currentQuestion }: HostThinkingScreenProps) {
  return (
    <Card className="mb-8">
      <h1 className="text-5xl text-white text-center leading-tight font-jua">
        {currentQuestion.question}
      </h1>
    </Card>
  );
} 