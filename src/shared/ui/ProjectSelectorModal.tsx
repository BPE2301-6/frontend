import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsApi } from '@shared/api/projects';
import { projectMembersApi } from '@shared/api/projectMembers';
import { Project, ProjectRole } from '@shared/api/types';
import { useAuthStore } from '@entities/auth/useAuthStore';

interface ProjectSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProjectId: string | null;
}

interface ProjectWithRole extends Project {
  userRole?: ProjectRole;
}

export default function ProjectSelectorModal({
  isOpen,
  onClose,
  currentProjectId,
}: ProjectSelectorModalProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<ProjectWithRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !user) {
      setProjects([]);
      setError('');
      return;
    }

    const loadProjects = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await projectsApi.list({ limit: 50 });
        const allProjects = response.items || [];
        
        // Для каждого проекта проверяем, является ли пользователь участником
        const projectsWithRoles: ProjectWithRole[] = [];
        
        for (const project of allProjects) {
          try {
            // Если пользователь является создателем проекта (lead_id), он автоматически OWNER
            if (project.lead_id === user.id) {
              projectsWithRoles.push({
                ...project,
                userRole: 'OWNER',
              });
              continue;
            }
            
            // Иначе проверяем список участников
            const members = await projectMembersApi.list(project.id);
            const userMember = members.find(m => m.user_id === user.id);
            
            // Добавляем проект только если пользователь является MEMBER или OWNER
            if (userMember && (userMember.role === 'MEMBER' || userMember.role === 'OWNER')) {
              projectsWithRoles.push({
                ...project,
                userRole: userMember.role,
              });
            }
          } catch (err) {
            // Если не удалось получить участников, но пользователь является создателем, добавляем как OWNER
            if (project.lead_id === user.id) {
              projectsWithRoles.push({
                ...project,
                userRole: 'OWNER',
              });
            } else {
              console.error(`Ошибка загрузки участников проекта ${project.id}:`, err);
            }
          }
        }
        
        setProjects(projectsWithRoles);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки проектов');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [isOpen, user]);

  // Автоскрытие ошибок
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSelectProject = (projectId: string) => {
    navigate(`/board?projectId=${projectId}`);
    onClose();
  };

  const handleCreateProject = () => {
    navigate('/projects');
    onClose();
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
          className="font-bold text-white mb-12 text-center"
          style={{
            fontSize: 'clamp(20px, 2.5vw, 24px)',
          }}
        >
          Выбор проекта
        </h2>

        {/* Сообщение об ошибке */}
        {error && (
          <div
            className="text-[#FD5353] mb-10 text-center"
            style={{
              fontSize: 'clamp(14px, 1.8vw, 18px)',
            }}
          >
            {error}
          </div>
        )}

        {/* Список проектов */}
        <div className="mb-12" style={{ maxHeight: '400px', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {loading ? (
            <div className="text-[#A1A1A4] text-center" style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}>
              Загрузка...
            </div>
          ) : projects.length === 0 ? (
            <div className="text-[#A1A1A4] text-center" style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}>
              Проекты не найдены
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0', border: '1px solid #404040', borderRadius: '15px', overflow: 'hidden' }}>
              {/* Кнопка создания проекта */}
              <button
                onClick={handleCreateProject}
                className="w-full text-left transition-colors"
                style={{
                  borderBottom: projects.length > 0 ? '1px solid #404040' : 'none',
                  padding: 'clamp(12px, 1.5vw, 16px)',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#313236';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div className="flex items-center" style={{ gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#1E80D9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontWeight: 'bold',
                      fontSize: '24px',
                      flexShrink: 0,
                    }}
                  >
                    +
                  </div>
                  <div className="text-white font-medium" style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}>
                    Создать новый проект
                  </div>
                </div>
              </button>

              {/* Список проектов */}
              {projects.map((proj, index) => (
                <button
                  key={proj.id}
                  onClick={() => handleSelectProject(proj.id)}
                  className="w-full text-left transition-colors"
                  style={{
                    borderBottom: index < projects.length - 1 ? '1px solid #404040' : 'none',
                    padding: 'clamp(12px, 1.5vw, 16px)',
                    backgroundColor: proj.id === currentProjectId ? '#313236' : 'transparent',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (proj.id !== currentProjectId) {
                      e.currentTarget.style.backgroundColor = '#313236';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (proj.id !== currentProjectId) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div className="flex items-center" style={{ gap: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: proj.id === currentProjectId ? '#1E80D9' : '#404040',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        fontWeight: 'bold',
                        fontSize: 'clamp(16px, 2vw, 18px)',
                        flexShrink: 0,
                      }}
                    >
                      {proj.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-white font-medium" style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}>
                          {proj.name}
                        </div>
                        {proj.userRole && (
                          <div
                            style={{
                              color: '#FFFFFF',
                              fontSize: 'clamp(10px, 1.2vw, 12px)',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                            }}
                          >
                            {proj.userRole === 'OWNER' ? 'Владелец' : 'Участник'}
                          </div>
                        )}
                      </div>
                      {proj.key && (
                        <div className="text-[#838486]" style={{ fontSize: 'clamp(14px, 1.5vw, 16px)' }}>
                          {proj.key}
                        </div>
                      )}
                    </div>
                    {proj.id === currentProjectId && (
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#1E80D9',
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Кнопка закрытия */}
        <div className="flex justify-center" style={{ marginTop: 'clamp(40px, 5vw, 55px)' }}>
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

