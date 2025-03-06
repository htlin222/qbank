import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface QuizResultsProps {
  questions: Array<{ id: number }>;
  userAnswers: Record<number, number>;
  score: number;
  totalQuestions: number;
  onRestart: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  questions,
  userAnswers,
  score,
  totalQuestions,
  onRestart,
}) => {
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

  const lastQuestionId = questions.length > 0 ? questions[questions.length - 1].id : 0;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card className="w-full">
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle className="text-2xl flex justify-between items-center">
            <span>Quiz Completed!</span>
            <span className="text-sm">題號{String(lastQuestionId).padStart(3, '0')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 pb-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="text-4xl font-bold text-blue-600">{score}/{totalQuestions}</div>
            <div className="text-xl text-gray-600">{percentage}%</div>
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
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Performance</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={onRestart} variant="default">
            Start New Quiz
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
