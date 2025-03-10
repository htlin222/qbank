import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
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
      <DialogContent className="w-[90vw] sm:w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto p-2 sm:p-6">
        <DialogHeader className="p-0 sm:p-2">
          <DialogTitle className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-base sm:text-lg">
            <span>Question Details</span>
            <span className="text-blue-600 text-sm">{`題號${String(question.id).padStart(3, '0')}`}</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Review question details, including the answer{mode === 'test' && userAnswer === undefined ? '' : ' and explanation'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-6 mt-2">
          {/* Question Text */}
          <div className="text-sm sm:text-lg font-medium text-gray-800 whitespace-pre-line break-words overflow-wrap-anywhere hyphens-auto">
            {question.question}
          </div>

          {/* Question Figures */}
          {question.questionFigures.length > 0 && (
            <div className="grid grid-cols-1 gap-3">
              {question.questionFigures.map((figure, index) => {
                const figureName = figure.split('/').pop()?.split('.')[0] || `Question Figure ${index + 1}`;
                return (
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      <div className="flex flex-col items-center">
                        <div className="mb-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {figureName}
                        </div>
                        <img 
                          src={figure}
                          alt={`題號${String(question.id).padStart(3, '0')} - ${figureName}`}
                          title={`題號${String(question.id).padStart(3, '0')} - ${figureName}`}
                          className="max-w-full h-auto max-h-[50vh] rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                        />
                      </div>
                    </DialogTrigger>
                    <DialogContent className="w-[90vw] sm:w-[95vw] max-w-[90vw] max-h-[90vh] overflow-auto p-2 sm:p-6">
                      <DialogHeader className="p-0 sm:p-2">
                        <DialogTitle className="text-center text-sm sm:text-base">
                          {`題號${String(question.id).padStart(3, '0')} - ${figureName}`}
                        </DialogTitle>
                        <DialogDescription className="text-center text-xs sm:text-sm text-gray-600">
                          Click anywhere outside to close the image
                        </DialogDescription>
                      </DialogHeader>
                      <img 
                        src={figure}
                        alt={`題號${String(question.id).padStart(3, '0')} - ${figureName}`}
                        className="w-auto max-w-full max-h-[70vh] mx-auto"
                      />
                    </DialogContent>
                  </Dialog>
                );
              })}
            </div>
          )}

          {/* Options */}
          <div className="space-y-2 sm:space-y-4">
            {question.options.map((option, index) => {
              const isSelected = userAnswer === index;
              const isCorrect = index === question.correctAnswer;
              
              let className = "flex items-start p-2 sm:p-3 rounded-md border break-words overflow-wrap-anywhere hyphens-auto";
              
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
                  <Label className="flex-grow text-xs sm:text-base">
                    <span className="font-medium mr-1 sm:mr-2 align-top">{String.fromCharCode(65 + index)}.</span>
                    <span className="inline-block">{option}</span>
                  </Label>
                </div>
              );
            })}
          </div>

          {/* Answer Status - only show in study mode or after test completion */}
          {(mode === 'study' || userAnswer !== undefined) && (
            <div className="flex flex-wrap gap-x-2 gap-y-1 items-center text-xs sm:text-base">
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
              <div className="prose prose-sm sm:prose-base prose-blue max-w-none">
                <h3 className="text-sm sm:text-lg font-semibold">Explanation</h3>
                <p className="text-xs sm:text-base whitespace-pre-wrap break-words overflow-wrap-anywhere hyphens-auto">{question.explanation}</p>
              </div>

              {/* Explanation Figures */}
              {question.explainFigures.length > 0 && (
                <div className="mt-2 sm:mt-4 grid grid-cols-1 gap-3">
                  {question.explainFigures.map((figure, index) => {
                    const figureName = figure.split('/').pop()?.split('.')[0] || `Explanation Figure ${index + 1}`;
                    return (
                      <Dialog key={index}>
                        <DialogTrigger asChild>
                          <div className="flex flex-col items-center">
                            <div className="mb-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {figureName}
                            </div>
                            <img 
                              src={figure}
                              alt={`題號${String(question.id).padStart(3, '0')} - ${figureName}`}
                              title={`題號${String(question.id).padStart(3, '0')} - ${figureName}`}
                              className="max-w-full h-auto max-h-[50vh] rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                            />
                          </div>
                        </DialogTrigger>
                        <DialogContent className="w-[90vw] sm:w-[95vw] max-w-[90vw] max-h-[90vh] overflow-auto p-2 sm:p-6">
                          <DialogHeader className="p-0 sm:p-2">
                            <DialogTitle className="text-center text-sm sm:text-base">
                              {`題號${String(question.id).padStart(3, '0')} - ${figureName}`}
                            </DialogTitle>
                            <DialogDescription className="text-center text-xs sm:text-sm text-gray-600">
                              Click anywhere outside to close the image
                            </DialogDescription>
                          </DialogHeader>
                          <img 
                            src={figure}
                            alt={`題號${String(question.id).padStart(3, '0')} - ${figureName}`}
                            className="w-auto max-w-full max-h-[70vh] mx-auto"
                          />
                        </DialogContent>
                      </Dialog>
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
