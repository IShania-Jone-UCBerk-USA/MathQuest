import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="w-16 h-16 border-8 border-dashed rounded-full animate-spin border-t-yellow-400 border-l-fuchsia-500 border-r-sky-400 border-b-yellow-400"></div>
  );
};