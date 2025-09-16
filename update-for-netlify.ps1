# PowerShell script to update HTML files for Netlify deployment
Write-Host "🚀 Updating SSSBPUC website for Netlify deployment..." -ForegroundColor Green

# Function to update file content
function Update-FileContent {
    param(
        [string]$FilePath,
        [string]$SearchPattern,
        [string]$ReplacePattern
    )
    
    if (Test-Path $FilePath) {
        $content = Get-Content $FilePath -Raw
        $newContent = $content -replace $SearchPattern, $ReplacePattern
        Set-Content $FilePath -Value $newContent
        Write-Host "✅ Updated: $FilePath" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️  File not found: $FilePath" -ForegroundColor Red
    }
}

# Update main website files to use Netlify navigation
$websiteFiles = @(
    "index.html",
    "about.html", 
    "academics.html",
    "admissions.html",
    "campus-life.html",
    "gallery.html",
    "test-dynamic-navigation.html"
)

foreach ($file in $websiteFiles) {
    if (Test-Path $file) {
        Write-Host "🔄 Updating $file for Netlify..."
        
        # Update navigation script
        Update-FileContent $file 'scripts/dynamic-navigation\.js' 'scripts/dynamic-navigation-netlify.js'
        
        # Update footer script (if exists)
        Update-FileContent $file 'scripts/dynamic-footer\.js' 'scripts/dynamic-footer-netlify.js'
        
        # Update API calls from admin/api.php to /.netlify/functions/api
        Update-FileContent $file 'admin/api\.php' '/.netlify/functions/api'
    }
}

# Update admin files to use Netlify auth
$adminFiles = @(
    "admin/login.html",
    "admin/dashboard.html",
    "admin/website-content-manager.html",
    "admin/navigation-editor.html",
    "admin/footer-editor.html",
    "admin/sister-institutes-manager.html",
    "admin/visual-content-editor.html"
)

foreach ($file in $adminFiles) {
    if (Test-Path $file) {
        Write-Host "🔄 Updating $file for Netlify..."
        
        # Update auth script
        Update-FileContent $file 'static-auth\.js' 'netlify-auth.js'
        
        # Update API endpoints
        Update-FileContent $file 'api\.php' '/.netlify/functions/api'
    }
}

# Create .gitignore if it doesn't exist
if (-not (Test-Path ".gitignore")) {
    Write-Host "📝 Creating .gitignore..."
    @"
# Dependencies
node_modules/
npm-debug.log*

# Build output
dist/
public/

# Environment variables
.env
.env.local
.env.production

# Logs
*.log

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# PHP files (not needed for Netlify)
*.php.bak

# Local Netlify folder
.netlify/
"@ | Out-File ".gitignore" -Encoding UTF8
}

# Create README for deployment
if (-not (Test-Path "README.md")) {
    Write-Host "📝 Creating README.md..."
    @"
# SSSBPUC Website

Sri Sathya Sai Baba PU College official website built with HTML, CSS, JavaScript, and deployed on Netlify.

## Features

- 📱 Responsive design
- ⚡ Fast loading with CDN
- 🔐 Admin dashboard for content management
- 🎨 Dynamic navigation and footer
- 📧 Contact forms
- 🖼️ Image gallery

## Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript, TailwindCSS
- **Backend:** Netlify Functions (Serverless)
- **Hosting:** Netlify
- **CMS:** Custom admin dashboard

## Deployment

This site is deployed on Netlify. See `NETLIFY-DEPLOYMENT.md` for deployment instructions.

## Development

1. Clone the repository
2. Open `index.html` in a web browser
3. For admin access, go to `/admin/`

## Admin Access

- Username: admin
- Password: sssbpuc2025

## Contact

Sri Sathya Sai Baba PU College
Mysuru, Karnataka
Phone: 0821 2410856
Email: sssbpucnn0385@gmail.com
"@ | Out-File "README.md" -Encoding UTF8
}

Write-Host "" -ForegroundColor Green
Write-Host "🎉 Update completed!" -ForegroundColor Green
Write-Host "" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review the changes made to your files" -ForegroundColor White
Write-Host "2. Read NETLIFY-DEPLOYMENT.md for deployment instructions" -ForegroundColor White
Write-Host "3. Initialize Git and push to GitHub" -ForegroundColor White
Write-Host "4. Deploy to Netlify using the deployment guide" -ForegroundColor White
Write-Host "" -ForegroundColor Green
Write-Host "Files updated for Netlify deployment! ✨" -ForegroundColor Green
