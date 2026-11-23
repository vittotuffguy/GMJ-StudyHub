import { Menu, Plus } from 'lucide-react';
import { AppSection } from '../types';

interface TopBarProps {
  activeSection: AppSection;
  onOpenMobileMenu: () => void;
  onPrimaryAction: () => void;
}

const SECTION_META: Record<
  AppSection,
  { breadcrumb: string; title: string; ctaLabel: string }
> = {
  overview: {
    breadcrumb: 'SMP Global Mandiri Jakarta / Beranda',
    title: 'Ringkasan Belajar Harian',
    ctaLabel: 'Tambah Tugas',
  },
  schedule: {
    breadcrumb: 'SMP Global Mandiri Jakarta / Jadwal Pelajaran',
    title: 'Jadwal Pelajaran Mingguan',
    ctaLabel: 'Tambah Jadwal',
  },
  tasks: {
    breadcrumb: 'SMP Global Mandiri Jakarta / Pengingat Tugas',
    title: 'Daftar & Pengingat Tugas Sekolah',
    ctaLabel: 'Tambah Tugas',
  },
  materials: {
    breadcrumb: 'SMP Global Mandiri Jakarta / Rangkuman Materi',
    title: 'Rangkuman Materi Informatika',
    ctaLabel: 'Tambah Rangkuman',
  },
  progress: {
    breadcrumb: 'SMP Global Mandiri Jakarta / Progres Pemahaman',
    title: 'Pelacakan Pemahaman Berkala',
    ctaLabel: 'Catat Evaluasi',
  },
};

export function TopBar({ activeSection, onOpenMobileMenu, onPrimaryAction }: TopBarProps) {
  const meta = SECTION_META[activeSection];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3.5">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Buka menu navigasi"
            className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 truncate hidden sm:block">{meta.breadcrumb}</p>
            <h1 className="font-display text-base sm:text-lg font-semibold text-slate-900 truncate">
              {meta.title}
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={onPrimaryAction}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 min-h-[40px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{meta.ctaLabel}</span>
        </button>
      </div>
    </header>
  );
}
