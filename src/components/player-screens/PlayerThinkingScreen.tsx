import Card from '@/components/Card';
import { Question } from '@/types/game';

interface PlayerThinkingScreenProps {
  currentQuestion: Question;
}

export default function PlayerThinkingScreen({ currentQuestion }: PlayerThinkingScreenProps) {
  return (
    <Card className="text-center">
      {currentQuestion.image && (
        <div className="mb-8">
          <img src={currentQuestion.image} alt="Question" className="max-h-64 w-auto mx-auto rounded-lg" />
        </div>
      )}
      <h2 className="text-3xl text-white text-center mb-8 font-jua">
        {currentQuestion.question}
      </h2>
      <p className="text-white/80 text-lg">Prepare to answer!</p>
    </Card>
  );
} 