# PowerShell script to update all HTML pages for Netlify deployment
Write-Host "🔄 Updating all pages for Netlify compatibility..." -ForegroundColor Green

# Function to update file content with proper error handling
function Update-FileContent {
    param(
        [string]$FilePath,
        [string]$SearchPattern,
        [string]$ReplacePattern
    )
    
    if (Test-Path $FilePath) {
        try {
            $content = Get-Content $FilePath -Raw -Encoding UTF8
            if ($content -match $SearchPattern) {
                $newContent = $content -replace $SearchPattern, $ReplacePattern
                Set-Content $FilePath -Value $newContent -Encoding UTF8
                Write-Host "✅ Updated: $FilePath" -ForegroundColor Yellow
                return $true
            } else {
                Write-Host "ℹ️  Pattern not found in: $FilePath" -ForegroundColor Cyan
                return $false
            }
        } catch {
            Write-Host "❌ Error updating $FilePath`: $_" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "⚠️  File not found: $FilePath" -ForegroundColor Red
        return $false
    }
}

# List of main website files to update
$websiteFiles = @(
    "about.html",
    "academics.html", 
    "admissions.html",
    "campus-life.html",
    "gallery.html",
    "test-dynamic-navigation.html",
    "test-nav-footer.html"
)

Write-Host "🔧 Updating main website files..." -ForegroundColor Cyan

foreach ($file in $websiteFiles) {
    if (Test-Path $file) {
        Write-Host "`n📝 Processing $file..." -ForegroundColor White
        
        # Update navigation script
        Update-FileContent $file 'scripts/navigation-loader\.js' 'scripts/dynamic-navigation-netlify.js'
        
        # Add footer script if not present
        $content = Get-Content $file -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        if ($content -and $content -notmatch 'dynamic-footer-netlify\.js') {
            $pattern = '(<script src="scripts/dynamic-navigation-netlify\.js"></script>)'
            $replacement = '$1' + "`n  <script src=`"scripts/dynamic-footer-netlify.js`"></script>"
            Update-FileContent $file $pattern $replacement
        }
        
        # Update navigation ID if needed
        Update-FileContent $file '<nav class="([^"]*)"' '<nav id="desktop-navigation" class="$1"'
        
        # Update mobile menu ID if needed  
        Update-FileContent $file 'id="mobile-menu"' 'id="mobile-navigation"'
        
        # Update mobile menu JavaScript references
        Update-FileContent $file "getElementById\('mobile-menu'\)" "getElementById('mobile-navigation')"
        
        # Ensure footer has proper ID for dynamic loading
        Update-FileContent $file '<footer class="([^"]*)"' '<footer id="dynamic-footer" class="$1" data-dynamic="true"'
    }
}

Write-Host "`n🔧 Updating admin files..." -ForegroundColor Cyan

# Update admin files  
$adminFiles = @(
    "admin/navigation-editor.html",
    "admin/footer-editor.html"
)

foreach ($file in $adminFiles) {
    if (Test-Path $file) {
        Write-Host "📝 Processing $file..." -ForegroundColor White
        
        # Make sure admin files use netlify-auth.js
        Update-FileContent $file 'static-auth\.js' 'netlify-auth.js'
        
        # Update API calls to use Netlify Functions
        Update-FileContent $file 'api\.php\?endpoint=' '/.netlify/functions/api?endpoint='
    }
}

Write-Host "`n✨ Update completed!" -ForegroundColor Green
Write-Host "📋 Summary of changes:" -ForegroundColor Cyan
Write-Host "  • Updated navigation scripts to use dynamic-navigation-netlify.js" -ForegroundColor White  
Write-Host "  • Added dynamic-footer-netlify.js to all pages" -ForegroundColor White
Write-Host "  • Updated navigation and mobile menu IDs" -ForegroundColor White
Write-Host "  • Updated admin files to use Netlify Functions API" -ForegroundColor White
Write-Host "  • Ensured footers have proper IDs for dynamic loading" -ForegroundColor White

Write-Host "`n🧪 Next steps:" -ForegroundColor Green
Write-Host "1. Test the navigation editor: http://localhost/sssbpuc-admin/admin/navigation-editor.html" -ForegroundColor Gray
Write-Host "2. Test the footer editor: http://localhost/sssbpuc-admin/admin/footer-editor.html" -ForegroundColor Gray  
Write-Host "3. Check any page to see dynamic navigation: http://localhost/sssbpuc-admin/index.html" -ForegroundColor Gray
Write-Host "4. Test API endpoints: http://localhost/sssbpuc-admin/test-api.html" -ForegroundColor Gray
