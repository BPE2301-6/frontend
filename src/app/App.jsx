import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RootLayout from '@app/layouts/RootLayout';
import KanbanBoard from '@widgets/KanbanBoard';
import ComponentsDemo from '@pages/ComponentsDemo';

function App() {
  return (
    <Router>
      <RootLayout>
        <Routes>
          <Route path="/" element={<KanbanBoard />} />
          <Route path="/components" element={<ComponentsDemo />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </RootLayout>
    </Router>
  );
}

// Простая страница "О проекте"
function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          О проекте Task Tracker
        </h1>
        <div className="space-y-4 text-gray-600">
          <p>
            Это современное React приложение для управления задачами, построенное с использованием:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong>React 18</strong> - для создания пользовательского интерфейса
            </li>
            <li>
              <strong>Vite</strong> - быстрый инструмент сборки
            </li>
            <li>
              <strong>Tailwind CSS</strong> - для стилизации
            </li>
            <li>
              <strong>React Router</strong> - для навигации
            </li>
            <li>
              <strong>Zustand</strong> - для управления состоянием
            </li>
          </ul>
          <p>
            Проект использует архитектуру Feature-Sliced Design (FSD) для лучшей организации кода.
          </p>
        </div>
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Вернуться на главную
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
