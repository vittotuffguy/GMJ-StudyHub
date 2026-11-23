import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Cpu,
  HardDrive,
  Keyboard,
  Monitor,
  Save,
  Search,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react';
import { MasteryLevel, StudyTopic } from '../types';
import { formatIndonesianDate } from '../utils/dateUtils';
import { MasteryStatusText } from './StatusLabel';

interface MaterialsViewProps {
  topics: StudyTopic[];
  selectedTopicId: string;
  onSelectTopic: (id: string) => void;
  onUpdatePersonalNotes: (topicId: string, notes: string) => void;
  onRecordQuizMastery: (topicId: string, score: number, reflection: string) => void;
  onOpenEvaluateModal: (topicId: string) => void;
  onAddTopic: (data: {
    title: string;
    category: string;
    summary: string;
    keyPoints: string[];
  }) => void;
  addModalOpen: boolean;
  onCloseAddModal: () => void;
}

const IPO_STAGES = [
  {
    id: 'input',
    label: '1. Input',
    icon: Keyboard,
    hardware: 'Keyboard, Mouse, Mikrofon, Kamera, Sensor RFID',
    role: 'Menangkap aksi atau sinyal dunia nyata lalu mengubahnya menjadi data biner (0 dan 1).',
    example: 'Mengetik rumus di keyboard atau memindai kartu pelajar di gerbang sekolah.',
  },
  {
    id: 'process',
    label: '2. Proses',
    icon: Cpu,
    hardware: 'CPU (ALU & Control Unit), Motherboard, RAM',
    role: 'CPU mengeksekusi instruksi logika dan aritmatika menggunakan data aktif yang ditampung sementara di RAM.',
    example: 'Mencocokkan nomor ID kartu pelajar dengan daftar siswa kelas VIII dalam hitungan milidetik.',
  },
  {
    id: 'output',
    label: '3. Output',
    icon: Monitor,
    hardware: 'Monitor, Speaker, Printer, Proyektor, Aktuator',
    role: 'Mengubah hasil pemrosesan digital menjadi informasi visual, suara, atau cetakan yang dipahami manusia.',
    example: 'Layar menampilkan nama siswa "Hadir Tepat Waktu" disertai suara konfirmasi.',
  },
  {
    id: 'storage',
    label: '4. Storage',
    icon: HardDrive,
    hardware: 'SSD, HDD, Flashdisk, Penyimpanan Awan',
    role: 'Menyimpan data dan hasil kerja secara permanen (non-volatile) agar tetap aman saat perangkat dimatikan.',
    example: 'Rekap kehadiran dan file tugas tersimpan di SSD sekolah untuk dievaluasi akhir semester.',
  },
];

const PIPELINE_STAGES = [
  {
    id: 'vibe',
    label: '1. Vibe Coding',
    summary: 'Merumuskan masalah, tujuan pengguna, dan membagi fitur aplikasi secara terstruktur.',
    action: 'Tulis spesifikasi jelas tentang jadwal pelajaran, pengingat tugas, dan pelacakan progres.',
  },
  {
    id: 'aistudio',
    label: '2. Google AI Studio',
    summary: 'Menguji prompt, menyusun System Instructions, dan membangun prototipe aplikasi web.',
    action: 'Gunakan model Gemini untuk mengiterasi komponen UI dan memverifikasi alur data.',
  },
  {
    id: 'github',
    label: '3. GitHub',
    summary: 'Menyimpan kode di repositori Git, membuat commit rapi, dan berkolaborasi lewat branch.',
    action: 'Push perubahan teruji ke branch main sambil menjaga file rahasia (.env) tidak ikut terunggah.',
  },
  {
    id: 'vercel',
    label: '4. Vercel',
    summary: 'Melakukan build otomatis (Continuous Deployment) dari GitHub ke URL HTTPS publik.',
    action: 'Setiap push baru menghasilkan pratinjau langsung dan pembaruan aplikasi online secara otomatis.',
  },
];

export function MaterialsView({
  topics,
  selectedTopicId,
  onSelectTopic,
  onUpdatePersonalNotes,
  onRecordQuizMastery,
  onOpenEvaluateModal,
  onAddTopic,
  addModalOpen,
  onCloseAddModal,
}: MaterialsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [masteryFilter, setMasteryFilter] = useState<'all' | MasteryLevel>('all');
  const [bannerError, setBannerError] = useState(false);

  // Interactive diagram states
  const [activeIpoStage, setActiveIpoStage] = useState('input');
  const [activePipelineStage, setActivePipelineStage] = useState('vibe');

  // Personal notes state
  const activeTopic = topics.find((t) => t.id === selectedTopicId) || topics[0];
  const [notesDraft, setNotesDraft] = useState(activeTopic?.personalNotes || '');
  const [notesSavedNotice, setNotesSavedNotice] = useState(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizSavedNotice, setQuizSavedNotice] = useState(false);

  // Add new topic modal state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Informatika');
  const [newSummary, setNewSummary] = useState('');
  const [newPointsText, setNewPointsText] = useState('');

  useEffect(() => {
    if (activeTopic) {
      setNotesDraft(activeTopic.personalNotes);
      setNotesSavedNotice(false);
      setQuizAnswers({});
      setQuizSubmitted(false);
      setQuizSavedNotice(false);
    }
  }, [activeTopic?.id]);

  const filteredTopics = topics.filter((t) => {
    if (masteryFilter !== 'all' && t.masteryLevel !== masteryFilter) return false;
    if (
      searchQuery.trim() &&
      !t.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.summary.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.category.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleSaveNotes = () => {
    if (!activeTopic) return;
    onUpdatePersonalNotes(activeTopic.id, notesDraft);
    setNotesSavedNotice(true);
    setTimeout(() => setNotesSavedNotice(false), 2500);
  };

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
    setQuizSavedNotice(false);
  };

  const calculateQuizScore = () => {
    if (!activeTopic || activeTopic.quizQuestions.length === 0) return 0;
    const correct = activeTopic.quizQuestions.filter(
      (q) => quizAnswers[q.id] === q.correctIndex
    ).length;
    return Math.round((correct / activeTopic.quizQuestions.length) * 100);
  };

  const handleSaveQuizToProgress = () => {
    if (!activeTopic) return;
    const score = calculateQuizScore();
    onRecordQuizMastery(
      activeTopic.id,
      score,
      `Menyelesaikan Cek Pemahaman Kilat topik ${activeTopic.title} dengan skor ${score}%.`
    );
    setQuizSavedNotice(true);
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSummary.trim()) return;
    const points = newPointsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    onAddTopic({
      title: newTitle.trim(),
      category: newCategory.trim() || 'Informatika',
      summary: newSummary.trim(),
      keyPoints: points.length > 0 ? points : [newSummary.trim()],
    });
    setNewTitle('');
    setNewSummary('');
    setNewPointsText('');
    onCloseAddModal();
  };

  const currentIpo = IPO_STAGES.find((s) => s.id === activeIpoStage) || IPO_STAGES[0];
  const currentPipeline =
    PIPELINE_STAGES.find((s) => s.id === activePipelineStage) || PIPELINE_STAGES[0];

  return (
    <div className="space-y-6">
      {/* Compact Illustrated Curriculum Banner */}
      <section className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 min-h-[156px] flex items-end">
        {!bannerError ? (
          <img
            src="/src/assets/images/banner_informatika_hub_1795408716700.jpg"
            alt="Ilustrasi arsitektur sistem komputer, cloud deployment, dan literasi digital Informatika"
            referrerPolicy="no-referrer"
            onError={() => setBannerError(true)}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-slate-950/35"
        />
        <div className="relative z-10 p-6 sm:p-7 max-w-2xl space-y-1.5">
          <p className="text-xs font-medium text-blue-200">
            Pustaka Belajar Informatika · SMP Global Mandiri Jakarta
          </p>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
            Rangkuman Materi &amp; Catatan Pemahaman
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Mencakup 8 topik inti: Dampak Sosial Informatika, Computer Sistem, Perlindungan Data &amp;
            Jejak Digital, Kewarganegaraan Digital, Vibe Coding, Google AI Studio, GitHub, dan Vercel.
          </p>
        </div>
      </section>

      {/* Search & Mastery Filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {(['all', 'Perlu Review', 'Cukup Paham', 'Sangat Paham'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setMasteryFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                masteryFilter === status
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status === 'all' ? `Semua Topik (${topics.length})` : status}
            </button>
          ))}
        </div>

        <div className="relative sm:w-72">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari topik atau kata kunci..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Split Layout: Topic Directory + Detailed Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Topic Index */}
        <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden lg:sticky lg:top-20">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70">
            <h3 className="font-display text-sm font-semibold text-slate-900">Daftar Materi</h3>
          </div>
          <div className="divide-y divide-slate-200 max-h-[640px] overflow-y-auto">
            {filteredTopics.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                Tidak ada materi yang sesuai pencarian.
              </div>
            ) : (
              filteredTopics.map((topic) => {
                const isSelected = activeTopic?.id === topic.id;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => onSelectTopic(topic.id)}
                    className={`w-full text-left px-5 py-3.5 transition-colors block focus-visible:outline-2 focus-visible:outline-blue-700 ${
                      isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-slate-500 tabular-nums">
                        {topic.number} · {topic.category}
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-800 tabular-nums">
                        {topic.masteryScore}%
                      </span>
                    </div>
                    <p
                      className={`text-sm font-semibold mt-1 leading-snug ${
                        isSelected ? 'text-blue-900' : 'text-slate-900'
                      }`}
                    >
                      {topic.title}
                    </p>
                    <div className="mt-1.5">
                      <MasteryStatusText level={topic.masteryLevel} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Study Reader & Interactive Quiz */}
        {activeTopic && (
          <article className="lg:col-span-8 space-y-6">
            {/* Topic Overview Card */}
            <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-200">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono font-semibold text-blue-700">
                      Materi {activeTopic.number}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{activeTopic.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{activeTopic.readMinutes} menit baca</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      Ulasan {formatIndonesianDate(activeTopic.lastReviewedAt)}
                    </span>
                  </div>
                  <h2 className="font-display text-2xl font-bold text-slate-900">
                    {activeTopic.title}
                  </h2>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                      {activeTopic.masteryScore}%
                    </p>
                    <MasteryStatusText level={activeTopic.masteryLevel} />
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenEvaluateModal(activeTopic.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg whitespace-nowrap"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Catat Evaluasi</span>
                  </button>
                </div>
              </div>

              {/* Core Summary */}
              <div className="space-y-2">
                <h3 className="font-display text-sm font-semibold text-slate-900">
                  Ringkasan Konsep Utama
                </h3>
                <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed">
                  {activeTopic.summary}
                </p>
              </div>

              {/* Interactive IPO Diagram for Computer Sistem */}
              {activeTopic.interactiveType === 'ipo' && (
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-display text-sm font-semibold text-slate-900">
                      Simulasi Alur Interaktif: Input → Proses → Output → Storage
                    </h4>
                    <span className="text-xs text-slate-500">Klik tiap tahap</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {IPO_STAGES.map((stage) => {
                      const Icon = stage.icon;
                      const isActive = stage.id === activeIpoStage;
                      return (
                        <button
                          key={stage.id}
                          type="button"
                          onClick={() => setActiveIpoStage(stage.id)}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            isActive
                              ? 'bg-blue-700 border-blue-700 text-white'
                              : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 mb-1.5 ${
                              isActive ? 'text-blue-100' : 'text-blue-700'
                            }`}
                            aria-hidden="true"
                          />
                          <p className="text-xs font-semibold whitespace-nowrap">{stage.label}</p>
                        </button>
                      );
                    })}
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2 text-xs sm:text-sm">
                    <p className="font-semibold text-slate-900">
                      Perangkat: <span className="font-normal text-slate-700">{currentIpo.hardware}</span>
                    </p>
                    <p className="text-slate-700">{currentIpo.role}</p>
                    <p className="text-blue-800 font-medium">
                      Contoh di Sekolah: <span className="font-normal text-slate-700">{currentIpo.example}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Interactive Pipeline Diagram for Vibe Coding / AI Studio / GitHub / Vercel */}
              {activeTopic.interactiveType === 'pipeline' && (
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-display text-sm font-semibold text-slate-900">
                      Alur Terpadu Pengembangan Web Modern
                    </h4>
                    <span className="text-xs text-slate-500">Klik tahapan untuk detail</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {PIPELINE_STAGES.map((stage) => {
                      const isActive = stage.id === activePipelineStage;
                      return (
                        <button
                          key={stage.id}
                          type="button"
                          onClick={() => setActivePipelineStage(stage.id)}
                          className={`p-3 rounded-lg border text-left transition-colors flex items-center justify-between gap-1 ${
                            isActive
                              ? 'bg-blue-700 border-blue-700 text-white'
                              : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-xs font-semibold">{stage.label}</span>
                          <ArrowRight
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isActive ? 'text-blue-100' : 'text-slate-400'
                            }`}
                            aria-hidden="true"
                          />
                        </button>
                      );
                    })}
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1.5 text-xs sm:text-sm">
                    <p className="font-semibold text-slate-900">{currentPipeline.summary}</p>
                    <p className="text-slate-600">{currentPipeline.action}</p>
                  </div>
                </div>
              )}

              {/* Key Points */}
              <div className="space-y-3">
                <h3 className="font-display text-sm font-semibold text-slate-900">
                  Poin Penting untuk Diingat
                </h3>
                <ol className="space-y-2.5">
                  {activeTopic.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-slate-700">
                      <span className="font-mono text-xs font-semibold text-blue-700 pt-0.5 tabular-nums shrink-0">
                        0{index + 1}.
                      </span>
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Real World Examples & Glossary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                <div className="space-y-2.5">
                  <h3 className="font-display text-sm font-semibold text-slate-900">
                    Contoh Penerapan Nyata
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5">
                    {activeTopic.realWorldExamples.map((ex, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {ex}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2.5">
                  <h3 className="font-display text-sm font-semibold text-slate-900">
                    Istilah Kunci (Glosarium)
                  </h3>
                  <dl className="space-y-2.5">
                    {activeTopic.glossary.map((g, idx) => (
                      <div key={idx} className="text-sm">
                        <dt className="font-semibold text-slate-900">{g.term}</dt>
                        <dd className="text-xs text-slate-600 leading-relaxed mt-0.5">
                          {g.definition}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </section>

            {/* Personal Study Notes */}
            <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-base font-semibold text-slate-900">
                    Catatan Pribadi Saya
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tambahkan rangkuman versi sendiri atau hal yang masih perlu ditanyakan ke guru
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg whitespace-nowrap shrink-0"
                >
                  <Save className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Simpan Catatan</span>
                </button>
              </div>
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                rows={3}
                placeholder="Tulis catatan pribadi untuk materi ini..."
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
              />
              {notesSavedNotice && (
                <p className="text-xs font-medium text-emerald-700 inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Catatan pribadi berhasil disimpan.</span>
                </p>
              )}
            </section>

            {/* Quick Self-Check Quiz */}
            {activeTopic.quizQuestions.length > 0 && (
              <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="font-display text-base font-semibold text-slate-900">
                      Cek Pemahaman Kilat ({activeTopic.quizQuestions.length} Soal)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Uji penguasaan materi dan perbarui progres pemahaman secara otomatis
                    </p>
                  </div>
                  {quizSubmitted && (
                    <span className="font-mono text-sm font-bold text-blue-700 tabular-nums">
                      Skor: {calculateQuizScore()}%
                    </span>
                  )}
                </div>

                <div className="space-y-5">
                  {activeTopic.quizQuestions.map((q, qIdx) => {
                    const selectedIdx = quizAnswers[q.id];
                    return (
                      <div key={q.id} className="space-y-2.5">
                        <p className="text-sm font-semibold text-slate-900">
                          {qIdx + 1}. {q.question}
                        </p>
                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            const isPicked = selectedIdx === optIdx;
                            const isCorrect = q.correctIndex === optIdx;

                            let optionStyle =
                              'border-slate-200 bg-white text-slate-700 hover:bg-slate-50';
                            if (quizSubmitted) {
                              if (isCorrect) {
                                optionStyle = 'border-emerald-300 bg-emerald-50 text-emerald-900';
                              } else if (isPicked && !isCorrect) {
                                optionStyle = 'border-red-300 bg-red-50 text-red-900';
                              }
                            } else if (isPicked) {
                              optionStyle = 'border-blue-600 bg-blue-50 text-blue-900 font-medium';
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                disabled={quizSubmitted}
                                onClick={() =>
                                  setQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                                }
                                className={`w-full text-left px-4 py-2.5 text-sm border rounded-lg transition-colors flex items-center justify-between gap-3 ${optionStyle}`}
                              >
                                <span>{opt}</span>
                                {quizSubmitted && isCorrect && (
                                  <CheckCircle2
                                    className="w-4 h-4 text-emerald-700 shrink-0"
                                    aria-hidden="true"
                                  />
                                )}
                                {quizSubmitted && isPicked && !isCorrect && (
                                  <XCircle
                                    className="w-4 h-4 text-red-700 shrink-0"
                                    aria-hidden="true"
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>
                        {quizSubmitted && (
                          <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <span className="font-semibold text-slate-800">Pembahasan:</span>{' '}
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
                  {!quizSubmitted ? (
                    <button
                      type="button"
                      disabled={
                        Object.keys(quizAnswers).length < activeTopic.quizQuestions.length
                      }
                      onClick={handleSubmitQuiz}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      Periksa Jawaban
                    </button>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={handleSaveQuizToProgress}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg"
                        >
                          <Sparkles className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>Simpan Skor ke Progres Berkala</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setQuizAnswers({});
                            setQuizSubmitted(false);
                            setQuizSavedNotice(false);
                          }}
                          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg"
                        >
                          Ulangi Kuis
                        </button>
                      </div>
                      {quizSavedNotice && (
                        <span className="text-xs font-medium text-emerald-700 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>Tersimpan ke riwayat progres!</span>
                        </span>
                      )}
                    </>
                  )}
                </div>
              </section>
            )}
          </article>
        )}
      </div>

      {/* Add Custom Summary Topic Modal */}
      {addModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-add-topic-title"
        >
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg p-6 space-y-5 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3
                id="modal-add-topic-title"
                className="font-display text-lg font-bold text-slate-900"
              >
                Tambah Rangkuman Materi Baru
              </h3>
              <button
                type="button"
                onClick={onCloseAddModal}
                aria-label="Tutup modal"
                className="p-2 text-slate-500 hover:text-slate-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Judul Materi
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  placeholder="Contoh: Algoritma & Pemrograman Blok"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Kategori / Mata Pelajaran
                </label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Contoh: Informatika"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Ringkasan Singkat
                </label>
                <textarea
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  required
                  rows={3}
                  placeholder="Jelaskan konsep inti dari materi yang sudah dipelajari..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Poin Penting (pisahkan dengan baris baru)
                </label>
                <textarea
                  value={newPointsText}
                  onChange={(e) => setNewPointsText(e.target.value)}
                  rows={3}
                  placeholder="Poin pertama&#10;Poin kedua&#10;Poin ketiga"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onCloseAddModal}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
                >
                  <BookOpen className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Simpan Materi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
