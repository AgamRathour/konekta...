import { useEffect, useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { postStorage, userStorage, notificationStorage } from '../utils/localStorage';

const stories = [
  {
    id: 1,
    name: 'Laura Quinn',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    background: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
    live: true,
  },
  {
    id: 2,
    name: 'James Williams',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    background: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    name: 'Lura Cap',
    avatar: 'https://randomuser.me/api/portraits/women/11.jpg',
    background: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    name: 'Michael Daws',
    avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
    background: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
  },
];

const matchDeck = [
  {
    id: 'match-1',
    name: 'Aisha Khan',
    age: 21,
    major: 'Design',
    distance: '0.8 mi away',
    interests: ['Art walks', 'Spotify swaps', 'Photo clubs'],
    avatar: 'https://randomuser.me/api/portraits/women/52.jpg',
    background: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'match-2',
    name: 'Sid Mehta',
    age: 22,
    major: 'Computer Science',
    distance: '1.5 mi away',
    interests: ['Hackathons', 'Indie music', 'Late-night coffee'],
    avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
    background: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
  },
];

const Feed = () => {
  const currentUser = useAuthGuard();
  const [posts, setPosts] = useState([]);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ text: '', image: null, imagePreview: null });
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [animatingButtons, setAnimatingButtons] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    document.title = 'Konekta Feed';
    loadPosts();
    loadLikedPosts();
  }, []);

  const loadPosts = () => {
    const storedPosts = postStorage.getPosts();
    if (storedPosts.length === 0) {
      // Add a default post if no posts exist
      const defaultPost = {
        id: 'default-1',
        userId: 'system',
        user: 'Konekta Team',
        handle: '@konekta',
        text: 'Welcome to Konekta! Share your moments, connect with friends, and spark new conversations. ✨',
        image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80',
        likes: 0,
        comments: [],
        shares: 0,
        createdAt: new Date().toISOString(),
        likedBy: [],
      };
      postStorage.savePost(defaultPost);
      setPosts([defaultPost]);
    } else {
      setPosts(storedPosts);
    }
  };

  const loadLikedPosts = () => {
    if (!currentUser?.id) return;
    const storedPosts = postStorage.getPosts();
    const liked = new Set();
    storedPosts.forEach((post) => {
      if (post.likedBy?.includes(currentUser.id)) {
        liked.add(post.id);
      }
    });
    setLikedPosts(liked);
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

  const handleLike = (postId) => {
    if (!currentUser?.id) return;
    
    setAnimatingButtons((prev) => ({ ...prev, [`like-${postId}`]: true }));
    setTimeout(() => {
      setAnimatingButtons((prev) => ({ ...prev, [`like-${postId}`]: false }));
    }, 600);

    const isLiked = likedPosts.has(postId);
    const updatedPost = postStorage.likePost(postId, currentUser.id);
    
    if (updatedPost) {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: updatedPost.likes,
                likedBy: updatedPost.likedBy,
              }
            : post,
        ),
      );

      // Update liked posts set
      if (isLiked) {
        setLikedPosts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } else {
        setLikedPosts((prev) => new Set([...prev, postId]));
      }

      // Add notification
      if (!isLiked) {
        notificationStorage.addNotification({
          type: 'like',
          text: `${currentUser.username} liked your post ❤️`,
          postId,
        });
      }
    }
  };

  const toggleComment = (postId) => {
    setOpenComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleCommentChange = (postId, value) => {
    setCommentDrafts((prev) => ({ ...prev, [postId]: value }));
  };

  const handleCommentSubmit = (event, postId) => {
    event.preventDefault();
    const text = commentDrafts[postId]?.trim();
    if (!text || !currentUser?.id) return;

    setAnimatingButtons((prev) => ({ ...prev, [`comment-${postId}`]: true }));
    setTimeout(() => {
      setAnimatingButtons((prev) => ({ ...prev, [`comment-${postId}`]: false }));
    }, 300);

    const updatedPost = postStorage.addComment(postId, {
      user: currentUser.username,
      text,
    });

    if (updatedPost) {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: updatedPost.comments,
              }
            : post,
        ),
      );
      setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
      setOpenComments((prev) => ({ ...prev, [postId]: false }));

      // Add notification
      notificationStorage.addNotification({
        type: 'comment',
        text: `${currentUser.username} commented on your post 💬`,
        postId,
      });
    }
  };

  const handleShare = (postId) => {
    if (!currentUser?.id) return;

    setAnimatingButtons((prev) => ({ ...prev, [`share-${postId}`]: true }));
    setTimeout(() => {
      setAnimatingButtons((prev) => ({ ...prev, [`share-${postId}`]: false }));
    }, 600);

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const updatedPost = postStorage.sharePost(postId);
    if (updatedPost) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                shares: updatedPost.shares,
              }
            : p,
        ),
      );
    }

    if (navigator.share) {
      navigator.share({
        title: 'Konekta Post',
        text: post.text,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(`${post.text} — ${window.location.href}`);
      alert('Post copied! Ready to share ✨');
    }

    // Add notification
    notificationStorage.addNotification({
      type: 'share',
      text: `${currentUser.username} shared your post 🔗`,
      postId,
    });
  };

  const handleDeletePost = (postId) => {
    if (!currentUser?.id) return;
    const post = posts.find((p) => p.id === postId);
    if (post?.userId !== currentUser.id && post?.userId !== 'system') {
      alert('You can only delete your own posts.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this post?')) {
      postStorage.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
  };

  const handleCreatePost = () => {
    setShowCreateModal(true);
  };

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCreateForm((prev) => ({
        ...prev,
        image: file,
        imagePreview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePostSubmit = (event) => {
    event.preventDefault();
    if (!currentUser?.id) return;

    const text = createForm.text?.trim();
    if (!text && !createForm.image) {
      alert('Please add text or an image to your post.');
      return;
    }

    const postData = {
      userId: currentUser.id,
      user: currentUser.username,
      handle: `@${currentUser.username.toLowerCase()}`,
      text: text || '',
      image: createForm.imagePreview || null,
      likes: 0,
      comments: [],
      shares: 0,
      likedBy: [],
    };

    const newPost = postStorage.savePost(postData);
    setPosts((prev) => [newPost, ...prev]);
    setCreateForm({ text: '', image: null, imagePreview: null });
    setShowCreateModal(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getActivityData = () => {
    const notifications = notificationStorage.getNotifications();
    const recentNotifications = notifications.slice(0, 3).map((notif) => ({
      id: notif.id,
      avatar: 'https://randomuser.me/api/portraits/women/11.jpg',
      text: notif.text,
    }));

    return {
      notifications: recentNotifications,
      requests: [],
      matches: [],
    };
  };

  const activityData = getActivityData();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex animate-fade-in">
      <Sidebar onCreatePost={handleCreatePost} />

      <section className="flex-1 flex flex-col">
        <header className="lg:hidden sticky top-0 z-20 bg-[#0A0A0A]/95 backdrop-blur border-b border-[#1f1f1f] px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Konekta</p>
            <h1 className="font-poppins text-xl font-bold text-gradient">Swipe. Share. Spark.</h1>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center hover:bg-[#2a2a2a] transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <i className="fa-solid fa-rotate text-lg" />
            </button>
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-gradient-to-r from-brand-pink to-brand-purple flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 shadow-neon-pink"
            >
              <i className="fa-regular fa-bell text-lg" />
            </button>
          </div>
        </header>

        <div className="flex flex-col xl:flex-row gap-6 px-4 lg:px-8 py-8 flex-1">
          <main className="flex-1 space-y-8">
            <section className="animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Stories</h2>
                <button
                  type="button"
                  className="text-sm text-brand-pink hover:text-brand-cyan transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <i className="fa-regular fa-plus" />
                  Add story
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {stories.map((story, index) => (
                  <article
                    key={story.id}
                    className="relative w-24 h-40 rounded-2xl overflow-hidden flex-shrink-0 shadow-[0_10px_30px_rgba(0,0,0,0.35)] bg-[#111] hover:scale-105 transition-all duration-300 cursor-pointer animate-scale-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <img src={story.background} alt={story.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
                    <div className="absolute bottom-2 left-2 flex items-center gap-2">
                      <img
                        src={story.avatar}
                        alt={story.name}
                        className="w-7 h-7 rounded-full border-2 border-brand-pink object-cover"
                      />
                      <span className="text-xs font-semibold truncate">{story.name}</span>
                    </div>
                    {story.live && (
                      <span className="absolute top-2 left-2 bg-brand-pink text-[10px] font-bold px-2 py-0.5 rounded-full shadow-neon-pink animate-pulse-glow">
                        LIVE
                      </span>
                    )}
                  </article>
                ))}
              </div>
            </section>

            <section className="grid md:grid-cols-2 gap-5 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {matchDeck.map((card, index) => (
                <article
                  key={card.id}
                  className="glass-panel overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer animate-scale-in"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <div className="relative h-48">
                    <img src={card.background} alt={card.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-3">
                      <img
                        src={card.avatar}
                        alt={card.name}
                        className="w-14 h-14 rounded-full border-4 border-brand-pink object-cover"
                      />
                      <div>
                        <p className="font-poppins text-lg font-semibold">{card.name}</p>
                        <p className="text-sm text-gray-300">
                          {card.age} • {card.major}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <p className="text-sm text-gray-400">{card.distance}</p>
                    <div className="flex flex-wrap gap-2">
                      {card.interests.map((interest) => (
                        <span key={interest} className="chip">
                          {interest}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="flex-1 py-2 rounded-full border border-[#333] hover:border-brand-pink transition-all duration-300 hover:scale-105 active:scale-95"
                      >
                        Pass
                      </button>
                      <button
                        type="button"
                        className="flex-1 py-2 rounded-full bg-gradient-to-r from-brand-pink to-brand-purple shadow-lg shadow-brand-pink/50 hover:scale-105 active:scale-95 transition-all duration-300"
                      >
                        Match
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <section className="space-y-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              {posts.map((post, index) => {
                const isLiked = likedPosts.has(post.id);
                const isOwner = post.userId === currentUser?.id;
                const canDelete = isOwner || post.userId === 'system';

                return (
                  <article
                    key={post.id}
                    className="glass-panel overflow-hidden hover:scale-[1.01] transition-all duration-300 animate-slide-up"
                    style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                  >
                    <div className="px-6 pt-6 pb-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-pink to-brand-purple flex items-center justify-center font-semibold">
                        {post.user?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{post.user}</p>
                        <p className="text-xs text-gray-400">
                          {post.handle} • {formatTime(post.createdAt)}
                        </p>
                      </div>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDeletePost(post.id)}
                          className="text-red-400 hover:text-red-300 transition-all duration-300 hover:scale-110 active:scale-95"
                        >
                          <i className="fa-regular fa-trash-can" />
                        </button>
                      )}
                    </div>

                    {post.text && (
                      <p className="px-6 pb-4 text-base leading-relaxed text-gray-100">{post.text}</p>
                    )}

                    {post.image && (
                      <img src={post.image} alt="Post visual" className="w-full max-h-[420px] object-cover" />
                    )}

                    <div className="px-6 py-4 border-t border-[#1f1f1f] space-y-4">
                      <div className="flex items-center gap-6 text-sm text-gray-300">
                        <button
                          type="button"
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-2 transition-all duration-300 hover:scale-110 active:scale-95 ${
                            animatingButtons[`like-${post.id}`] ? 'animate-bounce' : ''
                          } ${isLiked ? 'text-brand-pink' : 'hover:text-white'}`}
                        >
                          <i
                            className={`fa-${isLiked ? 'solid' : 'regular'} fa-heart text-lg transition-all duration-300 ${
                              isLiked ? 'scale-125' : ''
                            }`}
                          />
                          {post.likes || 0}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleComment(post.id)}
                          className={`flex items-center gap-2 hover:text-brand-cyan transition-all duration-300 hover:scale-110 active:scale-95 ${
                            animatingButtons[`comment-${post.id}`] ? 'animate-pulse' : ''
                          }`}
                        >
                          <i className="fa-regular fa-comment text-lg" />
                          {post.comments?.length || 0}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShare(post.id)}
                          className={`flex items-center gap-2 hover:text-brand-purple transition-all duration-300 hover:scale-110 active:scale-95 ${
                            animatingButtons[`share-${post.id}`] ? 'animate-spin' : ''
                          }`}
                        >
                          <i className="fa-regular fa-paper-plane text-lg" />
                          {post.shares || 0}
                        </button>
                      </div>

                      {openComments[post.id] && (
                        <form
                          className="flex gap-3 animate-slide-up"
                          onSubmit={(event) => handleCommentSubmit(event, post.id)}
                        >
                          <input
                            type="text"
                            value={commentDrafts[post.id] ?? ''}
                            onChange={(event) => handleCommentChange(post.id, event.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 rounded-full bg-[#1a1a1a] border border-transparent focus:border-brand-pink px-4 py-2 text-sm text-white input-field"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-full bg-gradient-to-r from-brand-pink to-brand-cyan text-sm font-semibold hover:scale-105 active:scale-95 transition-all duration-300"
                          >
                            Post
                          </button>
                        </form>
                      )}

                      <div className="space-y-3">
                        {post.comments?.map((comment) => (
                          <div
                            key={comment.id}
                            className="bg-[#111111] rounded-2xl px-4 py-2 text-sm text-gray-200 animate-fade-in"
                          >
                            <span className="font-semibold mr-2">{comment.user}:</span>
                            {comment.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          </main>

          <aside className="w-full xl:w-96 glass-panel h-fit max-h-[90vh] overflow-y-auto no-scrollbar p-6 space-y-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Activity</h3>
              <span className="text-xs bg-brand-pink px-3 py-1 rounded-full shadow-neon-pink animate-pulse-glow">
                {activityData.notifications.length} new
              </span>
            </div>

            <div>
              <p className="text-xs uppercase text-gray-500 tracking-[0.3em] mb-3">Notifications</p>
              <div className="space-y-3">
                {activityData.notifications.length > 0 ? (
                  activityData.notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="flex items-center gap-3 border border-[#1f1f1f] rounded-2xl p-3 hover:border-brand-pink transition-all duration-300 hover:scale-105 cursor-pointer active:scale-95"
                    >
                      <img src={notif.avatar} alt="avatar" className="w-10 h-10 rounded-full border border-[#333]" />
                      <p className="text-sm text-gray-200">{notif.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No notifications yet</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50 px-4 animate-fade-in">
          <form
            onSubmit={handleCreatePostSubmit}
            className="w-full max-w-md glass-panel p-6 space-y-4 animate-scale-in"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gradient">Create new post</h3>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateForm({ text: '', image: null, imagePreview: null });
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-gray-400 hover:text-white transition-colors hover:scale-110 active:scale-95"
              >
                <i className="fa-regular fa-circle-xmark text-xl" />
              </button>
            </div>
            <textarea
              value={createForm.text}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, text: event.target.value }))}
              placeholder="What's on your mind?"
              className="w-full bg-black/40 border border-transparent focus:border-brand-pink rounded-2xl px-4 py-3 text-sm text-white input-field min-h-[120px]"
            />
            {createForm.imagePreview && (
              <div className="relative">
                <img
                  src={createForm.imagePreview}
                  alt="Preview"
                  className="w-full rounded-2xl max-h-64 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCreateForm((prev) => ({ ...prev, image: null, imagePreview: null }));
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/90 transition-all hover:scale-110 active:scale-95"
                >
                  <i className="fa-regular fa-trash-can text-xs" />
                </button>
              </div>
            )}
            <label className="block">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <div className="w-full py-3 rounded-full border-2 border-dashed border-brand-pink/50 text-center cursor-pointer hover:border-brand-pink hover:bg-brand-pink/10 transition-all duration-300 hover:scale-105 active:scale-95">
                <i className="fa-regular fa-image mr-2" />
                {createForm.image ? 'Change image' : 'Add image'}
              </div>
            </label>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateForm({ text: '', image: null, imagePreview: null });
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="btn-outline px-4 py-2"
              >
                Cancel
              </button>
              <button type="submit" className="btn-neon px-4 py-2">
                Post
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Feed;
