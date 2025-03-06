import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface WelcomePageProps {
  onStart: (mode: 'study' | 'test') => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ onStart }) => {
  const [mode, setMode] = React.useState<'study' | 'test'>('study');

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="w-full">
        <CardHeader className="bg-blue-600 text-white text-center pb-6">
          <CardTitle className="text-3xl">113年度腫專考古題</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 pb-4">
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
        </CardContent>
      </Card>
    </div>
  );
};
