import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ClipboardCheck,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { AppSection, ScheduleItem, StudentProfile, StudyTopic, TaskItem } from '../types';
import {
  formatFullTodayIndonesian,
  formatIndonesianDate,
  getCurrentSchoolDay,
  getDueStatus,
  getTodayISO,
} from '../utils/dateUtils';
import { DueStatusText, MasteryStatusText } from './StatusLabel';

interface DashboardOverviewProps {
  profile: StudentProfile;
  schedule: ScheduleItem[];
  tasks: TaskItem[];
  topics: StudyTopic[];
  onNavigate: (section: AppSection) => void;
  onOpenTopic: (topicId: string) => void;
  onToggleTask: (taskId: string) => void;
  onOpenEvaluateModal: (topicId?: string) => void;
}

export function DashboardOverview({
  profile,
  schedule,
  tasks,
  topics,
  onNavigate,
  onOpenTopic,
  onToggleTask,
  onOpenEvaluateModal,
}: DashboardOverviewProps) {
  const { day: activeSchoolDay, isWeekend, label: realDayLabel } = getCurrentSchoolDay();
  const todayISO = getTodayISO();

  const todayClasses = schedule
    .filter((item) => item.day === activeSchoolDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const activeTasks = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const urgentTasksCount = activeTasks.filter((t) => {
    const { urgency } = getDueStatus(t.dueDate, t.completed);
    return urgency === 'overdue' || urgency === 'today' || urgency === 'soon';
  }).length;

  const avgMastery =
    topics.length > 0
      ? Math.round(topics.reduce((acc, t) => acc + t.masteryScore, 0) / topics.length)
      : 0;

  const reviewQueue = [...topics]
    .filter((t) => t.masteryScore < 75 || t.nextReviewDate <= todayISO)
    .sort((a, b) => a.masteryScore - b.masteryScore);

  const topicMap = new Map(topics.map((t) => [t.id, t]));

  return (
    <div className="space-y-8">
      {/* Contextual Welcome Banner */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-500">
            {profile.school} · {profile.academicYear}
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Agenda Belajar Terpadu
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl">
            Hari ini {formatFullTodayIndonesian()}. Pantau jadwal kelas, selesaikan pengingat tugas
            tepat waktu, dan jaga pemahaman materi Informatika tetap konsisten.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onOpenEvaluateModal()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap min-h-[40px]"
          >
            <ClipboardCheck className="w-4 h-4 text-blue-700 shrink-0" aria-hidden="true" />
            <span>Catat Evaluasi Materi</span>
          </button>
        </div>
      </section>

      {/* 4-Column KPI Strip */}
      <section aria-label="Ringkasan statistik belajar" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">
            {isWeekend ? 'Jadwal Hari Senin' : `Pelajaran ${activeSchoolDay}`}
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-slate-900 tabular-nums">
            {todayClasses.length} <span className="text-sm font-normal text-slate-500">Sesi</span>
          </p>
          <p className="mt-1 text-xs text-slate-500 truncate">
            {todayClasses[0]
              ? `Mulai pukul ${todayClasses[0].startTime} WIB`
              : 'Belum ada jadwal tercatat'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Tugas Belum Selesai</p>
          <p className="mt-2 font-display text-2xl font-bold text-slate-900 tabular-nums">
            {activeTasks.length} <span className="text-sm font-normal text-slate-500">Tugas</span>
          </p>
          <p className="mt-1 text-xs text-amber-700 font-medium tabular-nums">
            {urgentTasksCount} perlu prioritas segera
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Rata-rata Pemahaman</p>
          <p className="mt-2 font-display text-2xl font-bold text-slate-900 tabular-nums">
            {avgMastery}%
          </p>
          <p className="mt-1 text-xs text-slate-500 tabular-nums">
            Dari {topics.length} topik rangkuman
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Jadwal Review Berkala</p>
          <p className="mt-2 font-display text-2xl font-bold text-slate-900 tabular-nums">
            {reviewQueue.length} <span className="text-sm font-normal text-slate-500">Materi</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">Siap diulang hari ini</p>
        </div>
      </section>

      {/* Main Two-Column Integrated Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Today's Schedule & Study Progress Table */}
        <div className="lg:col-span-7 space-y-6">
          {/* Today's Class Schedule */}
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-base font-semibold text-slate-900">
                  {isWeekend
                    ? `Pratinjau Jadwal Senin (${realDayLabel} Akhir Pekan)`
                    : `Jadwal Pelajaran Hari ${activeSchoolDay}`}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Terhubung langsung dengan tugas dan rangkuman materi terkait
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('schedule')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 whitespace-nowrap shrink-0"
              >
                <span>Semua Jadwal</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            {todayClasses.length === 0 ? (
              <div className="p-8 text-center">
                <CalendarDays className="w-8 h-8 text-slate-400 mx-auto mb-2" aria-hidden="true" />
                <p className="text-sm font-medium text-slate-700">
                  Belum ada jadwal pelajaran untuk hari {activeSchoolDay}.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('schedule')}
                  className="mt-3 px-4 py-2 text-xs font-medium bg-blue-700 text-white rounded-lg hover:bg-blue-800"
                >
                  Atur Jadwal Pelajaran
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {todayClasses.map((item) => {
                  const linkedTopic = item.linkedTopicId ? topicMap.get(item.linkedTopicId) : undefined;
                  const relatedTaskCount = activeTasks.filter((t) => t.subject === item.subject).length;

                  return (
                    <div
                      key={item.id}
                      className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="font-mono text-xs font-medium text-slate-700 tabular-nums shrink-0 pt-0.5 w-[96px]">
                          {item.startTime} – {item.endTime}
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-semibold text-slate-900">{item.subject}</h4>
                            {relatedTaskCount > 0 && (
                              <span className="text-xs font-medium text-amber-700">
                                · {relatedTaskCount} tugas aktif
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">
                            {item.room} · {item.teacher}
                          </p>
                          {item.note && (
                            <p className="text-xs text-slate-600 line-clamp-1">{item.note}</p>
                          )}
                        </div>
                      </div>

                      {linkedTopic && (
                        <button
                          type="button"
                          onClick={() => onOpenTopic(linkedTopic.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors whitespace-nowrap shrink-0 self-start sm:self-center"
                        >
                          <BookOpen className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          <span>Materi {linkedTopic.number}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Compact Mastery Matrix of All 8 Informatika Topics */}
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-base font-semibold text-slate-900">
                  Peta Pemahaman Materi Informatika
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Klik topik untuk membaca rangkuman atau memperbarui evaluasi pemahaman
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('materials')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 whitespace-nowrap shrink-0"
              >
                <span>Buka Pustaka</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 bg-slate-50/70">
                    <th className="py-2.5 px-6">Topik Materi</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-6 text-right">Penguasaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {topics.map((topic) => (
                    <tr
                      key={topic.id}
                      onClick={() => onOpenTopic(topic.id)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-6">
                        <div className="flex items-baseline gap-2.5">
                          <span className="font-mono text-xs text-slate-400 tabular-nums shrink-0">
                            {topic.number}
                          </span>
                          <span className="font-medium text-slate-900 hover:text-blue-700">
                            {topic.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <MasteryStatusText level={topic.masteryLevel} />
                      </td>
                      <td className="py-3 px-6 text-right">
                        <div className="inline-flex items-center gap-3 justify-end">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
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
                          <span className="font-mono text-xs font-semibold text-slate-800 tabular-nums w-9 text-right">
                            {topic.masteryScore}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Column: Upcoming Tasks & Periodic Review Queue */}
        <div className="lg:col-span-5 space-y-6">
          {/* Task Reminders */}
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-base font-semibold text-slate-900">
                  Pengingat Tugas Terdekat
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Centang langsung apabila tugas sudah selesai dikerjakan
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('tasks')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 whitespace-nowrap shrink-0"
              >
                <span>Semua Tugas</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            {activeTasks.length === 0 ? (
              <div className="p-8 text-center">
                <Check className="w-8 h-8 text-emerald-600 mx-auto mb-2" aria-hidden="true" />
                <p className="text-sm font-medium text-slate-800">Semua tugas sekolah sudah selesai!</p>
                <p className="text-xs text-slate-500 mt-1">
                  Gunakan waktu luang untuk mengulang materi yang butuh pendalaman.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {activeTasks.slice(0, 5).map((task) => {
                  const due = getDueStatus(task.dueDate, task.completed);
                  const linkedTopic = task.linkedTopicId ? topicMap.get(task.linkedTopicId) : undefined;

                  return (
                    <div key={task.id} className="px-6 py-4 space-y-2 hover:bg-slate-50/70 transition-colors">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => onToggleTask(task.id)}
                          aria-label={`Tandai tugas "${task.title}" selesai`}
                          className="mt-0.5 w-5 h-5 rounded border border-slate-300 hover:border-blue-600 flex items-center justify-center shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-blue-700"
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="text-sm font-medium text-slate-900 leading-snug">
                            {task.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                            <span>{task.subject}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              {formatIndonesianDate(task.dueDate)}
                            </span>
                            <span aria-hidden="true">·</span>
                            <DueStatusText label={due.label} urgency={due.urgency} />
                          </div>
                          {linkedTopic && (
                            <button
                              type="button"
                              onClick={() => onOpenTopic(linkedTopic.id)}
                              className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline pt-0.5"
                            >
                              <BookOpen className="w-3 h-3 shrink-0" aria-hidden="true" />
                              <span>Rangkuman: {linkedTopic.title}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Periodic Review Queue */}
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-base font-semibold text-slate-900">
                  Prioritas Review Berkala
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Materi dengan penguasaan di bawah 75% atau jatuh jadwal review
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('progress')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 whitespace-nowrap shrink-0"
              >
                <span>Grafik Progres</span>
                <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            {reviewQueue.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-600">
                Seluruh materi berada di atas ambang 75% dan belum ada jadwal review mendesak.
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {reviewQueue.slice(0, 4).map((topic) => (
                  <div key={topic.id} className="px-6 py-4 flex items-center justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {topic.number}. {topic.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono font-semibold text-slate-800 tabular-nums">
                          {topic.masteryScore}%
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
                          <span>Ulasan terakhir {formatIndonesianDate(topic.lastReviewedAt)}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onOpenTopic(topic.id)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md whitespace-nowrap"
                      >
                        Baca
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenEvaluateModal(topic.id)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md whitespace-nowrap"
                      >
                        Evaluasi
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
