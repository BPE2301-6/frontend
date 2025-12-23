import { useState, useEffect, FormEvent } from 'react';
import { usersApi } from '@shared/api/users';
import { projectMembersApi } from '@shared/api/projectMembers';
import { User, ProjectRole } from '@shared/api/types';
import { ApiError } from '@shared/api/httpClient';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  existingMemberIds: string[];
  onMemberAdded: () => void;
}

export default function AddMemberModal({
  isOpen,
  onClose,
  projectId,
  existingMemberIds,
  onMemberAdded,
}: AddMemberModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addingUserId, setAddingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setUsers([]);
      setError('');
      return;
    }

    const loadUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await usersApi.list({ search: searchQuery, limit: 50 });
        // Фильтруем пользователей, которые уже в проекте
        const filteredUsers = response.items.filter(
          (user) => !existingMemberIds.includes(user.id)
        );
        setUsers(filteredUsers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки пользователей');
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() || !searchQuery) {
        loadUsers();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [isOpen, searchQuery, existingMemberIds]);

  // Автоскрытие ошибок
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleAddMember = async (userId: string) => {
    setAddingUserId(userId);
    setError('');
    try {
      await projectMembersApi.add(projectId, {
        user_id: userId,
        role: 'MEMBER',
      });
      onMemberAdded();
      onClose();
    } catch (err) {
      const message =
        (err instanceof ApiError && err.payload?.message) ||
        (err instanceof Error ? err.message : 'Ошибка добавления участника');
      setError(message);
    } finally {
      setAddingUserId(null);
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
          Добавить участника
        </h2>

        {/* Поиск */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Поиск пользователей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

        {/* Список пользователей */}
        <div className="mb-8" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {loading ? (
            <div className="text-[#A1A1A4] text-center" style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}>
              Загрузка...
            </div>
          ) : users.length === 0 ? (
            <div className="text-[#A1A1A4] text-center" style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}>
              {searchQuery ? 'Пользователи не найдены' : 'Введите имя или email для поиска'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-[#313236] transition-colors"
                  style={{
                    backgroundColor: '#2A2D31',
                  }}
                >
                  <div className="flex items-center" style={{ gap: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        flexShrink: 0,
                        aspectRatio: '1 / 1',
                      }}
                    >
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '50%',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            backgroundColor: '#1E80D9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF',
                            fontWeight: 'bold',
                            fontSize: '18px',
                          }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-white font-medium" style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}>
                        {user.name || user.email}
                      </div>
                      {user.name && (
                        <div className="text-[#838486]" style={{ fontSize: 'clamp(14px, 1.5vw, 16px)' }}>
                          {user.email}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddMember(user.id)}
                    disabled={addingUserId === user.id}
                    className="text-white font-medium disabled:opacity-50"
                    style={{
                      padding: 'clamp(8px, 1vw, 10px) clamp(16px, 2vw, 20px)',
                      borderRadius: '15px',
                      backgroundColor: '#1E80D9',
                      fontSize: 'clamp(14px, 1.5vw, 16px)',
                      border: 'none',
                      cursor: addingUserId === user.id ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (addingUserId !== user.id) {
                        e.currentTarget.style.backgroundColor = '#166BB7';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (addingUserId !== user.id) {
                        e.currentTarget.style.backgroundColor = '#1E80D9';
                      }
                    }}
                  >
                    {addingUserId === user.id ? 'Добавление...' : 'Добавить'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Кнопка закрытия */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="text-white font-bold"
            style={{
              width: 'clamp(120px, 14vw, 150px)',
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
        </div>
      </div>
    </div>
  );
}

