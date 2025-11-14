'use client';

import { Trash2, ChevronUp, ChevronDown, Shuffle, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Question } from '@/types/game';
import Button from '@/components/Button';
import { useCallback, useState } from 'react';
import { compressImage } from '@/lib/compressImage';
import Image from 'next/image';
import { accent } from '@/lib/palette';

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

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Compress / resize the image before storing it
      const compressed = await compressImage(file, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8
      });
      onUpdateQuestion(questionIndex, 'image', compressed);
    } catch (err) {
      console.error('Image compression failed', err);
      // Fallback to original image if compression fails
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateQuestion(questionIndex, 'image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [questionIndex, onUpdateQuestion]);

  // Drag & drop handlers
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    try {
      const compressed = await compressImage(file, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8,
      });
      onUpdateQuestion(questionIndex, 'image', compressed);
    } catch (err) {
      console.error('Image compression failed', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateQuestion(questionIndex, 'image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [questionIndex, onUpdateQuestion]);

  return (
    <motion.div 
      layout
      layoutId={question.id}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-gray-50 rounded-lg p-6 border border-gray-300"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-black font-jua">Question {questionIndex + 1}</h3>
        <div className="flex gap-2">
          <Button
            onClick={handleShuffleOptions}
            variant="ghost"
            size="icon"
            icon={Shuffle}
            className="text-black hover:text-gray-700"
            title="Shuffle options"
          >
          </Button>
          <Button
            onClick={() => onMoveQuestion(questionIndex, 'up')}
            disabled={questionIndex === 0}
            variant="ghost"
            size="icon"
            icon={ChevronUp}
            className="text-black hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          >
          </Button>
          <Button
            onClick={() => onMoveQuestion(questionIndex, 'down')}
            disabled={questionIndex === totalQuestions - 1}
            variant="ghost"
            size="icon"
            icon={ChevronDown}
            className="text-black hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          >
          </Button>
          <Button
            onClick={() => onRemoveQuestion(questionIndex)}
            variant="ghost"
            size="icon"
            icon={Trash2}
            className="text-black hover:text-gray-700"
          >
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={question.question}
          onChange={(e) => onUpdateQuestion(questionIndex, 'question', e.target.value)}
          className={`w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:ring-2 ${accent.ringFocus} ${accent.borderFocus}`}
          placeholder="Enter your question..."
        />
      </div>
      <div className="flex gap-4 mb-4">
        <div className="grid flex-1 grid-cols-1 md:grid-cols-2 gap-4">
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
                className={`flex-1 px-3 py-2 rounded-lg border text-black placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                  question.correctAnswer === optionIndex
                    ? 'bg-green-50 border-green-400 focus:ring-green-400 focus:border-green-500'
                    : `bg-white border-gray-300 ${accent.ringFocus} ${accent.borderFocus}`
                }`}
                placeholder={`Option ${optionIndex + 1}...`}
              />
            </div>
          ))}
        </div>
        <div className="relative w-28 h-28">
          <input
            type="file"
            id={`image-upload-${question.id}`}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
          <label
            htmlFor={`image-upload-${question.id}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`cursor-pointer flex items-center justify-center w-full h-full rounded-lg border-2 border-dashed transition-colors ${
              isDragOver ? 'bg-gray-100 border-gray-400' : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
            }`}
          >
            {!question.image && (
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-600">Upload Image</span>
              </div>
            )}
            {question.image && (
              <Image src={question.image} alt="Question" fill className="object-cover rounded-lg" />
            )}
          </label>
          {question.image && (
            <Button
              onClick={() => onUpdateQuestion(questionIndex, 'image', '')}
              variant="ghost"
              size="icon"
              icon={Trash2}
              className="absolute top-2 right-2 text-white bg-red-500 hover:bg-red-600 rounded-full"
              title="Remove image"
            />
          )}
        </div>
      </div>
      <div className="mb-4">
        <textarea
          value={question.explanation || ''}
          onChange={(e) => onUpdateQuestion(questionIndex, 'explanation', e.target.value)}
          className={`w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:ring-2 ${accent.ringFocus} ${accent.borderFocus}`}
          placeholder="Enter an optional explanation for the answer..."
        />
      </div>
    </motion.div>
  );
} 