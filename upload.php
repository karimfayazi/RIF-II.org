<?php
/**
 * Upload Script for rif-ii.org Server
 * Place this file as upload.php on your rif-ii.org server
 * Make sure the 'test' directory exists and is writable
 */

// Set CORS headers to allow uploads from your Next.js app
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Handle GET requests for testing
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'success' => true,
        'message' => 'Document upload endpoint ready',
        'server' => 'rif-ii.org',
        'timestamp' => date('Y-m-d H:i:s'),
        'supported_types' => ['PDF', 'DOC', 'DOCX', 'Images']
    ]);
    exit();
}

// Only allow POST requests for uploads
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

try {
    // Check if file was uploaded (try multiple field names for documents)
    if (!isset($_FILES['file']) && !isset($_FILES['document']) && !isset($_FILES['image'])) {
        throw new Exception('No file uploaded');
    }
    
    // Get the uploaded file (try all field names)
    $uploadedFile = $_FILES['file'] ?? $_FILES['document'] ?? $_FILES['image'] ?? null;
    
    // Check for upload errors
    if ($uploadedFile['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('File upload error: ' . $uploadedFile['error']);
    }
    
    // Validate file type (documents and images)
    $allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg', 
        'image/png', 
        'image/gif', 
        'image/webp'
    ];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $uploadedFile['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($mimeType, $allowedTypes)) {
        throw new Exception('Invalid file type. Only PDF, DOC, DOCX, and image files are allowed.');
    }
    
    // Validate file size (10MB max)
    $maxSize = 10 * 1024 * 1024; // 10MB
    if ($uploadedFile['size'] > $maxSize) {
        throw new Exception('File too large. Maximum size is 10MB.');
    }
    
    // Create test directory if it doesn't exist
    $uploadDir = __DIR__ . '/test/';
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            throw new Exception('Failed to create upload directory');
        }
    }
    
    // Generate unique filename or use provided name
    $originalName = $uploadedFile['name'];
    $extension = pathinfo($originalName, PATHINFO_EXTENSION);
    
    // Use provided filename if it looks like a unique name, otherwise generate one
    if (preg_match('/^\d+_[a-z0-9]+\./i', $originalName)) {
        $filename = $originalName;
    } else {
        $filename = time() . '_' . bin2hex(random_bytes(8)) . '.' . $extension;
    }
    
    $targetPath = $uploadDir . $filename;
    
    // Move uploaded file to target directory
    if (!move_uploaded_file($uploadedFile['tmp_name'], $targetPath)) {
        throw new Exception('Failed to save uploaded file');
    }
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'File uploaded successfully',
        'filename' => $filename,
        'url' => 'https://rif-ii.org/test/' . $filename,
        'size' => $uploadedFile['size'],
        'type' => $mimeType
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
