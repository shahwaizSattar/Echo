export type ModerationSeverity = 'SAFE' | 'BLUR' | 'WARNING' | 'BLOCK';

export interface ModerationScores {
  hateSpeech: number;
  harassment: number;
  threats: number;
  sexual: number;
  selfHarm: number;
  extremism: number;
  profanity: number;
}

export interface ModerationData {
  severity: ModerationSeverity;
  scores: ModerationScores;
  reason: string;
  checkedAt: Date;
}

export interface ContentModeration {
  moderation?: ModerationData;
}
