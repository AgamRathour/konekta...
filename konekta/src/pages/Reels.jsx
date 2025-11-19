import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { api } from '../utils/api';
import { useAuthGuard } from '../hooks/useAuthGuard';

const defaultReels = [
  {
    id: '1',
    user: 'travel_adventures',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    caption: 'Amazing sunset at the beach 🌅',
    likes: 1245,
    comments: 89,
    views: 5432,
  },
  {
    id: '2',
    user: 'tech_creator',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    caption: 'Tech tips and tricks! 💻',
    likes: 2341,
    comments: 156,
    views: 8921,
  },
];

const Reels = () => {
  useAuthGuard();
  const navigate = useNavigate();
  const [reels, setReels] = useState(defaultReels);
  const containerRef = useRef(null);
  const viewedSetRef = useRef(new Set());

  useEffect(() => {
    document.title = 'Konekta | Reels';
  }, []);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const response = await api.fetchReels();
        if (!Array.isArray(response) || response.length === 0) return;
        const normalized = response.map((reel) => ({
          id: reel._id || reel.id,
          user: reel.user || 'konekta_creator',
          videoUrl: reel.videoUrl,
          caption: reel.caption || '',
          likes: reel.likes ?? 0,
          comments: reel.comments?.length ?? 0,
          views: reel.views ?? 0,
        }));
        setReels((prev) => [...normalized, ...prev]);
      } catch (err) {
        console.warn('Unable to load reels', err);
      }
    };
    fetchReels();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const videos = container.querySelectorAll('video');
      videos.forEach((video) => {
        const rect = video.getBoundingClientRect();
        const fullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
        if (fullyVisible) {
          video.play().catch(() => {});
          const reelId = video.dataset.id;
          if (reelId && !viewedSetRef.current.has(reelId)) {
            viewedSetRef.current.add(reelId);
            setReels((prev) =>
              prev.map((reel) =>
                reel.id === reelId
                  ? {
                      ...reel,
                      views: reel.views + 1,
                    }
                  : reel,
              ),
            );
            api.viewReel(reelId).catch(() => {});
          }
        } else {
          video.pause();
        }
      });
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => container.removeEventListener('scroll', handleScroll);
  }, [reels]);

  const handleLike = (id) => {
    const targetReel = reels.find((reel) => reel.id === id);
    const delta = targetReel && targetReel.liked ? -1 : 1;

    setReels((prev) =>
      prev.map((reel) =>
        reel.id === id
          ? {
              ...reel,
              liked: !reel.liked,
              likes: reel.likes + (reel.liked ? -1 : 1),
            }
          : reel,
      ),
    );
    api.likeReel(id, delta).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-black text-white flex animate-fade-in">
      <Sidebar />
      <div className="flex-1 relative flex flex-col">
        <button
          type="button"
          onClick={() => navigate('/feed')}
          className="absolute z-20 top-6 left-6 w-12 h-12 rounded-full bg-black/60 flex items-center justify-center border border-white/20 hover:bg-black/80 hover:scale-110 transition-all duration-300"
        >
          <i className="fa-solid fa-arrow-left" />
        </button>
        <div
          ref={containerRef}
          className="flex-1 overflow-y-scroll scroll-smooth snap-y snap-mandatory no-scrollbar"
        >
          {reels.map((reel, index) => (
            <div key={reel.id} className="h-screen w-full snap-start relative flex items-center justify-center bg-black animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <video
                data-id={reel.id}
                className="h-full w-full object-cover"
                loop
                muted
                playsInline
                preload="metadata"
                src={reel.videoUrl}
              />
              <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black via-black/20 to-transparent">
                <p className="text-sm text-gray-300">@{reel.user}</p>
                <p className="text-lg font-semibold">{reel.caption}</p>
              </div>
              <div className="absolute right-6 bottom-28 space-y-6 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleLike(reel.id)}
                  className={`w-14 h-14 rounded-full bg-white/10 backdrop-blur flex flex-col items-center justify-center hover:scale-110 transition-all duration-300 ${
                    reel.liked ? 'text-brand-pink shadow-neon-pink' : ''
                  }`}
                >
                  <i className={`fa-${reel.liked ? 'solid' : 'regular'} fa-heart text-xl`} />
                  <span className="text-xs font-semibold mt-1">{reel.likes}</span>
                </button>
                <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur flex flex-col items-center justify-center hover:scale-110 transition-all duration-300">
                  <i className="fa-regular fa-comment text-xl" />
                  <span className="text-xs font-semibold mt-1">{reel.comments}</span>
                </div>
                <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur flex flex-col items-center justify-center hover:scale-110 transition-all duration-300">
                  <i className="fa-solid fa-share text-xl" />
                </div>
                <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur flex flex-col items-center justify-center hover:scale-110 transition-all duration-300">
                  <i className="fa-solid fa-eye text-xl" />
                  <span className="text-xs font-semibold mt-1">{reel.views}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reels;


