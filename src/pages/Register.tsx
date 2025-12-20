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
    <div className="w-full min-h-screen bg-[#242528] flex flex-col items-center justify-start font-montserrat text-center px-4" style={{ paddingTop: 'clamp(60px, 10vh, 120px)' }}>
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
        {/* Поле логина */}
        <input
          type="text"
          placeholder="логин"
          value={loginValue}
          onChange={(e) => setLoginValue(e.target.value)}
          required
          className="w-full border-2 border-white text-white leading-tight placeholder:text-gray-300 placeholder:font-light outline-none focus:ring-4 focus:ring-[#1E80D9] focus:border-[#1E80D9] transition-all duration-200"
          style={{
            maxWidth: '750px',
            minWidth: '320px',
            height: 'clamp(70px, 8vw, 90px)',
            borderRadius: '9999px',
            fontSize: 'clamp(36px, 3.5vw, 44px)',
            paddingLeft: 'clamp(44px, 5vw, 60px)',
            paddingRight: 'clamp(32px, 4vw, 48px)',
            backgroundColor: '#2A2D31',
            marginBottom: '30px',
          }}
        />

        {/* Поле пароля */}
        <input
          type="password"
          placeholder="пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border-2 border-white text-white leading-tight placeholder:text-gray-300 placeholder:font-light outline-none focus:ring-4 focus:ring-[#1E80D9] focus:border-[#1E80D9] transition-all duration-200"
          style={{
            maxWidth: '750px',
            minWidth: '320px',
            height: 'clamp(70px, 8vw, 90px)',
            borderRadius: '9999px',
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
          className="w-full border-2 border-white text-white leading-tight placeholder:text-gray-300 placeholder:font-light outline-none focus:ring-4 focus:ring-[#1E80D9] focus:border-[#1E80D9] transition-all duration-200"
          style={{
            maxWidth: '750px',
            minWidth: '320px',
            height: 'clamp(70px, 8vw, 90px)',
            borderRadius: '9999px',
            fontSize: 'clamp(36px, 3.5vw, 44px)',
            paddingLeft: 'clamp(44px, 5vw, 60px)',
            paddingRight: 'clamp(32px, 4vw, 48px)',
            backgroundColor: '#2A2D31',
            marginBottom: '30px',
          }}
        />

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
          className="text-white font-medium leading-tight lowercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          style={{
            width: '100%',
            maxWidth: '600px',
            height: '80px',
            minWidth: '320px',
            backgroundColor: '#FF8800',
            borderRadius: '9999px',
            fontSize: 'clamp(42px, 4.5vw, 56px)',
            paddingTop: '4px',
            paddingBottom: '4px',
            marginTop: '30px',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#E67700';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 136, 0, 0.6)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#FF8800';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
          onMouseDown={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#CC6600';
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
          onMouseUp={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#E67700';
              e.currentTarget.style.transform = 'scale(1.05)';
            }
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
