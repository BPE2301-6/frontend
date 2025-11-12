import { createBrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import Welcome from '../pages/Welcome.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import KanbanBoard from '../pages/KanbanBoard.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // общий layout
    children: [
      { path: '/', element: <Welcome /> },   // главная страница
      { path: '/login', element: <Login /> }, // страница входа
      { path: '/register', element: <Register /> }, // страница регистрации
      { path: '/board', element: <KanbanBoard /> }, // экран доски
    ],
  },
]);

