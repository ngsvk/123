// Dynamic Footer Loader
// This script loads footer content from footer.json and applies it to all pages

class DynamicFooter {
  constructor() {
    this.footerData = null;
    this.init();
  }

  async init() {
    try {
      await this.loadFooterData();
      this.renderFooter();
      console.log('✅ Dynamic footer loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load dynamic footer:', error);
      // Fallback to existing static content if dynamic loading fails
    }
  }

  async loadFooterData() {
    try {
      // Check if we need to force refresh from admin changes
      const forceRefresh = localStorage.getItem('forceContentRefresh') || sessionStorage.getItem('forceContentRefresh');
      // Always use cache buster for footer to ensure fresh data
      const cacheBuster = `&_t=${Date.now()}`;
      
      if (forceRefresh) {
        console.log('♾️ Force refresh flag detected for footer - clearing cache flags');
        localStorage.removeItem('forceContentRefresh');
        sessionStorage.removeItem('forceContentRefresh');
      }
      
      const response = await fetch(`admin/api.php?endpoint=get-footer${cacheBuster}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      if (result.success && result.data) {
        this.footerData = result.data;
        console.log('✅ Footer data loaded from API:', this.footerData);
      } else {
        throw new Error(result.error || 'Invalid footer data structure');
      }
    } catch (error) {
      console.warn('⚠️ Could not load footer from API, using static content:', error.message);
      throw error;
    }
  }

  renderFooter() {
    const footer = document.querySelector('footer[data-id="main-footer"]');
    if (!footer || !this.footerData) return;

    // Update logo
    const logo = footer.querySelector('[data-id="footer-logo"]');
    if (logo && this.footerData.branding?.logo) {
      logo.src = this.footerData.branding.logo;
    }

    // Update description
    const description = footer.querySelector('[data-id="footer-description"]');
    if (description && this.footerData.branding?.description) {
      description.textContent = this.footerData.branding.description;
    }

    // Update social links
    this.updateSocialLinks(footer);

    // Update quick links
    this.updateQuickLinks(footer);

    // Update contact info
    this.updateContactInfo(footer);

    // Update copyright
    const copyright = footer.querySelector('[data-id="footer-copyright-text"]');
    if (copyright && this.footerData.copyright) {
      copyright.textContent = this.footerData.copyright;
    }
  }

  updateSocialLinks(footer) {
    const socialContainer = footer.querySelector('[data-id="footer-social"]');
    if (!socialContainer) return;

    const socialLinks = this.getSocialLinks();
    if (socialLinks.length === 0) return;

    socialContainer.innerHTML = socialLinks.map(link => `
      <a href="${link.url}" class="text-gray-400 hover:text-white transition-colors" data-id="footer-${link.name.toLowerCase()}">
        <i class="${link.icon} text-xl"></i>
      </a>
    `).join('');
  }

  updateQuickLinks(footer) {
    const linksContainer = footer.querySelector('[data-id="footer-links-list"]');
    if (!linksContainer) return;

    const quickLinks = this.getQuickLinks();
    if (quickLinks.length === 0) return;

    linksContainer.innerHTML = quickLinks.map(link => `
      <li><a href="${link.url}" class="text-gray-400 hover:text-white transition-colors" data-id="footer-link-${link.name.toLowerCase().replace(/\s+/g, '-')}">${link.name}</a></li>
    `).join('');
  }

  updateContactInfo(footer) {
    const contactContainer = footer.querySelector('[data-id="footer-contact-list"]');
    if (!contactContainer) return;

    const contactInfo = this.getContactInfo();
    if (contactInfo.length === 0) return;

    contactContainer.innerHTML = contactInfo.map(info => `
      <li class="flex items-center text-gray-400" data-id="footer-${info.type}">
        <i class="${info.icon} mr-2"></i>
        ${info.text}
      </li>
    `).join('');
  }

  getSocialLinks() {
    if (!this.footerData || !this.footerData.social_links) {
      return [];
    }
    return Array.isArray(this.footerData.social_links) ? this.footerData.social_links : [];
  }

  getQuickLinks() {
    if (!this.footerData || !this.footerData.quick_links) {
      return [];
    }
    return Array.isArray(this.footerData.quick_links) ? this.footerData.quick_links : [];
  }

  getContactInfo() {
    if (!this.footerData || !this.footerData.contact_info) {
      return [];
    }
    const contactInfo = Array.isArray(this.footerData.contact_info) ? this.footerData.contact_info : [];
    return contactInfo.sort((a, b) => {
      const order = { 'address': 1, 'phone': 2, 'email': 3 };
      return (order[a.type] || 4) - (order[b.type] || 4);
    });
  }
}

// Initialize dynamic footer when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Only initialize if footer exists and has the correct data-id
  if (document.querySelector('footer[data-id="main-footer"]')) {
    new DynamicFooter();
  }
});

// Export for manual initialization if needed
window.DynamicFooter = DynamicFooter;
