import React, { useState, useMemo } from 'react';
import { ChapterSelection } from './components/ChapterSelection';
import { LevelSelection } from './components/LevelSelection';
import { GameScreen } from './components/GameScreen';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Chapter, PlayerProgress } from './types';
import { CHAPTERS } from './constants';

type GameState = {
  screen: 'chapters' | 'levels' | 'game';
  selectedChapter: Chapter | null;
  selectedLevel: number | null;
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    screen: 'chapters',
    selectedChapter: null,
    selectedLevel: null,
  });

  const [progress, setProgress] = useLocalStorage<PlayerProgress>('mathQuestProgress', {});

  const handleChapterSelect = (chapter: Chapter) => {
    setGameState({ screen: 'levels', selectedChapter: chapter, selectedLevel: null });
  };

  const handleLevelSelect = (level: number) => {
    if (gameState.selectedChapter) {
      setGameState({ ...gameState, screen: 'game', selectedLevel: level });
    }
  };

  const handleBackToChapters = () => {
    setGameState({ screen: 'chapters', selectedChapter: null, selectedLevel: null });
  };

  const handleBackToLevels = () => {
    if (gameState.selectedChapter) {
      setGameState({ screen: 'levels', selectedChapter: gameState.selectedChapter, selectedLevel: null });
    }
  };

  const handleLevelComplete = (chapterId: string, level: number, score: number) => {
    setProgress(prevProgress => {
      const chapterProgress = prevProgress[chapterId] || { highestLevel: 0, highScores: {} };
      const newHighestLevel = Math.max(chapterProgress.highestLevel, level);
      const newHighScore = Math.max(chapterProgress.highScores[level] || 0, score);
      
      return {
        ...prevProgress,
        [chapterId]: {
          highestLevel: newHighestLevel,
          highScores: {
            ...chapterProgress.highScores,
            [level]: newHighScore
          }
        }
      };
    });
    // After completing a level, go back to the level selection screen
    handleBackToLevels();
  };

  const currentView = useMemo(() => {
    switch (gameState.screen) {
      case 'chapters':
        return <ChapterSelection chapters={CHAPTERS} onChapterSelect={handleChapterSelect} progress={progress} />;
      case 'levels':
        if (gameState.selectedChapter) {
          return (
            <LevelSelection
              chapter={gameState.selectedChapter}
              onLevelSelect={handleLevelSelect}
              onBack={handleBackToChapters}
              progress={progress[gameState.selectedChapter.id] || { highestLevel: 0, highScores: {} }}
            />
          );
        }
        return null; // Should not happen
      case 'game':
        if (gameState.selectedChapter && gameState.selectedLevel) {
          return (
            <GameScreen
              chapter={gameState.selectedChapter}
              level={gameState.selectedLevel}
              onBack={handleBackToLevels}
              onLevelComplete={handleLevelComplete}
            />
          );
        }
        return null; // Should not happen
      default:
        return <ChapterSelection chapters={CHAPTERS} onChapterSelect={handleChapterSelect} progress={progress} />;
    }
  }, [gameState, progress]);

  return (
    <div className="min-h-screen text-gray-800 p-4 sm:p-8 flex flex-col items-center">
      <header className="text-center mb-8">
        <h1 className="text-5xl sm:text-7xl font-fredoka text-fuchsia-600 drop-shadow-[3px_3px_0_rgba(255,255,255,0.8)]" >Math Quest</h1>
        <p className="text-rose-400 text-lg font-bold">An Adventure Through the Land of Numbers</p>
      </header>
      <main className="w-full max-w-4xl bg-slate-50/90 backdrop-blur-sm rounded-2xl shadow-2xl p-4 sm:p-6 border-8 border-white transform -rotate-1">
        <div className="transform rotate-1">
          {currentView}
        </div>
      </main>
    </div>
  );
};

export default App;