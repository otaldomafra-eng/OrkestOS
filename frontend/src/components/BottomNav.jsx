import { Link, useLocation } from 'react-router-dom';
import { Home, ListChecks, Focus, Sparkles, Library, Plug, LogOut } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { useApp } from '../store/AppContext';

const BottomNav = () => {
  const location = useLocation();

  const { setToken, navigate } = useApp();

  const logout = () => {
    navigate('/login')
    localStorage.removeItem('token')
    localStorage.removeItem('orkestos_user')
    setToken('')
  }

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Painel' },
    { path: '/trackers', icon: ListChecks, label: 'Rastreadores' },
    { path: '/focus-room', icon: Focus, label: 'Foco' },
    { path: '/future-twin', icon: Sparkles, label: 'IA' },
    { path: '/library', icon: Library, label: 'Biblioteca' },
    { path: '/integrations', icon: Plug, label: 'Integrações' },
    { path: '/login', icon: LogOut, label: 'Sair' },
  ];

  return (
    <nav className="
fixed bottom-0 left-0 right-0 z-50
bg-black/40 backdrop-blur-xl 
border-t border-white/10
shadow-[0_-10px_30px_rgba(0,0,0,0.5)]
">
      <div className="flex justify-around items-center h-16 relative before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px]
before:bg-gradient-to-r before:from-indigo-500 before:to-purple-500">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={(e) => {
                if (item.label === "Sair") {
                  e.preventDefault(); // stop Link navigation
                  logout();           // call your function
                }
              }}
              className="flex-1 h-full flex items-center justify-center"
            >
              <Motion.div
                className={`
      flex flex-col items-center justify-center 
      px-3 py-1 rounded-xl transition-all duration-300
      ${isActive
                    ? "text-indigo-400"
                    : "text-gray-400"
                  }
    `}
                whileTap={{ scale: 0.9 }}
              >

                {/* Active Background Glow */}
                {isActive && (
                  <Motion.div
                    layoutId="nav-pill"
                    className="absolute w-14 h-10 rounded-xl bg-indigo-500/10 blur-md"
                  />
                )}

                {/* Icon */}
                <Motion.div
                  animate={isActive ? { y: [0, -4, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className={isActive ? "drop-shadow-[0_0_10px_rgba(99,102,241,0.7)]" : ""}
                >
                  <Icon size={22} />
                </Motion.div>

                {/* Label */}
                <span className="text-[10px] mt-1">
                  {item.label}
                </span>

              </Motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
