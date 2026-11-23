import { useState } from 'react';
import { BookOpen, Calendar, Plus, Trash2, User, MapPin, CheckSquare, X } from 'lucide-react';
import { DayOfWeek, ScheduleItem, StudyTopic, TaskItem } from '../types';
import { DAYS_OF_WEEK, formatIndonesianDate, getCurrentSchoolDay, getDueStatus } from '../utils/dateUtils';
import { SUBJECT_LIST } from '../data/initialData';
import { DueStatusText } from './StatusLabel';

interface ScheduleViewProps {
  schedule: ScheduleItem[];
  tasks: TaskItem[];
  topics: StudyTopic[];
  onAddSchedule: (item: Omit<ScheduleItem, 'id'>) => void;
  onDeleteSchedule: (id: string) => void;
  onOpenTopic: (topicId: string) => void;
  onQuickAddTaskForSubject: (subject: string, linkedTopicId?: string) => void;
  modalOpen: boolean;
  onCloseModal: () => void;
  onOpenModal: () => void;
}

export function ScheduleView({
  schedule,
  tasks,
  topics,
  onAddSchedule,
  onDeleteSchedule,
  onOpenTopic,
  onQuickAddTaskForSubject,
  modalOpen,
  onCloseModal,
  onOpenModal,
}: ScheduleViewProps) {
  const { day: currentSchoolDay } = getCurrentSchoolDay();
  const [viewMode, setViewMode] = useState<'weekly' | 'daily'>('weekly');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(currentSchoolDay);
  const [selectedItemId, setSelectedItemId] = useState<string>(
    schedule.find((s) => s.day === currentSchoolDay)?.id || schedule[0]?.id || ''
  );

  // Add schedule form state
  const [day, setDay] = useState<DayOfWeek>(currentSchoolDay);
  const [startTime, setStartTime] = useState('07:15');
  const [endTime, setEndTime] = useState('08:35');
  const [subject, setSubject] = useState(SUBJECT_LIST[0]);
  const [teacher, setTeacher] = useState('');
  const [room, setRoom] = useState('Ruang 8B');
  const [linkedTopicId, setLinkedTopicId] = useState('');
  const [note, setNote] = useState('');

  const topicMap = new Map(topics.map((t) => [t.id, t]));
  const selectedItem = schedule.find((item) => item.id === selectedItemId) || null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !startTime || !endTime) return;
    onAddSchedule({
      day,
      startTime,
      endTime,
      subject: subject.trim(),
      teacher: teacher.trim() || 'Guru Pengampu',
      room: room.trim() || 'Ruang Kelas',
      linkedTopicId: linkedTopicId || undefined,
      note: note.trim() || undefined,
    });
    setTeacher('');
    setNote('');
    setLinkedTopicId('');
    onCloseModal();
  };

  const renderDayItems = (targetDay: DayOfWeek) => {
    return schedule
      .filter((item) => item.day === targetDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  return (
    <div className="space-y-6">
      {/* Toolbar: View Mode & Day Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
          <button
            type="button"
            onClick={() => setViewMode('weekly')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'weekly'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tampilan Mingguan
          </button>
          <button
            type="button"
            onClick={() => setViewMode('daily')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'daily'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fokus Harian
          </button>
        </div>

        {viewMode === 'daily' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {DAYS_OF_WEEK.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDay(d)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                  selectedDay === d
                    ? 'bg-blue-700 border-blue-700 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        <p className="text-xs text-slate-500">
          Klik mata pelajaran untuk melihat tugas &amp; rangkuman terkait
        </p>
      </div>

      {/* Schedule Content + Selected Class Detail Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8">
          {viewMode === 'weekly' ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {DAYS_OF_WEEK.map((d) => {
                const items = renderDayItems(d);
                const isToday = d === currentSchoolDay;

                return (
                  <div
                    key={d}
                    className={`bg-white border rounded-xl overflow-hidden flex flex-col ${
                      isToday ? 'border-blue-300' : 'border-slate-200'
                    }`}
                  >
                    <div
                      className={`px-4 py-3 border-b flex items-center justify-between ${
                        isToday ? 'bg-blue-50/70 border-blue-200' : 'bg-slate-50/70 border-slate-200'
                      }`}
                    >
                      <span className="font-display text-sm font-semibold text-slate-900">{d}</span>
                      <span className="font-mono text-xs text-slate-500 tabular-nums">
                        {items.length} sesi
                      </span>
                    </div>

                    <div className="divide-y divide-slate-200 flex-1">
                      {items.length === 0 ? (
                        <div className="p-4 text-xs text-slate-400">Kosong</div>
                      ) : (
                        items.map((item) => {
                          const isSelected = item.id === selectedItem?.id;
                          const activeCount = tasks.filter(
                            (t) => !t.completed && t.subject === item.subject
                          ).length;

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setSelectedItemId(item.id)}
                              className={`w-full text-left p-3.5 transition-colors block focus-visible:outline-2 focus-visible:outline-blue-700 ${
                                isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                              }`}
                            >
                              <p className="font-mono text-[11px] font-medium text-slate-500 tabular-nums">
                                {item.startTime}–{item.endTime}
                              </p>
                              <p className="text-sm font-semibold text-slate-900 mt-1 leading-snug">
                                {item.subject}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5 truncate">{item.room}</p>
                              {(item.linkedTopicId || activeCount > 0) && (
                                <p className="text-[11px] font-medium text-blue-700 mt-1.5">
                                  {item.linkedTopicId ? 'Materi terhubung' : ''}
                                  {item.linkedTopicId && activeCount > 0 ? ' · ' : ''}
                                  {activeCount > 0 ? `${activeCount} tugas` : ''}
                                </p>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-display text-base font-semibold text-slate-900">
                  Jadwal Hari {selectedDay}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setDay(selectedDay);
                    onOpenModal();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-800"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Tambah Sesi</span>
                </button>
              </div>
              <div className="divide-y divide-slate-200">
                {renderDayItems(selectedDay).length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500">
                    Belum ada mata pelajaran untuk hari {selectedDay}.
                  </div>
                ) : (
                  renderDayItems(selectedDay).map((item) => {
                    const isSelected = item.id === selectedItem?.id;
                    const linkedTopic = item.linkedTopicId ? topicMap.get(item.linkedTopicId) : undefined;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedItemId(item.id)}
                        className={`w-full text-left px-6 py-4 flex items-center justify-between gap-4 transition-colors ${
                          isSelected ? 'bg-blue-50/80' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start gap-4 min-w-0">
                          <span className="font-mono text-xs font-medium text-slate-700 tabular-nums pt-0.5 shrink-0 w-24">
                            {item.startTime}–{item.endTime}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900">{item.subject}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {item.room} · {item.teacher}
                            </p>
                            {item.note && (
                              <p className="text-xs text-slate-600 mt-1">{item.note}</p>
                            )}
                          </div>
                        </div>
                        {linkedTopic && (
                          <span className="text-xs font-medium text-blue-700 whitespace-nowrap shrink-0">
                            Materi {linkedTopic.number}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Detail Panel: Integrated Tasks & Linked Material */}
        <aside className="xl:col-span-4 bg-white border border-slate-200 rounded-xl p-6 space-y-5 xl:sticky xl:top-20">
          {selectedItem ? (
            <>
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <p className="font-mono text-xs font-medium text-blue-700 tabular-nums">
                    {selectedItem.day} · {selectedItem.startTime} – {selectedItem.endTime} WIB
                  </p>
                  <h3 className="font-display text-lg font-bold text-slate-900 mt-1">
                    {selectedItem.subject}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteSchedule(selectedItem.id)}
                  aria-label={`Hapus jadwal ${selectedItem.subject}`}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <User className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                  <span>{selectedItem.teacher}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                  <span>{selectedItem.room}</span>
                </div>
                {selectedItem.note && (
                  <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 leading-relaxed">
                    {selectedItem.note}
                  </p>
                )}
              </div>

              {/* Linked Study Material */}
              <div className="pt-4 border-t border-slate-200 space-y-2.5">
                <p className="text-xs font-semibold text-slate-500">Rangkuman Materi Terkait</p>
                {selectedItem.linkedTopicId && topicMap.get(selectedItem.linkedTopicId) ? (
                  (() => {
                    const topic = topicMap.get(selectedItem.linkedTopicId!)!;
                    return (
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono text-slate-500">Topik {topic.number}</span>
                          <span className="text-xs font-mono font-semibold text-blue-700 tabular-nums">
                            {topic.masteryScore}% paham
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">{topic.title}</p>
                        <p className="text-xs text-slate-600 line-clamp-2">{topic.summary}</p>
                        <button
                          type="button"
                          onClick={() => onOpenTopic(topic.id)}
                          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors mt-1"
                        >
                          <BookOpen className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          <span>Buka Rangkuman &amp; Kuis</span>
                        </button>
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-xs text-slate-500">
                    Belum ada topik rangkuman yang ditautkan ke sesi ini.
                  </p>
                )}
              </div>

              {/* Related Tasks */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500">
                    Tugas Mapel {selectedItem.subject}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      onQuickAddTaskForSubject(selectedItem.subject, selectedItem.linkedTopicId)
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Tugas Baru</span>
                  </button>
                </div>

                {tasks.filter((t) => t.subject === selectedItem.subject && !t.completed).length ===
                0 ? (
                  <p className="text-xs text-slate-500">
                    Tidak ada tugas aktif untuk mata pelajaran ini.
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {tasks
                      .filter((t) => t.subject === selectedItem.subject && !t.completed)
                      .map((task) => {
                        const due = getDueStatus(task.dueDate, task.completed);
                        return (
                          <li
                            key={task.id}
                            className="p-3 border border-slate-200 rounded-lg space-y-1"
                          >
                            <div className="flex items-start gap-2">
                              <CheckSquare
                                className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0"
                                aria-hidden="true"
                              />
                              <p className="text-xs font-medium text-slate-900">{task.title}</p>
                            </div>
                            <div className="flex items-center gap-2 pl-5 text-xs text-slate-500">
                              <span className="font-mono tabular-nums">
                                {formatIndonesianDate(task.dueDate)}
                              </span>
                              <span aria-hidden="true">·</span>
                              <DueStatusText label={due.label} urgency={due.urgency} />
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-sm text-slate-500">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" aria-hidden="true" />
              Pilih salah satu sesi pelajaran untuk melihat detail.
            </div>
          )}
        </aside>
      </div>

      {/* Add Schedule Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-add-schedule-title"
        >
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg p-6 space-y-5 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3
                id="modal-add-schedule-title"
                className="font-display text-lg font-bold text-slate-900"
              >
                Tambah Sesi Jadwal Pelajaran
              </h3>
              <button
                type="button"
                onClick={onCloseModal}
                aria-label="Tutup modal"
                className="p-2 text-slate-500 hover:text-slate-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Hari</label>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value as DayOfWeek)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-600"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Mata Pelajaran
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-600"
                  >
                    {SUBJECT_LIST.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Ruangan</label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="Contoh: Lab Komputer 1"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Guru Pengampu</label>
                <input
                  type="text"
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  placeholder="Contoh: Pak Dimas Pratama, S.Kom."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tautkan Rangkuman Materi (Opsional)
                </label>
                <select
                  value={linkedTopicId}
                  onChange={(e) => setLinkedTopicId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-600"
                >
                  <option value="">Tidak ditautkan</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.number}. {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Catatan Sesi (Opsional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Topik praktikum atau perlengkapan yang dibawa"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onCloseModal}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
