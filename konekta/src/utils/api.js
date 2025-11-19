const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = {
  async login(credentials) {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  async signup(userData) {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Signup failed');
    return response.json();
  },

  async fetchPosts() {
    const response = await fetch(`${API_URL}/posts`);
    if (!response.ok) return [];
    return response.json();
  },

  async likePost(postId, delta) {
    await fetch(`${API_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta }),
    });
  },

  async addComment(postId, comment) {
    await fetch(`${API_URL}/posts/${postId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment),
    });
  },

  async fetchReels() {
    const response = await fetch(`${API_URL}/reels`);
    if (!response.ok) return [];
    return response.json();
  },

  async viewReel(reelId) {
    await fetch(`${API_URL}/reels/${reelId}/view`, { method: 'POST' });
  },

  async likeReel(reelId, delta) {
    await fetch(`${API_URL}/reels/${reelId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta }),
    });
  },
};


