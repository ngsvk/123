# Netlify Deployment Guide for SSSBPUC Admin

## Problem Solved
Your website works in XAMPP but shows "Connection error" on Netlify because:
- **XAMPP**: Runs PHP server-side code for authentication and data processing
- **Netlify**: Only serves static files (HTML, CSS, JS) - cannot execute PHP

## Solution Implemented
I've created a **static authentication system** that works on Netlify:

### Files Added/Modified:
1. **`admin/static-auth.js`** - JavaScript-based authentication system
2. **`admin/auth-guard.js`** - Dashboard protection system
3. **`admin/login.html`** - Updated to use static auth on Netlify
4. **`dashboard.html`** - Protected with authentication guard
5. **Admin pages** - All admin pages now require login
6. **`netlify.toml`** - Netlify configuration file
7. **`404.html`** - Custom error page

## How to Deploy to Netlify

### Method 1: Drag & Drop (Easiest)
1. **Exclude PHP files** - Create a new folder with only these files:
   ```
   /admin/
     - login.html
     - static-auth.js (and other admin HTML files)
   /assets/
   /components/
   /data/
   /scripts/
   /styles/
   /vendor/
   - index.html
   - about.html
   - academics.html
   - (other HTML files)
   - netlify.toml
   - 404.html
   ```

2. **Zip the folder** or drag it directly to Netlify

3. **Drop on Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Drag your folder/zip to the deployment area
   - Your site will be live in minutes!

### Method 2: GitHub Integration
1. **Push to GitHub** (exclude PHP files):
   ```bash
   git init
   git add . --ignore=*.php
   git commit -m "Static version for Netlify"
   git remote add origin YOUR_GITHUB_REPO
   git push -u origin main
   ```

2. **Connect to Netlify**:
   - Login to Netlify
   - "New site from Git"
   - Choose your repository
   - Build settings: Leave empty (static site)
   - Deploy!

## Authentication Details

### Credentials (same as PHP version):
- **Username**: `admin`
- **Password**: `sssbpuc2025`

### How It Works:
- **Local (XAMPP)**: Uses PHP API (`api.php`)
- **Netlify**: Uses JavaScript authentication (`static-auth.js`)
- The system automatically detects the environment
- **Dashboard Protection**: All admin pages redirect to login if not authenticated
- **Session Management**: Automatic logout after session expires
- **Multi-tab Security**: Logout in one tab logs out all tabs

### Security Features:
- ✅ Dashboard protection (automatic redirect if not logged in)
- ✅ Session management (logout if session expires)
- ✅ Multi-tab logout synchronization
- ✅ Periodic authentication checks
- ✅ Graceful logout with user feedback

### Current Limitations:
1. **No file uploads** - Netlify can't save files server-side
2. **No persistent data changes** - Changes save to browser storage only
3. **Basic authentication** - For demo purposes

## Advanced: Adding Server Functionality

If you need server-side features (file uploads, database), you can:

### Option 1: Netlify Functions
- Add serverless functions for specific API endpoints
- Supports file uploads to cloud storage
- More complex but preserves functionality

### Option 2: External API
- Use services like Firebase, Supabase, or AWS
- Full database and authentication support
- Requires additional setup

### Option 3: Hybrid Approach
- Keep static site for public pages
- Use separate admin backend (Heroku, DigitalOcean)

## Testing the Deployment

1. **Test locally** first:
   - Open `http://localhost/sssbpuc-admin/admin/login.html`
   - Login should work with both PHP and static auth

2. **Test on Netlify**:
   - Visit your Netlify URL + `/admin/login.html`
   - Login with: admin / sssbpuc2025
   - Should redirect to dashboard

## Troubleshooting

### "Connection error" still appears:
- Check browser console for errors
- Ensure `static-auth.js` is loading
- Verify the file paths are correct

### Login not working:
- Check credentials: `admin` / `sssbpuc2025`
- Clear browser cache/storage
- Check browser console for JavaScript errors

### 404 errors:
- Ensure all HTML files are in the deployed folder
- Check `netlify.toml` configuration
- Verify file paths in your HTML

## Next Steps

1. **Deploy the static version** to test basic functionality
2. **Evaluate limitations** - determine what server features you need
3. **Choose upgrade path** if full admin functionality is required

Your website should now work on Netlify! The authentication will be handled client-side, and users can log in to access the admin area.
