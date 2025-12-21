import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@entities/projects/useProjects';
import { useAuthStore } from '@entities/auth/useAuthStore';
import { ProjectCreatePayload } from '@shared/api/types';
import { ApiError } from '@shared/api/httpClient';

type ViewMode = 'search' | 'create';

export default function ProjectSelection() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [viewMode, setViewMode] = useState<ViewMode>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({
    key: '',
    name: '',
    description: '',
  });
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const {
    projects,
    loading,
    error,
    setFilters,
    createProject,
    isApiError,
  } = useProjects({ search: searchQuery, limit: 20, offset: 0 });

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFilters({ search: searchQuery, limit: 20, offset: 0 });
  };

  const handleCreateProject = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateError('');

    if (!newProject.key.trim() || !newProject.name.trim()) {
      setCreateError('Заполните все обязательные поля');
      return;
    }

    if (!user) {
      setCreateError('Пользователь не авторизован');
      return;
    }

    try {
      const payload: ProjectCreatePayload = {
        key: newProject.key.trim().toUpperCase(),
        name: newProject.name.trim(),
        description: newProject.description.trim() || null,
        lead_id: user.id,
      };

      const createdProject = await createProject(payload);
      setShowCreateModal(false);
      setNewProject({ key: '', name: '', description: '' });
      navigate(`/board?projectId=${createdProject.id}`);
    } catch (err) {
      const message =
        (isApiError(err) && (err as ApiError).payload?.message) ||
        (err instanceof Error ? err.message : 'Ошибка создания проекта');
      setCreateError(message);
    }
  };

  const handleSelectProject = (projectId: string) => {
    navigate(`/board?projectId=${projectId}`);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setNewProject({ key: '', name: '', description: '' });
    setCreateError('');
  };

  return (
    <>
      <div className="w-full min-h-screen bg-[#242528] flex flex-col items-center justify-start font-montserrat text-center px-4" style={{ paddingTop: 'clamp(60px, 10vh, 120px)' }}>
        {/* Заголовок */}
        <h1
          className="font-bold leading-tight"
          style={{
            fontSize: 'clamp(56px, 7vw, 80px)',
            color: '#FF8800',
            marginBottom: 'clamp(30px, 4vw, 50px)',
          }}
        >
          Проекты
        </h1>

        {/* Кнопки переключения режимов */}
        <div className="flex flex-row items-center justify-center w-full px-4 sm:px-8 mb-8">
          {/* Найти проект - слева, синяя */}
          <button
            onClick={() => {
              setViewMode('search');
              setShowCreateModal(false);
            }}
            className="font-medium leading-tight lowercase text-white flex-shrink-0"
            style={{
              width: 'clamp(180px, 25vw, 425px)',
              height: '80px',
              borderRadius: '9999px',
              backgroundColor: viewMode === 'search' ? '#166BB7' : '#1E80D9',
              boxShadow: viewMode === 'search' ? '0 0 20px rgba(30, 128, 217, 0.6), 0 0 30px rgba(30, 128, 217, 0.4)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
              transform: viewMode === 'search' ? 'scale(1.05)' : 'scale(1)',
              fontSize: 'clamp(28px, 3.5vw, 52px)',
              marginRight: 'clamp(8px, 1vw, 16px)',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
            }}
            onMouseEnter={(e) => {
              if (viewMode !== 'search') {
                e.currentTarget.style.backgroundColor = '#166BB7';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(30, 128, 217, 0.6)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (viewMode !== 'search') {
                e.currentTarget.style.backgroundColor = '#1E80D9';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            найти проект
          </button>

          {/* Создать проект - справа, оранжевая */}
          <button
            onClick={() => {
              setViewMode('create');
              setShowCreateModal(true);
            }}
            className="font-medium leading-tight lowercase text-white flex-shrink-0"
            style={{
              width: 'clamp(200px, 27vw, 434px)',
              height: '80px',
              borderRadius: '9999px',
              backgroundColor: viewMode === 'create' ? '#E67700' : '#FF8800',
              boxShadow: viewMode === 'create' ? '0 0 20px rgba(255, 136, 0, 0.6), 0 0 30px rgba(255, 136, 0, 0.4)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
              transform: viewMode === 'create' ? 'scale(1.05)' : 'scale(1)',
              fontSize: 'clamp(28px, 3.5vw, 52px)',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
            }}
            onMouseEnter={(e) => {
              if (viewMode !== 'create') {
                e.currentTarget.style.backgroundColor = '#E67700';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 136, 0, 0.6)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (viewMode !== 'create') {
                e.currentTarget.style.backgroundColor = '#FF8800';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            создать проект
          </button>
        </div>

        {/* Форма поиска проектов */}
        {viewMode === 'search' && (
          <div
            className="w-full flex flex-col items-center"
            style={{
              maxWidth: '900px',
              animation: 'fadeIn 0.3s ease-in-out',
            }}
          >
            <form
              onSubmit={handleSearch}
              className="flex flex-col items-center w-full mb-8"
              style={{ maxWidth: '750px' }}
            >
              <div className="flex flex-row items-center w-full gap-4">
                <input
                  type="text"
                  placeholder="Поиск проектов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-2 border-white text-white leading-tight placeholder:text-gray-300 placeholder:font-light outline-none focus:ring-4 focus:ring-[#1E80D9] focus:border-[#1E80D9] transition-all duration-200"
                  style={{
                    height: 'clamp(70px, 8vw, 90px)',
                    borderRadius: '9999px',
                    fontSize: 'clamp(28px, 3vw, 36px)',
                    paddingLeft: 'clamp(32px, 4vw, 48px)',
                    paddingRight: 'clamp(32px, 4vw, 48px)',
                    backgroundColor: '#2A2D31',
                    marginBottom: '30px',
                  }}
                />
                <button
                  type="submit"
                  className="text-white font-medium leading-tight lowercase"
                  style={{
                    width: 'clamp(120px, 15vw, 180px)',
                    height: 'clamp(70px, 8vw, 90px)',
                    borderRadius: '9999px',
                    backgroundColor: '#1E80D9',
                    fontSize: 'clamp(24px, 2.5vw, 32px)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
                    marginBottom: '30px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#166BB7';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(30, 128, 217, 0.6)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1E80D9';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Поиск
                </button>
              </div>
            </form>

            {/* Список проектов */}
            {loading && (
              <div
                className="text-white"
                style={{
                  fontSize: 'clamp(24px, 3vw, 36px)',
                  marginTop: '40px',
                }}
              >
                Загрузка проектов...
              </div>
            )}

            {error && (
              <div
                className="text-[#FD5353]"
                style={{
                  fontSize: 'clamp(20px, 2.5vw, 28px)',
                  marginTop: '40px',
                }}
              >
                {error instanceof Error ? error.message : 'Ошибка загрузки проектов'}
              </div>
            )}

            {!loading && !error && projects.length === 0 && (
              <div
                className="text-white"
                style={{
                  fontSize: 'clamp(24px, 3vw, 36px)',
                  marginTop: '40px',
                }}
              >
                Проекты не найдены
              </div>
            )}

            {!loading && !error && projects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 w-full">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleSelectProject(project.id)}
                    className="bg-[#2A2D31] border-2 border-[#1E80D9] rounded-2xl p-6 text-left hover:border-[#FF8800] transition-all duration-300 cursor-pointer"
                    style={{
                      transform: 'scale(1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(30, 128, 217, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div
                      className="font-bold mb-2"
                      style={{
                        fontSize: 'clamp(24px, 3vw, 32px)',
                        color: '#1E80D9',
                      }}
                    >
                      {project.key}
                    </div>
                    <div
                      className="font-semibold mb-2 text-white"
                      style={{
                        fontSize: 'clamp(20px, 2.5vw, 28px)',
                      }}
                    >
                      {project.name}
                    </div>
                    {project.description && (
                      <div
                        className="text-[#A1A1A4]"
                        style={{
                          fontSize: 'clamp(16px, 2vw, 22px)',
                        }}
                      >
                        {project.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Модальное окно создания проекта */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 font-montserrat"
          style={{
            animation: 'fadeIn 0.3s ease-in-out',
          }}
          onClick={handleCloseModal}
        >
          <div
            className="bg-[#242528] border-2 border-[#1E80D9] rounded-3xl p-8 sm:p-10 md:p-12 w-full max-w-4xl mx-4 relative"
            style={{
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Кнопка закрытия */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-white hover:text-[#FF8800] transition-colors duration-200"
              style={{
                fontSize: 'clamp(32px, 4vw, 48px)',
                width: 'clamp(40px, 5vw, 60px)',
                height: 'clamp(40px, 5vw, 60px)',
                lineHeight: '1',
              }}
            >
              ×
            </button>

            {/* Заголовок */}
            <h2
              className="font-bold leading-tight mb-8 text-center"
              style={{
                fontSize: 'clamp(36px, 4vw, 56px)',
                color: '#FF8800',
              }}
            >
              Создать новый проект
            </h2>

            {/* Форма */}
            <form onSubmit={handleCreateProject} className="flex flex-col">
              {/* Поле ключа проекта */}
              <input
                type="text"
                placeholder="Ключ проекта (например: PROJ)"
                value={newProject.key}
                onChange={(e) => setNewProject({ ...newProject, key: e.target.value })}
                required
                className="w-full border-2 border-white text-white leading-tight placeholder:text-gray-300 placeholder:font-light outline-none focus:ring-4 focus:ring-[#1E80D9] focus:border-[#1E80D9] transition-all duration-200"
                style={{
                  height: 'clamp(70px, 8vw, 90px)',
                  borderRadius: '9999px',
                  fontSize: 'clamp(28px, 3vw, 40px)',
                  paddingLeft: 'clamp(32px, 4vw, 48px)',
                  paddingRight: 'clamp(32px, 4vw, 48px)',
                  backgroundColor: '#2A2D31',
                  marginBottom: '30px',
                }}
              />

              {/* Поле названия проекта */}
              <input
                type="text"
                placeholder="Название проекта"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                required
                className="w-full border-2 border-white text-white leading-tight placeholder:text-gray-300 placeholder:font-light outline-none focus:ring-4 focus:ring-[#1E80D9] focus:border-[#1E80D9] transition-all duration-200"
                style={{
                  height: 'clamp(70px, 8vw, 90px)',
                  borderRadius: '9999px',
                  fontSize: 'clamp(28px, 3vw, 40px)',
                  paddingLeft: 'clamp(32px, 4vw, 48px)',
                  paddingRight: 'clamp(32px, 4vw, 48px)',
                  backgroundColor: '#2A2D31',
                  marginBottom: '30px',
                }}
              />

              {/* Поле описания */}
              <textarea
                placeholder="Описание проекта (необязательно)"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="w-full border-2 border-white text-white leading-tight placeholder:text-gray-300 placeholder:font-light outline-none focus:ring-4 focus:ring-[#1E80D9] focus:border-[#1E80D9] transition-all duration-200"
                style={{
                  minHeight: 'clamp(120px, 15vw, 180px)',
                  borderRadius: '9999px',
                  fontSize: 'clamp(24px, 2.5vw, 36px)',
                  padding: 'clamp(24px, 3vw, 40px)',
                  backgroundColor: '#2A2D31',
                  marginBottom: '30px',
                  resize: 'vertical',
                }}
              />

              {/* Сообщение об ошибке */}
              {createError && (
                <div
                  className="text-[#FD5353] mb-6"
                  style={{
                    fontSize: 'clamp(20px, 2.5vw, 28px)',
                  }}
                >
                  {createError}
                </div>
              )}

              {/* Кнопки */}
              <div className="flex flex-row gap-4 justify-center mt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="text-white font-medium leading-tight lowercase"
                  style={{
                    width: 'clamp(180px, 22vw, 280px)',
                    height: 'clamp(70px, 8vw, 90px)',
                    borderRadius: '9999px',
                    backgroundColor: '#606060',
                    fontSize: 'clamp(28px, 3vw, 40px)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
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
                  Отмена
                </button>
                <button
                  type="submit"
                  className="text-white font-medium leading-tight lowercase"
                  style={{
                    width: 'clamp(180px, 22vw, 280px)',
                    height: 'clamp(70px, 8vw, 90px)',
                    borderRadius: '9999px',
                    backgroundColor: '#FF8800',
                    fontSize: 'clamp(28px, 3vw, 40px)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#E67700';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 136, 0, 0.6)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FF8800';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
