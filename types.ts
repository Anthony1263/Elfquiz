
export enum QuestionType {
  MCQ = 'MCQ',
  ESSAY = 'ESSAY',
}

export interface Option {
  id: string;
  text: string;
}

export interface GradingResult {
  handwriting_transcription: string;
  is_legible: boolean;
  score_out_of_100: number;
  key_strengths: string[];
  areas_for_improvement: string[];
  corrected_version: string;
  feedback_summary: string;
}

export interface Question {
  id: string;
  stem: string; // The main question text
  type: QuestionType;
  options: Option[];
  correctOptionId: string;
  explanation: string;
  vignette?: string; // Contextual text/story for the question
  topic?: string;
  difficulty: number; // 0.0 to 1.0
  rubric?: string; // For essay grading
}

export interface UserAnswer {
  questionId: string;
  selectedOptionId?: string; // For MCQ
  essayText?: string; // For Essay
  essayImage?: string; // Base64 of uploaded image
  gradingResult?: GradingResult; // AI Grading result
  isCorrect: boolean;
  timestamp: number;
}

export interface SRSData {
  interval: number; // in days
  repetition: number;
  easeFactor: number;
  nextReviewDate: number; // timestamp
}

export interface UserProgress {
  questionId: string;
  srs: SRSData;
  history: Array<{ timestamp: number; grade: number }>;
}

export interface QuizConfig {
  topic: string;
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  mode: 'practice' | 'exam';
}

export interface QuizState {
  activeQuestionIndex: number;
  answers: Record<string, UserAnswer>;
  isSubmitted: boolean;
  startTime: number;
  infractions: number; // For anti-cheat
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  streak: number;
  xp: number;
  masteryLevel: 'Novice' | 'Intermediate' | 'Advanced' | 'Scholar';
  educationLevel: string; 
  fieldOfStudy: string;
  themeSeason?: 'spring' | 'summer' | 'autumn' | 'winter';
  lastActiveDate?: string; // ISO date string or similar for streak tracking
}

export interface QuizResult {
  id: string;
  topic: string;
  score: number;
  total: number;
  accuracy: number; // percentage
  xpEarned: number;
  timeTaken: number; // in seconds
  timestamp: number;
  difficulty: string;
}
