# Enhanced Admin Dashboard for SSSBPUC Website

## 🚀 Overview

The Enhanced Admin Dashboard is a comprehensive content management system that allows you to manage every aspect of your SSSBPUC website. It includes advanced features like file management, page editing, content management, media library, backup/restore, and enhanced security.

## ✨ Features

### 🗂️ File Manager
- **Upload Files**: Drag & drop or browse to upload files
- **Organize Files**: Create folders and organize your website files
- **Delete Files**: Remove unwanted files with bulk selection
- **File Types**: Support for images, documents, HTML, CSS, JavaScript files
- **File Size**: Up to 10MB per file upload
- **Grid/List Views**: Switch between visual grid and detailed list views

### ✏️ Page Editor
- **Rich Text Editor**: TinyMCE integration for WYSIWYG editing
- **All Pages**: Edit Homepage, About, Academics, Admissions, Campus Life, Gallery
- **Live Preview**: Preview changes before publishing
- **Undo/Redo**: Advanced editing history
- **Auto-Save**: Automatic backup before changes

### 📄 Content Manager
- **JSON Editing**: Direct editing of data files
- **Validation**: Built-in JSON validation
- **Export/Import**: Backup and restore content
- **Real-time Updates**: Changes reflect immediately on website

### 🖼️ Media Library
- **Image Management**: Organize all website images
- **Bulk Upload**: Upload multiple files at once
- **Filters**: Filter by type, folder, search
- **Preview**: Visual previews of media files
- **Optimization**: Support for web-optimized formats

### 🔒 Security Features
- **Secure Authentication**: Enhanced login with attempt limiting
- **CSRF Protection**: Cross-site request forgery protection
- **Session Management**: Secure session handling
- **Access Logging**: Track all admin activities
- **Password Security**: Strong password requirements

### 💾 Backup & Restore
- **Automatic Backups**: Create backups before major changes
- **Full System Backup**: Complete website backup in ZIP format
- **Restore Points**: Restore from any previous backup
- **Scheduled Backups**: Regular automated backups

## 🛠️ Installation

### Prerequisites
- Web server with PHP 7.4+ (Apache/Nginx)
- PHP extensions: ZipArchive, JSON, Session
- Write permissions for uploads, data, and backups directories

### Setup Instructions

1. **Upload Files**
   ```
   Upload all files to your web server directory:
   - admin-enhanced.html
   - admin-api-enhanced.php
   - admin-login-enhanced.html
   - scripts/enhanced-admin.js
   ```

2. **Set Directory Permissions**
   ```bash
   chmod 755 data/
   chmod 755 uploads/
   chmod 755 backups/
   chmod 755 assets/
   ```

3. **Configure Settings**
   
   Open `admin-api-enhanced.php` and update the configuration:
   ```php
   $config = [
       'admin_username' => 'your_username',     // Change this
       'admin_password' => 'your_secure_password', // Change this
       'max_file_size' => 10 * 1024 * 1024,    // 10MB default
       // ... other settings
   ];
   ```

4. **Test Installation**
   - Visit `admin-login-enhanced.html` in your browser
   - Login with your configured credentials
   - Verify all sections load properly

## 🔐 Default Login Credentials

**⚠️ IMPORTANT: Change these immediately after installation!**

- **Username**: `admin`
- **Password**: `sssbpuc2025`

## 📋 Usage Guide

### Getting Started

1. **Login**
   - Navigate to `admin-login-enhanced.html`
   - Enter your username and password
   - Enable "Remember me" for convenience (optional)

2. **Dashboard Overview**
   - View website statistics
   - Quick action buttons for common tasks
   - System status information

### Managing Files

1. **Upload Files**
   - Go to File Manager section
   - Click "Upload Files" or drag & drop files
   - Files are organized in folders (assets, components, data, scripts, styles)

2. **Organize Files**
   - Create new folders with "New Folder" button
   - Select files to move or delete
   - Use grid/list view toggle for better organization

3. **Delete Files**
   - Select files by clicking them
   - Click "Delete Selected" button
   - Confirm deletion in the popup

### Editing Pages

1. **Select Page**
   - Go to Page Editor section
   - Click on the page you want to edit (Homepage, About, etc.)

2. **Edit Content**
   - Use the rich text editor to modify content
   - Format text, add images, create lists
   - Changes are shown in real-time

3. **Save Changes**
   - Click "Save Page" when finished
   - Use "Preview" to see changes before saving
   - Automatic backup is created before saving

### Managing Content

1. **Edit Data Files**
   - Go to Content Manager section
   - Click on any JSON file to edit
   - Use the JSON editor with syntax highlighting

2. **Validate JSON**
   - Click "Validate JSON" to check for errors
   - Fix any syntax issues before saving
   - JSON structure must remain intact

3. **Export/Import**
   - Export current content for backup
   - Import previously saved content
   - Use for transferring content between environments

### Media Library

1. **View Media**
   - Go to Media Library section
   - Browse all images and media files
   - Use filters to find specific files

2. **Upload Media**
   - Click "Bulk Upload" for multiple files
   - Drag & drop directly into the interface
   - Supported formats: JPG, PNG, GIF, MP4, WEBM

3. **Organize Media**
   - Use "Organize" button to sort files
   - Filter by type, folder, or search
   - Delete unused media files

### Security Settings

1. **Change Password**
   - Go to Settings section
   - Enter new password (minimum 8 characters)
   - Confirm the new password
   - Update immediately for security

2. **View System Info**
   - Check PHP version and server details
   - Monitor storage usage
   - Review last login information

### Backup & Restore

1. **Create Backup**
   - Click "Create Backup" in Settings
   - Full website backup is created as ZIP file
   - Includes all content, files, and settings

2. **Restore Backup**
   - Click "Restore" and select backup file
   - Choose what to restore (content, files, settings)
   - Confirm restoration process

## 🚨 Security Best Practices

### 1. Change Default Credentials
```php
// In admin-api-enhanced.php
'admin_username' => 'your_secure_username',
'admin_password' => 'your_very_secure_password',
```

### 2. File Permissions
- Set strict file permissions (644 for files, 755 for directories)
- Ensure uploads directory is not directly accessible via web
- Use .htaccess to protect admin files

### 3. HTTPS Only
- Always use HTTPS for admin access
- Set secure cookie flags in PHP configuration
- Enable HTTP Strict Transport Security (HSTS)

### 4. Regular Backups
- Schedule daily automatic backups
- Store backups in secure, off-site location
- Test restore procedures regularly

### 5. Access Monitoring
- Monitor admin login attempts
- Set up alerts for suspicious activity
- Review access logs regularly

## 📁 Directory Structure

```
your-website/
├── admin-enhanced.html          # Main admin dashboard
├── admin-login-enhanced.html    # Login page
├── admin-api-enhanced.php       # Backend API
├── scripts/
│   └── enhanced-admin.js        # Dashboard JavaScript
├── data/                        # Content JSON files
│   ├── homepage.json
│   ├── about.json
│   └── ...
├── uploads/                     # Uploaded files
│   ├── images/
│   └── documents/
├── backups/                     # System backups
│   └── backup_YYYY-MM-DD.zip
└── assets/                      # Website assets
    ├── logo/
    ├── photos/
    └── ...
```

## 🔧 Customization

### Adding New Content Types

1. **Define in Configuration**
   ```php
   // In admin-api-enhanced.php
   'content_types' => [
       'news' => 'News Articles',
       'events' => 'Events',
       'staff' => 'Staff Members'
   ],
   ```

2. **Create Data Structure**
   ```json
   // In data/news.json
   {
       "articles": [
           {
               "title": "Article Title",
               "content": "Article content...",
               "date": "2024-01-01",
               "author": "Author Name"
           }
       ]
   }
   ```

3. **Add UI Elements**
   - Update `admin-enhanced.html` with new sections
   - Modify `enhanced-admin.js` for new functionality
   - Test thoroughly before deployment

### Theming

1. **Update Colors**
   ```css
   /* In admin-enhanced.html <style> section */
   :root {
       --primary-color: #1B3764;
       --secondary-color: #DAA520;
       --success-color: #10B981;
       --danger-color: #EF4444;
   }
   ```

2. **Custom Branding**
   - Replace school logo in assets/logo/
   - Update titles and headers
   - Modify color scheme to match school branding

## 🐛 Troubleshooting

### Common Issues

1. **Login Problems**
   - Check PHP session configuration
   - Verify file permissions
   - Clear browser cookies and cache
   - Check server error logs

2. **File Upload Failures**
   - Increase PHP upload_max_filesize
   - Check directory write permissions
   - Verify available disk space
   - Review allowed file types

3. **Backup Creation Errors**
   - Ensure ZipArchive PHP extension is installed
   - Check available disk space
   - Verify backups directory permissions
   - Review PHP memory_limit setting

4. **JSON Validation Errors**
   - Use online JSON validators
   - Check for trailing commas
   - Verify proper quote usage
   - Ensure proper nesting structure

### Error Logs

- Check PHP error logs in `/var/log/php/`
- Browser console for JavaScript errors
- Network tab for API request failures
- Server access logs for security issues

## 📞 Support

For technical support or feature requests:

1. **Check Documentation**: Review this README thoroughly
2. **Error Logs**: Collect relevant error messages
3. **Browser Console**: Check for JavaScript errors
4. **Test Environment**: Try to reproduce issues
5. **Contact**: Provide detailed error descriptions

## 🔄 Updates & Maintenance

### Regular Maintenance Tasks

1. **Weekly**
   - Review access logs
   - Check backup integrity
   - Monitor disk space usage
   - Update content as needed

2. **Monthly**
   - Change admin passwords
   - Review security settings
   - Clean up old backups
   - Update PHP/server software

3. **Quarterly**
   - Full security audit
   - Performance optimization
   - Feature usage review
   - Staff training updates

### Version History

- **v2.0.0**: Enhanced admin dashboard with comprehensive features
- **v1.0.0**: Basic admin dashboard with content editing

---

## 📝 License

This enhanced admin dashboard is proprietary software developed for SSSBPUC. All rights reserved.

**Copyright © 2024 SSSBPUC. All rights reserved.**

# SSSBPUC Admin System

A comprehensive content management system for managing website images and content.

## 🚀 Features

- **Secure Admin Login**: Session-based authentication with automatic timeout
- **Image Upload & Management**: Drag-and-drop file uploads with progress tracking
- **Category Organization**: Organized image storage by categories (gallery, campus, homepage, etc.)
- **Image Optimization**: Automatic image resizing and compression
- **Real-time Stats**: Dashboard with image counts and statistics
- **Bulk Operations**: Upload multiple images at once
- **Replace & Delete**: Easy image replacement and deletion
- **Responsive Design**: Works on desktop and mobile devices

## 📁 File Structure

```
site/
├── admin-login.html          # Admin login page
├── admin-dashboard.html      # Main admin dashboard
├── admin-api.php            # Backend API for image management
├── .htaccess               # Apache configuration
├── assets/
│   ├── uploads/            # General uploads
│   ├── homepage/           # Homepage images
│   ├── facilities/         # Facility images
│   ├── photos/            # Gallery photos
│   ├── campus/            # Campus images
│   ├── baba/              # Founder images
│   ├── sister/            # Sister institute images
│   └── logo/              # Logo images
```

## 🔧 Setup Instructions

### Prerequisites
- Web server with PHP support (Apache/Nginx)
- PHP 7.4 or higher
- GD extension enabled for image processing
- Write permissions on assets folder

### Installation

1. **Upload files** to your web server
2. **Set permissions** on the assets folder:
   ```bash
   chmod -R 755 site/assets/
   ```
3. **Configure PHP** (if needed):
   - Increase `upload_max_filesize` and `post_max_size` in php.ini
   - Set `max_execution_time` to at least 300 seconds
4. **Test the setup** by visiting `your-domain.com/admin-login.html`

### Default Credentials
- **Username**: `admin`
- **Password**: `sssbpuc2025`

> ⚠️ **IMPORTANT**: Change these credentials in `admin-api.php` before going live!

## 🖱️ How to Use

### 1. Login
- Visit `/admin-login.html`
- Enter your credentials
- Check "Remember me" for longer sessions

### 2. Dashboard Overview
- View statistics for total images, gallery photos, etc.
- Use quick action buttons to jump to specific sections

### 3. Managing Images

#### Upload New Images
1. Navigate to the desired section (Gallery, Campus, etc.)
2. Click "Upload" or drag files to the upload area
3. Supported formats: JPG, PNG, GIF, WebP (max 5MB each)
4. Images are automatically optimized

#### Replace Images
1. Hover over an image in the grid
2. Click the edit icon
3. Select a new image file
4. The old image will be automatically replaced

#### Delete Images
1. Hover over an image in the grid
2. Click the delete icon
3. Confirm the deletion

### 4. Section-Specific Features

#### Homepage Images
- Manage hero section backgrounds
- Update welcome section images
- Replace logos and branding elements

#### Gallery Images
- Bulk upload multiple photos
- Organize campus life images
- Manage event photos

#### Updates Section
- Update news card images/videos
- Edit titles and descriptions
- Set publication dates

#### Campus & Facilities
- Manage building photos
- Update laboratory images
- Add new facility photos

## 🔒 Security Features

- **Session Management**: Secure login with automatic timeout
- **File Validation**: Only image files are accepted
- **Size Limits**: Maximum 5MB per file
- **Path Security**: Sanitized file paths and names
- **CSRF Protection**: Secure form submissions
- **Access Control**: Admin-only areas protected

## 🛠️ Customization

### Change Admin Credentials
Edit `admin-api.php`:
```php
$config = [
    'admin_username' => 'your-username',
    'admin_password' => 'your-secure-password'
];
```

### Adjust Image Settings
Modify optimization settings in `admin-api.php`:
```php
$maxWidth = 1920;      // Maximum width
$maxHeight = 1080;     // Maximum height
$quality = 85;         // JPEG quality (1-100)
```

### Add New Categories
1. Create new directory in `assets/`
2. Update the categories array in `admin-api.php`
3. Add corresponding section in dashboard

## 🔧 Troubleshooting

### Upload Issues
- **File too large**: Increase PHP limits in php.ini
- **Permission denied**: Check folder permissions (755 or 775)
- **Session timeout**: Increase session timeout in PHP

### Common PHP Settings
Add to php.ini or .htaccess:
```ini
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 300
memory_limit = 256M
```

### Apache Configuration
Ensure mod_rewrite is enabled for clean URLs:
```apache
RewriteEngine On
RewriteRule ^api/(.*)$ admin-api.php?endpoint=$1 [QSA,L]
```

## 📱 Mobile Support

The admin system is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile phones
- Touch devices with drag-and-drop support

## 🔄 Backup Recommendations

1. **Regular Backups**: Backup the entire `assets/` folder regularly
2. **Database**: If using a database, include it in backups
3. **Configuration**: Backup `admin-api.php` with custom settings

## 📞 Support

For technical support or feature requests:
1. Check the troubleshooting section above
2. Verify PHP error logs
3. Test with different browsers
4. Ensure proper file permissions

## 🔐 Production Deployment

Before going live:

1. **Change default credentials**
2. **Disable PHP error display**
3. **Set up HTTPS**
4. **Configure proper file permissions**
5. **Set up regular backups**
6. **Monitor server resources**

---

**Version**: 1.0  
**Last Updated**: January 2025  
**Compatibility**: PHP 7.4+, Modern browsers
