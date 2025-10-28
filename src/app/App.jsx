import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';

function App() {
  return (
    <Router>
      <RootLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </RootLayout>
    </Router>
  );
}

// Простая домашняя страница для проверки
function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Task Tracker
        </h1>
        <p className="text-gray-600 mb-6">
          Добро пожаловать в приложение для управления задачами!
        </p>
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-800 text-sm">
              ✅ React приложение успешно запущено
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800 text-sm">
              🎨 Tailwind CSS работает корректно
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-purple-800 text-sm">
              🚀 Vite dev server активен
            </p>
          </div>
        </div>
        <div className="mt-6">
          <a 
            href="/about" 
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            О проекте
          </a>
        </div>
      </div>
    </div>
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
            <li><strong>React 18</strong> - для создания пользовательского интерфейса</li>
            <li><strong>Vite</strong> - быстрый инструмент сборки</li>
            <li><strong>Tailwind CSS</strong> - для стилизации</li>
            <li><strong>React Router</strong> - для навигации</li>
            <li><strong>Zustand</strong> - для управления состоянием</li>
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
