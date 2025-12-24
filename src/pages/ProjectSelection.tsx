import { useState, FormEvent, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@entities/projects/useProjects';
import { useAuthStore } from '@entities/auth/useAuthStore';
import { ProjectCreatePayload } from '@shared/api/types';
import { ApiError } from '@shared/api/httpClient';
import { projectMembersApi } from '@shared/api/projectMembers';

type ViewMode = 'search' | 'create' | null;

export default function ProjectSelection() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [viewMode, setViewMode] = useState<ViewMode>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({
    key: '',
    name: '',
    description: '',
  });
  const [createError, setCreateError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const limit = 10;

  const {
    projects,
    loading,
    error,
    setFilters,
    createProject,
    isApiError,
    pagination,
  } = useProjects({ search: searchQuery, limit, offset: (currentPage - 1) * limit });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Убрано автоматическое перенаправление на первый проект
    // Пользователь может выбрать проект вручную
  }, [isAuthenticated, navigate]);

  // Автоматическое изменение высоты textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [newProject.description]);

  // Сброс высоты textarea при открытии/закрытии модального окна
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      if (showCreateModal) {
        // При открытии устанавливаем минимальную высоту
        textarea.style.height = 'clamp(100px, 12vw, 150px)';
      } else {
        // При закрытии сбрасываем высоту
        textarea.style.height = 'clamp(100px, 12vw, 150px)';
      }
    }
  }, [showCreateModal]);


  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewProject({ ...newProject, description: e.target.value });
    // Автоматическое изменение высоты
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1);
    setFilters({ search: searchQuery, limit, offset: 0 });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setFilters({ search: searchQuery, limit, offset: (page - 1) * limit });
  };

  const totalPages = Math.ceil((pagination.total || 0) / limit);

  const handleCreateProject = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateError('');

    if (!newProject.key.trim() || !newProject.name.trim()) {
      setCreateError('Заполните все обязательные поля');
      return;
    }

    // Используем user из хука, который уже подписан на изменения состояния
    // Также получаем актуальное состояние на случай, если хук не успел обновиться
    const currentUser = user || useAuthStore.getState().user;
    if (!currentUser || !currentUser.id) {
      console.error('User state:', { user, isAuthenticated, storeUser: useAuthStore.getState().user });
      setCreateError('Пользователь не авторизован. Пожалуйста, войдите в систему.');
      return;
    }

    try {
      const payload: ProjectCreatePayload = {
        key: newProject.key.trim().toUpperCase(),
        name: newProject.name.trim(),
        description: newProject.description.trim() || null,
        lead_id: currentUser.id,
      };

      const createdProject = await createProject(payload);
      
      // Добавляем создателя в участники проекта с ролью OWNER
      try {
        await projectMembersApi.add(createdProject.id, {
          user_id: currentUser.id,
          role: 'OWNER',
        });
      } catch (err) {
        // Если не удалось добавить в участники, продолжаем (возможно, уже добавлен)
        console.warn('Не удалось добавить создателя в участники проекта:', err);
      }
      
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

  const handleSelectProject = async (projectId: string) => {
    const currentUser = user || useAuthStore.getState().user;
    if (!currentUser || !currentUser.id) {
      navigate(`/board?projectId=${projectId}`);
      return;
    }

    // Проверяем, является ли пользователь участником проекта
    try {
      const members = await projectMembersApi.list(projectId);
      const isMember = members.some(m => m.user_id === currentUser.id);
      
      // Если пользователь не является участником, добавляем его с ролью MEMBER
      if (!isMember) {
        try {
          await projectMembersApi.add(projectId, {
            user_id: currentUser.id,
            role: 'MEMBER',
          });
        } catch (err) {
          // Если не удалось добавить, продолжаем (возможно, пользователь уже добавлен)
          console.warn('Не удалось добавить пользователя в участники проекта:', err);
        }
      }
    } catch (err) {
      // Если не удалось получить список участников, продолжаем
      console.warn('Не удалось проверить участников проекта:', err);
    }
    
    navigate(`/board?projectId=${projectId}`);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setViewMode(null);
    setNewProject({ key: '', name: '', description: '' });
    setCreateError('');
  };

  const handleCreateButtonClick = () => {
    if (showCreateModal) {
      // Второе нажатие - закрываем модальное окно
      handleCloseModal();
    } else {
      // Первое нажатие - открываем модальное окно
      setViewMode('create');
      setShowCreateModal(true);
    }
  };

  const handleSearchButtonClick = () => {
    if (viewMode === 'search') {
      // Второе нажатие - закрываем форму поиска
      setViewMode(null);
      setSearchQuery('');
      setShowCreateModal(false);
      setCurrentPage(1);
    } else {
      // Первое нажатие - открываем форму поиска
      setViewMode('search');
      setShowCreateModal(false);
      setCurrentPage(1);
      setFilters({ search: '', limit, offset: 0 });
    }
  };

  return (
    <>
      <div className="w-full min-h-screen bg-[#242528] flex flex-col items-center justify-start font-montserrat text-center px-4" style={{ paddingTop: 'clamp(20px, 3vh, 40px)' }}>
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
            onClick={handleSearchButtonClick}
            className="font-medium leading-tight lowercase text-white flex-shrink-0"
            style={{
              width: 'clamp(180px, 25vw, 425px)',
              height: '80px',
              borderRadius: '9999px',
              backgroundColor: viewMode === 'search' ? '#166BB7' : '#1E80D9',
              boxShadow: viewMode === 'search' ? '0 0 20px rgba(30, 128, 217, 0.6), 0 0 30px rgba(30, 128, 217, 0.4)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
              transform: viewMode === 'search' ? 'scale(1.05)' : 'scale(1)',
              fontSize: 'clamp(28px, 3.5vw, 52px)',
              marginRight: 'clamp(24px, 3vw, 40px)',
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
            onClick={handleCreateButtonClick}
            className="font-medium leading-tight lowercase text-white flex-shrink-0"
            style={{
              width: 'clamp(200px, 27vw, 434px)',
              height: '80px',
              borderRadius: '9999px',
              backgroundColor: showCreateModal ? '#E67700' : '#FF8800',
              boxShadow: showCreateModal ? '0 0 20px rgba(255, 136, 0, 0.6), 0 0 30px rgba(255, 136, 0, 0.4)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
              transform: showCreateModal ? 'scale(1.05)' : 'scale(1)',
              fontSize: 'clamp(28px, 3.5vw, 52px)',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
            }}
            onMouseEnter={(e) => {
              if (!showCreateModal) {
                e.currentTarget.style.backgroundColor = '#E67700';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 136, 0, 0.6)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!showCreateModal) {
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
              style={{ maxWidth: '750px', marginTop: '30px' }}
            >
              <div className="flex flex-row items-center w-full" style={{ gap: 'clamp(16px, 2vw, 24px)' }}>
                <input
                  type="text"
                  placeholder="Поиск проектов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-2 border-white text-white leading-tight placeholder:text-gray-400 placeholder:font-normal outline-none focus:ring-4 focus:ring-[#1E80D9] focus:border-[#1E80D9] transition-all duration-200"
                  style={{
                    height: 'clamp(70px, 8vw, 90px)',
                    borderRadius: '9999px',
                    fontSize: 'clamp(14px, 1.8vw, 18px)',
                    paddingLeft: 'clamp(32px, 4vw, 48px)',
                    paddingRight: 'clamp(32px, 4vw, 48px)',
                    backgroundColor: '#2A2D31',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                />
                <button
                  type="submit"
                  className="text-white font-medium leading-tight lowercase"
                  style={{
                    width: 'clamp(180px, 22vw, 280px)',
                    height: 'clamp(70px, 8vw, 90px)',
                    borderRadius: '9999px',
                    backgroundColor: '#1E80D9',
                    fontSize: 'clamp(24px, 2.5vw, 32px)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
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
              <>
                <div 
                  className="w-full"
                  style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: 'clamp(20px, 2.5vw, 32px)',
                    marginTop: 'clamp(24px, 3vw, 32px)',
                    marginBottom: 'clamp(24px, 3vw, 32px)',
                    padding: 'clamp(20px, 2.5vw, 32px)',
                    maxWidth: '100%',
                    direction: 'ltr',
                  }}
                >
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleSelectProject(project.id)}
                      className="bg-[#2A2D31] text-left hover:border-[#FF8800] transition-all duration-300 cursor-pointer"
                      style={{
                        transform: 'scale(1)',
                        border: '3px solid #1E80D9',
                        borderRadius: '16px',
                        padding: 'clamp(12px, 1.5vw, 18px)',
                        width: '100%',
                        minHeight: 'clamp(100px, 12vw, 140px)',
                        maxHeight: 'clamp(100px, 12vw, 140px)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        overflow: 'hidden',
                        maxWidth: '100%',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(30, 128, 217, 0.4)';
                        e.currentTarget.style.borderColor = '#FF8800';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = '#1E80D9';
                      }}
                    >
                    <div
                      className="font-semibold mb-1 text-white"
                      style={{
                        fontSize: 'clamp(14px, 1.5vw, 18px)',
                        lineHeight: '1.3',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {project.name}
                    </div>
                    {project.description && (
                      <div
                        className="text-[#A1A1A4]"
                        style={{
                          fontSize: 'clamp(11px, 1.2vw, 14px)',
                          lineHeight: '1.3',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {project.description}
                      </div>
                    )}
                  </button>
                ))}
                </div>

                {/* Пагинация */}
                {totalPages > 1 && (
                  <div className="flex flex-row items-center justify-center w-full mt-8" style={{ gap: 'clamp(8px, 1vw, 12px)' }}>
                    {/* Кнопка "Назад" */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="text-white font-medium leading-tight lowercase disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        width: 'clamp(100px, 12vw, 140px)',
                        height: 'clamp(60px, 7vw, 80px)',
                        borderRadius: '9999px',
                        backgroundColor: currentPage === 1 ? '#606060' : '#1E80D9',
                        fontSize: 'clamp(20px, 2.5vw, 28px)',
                        border: 'none',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (currentPage !== 1) {
                          e.currentTarget.style.backgroundColor = '#166BB7';
                          e.currentTarget.style.boxShadow = '0 0 15px rgba(30, 128, 217, 0.5)';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentPage !== 1) {
                          e.currentTarget.style.backgroundColor = '#1E80D9';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'scale(1)';
                        }
                      }}
                    >
                      Назад
                    </button>

                    {/* Информация о странице */}
                    <div
                      className="text-white font-medium"
                      style={{
                        fontSize: 'clamp(20px, 2.5vw, 28px)',
                        padding: '0 clamp(16px, 2vw, 24px)',
                      }}
                    >
                      Страница {currentPage} из {totalPages}
                    </div>

                    {/* Кнопка "Вперед" */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="text-white font-medium leading-tight lowercase disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        width: 'clamp(100px, 12vw, 140px)',
                        height: 'clamp(60px, 7vw, 80px)',
                        borderRadius: '9999px',
                        backgroundColor: currentPage === totalPages ? '#606060' : '#1E80D9',
                        fontSize: 'clamp(20px, 2.5vw, 28px)',
                        border: 'none',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (currentPage !== totalPages) {
                          e.currentTarget.style.backgroundColor = '#166BB7';
                          e.currentTarget.style.boxShadow = '0 0 15px rgba(30, 128, 217, 0.5)';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentPage !== totalPages) {
                          e.currentTarget.style.backgroundColor = '#1E80D9';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'scale(1)';
                        }
                      }}
                    >
                      Вперед
                    </button>
                  </div>
                )}
              </>
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
            className="bg-[#242528] border-2 border-[#1E80D9] rounded-3xl p-8 sm:p-10 md:p-12 relative"
            style={{
              width: '100%',
              maxWidth: '1000px',
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
                className="w-full border-2 border-white text-white leading-tight placeholder:text-gray-400 placeholder:font-normal outline-none focus:ring-4 focus:ring-[#1E80D9] focus:border-[#1E80D9] transition-all duration-200 create-project-input"
                style={{
                  height: 'clamp(70px, 8vw, 90px)',
                  borderRadius: '9999px',
                  fontSize: 'clamp(14px, 1.8vw, 18px)',
                  paddingLeft: 'clamp(32px, 4vw, 48px)',
                  paddingRight: 'clamp(32px, 4vw, 48px)',
                  backgroundColor: '#2A2D31',
                  marginBottom: '30px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              />

              {/* Поле названия проекта */}
              <input
                type="text"
                placeholder="Название проекта"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                required
                className="w-full border-2 border-white text-white leading-tight placeholder:text-gray-400 placeholder:font-normal outline-none focus:ring-4 focus:ring-[#1E80D9] focus:border-[#1E80D9] transition-all duration-200 create-project-input"
                style={{
                  height: 'clamp(70px, 8vw, 90px)',
                  borderRadius: '9999px',
                  fontSize: 'clamp(14px, 1.8vw, 18px)',
                  paddingLeft: 'clamp(32px, 4vw, 48px)',
                  paddingRight: 'clamp(32px, 4vw, 48px)',
                  backgroundColor: '#2A2D31',
                  marginBottom: '30px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              />

              {/* Поле описания */}
              <textarea
                ref={textareaRef}
                placeholder="Описание проекта (необязательно)"
                value={newProject.description}
                onChange={handleDescriptionChange}
                className="w-full border-2 border-white text-white leading-tight placeholder:text-gray-400 placeholder:font-normal outline-none focus:ring-4 focus:ring-[#1E80D9] focus:border-[#1E80D9] transition-all duration-200 create-project-input"
                style={{
                  minHeight: 'clamp(100px, 12vw, 150px)',
                  maxHeight: '400px',
                  borderRadius: '9999px',
                  fontSize: 'clamp(14px, 1.8vw, 18px)',
                  padding: 'clamp(24px, 3vw, 36px)',
                  backgroundColor: '#2A2D31',
                  marginBottom: '30px',
                  resize: 'none',
                  overflowY: 'auto',
                  display: 'flex',
                  alignItems: 'center',
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
              <div className="flex flex-row justify-center mt-4" style={{ gap: 'clamp(16px, 2vw, 24px)' }}>
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
        .create-project-input::placeholder {
          font-size: clamp(18px, 2vw, 24px) !important;
        }
      `}</style>
    </>
  );
}
