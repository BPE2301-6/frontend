import { useMemo, useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import TaskModal from './TaskModal';
import StatusModal from './StatusModal';
import UserProfileModal from '@shared/ui/UserProfileModal';
import ConfirmDeleteModal from '@shared/ui/ConfirmDeleteModal';
import AddMemberModal from '@shared/ui/AddMemberModal';
import ProjectMembersList from '@shared/ui/ProjectMembersList';
import ProjectSelectorDropdown from '@shared/ui/ProjectSelectorDropdown';
import { useStatuses } from '@entities/statuses/useStatuses';
import { useTasks } from '@entities/tasks/useTasks';
import { useAuthStore } from '@entities/auth/useAuthStore';
import { useProjectMembers } from '@entities/projectMembers/useProjectMembers';
import { projectsApi } from '@shared/api/projects';
import { projectMembersApi } from '@shared/api/projectMembers';
import { tagsApi, Tag } from '@shared/api/tags';
import { createTask as createTaskApi, updateTask as updateTaskApi, fetchTasks } from '@shared/api/tasks';
import { Task, TaskCreatePayload, Project, StatusCreatePayload } from '@shared/api/types';
import { ApiError } from '@shared/api/httpClient';
import { checklistsApi, Checklist, ChecklistItem } from '@shared/api/checklists';

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
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return '';
  }
};

interface ErrorDisplayProps {
  error: Error | null;
}

function ErrorDisplay({ error }: ErrorDisplayProps) {
  const [show, setShow] = useState(!!error);

  useEffect(() => {
    if (error) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [error]);

  if (!show || !error) return null;

  return (
    <div
      className="text-[#FD5353] text-center"
      style={{
        padding: '20px',
        fontSize: 'clamp(16px, 2vw, 20px)',
      }}
    >
      {error.message || 'Ошибка загрузки данных'}
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  tags: Tag[];
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  refreshKey?: number; // Ключ для принудительного обновления чеклистов
}

function TaskCard({ task, onEdit, onDelete, tags, onDragStart, onDragEnd, isDragging, refreshKey }: TaskCardProps) {
  const priorityColor = PRIORITY_COLOR[task.priority] || PRIORITY_COLOR.MEDIUM;
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [checklistItems, setChecklistItems] = useState<Record<string, ChecklistItem[]>>({});
  
  // Загрузка чеклистов для задачи
  useEffect(() => {
    const loadChecklists = async () => {
      try {
        const loadedChecklists = await checklistsApi.list(task.id);
        setChecklists(loadedChecklists);
        
        const itemsMap: Record<string, ChecklistItem[]> = {};
        for (const checklist of loadedChecklists) {
          const items = await checklistsApi.getItems(checklist.id);
          itemsMap[checklist.id] = items;
        }
        setChecklistItems(itemsMap);
      } catch (error) {
        // Игнорируем ошибки загрузки чеклистов
      }
    };
    
    if (task.id) {
      loadChecklists();
    }
  }, [task.id, refreshKey]); // Добавляем refreshKey для обновления после изменений

  // Периодическая проверка обновлений чеклистов (каждые 1.5 секунды)
  useEffect(() => {
    if (!task.id) return;
    
    const interval = setInterval(async () => {
      try {
        const loadedChecklists = await checklistsApi.list(task.id);
        
        // Загружаем все элементы чеклистов
        const itemsMap: Record<string, ChecklistItem[]> = {};
        for (const checklist of loadedChecklists) {
          const items = await checklistsApi.getItems(checklist.id);
          itemsMap[checklist.id] = items;
        }
        
        // Обновляем состояние только если есть изменения
        setChecklists(prev => {
          const prevIds = prev.map(c => c.id).sort().join(',');
          const newIds = loadedChecklists.map(c => c.id).sort().join(',');
          if (prevIds !== newIds || prev.length !== loadedChecklists.length) {
            return loadedChecklists;
          }
          return prev;
        });
        
        setChecklistItems(prev => {
          let hasChanges = false;
          const newItems: Record<string, ChecklistItem[]> = {};
          
          for (const checklist of loadedChecklists) {
            const prevItems = prev[checklist.id] || [];
            const newItemsList = itemsMap[checklist.id] || [];
            
            // Проверяем изменения
            if (prevItems.length !== newItemsList.length ||
                prevItems.some((item, idx) => {
                  const newItem = newItemsList[idx];
                  return !newItem || item.id !== newItem.id || item.is_done !== newItem.is_done || item.content !== newItem.content;
                })) {
              hasChanges = true;
            }
            
            newItems[checklist.id] = newItemsList;
          }
          
          // Обновляем только если есть изменения
          if (hasChanges || Object.keys(prev).length !== Object.keys(newItems).length) {
            return newItems;
          }
          return prev;
        });
      } catch (error) {
        // Игнорируем ошибки
      }
    }, 1500); // Проверка каждые 1.5 секунды
    
    return () => clearInterval(interval);
  }, [task.id]);
  
  // Переключение состояния элемента чеклиста
  const handleToggleChecklistItem = async (e: React.MouseEvent, item: ChecklistItem) => {
    e.stopPropagation(); // Предотвращаем открытие модального окна
    try {
      const updatedItem = await checklistsApi.updateItem(item.id, {
        is_done: !item.is_done,
      });
      // Используем функциональное обновление для надежности
      setChecklistItems(prev => ({
        ...prev,
        [item.checklist_id]: (prev[item.checklist_id] || []).map(i => i.id === item.id ? updatedItem : i),
      }));
    } catch (error) {
      console.error('Ошибка обновления элемента чеклиста:', error);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
    onDragStart(task.id);
  };

  const handleDragEnd = () => {
    onDragEnd();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем открытие модального окна редактирования
    onDelete(task.id);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="bg-[#313236] cursor-move hover:opacity-90 transition-opacity relative"
      onClick={() => onEdit(task)}
      style={{
        marginBottom: 'clamp(16px, 2vw, 24px)',
        padding: 'clamp(16px, 2vw, 20px)',
        width: '100%',
        border: '1px solid #404040',
        borderRadius: '20px',
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      {/* Точка приоритета - справа в углу */}
      <div
        className="absolute"
        style={{
          top: '12px',
          right: '12px',
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          backgroundColor: priorityColor,
          flexShrink: 0,
          zIndex: 5,
        }}
      />

      {/* Заголовок */}
      <div className="mb-3 pr-4">
        <div className="font-medium text-white" style={{ fontSize: 'clamp(14px, 1.5vw, 16px)', lineHeight: '1.4' }}>
          {task.title}
        </div>
      </div>

      {/* Описание */}
      {task.description && (
        <div className="text-[#838486] mb-3" style={{ fontSize: 'clamp(12px, 1.3vw, 14px)', lineHeight: '1.4' }}>
          {task.description}
        </div>
      )}

      {/* Теги - маленьким шрифтом под задачей */}
      {task.tag_ids && task.tag_ids.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tag_ids.map((tagId) => {
            const tag = tags.find((t) => t.id === tagId);
            if (!tag) return null;
            return (
              <span
                key={tagId}
                className="px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: tag.color || '#1E80D9',
                  color: '#FFFFFF',
                  fontSize: 'clamp(9px, 1vw, 11px)',
                  fontWeight: '500',
                  lineHeight: '1.2',
                }}
              >
                {tag.name}
              </span>
            );
          })}
        </div>
      )}

      {/* Разделитель перед чеклистами */}
      {checklists.length > 0 && (
        <div style={{ height: '1px', backgroundColor: '#404040', marginTop: 'clamp(8px, 1vw, 12px)', marginBottom: 'clamp(8px, 1vw, 12px)' }} />
      )}

      {/* Чеклисты - между описанием и датой */}
      {checklists.length > 0 && (
        <>
          <div className="mb-3">
            {checklists.map((checklist) => {
              const items = checklistItems[checklist.id] || [];
              if (items.length === 0) return null;
              
              return (
                <div key={checklist.id} style={{ marginBottom: 'clamp(6px, 0.8vw, 8px)' }}>
                  {items.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center"
                      style={{
                        marginBottom: 'clamp(4px, 0.5vw, 6px)',
                        cursor: 'pointer',
                      }}
                      onClick={(e) => handleToggleChecklistItem(e, item)}
                    >
                      <span
                        className="text-[#838486]"
                        style={{
                          fontSize: 'clamp(11px, 1.2vw, 13px)',
                          textDecoration: item.is_done ? 'line-through' : 'none',
                          opacity: item.is_done ? 0.6 : 1,
                          cursor: 'pointer',
                          lineHeight: '1.3',
                          transition: 'text-decoration 0.2s ease, opacity 0.2s ease',
                        }}
                      >
                        {item.content}
                      </span>
                    </div>
                  ))}
                  {items.length > 6 && (
                    <div className="text-[#838486]" style={{ fontSize: 'clamp(10px, 1.1vw, 12px)', marginTop: '4px' }}>
                      +{items.length - 6} еще
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Разделитель после чеклистов */}
      <div style={{ height: '1px', backgroundColor: '#404040', marginBottom: '12px' }} />
        </>
      )}

      {/* Разделитель - только если нет чеклистов */}
      {checklists.length === 0 && (
        <div style={{ height: '1px', backgroundColor: '#404040', marginBottom: '12px' }} />
      )}

      {/* Дедлайн */}
      {task.due_date && (
        <div className="flex items-center justify-end">
          <div className="text-[#838486]" style={{ fontSize: 'clamp(11px, 1.2vw, 13px)' }}>
            {formatDate(task.due_date)}
          </div>
        </div>
      )}

      {/* Исполнитель */}
      {task.assignee_id && (
        <div className="flex justify-end mt-2">
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                border: '3px solid #757575',
              }}
            />
          </div>
        </div>
      )}

      {/* Кнопка удаления - справа внизу */}
      <button
        onClick={handleDeleteClick}
        className="absolute text-white hover:text-[#FD5353] transition-colors"
        style={{
          bottom: '12px',
          right: '12px',
          width: '24px',
          height: '24px',
          fontSize: '20px',
          lineHeight: '1',
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="Удалить задачу"
      >
        ×
      </button>

      {/* Индикатор дедлайна - узкая полоска внизу карточки */}
      {task.due_date && task.timedelta && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            backgroundColor: '#404040',
            borderBottomLeftRadius: '20px',
            borderBottomRightRadius: '20px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, Math.max(0, task.timedelta.delta))}%`,
              backgroundColor:
                task.timedelta.status === 'low'
                  ? '#62C53E' // зеленый
                  : task.timedelta.status === 'mid'
                  ? '#FDD253' // желтый
                  : '#FD5353', // красный
              transition: 'width 0.3s ease, background-color 0.3s ease',
            }}
          />
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
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [deleteStatusId, setDeleteStatusId] = useState<string | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverStatusId, setDragOverStatusId] = useState<string | null>(null);
  const [checklistRefreshKey, setChecklistRefreshKey] = useState(0); // Ключ для обновления чеклистов
  const columnsContainerRef = useRef<HTMLDivElement>(null);

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
    deleteStatus,
    isApiError: isStatusApiError,
  } = useStatuses(projectId);

  const {
    tasks,
    loading: loadingTasks,
    error: tasksError,
    setFilters: setTaskFilters,
    deleteTask: deleteTaskApi,
    moveTask: moveTaskApi,
    reload: reloadTasks,
    isApiError: isTaskApiError,
  } = useTasks(projectId, { q: searchQuery });

  const { users: projectMembers, members: projectMembersData, reload: reloadMembers } = useProjectMembers(projectId);
  const [tags, setTags] = useState<Tag[]>([]);
  
  // Получаем роль текущего пользователя в проекте
  // Если пользователь является создателем проекта (lead_id), он автоматически OWNER
  const currentUserRole = useMemo(() => {
    if (!project || !user) return undefined;
    
    // Сначала проверяем, является ли пользователь создателем проекта
    if (project.lead_id === user.id) {
      return 'OWNER';
    }
    
    // Иначе ищем в списке участников
    const member = projectMembersData.find(m => m.user_id === user.id);
    return member?.role;
  }, [project, user, projectMembersData]);

  useEffect(() => {
    if (!projectId) return;
    tagsApi.list(projectId)
      .then((res) => setTags(res.items || []))
      .catch(() => setTags([]));
  }, [projectId]);

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

  // Обновление фильтров поиска с debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (projectId) {
        setTaskFilters({ q: searchQuery || '' });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, projectId, setTaskFilters]);

  // Отслеживание прокрутки колонок

  const handleSaveTask = async (payload: TaskCreatePayload, tagNames?: string) => {
    if (!projectId || !user) {
      alert('Ошибка: проект или пользователь не найден');
      return;
    }
    try {
      let taskId: string;
      if (modalTask?.id) {
        // При обновлении задачи сохраняем reporter_id из существующей задачи
        await updateTaskApi(modalTask.id, payload);
        taskId = modalTask.id;
        // Перезагружаем задачи
        await reloadTasks();
      } else {
        // При создании новой задачи устанавливаем reporter_id из текущего пользователя
        const taskPayload: TaskCreatePayload = {
          ...payload,
          reporter_id: user.id,
          status_id: selectedStatusId || payload.status_id,
        };
        const createdTask = await createTaskApi(projectId, taskPayload);
        taskId = createdTask.id;
        // Обновляем modalTask на созданную задачу, чтобы можно было добавлять чеклисты
        setModalTask(createdTask);
        // Перезагружаем задачи
        await reloadTasks();
      }

      // Обработка тегов
      if (tagNames !== undefined) {
        // Получаем актуальный список тегов проекта
        const updatedTagsResponse = await tagsApi.list(projectId);
        const allTags = updatedTagsResponse.items || [];
        setTags(allTags);
        
        if (tagNames && tagNames.trim()) {
          const tagNameList = tagNames
            .split(',')
            .map((name) => name.trim())
            .filter(Boolean);

          if (tagNameList.length > 0) {
            const tagIds: string[] = [];
            
            // Для каждого тега находим существующий или создаем новый
            for (const tagName of tagNameList) {
              let tag = allTags.find((t) => t.name.toLowerCase() === tagName.toLowerCase());
              
              if (!tag) {
                // Создаем новый тег
                try {
                  const newTag = await tagsApi.create(projectId, {
                    name: tagName,
                    color: null,
                  });
                  tag = newTag;
                  // Обновляем список тегов
                  const freshTags = await tagsApi.list(projectId);
                  setTags(freshTags.items || []);
                  allTags.push(newTag);
                } catch (err) {
                  console.error('Ошибка создания тега:', err);
                  continue;
                }
              }
              
              if (tag) {
                tagIds.push(tag.id);
              }
            }

            // Привязываем теги к задаче (заменяет все существующие теги)
            if (tagIds.length > 0) {
              try {
                await tagsApi.attachToTask(taskId, tagIds);
              } catch (err) {
                console.error('Ошибка привязки тегов к задаче:', err);
              }
            }
          } else {
            // Если поле тегов пустое, удаляем все теги
            // Получаем актуальную задачу
            const freshTasks = await fetchTasks(projectId, { limit: 200 });
            const currentTask = freshTasks.items.find((t) => t.id === taskId);
            if (currentTask && currentTask.tag_ids && currentTask.tag_ids.length > 0) {
              // Удаляем все теги по одному
              for (const tagId of currentTask.tag_ids) {
                try {
                  await tagsApi.detachFromTask(taskId, tagId);
                } catch (err) {
                  console.error('Ошибка удаления тега из задачи:', err);
                }
              }
            }
          }
        } else {
          // Если поле тегов пустое, удаляем все теги
          const freshTasks = await fetchTasks(projectId, { limit: 200 });
          const currentTask = freshTasks.items.find((t) => t.id === taskId);
          if (currentTask && currentTask.tag_ids && currentTask.tag_ids.length > 0) {
            // Удаляем все теги по одному
            for (const tagId of currentTask.tag_ids) {
              try {
                await tagsApi.detachFromTask(taskId, tagId);
              } catch (err) {
                console.error('Ошибка удаления тега из задачи:', err);
              }
            }
          }
        }
        
        // Перезагружаем задачи в конце, чтобы обновить теги
        await reloadTasks();
      }

      // Если задача была создана, оставляем модальное окно открытым для добавления чеклистов
      // Если задача была обновлена, закрываем модальное окно
      if (modalTask?.id) {
        // Обновление существующей задачи - закрываем модальное окно
      setIsModalOpen(false);
      setModalTask(null);
      setSelectedStatusId(null);
        // Обновляем ключ для обновления чеклистов в карточках задач
        setChecklistRefreshKey(prev => prev + 1);
      } else {
        // Создание новой задачи - оставляем модальное окно открытым
        // modalTask уже обновлен выше
      }
    } catch (err) {
      const message =
        (isTaskApiError(err) && (err as ApiError).payload?.message) || 
        (err instanceof Error ? err.message : 'Ошибка сохранения задачи');
      alert(message);
    }
  };

  const handleOpenModal = (task: Task | null = null, statusId: string | null = null) => {
    if (!task && statuses.length === 0) {
      alert('Сначала создайте хотя бы одну колонку (статус)');
      return;
    }
    setModalTask(task);
    setSelectedStatusId(statusId);
    setIsModalOpen(true);
  };

  const handleCreateStatus = async (payload: StatusCreatePayload) => {
    if (!projectId) {
      alert('Проект не найден');
      return;
    }
    
    try {
      await createStatus(payload);
      setIsStatusModalOpen(false);
    } catch (err) {
      // Ошибка будет обработана в StatusModal, просто пробрасываем дальше
      throw err;
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTaskApi(taskId);
      setDeleteTaskId(null);
    } catch (err) {
      const message =
        (isTaskApiError(err) && (err as ApiError).payload?.message) ||
        (err instanceof Error ? err.message : 'Ошибка удаления задачи');
      alert(message);
    }
  };

  const handleDeleteStatus = async (statusId: string) => {
    try {
      // Сначала удаляем все задачи в этой колонке
      const tasksInStatus = tasksByStatus[statusId] || [];
      for (const task of tasksInStatus) {
        try {
          await deleteTaskApi(task.id);
        } catch (taskErr) {
          // Пропускаем ошибки удаления отдельных задач
          console.error(`Ошибка удаления задачи ${task.id}:`, taskErr);
        }
      }
      
      // Затем удаляем саму колонку
      await deleteStatus(statusId);
      setDeleteStatusId(null);
    } catch (err) {
      const message =
        (isStatusApiError(err) && (err as ApiError).payload?.message) ||
        (err instanceof Error ? err.message : 'Ошибка удаления колонки');
      alert(message);
    }
  };

  const handleDeleteMember = async (userId: string) => {
    if (!projectId) return;
    try {
      await projectMembersApi.delete(projectId, userId);
      reloadMembers();
    } catch (err) {
      const message =
        (err instanceof ApiError && err.payload?.message) ||
        (err instanceof Error ? err.message : 'Ошибка удаления участника');
      alert(message);
    }
  };

  if (!projectId || !project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#242528] text-white font-montserrat">
      {/* Верхнее меню - фиксированный sidebar */}
      <header
        className="border-b border-[#1E80D9]"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 'clamp(120px, 15vh, 148px)',
          padding: 'clamp(20px, 3vw, 26px) clamp(40px, 5vw, 55px)',
          backgroundColor: '#242528',
          zIndex: 1000,
        }}
      >
        <div className="flex items-center justify-between h-full">
          {/* Левая часть: название доски и поиск */}
          <div className="flex items-center" style={{ gap: 'clamp(6px, 0.8vw, 10px)' }}>
            {/* Название доски */}
            <div
              className="font-bold text-white"
              style={{
                fontSize: 'clamp(20px, 2.5vw, 24px)',
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
                className="text-white placeholder:text-gray-400 placeholder:font-normal outline-none"
                style={{
                  width: 'clamp(500px, 35vw, 640px)',
                  height: 'clamp(50px, 6vw, 54px)',
                  borderRadius: '32px',
                  border: '1px solid #1E80D9',
                  backgroundColor: '#242528',
                  paddingLeft: 'clamp(30px, 4vw, 40px)',
                  paddingRight: 'clamp(30px, 4vw, 40px)',
                  fontSize: 'clamp(14px, 1.8vw, 18px)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              />
            </div>
          </div>

          {/* Правая часть: кнопка добавления колонки, участники, выбор проекта и аватар */}
          <div className="flex items-center" style={{ gap: 'clamp(8px, 1.5vw, 16px)', marginLeft: 'clamp(16px, 2vw, 24px)' }}>
            {/* Кнопка добавления колонки */}
            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="text-white font-medium"
              style={{
                padding: 'clamp(8px, 1vw, 12px) clamp(16px, 2vw, 24px)',
                borderRadius: '32px',
                backgroundColor: '#1E80D9',
                fontSize: 'clamp(14px, 1.5vw, 18px)',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#166BB7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1E80D9';
              }}
            >
              Добавить колонку
            </button>

            {/* Участники проекта */}
            <ProjectMembersList
              members={projectMembers}
              currentUserId={user?.id}
              currentUserRole={currentUserRole}
              onDeleteMember={handleDeleteMember}
              onAddMember={() => setShowAddMemberModal(true)}
            />

            {/* Выпадающий список проектов */}
            {project && (
              <div style={{ marginLeft: 'clamp(12px, 2vw, 20px)' }}>
                <ProjectSelectorDropdown
                  currentProjectId={projectId}
                  currentProjectName={project.name}
                />
              </div>
            )}

            {/* Аватар пользователя с ролью - круглый, в правом углу */}
            {user && (
              <div className="flex items-center" style={{ gap: 'clamp(8px, 1vw, 12px)', marginLeft: 'clamp(12px, 2vw, 20px)' }}>
                {currentUserRole && (
                  <div
                    style={{
                      color: '#FFFFFF',
                      fontSize: 'clamp(10px, 1.2vw, 12px)',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {currentUserRole === 'OWNER' ? 'Владелец' : 'Участник'}
                  </div>
                )}
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="cursor-pointer transition-transform duration-300 hover:scale-110"
                  style={{
                    width: 'clamp(50px, 6vw, 70px)',
                    height: 'clamp(50px, 6vw, 70px)',
                    minWidth: 'clamp(50px, 6vw, 70px)',
                    minHeight: 'clamp(50px, 6vw, 70px)',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    flexShrink: 0,
                    aspectRatio: '1 / 1',
                    padding: 0,
                  }}
                  title={user.name || user.email}
                >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    style={{
                      borderRadius: '50%',
                      border: '2px solid #1E80D9',
                      boxShadow: '0 0 20px rgba(30, 128, 217, 0.5)',
                      display: 'block',
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-white font-bold"
                    style={{
                      borderRadius: '50%',
                      backgroundColor: '#1E80D9',
                      border: '2px solid #1E80D9',
                      fontSize: 'clamp(24px, 3vw, 36px)',
                      boxShadow: '0 0 20px rgba(30, 128, 217, 0.5)',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Ошибки с автоскрытием */}
      <ErrorDisplay error={tasksError || statusesError} />

      {/* Колонки - с отступом сверху для фиксированного header */}
      <div
        ref={columnsContainerRef}
        className="flex items-start"
        style={{
          padding: 'clamp(40px, 5vw, 55px)',
          paddingTop: `calc(clamp(10px, 1.5vw, 15px) + clamp(120px, 15vh, 148px))`,
          gap: 'clamp(20px, 3vw, 30px)',
          minHeight: 'calc(100vh - clamp(120px, 15vh, 148px))',
          overflowX: 'auto',
          overflowY: 'visible',
        }}
      >
        {!loadingStatuses && statuses.length === 0 && (
          <div className="flex flex-col items-center justify-center w-full" style={{ gap: '20px', padding: '40px' }}>
            <div className="text-[#A1A1A4]" style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}>
              Колонки не найдены. Создайте первую колонку.
            </div>
            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="text-white font-medium"
              style={{
                padding: 'clamp(12px, 1.5vw, 16px) clamp(24px, 3vw, 32px)',
                borderRadius: '32px',
                backgroundColor: '#1E80D9',
                fontSize: 'clamp(16px, 2vw, 20px)',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#166BB7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1E80D9';
              }}
            >
              Создать колонку
            </button>
          </div>
        )}

        {!loadingStatuses && statuses.map((status) => (
          <div
            key={status.id}
            className="flex-1 flex flex-col"
            style={{
              minWidth: 'clamp(320px, 28vw, 400px)',
              maxWidth: 'clamp(320px, 28vw, 400px)',
            }}
          >
            {/* Название колонки с кнопкой удаления */}
            <div
              className="flex items-center justify-between mb-4"
              style={{
                paddingLeft: 'clamp(10px, 1.5vw, 20px)',
                paddingRight: 'clamp(10px, 1.5vw, 20px)',
              }}
            >
              <div
                className="text-white font-normal"
                style={{
                  fontSize: 'clamp(20px, 2.5vw, 24px)',
                }}
              >
                {status.name}
              </div>
              <button
                onClick={() => setDeleteStatusId(status.id)}
                className="text-white hover:text-[#FD5353] transition-colors"
                style={{
                  width: '28px',
                  height: '28px',
                  fontSize: '20px',
                  lineHeight: '1',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                }}
                title="Удалить колонку"
              >
                ×
              </button>
            </div>

            {/* Колонка с задачами */}
            <div
              className="flex flex-col"
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                setDragOverStatusId(status.id);
              }}
              onDragLeave={() => {
                setDragOverStatusId(null);
              }}
              onDrop={async (e) => {
                e.preventDefault();
                setDragOverStatusId(null);
                const taskId = e.dataTransfer.getData('text/plain');
                if (taskId) {
                  const draggedTask = tasks.find((t) => t.id === taskId);
                  if (draggedTask && draggedTask.status_id !== status.id) {
                    try {
                      await moveTaskApi(taskId, status.id);
                      await reloadTasks();
                    } catch (err) {
                      console.error('Ошибка перемещения задачи:', err);
                      const message = err instanceof Error ? err.message : 'Ошибка перемещения задачи';
                      alert(message);
                    }
                  }
                }
                setDraggedTaskId(null);
              }}
              style={{
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: dragOverStatusId === status.id ? '#FF8800' : '#1E80D9',
                borderRadius: '50px',
                padding: 'clamp(20px, 3vw, 30px)',
                minHeight: 'clamp(400px, 50vh, 600px)',
                transition: 'border-color 0.2s ease',
              }}
            >
              {/* Задачи */}
              <div>
                {(tasksByStatus[status.id] || []).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleOpenModal}
                    onDelete={(taskId) => setDeleteTaskId(taskId)}
                    tags={tags}
                    onDragStart={setDraggedTaskId}
                    onDragEnd={() => setDraggedTaskId(null)}
                    isDragging={draggedTaskId === task.id}
                    refreshKey={checklistRefreshKey ?? 0}
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
          // Обновляем ключ для обновления чеклистов в карточках задач
          setChecklistRefreshKey(prev => prev + 1);
        }}
        onSave={handleSaveTask}
        statuses={statuses}
        task={modalTask}
        isSaving={false}
        defaultStatusId={selectedStatusId}
        projectMembers={projectMembers}
        tags={tags}
        onChecklistChange={() => {
          // Обновляем ключ для обновления чеклистов в карточках задач после изменений
          setChecklistRefreshKey(prev => prev + 1);
        }}
      />

      <StatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onSave={handleCreateStatus}
        isSaving={false}
        defaultPosition={statuses.length}
      />

      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteStatusId}
        onClose={() => setDeleteStatusId(null)}
        onConfirm={() => deleteStatusId && handleDeleteStatus(deleteStatusId)}
        title="Удалить колонку?"
        message="Вы уверены, что хотите удалить эту колонку? Все задачи в ней будут удалены."
      />

      <ConfirmDeleteModal
        isOpen={!!deleteTaskId}
        onClose={() => setDeleteTaskId(null)}
        onConfirm={() => deleteTaskId && handleDeleteTask(deleteTaskId)}
        title="Удалить задачу?"
        message="Вы уверены, что хотите удалить эту задачу?"
      />

      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        projectId={projectId || ''}
        existingMemberIds={projectMembers.map(m => m.id)}
        onMemberAdded={() => {
          reloadMembers();
        }}
      />

    </div>
  );
}
