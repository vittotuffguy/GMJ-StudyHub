import { useState } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  BookOpenText,
  TrendingUp,
  RotateCcw,
  X,
} from 'lucide-react';
import { AppSection, StudentProfile } from '../types';

interface SidebarProps {
  activeSection: AppSection;
  onSelectSection: (section: AppSection) => void;
  profile: StudentProfile;
  pendingTasksCount: number;
  reviewNeededCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onResetDemoData: () => void;
}

const NAV_ITEMS: { id: AppSection; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Beranda', icon: LayoutDashboard },
  { id: 'schedule', label: 'Jadwal Pelajaran', icon: CalendarDays },
  { id: 'tasks', label: 'Pengingat Tugas', icon: CheckSquare },
  { id: 'materials', label: 'Rangkuman Materi', icon: BookOpenText },
  { id: 'progress', label: 'Progres Pemahaman', icon: TrendingUp },
];

export function Sidebar({
  activeSection,
  onSelectSection,
  profile,
  pendingTasksCount,
  reviewNeededCount,
  mobileOpen,
  onCloseMobile,
  onResetDemoData,
}: SidebarProps) {
  const [imgError, setImgError] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleNavClick = (section: AppSection) => {
    onSelectSection(section);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-[264px]">
      {/* Brand Wordmark Zone */}
      <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
        <button
          type="button"
          onClick={() => handleNavClick('overview')}
          className="text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 rounded"
        >
          <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap block">
            GMJ StudyHub
          </span>
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Tutup menu navigasi"
          className="lg:hidden p-2 -mr-2 text-slate-500 hover:text-slate-900 rounded-md min-h-[40px] min-w-[40px] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav aria-label="Navigasi utama" className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const count =
            item.id === 'tasks'
              ? pendingTasksCount
              : item.id === 'progress'
              ? reviewNeededCount
              : 0;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 min-h-[42px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                isActive
                  ? 'bg-blue-50 text-blue-800 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-blue-700' : 'text-slate-500'
                  }`}
                  aria-hidden="true"
                />
                <span className="truncate whitespace-nowrap">{item.label}</span>
              </span>
              {count > 0 && (
                <span
                  className={`font-mono text-xs tabular-nums shrink-0 ${
                    isActive ? 'text-blue-800 font-semibold' : 'text-slate-500'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Student Profile & Reset Utility */}
      <div className="p-4 border-t border-slate-200 space-y-3">
        <div className="flex items-center gap-3">
          {!imgError ? (
            <img
              src="/src/assets/images/avatar_student_gmj_1795408716449.jpg"
              alt="Foto profil siswa SMP Global Mandiri Jakarta"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
            />
          ) : (
            <div
              aria-hidden="true"
              className="w-10 h-10 rounded-lg bg-blue-700 text-white font-display font-semibold text-sm flex items-center justify-center shrink-0"
            >
              GM
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{profile.name}</p>
            <p className="text-xs text-slate-500 truncate">{profile.school}</p>
            <p className="text-xs text-slate-500 truncate">{profile.grade}</p>
          </div>
        </div>

        {!confirmReset ? (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors min-h-[36px]"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">Reset Data Awal</span>
          </button>
        ) : (
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <p className="text-xs text-slate-700">Kembalikan jadwal &amp; catatan ke data awal?</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onResetDemoData();
                  setConfirmReset(false);
                }}
                className="flex-1 px-2.5 py-1.5 text-xs font-medium bg-slate-900 text-white rounded hover:bg-slate-800 whitespace-nowrap"
              >
                Ya, Reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="flex-1 px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-200 text-slate-700 rounded hover:bg-slate-50 whitespace-nowrap"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block shrink-0 h-screen sticky top-0">{sidebarContent}</aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
