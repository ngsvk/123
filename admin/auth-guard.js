// Authentication Guard for Dashboard Protection
class DashboardAuthGuard {
  constructor() {
    this.sessionKey = 'admin_session';
    this.loginPath = './admin/login.html';
    this.isStaticMode = !window.location.href.includes('localhost') && !window.location.href.includes('127.0.0.1');
    this.checkInterval = null;
    
    this.init();
  }

  init() {
    // Immediately check authentication on page load
    if (!this.isAuthenticated()) {
      this.redirectToLogin();
      return;
    }

    // Set up periodic authentication checks
    this.startAuthenticationCheck();
    
    // Listen for logout events
    this.setupLogoutHandler();
    
    // Listen for storage changes (logout in another tab)
    this.setupStorageListener();

    console.log('✅ Dashboard authentication guard initialized');
  }

  isAuthenticated() {
    if (this.isStaticMode || window.staticAuth) {
      // Static authentication mode (Netlify)
      const session = sessionStorage.getItem(this.sessionKey);
      if (!session) return false;

      try {
        const sessionData = JSON.parse(session);
        return sessionData.authenticated === true;
      } catch (e) {
        return false;
      }
    } else {
      // PHP mode - check for session (simplified for now)
      const session = sessionStorage.getItem(this.sessionKey);
      return session && JSON.parse(session).authenticated === true;
    }
  }

  redirectToLogin() {
    console.log('🔒 Not authenticated - redirecting to login');
    
    // Clear any existing session data
    sessionStorage.removeItem(this.sessionKey);
    
    // Determine correct login path based on current location
    let loginUrl;
    const currentPath = window.location.pathname;
    const currentHref = window.location.href;
    
    console.log('Current path:', currentPath);
    console.log('Current href:', currentHref);
    
    if (currentPath.includes('/admin/')) {
      // We're in the admin folder, so login.html is in the same folder
      loginUrl = 'login.html';
      console.log('In admin folder, using relative path:', loginUrl);
    } else if (currentPath.endsWith('dashboard.html')) {
      // We're accessing dashboard from root, so need to go to admin folder
      loginUrl = 'admin/login.html';
      console.log('Dashboard from root, using admin path:', loginUrl);
    } else {
      // Default to admin login
      loginUrl = 'admin/login.html';
      console.log('Default case, using admin path:', loginUrl);
    }
    
    // Show a brief message before redirect (only if body exists)
    this.showRedirectMessage(() => {
      window.location.href = loginUrl;
    });
  }
  
  showRedirectMessage(callback) {
    const displayMessage = () => {
      if (document.body) {
        document.body.innerHTML = `
          <div class="min-h-screen flex items-center justify-center bg-gray-50">
            <div class="text-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p class="text-gray-600">Redirecting to login...</p>
            </div>
          </div>
        `;
        
        // Execute callback after brief delay
        setTimeout(callback, 500);
      } else {
        // Body doesn't exist yet, wait for DOM
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', displayMessage);
        } else {
          // DOM is ready but body still doesn't exist, just redirect
          setTimeout(callback, 100);
        }
      }
    };
    
    displayMessage();
  }

  startAuthenticationCheck() {
    // Check authentication every 30 seconds
    this.checkInterval = setInterval(() => {
      if (!this.isAuthenticated()) {
        this.handleAuthenticationLoss();
      }
    }, 30000);
  }

  handleAuthenticationLoss() {
    console.warn('🔒 Authentication lost - user will be redirected');
    
    // Clear the interval to prevent multiple redirects
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    // Show notification
    this.showAuthLossNotification();
    
    // Redirect after showing notification
    setTimeout(() => {
      this.redirectToLogin();
    }, 3000);
  }

  showAuthLossNotification() {
    // Create a toast notification only if document.body exists
    if (!document.body) {
      console.warn('Cannot show auth loss notification - document.body not available');
      return;
    }
    
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg';
    toast.innerHTML = `
      <div class="flex items-center">
        <i class="ri-error-warning-line mr-2"></i>
        <span>Session expired. Redirecting to login...</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3000);
  }

  setupLogoutHandler() {
    // Handle logout button clicks
    document.addEventListener('click', (e) => {
      if (e.target.id === 'logout-btn' || e.target.closest('#logout-btn')) {
        e.preventDefault();
        this.logout();
      }
    });
  }

  setupStorageListener() {
    // Listen for session changes in other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === this.sessionKey && !e.newValue) {
        // Session was cleared in another tab
        this.handleAuthenticationLoss();
      }
    });
  }

  logout() {
    console.log('🔓 User logging out');
    
    // Clear the authentication check interval
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    // Clear session storage
    sessionStorage.removeItem(this.sessionKey);
    
    // If using static auth, call its logout method
    if (window.staticAuth) {
      window.staticAuth.logout();
    }
    
    // Show logout message safely
    this.showLogoutMessage();
  }
  
  showLogoutMessage() {
    const displayLogoutMessage = () => {
      if (document.body) {
        document.body.innerHTML = `
          <div class="min-h-screen flex items-center justify-center bg-gray-50">
            <div class="text-center">
              <div class="mb-4">
                <i class="ri-logout-box-line text-4xl text-green-600"></i>
              </div>
              <h2 class="text-xl font-semibold text-gray-800 mb-2">Logged Out Successfully</h2>
              <p class="text-gray-600 mb-4">Redirecting to login page...</p>
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          </div>
        `;
      }
      
      // Redirect to login with correct path
      setTimeout(() => {
        const currentPath = window.location.pathname;
        const currentHref = window.location.href;
        let loginUrl;
        
        console.log('Logout redirect - Current path:', currentPath);
        console.log('Logout redirect - Current href:', currentHref);
        
        if (currentPath.includes('/admin/')) {
          // We're in the admin folder, so login.html is in the same folder
          loginUrl = 'login.html';
          console.log('Logout from admin folder, using:', loginUrl);
        } else if (currentPath.endsWith('dashboard.html')) {
          // We're accessing dashboard from root, so need to go to admin folder
          loginUrl = 'admin/login.html';
          console.log('Logout from dashboard in root, using:', loginUrl);
        } else {
          // Default to admin login
          loginUrl = 'admin/login.html';
          console.log('Logout default case, using:', loginUrl);
        }
        
        console.log('Final logout redirect to:', loginUrl);
        window.location.href = loginUrl;
      }, 2000);
    };
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', displayLogoutMessage);
    } else {
      displayLogoutMessage();
    }
  }

  // Method to check if the guard is working (for debugging)
  getStatus() {
    return {
      isAuthenticated: this.isAuthenticated(),
      isStaticMode: this.isStaticMode,
      sessionExists: !!sessionStorage.getItem(this.sessionKey),
      checkIntervalActive: !!this.checkInterval
    };
  }
}

// Initialize the authentication guard immediately
(function() {
  // Only run if we're on a dashboard or admin page
  const isDashboardPage = window.location.pathname.includes('dashboard') || 
                         document.title.includes('Dashboard') ||
                         document.title.includes('Admin');
                         
  if (isDashboardPage) {
    console.log('🛡️ Initializing Dashboard Authentication Guard...');
    window.authGuard = new DashboardAuthGuard();
  }
})();

console.log('🛡️ Authentication Guard loaded');
