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
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);
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
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 font-montserrat"
      style={{
        animation: 'fadeIn 0.3s ease-in-out',
      }}
      onClick={onClose}
    >
      <div
        className="bg-[#242528] border-2 border-[#1E80D9] rounded-3xl p-8 sm:p-10 md:p-12 relative"
        style={{
          width: '100%',
          maxWidth: '600px',
          minWidth: '320px',
          margin: '20px',
          animation: 'fadeIn 0.3s ease-in-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <h2
          className="font-bold leading-tight mb-8 text-center"
          style={{
            fontSize: 'clamp(36px, 4vw, 48px)',
            color: '#FF8800',
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
        <div className="mb-6">
          <div
            className="text-white mb-4"
            style={{
              fontSize: 'clamp(20px, 2.5vw, 28px)',
            }}
          >
            <strong style={{ color: '#1E80D9' }}>Email:</strong> {user.email}
          </div>
          <div
            className="text-white mb-4"
            style={{
              fontSize: 'clamp(20px, 2.5vw, 28px)',
            }}
          >
            <strong style={{ color: '#1E80D9' }}>ID:</strong>{' '}
            <span style={{ fontSize: 'clamp(16px, 2vw, 22px)' }}>{user.id}</span>
          </div>
        </div>

        {/* Форма редактирования */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border-2 border-white text-white leading-tight placeholder:text-gray-300 placeholder:font-light outline-none focus:ring-4 focus:ring-[#1E80D9] focus:border-[#1E80D9] transition-all duration-200"
            style={{
              height: 'clamp(60px, 7vw, 80px)',
              borderRadius: '9999px',
              fontSize: 'clamp(24px, 2.5vw, 32px)',
              paddingLeft: 'clamp(32px, 4vw, 48px)',
              paddingRight: 'clamp(32px, 4vw, 48px)',
              backgroundColor: '#2A2D31',
              marginBottom: '20px',
            }}
          />

          <input
            type="url"
            placeholder="URL аватара (необязательно)"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="w-full border-2 border-white text-white leading-tight placeholder:text-gray-300 placeholder:font-light outline-none focus:ring-4 focus:ring-[#1E80D9] focus:border-[#1E80D9] transition-all duration-200"
            style={{
              height: 'clamp(60px, 7vw, 80px)',
              borderRadius: '9999px',
              fontSize: 'clamp(24px, 2.5vw, 32px)',
              paddingLeft: 'clamp(32px, 4vw, 48px)',
              paddingRight: 'clamp(32px, 4vw, 48px)',
              backgroundColor: '#2A2D31',
            }}
          />
        </div>

        {/* Сообщения */}
        {error && (
          <div
            className="text-[#FD5353] mb-4 text-center"
            style={{
              fontSize: 'clamp(18px, 2vw, 24px)',
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="text-[#62C53E] mb-4 text-center"
            style={{
              fontSize: 'clamp(18px, 2vw, 24px)',
            }}
          >
            {success}
          </div>
        )}

        {/* Кнопки */}
        <div className="flex flex-col items-center" style={{ gap: 'clamp(16px, 2vw, 24px)' }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="text-white font-medium leading-tight lowercase disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              width: '100%',
              maxWidth: '400px',
              height: 'clamp(70px, 8vw, 90px)',
              borderRadius: '9999px',
              backgroundColor: '#FF8800',
              fontSize: 'clamp(28px, 3vw, 40px)',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#E67700';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 136, 0, 0.6)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#FF8800';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            {loading ? 'Сохранение...' : 'Сохранить изменения'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="text-white font-medium leading-tight lowercase"
            style={{
              width: '100%',
              maxWidth: '400px',
              height: 'clamp(70px, 8vw, 90px)',
              borderRadius: '9999px',
              backgroundColor: '#606060',
              fontSize: 'clamp(28px, 3vw, 40px)',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease, transform 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#505050';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#606060';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Закрыть
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="text-white font-medium leading-tight lowercase"
            style={{
              width: '100%',
              maxWidth: '400px',
              height: 'clamp(70px, 8vw, 90px)',
              borderRadius: '9999px',
              backgroundColor: '#FD5353',
              fontSize: 'clamp(28px, 3vw, 40px)',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease, transform 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E04444';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FD5353';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}

