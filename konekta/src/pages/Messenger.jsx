import { useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuthGuard } from '../hooks/useAuthGuard';

const formatTime = (date) =>
  date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

const makeId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const conversationData = {
  'Michael Daws': [
    { type: 'received', text: "Hey there! How's it going?", time: '10:30 AM' },
    { type: 'sent', text: 'Pretty good! Just finished some work. How about you?', time: '10:32 AM', id: 'm1' },
    { type: 'received', text: "I'm doing great! Just got back from a hike. The views were amazing!", time: '10:35 AM' },
  ],
  'Laura Quinn': [
    { type: 'received', text: 'Hey, are we still meeting today?', time: '09:15 AM' },
    { type: 'sent', text: "Yes, definitely! I'll be there at 6 PM.", time: '09:20 AM', id: 'l1' },
  ],
};

const contactList = [
  {
    name: 'Michael Daws',
    avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
    preview: 'Perfect! Saturday it is.',
    unread: 2,
    status: 'Active now',
  },
  {
    name: 'Laura Quinn',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    preview: 'See you at 6 PM!',
    unread: 0,
    status: 'Active 20m ago',
  },
];

const Messenger = () => {
  useAuthGuard();
  const [threads, setThreads] = useState(conversationData);
  const [activeUser, setActiveUser] = useState(Object.keys(conversationData)[0]);
  const [search, setSearch] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const messageAreaRef = useRef(null);

  useEffect(() => {
    document.title = 'Konekta | Messenger';
  }, []);

  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, [threads, activeUser]);

  const filteredContacts = useMemo(
    () =>
      contactList.filter((contact) =>
        contact.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  const activeMessages = threads[activeUser] ?? [];

  const handleSend = () => {
    const text = messageInput.trim();
    if (!text) return;
    const newMessage = { id: makeId(), type: 'sent', text, time: formatTime(new Date()) };
    setThreads((prev) => {
      const nextMessages = [...(prev[activeUser] || []), newMessage];
      return { ...prev, [activeUser]: nextMessages };
    });
    setMessageInput('');

    setTimeout(() => {
      setThreads((prev) => {
        const existing = prev[activeUser] || [];
        const replyMsg = { id: makeId(), type: 'received', text: 'Sounds interesting!', time: formatTime(new Date()) };
        return {
          ...prev,
          [activeUser]: [...existing, replyMsg],
        };
      });
    }, 1000 + Math.random() * 1500);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex animate-fade-in">
      <Sidebar />

      <div className="flex-1 flex flex-col lg:flex-row gap-6 px-4 lg:px-8 py-6">
        <section className="lg:w-1/3 glass-panel p-5 flex flex-col animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Messages</h2>
            <button
              type="button"
              className="px-3 py-1 rounded-full bg-gradient-to-r from-brand-pink to-brand-purple text-sm font-semibold hover:scale-105 transition-all duration-300 shadow-neon-pink"
            >
              New Chat
            </button>
          </div>
          <div className="relative mb-4">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search friends, clubs..."
              className="w-full bg-[#111] border border-transparent focus:border-brand-pink rounded-full py-3 pl-12 pr-4 text-sm text-white input-field"
            />
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
            {filteredContacts.map((contact, index) => (
              <button
                key={contact.name}
                type="button"
                onClick={() => setActiveUser(contact.name)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all duration-300 hover:scale-105 animate-slide-up ${
                  activeUser === contact.name ? 'bg-[#1a1a1a] border border-brand-pink/50 shadow-neon-pink' : 'bg-[#111] hover:bg-[#1a1a1a]'
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="relative">
                  <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full object-cover" />
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#111] bg-brand-cyan" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{contact.name}</p>
                  <p className="text-xs text-gray-400 line-clamp-1">{contact.preview}</p>
                </div>
                {contact.unread > 0 && (
                  <span className="text-xs font-bold bg-brand-pink rounded-full px-2 py-0.5 shadow-neon-pink animate-pulse-glow">
                    {contact.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="flex-1 glass-panel flex flex-col animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <header className="flex items-center gap-4 border-b border-[#1f1f1f] px-6 py-4">
            <img
              src={contactList.find((c) => c.name === activeUser)?.avatar}
              alt={activeUser}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold">{activeUser}</p>
              <p className="text-xs text-gray-400">{contactList.find((c) => c.name === activeUser)?.status}</p>
            </div>
            <div className="flex gap-3 text-gray-400">
              <button type="button" className="w-10 h-10 rounded-full border border-[#333] hover:border-brand-pink hover:scale-110 transition-all duration-300">
                <i className="fa-regular fa-bell" />
              </button>
              <button type="button" className="w-10 h-10 rounded-full border border-[#333] hover:border-brand-pink hover:scale-110 transition-all duration-300">
                <i className="fa-solid fa-ellipsis" />
              </button>
            </div>
          </header>

          <div ref={messageAreaRef} className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 space-y-4">
            {activeMessages.map((message, index) => (
              <div key={message.id ?? index} className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'} animate-slide-up`} style={{ animationDelay: `${index * 0.05}s` }}>
                <div
                  className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-relaxed relative transition-all duration-300 hover:scale-105 ${
                    message.type === 'sent'
                      ? 'bg-gradient-to-r from-brand-pink to-brand-purple shadow-neon-pink'
                      : 'bg-[#111] border border-[#1f1f1f]'
                  }`}
                >
                  <p>{message.text}</p>
                  <span className="block text-[11px] text-gray-200/70 mt-2">{message.time}</span>
                </div>
              </div>
            ))}
          </div>

          <footer className="border-t border-[#1f1f1f] px-6 py-4 flex items-center gap-3">
            <button type="button" className="w-11 h-11 rounded-full bg-[#111] border border-[#333] text-xl text-gray-400 hover:border-brand-pink hover:scale-110 transition-all duration-300">
              <i className="fa-solid fa-paperclip" />
            </button>
            <textarea
              value={messageInput}
              onChange={(event) => setMessageInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 resize-none bg-[#111] border border-transparent focus:border-brand-pink rounded-2xl px-4 py-3 text-sm text-white input-field"
            />
            <button
              type="button"
              onClick={handleSend}
              className="w-12 h-12 rounded-2xl bg-gradient-to-r from-brand-pink to-brand-cyan text-lg flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-neon-pink"
            >
              <i className="fa-solid fa-paper-plane" />
            </button>
          </footer>
        </section>
      </div>
    </div>
  );
};

export default Messenger;


