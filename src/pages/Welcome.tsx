import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();
  const [hoverLogin, setHoverLogin] = useState(false);
  const [hoverRegister, setHoverRegister] = useState(false);

  return (
    <div className="w-full min-h-screen bg-[#242528] font-montserrat flex flex-col items-center justify-start text-center px-4" style={{ paddingTop: 'clamp(80px, 15vh, 150px)' }}>
      <div className="flex flex-col items-center justify-center w-full max-w-7xl">
        {/* Заголовки */}
        <h1 
          className="font-bold leading-tight"
          style={{ 
            fontSize: 'clamp(48px, 6vw, 68px)',
            color: '#1E80D9',
            marginBottom: 'clamp(20px, 3vw, 40px)',
          }}
        >
          ДОБРО ПОЖАЛОВАТЬ
        </h1>

        <h2 
          className="font-medium leading-tight text-white"
          style={{ 
            fontSize: 'clamp(32px, 4vw, 62px)',
            marginBottom: 'clamp(20px, 3vw, 40px)',
          }}
        >
          в инструмент управления проектами
        </h2>

        <h3 
          className="font-bold leading-tight"
          style={{ 
            fontSize: 'clamp(64px, 8vw, 112px)',
            color: '#FF8800',
            marginBottom: 'clamp(30px, 4vw, 50px)',
          }}
        >
          KANBANI
        </h3>

        {/* Кнопки */}
        <div className="flex flex-row items-center justify-center w-full px-4 sm:px-8">
        {/* Вход - слева, синяя */}
        <button
          onClick={() => navigate('/login')}
          onMouseEnter={() => setHoverLogin(true)}
          onMouseLeave={() => setHoverLogin(false)}
          className="font-medium leading-tight lowercase text-white flex-shrink-0"
          style={{
            width: 'clamp(180px, 25vw, 425px)',
            height: '80px',
            borderRadius: '9999px',
            backgroundColor: hoverLogin ? '#166BB7' : '#1E80D9',
            boxShadow: hoverLogin ? '0 0 20px rgba(30, 128, 217, 0.6), 0 0 30px rgba(30, 128, 217, 0.4)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
            transform: hoverLogin ? 'scale(1.05)' : 'scale(1)',
            fontSize: 'clamp(28px, 3.5vw, 52px)',
            marginRight: 'clamp(8px, 1vw, 16px)',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
          }}
        >
          вход
        </button>

        {/* Регистрация - справа, оранжевая */}
        <button
          onClick={() => navigate('/register')}
          onMouseEnter={() => setHoverRegister(true)}
          onMouseLeave={() => setHoverRegister(false)}
          className="font-medium leading-tight lowercase text-white flex-shrink-0"
          style={{
            width: 'clamp(200px, 27vw, 434px)',
            height: '80px',
            borderRadius: '9999px',
            backgroundColor: hoverRegister ? '#E67700' : '#FF8800',
            boxShadow: hoverRegister ? '0 0 20px rgba(255, 136, 0, 0.6), 0 0 30px rgba(255, 136, 0, 0.4)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
            transform: hoverRegister ? 'scale(1.05)' : 'scale(1)',
            fontSize: 'clamp(28px, 3.5vw, 52px)',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
          }}
        >
          регистрация
        </button>
        </div>
      </div>
    </div>
  );
}
