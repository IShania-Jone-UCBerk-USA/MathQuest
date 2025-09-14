import React from 'react';
import type { Chapter, PlayerProgress } from '../types';

// FIX: Define the props interface for the component.
interface ChapterSelectionProps {
  chapters: Chapter[];
  onChapterSelect: (chapter: Chapter) => void;
  progress: PlayerProgress;
}

export const ChapterSelection: React.FC<ChapterSelectionProps> = ({ chapters, onChapterSelect, progress }) => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-center mb-6 text-sky-700 font-fredoka">Choose Your Adventure!</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {chapters.map(chapter => {
          const chapterProgress = progress[chapter.id];
          const levelsCompleted = chapterProgress ? chapterProgress.highestLevel : 0;
          
          return (
            <button
              key={chapter.id}
              onClick={() => onChapterSelect(chapter)}
              className={`p-6 rounded-xl shadow-lg text-white font-bold text-left flex flex-col justify-between transform hover:scale-105 hover:shadow-2xl transition-all duration-300 group ${chapter.color}`}
            >
              <div className="flex items-start justify-between">
                <h3 className="text-2xl w-2/3">{chapter.title}</h3>
                <div className="transition-transform group-hover:animate-bounce">
                  {chapter.icon}
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-white/30 rounded-full h-4 border-2 border-white/50">
                  <div className="bg-white h-full rounded-full" style={{ width: `${(levelsCompleted / 30) * 100}%` }}></div>
                </div>
                <p className="text-right text-sm mt-1 font-black tracking-wider">{levelsCompleted} / 30</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};