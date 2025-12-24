import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsApi } from '@shared/api/projects';
import { projectMembersApi } from '@shared/api/projectMembers';
import { Project, ProjectRole } from '@shared/api/types';
import { useAuthStore } from '@entities/auth/useAuthStore';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { ApiError } from '@shared/api/httpClient';

interface ProjectSelectorDropdownProps {
  currentProjectId: string | null;
  currentProjectName: string;
}

interface ProjectWithRole extends Project {
  userRole?: ProjectRole;
}

export default function ProjectSelectorDropdown({
  currentProjectId,
  currentProjectName,
}: ProjectSelectorDropdownProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectWithRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
          let userRole: ProjectRole | undefined = undefined;
          
          // Сначала проверяем, является ли пользователь создателем проекта (lead_id)
          if (project.lead_id === user.id) {
            userRole = 'OWNER';
          } else {
            // Иначе проверяем список участников
            try {
              const members = await projectMembersApi.list(project.id);
              const userMember = members.find(m => m.user_id === user.id);
              
              if (userMember && (userMember.role === 'MEMBER' || userMember.role === 'OWNER')) {
                userRole = userMember.role;
              }
            } catch (memberErr) {
              // Если не удалось получить участников, пропускаем проект
              console.error(`Ошибка загрузки участников проекта ${project.id}:`, memberErr);
            }
          }
          
          // Добавляем проект только если определена роль (пользователь является создателем или участником)
          if (userRole) {
            projectsWithRoles.push({
              ...project,
              userRole: userRole,
            });
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

  // Закрытие dropdown при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Автоскрытие ошибок
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSelectProject = async (projectId: string) => {
    if (!user || !user.id) {
      navigate(`/board?projectId=${projectId}`);
      setIsOpen(false);
      return;
    }

    // Проверяем, является ли пользователь участником проекта
    try {
      const members = await projectMembersApi.list(projectId);
      const isMember = members.some(m => m.user_id === user.id);
      
      // Если пользователь не является участником, добавляем его с ролью MEMBER
      if (!isMember) {
        try {
          await projectMembersApi.add(projectId, {
            user_id: user.id,
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
    setIsOpen(false);
  };

  const handleCreateProject = () => {
    navigate('/projects');
    setIsOpen(false);
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await projectsApi.delete(projectId);
      setDeleteProjectId(null);
      
      // Если удаленный проект был текущим, перенаправляем на страницу выбора проектов
      if (projectId === currentProjectId) {
        navigate('/projects');
        setIsOpen(false);
      } else {
        // Обновляем список проектов
        const response = await projectsApi.list({ limit: 50 });
        const allProjects = response.items || [];
        
        const projectsWithRoles: ProjectWithRole[] = [];
        
        for (const project of allProjects) {
          let userRole: ProjectRole | undefined = undefined;
          
          if (project.lead_id === user?.id) {
            userRole = 'OWNER';
          } else {
            try {
              const members = await projectMembersApi.list(project.id);
              const userMember = members.find(m => m.user_id === user?.id);
              
              if (userMember && (userMember.role === 'MEMBER' || userMember.role === 'OWNER')) {
                userRole = userMember.role;
              }
            } catch (memberErr) {
              console.error(`Ошибка загрузки участников проекта ${project.id}:`, memberErr);
            }
          }
          
          if (userRole) {
            projectsWithRoles.push({
              ...project,
              userRole: userRole,
            });
          }
        }
        
        setProjects(projectsWithRoles);
      }
    } catch (err) {
      const message =
        (err instanceof ApiError && err.payload?.message) ||
        (err instanceof Error ? err.message : 'Ошибка удаления проекта');
      setError(message);
      setDeleteProjectId(null);
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Кнопка-триггер */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white font-medium lowercase"
        style={{
          padding: 'clamp(10px, 1.2vw, 14px) clamp(20px, 2.5vw, 28px)',
          borderRadius: '32px',
          backgroundColor: '#1E80D9',
          fontSize: 'clamp(16px, 2vw, 20px)',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#166BB7';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#1E80D9';
        }}
      >
        мои проекты
      </button>

      {/* Выпадающее меню */}
      {isOpen && (
        <div
          className="bg-[#2A2D31] border border-[#404040]"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            minWidth: '280px',
            maxWidth: '400px',
            borderRadius: '15px',
            padding: '8px',
            zIndex: 10000,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            maxHeight: '400px',
            overflowY: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <style>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* Сообщение об ошибке */}
          {error && (
            <div
              className="text-[#FD5353] mb-2 text-center p-2"
              style={{
                fontSize: 'clamp(12px, 1.5vw, 14px)',
              }}
            >
              {error}
            </div>
          )}

          {/* Кнопка создания проекта */}
          <button
            onClick={handleCreateProject}
            className="w-full text-left transition-colors"
            style={{
              padding: 'clamp(10px, 1.2vw, 14px)',
              borderRadius: '10px',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              marginBottom: '4px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#313236';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div className="text-white font-medium" style={{ fontSize: 'clamp(14px, 1.8vw, 16px)' }}>
              добавить проект
            </div>
          </button>

          {/* Разделитель */}
          {projects.length > 0 && (
            <div
              style={{
                height: '1px',
                backgroundColor: '#404040',
                margin: '8px 0',
              }}
            />
          )}

          {/* Список проектов */}
          {loading ? (
            <div className="text-[#A1A1A4] text-center p-2" style={{ fontSize: 'clamp(14px, 1.8vw, 16px)' }}>
              Загрузка...
            </div>
          ) : projects.length === 0 ? (
            <div className="text-[#A1A1A4] text-center p-2" style={{ fontSize: 'clamp(14px, 1.8vw, 16px)' }}>
              Проекты не найдены
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {projects.map((proj) => (
                <button
                  key={proj.id}
                  onClick={() => handleSelectProject(proj.id)}
                  className="w-full text-left transition-colors"
                  style={{
                    padding: 'clamp(10px, 1.2vw, 14px)',
                    borderRadius: '10px',
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
                  <div className="text-white font-medium" style={{ fontSize: 'clamp(14px, 1.8vw, 16px)' }}>
                    {proj.name.toLowerCase()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteProjectId}
        onClose={() => setDeleteProjectId(null)}
        onConfirm={() => deleteProjectId && handleDeleteProject(deleteProjectId)}
        title="Удалить проект?"
        message="Вы уверены, что хотите удалить этот проект? Это действие нельзя отменить. Все участники потеряют доступ к проекту."
      />
    </div>
  );
}

