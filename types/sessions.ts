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


export type PracticeType = //All Are preset types except CUSTOM
  | 'HALF_PRIMARY'
  | 'FULL_PRIMARY'
  | 'INTERMEDIATE'
  | 'ADVANCED_A'
  | 'ADVANCED_B'
  | 'CUSTOM';

export type SequenceGroup =
  | 'SUN_SALUTATIONS'
  | 'STANDING'
  | 'PRIMARY'
  | 'INTERMEDIATE'
  | 'ADVANCED_A'
  | 'ADVANCED_B'
  | 'BACKBENDING'
  | 'FINISHING'
  | 'WARMUP'
  | 'OTHER';

export type Side = 'LEFT' | 'RIGHT' | 'BOTH' | 'NA';

export type CreatedScoreCardDTO = {
  id: string;
  side: Side | null;
  pose: { slug: string; sequenceGroup: SequenceGroup };
};

export type CreatedSessionDTO = {
  id: string;
  date: string;
  label: string | null;
  practiceType: PracticeType | null;
  durationMinutes: number | null;
  scoreCards: CreatedScoreCardDTO[];
};

export type PoseDTO = {
  slug: string;
  sanskritName: string;
  englishName: string | null;
  sequenceGroup: SequenceGroup;
};
