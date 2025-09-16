// Quick Debug Script for Admin Dashboard
console.log('🔧 Debug Script Started');

// Test 1: Check if enhanced admin script loaded
console.log('1. Enhanced Admin Class Available:', typeof EnhancedAdmin !== 'undefined');
console.log('2. Init Function Available:', typeof initEnhancedAdmin !== 'undefined');

// Test 2: Check if admin instance was created
console.log('3. Admin Instance:', window.enhancedAdmin ? 'Created' : 'Not Created');

// Test 3: Test API connectivity
async function testAPI() {
  try {
    console.log('4. Testing API connection...');
    const response = await fetch('admin/api.php?test=1');
    const data = await response.json();
    console.log('   API Response:', data);
  } catch (error) {
    console.log('   API Error:', error.message);
  }
}

// Test 4: Test JSON file access
async function testJSONFiles() {
  const files = ['homepage.json', 'about.json', 'academics.json'];
  
  for (const file of files) {
    try {
      console.log(`5. Testing ${file}...`);
      const response = await fetch(`data/${file}`);
      const data = await response.json();
      console.log(`   ${file}: OK (${Object.keys(data).length} sections)`);
    } catch (error) {
      console.log(`   ${file}: ERROR - ${error.message}`);
    }
  }
}

// Test 5: Check DOM elements
function testDOMElements() {
  console.log('6. Testing DOM elements...');
  const elements = [
    'total-pages',
    'total-files', 
    'media-count',
    'dashboard-section',
    'page-editor-section',
    'content-manager-section'
  ];
  
  elements.forEach(id => {
    const element = document.getElementById(id);
    console.log(`   ${id}: ${element ? 'Found' : 'Missing'}`);
  });
}

// Run tests when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      testDOMElements();
      testAPI();
      testJSONFiles();
    }, 1000);
  });
} else {
  setTimeout(() => {
    testDOMElements();
    testAPI();  
    testJSONFiles();
  }, 1000);
}

// Manual test function
window.debugAdmin = {
  testAPI,
  testJSONFiles,
  testDOMElements,
  manualInit: () => {
    console.log('🔧 Manual initialization attempt...');
    if (typeof EnhancedAdmin !== 'undefined') {
      try {
        window.enhancedAdmin = new EnhancedAdmin();
        console.log('✅ Manual initialization successful');
      } catch (error) {
        console.error('❌ Manual initialization failed:', error);
      }
    } else {
      console.error('❌ EnhancedAdmin class not found');
    }
  }
};

console.log('🎯 Debug functions available: window.debugAdmin');
console.log('   Run debugAdmin.manualInit() to try manual initialization');
console.log('   Run debugAdmin.testAPI() to test API connection');
