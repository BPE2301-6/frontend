import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-screen bg-[#242528] font-montserrat flex flex-col items-center justify-center text-center px-4 relative">
      {/* Заголовки */}
      <h1 className="text-[#1E80D9] font-bold text-[62px] leading-[76px]">
        ДОБРО ПОЖАЛОВАТЬ
      </h1>

      <h2 className="text-white font-medium text-[32px] md:text-[40px] lg:text-[48px] leading-[60px] mt-2">
        в инструмент управления проектами
      </h2>

      <h3 className="text-[#FF8800] font-bold text-[96px] leading-[117px] mt-4">
        KANBANI
      </h3>

      {/* Кнопки */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-12">
        {/* Вход */}
        <button
          onClick={() => navigate('/login')}
          className="bg-[#FF8800] text-white font-medium text-[48px] leading-[59px] lowercase rounded-full hover:opacity-90 transition"
          style={{ width: '425px', height: '95px' }}
        >
          вход
        </button>

        {/* Регистрация */}
        <button
          onClick={() => navigate('/register')}
          className="bg-[#1E80D9] text-white font-medium text-[48px] leading-[59px] lowercase rounded-full hover:opacity-90 transition"
          style={{ width: '425px', height: '95px' }}
        >
          регистрация
        </button>
      </div>
    </div>
  );
}
