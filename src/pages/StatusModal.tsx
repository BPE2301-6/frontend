import { useState, FormEvent, ChangeEvent } from 'react';
import { StatusCreatePayload } from '@shared/api/types';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: StatusCreatePayload) => Promise<void>;
  isSaving: boolean;
  defaultPosition?: number;
}

export default function StatusModal({ isOpen, onClose, onSave, isSaving, defaultPosition = 0 }: StatusModalProps) {
  const [name, setName] = useState('');
  const [hasLimit, setHasLimit] = useState(false);
  const [limit, setLimit] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Введите название колонки');
      return;
    }

    const payload: StatusCreatePayload = {
      name: name.trim(),
      position: defaultPosition,
      is_closed: false,
    };

    try {
      await onSave(payload);
      // Очищаем форму только после успешного сохранения
      setName('');
      setHasLimit(false);
      setLimit('');
    } catch (error) {
      // Ошибка уже обработана в handleCreateStatus
      // Не очищаем форму, чтобы пользователь мог исправить данные
    }
  };

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
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <h2
          className="font-bold text-white mb-6"
          style={{
            fontSize: 'clamp(20px, 2.5vw, 24px)',
          }}
        >
          Добавить колонку
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Название */}
          <div>
            <label
              className="block text-white font-medium mb-2"
              style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}
            >
              название
            </label>
            <input
              type="text"
              className="w-full text-white placeholder:text-gray-400 outline-none"
              style={{
                backgroundColor: '#313236',
                borderRadius: '15px',
                padding: 'clamp(10px, 1.5vw, 12px) clamp(16px, 2vw, 20px)',
                fontSize: 'clamp(16px, 2vw, 20px)',
                border: 'none',
              }}
              placeholder="Название колонки"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Ограничение по количеству */}
          <div>
            <label
              className="block text-white font-medium mb-3"
              style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}
            >
              ограничение по количеству
            </label>
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setHasLimit(true)}
                className="text-white font-medium"
                style={{
                  width: 'clamp(100px, 12vw, 129px)',
                  height: 'clamp(35px, 4vw, 40px)',
                  borderRadius: '15px',
                  backgroundColor: hasLimit ? '#1E80D9' : '#313236',
                  fontSize: 'clamp(16px, 2vw, 20px)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                }}
              >
                да
              </button>
              <button
                type="button"
                onClick={() => {
                  setHasLimit(false);
                  setLimit('');
                }}
                className="text-white font-medium"
                style={{
                  width: 'clamp(100px, 12vw, 129px)',
                  height: 'clamp(35px, 4vw, 40px)',
                  borderRadius: '15px',
                  backgroundColor: !hasLimit ? '#1E80D9' : '#313236',
                  fontSize: 'clamp(16px, 2vw, 20px)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                }}
              >
                нет
              </button>
            </div>
          </div>

          {/* Количество */}
          {hasLimit && (
            <div>
              <label
                className="block text-white font-medium mb-2"
                style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}
              >
                количество
              </label>
              <input
                type="number"
                min="1"
                className="w-full text-white placeholder:text-gray-400 outline-none"
                style={{
                  backgroundColor: '#313236',
                  borderRadius: '15px',
                  padding: 'clamp(10px, 1.5vw, 12px) clamp(16px, 2vw, 20px)',
                  fontSize: 'clamp(16px, 2vw, 20px)',
                  border: 'none',
                }}
                placeholder="Количество задач"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              />
            </div>
          )}

          {/* Кнопки */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="text-white font-bold"
              style={{
                width: 'clamp(100px, 12vw, 122px)',
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
                width: 'clamp(100px, 12vw, 122px)',
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

