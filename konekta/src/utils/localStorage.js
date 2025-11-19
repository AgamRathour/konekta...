// LocalStorage utility functions
const STORAGE_KEYS = {
  USERS: 'konekta_users',
  POSTS: 'konekta_posts',
  CURRENT_USER: 'konekta_current_user',
  NOTIFICATIONS: 'konekta_notifications',
};

const generateId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

// User management
export const userStorage = {
  getUsers() {
    try {
      const users = localStorage.getItem(STORAGE_KEYS.USERS);
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  },

  saveUser(userData) {
    const users = this.getUsers();
    const userId = generateId();
    const newUser = {
      id: userId,
      ...userData,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  },

  findUserByEmail(email) {
    const users = this.getUsers();
    return users.find((u) => u.email === email);
  },

  findUserById(id) {
    const users = this.getUsers();
    return users.find((u) => u.id === id);
  },

  setCurrentUser(userId) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
  },

  getCurrentUser() {
    const userId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!userId) return null;
    return this.findUserById(userId);
  },

  clearCurrentUser() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },
};

// Posts management
export const postStorage = {
  getPosts() {
    try {
      const posts = localStorage.getItem(STORAGE_KEYS.POSTS);
      return posts ? JSON.parse(posts) : [];
    } catch {
      return [];
    }
  },

  savePost(postData) {
    const posts = this.getPosts();
    const postId = generateId();
    const newPost = {
      id: postId,
      ...postData,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: [],
      shares: 0,
      likedBy: [],
    };
    posts.unshift(newPost);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return newPost;
  },

  updatePost(postId, updates) {
    const posts = this.getPosts();
    const index = posts.findIndex((p) => p.id === postId);
    if (index === -1) return null;
    posts[index] = { ...posts[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return posts[index];
  },

  deletePost(postId) {
    const posts = this.getPosts();
    const filtered = posts.filter((p) => p.id !== postId);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(filtered));
    return true;
  },

  likePost(postId, userId) {
    const posts = this.getPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post) return null;

    const likedBy = post.likedBy || [];
    const isLiked = likedBy.includes(userId);

    if (isLiked) {
      post.likedBy = likedBy.filter((id) => id !== userId);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy = [...likedBy, userId];
      post.likes = (post.likes || 0) + 1;
    }

    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return post;
  },

  addComment(postId, comment) {
    const posts = this.getPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post) return null;

    const newComment = {
      id: generateId(),
      ...comment,
      createdAt: new Date().toISOString(),
    };
    post.comments = [...(post.comments || []), newComment];
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return post;
  },

  sharePost(postId) {
    const posts = this.getPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post) return null;
    post.shares = (post.shares || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return post;
  },
};

// Notifications management
export const notificationStorage = {
  getNotifications() {
    try {
      const notifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return notifications ? JSON.parse(notifications) : [];
    } catch {
      return [];
    }
  },

  addNotification(notification) {
    const notifications = this.getNotifications();
    const newNotif = {
      id: generateId(),
      ...notification,
      createdAt: new Date().toISOString(),
      read: false,
    };
    notifications.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    return newNotif;
  },

  markAsRead(notifId) {
    const notifications = this.getNotifications();
    const notif = notifications.find((n) => n.id === notifId);
    if (notif) {
      notif.read = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    }
    return notif;
  },

  clearNotifications() {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
  },
};

