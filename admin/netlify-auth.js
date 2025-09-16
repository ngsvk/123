// Netlify-compatible Authentication System
// Works with Netlify Functions instead of PHP

class NetlifyAuth {
  constructor() {
    this.apiBase = '/.netlify/functions/api';
    this.sessionKey = 'sssbpuc_session';
    this.init();
  }

  init() {
    console.log('🔐 Netlify Auth System initialized');
    
    // Check if user is already logged in
    this.checkExistingSession();
  }

  async checkExistingSession() {
    const session = this.getSession();
    if (session && session.sessionId) {
      // Validate session with server if needed
      return true;
    }
    return false;
  }

  getSession() {
    try {
      const session = localStorage.getItem(this.sessionKey);
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('Error reading session:', error);
      return null;
    }
  }

  setSession(sessionData) {
    try {
      localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
      return true;
    } catch (error) {
      console.error('Error saving session:', error);
      return false;
    }
  }

  clearSession() {
    localStorage.removeItem(this.sessionKey);
  }

  async login(username, password) {
    try {
      const response = await fetch(`${this.apiBase}?endpoint=login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();

      if (result.success) {
        const sessionData = {
          sessionId: result.sessionId,
          username: result.username,
          loginTime: Date.now(),
          expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };
        
        this.setSession(sessionData);
        console.log('✅ Login successful');
        return { success: true, user: sessionData };
      } else {
        throw new Error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, error: error.message };
    }
  }

  logout() {
    this.clearSession();
    console.log('👋 Logged out successfully');
    
    // Redirect to login page
    if (window.location.pathname !== '/admin/' && window.location.pathname !== '/admin/index.html') {
      window.location.href = '/admin/';
    }
  }

  isAuthenticated() {
    const session = this.getSession();
    if (!session || !session.sessionId) {
      return false;
    }

    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      this.clearSession();
      return false;
    }

    return true;
  }

  requireAuth() {
    if (!this.isAuthenticated()) {
      console.log('🚫 Authentication required');
      window.location.href = '/admin/';
      return false;
    }
    return true;
  }

  getAuthHeaders() {
    const session = this.getSession();
    return session?.sessionId ? {
      'X-Session-ID': session.sessionId
    } : {};
  }

  // API request wrapper with authentication
  async apiRequest(endpoint, options = {}) {
    const session = this.getSession();
    
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers
      }
    };

    const finalOptions = { ...defaultOptions, ...options };
    const url = `${this.apiBase}?endpoint=${endpoint}`;

    try {
      const response = await fetch(url, finalOptions);
      const result = await response.json();

      if (response.status === 401 || (result.error && result.error.includes('Unauthorized'))) {
        console.log('🚫 Session expired, logging out...');
        this.logout();
        throw new Error('Session expired');
      }

      return result;
    } catch (error) {
      console.error(`API request failed (${endpoint}):`, error);
      throw error;
    }
  }

  // Convenience methods for common API calls
  async get(endpoint, params = {}) {
    const queryString = Object.keys(params).length 
      ? '&' + new URLSearchParams(params).toString()
      : '';
    
    return this.apiRequest(endpoint + queryString);
  }

  async post(endpoint, data) {
    return this.apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data) {
    return this.apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint, data) {
    return this.apiRequest(endpoint, {
      method: 'DELETE',
      body: JSON.stringify(data)
    });
  }
}

// Global instance
window.netlifyAuth = new NetlifyAuth();

// Compatibility with existing code
window.staticAuth = {
  login: (username, password) => window.netlifyAuth.login(username, password),
  logout: () => window.netlifyAuth.logout(),
  isAuthenticated: () => window.netlifyAuth.isAuthenticated(),
  requireAuth: () => window.netlifyAuth.requireAuth(),
  getAuthHeaders: () => window.netlifyAuth.getAuthHeaders(),
  
  // API wrapper functions for backward compatibility
  get: (endpoint, params) => window.netlifyAuth.get(endpoint, params),
  post: (endpoint, data) => window.netlifyAuth.post(endpoint, data),
  put: (endpoint, data) => window.netlifyAuth.put(endpoint, data),
  delete: (endpoint, data) => window.netlifyAuth.delete(endpoint, data)
};

// Auto-initialization
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Netlify Auth ready');
  
  // Auto-require auth on admin pages (except login)
  const currentPath = window.location.pathname;
  const isAdminPage = currentPath.includes('/admin/') && 
                     !currentPath.endsWith('/admin/') && 
                     !currentPath.endsWith('/admin/index.html');
  
  if (isAdminPage && !window.netlifyAuth.isAuthenticated()) {
    console.log('🔒 Redirecting to login...');
    window.location.href = '/admin/';
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NetlifyAuth;
}
