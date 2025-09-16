// Dynamic Navigation Loader
class NavigationLoader {
  constructor() {
    this.navData = null;
    this.init();
  }

  async init() {
    console.log('🧭 NavigationLoader: Initializing...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.loadNavigation());
    } else {
      await this.loadNavigation();
    }
  }

  async loadNavigation() {
    try {
      console.log('🔄 NavigationLoader: Fetching navigation data...');
      
      // Check if we need to force refresh from admin changes
      const forceRefresh = localStorage.getItem('forceContentRefresh') || sessionStorage.getItem('forceContentRefresh');
      // Always use cache buster for navigation to ensure fresh data
      const cacheBuster = `&_t=${Date.now()}`;
      
      if (forceRefresh) {
        console.log('♾️ Force refresh flag detected - clearing cache flags');
        localStorage.removeItem('forceContentRefresh');
        sessionStorage.removeItem('forceContentRefresh');
      }
      
      const response = await fetch(`admin/api.php?endpoint=get-navigation${cacheBuster}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        this.navData = result.data;
        console.log('✅ NavigationLoader: Navigation data loaded:', this.navData);
        
        this.updateNavigationElements();
      } else {
        throw new Error(result.error || 'Failed to load navigation data');
      }
      
    } catch (error) {
      console.warn('⚠️ NavigationLoader: Failed to load navigation data:', error.message);
      console.log('📝 NavigationLoader: Using static navigation from HTML');
    }
  }

  updateNavigationElements() {
    console.log('🔧 NavigationLoader: Updating navigation elements...');
    
    try {
      // Update branding
      this.updateBranding();
      
      // Update menu items
      this.updateMenuItems();
      
      // Update CTA button
      this.updateCTAButton();
      
      console.log('✅ NavigationLoader: Navigation updated successfully');
      
    } catch (error) {
      console.error('❌ NavigationLoader: Error updating navigation:', error);
    }
  }

  updateBranding() {
    if (!this.navData.branding) return;
    
    const branding = this.navData.branding;
    
    // Update desktop logos
    const leftLogo = document.querySelector('nav img[src*="sai-baba-logo"]');
    const rightLogo = document.querySelector('nav img[src*="school-logo"]:not(#mobile-menu img)');
    
    if (leftLogo && branding.logo_left) {
      leftLogo.src = branding.logo_left;
      console.log('🖼️ Updated left logo to:', branding.logo_left);
    }
    
    if (rightLogo && branding.logo_right) {
      rightLogo.src = branding.logo_right;
      console.log('🖼️ Updated right logo to:', branding.logo_right);
    }
    
    // Update college name and location in desktop nav
    const collegeNameEl = document.querySelector('nav h1.font-bold');
    const locationEl = document.querySelector('nav p.text-gray-600');
    
    if (collegeNameEl && branding.college_name) {
      collegeNameEl.textContent = branding.college_name;
      console.log('🏫 Updated college name to:', branding.college_name);
    }
    
    if (locationEl && branding.location) {
      locationEl.textContent = branding.location;
      console.log('📍 Updated location to:', branding.location);
    }
    
    // Update mobile menu branding
    const mobileLeftLogo = document.querySelector('#mobile-menu img[src*="sai-baba-logo"]');
    const mobileRightLogo = document.querySelector('#mobile-menu img[src*="school-logo"]');
    const mobileCollegeName = document.querySelector('#mobile-menu h2');
    const mobileLocation = document.querySelector('#mobile-menu p.text-xs');
    
    if (mobileLeftLogo && branding.logo_left) {
      mobileLeftLogo.src = branding.logo_left;
    }
    
    if (mobileRightLogo && branding.logo_right) {
      mobileRightLogo.src = branding.logo_right;
    }
    
    if (mobileCollegeName && branding.college_name) {
      mobileCollegeName.textContent = branding.college_name;
    }
    
    if (mobileLocation && branding.location) {
      mobileLocation.textContent = branding.location;
    }
  }

  updateMenuItems() {
    if (!this.navData.menu_items || !Array.isArray(this.navData.menu_items)) {
      console.log('📝 No menu items to update, keeping static menu');
      return;
    }
    
    console.log('📋 Updating menu items:', this.navData.menu_items);
    
    // Update desktop menu
    const desktopMenuContainer = document.getElementById('desktop-menu-container') || 
                                 document.querySelector('nav .hidden.md\\:flex.space-x-8') || 
                                 document.querySelector('nav .space-x-8');
    if (desktopMenuContainer) {
      console.log('🔧 Found desktop menu container, updating...');
      this.updateDesktopMenu(desktopMenuContainer);
    } else {
      console.warn('⚠️ Desktop menu container not found');
      // Try alternative selectors
      const altContainer = document.querySelector('nav .flex.space-x-8');
      if (altContainer) {
        console.log('🔧 Found alternative desktop menu container');
        this.updateDesktopMenu(altContainer);
      }
    }
    
    // Update mobile menu
    const mobileMenuContainer = document.getElementById('mobile-menu-container') || 
                               document.querySelector('#mobile-menu .space-y-3');
    if (mobileMenuContainer) {
      console.log('📱 Found mobile menu container, updating...');
      this.updateMobileMenu(mobileMenuContainer);
    } else {
      console.warn('⚠️ Mobile menu container not found');
    }
  }

  updateDesktopMenu(container) {
    // Get existing CTA button to preserve it
    const ctaButton = container.querySelector('a[href*="admissions"] button, button');
    const ctaParent = ctaButton?.parentElement;
    
    // Clear existing menu items (but keep CTA button)
    const links = container.querySelectorAll('a:not([href*="admissions"])');
    links.forEach(link => link.remove());
    
    // Add new menu items
    this.navData.menu_items.forEach((item) => {
      const link = document.createElement('a');
      link.href = item.url || '#';
      link.className = 'nav-link text-gray-700 hover:text-primary transition-colors font-medium px-3 py-2 rounded-md';
      link.textContent = item.name || '';
      
      // Insert before CTA button if it exists
      if (ctaParent) {
        container.insertBefore(link, ctaParent);
      } else {
        container.appendChild(link);
      }
    });
    
    console.log('✅ Desktop menu updated with', this.navData.menu_items.length, 'items');
  }

  updateMobileMenu(container) {
    // Get existing CTA button to preserve it
    const ctaButton = container.querySelector('a[href*="admissions"]');
    
    // Clear existing menu items (but keep CTA button)
    const links = container.querySelectorAll('a.mobile-menu-item');
    links.forEach(link => link.remove());
    
    // Add new menu items
    this.navData.menu_items.forEach((item) => {
      const link = document.createElement('a');
      link.href = item.url || '#';
      link.className = 'mobile-menu-item block px-4 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-300';
      
      // Add icon based on the menu item name
      const icon = this.getMenuIcon(item.name);
      link.innerHTML = `<i class="${icon} mr-3"></i>${item.name || ''}`;
      
      // Insert before CTA button if it exists
      if (ctaButton) {
        container.insertBefore(link, ctaButton);
      } else {
        container.appendChild(link);
      }
    });
    
    console.log('✅ Mobile menu updated with', this.navData.menu_items.length, 'items');
  }

  updateCTAButton() {
    if (!this.navData.cta_button) return;
    
    const ctaData = this.navData.cta_button;
    
    // Update desktop CTA button
    const desktopCTAButton = document.querySelector('nav button');
    const desktopCTALink = desktopCTAButton?.parentElement;
    
    if (desktopCTAButton && ctaData.text) {
      desktopCTAButton.textContent = ctaData.text;
      console.log('🔘 Updated desktop CTA text to:', ctaData.text);
    }
    
    if (desktopCTALink && ctaData.url) {
      desktopCTALink.href = ctaData.url;
      console.log('🔗 Updated desktop CTA URL to:', ctaData.url);
    }
    
    // Update mobile CTA button
    const mobileCTAButton = document.querySelector('#mobile-menu button');
    const mobileCTALink = mobileCTAButton?.parentElement;
    
    if (mobileCTAButton && ctaData.text) {
      // Preserve the icon and update text
      const icon = mobileCTAButton.querySelector('i');
      const iconHTML = icon ? icon.outerHTML : '<i class="ri-graduation-cap-line mr-2"></i>';
      mobileCTAButton.innerHTML = `${iconHTML}${ctaData.text}`;
    }
    
    if (mobileCTALink && ctaData.url) {
      mobileCTALink.href = ctaData.url;
    }
  }

  getMenuIcon(menuName) {
    const iconMap = {
      'home': 'ri-home-line',
      'academics': 'ri-book-open-line',
      'gallery': 'ri-gallery-line',
      'campus life': 'ri-building-line',
      'about': 'ri-information-line',
      'admissions': 'ri-graduation-cap-line',
      'about us': 'ri-information-line'
    };
    
    const key = menuName.toLowerCase();
    return iconMap[key] || 'ri-arrow-right-s-line';
  }

  // Method to refresh navigation (can be called from other scripts)
  async refresh() {
    console.log('🔄 NavigationLoader: Refreshing navigation...');
    await this.loadNavigation();
  }

  // Method to force update navigation elements immediately
  forceUpdate() {
    console.log('🚀 NavigationLoader: Force updating navigation elements...');
    if (this.navData) {
      this.updateNavigationElements();
    } else {
      this.refresh();
    }
  }
}

// Initialize navigation loader
console.log('🧭 NavigationLoader: Script loaded');

// Create global instance
window.navigationLoader = new NavigationLoader();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NavigationLoader;
}
