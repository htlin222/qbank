import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface WelcomePageProps {
  onStart: (mode: 'study' | 'test') => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ onStart }) => {
  const [mode, setMode] = React.useState<'study' | 'test'>('study');
  const [answer, setAnswer] = React.useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
  const [showError, setShowError] = React.useState<boolean>(false);
  const [showSuccess, setShowSuccess] = React.useState<boolean>(false);

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

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="w-full">
        <CardHeader className="bg-blue-600 text-white text-center pb-6">
          <CardTitle className="text-3xl">113年度腫專考古題</CardTitle>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};
