import React from 'react';
import { Settings, BookOpen } from 'lucide-react';

interface HeaderProps {
  systemName?: string;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  systemName = 'SISTEM INFORMASI PERPUSTAKAAN',
  onOpenSettings,
}) => {
  return (
    <header className="w-full bg-[#EBF4FA] px-4 py-2.5 flex items-center justify-between border-b border-sky-100/70 select-none shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-2">
        {/* Teal circular badge icon */}
        <div className="w-7 h-7 rounded-full bg-[#189AB4] flex items-center justify-center shadow-xs text-white">
          <BookOpen className="w-4 h-4 stroke-[2.2]" />
        </div>
        <h1 className="text-xs font-extrabold tracking-wide text-[#1A508B] uppercase">
          {systemName}
        </h1>
      </div>

      {/* Settings gear icon */}
      <button
        onClick={onOpenSettings}
        className="w-8 h-8 rounded-full flex items-center justify-center text-[#2A4D69] hover:bg-sky-200/50 active:scale-95 transition-all cursor-pointer"
        title="Pengaturan Perpustakaan"
        aria-label="Pengaturan"
      >
        <Settings className="w-5 h-5 stroke-[2]" />
      </button>
    </header>
  );
};
