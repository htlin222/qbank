import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface QuizQuestionProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  question: {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    questionFigures: string[];
    explainFigures: string[];
  };
  userAnswers: Record<number, number>;
  showExplanation: Record<number, boolean>;
  onAnswerSelect: (value: string) => void;
  mode?: 'study' | 'test';
  onBackToMenu: () => void;
  onSaveProgress: () => void;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  currentQuestionIndex,
  totalQuestions,
  question,
  userAnswers,
  showExplanation,
  onAnswerSelect,
  mode = 'study',
  onBackToMenu,
  onSaveProgress
}) => {
  const [showExitDialog, setShowExitDialog] = useState(false);

  return (
    <Card className="w-full mb-4">
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle className="text-xl flex justify-between items-center">
          <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
          <span className="text-blue-600">題號{String(question.id).padStart(3, '0')}</span>
        </CardTitle>
        <CardDescription className="text-lg font-medium text-gray-800 mt-2 whitespace-pre-line">
          {question.question}
        </CardDescription>
        {question.questionFigures.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.questionFigures.map((figure, index) => (
              <Dialog key={index}>
                <DialogTrigger asChild>
                  <img 
                    src={figure}
                    alt={`Question figure ${index + 1}`}
                    className="max-w-full rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                  />
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] max-h-[90vh]">
                  <img 
                    src={figure}
                    alt={`Question figure ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </DialogContent>
              </Dialog>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-6 pb-4">
        <RadioGroup 
          value={userAnswers[question.id]?.toString() || ""} 
          onValueChange={onAnswerSelect}
          className="space-y-4"
        >
          {question.options.map((option, index) => {
            const isSelected = userAnswers[question.id] === index;
            const isCorrect = index === question.correctAnswer;
            const showResult = mode === 'study' && showExplanation[question.id];
            
            let className = "flex items-center p-3 rounded-md border";
            
            if (showResult) {
              if (isCorrect) {
                className += " bg-green-50 border-green-300";
              } else if (isSelected && !isCorrect) {
                className += " bg-red-50 border-red-300";
              }
            } else if (isSelected) {
              className += " bg-blue-50 border-blue-300";
            }

            return (
              <div key={index} className={className}>
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label className="ml-3 flex-grow" htmlFor={`option-${index}`}>
                  <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </Label>
              </div>
            );
          })}
        </RadioGroup>

        {showExplanation[question.id] && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="mt-6 w-full">
                View Detailed Explanation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex justify-between items-center">
                  <span>Explanation</span>
                  <span className="text-blue-600 pr-6">題號{String(question.id).padStart(3, '0')}</span>
                </DialogTitle>
                <DialogDescription className="text-base text-gray-900">
                  <div className="prose prose-blue max-w-none">
                    <p className="whitespace-pre-wrap">{question.explanation}</p>
                    {question.explainFigures.length > 0 && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {question.explainFigures.map((figure, index) => (
                          <Dialog key={index}>
                            <DialogTrigger asChild>
                              <img 
                                src={figure}
                                alt={`Explanation figure ${index + 1}`}
                                className="max-w-full rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                              />
                            </DialogTrigger>
                            <DialogContent className="max-w-[90vw] max-h-[90vh]">
                              <img 
                                src={figure}
                                alt={`Explanation figure ${index + 1}`}
                                className="w-full h-full object-contain"
                              />
                            </DialogContent>
                          </Dialog>
                        ))}
                      </div>
                    )}
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">Back to Menu</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>End Session</DialogTitle>
              <DialogDescription>
                Are you sure you want to end this session? You can save your progress before leaving.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setShowExitDialog(false)}>Cancel</Button>
              <Button variant="secondary" onClick={onSaveProgress}>Save Progress</Button>
              <Button variant="destructive" onClick={onBackToMenu}>Exit Session</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button variant="secondary" onClick={onSaveProgress}>Save Progress</Button>
      </CardFooter>
    </Card>
  );
};
