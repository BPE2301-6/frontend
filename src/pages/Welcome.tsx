import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();
  const [hoverLogin, setHoverLogin] = useState(false);
  const [hoverRegister, setHoverRegister] = useState(false);

  return (
    <div className="w-full min-h-screen bg-[#242528] font-montserrat flex flex-col items-center justify-center text-center px-4 py-8">
      {/* Заголовки */}
      <h1 className="text-[#1E80D9] font-bold text-[48px] sm:text-[56px] md:text-[62px] lg:text-[68px] leading-tight mb-4 sm:mb-6">
        ДОБРО ПОЖАЛОВАТЬ
      </h1>

      <h2 className="text-white font-medium text-[32px] sm:text-[48px] md:text-[56px] lg:text-[62px] leading-tight mb-4 sm:mb-6">
        в инструмент управления проектами
      </h2>

      <h3 className="text-[#FF8800] font-bold text-[64px] sm:text-[80px] md:text-[96px] lg:text-[112px] leading-tight mb-12 sm:mb-16 md:mb-20">
        KANBANI
      </h3>

      {/* Кнопки */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-10 w-full max-w-[90%] sm:max-w-[80%]">
        {/* Вход */}
        <button
          onClick={() => navigate('/login')}
          onMouseEnter={() => setHoverLogin(true)}
          onMouseLeave={() => setHoverLogin(false)}
          className="font-medium text-[36px] sm:text-[42px] md:text-[48px] lg:text-[52px] leading-tight lowercase rounded-full transition-all duration-200 w-full sm:w-auto"
          style={{
            maxWidth: '425px',
            height: '80px',
            backgroundColor: hoverLogin ? '#FF8800' : '#FFFFFF',
            color: hoverLogin ? '#FFFFFF' : '#242528',
            boxShadow: hoverLogin ? '0 0 20px rgba(255, 136, 0, 0.6)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
            transform: hoverLogin ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          вход
        </button>

        {/* Регистрация */}
        <button
          onClick={() => navigate('/register')}
          onMouseEnter={() => setHoverRegister(true)}
          onMouseLeave={() => setHoverRegister(false)}
          className="font-medium text-[36px] sm:text-[42px] md:text-[48px] lg:text-[52px] leading-tight lowercase rounded-full transition-all duration-200 w-full sm:w-auto"
          style={{
            maxWidth: '434px',
            height: '80px',
            backgroundColor: hoverRegister ? '#FF8800' : '#FFFFFF',
            color: hoverRegister ? '#FFFFFF' : '#242528',
            boxShadow: hoverRegister ? '0 0 20px rgba(255, 136, 0, 0.6)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
            transform: hoverRegister ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          регистрация
        </button>
      </div>
    </div>
  );
}
