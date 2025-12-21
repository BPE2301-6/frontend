import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import TaskModal from './TaskModal';
import { useStatuses } from '@entities/statuses/useStatuses';
import { useTasks } from '@entities/tasks/useTasks';
import { Task, Status, TaskCreatePayload } from '@shared/api/types';
import { ApiError } from '@shared/api/httpClient';

const PRIORITY_COLOR: Record<string, string> = {
  HIGH: 'bg-[#FD5353]',
  MEDIUM: 'bg-[#FDD253]',
  LOW: 'bg-[#62C53E]',
};

const PRIORITY_LABEL: Record<string, string> = {
  HIGH: 'Высокий',
  MEDIUM: 'Средний',
  LOW: 'Низкий',
};

const formatDate = (value: string | null | undefined): string => {
  if (!value) return 'Без срока';
  try {
    const date = new Date(value);
    return date.toLocaleDateString();
  } catch {
    return value;
  }
};

interface TaskCardProps {
  task: Task;
  statuses: Status[];
  onEdit: (task: Task) => void;
  onMove: (taskId: string, statusId: string) => void;
  onDelete: (taskId: string) => void;
}

function TaskCard({ task, statuses, onEdit, onMove, onDelete }: TaskCardProps) {
  const priorityColor = PRIORITY_COLOR[task.priority] || PRIORITY_COLOR.MEDIUM;

  return (
    <div className="bg-[#313236] border border-[#1E80D9] rounded-2xl p-4 space-y-3 shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-white">{task.title}</div>
          <div className="text-sm text-[#A1A1A4]">
            {task.description || 'Без описания'}
          </div>
        </div>
        <span
          className={`w-4 h-4 rounded-full shrink-0 mt-1 ${priorityColor}`}
          title={PRIORITY_LABEL[task.priority] || task.priority}
        />
      </div>

      <div className="flex items-center text-xs text-[#A1A1A4] gap-2 flex-wrap">
        <span>Приоритет: {PRIORITY_LABEL[task.priority] || '—'}</span>
        <span className="w-[1px] h-3 bg-[#444]" />
        <span>Исполнитель: {task.assignee_id || '—'}</span>
        <span className="w-[1px] h-3 bg-[#444]" />
        <span>Автор: {task.reporter_id || '—'}</span>
      </div>

      <div className="flex items-center justify-between text-sm text-[#A1A1A4]">
        <span>Дедлайн: {formatDate(task.due_date)}</span>
        <span className="text-[#6AA8FF]">
          {statuses.find((s) => s.id === task.status_id)?.name || '—'}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {statuses.length > 0 ? (
          <select
            className="bg-[#242528] border border-[#1E80D9] text-white text-sm rounded-lg px-3 py-2 focus:outline-none"
            value={task.status_id}
            onChange={(e) => onMove(task.id, e.target.value)}
          >
            {statuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-red-500 text-sm">
            Невозможно создать задачу без колонок. Создайте колонку сначала.
          </span>
        )}
        <button
          className="px-3 py-2 bg-[#1E80D9] text-white text-sm rounded-lg hover:bg-[#166bb7] transition"
          onClick={() => onEdit(task)}
        >
          Редактировать
        </button>
        <button
          className="px-3 py-2 bg-[#FD5353] text-white text-sm rounded-lg hover:bg-[#d94444] transition"
          onClick={() => onDelete(task.id)}
        >
          Удалить
        </button>
      </div>
    </div>
  );
}

export default function KanbanBoard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId') || null;

  useEffect(() => {
    if (!projectId) {
      navigate('/projects');
    }
  }, [projectId, navigate]);

  const [filters, setFilters] = useState<{ q: string }>({ q: '' });
  const [newStatusName, setNewStatusName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTask, setModalTask] = useState<Task | null>(null);

  const {
    statuses,
    loading: loadingStatuses,
    error: statusesError,
    createStatus,
    deleteStatus,
    isApiError: isStatusApiError,
  } = useStatuses(projectId);

  const {
    tasks,
    loading: loadingTasks,
    error: tasksError,
    setFilters: setTaskFilters,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    isApiError: isTaskApiError,
  } = useTasks(projectId, filters);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    statuses.forEach((status) => {
      grouped[status.id] = [];
    });
    tasks.forEach((task) => {
      if (grouped[task.status_id]) {
        grouped[task.status_id].push(task);
      }
    });
    return grouped;
  }, [statuses, tasks]);

  const handleSaveTask = async (payload: TaskCreatePayload) => {
    if (!projectId) return;
    try {
      if (modalTask?.id) {
        await updateTask(modalTask.id, payload);
      } else {
        await createTask(payload);
      }
      setIsModalOpen(false);
      setModalTask(null);
    } catch (err) {
      const message =
        (isTaskApiError(err) && (err as ApiError).payload?.message) || 
        (err instanceof Error ? err.message : 'Ошибка сохранения');
      alert(message);
    }
  };

  const handleMoveTask = async (taskId: string, statusId: string) => {
    try {
      await moveTask(taskId, statusId);
    } catch (err) {
      const message =
        (isTaskApiError(err) && (err as ApiError).payload?.message) || 
        (err instanceof Error ? err.message : 'Ошибка переноса');
      alert(message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const confirmed = window.confirm('Удалить задачу?');
    if (!confirmed) return;
    try {
      await deleteTask(taskId);
    } catch (err) {
      const message =
        (isTaskApiError(err) && (err as ApiError).payload?.message) || 
        (err instanceof Error ? err.message : 'Ошибка удаления');
      alert(message);
    }
  };

  const handleAddStatus = async () => {
    const name = newStatusName.trim();
    if (!name || !projectId) return;
    try {
      await createStatus({
        name,
        position: statuses.length,
        is_closed: false,
      });
      setNewStatusName('');
    } catch (err) {
      const message =
        (isStatusApiError(err) && (err as ApiError).payload?.message) || 
        (err instanceof Error ? err.message : 'Ошибка создания колонки');
      alert(message);
    }
  };

  const handleDeleteStatus = async (statusId: string) => {
    const hasTasks = tasks.some((task) => task.status_id === statusId);
    if (hasTasks) {
      alert('Нельзя удалить статус с задачами.');
      return;
    }
    const confirmed = window.confirm('Удалить колонку?');
    if (!confirmed) return;
    try {
      await deleteStatus(statusId);
    } catch (err) {
      const message =
        (isStatusApiError(err) && (err as ApiError).payload?.message) || 
        (err instanceof Error ? err.message : 'Ошибка удаления колонки');
      alert(message);
    }
  };

  const handleOpenModal = (task: Task | null = null) => {
    setModalTask(task);
    setIsModalOpen(true);
  };

  if (!projectId) {
    return null; // Перенаправление происходит через useEffect
  }

  return (
    <div className="min-h-screen bg-[#242528] text-white px-6 py-6 space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Доска проекта</h1>
          <p className="text-sm text-[#A1A1A4]">
            projectId: <span className="text-[#6AA8FF]">{projectId}</span>
          </p>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <input
              className="bg-[#313236] border border-[#1E80D9] rounded-xl px-4 py-2 text-sm focus:outline-none"
              placeholder="Поиск по задачам"
              value={filters.q}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, q: e.target.value }))
              }
            />
            <button
              className="px-4 py-2 bg-[#1E80D9] rounded-xl hover:bg-[#166bb7] transition text-sm"
              onClick={() => setTaskFilters((prev) => ({ ...prev, q: filters.q }))}
            >
              Обновить
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              className="bg-[#313236] border border-[#1E80D9] rounded-xl px-4 py-2 text-sm focus:outline-none"
              placeholder="Новая колонка"
              value={newStatusName}
              onChange={(e) => setNewStatusName(e.target.value)}
            />
            <button
              className="px-4 py-2 bg-[#FF8800] rounded-xl hover:bg-[#e67800] transition text-sm"
              onClick={handleAddStatus}
            >
              Добавить
            </button>
          </div>

          <button
            className="px-4 py-2 bg-[#1E80D9] rounded-xl hover:bg-[#166bb7] transition text-sm"
            onClick={() => handleOpenModal(null)}
          >
            Новая задача
          </button>
        </div>
      </header>

      {(tasksError || statusesError) && (
        <div className="bg-[#FD5353] bg-opacity-20 border border-[#FD5353] text-white rounded-xl px-4 py-3 text-sm">
          {(tasksError || statusesError)?.message || 'Ошибка загрузки данных'}
        </div>
      )}

      <div className="flex flex-wrap gap-4 items-start">
        {(loadingStatuses || loadingTasks) && (
          <div className="text-sm text-[#A1A1A4]">Загружаем данные...</div>
        )}

        {!loadingStatuses && statuses.length === 0 && (
          <div className="text-sm text-[#A1A1A4]">
            Колонки не найдены. Создайте первую колонку.
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statuses.map((status) => (
          <div
            key={status.id}
            className="bg-[#2a2b2f] border border-[#1E80D9] rounded-3xl p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">{status.name}</div>
                <div className="text-xs text-[#A1A1A4]">
                  Позиция: {status.position ?? '-'}
                </div>
              </div>
              <button
                className="text-[#FD5353] text-sm hover:underline"
                onClick={() => handleDeleteStatus(status.id)}
              >
                Удалить
              </button>
            </div>

            <div className="space-y-3">
              {(tasksByStatus[status.id] || []).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  statuses={statuses}
                  onEdit={handleOpenModal}
                  onMove={handleMoveTask}
                  onDelete={handleDeleteTask}
                />
              ))}

              {(tasksByStatus[status.id] || []).length === 0 && (
                <div className="text-sm text-[#A1A1A4]">
                  Нет задач в этой колонке
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        statuses={statuses}
        task={modalTask}
        isSaving={false}
      />
    </div>
  );
}

