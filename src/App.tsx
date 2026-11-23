import { useEffect, useState } from 'react';
import {
  AppSection,
  ProgressLogEntry,
  ScheduleItem,
  StudentProfile,
  StudyTopic,
  TaskItem,
} from './types';
import {
  INITIAL_STUDENT_PROFILE,
  createInitialProgressLogs,
  createInitialSchedule,
  createInitialTasks,
  createInitialTopics,
} from './data/initialData';
import { deriveMasteryLevel, getTodayISO, offsetDateISO } from './utils/dateUtils';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardOverview } from './components/DashboardOverview';
import { ScheduleView } from './components/ScheduleView';
import { TasksView } from './components/TasksView';
import { MaterialsView } from './components/MaterialsView';
import { ProgressView } from './components/ProgressView';
import { EvaluateModal } from './components/EvaluateModal';

const STORAGE_KEYS = {
  schedule: 'gmj_studyhub_schedule_v1',
  tasks: 'gmj_studyhub_tasks_v1',
  topics: 'gmj_studyhub_topics_v1',
  logs: 'gmj_studyhub_logs_v1',
};

function loadOrInit<T>(key: string, initializer: () => T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw) as T;
    }
  } catch {
    // Fallback to initial seed data if localStorage is unavailable or malformed
  }
  return initializer();
}

export default function App() {
  const [profile] = useState<StudentProfile>(INITIAL_STUDENT_PROFILE);
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() =>
    loadOrInit(STORAGE_KEYS.schedule, createInitialSchedule)
  );
  const [tasks, setTasks] = useState<TaskItem[]>(() =>
    loadOrInit(STORAGE_KEYS.tasks, createInitialTasks)
  );
  const [topics, setTopics] = useState<StudyTopic[]>(() =>
    loadOrInit(STORAGE_KEYS.topics, createInitialTopics)
  );
  const [logs, setLogs] = useState<ProgressLogEntry[]>(() =>
    loadOrInit(STORAGE_KEYS.logs, createInitialProgressLogs)
  );

  const [activeSection, setActiveSection] = useState<AppSection>('overview');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('topic-dampak-sosial');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal orchestration
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskPrefillSubject, setTaskPrefillSubject] = useState<string | undefined>(undefined);
  const [taskPrefillTopicId, setTaskPrefillTopicId] = useState<string | undefined>(undefined);
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [evaluateModalOpen, setEvaluateModalOpen] = useState(false);
  const [evaluateTopicId, setEvaluateTopicId] = useState<string | undefined>(undefined);

  // Persist state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.schedule, JSON.stringify(schedule));
    } catch {
      // Ignore storage quota errors
    }
  }, [schedule]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
    } catch {
      // Ignore storage quota errors
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.topics, JSON.stringify(topics));
    } catch {
      // Ignore storage quota errors
    }
  }, [topics]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.logs, JSON.stringify(logs));
    } catch {
      // Ignore storage quota errors
    }
  }, [logs]);

  const todayISO = getTodayISO();
  const pendingTasksCount = tasks.filter((t) => !t.completed).length;
  const reviewNeededCount = topics.filter(
    (t) => t.masteryScore < 75 || t.nextReviewDate <= todayISO
  ).length;

  const handleOpenTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
    setActiveSection('materials');
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleSaveTask = (data: Omit<TaskItem, 'id' | 'createdAt'>, existingId?: string) => {
    if (existingId) {
      setTasks((prev) => prev.map((t) => (t.id === existingId ? { ...t, ...data } : t)));
    } else {
      const newTask: TaskItem = {
        ...data,
        id: `task-${Date.now()}`,
        createdAt: getTodayISO(),
      };
      setTasks((prev) => [newTask, ...prev]);
    }
    setTaskPrefillSubject(undefined);
    setTaskPrefillTopicId(undefined);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleAddSchedule = (item: Omit<ScheduleItem, 'id'>) => {
    setSchedule((prev) => [...prev, { ...item, id: `sch-${Date.now()}` }]);
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedule((prev) => prev.filter((s) => s.id !== id));
  };

  const handleQuickAddTaskForSubject = (subject: string, linkedTopicId?: string) => {
    setTaskPrefillSubject(subject);
    setTaskPrefillTopicId(linkedTopicId);
    setActiveSection('tasks');
    setTaskModalOpen(true);
  };

  const handleUpdatePersonalNotes = (topicId: string, notes: string) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, personalNotes: notes } : t))
    );
  };

  const handleRecordEvaluation = (
    topicId: string,
    score: number,
    studyMinutes: number,
    reflection: string
  ) => {
    const today = getTodayISO();
    const target = topics.find((t) => t.id === topicId);
    if (!target) return;

    const nextDays = score >= 85 ? 7 : score >= 60 ? 4 : 2;
    const nextReviewDate = offsetDateISO(nextDays);

    setTopics((prev) =>
      prev.map((t) =>
        t.id === topicId
          ? {
              ...t,
              masteryScore: score,
              masteryLevel: deriveMasteryLevel(score),
              lastReviewedAt: today,
              nextReviewDate,
            }
          : t
      )
    );

    const newLog: ProgressLogEntry = {
      id: `log-${Date.now()}`,
      date: today,
      topicId: target.id,
      topicTitle: target.title,
      score,
      previousScore: target.masteryScore,
      studyMinutes,
      reflection,
    };
    setLogs((prev) => [...prev, newLog]);
  };

  const handleAddTopic = (data: {
    title: string;
    category: string;
    summary: string;
    keyPoints: string[];
  }) => {
    const nextNum = String(topics.length + 1).padStart(2, '0');
    const newId = `topic-custom-${Date.now()}`;
    const newTopic: StudyTopic = {
      id: newId,
      number: nextNum,
      title: data.title,
      category: data.category,
      readMinutes: 4,
      summary: data.summary,
      keyPoints: data.keyPoints,
      realWorldExamples: ['Tambahkan contoh penerapan nyata melalui catatan pribadi Anda.'],
      glossary: [],
      personalNotes: '',
      masteryScore: 0,
      masteryLevel: 'Belum Dipelajari',
      lastReviewedAt: getTodayISO(),
      nextReviewDate: getTodayISO(),
      quizQuestions: [],
    };
    setTopics((prev) => [...prev, newTopic]);
    setSelectedTopicId(newId);
  };

  const handleOpenEvaluateModal = (topicId?: string) => {
    setEvaluateTopicId(topicId || selectedTopicId || topics[0]?.id);
    setEvaluateModalOpen(true);
  };

  const handleTopBarAction = () => {
    if (activeSection === 'schedule') {
      setScheduleModalOpen(true);
    } else if (activeSection === 'materials') {
      setTopicModalOpen(true);
    } else if (activeSection === 'progress') {
      handleOpenEvaluateModal();
    } else {
      setTaskPrefillSubject(undefined);
      setTaskPrefillTopicId(undefined);
      if (activeSection !== 'tasks') {
        setActiveSection('tasks');
      }
      setTaskModalOpen(true);
    }
  };

  const handleResetDemoData = () => {
    const initialSchedule = createInitialSchedule();
    const initialTasks = createInitialTasks();
    const initialTopics = createInitialTopics();
    const initialLogs = createInitialProgressLogs();
    setSchedule(initialSchedule);
    setTasks(initialTasks);
    setTopics(initialTopics);
    setLogs(initialLogs);
    setSelectedTopicId(initialTopics[0].id);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        profile={profile}
        pendingTasksCount={pendingTasksCount}
        reviewNeededCount={reviewNeededCount}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onResetDemoData={handleResetDemoData}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
          activeSection={activeSection}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onPrimaryAction={handleTopBarAction}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-[1200px] mx-auto">
            {activeSection === 'overview' && (
              <DashboardOverview
                profile={profile}
                schedule={schedule}
                tasks={tasks}
                topics={topics}
                onNavigate={setActiveSection}
                onOpenTopic={handleOpenTopic}
                onToggleTask={handleToggleTask}
                onOpenEvaluateModal={handleOpenEvaluateModal}
              />
            )}

            {activeSection === 'schedule' && (
              <ScheduleView
                schedule={schedule}
                tasks={tasks}
                topics={topics}
                onAddSchedule={handleAddSchedule}
                onDeleteSchedule={handleDeleteSchedule}
                onOpenTopic={handleOpenTopic}
                onQuickAddTaskForSubject={handleQuickAddTaskForSubject}
                modalOpen={scheduleModalOpen}
                onOpenModal={() => setScheduleModalOpen(true)}
                onCloseModal={() => setScheduleModalOpen(false)}
              />
            )}

            {activeSection === 'tasks' && (
              <TasksView
                tasks={tasks}
                topics={topics}
                onToggleTask={handleToggleTask}
                onSaveTask={handleSaveTask}
                onDeleteTask={handleDeleteTask}
                onOpenTopic={handleOpenTopic}
                modalOpen={taskModalOpen}
                prefillSubject={taskPrefillSubject}
                prefillTopicId={taskPrefillTopicId}
                onOpenModal={() => setTaskModalOpen(true)}
                onCloseModal={() => {
                  setTaskModalOpen(false);
                  setTaskPrefillSubject(undefined);
                  setTaskPrefillTopicId(undefined);
                }}
              />
            )}

            {activeSection === 'materials' && (
              <MaterialsView
                topics={topics}
                selectedTopicId={selectedTopicId}
                onSelectTopic={setSelectedTopicId}
                onUpdatePersonalNotes={handleUpdatePersonalNotes}
                onRecordQuizMastery={(topicId, score, reflection) =>
                  handleRecordEvaluation(topicId, score, 15, reflection)
                }
                onOpenEvaluateModal={handleOpenEvaluateModal}
                onAddTopic={handleAddTopic}
                addModalOpen={topicModalOpen}
                onCloseAddModal={() => setTopicModalOpen(false)}
              />
            )}

            {activeSection === 'progress' && (
              <ProgressView
                topics={topics}
                logs={logs}
                onOpenTopic={handleOpenTopic}
                onOpenEvaluateModal={handleOpenEvaluateModal}
              />
            )}
          </div>
        </main>

        <footer className="border-t border-slate-200 bg-white px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <span>GMJ StudyHub · Agenda Belajar Siswa SMP Global Mandiri Jakarta</span>
            <span>Data tersimpan otomatis secara lokal di peramban Anda</span>
          </div>
        </footer>
      </div>

      <EvaluateModal
        open={evaluateModalOpen}
        topics={topics}
        initialTopicId={evaluateTopicId}
        onClose={() => setEvaluateModalOpen(false)}
        onSubmitEvaluation={handleRecordEvaluation}
      />
    </div>
  );
}
