import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { generateMathQuestion, getSolution, getTextHint } from '../services/geminiService';
import { playCorrectSound, playIncorrectSound } from '../services/soundService';
import type { Chapter, Question, Hint } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { CharacterFeedback } from './CharacterFeedback';

interface GameScreenProps {
  chapter: Chapter;
  level: number;
  onBack: () => void;
  onLevelComplete: (chapterId: string, level: number, score: number) => void;
}

type GameStatus = 'loading' | 'playing' | 'answered' | 'revealed' | 'error';
const QUESTIONS_PER_LEVEL = 25;

export const GameScreen: React.FC<GameScreenProps> = ({ chapter, level, onBack, onLevelComplete }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [status, setStatus] = useState<GameStatus>('loading');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [solution, setSolution] = useState<Hint | null>(null);
  const [score, setScore] = useState(0);
  const [consecutiveCorrectAnswers, setConsecutiveCorrectAnswers] = useState(0);
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);
  const [isFetchingHint, setIsFetchingHint] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const multiplier = useMemo(() => 1 + Math.floor(consecutiveCorrectAnswers / 2), [consecutiveCorrectAnswers]);
  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

  const fetchQuestionWithRetries = useCallback(async (retries = 3, delay = 1000): Promise<Question | null> => {
    setApiError(null);
    try {
      const pastQuestions = questions.map(q => q.questionText);
      const newQuestion = await generateMathQuestion(chapter.topic, chapter.theme, level, pastQuestions);
      if (newQuestion && newQuestion.questionText && newQuestion.answer !== undefined) {
        return newQuestion;
      }
      throw new Error("Received invalid or empty question from the API.");
    } catch (error: any) {
      if (error.message === 'RATE_LIMITED' && retries > 0) {
        const waitTime = Math.round(delay / 1000);
        setApiError(`Gigi is thinking extra hard due to high traffic! Retrying in ${waitTime}s...`);
        await new Promise(res => setTimeout(res, delay));
        return fetchQuestionWithRetries(retries - 1, delay * 2); // Exponential backoff
      } else {
        console.error("Failed to fetch a new question after retries:", error);
        setApiError("Oh no! I'm having trouble coming up with a new question. Please try again in a bit.");
        setStatus('error');
        return null;
      }
    }
  }, [chapter.topic, chapter.theme, level, questions]);

  useEffect(() => {
    const initializeLevel = async () => {
      setStatus('loading');
      setApiError(null);
      const firstQuestion = await fetchQuestionWithRetries();
      if (firstQuestion) {
        setQuestions([firstQuestion]);
        setCurrentQuestionIndex(0);
        setScore(0);
        setConsecutiveCorrectAnswers(0);
        setIncorrectAttempts(0);
        setSolution(null);
        setStatus('playing');
      }
    };
    initializeLevel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter, level]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex >= QUESTIONS_PER_LEVEL - 1) {
      onLevelComplete(chapter.id, level, score);
      return;
    }

    const nextIndex = currentQuestionIndex + 1;
    if (questions[nextIndex]) {
      setCurrentQuestionIndex(nextIndex);
      setStatus('playing');
      setUserAnswer('');
      setIsCorrect(null);
      setSolution(null);
      setIncorrectAttempts(0);
      setApiError(null);
    } else {
      // Pre-fetch must have failed, so we fetch it now and show loading.
      setStatus('loading');
      fetchQuestionWithRetries().then((nextQuestion) => {
        if (nextQuestion) {
          setQuestions(prev => [...prev, nextQuestion]);
          setCurrentQuestionIndex(nextIndex);
          setStatus('playing');
          setUserAnswer('');
          setIsCorrect(null);
          setSolution(null);
          setIncorrectAttempts(0);
          setApiError(null);
        }
      });
    }
  }, [currentQuestionIndex, onLevelComplete, chapter.id, level, score, questions, fetchQuestionWithRetries]);
  
  // Pre-fetching logic
  useEffect(() => {
    // Check if we need to pre-fetch and if there isn't already a fetch in progress
    const shouldPrefetch = questions.length === currentQuestionIndex + 1 && questions.length < QUESTIONS_PER_LEVEL && (status === 'answered' || status === 'playing');

    if (shouldPrefetch) {
      fetchQuestionWithRetries().then(nextQuestion => {
        if (nextQuestion) {
          setQuestions(prev => [...prev, nextQuestion]);
        }
      });
    }
  }, [status, currentQuestionIndex, questions, fetchQuestionWithRetries]);


  const handleShowHint = async () => {
    if (!currentQuestion || (solution && solution.textHint)) return;
    setIsFetchingHint(true);
    const hintText = await getTextHint(currentQuestion.questionText, userAnswer, currentQuestion.answer);
    setSolution({ textHint: hintText || "Try looking at the numbers again!", visualSolution: "" });
    setIsFetchingHint(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion || userAnswer.trim() === '' || status !== 'playing') return;

    const answerNumber = parseFloat(userAnswer);

    if (Math.abs(answerNumber - currentQuestion.answer) < 0.01) {
      playCorrectSound();
      setIsCorrect(true);
      if (incorrectAttempts === 0) {
        setScore(prev => prev + (10 * multiplier));
        setConsecutiveCorrectAnswers(prev => prev + 1);
      } else {
        setScore(prev => prev + 5);
      }
      setStatus('answered');
      setTimeout(handleNextQuestion, 1500);
    } else {
      playIncorrectSound();
      setIsCorrect(false);
      setConsecutiveCorrectAnswers(0);
      const newAttempts = incorrectAttempts + 1;
      setIncorrectAttempts(newAttempts);

      if (newAttempts >= 2) {
        setStatus('revealed');
        setIsFetchingHint(true);
        getSolution(currentQuestion.questionText, userAnswer, currentQuestion.answer).then(finalSolution => {
            setSolution(finalSolution);
            setIsFetchingHint(false);
        });
      } else {
        setStatus('answered');
      }
    }
  };
  
  if (status === 'loading' && questions.length === 0) {
    return <div className="flex flex-col items-center justify-center h-96">
        <LoadingSpinner />
        <p className="mt-4 text-sky-700 text-lg font-bold text-center">
            {apiError || 'Preparing your first challenge...'}
        </p>
    </div>;
  }
  
  if (status === 'error') {
     return <div className="flex flex-col items-center justify-center h-96 text-center">
        <p className="text-rose-500 text-xl font-bold font-fredoka">Oh no!</p>
        <p className="mt-2 text-sky-700 text-lg font-bold">{apiError}</p>
         <button onClick={onBack} className="mt-6 bg-yellow-400 text-yellow-900 font-bold py-3 px-6 rounded-lg text-xl border-b-8 border-yellow-600">
             Back to Levels
        </button>
    </div>;
  }


  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="md:w-2/3">
        <div className="flex items-center mb-4">
          <button onClick={onBack} className="mr-4 p-2 rounded-full bg-white/80 hover:bg-white transition" aria-label="Back to levels">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex-grow">
            <h2 className="text-2xl font-bold text-sky-800 font-fredoka">{chapter.title}</h2>
            <p className="text-sky-600 font-semibold">Level {level}</p>
          </div>
        </div>
         <div className="flex justify-between items-center bg-sky-100/80 p-2 px-4 rounded-lg mb-4 text-sky-800 font-bold border-2 border-sky-200">
            <span>Question: {currentQuestionIndex + 1} / {QUESTIONS_PER_LEVEL}</span>
            <span>Score: {score}</span>
            <span>Multiplier: {multiplier}x</span>
        </div>
        
        <div className={`bg-white/90 p-6 rounded-lg shadow-md min-h-[150px] flex items-center justify-center border-4 border-slate-200`}>
           {status === 'loading' && questions.length > 0 ? (
             <div className="text-center"> <LoadingSpinner /> <p className="mt-2 text-sky-700">{apiError || 'Loading next question...'}</p></div>
           ) : ( <p className="text-xl text-center text-gray-800">{currentQuestion?.questionText}</p> )}
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          <input
            type="number" step="any" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your answer here"
            className="w-full p-4 text-xl border-4 border-sky-300 rounded-lg focus:ring-4 focus:ring-yellow-300 focus:border-yellow-400 transition shadow-inner"
            disabled={status !== 'playing'} aria-label="Answer input"
          />
          {status === 'playing' && (
            <button type="submit" className="mt-4 w-full bg-yellow-400 text-yellow-900 font-bold py-3 px-6 rounded-lg text-xl transition-transform transform hover:scale-105 border-b-8 border-yellow-600 active:border-b-2 active:translate-y-1">
              Check Answer
            </button>
          )}
        </form>

        {status === 'answered' && !isCorrect && incorrectAttempts < 2 && (
            <div className="mt-4 flex gap-4">
                <button onClick={() => { setStatus('playing'); setUserAnswer(''); }} className="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-lg text-xl border-b-8 border-blue-700 active:border-b-2 active:translate-y-1 transition-all transform hover:scale-105">
                    Try Again
                </button>
                <button onClick={handleShowHint} className="w-full bg-teal-500 text-white font-bold py-3 px-6 rounded-lg text-xl border-b-8 border-teal-700 active:border-b-2 active:translate-y-1 transition-all transform hover:scale-105" disabled={isFetchingHint}>
                    {isFetchingHint ? 'Thinking...' : 'Show Hint'}
                </button>
            </div>
        )}

        {status === 'revealed' && (
             <button onClick={handleNextQuestion} className="mt-4 w-full bg-green-500 text-white font-bold py-3 px-6 rounded-lg text-xl border-b-8 border-green-700 active:border-b-2 active:translate-y-1 transition-all transform hover:scale-105">
              Continue
            </button>
        )}
      </div>
      <div className="md:w-1/3 mt-6 md:mt-0">
        <CharacterFeedback 
            feedback={isCorrect ? `That's right!` : solution?.textHint} 
            visualSolution={status === 'revealed' ? solution?.visualSolution : null} 
            status={status === 'answered' || status === 'revealed' ? (isCorrect ? 'correct' : 'incorrect') : 'playing'} 
        />
      </div>
    </div>
  );
};
