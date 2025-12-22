import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import TaskModal from './TaskModal';
import { useStatuses } from '@entities/statuses/useStatuses';
import { useTasks } from '@entities/tasks/useTasks';
import { useAuthStore } from '@entities/auth/useAuthStore';
import { projectsApi } from '@shared/api/projects';
import { Task, Status, TaskCreatePayload, Project } from '@shared/api/types';
import { ApiError } from '@shared/api/httpClient';

const PRIORITY_COLOR: Record<string, string> = {
  HIGH: '#FD5353',
  MEDIUM: '#FDD253',
  LOW: '#62C53E',
};

const formatDate = (value: string | null | undefined): string => {
  if (!value) return '';
  try {
    const date = new Date(value);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}.${month}.${year}`;
  } catch {
    return '';
  }
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

function TaskCard({ task, onEdit }: TaskCardProps) {
  const priorityColor = PRIORITY_COLOR[task.priority] || PRIORITY_COLOR.MEDIUM;

  return (
    <div
      className="bg-[#313236] rounded-[32px] p-4 cursor-pointer hover:opacity-90 transition-opacity"
      onClick={() => onEdit(task)}
      style={{
        marginBottom: 'clamp(16px, 2vw, 24px)',
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="font-medium text-white" style={{ fontSize: 'clamp(14px, 1.5vw, 16px)' }}>
          {task.title}
        </div>
        <div
          style={{
            width: '17px',
            height: '17px',
            borderRadius: '50%',
            backgroundColor: priorityColor,
            flexShrink: 0,
            marginLeft: '8px',
          }}
        />
      </div>
      
      {task.description && (
        <div className="text-[#838486] mb-2" style={{ fontSize: 'clamp(12px, 1.3vw, 14px)' }}>
          {task.description}
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="text-[#838486]" style={{ fontSize: 'clamp(12px, 1.3vw, 14px)' }}>
          {task.key}
        </div>
        {task.due_date && (
          <div className="text-[#838486]" style={{ fontSize: 'clamp(12px, 1.3vw, 14px)' }}>
            {formatDate(task.due_date)}
          </div>
        )}
      </div>

      {task.assignee_id && (
        <div className="flex justify-end mt-3">
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: '4px solid #757575',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function KanbanBoard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId') || null;
  const { user } = useAuthStore();
  const [project, setProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [selectedStatusId, setSelectedStatusId] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      navigate('/projects');
      return;
    }
    
    // Загружаем информацию о проекте
    projectsApi.getById(projectId)
      .then(setProject)
      .catch(() => {
        navigate('/projects');
      });
  }, [projectId, navigate]);

  const {
    statuses,
    loading: loadingStatuses,
    error: statusesError,
    createStatus,
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
  } = useTasks(projectId, { q: searchQuery });

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

  useEffect(() => {
    if (searchQuery !== undefined) {
      setTaskFilters({ q: searchQuery });
    }
  }, [searchQuery, setTaskFilters]);

  const handleSaveTask = async (payload: TaskCreatePayload) => {
    if (!projectId) return;
    try {
      if (modalTask?.id) {
        await updateTask(modalTask.id, payload);
      } else {
        const taskPayload = selectedStatusId 
          ? { ...payload, status_id: selectedStatusId }
          : payload;
        await createTask(taskPayload);
      }
      setIsModalOpen(false);
      setModalTask(null);
      setSelectedStatusId(null);
    } catch (err) {
      const message =
        (isTaskApiError(err) && (err as ApiError).payload?.message) || 
        (err instanceof Error ? err.message : 'Ошибка сохранения');
      alert(message);
    }
  };

  const handleOpenModal = (task: Task | null = null, statusId: string | null = null) => {
    setModalTask(task);
    setSelectedStatusId(statusId);
    setIsModalOpen(true);
  };

  if (!projectId || !project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#242528] text-white font-montserrat">
      {/* Верхнее меню */}
      <header
        className="w-full border-b border-[#1E80D9]"
        style={{
          height: 'clamp(120px, 15vh, 148px)',
          padding: 'clamp(20px, 3vw, 26px) clamp(40px, 5vw, 55px)',
        }}
      >
        <div className="flex items-center justify-between h-full">
          {/* Левая часть: название доски и поиск */}
          <div className="flex items-center" style={{ gap: 'clamp(20px, 3vw, 40px)' }}>
            {/* Название доски */}
            <div
              className="font-bold text-white"
              style={{
                fontSize: 'clamp(20px, 2.5vw, 24px)',
                marginRight: 'clamp(10px, 1.5vw, 20px)',
              }}
            >
              {project.name.toUpperCase()}
            </div>

            {/* Поиск */}
            <div className="flex items-center" style={{ gap: 'clamp(8px, 1vw, 12px)' }}>
              <input
                type="text"
                placeholder="найти таску"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-white placeholder:text-white placeholder:font-medium outline-none"
                style={{
                  width: 'clamp(500px, 35vw, 640px)',
                  height: 'clamp(50px, 6vw, 54px)',
                  borderRadius: '32px',
                  border: '1px solid #1E80D9',
                  backgroundColor: '#242528',
                  paddingLeft: 'clamp(30px, 4vw, 40px)',
                  paddingRight: 'clamp(30px, 4vw, 40px)',
                  fontSize: 'clamp(20px, 2.5vw, 24px)',
                }}
              />
            </div>
          </div>

          {/* Правая часть: кнопка добавления и аватар */}
          <div className="flex items-center" style={{ gap: 'clamp(12px, 2vw, 20px)' }}>
            {/* Кнопка добавления задачи */}
            <button
              onClick={() => handleOpenModal(null, null)}
              className="flex items-center justify-center text-white font-bold"
              style={{
                width: 'clamp(50px, 6vw, 54px)',
                height: 'clamp(50px, 6vw, 54px)',
                borderRadius: '50%',
                backgroundColor: '#FF8800',
                fontSize: 'clamp(35px, 4.5vw, 45px)',
                lineHeight: '1',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease, transform 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E67700';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FF8800';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              +
            </button>

            {/* Аватар пользователя */}
            {user && (
              <div
                style={{
                  width: 'clamp(50px, 6vw, 53px)',
                  height: 'clamp(50px, 6vw, 53px)',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    border: '4px solid #757575',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Ошибки */}
      {(tasksError || statusesError) && (
        <div
          className="text-[#FD5353] text-center"
          style={{
            padding: '20px',
            fontSize: 'clamp(16px, 2vw, 20px)',
          }}
        >
          {(tasksError || statusesError)?.message || 'Ошибка загрузки данных'}
        </div>
      )}

      {/* Колонки */}
      <div
        className="flex items-start"
        style={{
          padding: 'clamp(40px, 5vw, 55px)',
          gap: 'clamp(20px, 3vw, 30px)',
          minHeight: 'calc(100vh - clamp(120px, 15vh, 148px))',
        }}
      >
        {(loadingStatuses || loadingTasks) && (
          <div className="text-[#A1A1A4]" style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}>
            Загружаем данные...
          </div>
        )}

        {!loadingStatuses && statuses.length === 0 && (
          <div className="text-[#A1A1A4]" style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}>
            Колонки не найдены. Создайте первую колонку.
          </div>
        )}

        {!loadingStatuses && statuses.map((status) => (
          <div
            key={status.id}
            className="flex-1 flex flex-col"
            style={{
              minWidth: 'clamp(300px, 25vw, 372px)',
              maxWidth: 'clamp(300px, 25vw, 372px)',
            }}
          >
            {/* Название колонки */}
            <div
              className="text-white font-normal mb-4"
              style={{
                fontSize: 'clamp(20px, 2.5vw, 24px)',
                paddingLeft: 'clamp(10px, 1.5vw, 20px)',
              }}
            >
              {status.name}
            </div>

            {/* Колонка с задачами */}
            <div
              className="flex-1 flex flex-col"
              style={{
                borderWidth: '1px 1px 0px 1px',
                borderStyle: 'solid',
                borderColor: '#1E80D9',
                borderRadius: '50px 50px 0px 0px',
                padding: 'clamp(20px, 3vw, 30px)',
                minHeight: 'clamp(400px, 50vh, 600px)',
              }}
            >
              {/* Задачи */}
              <div className="flex-1">
                {(tasksByStatus[status.id] || []).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleOpenModal}
                  />
                ))}

                {(tasksByStatus[status.id] || []).length === 0 && (
                  <div
                    className="text-[#838486] text-center"
                    style={{
                      fontSize: 'clamp(14px, 1.5vw, 16px)',
                      padding: '20px',
                    }}
                  >
                    Нет задач
                  </div>
                )}
              </div>

              {/* Кнопка добавления задачи в колонку */}
              <button
                onClick={() => handleOpenModal(null, status.id)}
                className="flex items-center justify-center text-white font-medium mt-4"
                style={{
                  width: 'clamp(50px, 6vw, 54px)',
                  height: 'clamp(50px, 6vw, 54px)',
                  borderRadius: '50%',
                  backgroundColor: '#838486',
                  fontSize: 'clamp(35px, 4.5vw, 45px)',
                  lineHeight: '1',
                  border: 'none',
                  cursor: 'pointer',
                  margin: '0 auto',
                  transition: 'background-color 0.3s ease, transform 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#6A6A6A';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#838486';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalTask(null);
          setSelectedStatusId(null);
        }}
        onSave={handleSaveTask}
        statuses={statuses}
        task={modalTask}
        isSaving={false}
        defaultStatusId={selectedStatusId}
      />
    </div>
  );
}
