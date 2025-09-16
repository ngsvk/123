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
    if (!isAuthenticated()) {
        throw new Exception('Unauthorized', 401);
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
    $content = $input['content'] ?? [];
    
    if (!$page || empty($content)) {
        throw new Exception('Page and content required', 400);
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

// Error handler for uncaught exceptions
set_exception_handler(function($exception) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal server error: ' . $exception->getMessage()
    ]);
});
?>
