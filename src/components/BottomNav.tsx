import React from 'react';
import { Home, Users, MessageSquareText, BarChart3, FileText } from 'lucide-react';
import { TabType } from '../types/library';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: 'beranda' as TabType, label: 'Beranda', icon: Home },
    { id: 'anggota' as TabType, label: 'Anggota', icon: Users },
    { id: 'layanan' as TabType, label: 'Layanan', icon: MessageSquareText },
    { id: 'statistik' as TabType, label: 'Statistik', icon: BarChart3 },
    { id: 'laporan' as TabType, label: 'Laporan', icon: FileText },
  ];

  return (
    <nav className="w-full bg-white border-t border-sky-100 shadow-[0_-4px_15px_rgba(0,0,0,0.03)] px-2 py-2 flex items-center justify-around shrink-0 z-30 select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 cursor-pointer min-w-[56px] ${
              isActive
                ? 'text-[#0E8388]'
                : 'text-slate-400 hover:text-slate-600 active:scale-95'
            }`}
          >
            <div
              className={`p-1 rounded-lg transition-transform ${
                isActive ? 'scale-110' : ''
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? 'stroke-[2.4] fill-[#0E8388]/10' : 'stroke-[1.8]'
                }`}
              />
            </div>
            <span
              className={`text-[11px] mt-0.5 tracking-tight font-medium ${
                isActive ? 'font-bold text-[#0E8388]' : 'text-slate-500'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
