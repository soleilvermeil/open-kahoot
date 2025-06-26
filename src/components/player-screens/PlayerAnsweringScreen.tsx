import { getChoiceColor } from '@/lib/palette';

interface PlayerAnsweringScreenProps {
  onSubmitAnswer: (answerIndex: number) => void;
  hasAnswered: boolean;
  selectedAnswer: number | null;
}

export default function PlayerAnsweringScreen({ 
  onSubmitAnswer, 
  hasAnswered, 
  selectedAnswer 
}: PlayerAnsweringScreenProps) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <h2 className="text-3xl text-white text-center mb-8 font-jua">
        Choose your answer:
      </h2>
      <div className="grid grid-cols-2 gap-6">
        {['A', 'B', 'C', 'D'].map((letter, index) => (
          <button
            key={letter}
            onClick={() => onSubmitAnswer(index)}
            disabled={hasAnswered}
            className={`h-24 rounded-xl font-bold text-3xl text-white transition-all transform hover:scale-105 border-4 ${
              hasAnswered && selectedAnswer === index
                ? `${getChoiceColor(index)} ring-4 ring-white/50`
                : hasAnswered
                ? 'bg-gray-500/50 text-white/50 cursor-not-allowed border-gray-400'
                : `${getChoiceColor(index)} hover:scale-110`
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {hasAnswered && (
        <div className="text-center mt-6">
          <p className="text-white text-xl">Answer submitted! Waiting for others...</p>
        </div>
      )}
    </div>
  );
} 