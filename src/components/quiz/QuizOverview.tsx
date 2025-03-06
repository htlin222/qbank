import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, CircleDashed, SkipForward, Menu } from 'lucide-react';

interface QuizOverviewProps {
  questions: Array<{
    id: number;
    status: 'unread' | 'answered' | 'skipped';
  }>;
  onNavigate: (index: number) => void;
  currentIndex: number;
  starredQuestions: number[];
}

export const QuizOverview: React.FC<QuizOverviewProps> = ({
  questions,
  onNavigate,
  currentIndex,
  starredQuestions = [],
}) => {
  const getStatusStyles = (status: 'unread' | 'answered' | 'skipped', isSelected: boolean, isStarred: boolean) => {
    const baseStyles = "relative flex flex-col items-center justify-center w-full h-16 rounded-lg transition-all duration-200 border-2";
    const selectedStyles = isSelected ? "ring-2 ring-blue-500 ring-offset-2" : "";
    
    let statusStyles;
    switch (status) {
      case 'answered':
        statusStyles = "bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300";
        break;
      case 'skipped':
        statusStyles = "bg-orange-50 border-orange-200 hover:bg-orange-100 hover:border-orange-300";
        break;
      default:
        statusStyles = "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300";
    }
    
    if (isStarred) {
      statusStyles = statusStyles.replace(/bg-[^-]+(-50)/, 'bg-yellow-50')
                               .replace(/hover:bg-[^-]+(-100)/, 'hover:bg-yellow-100')
                               .replace(/border-[^-]+(-200)/, 'border-yellow-200')
                               .replace(/hover:border-[^-]+(-300)/, 'hover:border-yellow-300');
    }
    
    return `${baseStyles} ${selectedStyles} ${statusStyles}`;
  };

  const getStatusIcon = (status: 'unread' | 'answered' | 'skipped') => {
    switch (status) {
      case 'answered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'skipped':
        return <SkipForward className="h-5 w-5 text-orange-600" />;
      default:
        return <CircleDashed className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Menu className="h-4 w-4" />
          Overview
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[600px] p-6">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold">Quiz Overview</SheetTitle>
          <SheetDescription>
            View and navigate through all quiz questions
          </SheetDescription>
          <div className="flex gap-4 mt-4 px-2">
            <div className="flex items-center gap-2 text-sm">
              <CircleDashed className="h-4 w-4 text-gray-600" />
              <span className="text-gray-600">Unread</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-green-600">Answered</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <SkipForward className="h-4 w-4 text-orange-600" />
              <span className="text-orange-600">Skipped</span>
            </div>
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="grid grid-cols-5 gap-3 p-4">
            {questions.map((question, index) => {
              const isSelected = index === currentIndex;
              const isStarred = starredQuestions.includes(question.id);
              
              return (
                <button
                  key={question.id}
                  onClick={() => onNavigate(index)}
                  className={getStatusStyles(question.status, isSelected, isStarred)}
                >
                  <span className="text-sm font-medium mb-1">
                    {String(question.id).padStart(3, '0')}
                  </span>
                  {getStatusIcon(question.status)}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
