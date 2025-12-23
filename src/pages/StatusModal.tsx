import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
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
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setError('');
    }
  }, [isOpen]);

  // Автоскрытие ошибок
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Введите название колонки');
      return;
    }

    const payload: StatusCreatePayload = {
      name: name.trim(),
      position: defaultPosition,
      is_closed: false,
    };

    try {
      await onSave(payload);
      setName('');
      setError('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка создания колонки';
      setError(message);
    }
  };

  if (!isOpen) return null;

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
          Добавить колонку
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Название */}
          <div className="mb-8">
            <label
              className="block text-white font-medium mb-4"
              style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}
            >
              Название колонки
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
              placeholder="Название колонки"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Сообщение об ошибке */}
          {error && (
            <div
              className="text-[#FD5353] mb-6 text-center"
              style={{
                fontSize: 'clamp(14px, 1.8vw, 18px)',
              }}
            >
              {error}
            </div>
          )}

          {/* Кнопки */}
          <div className="flex justify-center gap-6 mt-10">
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
