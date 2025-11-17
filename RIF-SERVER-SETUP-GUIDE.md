# RIF-II.ORG Server Setup Guide for Image Upload

## Current Issue
The upload is failing because the rif-ii.org server doesn't have an upload endpoint configured. Here are several solutions:

## Solution 1: Upload PHP Script (Recommended)

### Step 1: Create upload.php on rif-ii.org server
Place this file in the root directory of your rif-ii.org website:

```php
<?php
// upload.php - Place this in the root of rif-ii.org
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

try {
    $uploadedFile = $_FILES['file'] ?? $_FILES['image'] ?? null;
    
    if (!$uploadedFile || $uploadedFile['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('No file uploaded or upload error');
    }
    
    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $uploadedFile['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($mimeType, $allowedTypes)) {
        throw new Exception('Invalid file type');
    }
    
    // Create test directory
    $uploadDir = __DIR__ . '/test/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $filename = $uploadedFile['name'];
    $targetPath = $uploadDir . $filename;
    
    if (!move_uploaded_file($uploadedFile['tmp_name'], $targetPath)) {
        throw new Exception('Failed to save file');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'File uploaded successfully',
        'filename' => $filename,
        'url' => 'https://rif-ii.org/test/' . $filename
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
```

### Step 2: Set Directory Permissions
```bash
# SSH into your rif-ii.org server and run:
mkdir -p /path/to/website/test
chmod 755 /path/to/website/test
chown www-data:www-data /path/to/website/test
```

## Solution 2: Manual Upload Process (Immediate Workaround)

Since the automatic upload is failing, the system now:
1. Saves files locally to your Next.js app
2. Provides instructions for manual upload
3. Shows you the exact filename and target URL

### Steps:
1. Upload image through your app (it saves locally)
2. Download the file from the local URL shown
3. Manually upload to rif-ii.org/test/ via FTP/cPanel
4. The image will be accessible at the target URL

## Solution 3: FTP Upload (Advanced)

Add FTP credentials to your environment and use FTP upload:

### Add to .env.local:
```
RIF_FTP_HOST=ftp.rif-ii.org
RIF_FTP_USER=your_username
RIF_FTP_PASS=your_password
RIF_FTP_PATH=/public_html/test/
```

### Update API (if you have FTP access):
```javascript
// In your API route, add FTP upload method
const ftp = require('basic-ftp');

async function uploadViaFTP(buffer, filename) {
    const client = new ftp.Client();
    try {
        await client.access({
            host: process.env.RIF_FTP_HOST,
            user: process.env.RIF_FTP_USER,
            password: process.env.RIF_FTP_PASS,
        });
        
        await client.uploadFrom(buffer, `/test/${filename}`);
        return `https://rif-ii.org/test/${filename}`;
    } finally {
        client.close();
    }
}
```

## Solution 4: Contact Server Administrator

If you don't have server access:
1. Contact the rif-ii.org server administrator
2. Request them to install the upload.php script
3. Ask them to create a writable /test/ directory
4. Ensure CORS headers are configured

## Testing the Setup

Once you've implemented any solution:
1. Try uploading an image through your app
2. Check if the file appears at https://rif-ii.org/test/filename.jpg
3. Verify the image is accessible via the URL

## Troubleshooting

### Common Issues:
- **403 Forbidden**: Directory permissions issue
- **404 Not Found**: upload.php not in correct location
- **CORS Error**: Missing CORS headers
- **File not saving**: Directory not writable

### Quick Fixes:
```bash
# Fix permissions
chmod 755 /path/to/website/test
chmod 644 /path/to/website/upload.php

# Check if PHP is working
echo "<?php phpinfo(); ?>" > test.php
# Visit https://rif-ii.org/test.php
```

## Current Status

Your app now has a fallback system:
- ✅ Tries to upload to rif-ii.org
- ✅ Falls back to local storage if remote fails
- ✅ Provides manual upload instructions
- ✅ Shows target URLs for final placement

Choose the solution that works best for your server access level!
