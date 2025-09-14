import React from 'react';

interface CharacterFeedbackProps {
    feedback: string | null;
    visualSolution?: string | null;
    status: 'playing' | 'incorrect' | 'correct';
}

const getStatusStyles = (status: CharacterFeedbackProps['status']) => {
    switch (status) {
        case 'correct':
            return {
                borderColor: 'border-green-400',
                bgColor: 'bg-green-100',
                textColor: 'text-green-800',
                bubbleBorder: 'border-b-green-400'
            };
        case 'incorrect':
            return {
                borderColor: 'border-red-400',
                bgColor: 'bg-red-100',
                textColor: 'text-red-800',
                bubbleBorder: 'border-b-red-400'
            };
        default:
            return {
                borderColor: 'border-sky-400',
                bgColor: 'bg-sky-100',
                textColor: 'text-sky-800',
                bubbleBorder: 'border-b-sky-400'
            };
    }
}

const GigiTheGuide = () => (
  <div className="animate-bob">
    <svg width="150" height="150" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="gigi-grad" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#d8b4fe" />
                <stop offset="100%" stopColor="#a855f7" />
            </radialGradient>
        </defs>
        <g transform="translate(0, 5)">
            <line x1="50" y1="5" x2="50" y2="20" stroke="#9333ea" strokeWidth="2" />
            <circle cx="50" cy="5" r="4" fill="#facc15" stroke="#9333ea" strokeWidth="1.5"/>
            
            <circle cx="50" cy="40" r="20" fill="url(#gigi-grad)" stroke="#9333ea" strokeWidth="2" />
            
            <rect x="35" y="30" width="30" height="15" fill="#1e1b4b" rx="2" />
            <rect x="37" y="32" width="10" height="8" fill="#4ade80" />
            <rect x="53" y="32" width="10" height="8" fill="#4ade80" />

            <path d="M 42 50 Q 50 54 58 50" stroke="#1e1b4b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            
            <rect x="30" y="60" width="40" height="25" rx="5" fill="#c4b5fd" stroke="#9333ea" strokeWidth="2" />
            <rect x="25" y="85" width="50" height="10" rx="3" fill="#a855f7" stroke="#9333ea" strokeWidth="2" />
        </g>
    </svg>
  </div>
);


export const CharacterFeedback: React.FC<CharacterFeedbackProps> = ({ feedback, visualSolution, status }) => {
    const styles = getStatusStyles(status);
    const initialMessage = "I'm Gigi the Guide! Solve the problem, and I'll help if you get stuck.";
    const displayFeedback = feedback || initialMessage;
    
    return (
        <div className="flex flex-col items-center text-center p-4 bg-white/50 rounded-lg shadow-lg">
            <GigiTheGuide />
            <p className="font-bold text-purple-800 mt-2 text-lg font-fredoka">Gigi the Guide</p>
            <div className={`relative mt-4 p-4 rounded-lg shadow-md border-2 w-full min-h-[100px] ${styles.borderColor} ${styles.bgColor} ${styles.textColor}`}>
                 <div className={`absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[15px] ${styles.bubbleBorder}`}></div>
                <p className="font-semibold">{displayFeedback}</p>
                 {status === 'incorrect' && !feedback && (
                    <div className="flex items-center justify-center mt-2">
                        <svg className="animate-spin h-5 w-5 mr-3 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="font-bold">Thinking of a hint...</span>
                    </div>
                )}
                {visualSolution && (
                    <div className="mt-4 bg-white p-2 rounded-md shadow-inner">
                        <h4 className="font-bold text-sm mb-1 text-gray-700">Here's how it looks:</h4>
                        <div dangerouslySetInnerHTML={{ __html: visualSolution }} className="w-full flex justify-center" />
                    </div>
                )}
            </div>
        </div>
    );
};