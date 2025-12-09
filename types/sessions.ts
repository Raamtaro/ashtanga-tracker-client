export type PracticeSessionStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface PracticeSessionDTO {
  id: string;
  date: string;              // ISO
  label?: string | null;
  practiceType?: string | null;
  durationMinutes?: number | null;
  status: PracticeSessionStatus;
  overallScore?: number | null;
  energyLevel?: number | null;
  mood?: number | null;
}

export interface Paginated<T> {
  items: T[];
  nextCursor?: string | null;
}