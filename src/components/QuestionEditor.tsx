'use client';

import { Trash2, ChevronUp, ChevronDown, Shuffle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Question } from '@/types/game';
import Button from '@/components/Button';

interface QuestionEditorProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  onUpdateQuestion: (index: number, field: keyof Question, value: string | number) => void;
  onUpdateOption: (questionIndex: number, optionIndex: number, value: string) => void;
  onRemoveQuestion: (index: number) => void;
  onMoveQuestion: (index: number, direction: 'up' | 'down') => void;
}

export default function QuestionEditor({
  question,
  questionIndex,
  totalQuestions,
  onUpdateQuestion,
  onUpdateOption,
  onRemoveQuestion,
  onMoveQuestion
}: QuestionEditorProps) {
  const handleShuffleOptions = () => {
    // Create array of options with their indices
    const optionsWithIndices = question.options.map((option, index) => ({
      option,
      originalIndex: index
    }));
    
    // Shuffle the array
    for (let i = optionsWithIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [optionsWithIndices[i], optionsWithIndices[j]] = [optionsWithIndices[j], optionsWithIndices[i]];
    }
    
    // Update each option in its new position
    optionsWithIndices.forEach((item, newIndex) => {
      onUpdateOption(questionIndex, newIndex, item.option);
    });
    
    // Find new index of the correct answer
    const newCorrectAnswerIndex = optionsWithIndices.findIndex(
      item => item.originalIndex === question.correctAnswer
    );
    
    // Update the correct answer index
    onUpdateQuestion(questionIndex, 'correctAnswer', newCorrectAnswerIndex);
  };

  return (
    <motion.div 
      layout
      layoutId={question.id}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-white/5 rounded-lg p-6 border border-white/20"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-white font-jua">Question {questionIndex + 1}</h3>
        <div className="flex gap-2">
          <Button
            onClick={handleShuffleOptions}
            variant="ghost"
            size="icon"
            icon={Shuffle}
            className="text-white hover:text-white/70"
            title="Shuffle options"
          >
          </Button>
          <Button
            onClick={() => onMoveQuestion(questionIndex, 'up')}
            disabled={questionIndex === 0}
            variant="ghost"
            size="icon"
            icon={ChevronUp}
            className="text-white hover:text-white/70 disabled:opacity-30 disabled:cursor-not-allowed"
          >
          </Button>
          <Button
            onClick={() => onMoveQuestion(questionIndex, 'down')}
            disabled={questionIndex === totalQuestions - 1}
            variant="ghost"
            size="icon"
            icon={ChevronDown}
            className="text-white hover:text-white/70 disabled:opacity-30 disabled:cursor-not-allowed"
          >
          </Button>
          <Button
            onClick={() => onRemoveQuestion(questionIndex)}
            variant="ghost"
            size="icon"
            icon={Trash2}
            className="text-white hover:text-white/70"
          >
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={question.question}
          onChange={(e) => onUpdateQuestion(questionIndex, 'question', e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
          placeholder="Enter your question..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {question.options.map((option, optionIndex) => (
          <div 
            key={optionIndex} 
            className="flex items-center gap-2"
          >
            <input
              type="radio"
              name={`correct-${questionIndex}`}
              checked={question.correctAnswer === optionIndex}
              onChange={() => onUpdateQuestion(questionIndex, 'correctAnswer', optionIndex)}
              className="text-green-500 focus:ring-green-500"
            />
            <input
              type="text"
              value={option}
              onChange={(e) => onUpdateOption(questionIndex, optionIndex, e.target.value)}
              className={`flex-1 px-3 py-2 rounded-lg border text-white placeholder-white/60 focus:outline-none focus:ring-2 transition-all ${
                question.correctAnswer === optionIndex
                  ? 'bg-green-300/20 border-green-400 focus:ring-green-400 focus:border-green-300'
                  : 'bg-white/20 border-white/30 focus:ring-white/50 focus:border-white/50'
              }`}
              placeholder={`Option ${optionIndex + 1}...`}
            />
          </div>
        ))}
      </div>
      <div className="mb-4">
        <textarea
          value={question.explanation || ''}
          onChange={(e) => onUpdateQuestion(questionIndex, 'explanation', e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
          placeholder="Enter an optional explanation for the answer..."
        />
      </div>
    </motion.div>
  );
} 