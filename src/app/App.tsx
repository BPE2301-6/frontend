import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '@entities/auth/useAuthStore';
import UserProfileModal from '@shared/ui/UserProfileModal';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Не показываем header на welcome, login и register страницах
  const hideHeader = ['/', '/login', '/register'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-[#242528] text-white font-montserrat">
      {/* Header с аватаром пользователя */}
      {!hideHeader && isAuthenticated && user && (
        <header
          className="w-full flex justify-end items-center"
          style={{
            padding: 'clamp(20px, 3vh, 40px) clamp(20px, 4vw, 60px)',
            position: 'sticky',
            top: 0,
            zIndex: 40,
            backgroundColor: 'rgba(36, 37, 40, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <button
            onClick={() => setShowProfileModal(true)}
            className="cursor-pointer transition-transform duration-300 hover:scale-110"
            style={{
              width: 'clamp(50px, 6vw, 70px)',
              height: 'clamp(50px, 6vw, 70px)',
            }}
          >
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-full h-full rounded-full object-cover border-2 border-[#1E80D9]"
                style={{
                  boxShadow: '0 0 20px rgba(30, 128, 217, 0.5)',
                }}
              />
            ) : (
              <div
                className="w-full h-full rounded-full flex items-center justify-center text-white font-bold border-2 border-[#1E80D9]"
                style={{
                  backgroundColor: '#1E80D9',
                  fontSize: 'clamp(24px, 3vw, 36px)',
                  boxShadow: '0 0 20px rgba(30, 128, 217, 0.5)',
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </button>
        </header>
      )}

      {/* Основной контент */}
      <Outlet />

      {/* Модальное окно профиля */}
      {isAuthenticated && (
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
}

