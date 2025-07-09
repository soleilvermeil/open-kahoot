import { useEffect } from 'react';
import { Question } from '@/types/game';
import { getChoiceColor } from '@/lib/palette';
import { useCountdownMusic } from '@/lib/useCountdownMusic';
import Image from 'next/image';

interface HostAnsweringScreenProps {
  currentQuestion: Question;
  timeLeft: number;
  answerTime: number;
}

export default function HostAnsweringScreen({ 
  currentQuestion 
}: HostAnsweringScreenProps) {
  const { playRandomCountdown, stopMusic } = useCountdownMusic();

  // Play random countdown music when the answering phase starts (only once)
  useEffect(() => {
    playRandomCountdown();
    
    // Cleanup function to stop music when component unmounts
    return () => {
      stopMusic();
    };
  }, [playRandomCountdown, stopMusic]); // Add missing dependencies

  // Choice button colors for players - using palette
  const choiceColors = [
    getChoiceColor(0), // A - Red
    getChoiceColor(1), // B - Blue
    getChoiceColor(2), // C - Yellow
    getChoiceColor(3)  // D - Green
  ];

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">

      {/* Question Text */}
      <h1 className="text-4xl text-white text-center leading-tight mb-8 font-jua">
        {currentQuestion.question}
      </h1>

      {/* Question Image */}
      {currentQuestion.image && (
        <div className="mb-8">
          <Image src={currentQuestion.image} alt="Question" width={600} height={400} className="max-h-64 w-auto mx-auto rounded-lg" />
        </div>
      )}

      {/* Answer Choices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentQuestion.options.map((option, index) => (
          <div
            key={index}
            className={`p-6 rounded-xl border-2 ${choiceColors[index].split(' ')[0]} ${choiceColors[index].split(' ')[1]} ${choiceColors[index].split(' ')[2]} text-white`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                {String.fromCharCode(65 + index)}
              </div>
              <span className="font-semibold text-xl">{option}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-6 text-white/80 text-lg">
        Players are choosing their answers on their devices
      </div>
    </div>
  );
} 