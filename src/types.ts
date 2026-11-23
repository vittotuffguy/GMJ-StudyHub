export type AppSection = 'overview' | 'schedule' | 'tasks' | 'materials' | 'progress';

export type DayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat';

export type TaskPriority = 'Tinggi' | 'Sedang' | 'Rendah';

export type MasteryLevel =
  | 'Belum Dipelajari'
  | 'Perlu Review'
  | 'Cukup Paham'
  | 'Sangat Paham';

export interface ScheduleItem {
  id: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  room: string;
  linkedTopicId?: string;
  note?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  subject: string;
  dueDate: string; // YYYY-MM-DD
  priority: TaskPriority;
  completed: boolean;
  linkedTopicId?: string;
  notes: string;
  createdAt: string;
}

export interface GlossaryItem {
  term: string;
  definition: string;
}

export interface TopicQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface StudyTopic {
  id: string;
  number: string;
  title: string;
  category: string;
  readMinutes: number;
  summary: string;
  keyPoints: string[];
  realWorldExamples: string[];
  glossary: GlossaryItem[];
  personalNotes: string;
  masteryScore: number; // 0 - 100
  masteryLevel: MasteryLevel;
  lastReviewedAt: string; // YYYY-MM-DD
  nextReviewDate: string; // YYYY-MM-DD
  interactiveType?: 'ipo' | 'pipeline';
  quizQuestions: TopicQuizQuestion[];
}

export interface ProgressLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  topicId: string;
  topicTitle: string;
  score: number;
  previousScore: number;
  studyMinutes: number;
  reflection: string;
}

export interface StudentProfile {
  name: string;
  school: string;
  grade: string;
  academicYear: string;
}
