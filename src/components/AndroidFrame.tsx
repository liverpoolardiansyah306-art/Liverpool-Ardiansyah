import React from 'react';

interface AndroidFrameProps {
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-0 sm:py-4">
      {/* Main phone body container */}
      <div className="w-full max-w-[420px] h-screen sm:h-[870px] sm:rounded-3xl sm:border sm:border-slate-800 sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] bg-[#F0F6FB] text-slate-800 flex flex-col overflow-hidden relative">
        {/* Phone Content Screen */}
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative">
          {children}
        </div>
      </div>
    </div>
  );
};


