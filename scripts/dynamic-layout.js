// Dynamic Layout Manager
// This script automatically loads navigation and footer content from the admin-managed data
// and applies it to all pages on the website

class DynamicLayoutManager {
  constructor() {
    this.navigationData = null;
    this.footerData = null;
    this.init();
  }

  async init() {
    console.log('🔄 Initializing Dynamic Layout Manager...');
    
    try {
      await this.loadNavigationData();
      await this.loadFooterData();
      
      this.updateNavigation();
      this.updateFooter();
      
      console.log('✅ Dynamic Layout Manager initialized successfully');
    } catch (error) {
      console.warn('⚠️ Dynamic Layout Manager initialization failed:', error.message);
      console.log('Using existing static layout');
    }
  }

  async loadNavigationData() {
    try {
      const response = await fetch('admin/api.php?endpoint=get-navigation');
      const result = await response.json();
      
      if (result.success) {
        this.navigationData = result.data;
        console.log('✅ Navigation data loaded');
      } else {
        throw new Error(result.error || 'Failed to load navigation data');
      }
    } catch (error) {
      console.warn('Failed to load navigation data, using defaults');
      // Keep existing navigation if API fails
    }
  }

  async loadFooterData() {
    try {
      const response = await fetch('admin/api.php?endpoint=get-footer');
      const result = await response.json();
      
      if (result.success) {
        this.footerData = result.data;
        console.log('✅ Footer data loaded');
      } else {
        throw new Error(result.error || 'Failed to load footer data');
      }
    } catch (error) {
      console.warn('Failed to load footer data, using defaults');
      // Keep existing footer if API fails
    }
  }

  updateNavigation() {
    if (!this.navigationData) return;

    try {
      this.updateBranding();
      this.updateMenuItems();
      this.updateCTAButton();
      console.log('✅ Navigation updated successfully');
    } catch (error) {
      console.error('Error updating navigation:', error);
    }
  }

  updateBranding() {
    const { branding } = this.navigationData;
    
    // Update logos
    const leftLogos = document.querySelectorAll('[src*="sai-baba-logo"], [alt="Sai Baba Logo"]');
    const rightLogos = document.querySelectorAll('[src*="school-logo"], [alt="School Logo"]');
    
    leftLogos.forEach(logo => {
      if (branding.logo_left) {
        logo.src = branding.logo_left;
      }
    });
    
    rightLogos.forEach(logo => {
      if (branding.logo_right) {
        logo.src = branding.logo_right;
      }
    });

    // Update college name and location
    const collegeNameElements = document.querySelectorAll('h1, h2');
    collegeNameElements.forEach(element => {
      if (element.textContent.includes('Sri Sathya Sai Baba PU College') || 
          element.textContent.includes('Sri Sathya Sai Baba School')) {
        element.textContent = branding.college_name;
      }
    });

    const locationElements = document.querySelectorAll('p');
    locationElements.forEach(element => {
      if (element.textContent.includes('Mysuru, Karnataka')) {
        element.textContent = branding.location;
      }
    });
  }

  updateMenuItems() {
    const { menu_items } = this.navigationData;
    if (!menu_items || menu_items.length === 0) return;

    // Update desktop navigation
    const desktopNav = document.querySelector('.hidden.md\\:flex .space-x-8');
    if (desktopNav) {
      // Clear existing menu items (except CTA button)
      const existingLinks = desktopNav.querySelectorAll('a:not([href*="admissions"])');
      existingLinks.forEach(link => link.remove());

      // Add new menu items
      menu_items.forEach((item, index) => {
        const link = document.createElement('a');
        link.href = item.url;
        link.className = 'nav-link text-gray-700 hover:text-primary transition-colors font-medium px-3 py-2 rounded-md';
        link.textContent = item.name;
        
        // Insert before the CTA button
        const ctaButton = desktopNav.querySelector('a[href*="admissions"]');
        if (ctaButton) {
          desktopNav.insertBefore(link, ctaButton);
        } else {
          desktopNav.appendChild(link);
        }
      });
    }

    // Update mobile navigation
    const mobileNav = document.querySelector('#mobile-menu .space-y-3');
    if (mobileNav) {
      // Clear existing menu items (except CTA button)
      const existingLinks = mobileNav.querySelectorAll('a:not([href*="admissions"])');
      existingLinks.forEach(link => link.remove());

      // Add new menu items
      menu_items.forEach(item => {
        const link = document.createElement('a');
        link.href = item.url;
        link.className = 'mobile-menu-item block px-4 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-300';
        
        const icon = this.getMenuIcon(item.name);
        link.innerHTML = `<i class="${icon} mr-3"></i>${item.name}`;
        
        // Insert before the CTA button
        const ctaButton = mobileNav.querySelector('a[href*="admissions"]');
        if (ctaButton) {
          mobileNav.insertBefore(link, ctaButton);
        } else {
          mobileNav.appendChild(link);
        }
      });
    }
  }

  updateCTAButton() {
    const { cta_button } = this.navigationData;
    if (!cta_button) return;

    // Update CTA button text and URL
    const ctaButtons = document.querySelectorAll('a[href*="admissions"] button, button:contains("FOR ADMISSIONS")');
    ctaButtons.forEach(button => {
      if (cta_button.text) {
        button.textContent = cta_button.text;
      }
    });

    const ctaLinks = document.querySelectorAll('a[href*="admissions"]');
    ctaLinks.forEach(link => {
      if (cta_button.url) {
        link.href = cta_button.url;
      }
    });
  }

  updateFooter() {
    if (!this.footerData) return;

    try {
      this.updateFooterBranding();
      this.updateSocialLinks();
      this.updateQuickLinks();
      this.updateContactInfo();
      this.updateCopyright();
      console.log('✅ Footer updated successfully');
    } catch (error) {
      console.error('Error updating footer:', error);
    }
  }

  updateFooterBranding() {
    const { branding } = this.footerData;
    
    // Update footer logo
    const footerLogo = document.querySelector('[data-id="footer-logo"]');
    if (footerLogo && branding.logo) {
      footerLogo.src = branding.logo;
    }

    // Update footer description
    const footerDescription = document.querySelector('[data-id="footer-description"]');
    if (footerDescription && branding.description) {
      footerDescription.textContent = branding.description;
    }
  }

  updateSocialLinks() {
    const { social_links } = this.footerData;
    if (!social_links || social_links.length === 0) return;

    const socialContainer = document.querySelector('[data-id="footer-social"]');
    if (socialContainer) {
      socialContainer.innerHTML = social_links.map(link => `
        <a href="${link.url}" class="text-gray-400 hover:text-white transition-colors" data-id="footer-${link.name.toLowerCase()}">
          <i class="${link.icon} text-xl"></i>
        </a>
      `).join('');
    }
  }

  updateQuickLinks() {
    const { quick_links } = this.footerData;
    if (!quick_links || quick_links.length === 0) return;

    const quickLinksContainer = document.querySelector('[data-id="footer-links-list"]');
    if (quickLinksContainer) {
      quickLinksContainer.innerHTML = quick_links.map(link => `
        <li>
          <a href="${link.url}" class="text-gray-400 hover:text-white transition-colors" data-id="footer-link-${link.name.toLowerCase().replace(/\s+/g, '-')}">
            ${link.name}
          </a>
        </li>
      `).join('');
    }
  }

  updateContactInfo() {
    const { contact_info } = this.footerData;
    if (!contact_info || contact_info.length === 0) return;

    const contactContainer = document.querySelector('[data-id="footer-contact-list"]');
    if (contactContainer) {
      contactContainer.innerHTML = contact_info.map(info => `
        <li class="flex items-center text-gray-400" data-id="footer-${info.type}">
          <i class="${info.icon} mr-2"></i>
          ${info.text}
        </li>
      `).join('');
    }
  }

  updateCopyright() {
    const { copyright } = this.footerData;
    if (!copyright) return;

    const copyrightElement = document.querySelector('[data-id="footer-bottom"] p');
    if (copyrightElement) {
      copyrightElement.textContent = copyright;
    }
  }

  getMenuIcon(menuName) {
    const iconMap = {
      'Home': 'ri-home-line',
      'About': 'ri-information-line',
      'About Us': 'ri-information-line',
      'Academics': 'ri-book-open-line',
      'Gallery': 'ri-gallery-line',
      'Campus Life': 'ri-building-line',
      'Admissions': 'ri-graduation-cap-line'
    };
    return iconMap[menuName] || 'ri-link';
  }

  // Utility method to refresh layout if called externally
  async refresh() {
    console.log('🔄 Refreshing dynamic layout...');
    await this.init();
  }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if content should be refreshed (set by admin)
  const shouldRefresh = localStorage.getItem('forceContentRefresh');
  if (shouldRefresh) {
    localStorage.removeItem('forceContentRefresh');
    console.log('🔄 Force refresh requested by admin');
  }

  // Initialize the dynamic layout manager
  window.dynamicLayoutManager = new DynamicLayoutManager();
});

// Export for manual refresh if needed
window.refreshLayout = () => {
  if (window.dynamicLayoutManager) {
    window.dynamicLayoutManager.refresh();
  }
};
