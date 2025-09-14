
import React from 'react';
import type { Chapter } from './types';

const AddIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const MultiplyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const FractionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2z" /></svg>;
const SubtractIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>;
const DivideIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 14a.5.5 0 110-1 .5.5 0 010 1zm0-7a.5.5 0 110-1 .5.5 0 010 1zm-4 3h8" /></svg>;
const GeometryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;

export const CHAPTERS: Chapter[] = [
  {
    id: 'addition',
    title: 'Forest of Addition',
    theme: 'a friendly forest with talking animals',
    topic: 'Addition',
    color: 'bg-green-500',
    icon: <AddIcon />,
  },
  {
    id: 'subtraction',
    title: 'Castle of Subtraction',
    theme: 'a medieval castle with knights and dragons',
    topic: 'Subtraction',
    color: 'bg-gray-500',
    icon: <SubtractIcon />,
  },
  {
    id: 'multiplication',
    title: 'Mountain of Multiplication',
    theme: 'a high mountain peak with eagles and yetis',
    topic: 'Multiplication',
    color: 'bg-red-500',
    icon: <MultiplyIcon />,
  },
  {
    id: 'division',
    title: 'Jungle of Division',
    theme: 'a dense jungle with monkeys and parrots',
    topic: 'Division',
    color: 'bg-yellow-500',
    icon: <DivideIcon />,
  },
  {
    id: 'fractions',
    title: 'Ocean of Fractions',
    theme: 'an underwater world with colorful fish and coral reefs',
    topic: 'Fractions',
    color: 'bg-blue-500',
    icon: <FractionIcon />,
  },
  {
    id: 'geometry',
    title: 'Galaxy of Geometry',
    theme: 'a futuristic space adventure with aliens and rockets',
    topic: 'Geometry (shapes, area, perimeter)',
    color: 'bg-purple-500',
    icon: <GeometryIcon />,
  },
];
