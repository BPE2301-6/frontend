import { useState, useEffect } from 'react';
import { useAuthStore } from '@entities/auth/useAuthStore';
import { usersApi } from '@shared/api/users';
import { ApiError } from '@shared/api/httpClient';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user, logout } = useAuthStore();
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || '');
      setAvatarUrl(user.avatar_url || '');
      setError('');
      setSuccess('');
    }
  }, [isOpen, user]);

  // Автоскрытие ошибок и успешных сообщений
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedUser = await usersApi.updateCurrentUser({
        name: name.trim() || undefined,
        avatar_url: avatarUrl.trim() || null,
      });
      
      useAuthStore.getState().setUser(updatedUser);
      setSuccess('Профиль успешно обновлен');
    } catch (err) {
      const message =
        (err instanceof ApiError && err.payload?.message) ||
        (err instanceof Error ? err.message : 'Ошибка обновления профиля');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
    window.location.href = '/';
  };

  if (!isOpen || !user) return null;

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
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE/Edge
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          div::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
          }
        `}</style>

        {/* Заголовок */}
        <h2
          className="font-bold text-white mb-8 text-center"
          style={{
            fontSize: 'clamp(20px, 2.5vw, 24px)',
          }}
        >
          Профиль пользователя
        </h2>

        {/* Аватар */}
        <div className="flex justify-center mb-8">
          <div
            className="rounded-full overflow-hidden border-4 border-[#1E80D9]"
            style={{
              width: 'clamp(120px, 15vw, 180px)',
              height: 'clamp(120px, 15vw, 180px)',
            }}
          >
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white font-bold"
                style={{
                  backgroundColor: '#1E80D9',
                  fontSize: 'clamp(48px, 6vw, 72px)',
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Информация */}
        <div className="mb-10">
          <div
            className="text-white mb-8"
            style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
            }}
          >
            <strong style={{ color: '#1E80D9' }}>Email:</strong> {user.email}
          </div>
        </div>

        {/* Форма редактирования */}
        <div className="mb-10">
          <div className="mb-8">
            <label
              className="block text-white font-medium mb-4"
              style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}
            >
              Имя
            </label>
            <input
              type="text"
              placeholder="Имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-white placeholder:text-gray-400 outline-none"
              style={{
                backgroundColor: '#313236',
                borderRadius: '15px',
                padding: 'clamp(12px, 1.5vw, 16px) clamp(16px, 2vw, 20px)',
                fontSize: 'clamp(16px, 2vw, 20px)',
                border: 'none',
              }}
            />
          </div>

          <div>
            <label
              className="block text-white font-medium mb-4"
              style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}
            >
              URL аватара (необязательно)
            </label>
            <input
              type="url"
              placeholder="URL аватара"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full text-white placeholder:text-gray-400 outline-none"
              style={{
                backgroundColor: '#313236',
                borderRadius: '15px',
                padding: 'clamp(12px, 1.5vw, 16px) clamp(16px, 2vw, 20px)',
                fontSize: 'clamp(16px, 2vw, 20px)',
                border: 'none',
              }}
            />
          </div>
        </div>

        {/* Сообщения */}
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

        {success && (
          <div
            className="text-[#62C53E] mb-6 text-center"
            style={{
              fontSize: 'clamp(14px, 1.8vw, 18px)',
            }}
          >
            {success}
          </div>
        )}

        {/* Кнопки */}
        <div className="flex justify-center gap-8 mt-10">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="text-white font-bold disabled:opacity-50"
            style={{
              width: 'clamp(140px, 16vw, 180px)',
              height: 'clamp(45px, 5.5vw, 54px)',
              borderRadius: '15px',
              backgroundColor: '#FF8800',
              fontSize: 'clamp(14px, 1.5vw, 16px)',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s ease',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#E67700';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#FF8800';
              }
            }}
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>

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
            Закрыть
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="text-white font-bold"
            style={{
              width: 'clamp(140px, 16vw, 180px)',
              height: 'clamp(45px, 5.5vw, 54px)',
              borderRadius: '15px',
              backgroundColor: '#FD5353',
              fontSize: 'clamp(14px, 1.5vw, 16px)',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E04444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FD5353';
            }}
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}
