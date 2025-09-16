// Dynamic Navigation Loader for Netlify
// Loads navigation data from Netlify Functions API

class NetlifyNavigationLoader {
  constructor() {
    this.apiBase = '/.netlify/functions/api';
    this.cacheKey = 'sssbpuc_navigation_cache';
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.init();
  }

  init() {
    console.log('🧭 Netlify Navigation Loader initialized');
    this.loadNavigation();
  }

  // Check if we have cached navigation data
  getCachedNavigation() {
    try {
      // Check for force refresh flag
      const forceRefresh = localStorage.getItem('forceContentRefresh');
      if (forceRefresh === 'true') {
        console.log('🔄 Force refresh requested, clearing cache');
        localStorage.removeItem(this.cacheKey);
        localStorage.removeItem('forceContentRefresh');
        return null;
      }
      
      const cached = localStorage.getItem(this.cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        const isExpired = Date.now() - data.timestamp > this.cacheTimeout;
        
        if (!isExpired && data.navigation) {
          console.log('📦 Using cached navigation data');
          return data.navigation;
        }
      }
    } catch (error) {
      console.error('Error reading navigation cache:', error);
    }
    return null;
  }

  // Cache navigation data
  cacheNavigation(navigationData) {
    try {
      const cacheData = {
        navigation: navigationData,
        timestamp: Date.now()
      };
      localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
      console.log('💾 Navigation data cached');
    } catch (error) {
      console.error('Error caching navigation:', error);
    }
  }

  // Load navigation from API or cache
  async loadNavigation() {
    // Try cache first
    const cachedNav = this.getCachedNavigation();
    if (cachedNav) {
      this.renderNavigation(cachedNav);
      return;
    }

    // Load from API
    try {
      console.log('🌐 Loading navigation from API...');
      const response = await fetch(`${this.apiBase}?endpoint=get-navigation&_t=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        this.cacheNavigation(result.data);
        this.renderNavigation(result.data);
        console.log('✅ Navigation loaded from API');
      } else {
        throw new Error(result.error || 'Failed to load navigation');
      }
    } catch (error) {
      console.error('❌ Error loading navigation:', error);
      this.renderFallbackNavigation();
    }
  }

  // Render navigation HTML
  renderNavigation(navData) {
    this.renderDesktopNavigation(navData);
    this.renderMobileNavigation(navData);
  }

  // Render desktop navigation
  renderDesktopNavigation(navData) {
    const desktopNav = document.querySelector('#desktop-navigation, .desktop-nav');
    if (!desktopNav) return;

    const branding = navData.branding || {};
    const menuItems = navData.menu_items || [];
    const ctaButton = navData.cta_button || {};

    const logoLeftHtml = branding.logo_left ? 
      `<img src=\"${branding.logo_left}\" alt=\"Sai Baba Logo\" class=\"h-12 w-12 object-contain\">` : '';
    
    const logoRightHtml = branding.logo_right ? 
      `<img src=\"${branding.logo_right}\" alt=\"School Logo\" class=\"h-12 w-12 object-contain\">` : '';

    const menuHtml = menuItems.map(item => 
      `<li><a href=\"${item.url}\" class=\"text-gray-700 hover:text-primary font-medium transition-colors duration-200 ${
        window.location.pathname.includes(item.url.replace('.html', '')) ? 'text-primary' : ''
      }\">${item.name}</a></li>`
    ).join('');

    const ctaButtonHtml = ctaButton.text && ctaButton.url ? 
      `<a href=\"${ctaButton.url}\" class=\"bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-200 shadow-md hover:shadow-lg\">
        ${ctaButton.text}
      </a>` : '';

    desktopNav.innerHTML = `
      <div class=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
        <div class=\"flex justify-between items-center py-4\">
          
          <!-- Left Logo and Branding -->
          <div class=\"flex items-center space-x-4\">
            ${logoLeftHtml}
            <div class=\"flex flex-col\">
              <h1 class=\"text-xl font-bold text-gray-900 leading-tight\">${branding.college_name || 'Sri Sathya Sai Baba PU College'}</h1>
              <p class=\"text-sm text-gray-600\">${branding.location || 'Mysuru, Karnataka'}</p>
            </div>
            ${logoRightHtml}
          </div>

          <!-- Navigation Menu -->
          <nav class=\"hidden lg:block\">
            <ul class=\"flex space-x-8\">
              ${menuHtml}
            </ul>
          </nav>

          <!-- CTA Button -->
          <div class=\"hidden lg:block\">
            ${ctaButtonHtml}
          </div>

          <!-- Mobile Menu Button -->
          <button class=\"lg:hidden p-2 text-gray-600 hover:text-gray-900\" id=\"mobile-menu-button\">
            <svg class=\"w-6 h-6\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
              <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M4 6h16M4 12h16M4 18h16\"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

    // Setup mobile menu toggle
    this.setupMobileMenuToggle();
  }

  // Render mobile navigation
  renderMobileNavigation(navData) {
    let mobileNav = document.querySelector('#mobile-navigation, .mobile-nav');
    
    if (!mobileNav) {
      // Create mobile nav if it doesn't exist
      mobileNav = document.createElement('div');
      mobileNav.id = 'mobile-navigation';
      mobileNav.className = 'lg:hidden bg-white border-t border-gray-200 hidden';
      
      const headerNav = document.querySelector('#desktop-navigation, .desktop-nav');
      if (headerNav) {
        headerNav.parentNode.insertBefore(mobileNav, headerNav.nextSibling);
      }
    }

    const menuItems = navData.menu_items || [];
    const ctaButton = navData.cta_button || {};

    const menuHtml = menuItems.map(item => 
      `<a href=\"${item.url}\" class=\"block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary font-medium border-b border-gray-100 ${
        window.location.pathname.includes(item.url.replace('.html', '')) ? 'text-primary bg-primary/5' : ''
      }\">${item.name}</a>`
    ).join('');

    const ctaButtonHtml = ctaButton.text && ctaButton.url ? 
      `<div class=\"p-4 border-t border-gray-200 bg-gray-50\">
        <a href=\"${ctaButton.url}\" class=\"block w-full text-center bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-200\">
          ${ctaButton.text}
        </a>
      </div>` : '';

    mobileNav.innerHTML = `
      <div class=\"py-2\">
        ${menuHtml}
        ${ctaButtonHtml}
      </div>
    `;
  }

  // Setup mobile menu toggle functionality
  setupMobileMenuToggle() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileNav = document.querySelector('#mobile-navigation, .mobile-nav');
    
    if (mobileMenuButton && mobileNav) {
      mobileMenuButton.addEventListener('click', () => {
        mobileNav.classList.toggle('hidden');
        
        // Update button icon
        const icon = mobileMenuButton.querySelector('svg');
        if (mobileNav.classList.contains('hidden')) {
          icon.innerHTML = '<path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M4 6h16M4 12h16M4 18h16\"></path>';
        } else {
          icon.innerHTML = '<path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M6 18L18 6M6 6l12 12\"></path>';
        }
      });
    }
  }

  // Fallback navigation when API fails
  renderFallbackNavigation() {
    console.log('🚨 Loading fallback navigation');
    
    const fallbackNav = {
      branding: {
        logo_left: 'assets/logo/sai-baba-logo.png',
        logo_right: 'assets/logo/school-logo.png',
        college_name: 'Sri Sathya Sai Baba PU College',
        location: 'Mysuru, Karnataka'
      },
      menu_items: [
        { name: 'Home', url: 'index.html' },
        { name: 'About', url: 'about.html' },
        { name: 'Academics', url: 'academics.html' },
        { name: 'Gallery', url: 'gallery.html' },
        { name: 'Campus Life', url: 'campus-life.html' }
      ],
      cta_button: {
        text: 'FOR ADMISSIONS',
        url: 'admissions.html'
      }
    };
    
    this.renderNavigation(fallbackNav);
  }

  // Force refresh navigation (useful for admin updates)
  async refreshNavigation() {
    localStorage.removeItem(this.cacheKey);
    await this.loadNavigation();
  }

  // Check for updates without forcing refresh
  async checkForUpdates() {
    try {
      const response = await fetch(`${this.apiBase}?endpoint=get-navigation&_t=${Date.now()}`);
      
      if (!response.ok) {
        return; // Silently fail for background checks
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // Check if the data has changed
        const cached = localStorage.getItem(this.cacheKey);
        if (cached) {
          const cachedData = JSON.parse(cached);
          const newTimestamp = result.data.last_updated;
          const cachedTimestamp = cachedData.navigation?.last_updated;
          
          if (newTimestamp && cachedTimestamp && newTimestamp > cachedTimestamp) {
            console.log('🔄 Navigation updated, refreshing...');
            localStorage.removeItem(this.cacheKey);
            await this.loadNavigation();
          }
        }
      }
    } catch (error) {
      // Silently fail for background checks
      console.debug('Background navigation check failed:', error);
    }
  }
}

// Initialize navigation loader
let navigationLoader;

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  navigationLoader = new NetlifyNavigationLoader();
  
  // Make globally available for manual refreshes
  window.navigationLoader = navigationLoader;
});

// Listen for navigation updates from admin
window.addEventListener('storage', function(e) {
  if (e.key === 'forceContentRefresh' || e.key === 'sssbpuc_navigation_updated') {
    if (navigationLoader) {
      console.log('🔄 Refreshing navigation due to admin update...');
      navigationLoader.refreshNavigation();
    }
  }
});

// Also check for updates every 30 seconds if page is active
setInterval(() => {
  if (navigationLoader && !document.hidden) {
    const lastCheck = localStorage.getItem('sssbpuc_nav_last_check');
    const now = Date.now();
    
    // Check every 30 seconds
    if (!lastCheck || now - parseInt(lastCheck) > 30000) {
      localStorage.setItem('sssbpuc_nav_last_check', now.toString());
      navigationLoader.checkForUpdates();
    }
  }
}, 30000);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NetlifyNavigationLoader;
}
