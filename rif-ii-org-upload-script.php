<?php
/**
 * RIF-II.ORG Upload Script
 * 
 * INSTRUCTIONS:
 * 1. Upload this file to your rif-ii.org server as "upload.php" in the root directory
 * 2. Make sure the "test" directory exists and is writable (chmod 755)
 * 3. Test by visiting https://rif-ii.org/upload.php (should show "Upload endpoint ready")
 */

// Set CORS headers to allow uploads from your Next.js app
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, User-Agent');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Handle GET request (for testing)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'success' => true,
        'message' => 'Upload endpoint ready',
        'server' => 'rif-ii.org',
        'timestamp' => date('Y-m-d H:i:s'),
        'test_directory' => is_dir(__DIR__ . '/test/') ? 'exists' : 'missing',
        'test_writable' => is_writable(__DIR__ . '/test/') ? 'yes' : 'no'
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
    // Log the upload attempt
    error_log("Upload attempt from: " . $_SERVER['REMOTE_ADDR']);
    error_log("Files received: " . print_r($_FILES, true));
    
    // Check if file was uploaded (try multiple field names)
    $uploadedFile = null;
    $fieldNames = ['file', 'image', 'upload'];
    
    foreach ($fieldNames as $fieldName) {
        if (isset($_FILES[$fieldName]) && $_FILES[$fieldName]['error'] === UPLOAD_ERR_OK) {
            $uploadedFile = $_FILES[$fieldName];
            error_log("Found file in field: " . $fieldName);
            break;
        }
    }
    
    if (!$uploadedFile) {
        throw new Exception('No file uploaded. Available fields: ' . implode(', ', array_keys($_FILES)));
    }
    
    // Validate file type (only images)
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $uploadedFile['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($mimeType, $allowedTypes)) {
        throw new Exception('Invalid file type: ' . $mimeType . '. Only images are allowed.');
    }
    
    // Validate file size (10MB max)
    $maxSize = 10 * 1024 * 1024; // 10MB
    if ($uploadedFile['size'] > $maxSize) {
        throw new Exception('File too large: ' . round($uploadedFile['size'] / 1024 / 1024, 2) . 'MB. Maximum size is 10MB.');
    }
    
    // Create test directory if it doesn't exist
    $uploadDir = __DIR__ . '/test/';
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            throw new Exception('Failed to create upload directory');
        }
        error_log("Created directory: " . $uploadDir);
    }
    
    // Check if directory is writable
    if (!is_writable($uploadDir)) {
        throw new Exception('Upload directory is not writable: ' . $uploadDir);
    }
    
    // Use the provided filename or generate a unique one
    $originalName = $uploadedFile['name'];
    $extension = pathinfo($originalName, PATHINFO_EXTENSION);
    
    // If filename looks like it's already unique (timestamp_random.ext), use it
    if (preg_match('/^\d+_[a-z0-9]+\./i', $originalName)) {
        $filename = $originalName;
    } else {
        // Generate unique filename
        $filename = time() . '_' . bin2hex(random_bytes(8)) . '.' . $extension;
    }
    
    $targetPath = $uploadDir . $filename;
    
    // Move uploaded file to target directory
    if (!move_uploaded_file($uploadedFile['tmp_name'], $targetPath)) {
        throw new Exception('Failed to save uploaded file to: ' . $targetPath);
    }
    
    // Set proper file permissions
    chmod($targetPath, 0644);
    
    error_log("File uploaded successfully: " . $targetPath);
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'File uploaded successfully',
        'filename' => $filename,
        'url' => 'https://rif-ii.org/test/' . $filename,
        'size' => $uploadedFile['size'],
        'type' => $mimeType,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    error_log("Upload error: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'debug' => [
            'files_received' => array_keys($_FILES),
            'post_data' => array_keys($_POST),
            'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'unknown'
        ]
    ]);
}
?>
