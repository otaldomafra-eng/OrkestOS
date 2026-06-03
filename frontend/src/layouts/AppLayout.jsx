import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import XPToastLayer from '../components/XPToast';
import LevelUpModal from '../components/LevelUpModal';
import { useAuth } from '../hooks/useAuth';

const AppLayout = () => {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-20 lg:pb-0 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
      <XPToastLayer />
      <LevelUpModal />
    </div>
  );
};

export default AppLayout;