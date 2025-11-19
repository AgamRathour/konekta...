import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { notificationStorage } from '../utils/localStorage';

const filterTabs = [
  { id: 'all', label: 'All', icon: 'fa-solid fa-list' },
  { id: 'like', label: 'Likes', icon: 'fa-regular fa-heart' },
  { id: 'comment', label: 'Comments', icon: 'fa-regular fa-comment' },
  { id: 'share', label: 'Shares', icon: 'fa-regular fa-paper-plane' },
];

const Notifications = () => {
  useAuthGuard();
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [animatingButtons, setAnimatingButtons] = useState({});

  useEffect(() => {
    document.title = 'Konekta | Notifications';
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    const stored = notificationStorage.getNotifications();
    setNotifications(stored);
  };

  const filteredNotifications =
    activeFilter === 'all'
      ? notifications
      : notifications.filter((notif) => notif.type === activeFilter);

  const handleMarkAsRead = (notifId) => {
    setAnimatingButtons((prev) => ({ ...prev, [`read-${notifId}`]: true }));
    setTimeout(() => {
      setAnimatingButtons((prev) => ({ ...prev, [`read-${notifId}`]: false }));
    }, 300);

    notificationStorage.markAsRead(notifId);
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === notifId ? { ...notif, read: true } : notif)),
    );
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all notifications?')) {
      notificationStorage.clearNotifications();
      setNotifications([]);
    }
  };

  const handleFilterChange = (filterId) => {
    setAnimatingButtons((prev) => ({ ...prev, [`filter-${filterId}`]: true }));
    setTimeout(() => {
      setAnimatingButtons((prev) => ({ ...prev, [`filter-${filterId}`]: false }));
    }, 200);
    setActiveFilter(filterId);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return 'fa-solid fa-heart text-brand-pink';
      case 'comment':
        return 'fa-regular fa-comment text-brand-cyan';
      case 'share':
        return 'fa-regular fa-paper-plane text-brand-purple';
      default:
        return 'fa-regular fa-bell text-gray-400';
    }
  };

  const getNotificationAvatar = (type) => {
    const avatars = [
      'https://randomuser.me/api/portraits/women/11.jpg',
      'https://randomuser.me/api/portraits/men/40.jpg',
      'https://randomuser.me/api/portraits/women/55.jpg',
      'https://randomuser.me/api/portraits/men/22.jpg',
      'https://randomuser.me/api/portraits/women/33.jpg',
    ];
    return avatars[Math.floor(Math.random() * avatars.length)];
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex animate-fade-in">
      <Sidebar />
      <main className="flex-1 px-4 lg:px-12 py-10 flex flex-col lg:flex-row gap-8">
        <section className="flex-1 space-y-8">
          <header className="flex items-center justify-between animate-slide-down">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Stream</p>
              <h1 className="text-3xl font-poppins font-semibold text-gradient">Notifications</h1>
            </div>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-sm text-gray-400 hover:text-red-400 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center gap-2"
              >
                <i className="fa-regular fa-trash-can" />
                Clear all
              </button>
            )}
          </header>

          <div className="flex flex-wrap gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleFilterChange(tab.id)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-pink to-brand-cyan text-black border-transparent shadow-neon-pink'
                      : 'border-[#2a2a2a] bg-[#111] hover:border-brand-pink'
                  } ${animatingButtons[`filter-${tab.id}`] ? 'animate-pulse' : ''}`}
                >
                  <i className={tab.icon} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif, index) => {
                const isRead = notif.read;
                return (
                  <article
                    key={notif.id}
                    className={`flex items-center gap-4 p-4 rounded-3xl border transition-all duration-300 cursor-pointer animate-slide-up hover:scale-105 active:scale-95 ${
                      isRead
                        ? 'border-[#1f1f1f] bg-black/40'
                        : 'border-brand-pink/50 bg-black/60 shadow-neon-pink/20'
                    }`}
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                    onClick={() => handleMarkAsRead(notif.id)}
                  >
                    <div className="relative">
                      <img
                        src={getNotificationAvatar(notif.type)}
                        alt="avatar"
                        className="w-12 h-12 rounded-full object-cover border-2 border-brand-pink"
                      />
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-brand-pink to-brand-purple flex items-center justify-center">
                        <i className={`${getNotificationIcon(notif.type)} text-xs`} />
                      </div>
                      {!isRead && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-brand-pink rounded-full border-2 border-black animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${isRead ? 'text-gray-300' : 'text-white font-semibold'}`}>
                        {notif.text}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{formatTime(notif.createdAt)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notif.id);
                      }}
                      className={`text-sm transition-all duration-300 hover:scale-110 active:scale-95 ${
                        isRead
                          ? 'text-gray-500'
                          : 'text-brand-pink hover:text-brand-cyan'
                      } ${animatingButtons[`read-${notif.id}`] ? 'animate-spin' : ''}`}
                    >
                      {isRead ? (
                        <i className="fa-regular fa-check-circle" />
                      ) : (
                        <i className="fa-regular fa-circle" />
                      )}
                    </button>
                  </article>
                );
              })
            ) : (
              <div className="text-center py-12 animate-fade-in">
                <i className="fa-regular fa-bell text-6xl text-gray-600 mb-4" />
                <p className="text-gray-400">No notifications yet</p>
              </div>
            )}
          </div>
        </section>

        <aside className="w-full lg:w-96 space-y-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold mb-4">Your vibe summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Total', value: notifications.length, icon: 'fa-regular fa-bell' },
                { label: 'Unread', value: notifications.filter((n) => !n.read).length, icon: 'fa-solid fa-circle' },
                { label: 'Likes', value: notifications.filter((n) => n.type === 'like').length, icon: 'fa-regular fa-heart' },
                { label: 'Comments', value: notifications.filter((n) => n.type === 'comment').length, icon: 'fa-regular fa-comment' },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className="p-4 rounded-2xl bg-[#111] border border-[#1f1f1f] text-center hover:border-brand-pink transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer animate-scale-in"
                  style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                >
                  <i className={`${stat.icon} text-brand-pink mb-2 text-xl`} />
                  <p className="text-2xl font-bold text-gradient">{stat.value}</p>
                  <p className="text-gray-400 text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Notifications;
