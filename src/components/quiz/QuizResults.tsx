import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { SingleQuestionWithExplain } from './SingleQuestionWithExplain';

interface QuizResultsProps {
  questions: Array<{ 
    id: number;
    correctAnswer: number;
    question: string;
    options: string[];
    explanation: string;
    questionFigures: string[];
    explainFigures: string[];
  }>;
  userAnswers: Record<number, number>;
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  mode: 'study' | 'test';
}

const numberToLetter = (num: number): string => {
  if (num === undefined || num === null) return '';
  return String.fromCharCode(65 + num); // A=0, B=1, etc.
};

export const QuizResults: React.FC<QuizResultsProps> = ({
  questions,
  userAnswers,
  score,
  totalQuestions,
  onRestart,
  mode
}) => {
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const percentage = Math.round((score / totalQuestions) * 100);
  let message = '';

  if (percentage >= 90) {
    message = 'Excellent work! Keep it up!';
  } else if (percentage >= 70) {
    message = 'Good job! Room for improvement.';
  } else if (percentage >= 50) {
    message = 'You\'re making progress. Keep studying!';
  } else {
    message = 'Keep studying. You will improve with practice.';
  }

  const handleQuestionClick = (questionId: number) => {
    setSelectedQuestion(questionId);
  };

  const currentQuestion = selectedQuestion !== null 
    ? questions.find(q => q.id === selectedQuestion)
    : null;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card className="w-full">
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle className="text-2xl flex justify-between items-center">
            <span>Quiz Completed!</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 pb-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="text-4xl font-bold text-blue-600">
              {mode === 'test' && !Object.keys(userAnswers).length ? '?' : `${score}/${totalQuestions}`}
            </div>
            <div className="text-xl text-gray-600">
              {mode === 'test' && !Object.keys(userAnswers).length ? '' : `${percentage}%`}
            </div>
            <div className="w-full max-w-md">
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">Quiz Summary:</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Questions Answered:</div>
                  <div>{Object.keys(userAnswers).length}/{totalQuestions}</div>
                  <div>Questions Skipped:</div>
                  <div>{totalQuestions - Object.keys(userAnswers).length}</div>
                </div>
              </div>
              {(mode === 'study' || Object.keys(userAnswers).length > 0) && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Performance</AlertTitle>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
            </div>
            <div className="w-full mt-6">
              <div className="grid grid-cols-10 gap-2">
                {questions.map((question) => {
                  const userAnswer = numberToLetter(userAnswers[question.id]);
                  const correctAnswer = numberToLetter(question.correctAnswer);
                  const isWrong = userAnswers[question.id] !== question.correctAnswer;
                  const questionId = String(question.id).padStart(3, '0');
                  
                  // In test mode, use blue for selected answers until completion
                  const buttonStyle = mode === 'test' && !userAnswers[question.id] 
                    ? "text-blue-600"
                    : isWrong ? "text-red-600" : "text-green-600";
                    
                  return (
                    <Button
                      key={question.id}
                      variant="outline"
                      className={cn(
                        "h-auto py-2 px-3 text-xs font-normal",
                        buttonStyle
                      )}
                      onClick={() => handleQuestionClick(question.id)}
                    >
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="bg-slate-100">{questionId}</Badge>
                        {isWrong ? (
                          <div className='flex-row'>
                            <del className="text-red-600 p-1">{userAnswer}</del>
                            <span className="text-green-600 p-1">{correctAnswer}</span>
                          </div>
                        ) : (
                          <span>{correctAnswer}</span>
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={onRestart} variant="default">
            Start New Quiz
          </Button>
        </CardFooter>
      </Card>

      {currentQuestion && (
        <SingleQuestionWithExplain
          isOpen={selectedQuestion !== null}
          onClose={() => setSelectedQuestion(null)}
          question={currentQuestion}
          userAnswer={userAnswers[currentQuestion.id]}
          mode={mode}
        />
      )}
    </div>
  );
};
