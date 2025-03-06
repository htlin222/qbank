import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface SingleQuestionWithExplainProps {
  isOpen: boolean;
  onClose: () => void;
  question: {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    questionFigures: string[];
    explainFigures: string[];
  };
  userAnswer?: number;
  mode?: 'study' | 'test';
}

const numberToLetter = (num: number): string => {
  if (num === undefined || num === null) return '';
  return String.fromCharCode(65 + num); // A=0, B=1, etc.
};

export const SingleQuestionWithExplain: React.FC<SingleQuestionWithExplainProps> = ({
  isOpen,
  onClose,
  question,
  userAnswer,
  mode = 'study'
}) => {
  const isWrong = userAnswer !== undefined && userAnswer !== question.correctAnswer;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Question Details</span>
            <span className="text-blue-600">{`題號${String(question.id).padStart(3, '0')}`}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Question Text */}
          <div className="text-lg font-medium text-gray-800 whitespace-pre-line">
            {question.question}
          </div>

          {/* Question Figures */}
          {question.questionFigures.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {question.questionFigures.map((figure, index) => (
                <img 
                  key={index}
                  src={figure}
                  alt={`Question figure ${index + 1}`}
                  className="max-w-full rounded-lg shadow-md"
                />
              ))}
            </div>
          )}

          {/* Options */}
          <div className="space-y-4">
            {question.options.map((option, index) => {
              const isSelected = userAnswer === index;
              const isCorrect = index === question.correctAnswer;
              
              let className = "flex items-center p-3 rounded-md border";
              
              // In test mode, only show blue highlight for selected answers until completion
              if (mode === 'test' && userAnswer === undefined) {
                if (isSelected) {
                  className += " bg-blue-50 border-blue-300";
                }
              } else {
                // In study mode or after test completion, show green/red highlighting
                if (isCorrect) {
                  className += " bg-green-50 border-green-300";
                } else if (isSelected && !isCorrect) {
                  className += " bg-red-50 border-red-300";
                }
              }

              return (
                <div key={index} className={className}>
                  <Label className="flex-grow">
                    <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Label>
                </div>
              );
            })}
          </div>

          {/* Answer Status - only show in study mode or after test completion */}
          {(mode === 'study' || userAnswer !== undefined) && (
            <div className="flex gap-4 items-center text-lg">
              <span>Your Answer: </span>
              {userAnswer !== undefined ? (
                <span className={mode === 'test' && userAnswer === undefined ? "text-blue-600" : isWrong ? "text-red-600" : "text-green-600"}>
                  {numberToLetter(userAnswer)}
                </span>
              ) : (
                <span className="text-gray-500">Not answered</span>
              )}
              {(mode === 'study' || userAnswer !== undefined) && (
                <>
                  <span>Correct Answer: </span>
                  <span className="text-green-600">{numberToLetter(question.correctAnswer)}</span>
                </>
              )}
            </div>
          )}

          {/* Explanation - only show in study mode or after test completion */}
          {(mode === 'study' || userAnswer !== undefined) && (
            <>
              <div className="prose prose-blue max-w-none">
                <h3 className="text-lg font-semibold">Explanation</h3>
                <p className="whitespace-pre-wrap">{question.explanation}</p>
              </div>

              {/* Explanation Figures */}
              {question.explainFigures.length > 0 && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {question.explainFigures.map((figure, index) => {
                    const figureName = figure.split('/').pop()?.split('.')[0] || `Figure ${index + 1}`;
                    return (
                      <div key={index}>
                        <img 
                          src={figure}
                          alt={figureName}
                          title={figureName}
                          className="max-w-full rounded-lg shadow-md"
                        />
                        <p className="text-center text-sm text-gray-600 mt-1">{figureName}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
