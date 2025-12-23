import { Outlet } from 'react-router-dom';

export default function App() {
  return (
    <div className="min-h-screen bg-[#242528] text-white font-montserrat">
      <Outlet />
    </div>
  );
}

