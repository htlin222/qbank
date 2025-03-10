import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  explainFigures: string[];
}

interface ExplanationProps {
  question: Question;
  userAnswer?: number;
  mode?: 'study' | 'test';
  trigger?: React.ReactNode;
  showCorrectness?: boolean;
}

export const Explanation: React.FC<ExplanationProps> = ({ 
  question, 
  userAnswer, 
  mode = 'study',
  trigger,
  showCorrectness = true
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <button className="text-blue-600 hover:underline">
            View Explanation
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[92vw] sm:w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto p-3 sm:p-6">
        <DialogHeader className="p-0 sm:p-2">
          <DialogTitle className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-base sm:text-lg">
            <span>Explanation</span>
            <span className="text-blue-600 text-sm">題號{String(question.id).padStart(3, '0')}</span>
          </DialogTitle>
        </DialogHeader>
        <Accordion type="single" collapsible className="w-full border-t mt-2">
          <AccordionItem value="question-summary" className="border-b-0">
            <AccordionTrigger className="text-xs py-2 hover:no-underline">
              <div className="flex items-center gap-2">
                <span>顯示題目及選項</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-xs text-gray-500">
              <div className="pb-2 whitespace-pre-wrap break-words overflow-wrap-anywhere">{question.question}</div>
              <div className="space-y-1">
                {question.options.map((option, index) => {
                  const letter = String.fromCharCode(65 + index); // Convert 0,1,2,3,4 to A,B,C,D,E
                  const isSelected = userAnswer === index;
                  const isCorrect = question.correctAnswer === index;
                  const displayCorrectness = showCorrectness && (mode === 'study' || (mode === 'test' && userAnswer !== undefined));
                  return (
                    <div 
                      key={index} 
                      className={`${
                        displayCorrectness ? (
                          isSelected && isCorrect ? 'text-green-600 font-medium' : 
                          isSelected && !isCorrect ? 'text-red-600 font-medium' :
                          isCorrect ? 'text-green-600 font-medium' : ''
                        ) : (
                          isSelected ? 'text-blue-600 font-medium' : ''
                        )
                      } break-words overflow-wrap-anywhere`}
                    >
                      {letter}. {option}
                    </div>
                  );
                })}
              </div>
              {userAnswer !== undefined && (
                <div className="pt-2 font-medium flex flex-wrap gap-x-2">
                  <span>Selected: {String.fromCharCode(65 + userAnswer)}</span>
                  {showCorrectness && (mode === 'study' || (mode === 'test' && userAnswer !== undefined)) && (
                    <span>
                      Correct: {String.fromCharCode(65 + question.correctAnswer)}
                    </span>
                  )}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <DialogDescription className="text-sm sm:text-base text-gray-900 p-0 sm:p-2">
          <div className="prose prose-sm sm:prose-base prose-blue max-w-none">
            <p className="whitespace-pre-wrap break-words overflow-wrap-anywhere">{question.explanation}</p>
          </div>
          {question.explainFigures.length > 0 && (
            <div className="mt-4 grid grid-cols-1 gap-4">
              {question.explainFigures.map((figure, index) => {
                const figureName = figure.split('/').pop()?.split('.')[0] || `Figure ${index + 1}`;
                return (
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      <div className="flex flex-col items-center">
                        <div className="mb-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {figureName}
                        </div>
                        <img 
                          src={figure}
                          alt={figureName}
                          title={figureName}
                          className="max-w-full h-auto max-h-[60vh] rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                        />
                      </div>
                    </DialogTrigger>
                    <DialogContent className="w-[92vw] sm:w-[95vw] max-w-[90vw] max-h-[90vh] overflow-auto p-3 sm:p-6">
                      <DialogHeader className="p-0 sm:p-2">
                        <DialogTitle className="text-center text-sm sm:text-base">{figureName}</DialogTitle>
                      </DialogHeader>
                      <img 
                        src={figure}
                        alt={figureName}
                        className="w-auto max-w-full max-h-[70vh] mx-auto"
                      />
                    </DialogContent>
                  </Dialog>
                );
              })}
            </div>
          )}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
