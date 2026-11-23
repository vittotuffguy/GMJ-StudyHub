import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { StudyTopic } from '../types';
import { deriveMasteryLevel } from '../utils/dateUtils';
import { MasteryStatusText } from './StatusLabel';

interface EvaluateModalProps {
  open: boolean;
  topics: StudyTopic[];
  initialTopicId?: string;
  onClose: () => void;
  onSubmitEvaluation: (
    topicId: string,
    score: number,
    studyMinutes: number,
    reflection: string
  ) => void;
}

export function EvaluateModal({
  open,
  topics,
  initialTopicId,
  onClose,
  onSubmitEvaluation,
}: EvaluateModalProps) {
  const [topicId, setTopicId] = useState(initialTopicId || topics[0]?.id || '');
  const [score, setScore] = useState(75);
  const [studyMinutes, setStudyMinutes] = useState(25);
  const [reflection, setReflection] = useState('');

  useEffect(() => {
    if (open) {
      const targetId = initialTopicId || topics[0]?.id || '';
      setTopicId(targetId);
      const found = topics.find((t) => t.id === targetId);
      setScore(found ? found.masteryScore : 70);
      setStudyMinutes(25);
      setReflection('');
    }
  }, [open, initialTopicId, topics]);

  if (!open) return null;

  const selectedTopic = topics.find((t) => t.id === topicId);
  const previewLevel = deriveMasteryLevel(score);

  const handleTopicChange = (newId: string) => {
    setTopicId(newId);
    const found = topics.find((t) => t.id === newId);
    if (found) setScore(found.masteryScore);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicId) return;
    onSubmitEvaluation(
      topicId,
      score,
      Math.max(5, studyMinutes),
      reflection.trim() || `Evaluasi berkala materi ${selectedTopic?.title || ''}.`
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-evaluate-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg p-6 space-y-5 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h3 id="modal-evaluate-title" className="font-display text-lg font-bold text-slate-900">
              Catat Evaluasi Pemahaman Berkala
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Perbarui skor penguasaan dan refleksi belajar untuk melacak perkembangan Anda
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Materi yang Dievaluasi
            </label>
            <select
              value={topicId}
              onChange={(e) => handleTopicChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-600"
            >
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.number}. {t.title} (Saat ini: {t.masteryScore}%)
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="mastery-slider" className="text-xs font-semibold text-slate-800">
                Tingkat Pemahaman Saat Ini: <span className="font-mono tabular-nums">{score}%</span>
              </label>
              <MasteryStatusText level={previewLevel} />
            </div>
            <input
              id="mastery-slider"
              type="range"
              min={0}
              max={100}
              step={1}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full accent-blue-700"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>0% Belum</span>
              <span>50% Review</span>
              <span>75% Paham</span>
              <span>100% Menguasai</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Durasi Sesi Belajar (Menit)
            </label>
            <input
              type="number"
              min={5}
              max={240}
              value={studyMinutes}
              onChange={(e) => setStudyMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Refleksi Belajar
            </label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={3}
              placeholder="Contoh: Sudah paham cara kerja Pull Request di GitHub, tinggal latihan deployment ke Vercel."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
            >
              Simpan Evaluasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
