import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@entities/auth/useAuthStore';

export default function Register() {
  const navigate = useNavigate();
  const { register, login, loading, error } = useAuthStore();
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [hoverLink, setHoverLink] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError('');

    // Валидация
    if (password !== confirmPassword) {
      setValidationError('Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      setValidationError('Пароль должен быть не менее 6 символов');
      return;
    }

    if (!loginValue) {
      setValidationError('Введите логин');
      return;
    }

    try {
      // Логин используется как email, а name будет равен логину
      const email = loginValue.includes('@') ? loginValue : `${loginValue}@example.com`;
      const name = loginValue;
      
      // Регистрация
      await register(email, password, name);
      // После регистрации автоматически логинимся
      await login(email, password);
      navigate('/board');
    } catch (err) {
      console.error('Register error:', err);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#242528] flex flex-col items-center justify-center font-montserrat text-center px-4 py-8">
      {/* Заголовок */}
      <h1 
        className="font-bold leading-tight mt-8 sm:mt-12"
        style={{ 
          fontSize: 'clamp(56px, 7vw, 80px)',
          color: '#1E80D9',
          marginBottom: 'clamp(50px, 7vw, 20px)',
        }}
      >
        Регистрация
      </h1>

      {/* Форма */}
      <form
        className="flex flex-col items-center w-full"
        onSubmit={handleSubmit}
      >
        {/* Темный контейнер для полей */}
        <div 
          className="bg-[#2A2D31] rounded-2xl p-8 sm:p-10 md:p-12"
          style={{
            width: '100%',
            maxWidth: '750px',
            minWidth: '320px',
            marginBottom: '30px',
          }}
        >
          {/* Поле логина */}
          <input
            type="text"
            placeholder="логин"
            value={loginValue}
            onChange={(e) => setLoginValue(e.target.value)}
            required
            className="w-full h-[70px] sm:h-[80px] md:h-[90px] rounded-full border-2 border-white text-white leading-tight outline-none focus:ring-4 focus:ring-[#1E80D9] focus:border-[#1E80D9] transition-all duration-200"
            style={{
              fontSize: 'clamp(36px, 3.5vw, 44px)',
              paddingLeft: 'clamp(44px, 5vw, 60px)',
              paddingRight: 'clamp(32px, 4vw, 48px)',
              backgroundColor: '#2A2D31',
              marginBottom: '30px',
            }}
            onInput={(e) => {
              const target = e.target as HTMLInputElement;
              target.style.setProperty('--placeholder-font-size', 'clamp(36px, 3.5vw, 44px)');
            }}
          />

          {/* Поле пароля */}
          <input
            type="password"
            placeholder="пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full h-[70px] sm:h-[80px] md:h-[90px] rounded-full border-2 border-white text-white leading-tight outline-none focus:ring-4 focus:ring-[#1E80D9] focus:border-[#1E80D9] transition-all duration-200"
            style={{
              fontSize: 'clamp(36px, 3.5vw, 44px)',
              paddingLeft: 'clamp(44px, 5vw, 60px)',
              paddingRight: 'clamp(32px, 4vw, 48px)',
              backgroundColor: '#2A2D31',
              marginBottom: '30px',
            }}
          />

          {/* Подтверждение пароля */}
          <input
            type="password"
            placeholder="повторить пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full h-[70px] sm:h-[80px] md:h-[90px] rounded-full border-2 border-white text-white leading-tight outline-none focus:ring-4 focus:ring-[#1E80D9] focus:border-[#1E80D9] transition-all duration-200"
            style={{
              fontSize: 'clamp(36px, 3.5vw, 44px)',
              paddingLeft: 'clamp(44px, 5vw, 60px)',
              paddingRight: 'clamp(32px, 4vw, 48px)',
              backgroundColor: '#2A2D31',
            }}
          />
        </div>

        {/* Сообщение об ошибке */}
        {(error || validationError) && (
          <div 
            className="text-[#FD5353]"
            style={{
              width: '100%',
              maxWidth: '750px',
              fontSize: 'clamp(20px, 2vw, 28px)',
              marginBottom: '30px',
            }}
          >
            {validationError || error}
          </div>
        )}

        {/* Кнопка регистрации */}
        <button
          type="submit"
          disabled={loading}
          className="bg-[#FF8800] hover:bg-[#E67700] hover:shadow-[0_0_20px_rgba(255,136,0,0.6)] hover:scale-105 active:bg-[#CC6600] active:scale-100 text-white font-medium leading-tight lowercase rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#FF8800] disabled:hover:shadow-none disabled:hover:scale-100 flex items-center justify-center"
          style={{
            width: '100%',
            maxWidth: '600px',
            height: '80px',
            minWidth: '320px',
            fontSize: 'clamp(42px, 4.5vw, 56px)',
            paddingTop: '4px',
            paddingBottom: '4px',
            marginTop: '30px',
          }}
        >
          {loading ? 'Регистрация...' : 'Регистрация'}
        </button>
      </form>

      {/* Ссылка на вход */}
      <Link
        to="/login"
        onMouseEnter={() => setHoverLink(true)}
        onMouseLeave={() => setHoverLink(false)}
        className="leading-tight lowercase"
        style={{ 
          fontSize: 'clamp(28px, 2.5vw, 36px)',
          marginTop: '30px',
          color: hoverLink ? '#FF8800' : '#FFFFFF',
          textShadow: hoverLink ? '0 0 15px rgba(255, 136, 0, 0.8), 0 0 25px rgba(255, 136, 0, 0.5)' : 'none',
          transition: 'color 0.4s ease, text-shadow 0.4s ease',
        }}
      >
        вход
      </Link>
    </div>
  );
}
