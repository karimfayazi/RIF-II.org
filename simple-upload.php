<?php
// Simple Document Upload Script for rif-ii.org
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(['success' => true, 'message' => 'Document upload ready']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get uploaded file
        $file = $_FILES['file'] ?? $_FILES['document'] ?? null;
        
        if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('No file uploaded');
        }
        
        // Check file type
        $allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        if (!in_array($mimeType, $allowedTypes)) {
            throw new Exception('Only PDF, DOC, DOCX files allowed');
        }
        
        // Create test directory
        if (!is_dir('test')) {
            mkdir('test', 0755, true);
        }
        
        // Save file
        $filename = $file['name'];
        $targetPath = 'test/' . $filename;
        
        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            echo json_encode([
                'success' => true,
                'message' => 'Document uploaded successfully',
                'filename' => $filename,
                'url' => 'https://rif-ii.org/test/' . $filename
            ]);
        } else {
            throw new Exception('Failed to save file');
        }
        
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}
?>
