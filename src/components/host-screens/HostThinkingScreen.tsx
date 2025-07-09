import { Question } from '@/types/game';
import Card from '@/components/Card';
import Image from 'next/image';

interface HostThinkingScreenProps {
  currentQuestion: Question;
}

export default function HostThinkingScreen({ currentQuestion }: HostThinkingScreenProps) {
  return (
    <Card className="mb-8">
      {currentQuestion.image && (
        <div className="mb-8">
          <Image src={currentQuestion.image} alt="Question" width={600} height={400} className="max-h-96 w-auto mx-auto rounded-lg" />
        </div>
      )}
      <h1 className="text-5xl text-white text-center leading-tight font-jua">
        {currentQuestion.question}
      </h1>
    </Card>
  );
} 