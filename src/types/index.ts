
// User & Authentication Types
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
  }
  
  // Course Types
  export interface Course {
    id: string;
    userId: string;
    name: string;
    endDate: string;
    description?: string;        
    syllabusUrl?: string;
    topicsExtracted: boolean;    
    createdAt: string;
    updatedAt: string;         
  }
  // Topic Types
  export interface Topic {
    id: string;
    courseId: string;
    title: string;
    content: string;
    orderIndex: number;
    createdAt: string;
  }
  

  
  // Quiz Types
  export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number; // index of correct option
    explanation?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    topic: string;
  }
  
  export interface Quiz {
    id: string;
    courseId: string;
    title: string;
    questions: QuizQuestion[];
    scheduledFor: string;
    completedAt?: string;
    score?: number;
    timeSpent?: number;
  }
  
  // API Response Types
  export interface ApiResponse<T> {
    data: T;
    error: string | null;
    success: boolean;
  }