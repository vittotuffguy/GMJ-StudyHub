import { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, BookOpen, ClipboardCheck, Clock, Minus } from 'lucide-react';
import { ProgressLogEntry, StudyTopic } from '../types';
import { formatIndonesianDate, getTodayISO } from '../utils/dateUtils';
import { MasteryStatusText } from './StatusLabel';

interface ProgressViewProps {
  topics: StudyTopic[];
  logs: ProgressLogEntry[];
  onOpenTopic: (topicId: string) => void;
  onOpenEvaluateModal: (topicId?: string) => void;
}

export function ProgressView({
  topics,
  logs,
  onOpenTopic,
  onOpenEvaluateModal,
}: ProgressViewProps) {
  const todayISO = getTodayISO();

  const sortedLogsAsc = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const sortedLogsDesc = [...logs].sort((a, b) => b.date.localeCompare(a.date));

  const [activeLogId, setActiveLogId] = useState<string>(
    sortedLogsAsc[sortedLogsAsc.length - 1]?.id || ''
  );

  const avgScore =
    topics.length > 0
      ? Math.round(topics.reduce((sum, t) => sum + t.masteryScore, 0) / topics.length)
      : 0;
  const masteredCount = topics.filter((t) => t.masteryScore >= 85).length;
  const totalMinutes = logs.reduce((sum, l) => sum + l.studyMinutes, 0);

  // SVG chart dimensions
  const chartWidth = 760;
  const chartHeight = 220;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 32;
  const innerWidth = chartWidth - padLeft - padRight;
  const innerHeight = chartHeight - padTop - padBottom;

  const chartLogs = sortedLogsAsc.slice(-12);
  const points = chartLogs.map((entry, idx) => {
    const x =
      chartLogs.length === 1
        ? padLeft + innerWidth / 2
        : padLeft + (idx / (chartLogs.length - 1)) * innerWidth;
    const y = padTop + ((100 - entry.score) / 100) * innerHeight;
    return { ...entry, x, y };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPoints =
    points.length > 0
      ? `${points[0].x},${padTop + innerHeight} ${polylinePoints} ${
          points[points.length - 1].x
        },${padTop + innerHeight}`
      : '';

  const inspectedLog =
    points.find((p) => p.id === activeLogId) || points[points.length - 1] || null;

  return (
    <div className="space-y-6">
      {/* 4 Summary Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Rata-rata Penguasaan</p>
          <p className="mt-2 font-display text-2xl font-bold text-slate-900 tabular-nums">
            {avgScore}%
          </p>
          <p className="mt-1 text-xs text-slate-500">Target semester: 80%</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Sesi Evaluasi Tercatat</p>
          <p className="mt-2 font-display text-2xl font-bold text-slate-900 tabular-nums">
            {logs.length} <span className="text-sm font-normal text-slate-500">Sesi</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">Pelacakan berkala aktif</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Materi Sangat Paham</p>
          <p className="mt-2 font-display text-2xl font-bold text-slate-900 tabular-nums">
            {masteredCount} <span className="text-sm font-normal text-slate-500">/ {topics.length}</span>
          </p>
          <p className="mt-1 text-xs text-emerald-700 font-medium">Skor minimal 85%</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Total Durasi Belajar</p>
          <p className="mt-2 font-display text-2xl font-bold text-slate-900 tabular-nums">
            {totalMinutes} <span className="text-sm font-normal text-slate-500">Menit</span>
          </p>
          <p className="mt-1 text-xs text-slate-500 tabular-nums">
            Setara {(totalMinutes / 60).toFixed(1)} jam fokus
          </p>
        </div>
      </section>

      {/* Periodic Understanding Trend Chart */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-semibold text-slate-900">
              Grafik Tren Pemahaman Berkala
            </h3>
            <p className="text-xs text-slate-500">
              Arahkan kursor atau klik titik evaluasi untuk melihat catatan refleksi sesi tersebut
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenEvaluateModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg self-start sm:self-auto whitespace-nowrap"
          >
            <ClipboardCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Tambah Check-in</span>
          </button>
        </div>

        {points.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Belum ada riwayat evaluasi pemahaman. Mulai catat sesi evaluasi pertama Anda.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full min-w-[540px] h-auto"
                role="img"
                aria-label="Grafik garis perkembangan skor pemahaman materi secara berkala"
              >
                <defs>
                  <linearGradient id="masteryAreaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.01" />
                  </linearGradient>
                </defs>

                {/* Horizontal Y Gridlines */}
                {[0, 25, 50, 75, 100].map((val) => {
                  const yPos = padTop + ((100 - val) / 100) * innerHeight;
                  return (
                    <g key={val}>
                      <line
                        x1={padLeft}
                        y1={yPos}
                        x2={chartWidth - padRight}
                        y2={yPos}
                        stroke="#E2E8F0"
                        strokeDasharray={val === 0 ? undefined : '4 4'}
                        strokeWidth="1"
                      />
                      <text
                        x={padLeft - 8}
                        y={yPos + 4}
                        textAnchor="end"
                        className="fill-slate-400 text-[10px] font-mono"
                      >
                        {val}%
                      </text>
                    </g>
                  );
                })}

                {/* Area & Line */}
                {points.length > 1 && (
                  <>
                    <polygon points={areaPoints} fill="url(#masteryAreaFill)" />
                    <polyline
                      fill="none"
                      stroke="#1D4ED8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={polylinePoints}
                    />
                  </>
                )}

                {/* Interactive Nodes */}
                {points.map((pt) => {
                  const isActive = inspectedLog?.id === pt.id;
                  return (
                    <g
                      key={pt.id}
                      onMouseEnter={() => setActiveLogId(pt.id)}
                      onClick={() => setActiveLogId(pt.id)}
                      className="cursor-pointer"
                    >
                      <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isActive ? '6' : '4.5'}
                        fill={isActive ? '#1D4ED8' : '#FFFFFF'}
                        stroke="#1D4ED8"
                        strokeWidth="2.5"
                      />
                      <text
                        x={pt.x}
                        y={chartHeight - 8}
                        textAnchor="middle"
                        className={`text-[10px] font-mono ${
                          isActive ? 'fill-slate-900 font-semibold' : 'fill-slate-400'
                        }`}
                      >
                        {pt.date.slice(5)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Selected Node Readout Bar */}
            {inspectedLog && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-medium text-slate-500">
                    {formatIndonesianDate(inspectedLog.date)} ·{' '}
                    <span className="text-slate-900 font-semibold">{inspectedLog.topicTitle}</span>
                  </p>
                  <p className="text-xs text-slate-600">{inspectedLog.reflection}</p>
                </div>
                <div className="font-mono text-sm font-bold text-blue-700 tabular-nums shrink-0">
                  Skor {inspectedLog.score}% · {inspectedLog.studyMinutes} mnt
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Topic-by-Topic Mastery & Spaced Repetition Schedule */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-display text-base font-semibold text-slate-900">
            Matriks Penguasaan &amp; Jadwal Review per Topik
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Penjadwalan review otomatis menyesuaikan tingkat penguasaan terakhir
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                <th className="py-3 px-6">Materi</th>
                <th className="py-3 px-4">Status Pemahaman</th>
                <th className="py-3 px-4">Skor</th>
                <th className="py-3 px-4">Ulasan Terakhir</th>
                <th className="py-3 px-4">Jadwal Review</th>
                <th className="py-3 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {topics.map((topic) => {
                const isReviewDue = topic.nextReviewDate <= todayISO;
                return (
                  <tr key={topic.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-6">
                      <button
                        type="button"
                        onClick={() => onOpenTopic(topic.id)}
                        className="text-left font-medium text-slate-900 hover:text-blue-700 flex items-baseline gap-2"
                      >
                        <span className="font-mono text-xs text-slate-400 tabular-nums">
                          {topic.number}
                        </span>
                        <span>{topic.title}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <MasteryStatusText level={topic.masteryLevel} />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              topic.masteryScore >= 85
                                ? 'bg-emerald-600'
                                : topic.masteryScore >= 60
                                ? 'bg-blue-600'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${topic.masteryScore}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-semibold text-slate-900 tabular-nums">
                          {topic.masteryScore}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                      {formatIndonesianDate(topic.lastReviewedAt)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isReviewDue ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          <span>Perlu Review Hari Ini</span>
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-slate-600 tabular-nums">
                          {formatIndonesianDate(topic.nextReviewDate)}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenTopic(topic.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md"
                        >
                          <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Baca</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenEvaluateModal(topic.id)}
                          className="px-2.5 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md"
                        >
                          Evaluasi
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Historical Evaluation Logs */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-display text-base font-semibold text-slate-900">
            Riwayat Log Evaluasi Berkala
          </h3>
        </div>

        <div className="divide-y divide-slate-200">
          {sortedLogsDesc.map((entry) => {
            const delta = entry.score - entry.previousScore;
            return (
              <div
                key={entry.id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono tabular-nums">
                      {formatIndonesianDate(entry.date)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-slate-900">{entry.topicTitle}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{entry.studyMinutes} menit</span>
                  </div>
                  <p className="text-sm text-slate-700">{entry.reflection}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                    {entry.score}%
                  </span>
                  {delta > 0 ? (
                    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-700 font-mono tabular-nums">
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                      +{delta}%
                    </span>
                  ) : delta < 0 ? (
                    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-red-700 font-mono tabular-nums">
                      <ArrowDownRight className="w-3.5 h-3.5" aria-hidden="true" />
                      {delta}%
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-slate-500 font-mono tabular-nums">
                      <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                      0%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
