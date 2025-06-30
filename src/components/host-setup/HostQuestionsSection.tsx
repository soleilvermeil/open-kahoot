import type { Question } from '@/types/game';
import AddQuestionButton from '@/components/AddQuestionButton';
import QuestionEditor from '@/components/QuestionEditor';
import HostEmptyQuestionsState from './HostEmptyQuestionsState';

interface HostQuestionsSectionProps {
  questions: Question[];
  onAddQuestion: (index?: number) => void;
  onAppendTSV: (index: number, event: React.ChangeEvent<HTMLInputElement>) => void;
  onFileImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdateQuestion: (index: number, field: keyof Question, value: string | number) => void;
  onUpdateOption: (questionIndex: number, optionIndex: number, value: string) => void;
  onRemoveQuestion: (index: number) => void;
  onMoveQuestion: (index: number, direction: 'up' | 'down') => void;
}

export default function HostQuestionsSection({
  questions,
  onAddQuestion,
  onAppendTSV,
  onFileImport,
  onUpdateQuestion,
  onUpdateOption,
  onRemoveQuestion,
  onMoveQuestion
}: HostQuestionsSectionProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl text-white font-jua">Questions</h2>
      </div>

      {questions.length === 0 ? (
        <HostEmptyQuestionsState 
          onAddQuestion={onAddQuestion}
          onFileImport={onFileImport}
        />
      ) : (
        <div>
          <AddQuestionButton onAddQuestion={onAddQuestion} onAppendTSV={onAppendTSV} index={0} />
          
          {questions.map((question, questionIndex) => (
            <div key={question.id}>
              <QuestionEditor
                question={question}
                questionIndex={questionIndex}
                totalQuestions={questions.length}
                onUpdateQuestion={onUpdateQuestion}
                onUpdateOption={onUpdateOption}
                onRemoveQuestion={onRemoveQuestion}
                onMoveQuestion={onMoveQuestion}
              />
              <AddQuestionButton onAddQuestion={onAddQuestion} onAppendTSV={onAppendTSV} index={questionIndex + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 