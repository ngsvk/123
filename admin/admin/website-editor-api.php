<?php
/**
 * Enhanced Website Editor API
 * Comprehensive API for editing all website content, pages, and dynamic elements
 * 
 * @version 2.0.0
 * @author Admin Dashboard System
 */

header('Content-Type: application/json');
// CORS and credentials for same-origin admin UI
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$host = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'];
if ($origin && strpos($origin, $host) === 0) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
} else {
    // For same-origin navigations, this header is not necessary
    header('Access-Control-Allow-Origin: ' . $host);
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Session validation
session_start();
$loggedIn = (
    (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) ||
    (isset($_SESSION['admin_authenticated']) && $_SESSION['admin_authenticated'] === true)
);
if (!$loggedIn) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized access']);
    exit();
}

// Configuration
define('WEBSITE_ROOT', dirname(__DIR__));
define('DATA_DIR', WEBSITE_ROOT . '/data');
define('PAGES_DIR', WEBSITE_ROOT);
define('BACKUP_DIR', WEBSITE_ROOT . '/admin/backups');

// Ensure backup directory exists
if (!file_exists(BACKUP_DIR)) {
    mkdir(BACKUP_DIR, 0755, true);
}

// Main API router
$method = $_SERVER['REQUEST_METHOD'];
$path = $_GET['action'] ?? '';

try {
    switch ($path) {
        // Content Management
        case 'get-page-content':
            echo json_encode(getPageContent($_GET['page'] ?? ''));
            break;
        case 'save-page-content':
            echo json_encode(savePageContent());
            break;
        case 'get-json-content':
            echo json_encode(getJsonContent($_GET['file'] ?? ''));
            break;
        case 'save-json-content':
            echo json_encode(saveJsonContent());
            break;
            
        // Dynamic Buttons Management  
        case 'get-buttons':
            echo json_encode(getDynamicButtons($_GET['page'] ?? 'homepage'));
            break;
        case 'save-buttons':
            echo json_encode(saveDynamicButtons());
            break;
        case 'add-button':
            echo json_encode(addDynamicButton());
            break;
        case 'delete-button':
            echo json_encode(deleteDynamicButton());
            break;
        case 'reorder-buttons':
            echo json_encode(reorderButtons());
            break;
            
        // Section Management
        case 'get-sections':
            echo json_encode(getPageSections($_GET['page'] ?? ''));
            break;
        case 'save-section':
            echo json_encode(savePageSection());
            break;
        case 'get-section':
            echo json_encode(getSection($_GET['page'] ?? '', $_GET['section'] ?? ''));
            break;
            
        // Media Management
        case 'get-media-list':
            echo json_encode(getMediaList());
            break;
        case 'upload-media':
            echo json_encode(uploadMedia());
            break;
        case 'delete-media':
            echo json_encode(deleteMedia());
            break;
            
        // System Operations
        case 'backup-website':
            echo json_encode(createWebsiteBackup());
            break;
        case 'get-page-list':
            echo json_encode(getAvailablePages());
            break;
        case 'preview-changes':
            echo json_encode(previewChanges());
            break;
        case 'publish-changes':
            echo json_encode(publishChanges());
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

// ============= CONTENT MANAGEMENT FUNCTIONS =============

function getPageContent($page) {
    if (empty($page)) {
        return ['error' => 'Page parameter required'];
    }
    
    $pageFile = PAGES_DIR . '/' . $page . '.html';
    if (!file_exists($pageFile)) {
        return ['error' => 'Page file not found'];
    }
    
    $content = file_get_contents($pageFile);
    return [
        'success' => true,
        'page' => $page,
        'content' => $content,
        'last_modified' => filemtime($pageFile)
    ];
}

function savePageContent() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['page']) || !isset($input['content'])) {
        return ['error' => 'Page and content required'];
    }
    
    $page = $input['page'];
    $content = $input['content'];
    $pageFile = PAGES_DIR . '/' . $page . '.html';
    
    // Create backup before saving
    createFileBackup($pageFile);
    
    if (file_put_contents($pageFile, $content) !== false) {
        return [
            'success' => true,
            'message' => 'Page saved successfully',
            'timestamp' => time()
        ];
    } else {
        return ['error' => 'Failed to save page'];
    }
}

function getJsonContent($file) {
    if (empty($file)) {
        return ['error' => 'File parameter required'];
    }
    
    $jsonFile = DATA_DIR . '/' . $file . '.json';
    if (!file_exists($jsonFile)) {
        return ['error' => 'JSON file not found'];
    }
    
    $content = file_get_contents($jsonFile);
    $jsonData = json_decode($content, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        return ['error' => 'Invalid JSON format'];
    }
    
    return [
        'success' => true,
        'file' => $file,
        'content' => $jsonData,
        'raw_content' => $content,
        'last_modified' => filemtime($jsonFile)
    ];
}

function saveJsonContent() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['file']) || !isset($input['content'])) {
        return ['error' => 'File and content required'];
    }
    
    $file = $input['file'];
    $content = $input['content'];
    $jsonFile = DATA_DIR . '/' . $file . '.json';
    
    // Validate JSON
    $jsonContent = is_string($content) ? $content : json_encode($content, JSON_PRETTY_PRINT);
    json_decode($jsonContent);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        return ['error' => 'Invalid JSON format: ' . json_last_error_msg()];
    }
    
    // Create backup before saving
    createFileBackup($jsonFile);
    
    if (file_put_contents($jsonFile, $jsonContent) !== false) {
        return [
            'success' => true,
            'message' => 'JSON content saved successfully',
            'timestamp' => time()
        ];
    } else {
        return ['error' => 'Failed to save JSON content'];
    }
}

// ============= DYNAMIC BUTTONS MANAGEMENT =============

function getDynamicButtons($page = 'homepage') {
    $jsonFile = DATA_DIR . '/' . $page . '.json';
    if (!file_exists($jsonFile)) {
        return ['error' => 'Page data not found'];
    }
    
    $content = json_decode(file_get_contents($jsonFile), true);
    $buttons = $content['hero']['buttons'] ?? [];
    
    return [
        'success' => true,
        'page' => $page,
        'buttons' => $buttons,
        'count' => count($buttons)
    ];
}

function saveDynamicButtons() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['page']) || !isset($input['buttons'])) {
        return ['error' => 'Page and buttons data required'];
    }
    
    $page = $input['page'];
    $buttons = $input['buttons'];
    $jsonFile = DATA_DIR . '/' . $page . '.json';
    
    if (!file_exists($jsonFile)) {
        return ['error' => 'Page data file not found'];
    }
    
    // Load existing content
    $content = json_decode(file_get_contents($jsonFile), true);
    
    // Create backup
    createFileBackup($jsonFile);
    
    // Update buttons
    if (!isset($content['hero'])) {
        $content['hero'] = [];
    }
    $content['hero']['buttons'] = $buttons;
    
    // Also update individual button entries for backward compatibility
    for ($i = 0; $i < 4; $i++) {
        $key = "buttons[$i]";
        if (isset($buttons[$i])) {
            $content['hero'][$key] = $buttons[$i];
        } else {
            $content['hero'][$key] = [
                'text' => '',
                'link' => '',
                'style' => '',
                'icon' => '',
                'action' => ''
            ];
        }
    }
    
    if (file_put_contents($jsonFile, json_encode($content, JSON_PRETTY_PRINT)) !== false) {
        return [
            'success' => true,
            'message' => 'Buttons updated successfully',
            'buttons' => $buttons
        ];
    } else {
        return ['error' => 'Failed to save buttons'];
    }
}

function addDynamicButton() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['page']) || !isset($input['button'])) {
        return ['error' => 'Page and button data required'];
    }
    
    $page = $input['page'];
    $newButton = $input['button'];
    $jsonFile = DATA_DIR . '/' . $page . '.json';
    
    // Load existing buttons
    $result = getDynamicButtons($page);
    if (!$result['success']) {
        return $result;
    }
    
    $buttons = $result['buttons'];
    $buttons[] = $newButton;
    
    // Save updated buttons
    return saveDynamicButtons_internal($page, $buttons);
}

function deleteDynamicButton() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['page']) || !isset($input['index'])) {
        return ['error' => 'Page and button index required'];
    }
    
    $page = $input['page'];
    $index = (int)$input['index'];
    
    // Load existing buttons
    $result = getDynamicButtons($page);
    if (!$result['success']) {
        return $result;
    }
    
    $buttons = $result['buttons'];
    
    if (!isset($buttons[$index])) {
        return ['error' => 'Button index not found'];
    }
    
    // Remove button
    array_splice($buttons, $index, 1);
    
    // Save updated buttons
    return saveDynamicButtons_internal($page, $buttons);
}

function reorderButtons() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['page']) || !isset($input['order'])) {
        return ['error' => 'Page and order array required'];
    }
    
    $page = $input['page'];
    $order = $input['order'];
    
    // Load existing buttons
    $result = getDynamicButtons($page);
    if (!$result['success']) {
        return $result;
    }
    
    $buttons = $result['buttons'];
    $reorderedButtons = [];
    
    foreach ($order as $index) {
        if (isset($buttons[$index])) {
            $reorderedButtons[] = $buttons[$index];
        }
    }
    
    // Save reordered buttons
    return saveDynamicButtons_internal($page, $reorderedButtons);
}

function saveDynamicButtons_internal($page, $buttons) {
    return saveDynamicButtons_input(['page' => $page, 'buttons' => $buttons]);
}

function saveDynamicButtons_input($input) {
    $page = $input['page'];
    $buttons = $input['buttons'];
    $jsonFile = DATA_DIR . '/' . $page . '.json';
    
    if (!file_exists($jsonFile)) {
        return ['error' => 'Page data file not found'];
    }
    
    // Load existing content
    $content = json_decode(file_get_contents($jsonFile), true);
    
    // Create backup
    createFileBackup($jsonFile);
    
    // Update buttons
    if (!isset($content['hero'])) {
        $content['hero'] = [];
    }
    $content['hero']['buttons'] = $buttons;
    
    if (file_put_contents($jsonFile, json_encode($content, JSON_PRETTY_PRINT)) !== false) {
        return [
            'success' => true,
            'message' => 'Buttons updated successfully',
            'buttons' => $buttons
        ];
    } else {
        return ['error' => 'Failed to save buttons'];
    }
}

// ============= SECTION MANAGEMENT =============

function getPageSections($page) {
    if (empty($page)) {
        return ['error' => 'Page parameter required'];
    }
    
    $jsonFile = DATA_DIR . '/' . $page . '.json';
    if (!file_exists($jsonFile)) {
        return ['error' => 'Page data not found'];
    }
    
    $content = json_decode(file_get_contents($jsonFile), true);
    
    return [
        'success' => true,
        'page' => $page,
        'sections' => $content,
        'section_names' => array_keys($content)
    ];
}

function getSection($page, $section) {
    if (empty($page) || empty($section)) {
        return ['error' => 'Page and section parameters required'];
    }
    
    $jsonFile = DATA_DIR . '/' . $page . '.json';
    if (!file_exists($jsonFile)) {
        return ['error' => 'Page data not found'];
    }
    
    $content = json_decode(file_get_contents($jsonFile), true);
    
    if (!isset($content[$section])) {
        return ['error' => 'Section not found'];
    }
    
    return [
        'success' => true,
        'page' => $page,
        'section' => $section,
        'data' => $content[$section]
    ];
}

function savePageSection() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['page']) || !isset($input['section']) || !isset($input['data'])) {
        return ['error' => 'Page, section, and data required'];
    }
    
    $page = $input['page'];
    $section = $input['section'];
    $sectionData = $input['data'];
    $jsonFile = DATA_DIR . '/' . $page . '.json';
    
    if (!file_exists($jsonFile)) {
        return ['error' => 'Page data file not found'];
    }
    
    // Load existing content
    $content = json_decode(file_get_contents($jsonFile), true);
    
    // Create backup
    createFileBackup($jsonFile);
    
    // Update section
    $content[$section] = $sectionData;
    
    if (file_put_contents($jsonFile, json_encode($content, JSON_PRETTY_PRINT)) !== false) {
        return [
            'success' => true,
            'message' => 'Section updated successfully',
            'section' => $section
        ];
    } else {
        return ['error' => 'Failed to save section'];
    }
}

// ============= MEDIA MANAGEMENT =============

function getMediaList() {
    $mediaFolders = ['assets', 'assets/photos', 'assets/campus', 'assets/baba', 'assets/logo', 'assets/sister'];
    $mediaFiles = [];
    
    foreach ($mediaFolders as $folder) {
        $folderPath = WEBSITE_ROOT . '/' . $folder;
        if (is_dir($folderPath)) {
            $files = scandir($folderPath);
            foreach ($files as $file) {
                if ($file !== '.' && $file !== '..' && !is_dir($folderPath . '/' . $file)) {
                    $fileInfo = [
                        'name' => $file,
                        'path' => $folder . '/' . $file,
                        'full_path' => $folderPath . '/' . $file,
                        'size' => filesize($folderPath . '/' . $file),
                        'modified' => filemtime($folderPath . '/' . $file),
                        'type' => getFileType($file),
                        'folder' => $folder
                    ];
                    $mediaFiles[] = $fileInfo;
                }
            }
        }
    }
    
    return [
        'success' => true,
        'files' => $mediaFiles,
        'count' => count($mediaFiles),
        'folders' => $mediaFolders
    ];
}

function getFileType($filename) {
    $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    
    $imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    $videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv'];
    $docTypes = ['pdf', 'doc', 'docx', 'txt'];
    
    if (in_array($extension, $imageTypes)) return 'image';
    if (in_array($extension, $videoTypes)) return 'video';
    if (in_array($extension, $docTypes)) return 'document';
    
    return 'other';
}

function uploadMedia() {
    if (!isset($_FILES['files'])) {
        return ['error' => 'No files uploaded'];
    }
    
    $targetFolder = $_POST['folder'] ?? 'assets';
    $targetPath = WEBSITE_ROOT . '/' . $targetFolder;
    
    if (!is_dir($targetPath)) {
        mkdir($targetPath, 0755, true);
    }
    
    $uploadedFiles = [];
    $errors = [];
    
    $files = $_FILES['files'];
    $fileCount = count($files['name']);
    
    for ($i = 0; $i < $fileCount; $i++) {
        $fileName = $files['name'][$i];
        $tmpName = $files['tmp_name'][$i];
        $error = $files['error'][$i];
        
        if ($error === UPLOAD_ERR_OK) {
            $targetFile = $targetPath . '/' . $fileName;
            
            if (move_uploaded_file($tmpName, $targetFile)) {
                $uploadedFiles[] = [
                    'name' => $fileName,
                    'path' => $targetFolder . '/' . $fileName,
                    'size' => filesize($targetFile)
                ];
            } else {
                $errors[] = "Failed to upload {$fileName}";
            }
        } else {
            $errors[] = "Upload error for {$fileName}: " . $error;
        }
    }
    
    return [
        'success' => empty($errors),
        'uploaded_files' => $uploadedFiles,
        'errors' => $errors,
        'count' => count($uploadedFiles)
    ];
}

function deleteMedia() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['files'])) {
        return ['error' => 'Files array required'];
    }
    
    $deleted = [];
    $errors = [];
    
    foreach ($input['files'] as $filePath) {
        $fullPath = WEBSITE_ROOT . '/' . $filePath;
        
        if (file_exists($fullPath)) {
            if (unlink($fullPath)) {
                $deleted[] = $filePath;
            } else {
                $errors[] = "Failed to delete {$filePath}";
            }
        } else {
            $errors[] = "File not found: {$filePath}";
        }
    }
    
    return [
        'success' => empty($errors),
        'deleted_files' => $deleted,
        'errors' => $errors,
        'count' => count($deleted)
    ];
}

// ============= SYSTEM OPERATIONS =============

function getAvailablePages() {
    $pages = [];
    $htmlFiles = glob(PAGES_DIR . '/*.html');
    
    foreach ($htmlFiles as $file) {
        $basename = basename($file, '.html');
        
        // Skip admin and test files
        if (strpos($basename, 'admin') === false && strpos($basename, 'test') === false) {
            $pages[] = [
                'id' => $basename,
                'name' => ucfirst(str_replace('-', ' ', $basename)),
                'file' => $file,
                'size' => filesize($file),
                'modified' => filemtime($file),
                'has_data' => file_exists(DATA_DIR . '/' . $basename . '.json')
            ];
        }
    }
    
    return [
        'success' => true,
        'pages' => $pages,
        'count' => count($pages)
    ];
}

function createWebsiteBackup() {
    $timestamp = date('Y-m-d_H-i-s');
    $backupName = "website_backup_{$timestamp}";
    $backupFile = BACKUP_DIR . '/' . $backupName . '.zip';
    
    $zip = new ZipArchive();
    if ($zip->open($backupFile, ZipArchive::CREATE) !== TRUE) {
        return ['error' => 'Could not create backup file'];
    }
    
    // Add data files
    $dataFiles = glob(DATA_DIR . '/*.json');
    foreach ($dataFiles as $file) {
        $zip->addFile($file, 'data/' . basename($file));
    }
    
    // Add HTML pages
    $htmlFiles = glob(PAGES_DIR . '/*.html');
    foreach ($htmlFiles as $file) {
        $basename = basename($file);
        if (strpos($basename, 'admin') === false && strpos($basename, 'test') === false) {
            $zip->addFile($file, basename($file));
        }
    }
    
    // Add media files
    $mediaFolders = ['assets'];
    foreach ($mediaFolders as $folder) {
        addFolderToZip($zip, WEBSITE_ROOT . '/' . $folder, $folder);
    }
    
    $zip->close();
    
    return [
        'success' => true,
        'backup_file' => $backupName . '.zip',
        'file_path' => $backupFile,
        'size' => filesize($backupFile),
        'timestamp' => $timestamp
    ];
}

function addFolderToZip($zip, $folderPath, $zipPath) {
    if (is_dir($folderPath)) {
        $files = scandir($folderPath);
        foreach ($files as $file) {
            if ($file !== '.' && $file !== '..') {
                $fullPath = $folderPath . '/' . $file;
                $zipFilePath = $zipPath . '/' . $file;
                
                if (is_dir($fullPath)) {
                    addFolderToZip($zip, $fullPath, $zipFilePath);
                } else {
                    $zip->addFile($fullPath, $zipFilePath);
                }
            }
        }
    }
}

function createFileBackup($filePath) {
    if (file_exists($filePath)) {
        $timestamp = date('Y-m-d_H-i-s');
        $backupPath = BACKUP_DIR . '/' . basename($filePath) . '_' . $timestamp . '.backup';
        copy($filePath, $backupPath);
    }
}

function previewChanges() {
    // This would generate a preview URL or temporary files
    return [
        'success' => true,
        'preview_url' => '../homepage.html?preview=1',
        'message' => 'Preview ready'
    ];
}

function publishChanges() {
    // This would move changes from staging to live
    return [
        'success' => true,
        'message' => 'Changes published successfully',
        'timestamp' => time()
    ];
}

?>
