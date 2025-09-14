import React from 'react';
import type { Chapter, ChapterProgress } from '../types';

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

// FIX: Define the props interface for the component.
interface LevelSelectionProps {
    chapter: Chapter;
    onLevelSelect: (level: number) => void;
    onBack: () => void;
    progress: ChapterProgress;
}

export const LevelSelection: React.FC<LevelSelectionProps> = ({ chapter, onLevelSelect, onBack, progress }) => {
  const levels = Array.from({ length: 30 }, (_, i) => i + 1);
  const highestLevelCompleted = progress.highestLevel || 0;

  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="mr-4 p-2 rounded-full bg-white/80 hover:bg-white transition-colors shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-3xl font-bold text-sky-800 font-fredoka">{chapter.title}</h2>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
        {levels.map(level => {
          const isUnlocked = level <= highestLevelCompleted + 1;
          const isCompleted = level <= highestLevelCompleted;
          const highScore = progress.highScores[level];

          let levelClass = 'bg-slate-300 text-slate-500 cursor-not-allowed';
          if (isUnlocked) {
            levelClass = 'bg-white/80 hover:bg-yellow-300 text-sky-800';
          }
          if (isCompleted) {
            levelClass = `${chapter.color} text-white shadow-lg`;
          }

          return (
            <button
              key={level}
              onClick={() => isUnlocked && onLevelSelect(level)}
              disabled={!isUnlocked}
              className={`w-16 h-16 flex flex-col items-center justify-center rounded-lg shadow-md font-bold text-lg transition-all transform ${isUnlocked ? 'hover:scale-110 hover:-rotate-6' : ''} ${levelClass}`}
            >
              {isCompleted ? (
                <>
                  <span className="text-2xl leading-none">★</span>
                  <span className="text-xs mt-1 font-extrabold">{highScore}</span>
                </>
              ) : isUnlocked ? (
                level
              ) : (
                <LockIcon />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};