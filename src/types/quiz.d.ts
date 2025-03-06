declare module '@/data/compiledQuestions.json' {
  interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    questionFigures: string[];
    explainFigures: string[];
  }

  const questions: QuizQuestion[];
  export default questions;
}
