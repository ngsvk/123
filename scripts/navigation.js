// Mobile Navigation Functionality
class NavigationManager {
  constructor() {
    this.mobileMenu = document.getElementById('mobile-menu');
    this.mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    this.body = document.body;
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupActiveLink();
  }

  setupEventListeners() {
    // Mobile menu toggle
    if (this.mobileMenuToggle) {
      this.mobileMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.isMobileMenuOpen()) {
          this.closeMobileMenuHandler();
        } else {
          this.openMobileMenu();
        }
      });
    }

    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
      if (this.mobileMenu && 
          !this.mobileMenu.contains(event.target) && 
          !this.mobileMenuToggle.contains(event.target) &&
          this.isMobileMenuOpen()) {
        this.closeMobileMenuHandler();
      }
    });

    // Close menu when clicking on navigation links
    if (this.mobileMenu) {
      const mobileLinks = this.mobileMenu.querySelectorAll('a');
      mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
          this.closeMobileMenuHandler();
        });
      });
    }

    // Close menu on escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isMobileMenuOpen()) {
        this.closeMobileMenuHandler();
      }
    });

    // Close menu on window resize to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768 && this.isMobileMenuOpen()) {
        this.closeMobileMenuHandler();
      }
    });
  }

  openMobileMenu() {
    if (this.mobileMenu) {
      this.mobileMenu.classList.remove('opacity-0', 'invisible');
      this.mobileMenu.classList.add('opacity-100', 'visible');
      // Change hamburger to X
      this.updateHamburgerIcon(true);
    }
  }

  closeMobileMenuHandler() {
    if (this.mobileMenu) {
      this.mobileMenu.classList.remove('opacity-100', 'visible');
      this.mobileMenu.classList.add('opacity-0', 'invisible');
      // Change X back to hamburger
      this.updateHamburgerIcon(false);
    }
  }

  isMobileMenuOpen() {
    return this.mobileMenu && this.mobileMenu.classList.contains('opacity-100');
  }

  updateHamburgerIcon(isOpen) {
    const hamburgerIcon = document.querySelector('[data-id="hamburger-icon"]');
    if (hamburgerIcon) {
      if (isOpen) {
        hamburgerIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />';
      } else {
        hamburgerIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />';
      }
    }
  }

  setupActiveLink() {
    // Get current page
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    // Map pages to navigation items
    const pageMap = {
      'index.html': 'home',
      'academics.html': 'academics',
      'gallery.html': 'gallery',
      'campus-life.html': 'campus-life',
      'about.html': 'about',
      'admissions.html': 'admissions'
    };

    const activePage = pageMap[currentPage];
    
    if (activePage) {
      // Desktop navigation
      const desktopLink = document.querySelector(`[data-id="nav-${activePage}"]`);
      if (desktopLink) {
        desktopLink.classList.add('text-primary', 'font-semibold');
        desktopLink.classList.remove('text-gray-700');
      }

      // Mobile navigation
      const mobileLink = document.querySelector(`[data-id="mobile-nav-${activePage}"]`);
      if (mobileLink) {
        mobileLink.classList.add('text-primary', 'font-semibold');
        mobileLink.classList.remove('text-gray-700');
      }
    }
  }
}

// Smooth scroll functionality
class SmoothScroll {
  constructor() {
    this.init();
  }

  init() {
    // Handle anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const headerHeight = 80; // Account for fixed header
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }
}

// Scroll-based header effects
class HeaderEffects {
  constructor() {
    this.header = document.querySelector('nav');
    this.lastScrollY = window.scrollY;
    this.init();
  }

  init() {
    window.addEventListener('scroll', () => {
      this.handleScroll();
    });
  }

  handleScroll() {
    const currentScrollY = window.scrollY;
    
    if (this.header) {
      // Add shadow on scroll
      if (currentScrollY > 10) {
        this.header.classList.add('shadow-lg');
        this.header.classList.remove('shadow-sm');
      } else {
        this.header.classList.add('shadow-sm');
        this.header.classList.remove('shadow-lg');
      }

      // Hide/show header on scroll (optional)
      if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
        // Scrolling down
        this.header.style.transform = 'translateY(-100%)';
      } else {
        // Scrolling up
        this.header.style.transform = 'translateY(0)';
      }
    }
    
    this.lastScrollY = currentScrollY;
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  new NavigationManager();
  new SmoothScroll();
  new HeaderEffects();
  
  console.log('✅ Navigation system initialized');
});
