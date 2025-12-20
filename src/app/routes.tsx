import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Welcome from '../pages/Welcome';
import Login from '../pages/Login';
import Register from '../pages/Register';
import KanbanBoard from '../pages/KanbanBoard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // общий layout
    children: [
      { path: '/', element: <Welcome /> }, // главная страница
      { path: '/login', element: <Login /> }, // страница входа
      { path: '/register', element: <Register /> }, // страница регистрации
      { path: '/board', element: <KanbanBoard /> }, // экран доски
    ],
  },
]);

