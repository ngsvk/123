// Enhanced Navigation Script with Animations
console.log('🧭 Enhanced Navigation: Script loaded successfully');

class EnhancedNavigation {
  constructor() {
    this.mobileMenu = document.getElementById('mobile-menu');
    this.mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    this.navbar = document.querySelector('nav');
    this.isMenuOpen = false;
    
    this.init();
  }

  init() {
    console.log('🧭 Enhanced Navigation: Initializing...');
    
    // Mobile menu toggle
    this.setupMobileMenu();
    
    // Scroll effects for navbar
    this.setupScrollEffects();
    
    // Navigation link hover effects
    this.setupNavLinkEffects();
    
    console.log('✅ Enhanced Navigation: Initialization complete');
  }

  setupMobileMenu() {
    if (!this.mobileMenuToggle || !this.mobileMenu) {
      console.warn('⚠️ Enhanced Navigation: Mobile menu elements not found');
      return;
    }

    // Toggle mobile menu
    this.mobileMenuToggle.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleMobileMenu();
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isMenuOpen && !this.mobileMenu.contains(e.target) && !this.mobileMenuToggle.contains(e.target)) {
        this.closeMobileMenu();
      }
    });

    // Close menu when pressing escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMobileMenu();
      }
    });

    // Close menu when clicking on menu items
    const mobileMenuItems = this.mobileMenu.querySelectorAll('a');
    mobileMenuItems.forEach(item => {
      item.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    });
  }

  toggleMobileMenu() {
    if (this.isMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu() {
    console.log('📱 Opening mobile menu');
    this.isMenuOpen = true;
    this.mobileMenu.classList.add('show');
    this.mobileMenuToggle.classList.add('active');
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    // Animate hamburger to X
    this.animateHamburgerToX();
  }

  closeMobileMenu() {
    console.log('📱 Closing mobile menu');
    this.isMenuOpen = false;
    this.mobileMenu.classList.remove('show');
    this.mobileMenuToggle.classList.remove('active');
    
    // Restore body scrolling
    document.body.style.overflow = '';
    
    // Animate X back to hamburger
    this.animateXToHamburger();
  }

  animateHamburgerToX() {
    const svg = this.mobileMenuToggle.querySelector('svg path');
    if (svg) {
      svg.setAttribute('d', 'M6 18L18 6M6 6l12 12');
    }
  }

  animateXToHamburger() {
    const svg = this.mobileMenuToggle.querySelector('svg path');
    if (svg) {
      svg.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
    }
  }

  setupScrollEffects() {
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Add/remove scrolled class
      if (scrollTop > 50) {
        this.navbar.classList.add('scrolled');
      } else {
        this.navbar.classList.remove('scrolled');
      }
      
      // Hide navbar on scroll down, show on scroll up
      if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down
        this.navbar.style.transform = 'translateY(-100%)';
      } else {
        // Scrolling up
        this.navbar.style.transform = 'translateY(0)';
      }
      
      lastScrollTop = scrollTop;
    });
  }

  setupNavLinkEffects() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      // Add ripple effect on click
      link.addEventListener('click', (e) => {
        this.createRippleEffect(e, link);
      });
      
      // Add hover sound effect (optional)
      link.addEventListener('mouseenter', () => {
        // You can add a subtle sound effect here if desired
        this.addHoverEffect(link);
      });
    });
  }

  createRippleEffect(e, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(218, 165, 32, 0.6);
      transform: scale(0);
      animation: ripple 0.6s linear;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      pointer-events: none;
      z-index: 0;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  }

  addHoverEffect(element) {
    // Add a subtle scaling effect
    element.style.transform = 'translateY(-2px) scale(1.05)';
    
    // Reset after a short delay
    setTimeout(() => {
      element.style.transform = '';
    }, 200);
  }
}

// Add ripple keyframes to document
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(2);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('🏁 Enhanced Navigation: DOM loaded, initializing navigation...');
  
  try {
    window.enhancedNavigation = new EnhancedNavigation();
    console.log('✅ Enhanced Navigation: Successfully initialized');
  } catch (error) {
    console.error('❌ Enhanced Navigation: Failed to initialize:', error);
  }
});

// Handle window resize
window.addEventListener('resize', () => {
  if (window.enhancedNavigation && window.enhancedNavigation.isMenuOpen && window.innerWidth >= 768) {
    window.enhancedNavigation.closeMobileMenu();
  }
});
