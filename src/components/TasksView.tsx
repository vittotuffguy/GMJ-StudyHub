import { useEffect, useState } from 'react';
import {
  BookOpen,
  Check,
  Edit3,
  Plus,
  Search,
  Trash2,
  X,
  CheckSquare,
} from 'lucide-react';
import { StudyTopic, TaskItem, TaskPriority } from '../types';
import { SUBJECT_LIST } from '../data/initialData';
import { formatIndonesianDate, getDueStatus, getTodayISO } from '../utils/dateUtils';
import { DueStatusText, PriorityText } from './StatusLabel';

interface TasksViewProps {
  tasks: TaskItem[];
  topics: StudyTopic[];
  onToggleTask: (id: string) => void;
  onSaveTask: (task: Omit<TaskItem, 'id' | 'createdAt'>, existingId?: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenTopic: (topicId: string) => void;
  modalOpen: boolean;
  prefillSubject?: string;
  prefillTopicId?: string;
  onOpenModal: () => void;
  onCloseModal: () => void;
}

export function TasksView({
  tasks,
  topics,
  onToggleTask,
  onSaveTask,
  onDeleteTask,
  onOpenTopic,
  modalOpen,
  prefillSubject,
  prefillTopicId,
  onOpenModal,
  onCloseModal,
}: TasksViewProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'urgent' | 'done'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form modal state
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(SUBJECT_LIST[0]);
  const [dueDate, setDueDate] = useState(getTodayISO());
  const [priority, setPriority] = useState<TaskPriority>('Sedang');
  const [linkedTopicId, setLinkedTopicId] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (modalOpen && !editingTask) {
      setTitle('');
      setSubject(prefillSubject || SUBJECT_LIST[0]);
      setDueDate(getTodayISO());
      setPriority('Sedang');
      setLinkedTopicId(prefillTopicId || '');
      setNotes('');
    }
  }, [modalOpen, editingTask, prefillSubject, prefillTopicId]);

  const openEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setTitle(task.title);
    setSubject(task.subject);
    setDueDate(task.dueDate);
    setPriority(task.priority);
    setLinkedTopicId(task.linkedTopicId || '');
    setNotes(task.notes);
    onOpenModal();
  };

  const handleClose = () => {
    setEditingTask(null);
    onCloseModal();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;
    onSaveTask(
      {
        title: title.trim(),
        subject,
        dueDate,
        priority,
        completed: editingTask ? editingTask.completed : false,
        linkedTopicId: linkedTopicId || undefined,
        notes: notes.trim(),
      },
      editingTask?.id
    );
    setEditingTask(null);
    onCloseModal();
  };

  const topicMap = new Map(topics.map((t) => [t.id, t]));
  const availableSubjects = Array.from(new Set([...SUBJECT_LIST, ...tasks.map((t) => t.subject)]));

  const filteredTasks = tasks
    .filter((task) => {
      if (subjectFilter !== 'all' && task.subject !== subjectFilter) return false;
      if (
        searchQuery.trim() &&
        !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !task.notes.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !task.subject.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (statusFilter === 'active') return !task.completed;
      if (statusFilter === 'done') return task.completed;
      if (statusFilter === 'urgent') {
        if (task.completed) return false;
        const { urgency } = getDueStatus(task.dueDate, false);
        return urgency === 'overdue' || urgency === 'today' || urgency === 'soon';
      }
      return true;
    })
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return a.dueDate.localeCompare(b.dueDate);
    });

  const activeCount = tasks.filter((t) => !t.completed).length;
  const urgentCount = tasks.filter((t) => {
    if (t.completed) return false;
    const { urgency } = getDueStatus(t.dueDate, false);
    return urgency === 'overdue' || urgency === 'today' || urgency === 'soon';
  }).length;
  const doneCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      {/* Filter & Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {[
            { id: 'all', label: `Semua (${tasks.length})` },
            { id: 'active', label: `Aktif (${activeCount})` },
            { id: 'urgent', label: `Mendesak (${urgentCount})` },
            { id: 'done', label: `Selesai (${doneCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                statusFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tugas atau catatan..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            aria-label="Filter berdasarkan mata pelajaran"
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-600"
          >
            <option value="all">Semua Mapel</option>
            {availableSubjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CheckSquare className="w-9 h-9 text-slate-400 mx-auto" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-800">
                Tidak ada tugas yang cocok dengan filter saat ini
              </p>
              <p className="text-xs text-slate-500">
                Ubah filter pencarian atau tambahkan pengingat tugas baru.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingTask(null);
                onOpenModal();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Tambah Tugas Pertama</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredTasks.map((task) => {
              const due = getDueStatus(task.dueDate, task.completed);
              const linkedTopic = task.linkedTopicId ? topicMap.get(task.linkedTopicId) : undefined;

              return (
                <div
                  key={task.id}
                  className={`p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-colors ${
                    task.completed ? 'bg-slate-50/60' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      aria-label={
                        task.completed
                          ? `Tandai tugas "${task.title}" belum selesai`
                          : `Tandai tugas "${task.title}" selesai`
                      }
                      className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-blue-700 ${
                        task.completed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 bg-white hover:border-blue-600'
                      }`}
                    >
                      {task.completed && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                    </button>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <h3
                        className={`text-sm font-semibold leading-snug ${
                          task.completed ? 'text-slate-500 line-through' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
                        <span className="font-medium text-slate-700">{task.subject}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          Tenggat {formatIndonesianDate(task.dueDate)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <DueStatusText label={due.label} urgency={due.urgency} />
                        <span aria-hidden="true">·</span>
                        <PriorityText priority={task.priority} />
                      </div>

                      {task.notes && (
                        <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                          {task.notes}
                        </p>
                      )}

                      {linkedTopic && (
                        <button
                          type="button"
                          onClick={() => onOpenTopic(linkedTopic.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:underline pt-0.5"
                        >
                          <BookOpen className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          <span>
                            Pelajari Rangkuman: {linkedTopic.number}. {linkedTopic.title}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                    <button
                      type="button"
                      onClick={() => openEditModal(task)}
                      aria-label={`Edit tugas ${task.title}`}
                      className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      aria-label={`Hapus tugas ${task.title}`}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Task Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-task-title"
        >
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg p-6 space-y-5 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 id="modal-task-title" className="font-display text-lg font-bold text-slate-900">
                {editingTask ? 'Edit Tugas Sekolah' : 'Tambah Pengingat Tugas Baru'}
              </h3>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Tutup modal"
                className="p-2 text-slate-500 hover:text-slate-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Judul Tugas</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Contoh: Latihan Diagram Input-Proses-Output"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Mata Pelajaran
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-600"
                  >
                    {availableSubjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Tanggal Tenggat
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Prioritas</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="Tinggi">Tinggi</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Rendah">Rendah</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Hubungkan ke Rangkuman Materi (Opsional)
                </label>
                <select
                  value={linkedTopicId}
                  onChange={(e) => setLinkedTopicId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-600"
                >
                  <option value="">Tidak dihubungkan</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.number}. {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Catatan / Instruksi Guru
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Tuliskan rincian tugas, halaman buku, atau format pengumpulan..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
                >
                  {editingTask ? 'Simpan Perubahan' : 'Simpan Tugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
