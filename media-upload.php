<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Configuration
$uploadDir = 'assets/unknown/';
$maxFileSize = 50 * 1024 * 1024; // 50MB
$allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov',
    'application/pdf', 'text/plain', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

// Ensure upload directory exists
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Handle different request methods
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        handleUpload();
        break;
    case 'GET':
        if (isset($_GET['action']) && $_GET['action'] === 'list') {
            listFiles();
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
        }
        break;
    case 'DELETE':
        handleDelete();
        break;
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        break;
}

function handleUpload() {
    global $uploadDir, $maxFileSize, $allowedTypes;
    
    if (!isset($_FILES['file'])) {
        echo json_encode(['success' => false, 'message' => 'No file uploaded']);
        return;
    }
    
    $file = $_FILES['file'];
    $fileName = $file['name'];
    $fileTmpName = $file['tmp_name'];
    $fileSize = $file['size'];
    $fileType = $file['type'];
    $fileError = $file['error'];
    
    // Check for upload errors
    if ($fileError !== UPLOAD_ERR_OK) {
        echo json_encode(['success' => false, 'message' => 'Upload error: ' . $fileError]);
        return;
    }
    
    // Check file size
    if ($fileSize > $maxFileSize) {
        echo json_encode(['success' => false, 'message' => 'File too large. Maximum size is 50MB']);
        return;
    }
    
    // Check file type
    if (!in_array($fileType, $allowedTypes)) {
        echo json_encode(['success' => false, 'message' => 'File type not allowed: ' . $fileType]);
        return;
    }
    
    // Generate unique filename to prevent overwriting
    $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);
    $baseName = pathinfo($fileName, PATHINFO_FILENAME);
    $uniqueName = $baseName . '_' . time() . '.' . $fileExtension;
    $targetPath = $uploadDir . $uniqueName;
    
    // Move uploaded file
    if (move_uploaded_file($fileTmpName, $targetPath)) {
        $fileInfo = [
            'name' => $fileName,
            'unique_name' => $uniqueName,
            'path' => $targetPath,
            'size' => $fileSize,
            'type' => $fileType,
            'uploaded_at' => date('Y-m-d H:i:s'),
            'url' => $targetPath
        ];
        
        echo json_encode([
            'success' => true, 
            'message' => 'File uploaded successfully',
            'file' => $fileInfo
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to move uploaded file']);
    }
}

function listFiles() {
    global $uploadDir;
    
    $files = [];
    
    if (is_dir($uploadDir)) {
        $fileList = scandir($uploadDir);
        
        foreach ($fileList as $filename) {
            if ($filename !== '.' && $filename !== '..') {
                $filePath = $uploadDir . $filename;
                
                if (is_file($filePath)) {
                    $fileInfo = [
                        'name' => $filename,
                        'path' => $filePath,
                        'url' => $filePath,
                        'size' => filesize($filePath),
                        'type' => mime_content_type($filePath),
                        'modified' => date('Y-m-d H:i:s', filemtime($filePath)),
                        'is_image' => isImageFile($filePath),
                        'is_video' => isVideoFile($filePath),
                        'is_document' => isDocumentFile($filePath)
                    ];
                    
                    $files[] = $fileInfo;
                }
            }
        }
    }
    
    // Sort files by modification date (newest first)
    usort($files, function($a, $b) {
        return strtotime($b['modified']) - strtotime($a['modified']);
    });
    
    echo json_encode([
        'success' => true,
        'files' => $files,
        'count' => count($files)
    ]);
}

function handleDelete() {
    global $uploadDir;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['filename'])) {
        echo json_encode(['success' => false, 'message' => 'Filename not provided']);
        return;
    }
    
    $filename = basename($input['filename']); // Prevent path traversal
    $filePath = $uploadDir . $filename;
    
    if (!file_exists($filePath)) {
        echo json_encode(['success' => false, 'message' => 'File not found']);
        return;
    }
    
    if (unlink($filePath)) {
        echo json_encode(['success' => true, 'message' => 'File deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to delete file']);
    }
}

function isImageFile($filePath) {
    $imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    $mimeType = mime_content_type($filePath);
    return in_array($mimeType, $imageTypes);
}

function isVideoFile($filePath) {
    $videoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
    $mimeType = mime_content_type($filePath);
    return in_array($mimeType, $videoTypes);
}

function isDocumentFile($filePath) {
    $documentTypes = [
        'application/pdf', 'text/plain', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    $mimeType = mime_content_type($filePath);
    return in_array($mimeType, $documentTypes);
}
?>
