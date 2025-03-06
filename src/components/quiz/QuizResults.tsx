import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  questionIds: number[];
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  score,
  totalQuestions,
  onRestart,
  questionIds,
}) => {
  const percentage = (score / totalQuestions) * 100;
  let message = '';
  
  if (percentage === 100) {
    message = 'Excellent! Perfect score!';
  } else if (percentage >= 70) {
    message = 'Great job! You have a solid understanding.';
  } else {
    message = 'Keep studying. You will improve with practice.';
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card className="w-full">
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle className="text-2xl flex justify-between items-center">
            <span>Quiz Completed!</span>
            <span className="text-sm">題號{String(questionIds[questionIds.length - 1]).padStart(3, '0')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 pb-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="text-4xl font-bold">{score}/{totalQuestions}</div>
            <div className="text-xl">{percentage}%</div>
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Results</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={onRestart} className="mt-4 bg-blue-600 hover:bg-blue-800">
            Restart Quiz
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
