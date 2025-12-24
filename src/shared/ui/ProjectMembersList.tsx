import { useState } from 'react';
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
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null);

  // Фильтруем участников, исключая текущего пользователя
  const displayMembers = members.filter((m) => m.id !== currentUserId);
  
  // Проверяем, является ли пользователь владельцем
  const isOwner = currentUserRole === 'OWNER';

  if (displayMembers.length === 0) {
    // Показываем кнопку добавления только если пользователь владелец
    if (!isOwner) {
      return null;
    }
    
    return (
      <>
        <button
          onClick={onAddMember}
          className="flex items-center justify-center text-white font-bold"
          style={{
            width: 'clamp(40px, 5vw, 50px)',
            height: 'clamp(40px, 5vw, 50px)',
            borderRadius: '50%',
            backgroundColor: '#FF8800',
            fontSize: 'clamp(20px, 2.5vw, 24px)',
            lineHeight: '1',
            border: 'none',
            cursor: 'pointer',
            marginLeft: 'clamp(12px, 2vw, 20px)',
            transition: 'background-color 0.3s ease, transform 0.3s ease',
            flexShrink: 0,
            aspectRatio: '1 / 1',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#E67700';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FF8800';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Добавить участника"
        >
          +
        </button>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center" style={{ marginLeft: 'clamp(12px, 2vw, 20px)', gap: '0' }}>
        {displayMembers.slice(0, 3).map((member, index) => (
          <div
            key={member.id}
            title={member.name || member.email}
            onMouseEnter={() => isOwner && setHoveredMemberId(member.id)}
            onMouseLeave={() => setHoveredMemberId(null)}
            onClick={() => isOwner && setDeleteMemberId(member.id)}
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
              cursor: isOwner ? 'pointer' : 'default',
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
                  opacity: hoveredMemberId === member.id ? 0.7 : 1,
                  transition: 'opacity 0.3s ease',
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
                  opacity: hoveredMemberId === member.id ? 0.7 : 1,
                  transition: 'opacity 0.3s ease',
                }}
              >
                {member.name.charAt(0).toUpperCase()}
              </div>
            )}
            {isOwner && hoveredMemberId === member.id && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(253, 83, 83, 0.8)',
                  borderRadius: '50%',
                  color: '#FFFFFF',
                  fontSize: '20px',
                  fontWeight: 'bold',
                }}
              >
                ×
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
        {isOwner && (
          <button
            onClick={onAddMember}
            className="flex items-center justify-center text-white font-bold"
            style={{
              width: 'clamp(40px, 5vw, 50px)',
              height: 'clamp(40px, 5vw, 50px)',
              borderRadius: '50%',
              backgroundColor: '#FF8800',
              fontSize: 'clamp(20px, 2.5vw, 24px)',
              lineHeight: '1',
              border: '2px solid #242528',
              cursor: 'pointer',
              marginLeft: displayMembers.length > 0 ? '-8px' : '0',
              transition: 'background-color 0.3s ease, transform 0.3s ease',
              flexShrink: 0,
              aspectRatio: '1 / 1',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E67700';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FF8800';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Добавить участника"
          >
            +
          </button>
        )}
      </div>

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
    </>
  );
}

