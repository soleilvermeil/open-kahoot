import { getChoiceColor } from '@/lib/palette';
import { Question } from '@/types/game';

interface PlayerAnsweringScreenProps {
  onSubmitAnswer: (answerIndex: number) => void;
  currentQuestion: Question;
}

export default function PlayerAnsweringScreen({ 
  onSubmitAnswer,
  currentQuestion
}: PlayerAnsweringScreenProps) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      {currentQuestion.image && (
        <div className="mb-8">
          <img src={currentQuestion.image} alt="Question" className="max-h-64 w-auto mx-auto rounded-lg" />
        </div>
      )}
      <h2 className="text-3xl text-white text-center mb-8 font-jua">
        {currentQuestion.question}
      </h2>
      <div className="grid grid-cols-2 gap-6">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSubmitAnswer(index)}
            className={`h-24 rounded-xl font-bold text-3xl text-white transition-all transform hover:scale-105 border-4 ${getChoiceColor(index)} hover:scale-110`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
} 