import { Outlet, Navigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';

const AppLayout = () => {
  const { token } = useAuth();

  // Protect all routes inside this layout
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Outlet />
      <BottomNav />
    </div>
  );
};

export default AppLayout;