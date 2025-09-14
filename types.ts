export interface Chapter {
  id: string;
  title: string;
  theme: string;
  topic: string;
  color: string;
  icon: JSX.Element;
}

export interface Question {
  questionText: string;
  answer: number;
}

export interface Hint {
  textHint: string;
  visualSolution: string; // This will be an SVG string
}

export interface ChapterProgress {
  highestLevel: number;
  highScores: { [level: number]: number }; // Score for each level
}

export interface PlayerProgress {
  [chapterId: string]: ChapterProgress;
}