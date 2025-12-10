import { useEffect, useMemo, useState } from 'react';
import { useUsers } from '@entities/users/useUsers';

const priorityOptions = [
  { value: 'HIGH', label: 'Высокий' },
  { value: 'MEDIUM', label: 'Средний' },
  { value: 'LOW', label: 'Низкий' },
];

const defaultForm = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  status_id: '',
  reporter_id: '',
  assignee_id: '',
  due_date: '',
  tag_ids: '',
  comment: '',
};

function TaskModal({ isOpen, onClose, onSave, statuses = [], task, isSaving }) {
  const [form, setForm] = useState(defaultForm);
  const { users, loading: usersLoading } = useUsers({ limit: 50 });

  const firstStatusId = useMemo(
    () => (statuses.length > 0 ? statuses[0].id : ''),
    [statuses]
  );

  useEffect(() => {
    if (!isOpen) return;

    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'MEDIUM',
        status_id: task.status_id || firstStatusId,
        reporter_id: task.reporter_id || '',
        assignee_id: task.assignee_id || '',
        due_date: task.due_date ? task.due_date.slice(0, 10) : '',
        tag_ids: Array.isArray(task.tag_ids) ? task.tag_ids.join(', ') : '',
        comment: '',
      });
    } else {
      setForm({ ...defaultForm, status_id: firstStatusId });
    }
  }, [task, firstStatusId, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const statusId = form.status_id || firstStatusId;
    if (!statusId) {
      alert('Выберите колонку (статус) для задачи');
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority || 'MEDIUM',
      status_id: statusId,
      reporter_id: form.reporter_id || null,
      assignee_id: form.assignee_id || null,
      due_date: form.due_date || null,
    };

    const tags = form.tag_ids
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (tags.length) {
      payload.tag_ids = tags;
    }

    if (form.comment.trim()) {
      payload.comment = form.comment.trim();
    }

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-full max-w-2xl bg-[#242528] border border-[#1E80D9] rounded-3xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">
              {task ? 'Редактировать задачу' : 'Новая задача'}
            </h2>
            <p className="text-sm text-[#A1A1A4]">
              Заполните поля и нажмите «Сохранить»
            </p>
          </div>
          <button
            className="text-[#A1A1A4] hover:text-white"
            onClick={onClose}
            type="button"
          >
            Закрыть
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-[#A1A1A4]">Название</label>
              <input
                className="w-full bg-[#313236] border border-[#1E80D9] rounded-xl px-4 py-2 text-sm focus:outline-none"
                placeholder="Например: сверстать форму"
                value={form.title}
                onChange={handleChange('title')}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[#A1A1A4]">Статус</label>
              <select
                className="w-full bg-[#313236] border border-[#1E80D9] rounded-xl px-4 py-2 text-sm focus:outline-none"
                value={form.status_id || firstStatusId}
                onChange={handleChange('status_id')}
              >
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[#A1A1A4]">Описание</label>
            <textarea
              className="w-full bg-[#313236] border border-[#1E80D9] rounded-xl px-4 py-2 text-sm focus:outline-none min-h-[100px]"
              placeholder="Коротко опишите задачу"
              value={form.description}
              onChange={handleChange('description')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-[#A1A1A4]">Исполнитель</label>
              <select
                className="w-full bg-[#313236] border border-[#1E80D9] rounded-xl px-4 py-2 text-sm focus:outline-none"
                value={form.assignee_id}
                onChange={handleChange('assignee_id')}
              >
                <option value="">Не выбран</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email} {user.name ? `(${user.name})` : ''}
                  </option>
                ))}
              </select>
              {usersLoading && (
                <div className="text-xs text-[#A1A1A4]">Загружаем пользователей...</div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[#A1A1A4]">Автор</label>
              <select
                className="w-full bg-[#313236] border border-[#1E80D9] rounded-xl px-4 py-2 text-sm focus:outline-none"
                value={form.reporter_id}
                onChange={handleChange('reporter_id')}
              >
                <option value="">Не выбран</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email} {user.name ? `(${user.name})` : ''}
                  </option>
                ))}
              </select>
              {usersLoading && (
                <div className="text-xs text-[#A1A1A4]">Загружаем пользователей...</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-[#A1A1A4]">Приоритет</label>
              <select
                className="w-full bg-[#313236] border border-[#1E80D9] rounded-xl px-4 py-2 text-sm focus:outline-none"
                value={form.priority}
                onChange={handleChange('priority')}
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[#A1A1A4]">Дедлайн</label>
              <input
                type="date"
                className="w-full bg-[#313236] border border-[#1E80D9] rounded-xl px-4 py-2 text-sm focus:outline-none"
                value={form.due_date}
                onChange={handleChange('due_date')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[#A1A1A4]">Теги (через запятую)</label>
              <input
                className="w-full bg-[#313236] border border-[#1E80D9] rounded-xl px-4 py-2 text-sm focus:outline-none"
                value={form.tag_ids}
                onChange={handleChange('tag_ids')}
                placeholder="например: ui, backend"
              />
              <div className="text-xs text-[#A1A1A4]">
                До появления справочника используйте произвольные метки.
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[#A1A1A4]">Комментарий</label>
            <textarea
              className="w-full bg-[#313236] border border-[#1E80D9] rounded-xl px-4 py-2 text-sm focus:outline-none min-h-[80px]"
              placeholder="Оставьте комментарий к задаче"
              value={form.comment}
              onChange={handleChange('comment')}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              className="px-4 py-2 text-sm rounded-xl border border-[#1E80D9] hover:bg-[#313236] transition"
              onClick={onClose}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-sm rounded-xl bg-[#FF8800] hover:bg-[#e67800] transition disabled:opacity-60"
            >
              {isSaving ? 'Сохраняем...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;