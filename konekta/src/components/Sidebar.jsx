import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { userStorage } from '../utils/localStorage';

const navItems = [
  { label: 'Home', to: '/feed', iconClass: 'fa-solid fa-house' },
  { label: 'Reels', to: '/reels', iconClass: 'fa-solid fa-clapperboard' },
  { label: 'Messages', to: 'https://leafy-custard-e696d3.netlify.app', iconClass: 'fa-regular fa-envelope', badge: '8' },
  { label: 'Notifications', to: '/notifications', iconClass: 'fa-regular fa-bell' },
  { label: 'Profile', to: '/profile', iconClass: 'fa-regular fa-user' },
];

const Sidebar = ({ onCreatePost }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const currentUser = userStorage.getCurrentUser();

  const handleLogout = () => {
    userStorage.clearCurrentUser();
    navigate('/');
  };

  const handleCreatePost = () => {
    if (onCreatePost) {
      onCreatePost();
    }
  };

  return (
    <aside 
      className={`hidden lg:flex flex-col items-center bg-[#121212] min-h-screen pt-6 pb-8 gap-6 transition-all duration-500 ease-in-out border-r border-[#1f1f1f] ${
        isExpanded ? 'w-60' : 'w-20'
      } group`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="animate-fade-in">
        <div className="w-16 h-16 rounded-full border-4 border-brand-pink bg-gradient-to-br from-brand-pink to-brand-purple flex items-center justify-center font-bold text-xl transition-all duration-300 hover:scale-110 hover:shadow-neon-pink cursor-pointer">
          {currentUser?.username?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>

      <nav className="flex flex-col gap-3 w-full px-3">
        {navItems.map((item, index) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              [
                'flex items-center justify-center lg:justify-start gap-3 text-white font-semibold rounded-2xl px-3 py-2.5 transition-all duration-300 relative overflow-hidden group/item',
                isActive
                  ? 'bg-gradient-to-r from-brand-pink via-brand-purple to-brand-cyan text-black shadow-neon-pink scale-105'
                  : 'hover:bg-[#1f1f1f] hover:scale-105 hover:translate-x-1',
              ].join(' ')
            }
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <i className={`${item.iconClass} text-xl transition-all duration-300 group-hover/item:scale-110 group-hover/item:rotate-6`} />
            <span className={`hidden lg:inline transition-all duration-300 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 lg:group-hover:opacity-100 lg:group-hover:translate-x-0'}`}>
              {item.label}
            </span>
            {item.badge && (
              <span className={`ml-auto text-xs font-bold text-white bg-brand-pink px-2 py-0.5 rounded-full shadow-neon-pink animate-pulse-glow hidden lg:inline transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 lg:group-hover:opacity-100'}`}>
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={handleCreatePost}
          className="flex items-center justify-center lg:justify-start gap-3 text-white font-semibold rounded-2xl px-3 py-2.5 transition-all duration-300 hover:bg-gradient-to-r hover:from-brand-pink hover:to-brand-purple hover:scale-105 hover:translate-x-1 group/item"
        >
          <i className="fa-regular fa-square-plus text-xl transition-all duration-300 group-hover/item:scale-110 group-hover/item:rotate-90" />
          <span className={`hidden lg:inline transition-all duration-300 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 lg:group-hover:opacity-100 lg:group-hover:translate-x-0'}`}>
            Create Post
          </span>
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center justify-center lg:justify-start gap-3 text-white font-semibold rounded-2xl px-3 py-2.5 transition-all duration-300 hover:bg-red-500/20 hover:scale-105 hover:translate-x-1 mt-auto group/item"
        >
          <i className="fa-solid fa-right-from-bracket text-xl transition-all duration-300 group-hover/item:scale-110 group-hover/item:-rotate-12" />
          <span className={`hidden lg:inline transition-all duration-300 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 lg:group-hover:opacity-100 lg:group-hover:translate-x-0'}`}>
            Logout
          </span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;


