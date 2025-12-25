import { useState, useEffect, useRef } from 'react';
import { User, ProjectRole } from '@shared/api/types';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface ProjectMembersListProps {
  members: User[];
  currentUserId?: string;
  currentUserRole?: ProjectRole;
  onDeleteMember: (userId: string) => void;
  onAddMember: () => void;
}

export default function ProjectMembersList({
  members,
  currentUserId,
  currentUserRole,
  onDeleteMember,
  onAddMember,
}: ProjectMembersListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Фильтруем участников, исключая текущего пользователя
  const displayMembers = members.filter((m) => m.id !== currentUserId);
  
  // Проверяем, является ли пользователь владельцем
  const isOwner = currentUserRole === 'OWNER';

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

  // Если нет участников и пользователь не владелец, не показываем ничего
  if (displayMembers.length === 0 && !isOwner) {
    return null;
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block', marginLeft: 'clamp(12px, 2vw, 20px)' }}>
      {/* Кнопка-триггер с аватарами участников */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center"
        style={{
          gap: '0',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          padding: '0',
        }}
      >
        {displayMembers.length > 0 ? (
          <>
            {displayMembers.slice(0, 3).map((member, index) => (
              <div
                key={member.id}
                title={member.name || member.email}
                style={{
                  width: 'clamp(40px, 5vw, 50px)',
                  height: 'clamp(40px, 5vw, 50px)',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  marginLeft: index > 0 ? '-8px' : '0',
                  border: '2px solid #242528',
                  zIndex: 10 - index,
                  position: 'relative',
                  aspectRatio: '1 / 1',
                  flexShrink: 0,
                }}
              >
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt={member.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%',
                      display: 'block',
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
                      fontSize: 'clamp(16px, 2vw, 20px)',
                    }}
                  >
                    {member.name?.charAt(0).toUpperCase() || member.email?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
              </div>
            ))}
            {displayMembers.length > 3 && (
              <div
                style={{
                  width: 'clamp(40px, 5vw, 50px)',
                  height: 'clamp(40px, 5vw, 50px)',
                  borderRadius: '50%',
                  backgroundColor: '#313236',
                  border: '2px solid #242528',
                  marginLeft: '-8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: 'bold',
                  fontSize: 'clamp(12px, 1.5vw, 16px)',
                  zIndex: 0,
                  flexShrink: 0,
                }}
                title={`Еще ${displayMembers.length - 3} участников`}
              >
                +{displayMembers.length - 3}
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              width: 'clamp(40px, 5vw, 50px)',
              height: 'clamp(40px, 5vw, 50px)',
              borderRadius: '50%',
              backgroundColor: '#313236',
              border: '2px solid #242528',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 'bold',
              fontSize: 'clamp(12px, 1.5vw, 16px)',
            }}
          >
            {displayMembers.length}
          </div>
        )}
      </button>

      {/* Выпадающее меню */}
      {isOpen && (
        <div
          className="border border-[#404040]"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
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
            backgroundColor: 'rgba(42, 45, 49, 0.95)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <style>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* Кнопка добавления участника */}
          {isOwner && (
            <>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onAddMember();
                }}
                className="w-full text-left transition-colors"
                style={{
                  padding: 'clamp(10px, 1.2vw, 14px)',
                  borderRadius: '10px',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  marginBottom: displayMembers.length > 0 ? '4px' : '0',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#313236';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div className="text-white font-medium" style={{ fontSize: 'clamp(14px, 1.8vw, 16px)' }}>
                  добавить участника
                </div>
              </button>

              {/* Разделитель */}
              {displayMembers.length > 0 && (
                <div
                  style={{
                    height: '1px',
                    backgroundColor: '#404040',
                    margin: '8px 0',
                  }}
                />
              )}
            </>
          )}

          {/* Список участников */}
          {displayMembers.length === 0 ? (
            <div className="text-[#A1A1A4] text-center p-2" style={{ fontSize: 'clamp(14px, 1.8vw, 16px)' }}>
              Участники не найдены
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {displayMembers.map((member) => (
                <div
                  key={member.id}
                  className="w-full text-left transition-colors"
                  style={{
                    padding: 'clamp(10px, 1.2vw, 14px)',
                    borderRadius: '10px',
                    backgroundColor: 'transparent',
                    cursor: 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onMouseEnter={() => {
                    if (isOwner) {
                      setHoveredMemberId(member.id);
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredMemberId(null);
                  }}
                >
                  <div className="flex items-center" style={{ gap: '12px', flex: '1', minWidth: 0 }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        flexShrink: 0,
                        aspectRatio: '1 / 1',
                      }}
                    >
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.name}
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
                            fontSize: '14px',
                          }}
                        >
                          {member.name?.charAt(0).toUpperCase() || member.email?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1" style={{ minWidth: 0 }}>
                      <div className="text-white font-medium" style={{ fontSize: 'clamp(14px, 1.8vw, 16px)' }}>
                        {member.name || member.email}
                      </div>
                      {member.name && (
                        <div className="text-[#838486]" style={{ fontSize: 'clamp(12px, 1.5vw, 14px)' }}>
                          {member.email}
                        </div>
                      )}
                    </div>
                  </div>
                  {isOwner && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteMemberId(member.id);
                      }}
                      className="text-[#FD5353] transition-colors"
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        backgroundColor: hoveredMemberId === member.id ? 'rgba(253, 83, 83, 0.1)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 'clamp(16px, 2vw, 18px)',
                        flexShrink: 0,
                        marginLeft: '8px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(253, 83, 83, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = hoveredMemberId === member.id ? 'rgba(253, 83, 83, 0.1)' : 'transparent';
                      }}
                      title="Удалить участника"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteMemberId}
        onClose={() => setDeleteMemberId(null)}
        onConfirm={() => {
          if (deleteMemberId) {
            onDeleteMember(deleteMemberId);
            setDeleteMemberId(null);
          }
        }}
        title="Удалить участника?"
        message="Вы уверены, что хотите удалить этого участника из проекта?"
      />
    </div>
  );
}

