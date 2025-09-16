// Dynamic Footer Loader for Netlify
// Loads footer data from Netlify Functions API

class NetlifyFooterLoader {
  constructor() {
    this.apiBase = '/.netlify/functions/api';
    this.cacheKey = 'sssbpuc_footer_cache';
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.init();
  }

  init() {
    console.log('🦶 Netlify Footer Loader initialized');
    this.loadFooter();
  }

  // Check if we have cached footer data
  getCachedFooter() {
    try {
      // Check for force refresh flag
      const forceRefresh = localStorage.getItem('forceContentRefresh');
      if (forceRefresh === 'true') {
        console.log('🔄 Force refresh requested, clearing footer cache');
        localStorage.removeItem(this.cacheKey);
        return null; // Don't remove the flag here, let navigation handle it
      }
      
      const cached = localStorage.getItem(this.cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        const isExpired = Date.now() - data.timestamp > this.cacheTimeout;
        
        if (!isExpired && data.footer) {
          console.log('📦 Using cached footer data');
          return data.footer;
        }
      }
    } catch (error) {
      console.error('Error reading footer cache:', error);
    }
    return null;
  }

  // Cache footer data
  cacheFooter(footerData) {
    try {
      const cacheData = {
        footer: footerData,
        timestamp: Date.now()
      };
      localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
      console.log('💾 Footer data cached');
    } catch (error) {
      console.error('Error caching footer:', error);
    }
  }

  // Load footer from API or cache
  async loadFooter() {
    // Try cache first
    const cachedFooter = this.getCachedFooter();
    if (cachedFooter) {
      this.renderFooter(cachedFooter);
      return;
    }

    // Load from API
    try {
      console.log('🌐 Loading footer from API...');
      const response = await fetch(`${this.apiBase}?endpoint=get-footer&_t=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        this.cacheFooter(result.data);
        this.renderFooter(result.data);
        console.log('✅ Footer loaded from API');
      } else {
        throw new Error(result.error || 'Failed to load footer');
      }
    } catch (error) {
      console.error('❌ Error loading footer:', error);
      this.renderFallbackFooter();
    }
  }

  // Render footer HTML
  renderFooter(footerData) {
    const footerElement = document.querySelector('#dynamic-footer, footer[data-dynamic="true"], .dynamic-footer');
    if (!footerElement) {
      console.warn('No footer element found with ID "dynamic-footer" or data-dynamic="true"');
      return;
    }

    const branding = footerData.branding || {};
    const socialLinks = footerData.social_links || [];
    const quickLinks = footerData.quick_links || [];
    const contactInfo = footerData.contact_info || [];
    const copyright = footerData.copyright || '© 2025 SSSBPUC. All rights reserved.';

    // Build HTML
    let footerHTML = `
      <div class="bg-gray-900 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <!-- Branding Column -->
            <div class="lg:col-span-2">
              ${branding.logo ? `<img src="${branding.logo}" alt="Logo" class="h-16 w-auto mb-4">` : ''}
              <p class="text-gray-400 mb-6 max-w-md">
                ${branding.description || 'Shaping tomorrow\'s leaders through excellence in education.'}
              </p>
              
              <!-- Social Links -->
              <div class="flex space-x-4">
    `;
    
    socialLinks.forEach(link => {
      footerHTML += `
        <a href="${link.url}" class="text-gray-400 hover:text-white transition-colors duration-200" target="_blank" rel="noopener noreferrer">
          <i class="${link.icon} text-xl"></i>
          <span class="sr-only">${link.name}</span>
        </a>
      `;
    });
    
    footerHTML += `
              </div>
            </div>
            
            <!-- Quick Links Column -->
            <div>
              <h3 class="text-lg font-semibold mb-4">Quick Links</h3>
              <ul class="space-y-2">
    `;
    
    quickLinks.forEach(link => {
      footerHTML += `
        <li>
          <a href="${link.url}" class="text-gray-400 hover:text-white transition-colors duration-200">
            ${link.name}
          </a>
        </li>
      `;
    });
    
    footerHTML += `
              </ul>
            </div>
            
            <!-- Contact Column -->
            <div>
              <h3 class="text-lg font-semibold mb-4">Contact Info</h3>
              <ul class="space-y-3">
    `;
    
    contactInfo.forEach(info => {
      let displayText = info.text;
      let linkElement = '';
      
      if (info.type === 'phone') {
        linkElement = `<a href="tel:${info.text}" class="text-gray-400 hover:text-white transition-colors duration-200">`;
      } else if (info.type === 'email') {
        linkElement = `<a href="mailto:${info.text}" class="text-gray-400 hover:text-white transition-colors duration-200">`;
      } else {
        linkElement = '<span class="text-gray-400">';
      }
      
      footerHTML += `
        <li class="flex items-start">
          <i class="${info.icon} text-lg mt-1 mr-3 text-secondary flex-shrink-0"></i>
          ${linkElement}${displayText}${info.type === 'phone' || info.type === 'email' ? '</a>' : '</span>'}
        </li>
      `;
    });
    
    footerHTML += `
              </ul>
            </div>
          </div>
          
          <!-- Copyright -->
          <div class="border-t border-gray-800 mt-8 pt-8 text-center">
            <p class="text-gray-400">
              ${copyright}
            </p>
          </div>
        </div>
      </div>
    `;

    footerElement.innerHTML = footerHTML;
  }

  // Fallback footer when API fails
  renderFallbackFooter() {
    console.log('🚨 Loading fallback footer');
    
    const fallbackFooter = {
      branding: {
        logo: 'assets/logo/sai-baba-logo.png',
        description: 'Shaping tomorrow\'s leaders through excellence in education, research, and innovation.'
      },
      social_links: [
        { name: 'Facebook', url: 'https://www.facebook.com/people/Sathya-Sai-Baba-Puc/pfbid02EXmmdXSUpaZJE3uH5zdoHTGTsfFPjy5RK5Z6dUJ55skrdtPwmWgYpTbHbh7RwcfZl', icon: 'ri-facebook-fill' },
        { name: 'Twitter', url: '#', icon: 'ri-twitter-fill' },
        { name: 'Instagram', url: '#', icon: 'ri-instagram-fill' }
      ],
      quick_links: [
        { name: 'About Us', url: 'about.html' },
        { name: 'Academics', url: 'academics.html' },
        { name: 'Gallery', url: 'gallery.html' },
        { name: 'Campus Life', url: 'campus-life.html' }
      ],
      contact_info: [
        { type: 'address', icon: 'ri-map-pin-line', text: 'Sri Sathya Sai Baba PU College, Mysuru, Karnataka' },
        { type: 'phone', icon: 'ri-phone-line', text: '0821 2410856' },
        { type: 'email', icon: 'ri-mail-line', text: 'sssbpucnn0385@gmail.com' }
      ],
      copyright: '© 2025 SSSBPUC. All rights reserved.'
    };
    
    this.renderFooter(fallbackFooter);
  }

  // Force refresh footer (useful for admin updates)
  async refreshFooter() {
    localStorage.removeItem(this.cacheKey);
    await this.loadFooter();
  }
}

// Initialize footer loader
let footerLoader;

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  footerLoader = new NetlifyFooterLoader();
  
  // Make globally available for manual refreshes
  window.footerLoader = footerLoader;
});

// Listen for footer updates from admin
window.addEventListener('storage', function(e) {
  if (e.key === 'forceContentRefresh' || e.key === 'sssbpuc_footer_updated') {
    if (footerLoader) {
      console.log('🔄 Refreshing footer due to admin update...');
      footerLoader.refreshFooter();
    }
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NetlifyFooterLoader;
}
