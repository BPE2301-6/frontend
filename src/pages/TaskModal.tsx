import { useEffect, useMemo, useState, ChangeEvent, FormEvent } from 'react';
import { useAuthStore } from '@entities/auth/useAuthStore';
import { Task, Status, TaskCreatePayload, User } from '@shared/api/types';
import { checklistsApi, Checklist, ChecklistItem } from '@shared/api/checklists';
import { ApiError } from '@shared/api/httpClient';

const PRIORITY_COLOR: Record<string, string> = {
  HIGH: '#FD5353',
  MEDIUM: '#FDD253',
  LOW: '#62C53E',
};

interface TaskForm {
  title: string;
  description: string;
  priority: string;
  status_id: string;
  reporter_id: string;
  assignee_id: string;
  due_date: string;
  tag_ids: string;
}

const defaultForm: TaskForm = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  status_id: '',
  reporter_id: '',
  assignee_id: '',
  due_date: '',
  tag_ids: '',
};

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: TaskCreatePayload, tagNames?: string) => void;
  statuses: Status[];
  task: Task | null;
  isSaving: boolean;
  defaultStatusId?: string | null;
  projectMembers?: User[];
  tags?: Array<{ id: string; name: string }>;
}

export default function TaskModal({ isOpen, onClose, onSave, statuses = [], task, isSaving, defaultStatusId, projectMembers = [], tags = [] }: TaskModalProps) {
  const [form, setForm] = useState<TaskForm>(defaultForm);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [checklistItems, setChecklistItems] = useState<Record<string, ChecklistItem[]>>({});
  const [loadingChecklists, setLoadingChecklists] = useState(false);
  const [newItemContent, setNewItemContent] = useState<Record<string, string>>({});
  const { user } = useAuthStore();

  const firstStatusId = useMemo(
    () => (statuses.length > 0 ? statuses[0].id : ''),
    [statuses]
  );

  // Загрузка чеклистов для задачи
  const loadChecklists = async (taskId: string) => {
    setLoadingChecklists(true);
    try {
      const loadedChecklists = await checklistsApi.list(taskId);
      setChecklists(loadedChecklists);
      
      // Загружаем элементы для каждого чеклиста
      const itemsMap: Record<string, ChecklistItem[]> = {};
      for (const checklist of loadedChecklists) {
        const items = await checklistsApi.getItems(checklist.id);
        itemsMap[checklist.id] = items;
      }
      setChecklistItems(itemsMap);
    } catch (error) {
      console.error('Ошибка загрузки чеклистов:', error);
    } finally {
      setLoadingChecklists(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setChecklists([]);
      setChecklistItems({});
      setNewItemContent({});
      return;
    }

    // Загружаем чеклисты для существующей задачи
    if (task?.id) {
      // Преобразуем ID тегов в названия для отображения
      const tagNames = Array.isArray(task.tag_ids) 
        ? task.tag_ids
            .map((tagId) => {
              const tag = tags.find((t) => t.id === tagId);
              return tag ? tag.name : '';
            })
            .filter(Boolean)
            .join(', ')
        : '';
      
      setForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'MEDIUM',
        status_id: task.status_id || firstStatusId,
        reporter_id: task.reporter_id || '',
        assignee_id: task.assignee_id || '',
        due_date: task.due_date ? task.due_date.slice(0, 10) : '',
        tag_ids: tagNames,
      });

      // Загружаем чеклисты для существующей задачи
      loadChecklists(task.id);
    } else {
      const statusId = defaultStatusId || firstStatusId;
      setForm({ 
        ...defaultForm, 
        status_id: statusId,
        reporter_id: user?.id || '',
      });
      setChecklists([]);
      setChecklistItems({});
    }
  }, [task, firstStatusId, isOpen, defaultStatusId, user, tags]);

  // Создание нового чеклиста
  const handleCreateChecklist = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!task?.id) return;
    try {
      const newChecklist = await checklistsApi.create(task.id);
      setChecklists([...checklists, newChecklist]);
      setChecklistItems({ ...checklistItems, [newChecklist.id]: [] });
    } catch (error) {
      console.error('Ошибка создания чеклиста:', error);
      const message = 
        (error instanceof ApiError && error.payload?.message) ||
        (error instanceof Error ? error.message : 'Не удалось создать чеклист');
      alert(message);
    }
  };

  // Удаление чеклиста
  const handleDeleteChecklist = async (e: React.MouseEvent, checklistId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm('Удалить чеклист?')) return;
    try {
      await checklistsApi.delete(checklistId);
      // Обновляем состояние после успешного удаления
      setChecklists(prev => prev.filter(c => c.id !== checklistId));
      setChecklistItems(prev => {
        const newItems = { ...prev };
        delete newItems[checklistId];
        return newItems;
      });
    } catch (error) {
      console.error('Ошибка удаления чеклиста:', error);
      const message = 
        (error instanceof ApiError && error.payload?.message) ||
        (error instanceof Error ? error.message : 'Не удалось удалить чеклист');
      alert(message);
    }
  };

  // Создание элемента чеклиста
  const handleCreateItem = async (checklistId: string) => {
    const content = newItemContent[checklistId]?.trim();
    if (!content) return;
    
    try {
      const items = checklistItems[checklistId] || [];
      const newItem = await checklistsApi.createItem(checklistId, {
        content,
        position: items.length,
      });
      setChecklistItems(prev => ({
        ...prev,
        [checklistId]: [...items, newItem],
      }));
      setNewItemContent(prev => ({ ...prev, [checklistId]: '' }));
    } catch (error) {
      console.error('Ошибка создания элемента чеклиста:', error);
      const message = 
        (error instanceof ApiError && error.payload?.message) ||
        (error instanceof Error ? error.message : 'Не удалось создать элемент');
      alert(message);
    }
  };


  // Удаление элемента чеклиста
  const handleDeleteItem = async (e: React.MouseEvent, item: ChecklistItem) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await checklistsApi.deleteItem(item.id);
      // Обновляем состояние после успешного удаления
      setChecklistItems(prev => {
        const items = prev[item.checklist_id] || [];
        return {
          ...prev,
          [item.checklist_id]: items.filter(i => i.id !== item.id),
        };
      });
    } catch (error) {
      console.error('Ошибка удаления элемента:', error);
      const message = 
        (error instanceof ApiError && error.payload?.message) ||
        (error instanceof Error ? error.message : 'Не удалось удалить элемент');
      alert(message);
    }
  };

  if (!isOpen) return null;

  const handleChange = (field: keyof TaskForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const statusId = form.status_id || firstStatusId;
    if (!statusId) {
      alert('Выберите колонку (статус) для задачи');
      return;
    }

    if (!form.title.trim()) {
      alert('Введите название задачи');
      return;
    }

    const payload: TaskCreatePayload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      priority: form.priority as 'HIGH' | 'MEDIUM' | 'LOW',
      status_id: statusId,
      reporter_id: form.reporter_id || user?.id || '',
      assignee_id: form.assignee_id || null,
      due_date: form.due_date || null,
    };

    // Теги передаем отдельно для обработки после создания/обновления задачи
    const tagNames = form.tag_ids.trim();
    onSave(payload, tagNames);
  };

  const priorityColor = PRIORITY_COLOR[form.priority] || PRIORITY_COLOR.MEDIUM;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      onClick={onClose}
    >
      <div
        className="bg-[#242528] border border-[#1E80D9] relative"
        style={{
          width: 'clamp(500px, 50vw, 535px)',
          maxWidth: '90vw',
          borderRadius: '50px',
          padding: 'clamp(30px, 4vw, 40px)',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 10000,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Заголовок */}
        <h2
          className="font-bold text-white mb-8 text-center"
          style={{
            fontSize: 'clamp(20px, 2.5vw, 24px)',
          }}
        >
          {task ? 'Редактировать задачу' : 'Создать задачу'}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Название задачи */}
          <div className="mb-10">
            <input
              type="text"
              className="w-full text-white placeholder:text-gray-400 outline-none"
              style={{
                backgroundColor: '#313236',
                borderRadius: '15px',
                padding: 'clamp(12px, 1.5vw, 16px) clamp(16px, 2vw, 20px)',
                fontSize: 'clamp(16px, 2vw, 20px)',
                border: 'none',
              }}
              placeholder="Название задачи"
              value={form.title}
              onChange={handleChange('title')}
              required
            />
          </div>

          {/* Колонка (Статус) */}
          <div className="mb-10">
            <label
              className="block text-white font-medium mb-4"
              style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}
            >
              Колонка
            </label>
            <select
              className="w-full text-white outline-none"
              style={{
                backgroundColor: '#313236',
                borderRadius: '15px',
                padding: 'clamp(12px, 1.5vw, 16px) clamp(16px, 2vw, 20px)',
                fontSize: 'clamp(16px, 2vw, 20px)',
                border: 'none',
              }}
              value={form.status_id || firstStatusId}
              onChange={handleChange('status_id')}
              required
            >
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          {/* Описание */}
          <div className="mb-10">
            <label
              className="block text-white font-medium mb-4"
              style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}
            >
              Описание
            </label>
            <textarea
              className="w-full text-white placeholder:text-gray-400 outline-none resize-none"
              style={{
                backgroundColor: '#313236',
                borderRadius: '20px',
                padding: 'clamp(12px, 2vw, 16px)',
                fontSize: 'clamp(14px, 1.5vw, 16px)',
                border: 'none',
                minHeight: 'clamp(100px, 12vw, 120px)',
              }}
              placeholder="Описание задачи"
              value={form.description}
              onChange={handleChange('description')}
            />
          </div>

          {/* Приоритет и Исполнитель */}
          <div className="grid grid-cols-2 gap-8 mb-10">
            <div>
              <label
                className="block text-white font-medium mb-4"
                style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}
              >
                Приоритет
              </label>
              <div className="flex items-center gap-3">
                <select
                  className="flex-1 text-white outline-none"
                  style={{
                    backgroundColor: '#313236',
                    borderRadius: '15px',
                    padding: 'clamp(12px, 1.5vw, 16px) clamp(16px, 2vw, 20px)',
                    fontSize: 'clamp(16px, 2vw, 20px)',
                    border: 'none',
                  }}
                  value={form.priority}
                  onChange={handleChange('priority')}
                >
                  <option value="HIGH">Высокий</option>
                  <option value="MEDIUM">Средний</option>
                  <option value="LOW">Низкий</option>
                </select>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: priorityColor,
                    flexShrink: 0,
                  }}
                />
              </div>
            </div>

            <div>
              <label
                className="block text-white font-medium mb-4"
                style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}
              >
                Исполнитель
              </label>
              <select
                className="w-full text-white outline-none"
                style={{
                  backgroundColor: '#313236',
                  borderRadius: '15px',
                  padding: 'clamp(12px, 1.5vw, 16px) clamp(16px, 2vw, 20px)',
                  fontSize: 'clamp(16px, 2vw, 20px)',
                  border: 'none',
                }}
                value={form.assignee_id}
                onChange={handleChange('assignee_id')}
              >
                <option value="">Не выбран</option>
                {projectMembers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || u.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Дедлайн и Теги */}
          <div className="grid grid-cols-2 gap-8 mb-10">
            <div>
              <label
                className="block text-white font-medium mb-4"
                style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}
              >
                Дедлайн
              </label>
              <input
                type="date"
                className="w-full text-white outline-none"
                style={{
                  backgroundColor: '#313236',
                  borderRadius: '15px',
                  padding: 'clamp(12px, 1.5vw, 16px) clamp(16px, 2vw, 20px)',
                  fontSize: 'clamp(16px, 2vw, 20px)',
                  border: 'none',
                }}
                value={form.due_date}
                onChange={handleChange('due_date')}
              />
            </div>

            <div>
              <label
                className="block text-white font-medium mb-4"
                style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}
              >
                Теги
              </label>
              <input
                type="text"
                className="w-full text-white placeholder:text-gray-400 outline-none"
                style={{
                  backgroundColor: '#313236',
                  borderRadius: '15px',
                  padding: 'clamp(12px, 1.5vw, 16px) clamp(16px, 2vw, 20px)',
                  fontSize: 'clamp(16px, 2vw, 20px)',
                  border: 'none',
                }}
                placeholder="Теги через запятую"
                value={form.tag_ids}
                onChange={handleChange('tag_ids')}
              />
            </div>
          </div>

          {/* Чеклисты - показываем только для существующих задач */}
          {task?.id && (
            <div className="mb-10" style={{ marginTop: 'clamp(20px, 2.5vw, 30px)' }}>
              <div className="flex justify-center mb-4">
                <button
                  type="button"
                  onClick={handleCreateChecklist}
                  className="text-white font-medium"
                  style={{
                    padding: 'clamp(10px, 1.2vw, 14px) clamp(20px, 2.5vw, 28px)',
                    borderRadius: '15px',
                    backgroundColor: '#1E80D9',
                    fontSize: 'clamp(14px, 1.8vw, 18px)',
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
                  + Добавить чеклист
                </button>
              </div>

              {loadingChecklists ? (
                <div className="text-[#A1A1A4] text-center p-4" style={{ fontSize: 'clamp(14px, 1.8vw, 16px)' }}>
                  Загрузка чеклистов...
                </div>
              ) : checklists.length === 0 ? (
                <div className="text-[#A1A1A4] text-center p-4" style={{ fontSize: 'clamp(14px, 1.8vw, 16px)' }}>
                  Нет чеклистов
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 1.5vw, 16px)', alignItems: 'center' }}>
                  {checklists.map((checklist) => {
                    const items = checklistItems[checklist.id] || [];
                    const completedCount = items.filter(i => i.is_done).length;
                    const totalCount = items.length;
                    
                    return (
                      <div
                        key={checklist.id}
                        className="bg-[#313236]"
                        style={{
                          borderRadius: '15px',
                          padding: 'clamp(12px, 1.5vw, 16px)',
                          width: '100%',
                          maxWidth: '100%',
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-white font-medium" style={{ fontSize: 'clamp(14px, 1.8vw, 16px)' }}>
                            Чеклист {completedCount}/{totalCount}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteChecklist(e, checklist.id)}
                            className="text-[#FD5353] hover:text-[#FF0000] transition-colors"
                            style={{
                              fontSize: 'clamp(18px, 2.2vw, 22px)',
                              lineHeight: '1',
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              padding: '4px',
                            }}
                            title="Удалить чеклист"
                          >
                            ×
                          </button>
                        </div>

                        {/* Элементы чеклиста - только отображение и удаление, без отметки */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1vw, 10px)', marginBottom: 'clamp(8px, 1vw, 10px)' }}>
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3"
                              style={{
                                padding: 'clamp(6px, 0.8vw, 8px)',
                                borderRadius: '8px',
                                backgroundColor: 'transparent',
                              }}
                            >
                              <span
                                className="flex-1 text-white"
                                style={{
                                  fontSize: 'clamp(14px, 1.8vw, 16px)',
                                  textDecoration: item.is_done ? 'line-through' : 'none',
                                  opacity: item.is_done ? 0.6 : 1,
                                }}
                              >
                                {item.content}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteItem(e, item)}
                                className="text-[#838486] hover:text-[#FD5353] transition-colors"
                                style={{
                                  fontSize: 'clamp(16px, 2vw, 18px)',
                                  lineHeight: '1',
                                  border: 'none',
                                  backgroundColor: 'transparent',
                                  cursor: 'pointer',
                                  padding: '2px 4px',
                                }}
                                title="Удалить элемент"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Поле для добавления нового элемента */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            className="flex-1 text-white placeholder:text-gray-400 outline-none"
                            style={{
                              backgroundColor: '#242528',
                              borderRadius: '8px',
                              padding: 'clamp(8px, 1vw, 10px)',
                              fontSize: 'clamp(14px, 1.8vw, 16px)',
                              border: '1px solid #404040',
                            }}
                            placeholder="Добавить элемент..."
                            value={newItemContent[checklist.id] || ''}
                            onChange={(e) => {
                              setNewItemContent({
                                ...newItemContent,
                                [checklist.id]: e.target.value,
                              });
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleCreateItem(checklist.id);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleCreateItem(checklist.id)}
                            className="text-white font-medium"
                            style={{
                              padding: 'clamp(8px, 1vw, 10px) clamp(12px, 1.5vw, 16px)',
                              borderRadius: '8px',
                              backgroundColor: '#1E80D9',
                              fontSize: 'clamp(12px, 1.5vw, 14px)',
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
                            Добавить
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Кнопки */}
          <div className="flex justify-center" style={{ marginTop: 'clamp(40px, 5vw, 55px)', gap: 'clamp(30px, 4vw, 50px)' }}>
            <button
              type="button"
              onClick={onClose}
              className="text-white font-bold"
              style={{
                width: 'clamp(140px, 16vw, 180px)',
                height: 'clamp(45px, 5.5vw, 54px)',
                borderRadius: '15px',
                backgroundColor: '#838486',
                fontSize: 'clamp(14px, 1.5vw, 16px)',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#6A6A6A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#838486';
              }}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="text-white font-bold disabled:opacity-50"
              style={{
                width: 'clamp(140px, 16vw, 180px)',
                height: 'clamp(45px, 5.5vw, 54px)',
                borderRadius: '15px',
                backgroundColor: '#FF8800',
                fontSize: 'clamp(14px, 1.5vw, 16px)',
                border: 'none',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.backgroundColor = '#E67700';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.backgroundColor = '#FF8800';
                }
              }}
            >
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
