// Page Editor Debug Script
console.log('🔧 Page Editor Debug Script Loaded');

// Override the loadPageSections method to add debugging
if (window.enhancedAdmin && window.enhancedAdmin.loadPageSections) {
  const originalLoadPageSections = window.enhancedAdmin.loadPageSections.bind(window.enhancedAdmin);
  
  window.enhancedAdmin.loadPageSections = function(pageName) {
    console.log('🎯 DEBUG: loadPageSections called with:', pageName);
    
    // Check if sections container exists
    const sectionsContainer = document.getElementById('sections-container');
    console.log('📦 DEBUG: sections-container exists:', !!sectionsContainer);
    
    // Check if sections grid exists
    const sectionsGrid = document.getElementById('sections-grid');
    console.log('🔲 DEBUG: sections-grid exists:', !!sectionsGrid);
    
    // Call original method
    try {
      const result = originalLoadPageSections(pageName);
      console.log('✅ DEBUG: loadPageSections completed successfully');
      
      // Check container visibility after execution
      setTimeout(() => {
        const container = document.getElementById('sections-container');
        console.log('👁️ DEBUG: sections-container visible after load:', 
                   container && container.style.display !== 'none');
        
        const grid = document.getElementById('sections-grid');
        console.log('📋 DEBUG: sections-grid content after load:', 
                   grid ? grid.innerHTML.length + ' characters' : 'not found');
      }, 1000);
      
      return result;
    } catch (error) {
      console.error('❌ DEBUG: loadPageSections failed:', error);
      throw error;
    }
  };
  
  console.log('🔧 DEBUG: loadPageSections method has been wrapped for debugging');
} else {
  console.warn('⚠️ DEBUG: enhancedAdmin or loadPageSections not available for debugging');
}

// Add event listeners to page buttons for debugging
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    const pageButtons = document.querySelectorAll('.page-select-btn');
    console.log(`🎯 DEBUG: Found ${pageButtons.length} page buttons`);
    
    pageButtons.forEach((btn, index) => {
      const page = btn.getAttribute('data-page');
      console.log(`🔘 DEBUG: Button ${index + 1}: ${page}`);
      
      // Add debug listener
      btn.addEventListener('click', function(e) {
        console.log('🖱️ DEBUG: Page button clicked:', page);
        console.log('🖱️ DEBUG: Event:', e);
        console.log('🖱️ DEBUG: Button element:', this);
      });
    });
  }, 2000);
});

// Manual test function
window.testPageEditor = function(pageName = 'homepage') {
  console.log('🧪 MANUAL TEST: Testing page editor with:', pageName);
  
  if (window.enhancedAdmin && window.enhancedAdmin.loadPageSections) {
    try {
      window.enhancedAdmin.loadPageSections(pageName);
      console.log('✅ MANUAL TEST: Page editor test completed');
    } catch (error) {
      console.error('❌ MANUAL TEST: Page editor test failed:', error);
    }
  } else {
    console.error('❌ MANUAL TEST: Enhanced Admin or loadPageSections not available');
  }
};

console.log('🎯 DEBUG: Use testPageEditor("homepage") to manually test page loading');
