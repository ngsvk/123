# PowerShell script to update remaining HTML pages with dynamic footer

$pages = @("campus-life.html", "gallery.html")
$dynamicFooterHtml = @"
  <!-- Footer -->
  <footer id="dynamic-footer" data-dynamic="true">
    <!-- Footer content will be loaded dynamically by dynamic-footer-netlify.js -->
    <!-- Loading placeholder -->
    <div class="bg-gray-900 text-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="text-gray-400">Loading footer...</div>
      </div>
    </div>
  </footer>
"@

foreach ($page in $pages) {
    if (Test-Path $page) {
        Write-Host "Processing $page..."
        
        # Read the file content
        $content = Get-Content $page -Raw -Encoding UTF8
        
        # Find and replace the static footer section (this is a simplified approach)
        # In practice, you'd need more sophisticated regex to handle the full footer HTML
        
        # Remove old dynamic footer script reference
        $content = $content -replace '\s*<script src="scripts/dynamic-footer\.js"></script>', ''
        
        # For now, just show what would be updated
        Write-Host "Would update $page with dynamic footer"
        Write-Host "Old footer script references would be removed"
    }
}

Write-Host "Script completed - manual updates may be required for complex footer replacements"
