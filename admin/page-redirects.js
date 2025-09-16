// Page Redirects for Navigation and Footer Management
// This script handles redirects for special pages like Navigation and Footer

(function() {
  'use strict';

  // Pages that should redirect to special editors
  const specialPages = {
    'navigation': 'navigation-editor.html',
    'footer': 'footer-editor.html'
  };

  // Override the original renderPageSelector function if it exists
  function enhancePageSelector() {
    const pageSelector = document.getElementById('page-selector');
    if (!pageSelector) return;

    // Create the standard page buttons plus special ones
    const pages = [
      { id: 'homepage', name: 'Homepage', icon: 'ri-home-line', type: 'page' },
      { id: 'about', name: 'About', icon: 'ri-information-line', type: 'page' },
      { id: 'academics', name: 'Academics', icon: 'ri-book-line', type: 'page' },
      { id: 'admissions', name: 'Admissions', icon: 'ri-graduation-cap-line', type: 'page' },
      { id: 'campus-life', name: 'Campus Life', icon: 'ri-building-line', type: 'page' },
      { id: 'gallery', name: 'Gallery', icon: 'ri-gallery-line', type: 'page' },
      { id: 'navigation', name: 'Navigation', icon: 'ri-navigation-line', type: 'redirect' },
      { id: 'footer', name: 'Footer', icon: 'ri-layout-bottom-line', type: 'redirect' }
    ];

    // Clear existing content
    pageSelector.innerHTML = '';

    pages.forEach((page) => {
      const button = document.createElement('button');
      button.className = 'p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors group';
      
      if (page.type === 'redirect') {
        button.classList.add('bg-yellow-50', 'border-yellow-200');
      }
      
      button.innerHTML = `
        <i class="${page.icon} text-2xl text-primary mb-2 group-hover:scale-110 transition-transform"></i>
        <div class="text-sm font-medium">${page.name}</div>
        ${page.type === 'redirect' ? '<div class="text-xs text-gray-500 mt-1">→ Dedicated Editor</div>' : ''}
      `;

      if (page.type === 'redirect') {
        button.addEventListener('click', () => {
          const redirectUrl = specialPages[page.id];
          if (redirectUrl) {
            console.log(`🔄 Redirecting to ${page.name} Editor: ${redirectUrl}`);
            window.location.href = redirectUrl;
          }
        });
      } else {
        // Regular page button - use original functionality
        button.addEventListener('click', () => {
          if (window.selectPage && typeof window.selectPage === 'function') {
            window.selectPage(page.id);
          } else {
            console.warn('selectPage function not available');
          }
        });
      }

      pageSelector.appendChild(button);
    });

    console.log('✅ Enhanced page selector with Navigation and Footer redirects');
  }

  // Wait for DOM and original scripts to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(enhancePageSelector, 100);
    });
  } else {
    setTimeout(enhancePageSelector, 100);
  }

})();
