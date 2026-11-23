import { AlertCircle, CheckCircle2, Clock, BookOpen } from 'lucide-react';
import { MasteryLevel, TaskPriority } from '../types';
import { DueUrgency } from '../utils/dateUtils';

export function MasteryStatusText({ level }: { level: MasteryLevel }) {
  switch (level) {
    case 'Sangat Paham':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Sangat Paham</span>
        </span>
      );
    case 'Cukup Paham':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 whitespace-nowrap">
          <BookOpen className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Cukup Paham</span>
        </span>
      );
    case 'Perlu Review':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Perlu Review</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 whitespace-nowrap">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Belum Dipelajari</span>
        </span>
      );
  }
}

export function DueStatusText({ label, urgency }: { label: string; urgency: DueUrgency }) {
  switch (urgency) {
    case 'overdue':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 whitespace-nowrap">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{label}</span>
        </span>
      );
    case 'today':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{label}</span>
        </span>
      );
    case 'soon':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{label}</span>
        </span>
      );
    case 'done':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{label}</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{label}</span>
        </span>
      );
  }
}

export function PriorityText({ priority }: { priority: TaskPriority }) {
  if (priority === 'Tinggi') {
    return <span className="text-xs font-semibold text-red-700 whitespace-nowrap">Prioritas Tinggi</span>;
  }
  if (priority === 'Sedang') {
    return <span className="text-xs font-medium text-amber-700 whitespace-nowrap">Prioritas Sedang</span>;
  }
  return <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Prioritas Rendah</span>;
}
