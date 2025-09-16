// Static Authentication for Netlify Deployment
class StaticAuth {
  constructor() {
    this.credentials = {
      username: 'admin',
      password: 'sssbpuc2025'
    };
    this.sessionKey = 'admin_session';
    this.maxAttempts = 3;
    this.lockoutTime = 15 * 60 * 1000; // 15 minutes
  }

  // Mock API response structure
  createResponse(success, data = {}, error = null) {
    return {
      success,
      ...data,
      error
    };
  }

  // Simulate login endpoint
  async login(username, password) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (username === this.credentials.username && password === this.credentials.password) {
      // Create session
      const session = {
        authenticated: true,
        username: username,
        login_time: Date.now(),
        csrf_token: this.generateCSRFToken()
      };

      sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
      
      return this.createResponse(true, {
        message: 'Login successful',
        username: username,
        csrf_token: session.csrf_token
      });
    } else {
      return this.createResponse(false, {}, 'Invalid credentials');
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const session = sessionStorage.getItem(this.sessionKey);
    if (!session) return false;

    try {
      const sessionData = JSON.parse(session);
      return sessionData.authenticated === true;
    } catch (e) {
      return false;
    }
  }

  // Logout
  logout() {
    sessionStorage.removeItem(this.sessionKey);
    return this.createResponse(true, { message: 'Logged out successfully' });
  }

  // Generate mock CSRF token
  generateCSRFToken() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
  }

  // Get session data
  getSession() {
    const session = sessionStorage.getItem(this.sessionKey);
    return session ? JSON.parse(session) : null;
  }

  // Mock content loading (since we can't use PHP file operations)
  async getContent(page) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    try {
      const response = await fetch(`../data/${page}.json`);
      if (response.ok) {
        const content = await response.json();
        return this.createResponse(true, { content });
      } else {
        // Return default content if file doesn't exist
        const defaultContent = { 
          sections: [], 
          meta: { title: '', description: '' } 
        };
        return this.createResponse(true, { content: defaultContent });
      }
    } catch (error) {
      const defaultContent = { 
        sections: [], 
        meta: { title: '', description: '' } 
      };
      return this.createResponse(true, { content: defaultContent });
    }
  }

  // Mock save content (for demo purposes - in production you'd need Netlify Functions)
  async saveContent(page, content) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real static site, you'd need to use Netlify Functions or another backend
    console.warn('Save content called - this requires server-side functionality');
    console.log('Page:', page, 'Content:', content);
    
    // For demo purposes, save to localStorage
    localStorage.setItem(`content_${page}`, JSON.stringify(content));
    
    return this.createResponse(true, { 
      message: 'Content saved to browser storage (demo mode)',
      timestamp: Date.now()
    });
  }

  // Get pages list
  async getPages() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const pages = ['index', 'about', 'academics', 'admissions', 'campus-life', 'gallery'];
    const pageData = pages.map(page => ({
      name: page,
      exists: true, // Assume all pages exist for demo
      size: 1024,   // Mock size
      modified: Date.now()
    }));

    return this.createResponse(true, { pages: pageData });
  }

  // Mock stats
  async getStats() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return this.createResponse(true, {
      stats: {
        totalFiles: 25,
        mediaCount: 10,
        totalPages: 6,
        lastUpdated: new Date().toISOString().slice(0, 19).replace('T', ' ')
      }
    });
  }

  // Mock system info
  async getSystemInfo() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return this.createResponse(true, {
      systemInfo: {
        phpVersion: 'N/A (Static Site)',
        serverSoftware: 'Netlify',
        storageUsed: 5.2,
        lastLogin: this.getSession()?.login_time || null,
        sessionId: 'static-session',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    });
  }
}

// Create global instance
window.staticAuth = new StaticAuth();

// Override the original API calls to use static auth
window.mockAPI = async function(endpoint, options = {}) {
  const auth = window.staticAuth;
  
  // Parse endpoint and method
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body) : {};

  console.log('Mock API Call:', endpoint, method, body);

  switch (endpoint) {
    case 'login':
      if (method === 'POST') {
        return auth.login(body.username, body.password);
      }
      break;
      
    case 'logout':
      return auth.logout();
      
    case 'get-content':
    case 'public-content':
      const page = new URLSearchParams(window.location.search).get('page') || body.page;
      return auth.getContent(page);
      
    case 'save-content':
      if (method === 'POST') {
        return auth.saveContent(body.page, body.content);
      }
      break;
      
    case 'get-pages':
      return auth.getPages();
      
    case 'stats':
      return auth.getStats();
      
    case 'system-info':
      return auth.getSystemInfo();
      
    default:
      return auth.createResponse(false, {}, `Endpoint '${endpoint}' not implemented in static mode`);
  }
  
  return auth.createResponse(false, {}, 'Invalid request');
};

console.log('Static Auth initialized for Netlify deployment');
