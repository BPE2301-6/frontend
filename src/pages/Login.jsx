import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-screen bg-[#242528] flex flex-col items-center justify-center font-montserrat text-center px-4">
      {/* Заголовок */}
      <h1 className="text-[#1E80D9] font-bold text-[48px] md:text-[64px] mb-10">
        Вход
      </h1>

      {/* Форма */}
      <form
        className="flex flex-col items-center gap-6 w-full max-w-[700px]"
        onSubmit={(e) => {
          e.preventDefault();
          // Навигация на экран доски после входа
          navigate('/board');
        }}
      >
        {/* Поле логина */}
        <input
          type="text"
          placeholder="логин"
          className="w-full h-[75px] rounded-full border border-white bg-transparent text-white text-[32px] px-6 placeholder-white outline-none focus:ring-2 focus:ring-[#1E80D9] transition"
        />

        {/* Поле пароля */}
        <input
          type="password"
          placeholder="пароль"
          className="w-full h-[75px] rounded-full border border-white bg-transparent text-white text-[32px] px-6 placeholder-white outline-none focus:ring-2 focus:ring-[#1E80D9] transition"
        />

        {/* Кнопка входа */}
        <button
          type="submit"
          className="w-[480px] h-[75px] bg-[#FF8800] rounded-full text-white font-medium text-[36px] hover:opacity-90 transition mt-4"
        >
          Вход
        </button>
      </form>

      {/* Ссылка на регистрацию */}
      <Link
        to="/register"
        className="text-white text-[24px] mt-6 hover:text-[#FF8800] transition"
      >
        регистрация
      </Link>
    </div>
  );
}
