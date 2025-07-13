import { getChoiceColor } from '@/lib/palette';

interface PlayerAnsweringScreenProps {
  onSubmitAnswer: (answerIndex: number) => void;
}

export default function PlayerAnsweringScreen({ 
  onSubmitAnswer
}: PlayerAnsweringScreenProps) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 flex-grow flex flex-col sm:block">
      <h2 className="text-3xl text-white text-center mb-8 font-jua">
        Choose your answer:
      </h2>
      <div className="grid grid-cols-2 gap-6 flex-grow">
        {['A', 'B', 'C', 'D'].map((letter, index) => (
          <button
            key={letter}
            onClick={() => onSubmitAnswer(index)}
            className={`rounded-xl font-bold text-3xl text-white transition-all transform hover:scale-105 border-4 ${getChoiceColor(index)} hover:scale-110 flex items-center justify-center sm:h-24`}
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
} 