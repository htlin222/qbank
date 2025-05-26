import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Search, X } from "lucide-react";
import { Explanation } from './Explanation';
import compiledQuestions from '@/data/compiledQuestions.json';
import Fuse from 'fuse.js';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import config from '@/config';

interface WelcomePageProps {
  onStart: (mode: 'study' | 'test') => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ onStart }) => {
  const [mode, setMode] = React.useState<'study' | 'test'>('study');
  const [answer, setAnswer] = React.useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
  const [showError, setShowError] = React.useState<boolean>(false);
  const [showSuccess, setShowSuccess] = React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('quiz');

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(compiledQuestions, {
      keys: ['id', 'question', 'options', 'explanation'],
      includeScore: true,
      threshold: 0.3,
      ignoreLocation: true,
      useExtendedSearch: true,
      minMatchCharLength: 1,
      distance: 1000,
    });
  }, []);

  // Handle search
  useEffect(() => {
    // Check if the query contains Chinese characters
    const containsChinese = (text: string) => /[\u4e00-\u9fa5]/.test(text);
    const minLength = containsChinese(searchQuery) ? 2 : 3;
    
    if (searchQuery.trim().length >= minLength) {
      // First check if the search query is a number (potential question ID)
      const numericQuery = searchQuery.trim().replace(/^0+/, ''); // Remove leading zeros
      const isNumeric = /^\d+$/.test(numericQuery);
      
      if (isNumeric) {
        // If it's a numeric query, first try to find exact question ID matches
        const exactMatches = compiledQuestions.filter(q => 
          String(q.id) === numericQuery || 
          String(q.id).padStart(3, '0') === searchQuery.trim().padStart(3, '0')
        );
        
        if (exactMatches.length > 0) {
          setSearchResults(exactMatches);
          return;
        }
      }
      
      // If not a numeric query or no exact matches found, perform fuzzy search
      const results = fuse.search(searchQuery);
      setSearchResults(results.map(result => result.item));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, fuse]);

  const handleAnswerSubmit = () => {
    if (answer === '522') {
      setIsAuthenticated(true);
      setShowSuccess(true);
      setShowError(false);
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    } else {
      setShowError(true);
      setShowSuccess(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnswerSubmit();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  // Highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    try {
      const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
    } catch (e) {
      return text;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="w-full">
        <CardHeader className="bg-blue-600 text-white text-center pb-6">
          <CardTitle className="text-3xl">{config.appTitle}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 pb-4">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center space-y-6">
              <div className="text-center space-y-4 w-full max-w-lg">
                <h3 className="text-xl font-semibold">Credential Check</h3>
                <p className="text-gray-600">回答以下問題以獲取訪問權限，應該不難</p>
                <div className="bg-gray-50 p-8 rounded-lg text-left text-lg border">
                  <p>
                    In patients with early-stage triple-negative breast cancer, the phase 3 KEYNOTE-
                    <Input 
                      type="text" 
                      value={answer} 
                      onChange={(e) => setAnswer(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="inline-block w-20 mx-1 text-center text-lg font-bold bg-blue-800 text-white mr-2 ml-2"
                      maxLength={3}
                    />
                    trial showed significant improvements in pathological complete response and event-free survival with the addition of pembrolizumab to platinum-containing chemotherapy.
                  </p>
                </div>
                <div className="flex justify-center mt-4">
                  <Button onClick={handleAnswerSubmit} className="px-6">Verify</Button>
                </div>
                {showError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Incorrect answer. Please try again.
                    </AlertDescription>
                  </Alert>
                )}
                {showSuccess && (
                  <Alert className="mt-2 bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      Correct! Accessing quiz...
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="quiz">Quiz Options</TabsTrigger>
                <TabsTrigger value="search">Quick Search</TabsTrigger>
              </TabsList>
              
              <TabsContent value="quiz" className="mt-0">
                <div className="flex flex-col items-center space-y-6">
                  <div className="text-center space-y-2">
                    <p className="text-xl">Test your oncology knowledge!</p>
                  </div>
                  <div className="space-y-4 text-gray-600">
                    <p>✓ Study Mode: Immediate feedback and explanations</p>
                    <p>✓ Test Mode: Review all answers at the end</p>
                    <p>✓ Save and resume your progress anytime</p>
                    <p>✓ Detailed explanations with images</p>
                  </div>
                  <div className="w-full max-w-xs">
                    <RadioGroup value={mode} onValueChange={(value: 'study' | 'test') => setMode(value)} className="gap-4">
                      <div className="flex items-center space-x-2 border rounded-lg p-4">
                        <RadioGroupItem value="study" id="study" />
                        <Label htmlFor="study" className="font-medium">
                          Study Mode
                          <p className="text-sm text-gray-500">Check answers and see explanations as you go</p>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-4">
                        <RadioGroupItem value="test" id="test" />
                        <Label htmlFor="test" className="font-medium">
                          Test Mode
                          <p className="text-sm text-gray-500">See answers only at the end</p>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <Button onClick={() => onStart(mode)} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                    Start Quiz
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="search" className="mt-0">
                <div className="flex flex-col space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search questions e.g. 012 for question 12, options, or explanations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-8"
                    />
                    {searchQuery && (
                      <button 
                        onClick={clearSearch}
                        className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  {searchQuery.length > 0 && searchQuery.length < (/[\u4e00-\u9fa5]/.test(searchQuery) ? 2 : 3) && (
                    <p className="text-sm text-gray-500 text-center">
                      {/[\u4e00-\u9fa5]/.test(searchQuery) 
                        ? "請輸入至少2個字符進行搜索" 
                        : "Please enter at least 3 characters to search"}
                    </p>
                  )}
                  
                  {searchResults.length > 0 ? (
                    <ScrollArea className="h-[70vh] rounded-md border p-4">
                      <div className="space-y-6">
                        {searchResults.map((question) => (
                          <div key={question.id} className="border-b pb-4 last:border-b-0">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-blue-600">題號{String(question.id).padStart(3, '0')}</h3>
                              <Explanation 
                                question={question}
                                mode="study"
                                trigger={
                                  <Button variant="outline" size="sm">
                                    View Explanation
                                  </Button>
                                }
                              />
                            </div>
                            <div className="text-sm whitespace-pre-wrap mb-2" 
                                 dangerouslySetInnerHTML={{ 
                                   __html: highlightText(question.question, searchQuery) 
                                 }} 
                            />
                            <div className="text-xs text-gray-600 space-y-1">
                              {question.options.map((option: string, index: number) => {
                                const letter = String.fromCharCode(65 + index);
                                const isCorrect = question.correctAnswer === index;
                                return (
                                  <div 
                                    key={index} 
                                    className={isCorrect ? "text-green-600 font-medium" : ""}
                                    dangerouslySetInnerHTML={{ 
                                      __html: `${letter}. ${highlightText(option, searchQuery)}` 
                                    }}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : searchQuery.length > 2 ? (
                    <div className="text-center py-8 text-gray-500">
                      No results found for "{searchQuery}"
                    </div>
                  ) : null}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
