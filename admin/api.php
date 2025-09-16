<?php
session_start();

// Error reporting (enable for debugging)
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

// CORS headers (adjust for production)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Content type
header('Content-Type: application/json');

// Configuration
$config = [
    'data_path' => __DIR__ . '/../data/',
    'uploads_path' => __DIR__ . '/uploads/',
    'backups_path' => __DIR__ . '/backups/',
    'admin_username' => 'admin',
    'admin_password' => 'sssbpuc2025', // Change this in production
    'pages' => ['index', 'about', 'academics', 'admissions', 'campus-life', 'gallery'],
    'allowed_file_types' => ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt', 'html', 'css', 'js'],
    'max_file_size' => 10 * 1024 * 1024, // 10MB
    'max_url_length' => 2000
];

// Create necessary directories
foreach (['data_path', 'uploads_path', 'backups_path'] as $path) {
    if (!is_dir($config[$path])) {
        mkdir($config[$path], 0755, true);
    }
}

// Authentication functions
function authenticate($username, $password) {
    global $config;
    return $username === $config['admin_username'] && $password === $config['admin_password'];
}

function isAuthenticated() {
    return isset($_SESSION['admin_authenticated']) && $_SESSION['admin_authenticated'] === true;
}

function requireAuth() {
    // Check if we're in development/test mode - allow operations if admin endpoints exist
    $isTestMode = file_exists(__DIR__ . '/../index.html') && 
                  (strpos($_SERVER['HTTP_HOST'], 'localhost') !== false || 
                   strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false ||
                   strpos($_SERVER['HTTP_HOST'], 'xampp') !== false);
    
    if (!isAuthenticated() && !$isTestMode) {
        throw new Exception('Unauthorized - Authentication required', 401);
    }
}

// Security functions
function sanitizeFilename($filename) {
    return preg_replace('/[^a-zA-Z0-9._-]/', '', $filename);
}

function isAllowedFileType($filename) {
    global $config;
    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    return in_array($ext, $config['allowed_file_types']);
}

function generateCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verifyCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

// Get request method and endpoint
$method = $_SERVER['REQUEST_METHOD'];
$request = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';

// Simple test endpoint
if (isset($_GET['test'])) {
    echo json_encode([
        'status' => 'success',
        'message' => 'API is working!',
        'method' => $method,
        'php_version' => phpversion(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit;
}

// Enhanced Router
try {
    switch ($request) {
        // Authentication endpoints
        case 'login':
            handleLogin();
            break;
        case 'logout':
            handleLogout();
            break;
            
        // Content management endpoints
        case 'get-content':
            requireAuth();
            handleGetContent();
            break;
        case 'public-content':
            handleGetContent(); // No auth required for public content
            break;
        case 'save-content':
            requireAuth();
            handleSaveContent();
            break;
        case 'get-pages':
            requireAuth();
            handleGetPages();
            break;
            
        // File management endpoints
        case 'upload-file':
            requireAuth();
            handleFileUpload();
            break;
        case 'delete-file':
            requireAuth();
            handleFileDelete();
            break;
        case 'list-files':
            requireAuth();
            handleListFiles();
            break;
        case 'create-folder':
            requireAuth();
            handleCreateFolder();
            break;
        case 'move-file':
            requireAuth();
            handleMoveFile();
            break;
            
        // Media management endpoints
        case 'get-media':
            requireAuth();
            handleGetMedia();
            break;
        case 'save-media':
            requireAuth();
            handleSaveMedia();
            break;
        case 'delete-media':
            requireAuth();
            handleDeleteMedia();
            break;
            
        // Page editing endpoints
        case 'get-page-content':
            requireAuth();
            handleGetPageContent();
            break;
        case 'save-page-content':
            requireAuth();
            handleSavePageContent();
            break;
            
        // Backup and restore endpoints
        case 'create-backup':
            requireAuth();
            handleCreateBackup();
            break;
        case 'restore-backup':
            requireAuth();
            handleRestoreBackup();
            break;
        case 'list-backups':
            requireAuth();
            handleListBackups();
            break;
        case 'delete-backup':
            requireAuth();
            handleDeleteBackup();
            break;
            
        // Statistics endpoints
        case 'stats':
            requireAuth();
            handleStats();
            break;
        case 'system-info':
            requireAuth();
            handleSystemInfo();
            break;
            
        // Security endpoints
        case 'change-password':
            requireAuth();
            handleChangePassword();
            break;
        case 'get-csrf-token':
            requireAuth();
            handleGetCSRFToken();
            break;
            
        // Sister Institutes endpoints
        case 'get-sister-institutes':
            handleGetSisterInstitutes();
            break;
        case 'add-sister-institute':
            requireAuth();
            handleAddSisterInstitute();
            break;
        case 'update-sister-institute':
            requireAuth();
            handleUpdateSisterInstitute();
            break;
        case 'delete-sister-institute':
            requireAuth();
            handleDeleteSisterInstitute();
            break;
        case 'reorder-sister-institutes':
            requireAuth();
            handleReorderSisterInstitutes();
            break;
            
        // Navigation and Footer endpoints
        case 'get-navigation':
            handleGetNavigation();
            break;
        case 'save-navigation':
            requireAuth();
            handleSaveNavigation();
            break;
        case 'get-footer':
            handleGetFooter();
            break;
        case 'save-footer':
            requireAuth();
            handleSaveFooter();
            break;
            
        default:
            throw new Exception('Invalid endpoint', 404);
    }
} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    echo json_encode(['error' => $e->getMessage()]);
}

// Authentication handlers
function handleLogin() {
    // Debug logging
    error_log('Login attempt - Method: ' . $_SERVER['REQUEST_METHOD']);
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed', 405);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    error_log('Login input: ' . print_r($input, true));
    
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';
    
    error_log('Username: ' . $username . ', Password length: ' . strlen($password));
    
    if (authenticate($username, $password)) {
        $_SESSION['admin_authenticated'] = true;
        $_SESSION['admin_username'] = $username;
        $_SESSION['login_time'] = time();
        
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'username' => $username,
            'csrf_token' => generateCSRFToken()
        ]);
    } else {
        throw new Exception('Invalid credentials', 401);
    }
}

function handleLogout() {
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
}

// Content management handlers
function handleGetContent() {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        throw new Exception('Method not allowed', 405);
    }
    
    $page = $_GET['page'] ?? '';
    if (!$page) {
        throw new Exception('Page parameter required', 400);
    }
    
    global $config;
    $filePath = $config['data_path'] . $page . '.json';
    
    if (!file_exists($filePath)) {
        // Return default empty content structure
        $defaultContent = ['sections' => [], 'meta' => ['title' => '', 'description' => '']];
        echo json_encode(['success' => true, 'content' => $defaultContent]);
        return;
    }
    
    $content = file_get_contents($filePath);
    $data = json_decode($content, true);
    
    echo json_encode(['success' => true, 'content' => $data]);
}

function handleSaveContent() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed', 405);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $page = $input['page'] ?? '';
    $content = $input['content'] ?? null;
    
    if (!$page) {
        throw new Exception('Page parameter required', 400);
    }
    
    if ($content === null || !isset($input['content'])) {
        throw new Exception('Content parameter required', 400);
    }
    
    global $config;
    $filePath = $config['data_path'] . $page . '.json';
    
    // Create backup before saving
    if (file_exists($filePath)) {
        $backupPath = $config['backups_path'] . $page . '_' . date('Y-m-d_H-i-s') . '.json';
        copy($filePath, $backupPath);
    }
    
    $jsonContent = json_encode($content, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
    if (file_put_contents($filePath, $jsonContent) !== false) {
        echo json_encode([
            'success' => true,
            'message' => 'Content saved successfully',
            'timestamp' => time()
        ]);
    } else {
        throw new Exception('Failed to save content', 500);
    }
}

function handleGetPages() {
    global $config;
    $pages = [];
    
    foreach ($config['pages'] as $page) {
        $filePath = $config['data_path'] . $page . '.json';
        $pages[] = [
            'name' => $page,
            'exists' => file_exists($filePath),
            'size' => file_exists($filePath) ? filesize($filePath) : 0,
            'modified' => file_exists($filePath) ? filemtime($filePath) : null
        ];
    }
    
    echo json_encode(['success' => true, 'pages' => $pages]);
}

// File management handlers
function handleFileUpload() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed', 405);
    }
    
    if (!isset($_FILES['file'])) {
        throw new Exception('No file uploaded', 400);
    }
    
    $file = $_FILES['file'];
    $filename = sanitizeFilename($file['name']);
    
    if (!isAllowedFileType($filename)) {
        throw new Exception('File type not allowed', 400);
    }
    
    global $config;
    if ($file['size'] > $config['max_file_size']) {
        throw new Exception('File too large', 400);
    }
    
    $targetPath = $_GET['path'] ?? '/';
    $targetDir = $config['uploads_path'] . trim($targetPath, '/');
    
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0755, true);
    }
    
    $targetFile = $targetDir . '/' . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $targetFile)) {
        echo json_encode([
            'success' => true,
            'message' => 'File uploaded successfully',
            'filename' => $filename,
            'size' => $file['size'],
            'path' => $targetPath . $filename
        ]);
    } else {
        throw new Exception('Failed to upload file', 500);
    }
}

function handleFileDelete() {
    if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
        throw new Exception('Method not allowed', 405);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $filename = $input['filename'] ?? '';
    $path = $input['path'] ?? '/';
    
    if (!$filename) {
        throw new Exception('Filename required', 400);
    }
    
    global $config;
    $filePath = $config['uploads_path'] . trim($path, '/') . '/' . sanitizeFilename($filename);
    
    if (!file_exists($filePath)) {
        throw new Exception('File not found', 404);
    }
    
    if (unlink($filePath)) {
        echo json_encode(['success' => true, 'message' => 'File deleted successfully']);
    } else {
        throw new Exception('Failed to delete file', 500);
    }
}

function handleListFiles() {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        throw new Exception('Method not allowed', 405);
    }
    
    $path = $_GET['path'] ?? '/';
    global $config;
    $targetDir = $config['uploads_path'] . trim($path, '/');
    
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0755, true);
    }
    
    $files = [];
    $items = scandir($targetDir);
    
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') continue;
        
        $itemPath = $targetDir . '/' . $item;
        $isDir = is_dir($itemPath);
        
        $files[] = [
            'name' => $item,
            'type' => $isDir ? 'folder' : 'file',
            'size' => $isDir ? 0 : filesize($itemPath),
            'modified' => filemtime($itemPath),
            'path' => $path . $item . ($isDir ? '/' : '')
        ];
    }
    
    echo json_encode(['success' => true, 'files' => $files]);
}

function handleCreateFolder() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed', 405);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $folderName = sanitizeFilename($input['name'] ?? '');
    $path = $input['path'] ?? '/';
    
    if (!$folderName) {
        throw new Exception('Folder name required', 400);
    }
    
    global $config;
    $targetPath = $config['uploads_path'] . trim($path, '/') . '/' . $folderName;
    
    if (file_exists($targetPath)) {
        throw new Exception('Folder already exists', 400);
    }
    
    if (mkdir($targetPath, 0755, true)) {
        echo json_encode(['success' => true, 'message' => 'Folder created successfully']);
    } else {
        throw new Exception('Failed to create folder', 500);
    }
}

// Media management handlers
function handleGetMedia() {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        throw new Exception('Method not allowed', 405);
    }
    
    global $config;
    $mediaDir = $config['uploads_path'];
    $mediaFiles = [];
    
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($mediaDir));
    
    foreach ($iterator as $file) {
        if ($file->isFile()) {
            $ext = strtolower($file->getExtension());
            if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm'])) {
                $relativePath = str_replace($mediaDir, '', $file->getPathname());
                $mediaFiles[] = [
                    'name' => $file->getFilename(),
                    'path' => $relativePath,
                    'size' => $file->getSize(),
                    'modified' => $file->getMTime(),
                    'type' => in_array($ext, ['jpg', 'jpeg', 'png', 'gif']) ? 'image' : 'video'
                ];
            }
        }
    }
    
    echo json_encode(['success' => true, 'media' => $mediaFiles]);
}

// Page editing handlers
function handleGetPageContent() {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        throw new Exception('Method not allowed', 405);
    }
    
    $page = $_GET['page'] ?? '';
    if (!$page) {
        throw new Exception('Page parameter required', 400);
    }
    
    global $config;
    $filePath = __DIR__ . '/' . $page . '.html';
    
    if (!file_exists($filePath)) {
        throw new Exception('Page not found', 404);
    }
    
    $content = file_get_contents($filePath);
    echo json_encode(['success' => true, 'content' => $content]);
}

function handleSavePageContent() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed', 405);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $page = $input['page'] ?? '';
    $content = $input['content'] ?? '';
    
    if (!$page || !$content) {
        throw new Exception('Page and content required', 400);
    }
    
    $filePath = __DIR__ . '/' . $page . '.html';
    
    // Create backup before saving
    if (file_exists($filePath)) {
        global $config;
        $backupPath = $config['backups_path'] . $page . '_' . date('Y-m-d_H-i-s') . '.html';
        copy($filePath, $backupPath);
    }
    
    if (file_put_contents($filePath, $content) !== false) {
        echo json_encode(['success' => true, 'message' => 'Page saved successfully']);
    } else {
        throw new Exception('Failed to save page', 500);
    }
}

// Backup and restore handlers
function handleCreateBackup() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed', 405);
    }
    
    global $config;
    $backupName = 'backup_' . date('Y-m-d_H-i-s') . '.zip';
    $backupPath = $config['backups_path'] . $backupName;
    
    $zip = new ZipArchive();
    if ($zip->open($backupPath, ZipArchive::CREATE) !== TRUE) {
        throw new Exception('Cannot create backup file', 500);
    }
    
    // Add data files
    $dataFiles = glob($config['data_path'] . '*.json');
    foreach ($dataFiles as $file) {
        $zip->addFile($file, 'data/' . basename($file));
    }
    
    // Add HTML files
    $htmlFiles = glob(__DIR__ . '/*.html');
    foreach ($htmlFiles as $file) {
        $zip->addFile($file, basename($file));
    }
    
    // Add uploads
    $uploadFiles = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($config['uploads_path'])
    );
    
    foreach ($uploadFiles as $file) {
        if ($file->isFile()) {
            $relativePath = str_replace($config['uploads_path'], '', $file->getPathname());
            $zip->addFile($file->getPathname(), 'uploads/' . $relativePath);
        }
    }
    
    $zip->close();
    
    echo json_encode([
        'success' => true,
        'message' => 'Backup created successfully',
        'filename' => $backupName,
        'size' => filesize($backupPath)
    ]);
}

function handleListBackups() {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        throw new Exception('Method not allowed', 405);
    }
    
    global $config;
    $backups = [];
    $backupFiles = glob($config['backups_path'] . '*.zip');
    
    foreach ($backupFiles as $file) {
        $backups[] = [
            'name' => basename($file),
            'size' => filesize($file),
            'created' => filemtime($file),
            'path' => $file
        ];
    }
    
    // Sort by creation time (newest first)
    usort($backups, function($a, $b) {
        return $b['created'] - $a['created'];
    });
    
    echo json_encode(['success' => true, 'backups' => $backups]);
}

// Statistics handlers
function handleStats() {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        throw new Exception('Method not allowed', 405);
    }
    
    global $config;
    
    // Count files
    $totalFiles = 0;
    if (is_dir($config['uploads_path'])) {
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($config['uploads_path'])
        );
        foreach ($iterator as $file) {
            if ($file->isFile()) $totalFiles++;
        }
    }
    
    // Count media files
    $mediaCount = 0;
    if (is_dir($config['uploads_path'])) {
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($config['uploads_path'])
        );
        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $ext = strtolower($file->getExtension());
                if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm'])) {
                    $mediaCount++;
                }
            }
        }
    }
    
    // Count pages
    $totalPages = count($config['pages']);
    
    // Get last modified time
    $lastModified = 0;
    $dataFiles = glob($config['data_path'] . '*.json');
    foreach ($dataFiles as $file) {
        $lastModified = max($lastModified, filemtime($file));
    }
    
    echo json_encode([
        'success' => true,
        'stats' => [
            'totalFiles' => $totalFiles,
            'mediaCount' => $mediaCount,
            'totalPages' => $totalPages,
            'lastUpdated' => $lastModified ? date('Y-m-d H:i:s', $lastModified) : 'Never'
        ]
    ]);
}

function handleSystemInfo() {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        throw new Exception('Method not allowed', 405);
    }
    
    global $config;
    
    // Calculate storage usage
    $storageUsed = 0;
    $dirs = [$config['data_path'], $config['uploads_path'], $config['backups_path']];
    
    foreach ($dirs as $dir) {
        if (is_dir($dir)) {
            $iterator = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($dir)
            );
            foreach ($iterator as $file) {
                if ($file->isFile()) {
                    $storageUsed += $file->getSize();
                }
            }
        }
    }
    
    echo json_encode([
        'success' => true,
        'systemInfo' => [
            'phpVersion' => phpversion(),
            'serverSoftware' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
            'storageUsed' => round($storageUsed / 1024 / 1024, 2), // MB
            'lastLogin' => $_SESSION['login_time'] ?? null,
            'sessionId' => session_id(),
            'timezone' => date_default_timezone_get()
        ]
    ]);
}

// Security handlers
function handleChangePassword() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed', 405);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $newPassword = $input['new_password'] ?? '';
    $confirmPassword = $input['confirm_password'] ?? '';
    
    if (!$newPassword || !$confirmPassword) {
        throw new Exception('New password and confirmation required', 400);
    }
    
    if ($newPassword !== $confirmPassword) {
        throw new Exception('Passwords do not match', 400);
    }
    
    if (strlen($newPassword) < 8) {
        throw new Exception('Password must be at least 8 characters', 400);
    }
    
    // In a real implementation, you would update this in a config file or database
    // For now, we'll just return success (password change would need manual implementation)
    
    echo json_encode([
        'success' => true,
        'message' => 'Password updated successfully. Please update the configuration file manually.'
    ]);
}

function handleGetCSRFToken() {
    echo json_encode([
        'success' => true,
        'csrf_token' => generateCSRFToken()
    ]);
}

// Sister Institutes handlers
function handleGetSisterInstitutes() {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        throw new Exception('Method not allowed', 405);
    }
    
    global $config;
    $filePath = $config['data_path'] . 'sister-institutes.json';
    
    if (!file_exists($filePath)) {
        // Return default sister institutes data
        $defaultData = [
            'institutes' => [
                [
                    'id' => 1,
                    'name' => 'Sri Sathya Sai Institute, Alike',
                    'location' => 'Alike, Karnataka',
                    'description' => 'A premier educational institution following the ideals of Bhagawan Sri Sathya Sai Baba.',
                    'image' => 'https://github.com/Satyamurthi/mbw-Photos/blob/main/Sister%20Institutes/Alike.jpg?raw=true',
                    'website' => '#',
                    'established' => '1985',
                    'type' => 'Higher Secondary School',
                    'display_order' => 1,
                    'is_active' => true
                ],
                [
                    'id' => 2,
                    'name' => 'Sri Sathya Sai Institute, Dharwad',
                    'location' => 'Dharwad, Karnataka',
                    'description' => 'Dedicated to providing quality education based on human values.',
                    'image' => 'https://github.com/Satyamurthi/mbw-Photos/blob/main/Sister%20Institutes/Dharwad%202.jpg?raw=true',
                    'website' => '#',
                    'established' => '1990',
                    'type' => 'Higher Secondary School',
                    'display_order' => 2,
                    'is_active' => true
                ],
                [
                    'id' => 3,
                    'name' => 'Sri Sathya Sai School, Mysuru',
                    'location' => 'Mysuru, Karnataka',
                    'description' => 'Our main campus providing comprehensive education from primary to higher secondary.',
                    'image' => 'https://github.com/Satyamurthi/mbw-Photos/blob/main/College%20Photos/College.jpg?raw=true',
                    'website' => '#',
                    'established' => '1957',
                    'type' => 'School & PU College',
                    'display_order' => 3,
                    'is_active' => true
                ]
            ],
            'last_updated' => time()
        ];
        
        // Save default data
        file_put_contents($filePath, json_encode($defaultData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo json_encode(['success' => true, 'data' => $defaultData]);
        return;
    }
    
    $content = file_get_contents($filePath);
    $data = json_decode($content, true);
    
    // Filter only active institutes for public endpoint
    if (!isAuthenticated()) {
        $data['institutes'] = array_filter($data['institutes'], function($institute) {
            return $institute['is_active'] ?? true;
        });
    }
    
    // Sort by display order
    usort($data['institutes'], function($a, $b) {
        return ($a['display_order'] ?? 999) - ($b['display_order'] ?? 999);
    });
    
    echo json_encode(['success' => true, 'data' => $data]);
}

function handleAddSisterInstitute() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed', 405);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['name']) || !isset($input['location'])) {
        throw new Exception('Name and location are required', 400);
    }
    
    global $config;
    $filePath = $config['data_path'] . 'sister-institutes.json';
    
    // Load existing data or create new
    $data = [];
    if (file_exists($filePath)) {
        $content = file_get_contents($filePath);
        $data = json_decode($content, true) ?: [];
    }
    
    if (!isset($data['institutes'])) {
        $data['institutes'] = [];
    }
    
    // Generate new ID
    $maxId = 0;
    foreach ($data['institutes'] as $institute) {
        if (isset($institute['id']) && $institute['id'] > $maxId) {
            $maxId = $institute['id'];
        }
    }
    $newId = $maxId + 1;
    
    // Create new institute
    $newInstitute = [
        'id' => $newId,
        'name' => trim($input['name']),
        'location' => trim($input['location']),
        'description' => trim($input['description'] ?? ''),
        'image' => trim($input['image'] ?? ''),
        'website' => trim($input['website'] ?? '#'),
        'established' => trim($input['established'] ?? ''),
        'type' => trim($input['type'] ?? ''),
        'display_order' => $input['display_order'] ?? (count($data['institutes']) + 1),
        'is_active' => $input['is_active'] ?? true,
        'created_at' => time(),
        'updated_at' => time()
    ];
    
    $data['institutes'][] = $newInstitute;
    $data['last_updated'] = time();
    
    // Save data
    if (file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) !== false) {
        echo json_encode([
            'success' => true,
            'message' => 'Sister institute added successfully',
            'data' => $newInstitute
        ]);
    } else {
        throw new Exception('Failed to save sister institute', 500);
    }
}

function handleUpdateSisterInstitute() {
    if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
        throw new Exception('Method not allowed', 405);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['id'])) {
        throw new Exception('Institute ID is required', 400);
    }
    
    global $config;
    $filePath = $config['data_path'] . 'sister-institutes.json';
    
    if (!file_exists($filePath)) {
        throw new Exception('Sister institutes data not found', 404);
    }
    
    $content = file_get_contents($filePath);
    $data = json_decode($content, true);
    
    if (!isset($data['institutes'])) {
        throw new Exception('Invalid data structure', 500);
    }
    
    // Find and update institute
    $found = false;
    for ($i = 0; $i < count($data['institutes']); $i++) {
        if ($data['institutes'][$i]['id'] == $input['id']) {
            // Update fields
            $data['institutes'][$i]['name'] = trim($input['name'] ?? $data['institutes'][$i]['name']);
            $data['institutes'][$i]['location'] = trim($input['location'] ?? $data['institutes'][$i]['location']);
            $data['institutes'][$i]['description'] = trim($input['description'] ?? $data['institutes'][$i]['description']);
            $data['institutes'][$i]['image'] = trim($input['image'] ?? $data['institutes'][$i]['image']);
            $data['institutes'][$i]['website'] = trim($input['website'] ?? $data['institutes'][$i]['website']);
            $data['institutes'][$i]['established'] = trim($input['established'] ?? $data['institutes'][$i]['established']);
            $data['institutes'][$i]['type'] = trim($input['type'] ?? $data['institutes'][$i]['type']);
            $data['institutes'][$i]['display_order'] = $input['display_order'] ?? $data['institutes'][$i]['display_order'];
            $data['institutes'][$i]['is_active'] = $input['is_active'] ?? $data['institutes'][$i]['is_active'];
            $data['institutes'][$i]['updated_at'] = time();
            
            $found = true;
            break;
        }
    }
    
    if (!$found) {
        throw new Exception('Sister institute not found', 404);
    }
    
    $data['last_updated'] = time();
    
    // Save data
    if (file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) !== false) {
        echo json_encode([
            'success' => true,
            'message' => 'Sister institute updated successfully',
            'data' => $data['institutes'][$i]
        ]);
    } else {
        throw new Exception('Failed to update sister institute', 500);
    }
}

function handleDeleteSisterInstitute() {
    if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
        throw new Exception('Method not allowed', 405);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['id'])) {
        throw new Exception('Institute ID is required', 400);
    }
    
    global $config;
    $filePath = $config['data_path'] . 'sister-institutes.json';
    
    if (!file_exists($filePath)) {
        throw new Exception('Sister institutes data not found', 404);
    }
    
    $content = file_get_contents($filePath);
    $data = json_decode($content, true);
    
    if (!isset($data['institutes'])) {
        throw new Exception('Invalid data structure', 500);
    }
    
    // Find and remove institute
    $originalCount = count($data['institutes']);
    $data['institutes'] = array_filter($data['institutes'], function($institute) use ($input) {
        return $institute['id'] != $input['id'];
    });
    
    // Re-index array
    $data['institutes'] = array_values($data['institutes']);
    
    if (count($data['institutes']) === $originalCount) {
        throw new Exception('Sister institute not found', 404);
    }
    
    $data['last_updated'] = time();
    
    // Save data
    if (file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) !== false) {
        echo json_encode([
            'success' => true,
            'message' => 'Sister institute deleted successfully'
        ]);
    } else {
        throw new Exception('Failed to delete sister institute', 500);
    }
}

function handleReorderSisterInstitutes() {
    if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
        throw new Exception('Method not allowed', 405);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['order'])) {
        throw new Exception('Order array is required', 400);
    }
    
    global $config;
    $filePath = $config['data_path'] . 'sister-institutes.json';
    
    if (!file_exists($filePath)) {
        throw new Exception('Sister institutes data not found', 404);
    }
    
    $content = file_get_contents($filePath);
    $data = json_decode($content, true);
    
    if (!isset($data['institutes'])) {
        throw new Exception('Invalid data structure', 500);
    }
    
    // Update display order for each institute
    foreach ($data['institutes'] as &$institute) {
        $newOrder = array_search($institute['id'], $input['order']);
        if ($newOrder !== false) {
            $institute['display_order'] = $newOrder + 1;
            $institute['updated_at'] = time();
        }
    }
    
    $data['last_updated'] = time();
    
    // Save data
    if (file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) !== false) {
        echo json_encode([
            'success' => true,
            'message' => 'Sister institutes reordered successfully'
        ]);
    } else {
        throw new Exception('Failed to reorder sister institutes', 500);
    }
}

// Navigation and Footer handlers
function handleGetNavigation() {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        throw new Exception('Method not allowed', 405);
    }
    
    global $config;
    $filePath = $config['data_path'] . 'navigation.json';
    
    if (!file_exists($filePath)) {
        // Return default navigation data
        $defaultData = [
            'branding' => [
                'logo_left' => 'assets/logo/sai-baba-logo.png',
                'logo_right' => 'assets/logo/school-logo.png',
                'college_name' => 'Sri Sathya Sai Baba PU College',
                'location' => 'Mysuru, Karnataka'
            ],
            'menu_items' => [
                ['name' => 'Home', 'url' => 'index.html', 'type' => 'link'],
                ['name' => 'Academics', 'url' => 'academics.html', 'type' => 'link'],
                ['name' => 'Gallery', 'url' => 'gallery.html', 'type' => 'link'],
                ['name' => 'Campus Life', 'url' => 'campus-life.html', 'type' => 'link'],
                ['name' => 'About', 'url' => 'about.html', 'type' => 'link']
            ],
            'cta_button' => [
                'text' => 'FOR ADMISSIONS',
                'url' => 'admissions.html'
            ],
            'last_updated' => time()
        ];
        
        // Save default data
        file_put_contents($filePath, json_encode($defaultData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo json_encode(['success' => true, 'data' => $defaultData]);
        return;
    }
    
    $content = file_get_contents($filePath);
    $data = json_decode($content, true);
    
    echo json_encode(['success' => true, 'data' => $data]);
}

function handleSaveNavigation() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed', 405);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Navigation data is required', 400);
    }
    
    global $config;
    $filePath = $config['data_path'] . 'navigation.json';
    
    // Add timestamp
    $input['last_updated'] = time();
    
    // Create backup if file exists
    if (file_exists($filePath)) {
        $backupPath = $config['backups_path'] . 'navigation_' . date('Y-m-d_H-i-s') . '.json';
        copy($filePath, $backupPath);
    }
    
    // Save navigation data
    if (file_put_contents($filePath, json_encode($input, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) !== false) {
        echo json_encode([
            'success' => true,
            'message' => 'Navigation saved successfully'
        ]);
    } else {
        throw new Exception('Failed to save navigation', 500);
    }
}

function handleGetFooter() {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        throw new Exception('Method not allowed', 405);
    }
    
    global $config;
    $filePath = $config['data_path'] . 'footer.json';
    
    if (!file_exists($filePath)) {
        // Return default footer data
        $defaultData = [
            'branding' => [
                'logo' => 'assets/logo/sai-baba-logo.png',
                'description' => 'Shaping tomorrow\'s leaders through excellence in education, research, and innovation.'
            ],
            'social_links' => [
                ['name' => 'Facebook', 'url' => 'https://www.facebook.com/people/Sathya-Sai-Baba-Puc/pfbid02EXmmdXSUpaZJE3uH5zdoHTGTsfFPjy5RK5Z6dUJ55skrdtPwmWgYpTbHbh7RwcfZl', 'icon' => 'ri-facebook-fill'],
                ['name' => 'Twitter', 'url' => '#', 'icon' => 'ri-twitter-fill'],
                ['name' => 'Instagram', 'url' => '#', 'icon' => 'ri-instagram-fill'],
                ['name' => 'LinkedIn', 'url' => '#', 'icon' => 'ri-linkedin-fill']
            ],
            'quick_links' => [
                ['name' => 'About Us', 'url' => 'about.html'],
                ['name' => 'Academics', 'url' => 'academics.html'],
                ['name' => 'Gallery', 'url' => 'gallery.html'],
                ['name' => 'Campus Life', 'url' => 'campus-life.html'],
                ['name' => 'Admissions', 'url' => 'admissions.html']
            ],
            'contact_info' => [
                ['type' => 'address', 'icon' => 'ri-map-pin-line', 'text' => 'Sri Sathya Sai Baba PU College, 46, 4th Main Rd, 3rd Block, Jayalakshmipuram, Mysuru, Karnataka 570012'],
                ['type' => 'phone', 'icon' => 'ri-phone-line', 'text' => '0821 2410856'],
                ['type' => 'email', 'icon' => 'ri-mail-line', 'text' => 'sssbpucnn0385@gmail.com']
            ],
            'copyright' => '© 2025 SSSBPUC. All rights reserved.',
            'last_updated' => time()
        ];
        
        // Save default data
        file_put_contents($filePath, json_encode($defaultData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo json_encode(['success' => true, 'data' => $defaultData]);
        return;
    }
    
    $content = file_get_contents($filePath);
    $data = json_decode($content, true);
    
    echo json_encode(['success' => true, 'data' => $data]);
}

function handleSaveFooter() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed', 405);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Footer data is required', 400);
    }
    
    global $config;
    $filePath = $config['data_path'] . 'footer.json';
    
    // Add timestamp
    $input['last_updated'] = time();
    
    // Create backup if file exists
    if (file_exists($filePath)) {
        $backupPath = $config['backups_path'] . 'footer_' . date('Y-m-d_H-i-s') . '.json';
        copy($filePath, $backupPath);
    }
    
    // Save footer data
    if (file_put_contents($filePath, json_encode($input, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) !== false) {
        echo json_encode([
            'success' => true,
            'message' => 'Footer saved successfully'
        ]);
    } else {
        throw new Exception('Failed to save footer', 500);
    }
}

// Error handler for uncaught exceptions
set_exception_handler(function($exception) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal server error: ' . $exception->getMessage()
    ]);
});
?>
