import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QuizQuestion } from '@/components/quiz/QuizQuestion';
import { QuizResults } from '@/components/quiz/QuizResults';
import { QuizOverview } from '@/components/quiz/QuizOverview';
import { WelcomePage } from '@/components/quiz/WelcomePage';
import { Timer } from '@/components/quiz/Timer';
import { SkipForward, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import compiledQuestions from '@/data/compiledQuestions.json';

type QuestionStatus = 'unread' | 'answered' | 'skipped';
type QuizMode = 'study' | 'test';

interface QuizProgress {
  mode: QuizMode;
  currentQuestionIndex: number;
  userAnswers: Record<number, number>;
  showExplanation: Record<number, boolean>;
  questionStatus: Record<number, QuestionStatus>;
  score: number;
  isCompleted: boolean;
  timestamp: string;
}

const OncoQuiz = () => {
  // Quiz state
  const [isStarted, setIsStarted] = useState(false);
  const [quizMode, setQuizMode] = useState<QuizMode>('study');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [questionStatus, setQuestionStatus] = useState<Record<number, QuestionStatus>>(() => {
    const initial: Record<number, QuestionStatus> = {};
    compiledQuestions.forEach(q => {
      initial[q.id] = 'unread';
    });
    return initial;
  });
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Current question data
  const currentQuestion = compiledQuestions[currentQuestionIndex];
  const totalQuestions = compiledQuestions.length;

  // Handler for starting the quiz
  const handleStart = (mode: QuizMode) => {
    setQuizMode(mode);
    setIsStarted(true);
  };

  // Handler for selecting an answer
  const handleAnswerSelect = (value: string) => {
    const answerValue = parseInt(value);
    setUserAnswers({
      ...userAnswers,
      [currentQuestion.id]: answerValue
    });

    setQuestionStatus({
      ...questionStatus,
      [currentQuestion.id]: 'answered'
    });
  };

  // Handler for checking answer
  const handleCheckAnswer = () => {
    if (userAnswers[currentQuestion.id] === undefined) return;

    setShowExplanation({
      ...showExplanation,
      [currentQuestion.id]: true
    });

    setQuestionStatus({
      ...questionStatus,
      [currentQuestion.id]: 'answered'
    });

    if (userAnswers[currentQuestion.id] === currentQuestion.correctAnswer && !showExplanation[currentQuestion.id]) {
      setScore(score + 1);
    }
  };

  // Handler for skipping question
  const handleSkip = () => {
    setQuestionStatus({
      ...questionStatus,
      [currentQuestion.id]: 'skipped'
    });
    handleNextQuestion();
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (quizMode === 'test') {
      setShowFinishDialog(true);
    }
  };

  // Finish quiz and calculate final score
  const finishQuiz = () => {
    if (quizMode === 'test') {
      let finalScore = 0;
      Object.entries(userAnswers).forEach(([id, answer]) => {
        const question = compiledQuestions.find(q => q.id === parseInt(id));
        if (question && answer === question.correctAnswer) {
          finalScore++;
        }
      });
      setScore(finalScore);
      
      // Show all explanations in test mode
      const allExplanations: Record<number, boolean> = {};
      compiledQuestions.forEach(q => {
        allExplanations[q.id] = true;
      });
      setShowExplanation(allExplanations);
    }
    setIsCompleted(true);
    setShowFinishDialog(false);
  };

  // Navigate to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Navigate to specific question
  const handleNavigateToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  // Restart quiz
  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowExplanation({});
    setQuestionStatus(() => {
      const initial: Record<number, QuestionStatus> = {};
      compiledQuestions.forEach(q => {
        initial[q.id] = 'unread';
      });
      return initial;
    });
    setScore(0);
    setIsCompleted(false);
    setIsStarted(false);
  };

  // Save progress
  const handleSaveProgress = () => {
    const progress: QuizProgress = {
      mode: quizMode,
      currentQuestionIndex,
      userAnswers,
      showExplanation,
      questionStatus,
      score,
      isCompleted,
      timestamp: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false })
    };

    // Format date in Taipei timezone for filename
    const now = new Date();
    const taipeiOptions = { 
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    const taipeiDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Taipei' }));
    const formattedDate = taipeiDate
      .toLocaleString('en-US', taipeiOptions)
      .replace(/[\/:]/g, '-')
      .replace(',', '')
      .replace(/\s/g, '-');
    
    const filename = `quiz-progress_${formattedDate}_${quizMode}-mode.json`;
    
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Load progress
  const handleLoadProgress = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const progress: QuizProgress = JSON.parse(e.target?.result as string);
        setQuizMode(progress.mode);
        setCurrentQuestionIndex(progress.currentQuestionIndex);
        setUserAnswers(progress.userAnswers);
        setShowExplanation(progress.showExplanation);
        setQuestionStatus(progress.questionStatus);
        setScore(progress.score);
        setIsCompleted(progress.isCompleted);
        setIsStarted(true);
      } catch (error) {
        console.error('Error loading progress:', error);
        alert('Invalid progress file format');
      }
    };
    reader.readAsText(file);
  };

  // Calculate progress percentage
  const progressPercentage = ((Object.keys(quizMode === 'study' ? showExplanation : userAnswers).length) / totalQuestions) * 100;

  // Show welcome page if not started
  if (!isStarted) {
    return (
      <div className="space-y-4">
        <WelcomePage onStart={(mode) => {
          setQuizMode(mode);
          setIsStarted(true);
        }} />
        <div className="flex justify-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleLoadProgress}
            accept=".json"
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Load Progress
          </Button>
        </div>
      </div>
    );
  }

  // Show results if completed
  if (isCompleted) {
    return <QuizResults 
      score={score} 
      totalQuestions={totalQuestions} 
      onRestart={handleRestart}
      questionIds={compiledQuestions.map(q => q.id)}
    />;
  }

  // Overview data
  const overviewData = compiledQuestions.map(q => ({
    id: q.id,
    status: questionStatus[q.id]
  }));

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-8 space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-blue-800">Oncology Review Quiz</h1>
            <QuizOverview 
              questions={overviewData}
              onNavigate={handleNavigateToQuestion}
              currentIndex={currentQuestionIndex}
            />
          </div>
          <div className="flex items-center gap-6">
            <Timer />
            <div className="text-sm font-medium bg-blue-50 px-4 py-2 rounded-lg">
              Score: {quizMode === 'study' ? score : '?'}/{totalQuestions}
            </div>
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <QuizQuestion
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        question={currentQuestion}
        userAnswers={userAnswers}
        showExplanation={showExplanation}
        onAnswerSelect={handleAnswerSelect}
        mode={quizMode}
        onBackToMenu={() => {
          setIsStarted(false);
          setCurrentQuestionIndex(0);
        }}
        onSaveProgress={handleSaveProgress}
      />

      <div className="flex justify-between mt-6">
        <Button 
          onClick={handlePrevQuestion} 
          disabled={currentQuestionIndex === 0}
          variant="outline"
          className="flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Previous
        </Button>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSkip}
            variant="ghost"
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            disabled={questionStatus[currentQuestion.id] === 'answered' || showExplanation[currentQuestion.id]}
          >
            <SkipForward className="h-4 w-4" />
            Skip
          </Button>
          {quizMode === 'study' ? (
            <>
              <Button 
                onClick={handleCheckAnswer}
                disabled={userAnswers[currentQuestion.id] === undefined || showExplanation[currentQuestion.id]}
                className="bg-blue-600 hover:bg-blue-800"
              >
                Check Answer
              </Button>
              {showExplanation[currentQuestion.id] && (
                <Button 
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                  className="bg-blue-600 hover:bg-blue-800"
                >
                  Next Question
                </Button>
              )}
            </>
          ) : (
            <Button 
              onClick={() => currentQuestionIndex === totalQuestions - 1 ? setShowFinishDialog(true) : handleNextQuestion()}
              className="bg-blue-600 hover:bg-blue-800"
            >
              {currentQuestionIndex === totalQuestions - 1 ? 'Finish Quiz' : 'Next Question'}
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Finish Quiz</span>
              <span className="text-blue-600">題號{String(currentQuestion.id).padStart(3, '0')}</span>
            </DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <p>You are about to finish the quiz and see your results.</p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="font-medium">Quiz Progress:</p>
                <p>
                  Answered Questions: {Object.keys(userAnswers).length}/{totalQuestions}
                  {Object.keys(userAnswers).length < totalQuestions && (
                    <span className="text-orange-600 block mt-1">
                      Note: You have {totalQuestions - Object.keys(userAnswers).length} unanswered questions.
                    </span>
                  )}
                </p>
                <p>
                  Skipped Questions: {Object.entries(questionStatus).filter(([_, status]) => status === 'skipped').length}
                </p>
              </div>
              <p>After finishing, you will:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>See your final score</li>
                <li>See correct answers for all questions</li>
                <li>Have access to detailed explanations</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowFinishDialog(false)}>
              Continue Quiz
            </Button>
            <Button onClick={finishQuiz} className="bg-blue-600 hover:bg-blue-800">
              Show Results
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OncoQuiz;