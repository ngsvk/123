const fs = require('fs');
const path = require('path');

// Create public directory structure
const publicDir = path.join(process.cwd(), 'public');
const adminDir = path.join(publicDir, 'admin');
const assetsDir = path.join(publicDir, 'assets');
const dataDir = path.join(publicDir, 'data');

// Ensure directories exist
[publicDir, adminDir, assetsDir, dataDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

console.log('🏗️  Building SSSBPUC website for Netlify...');

// Files to copy to public directory
const filesToCopy = [
  // Main website files
  { src: 'index.html', dest: 'public/index.html' },
  { src: 'about.html', dest: 'public/about.html' },
  { src: 'academics.html', dest: 'public/academics.html' },
  { src: 'admissions.html', dest: 'public/admissions.html' },
  { src: 'campus-life.html', dest: 'public/campus-life.html' },
  { src: 'gallery.html', dest: 'public/gallery.html' },
  { src: 'test-dynamic-navigation.html', dest: 'public/test-dynamic-navigation.html' },
  
  // Admin files (convert to static admin)
  { src: 'admin/login.html', dest: 'public/admin/index.html' }, // Redirect admin root to login
  { src: 'admin/dashboard.html', dest: 'public/admin/dashboard.html' },
  { src: 'admin/website-content-manager.html', dest: 'public/admin/content-manager.html' },
  { src: 'admin/navigation-editor.html', dest: 'public/admin/navigation-editor.html' },
  { src: 'admin/footer-editor.html', dest: 'public/admin/footer-editor.html' },
  { src: 'admin/sister-institutes-manager.html', dest: 'public/admin/sister-institutes.html' },
  { src: 'admin/visual-content-editor.html', dest: 'public/admin/visual-editor.html' },
  
  // JavaScript files
  { src: 'admin/static-auth.js', dest: 'public/admin/static-auth.js' },
  { src: 'admin/auth-guard.js', dest: 'public/admin/auth-guard.js' },
  { src: 'admin/page-redirects.js', dest: 'public/admin/page-redirects.js' },
  { src: 'admin/content-sync.js', dest: 'public/admin/content-sync.js' },
  { src: 'scripts/dynamic-navigation.js', dest: 'public/scripts/dynamic-navigation.js' },
  { src: 'scripts/dynamic-footer.js', dest: 'public/scripts/dynamic-footer.js' },
  { src: 'scripts/website-content-manager.js', dest: 'public/scripts/website-content-manager.js' },
  
  // 404 page
  { src: '404.html', dest: 'public/404.html', optional: true }
];

// Copy assets directory recursively
function copyDirectory(src, dest) {
  if (!fs.existsSync(src)) return;
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const items = fs.readdirSync(src);
  
  items.forEach(item => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

// Copy files
filesToCopy.forEach(({ src, dest, optional }) => {
  try {
    const srcPath = path.join(process.cwd(), src);
    const destPath = path.join(process.cwd(), dest);
    
    if (fs.existsSync(srcPath)) {
      // Ensure destination directory exists
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(srcPath, destPath);
      console.log(`✅ Copied: ${src} → ${dest}`);
    } else if (!optional) {
      console.log(`⚠️  Missing: ${src}`);
    }
  } catch (error) {
    console.error(`❌ Error copying ${src}:`, error.message);
  }
});

// Copy assets directory
try {
  copyDirectory('assets', 'public/assets');
  console.log('✅ Copied assets directory');
} catch (error) {
  console.error('❌ Error copying assets:', error.message);
}

// Copy data files
try {
  if (fs.existsSync('data')) {
    copyDirectory('data', 'public/data');
    console.log('✅ Copied data directory');
  } else {
    console.log('⚠️  No data directory found, creating empty one');
    fs.mkdirSync('public/data', { recursive: true });
  }
} catch (error) {
  console.error('❌ Error copying data:', error.message);
}

// Create a simple 404.html if it doesn't exist
if (!fs.existsSync('public/404.html')) {
  const html404 = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Not Found - SSSBPUC</title>
  <link rel="shortcut icon" type="image/x-icon" href="assets/logo/school-logo.png">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 flex items-center justify-center min-h-screen">
  <div class="text-center">
    <img src="assets/logo/school-logo.png" alt="SSSBPUC" class="w-16 h-16 mx-auto mb-4" onerror="this.style.display='none'">
    <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
    <h2 class="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
    <p class="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
    <a href="/" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
      Go Home
    </a>
  </div>
</body>
</html>`;
  
  fs.writeFileSync('public/404.html', html404);
  console.log('✅ Created 404.html');
}

// Create static API simulation files for client-side use
const staticApi = {
  config: {
    adminCredentials: {
      username: "admin",
      password: "sssbpuc2025" // In production, this should be handled securely
    }
  }
};

fs.writeFileSync('public/admin/config.json', JSON.stringify(staticApi, null, 2));
console.log('✅ Created admin config file');

console.log('🎉 Build completed successfully!');
console.log('📁 Files are ready in the public/ directory for Netlify deployment');
console.log('🚀 You can now run: netlify deploy --dir=public');
