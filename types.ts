export interface Question {
  id: number;
  text: string;
  maxMarks: number;
  schema: {
    IU1: string;
    IS1: string;
    IU2: string;
    IS2: string;
  };
}

export interface FeedbackResult {
  questionId: number;
  score: number;
  feedback: string;
  breakdown: {
    IU1: boolean;
    IS1: boolean;
    IU2: boolean;
    IS2: boolean;
    hasGrammarError: boolean;
  };
}

export type ViewMode = 'landing' | 'grading';

export interface AppState {
  view: ViewMode;
  answers: Record<number, string>;
  results: Record<number, FeedbackResult | null>;
  loading: Record<number, boolean>;
}