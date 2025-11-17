import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const testUrls = [
    'https://rif-ii.org/upload.php',
    'https://rif-ii.org/simple-upload.php',
    'http://rif-ii.org/upload.php',
    'http://rif-ii.org/simple-upload.php',
  ];

  const results = [];

  for (const url of testUrls) {
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(url, {
        method: 'GET',
      });
      
      const status = response.status;
      const statusText = response.statusText;
      const text = await response.text();
      
      results.push({
        url,
        status,
        statusText,
        accessible: status === 200,
        response: text.substring(0, 200), // First 200 chars
      });
    } catch (error) {
      results.push({
        url,
        status: 'ERROR',
        statusText: error instanceof Error ? error.message : 'Unknown error',
        accessible: false,
        response: null,
      });
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Upload endpoint test results',
    results,
    instructions: {
      'If all URLs return 404': [
        '1. The upload.php file is not in the website root directory',
        '2. Check your FTP/cPanel file manager',
        '3. The file should be at: /public_html/upload.php (or /www/upload.php depending on your server)',
        '4. Make sure the file is named exactly "upload.php" (case-sensitive)',
      ],
      'If you get 403 Forbidden': [
        '1. Check file permissions (should be 644 or 755)',
        '2. Check directory permissions',
      ],
      'If you get 500 Error': [
        '1. Check PHP error logs',
        '2. Make sure PHP is enabled on your server',
        '3. Check if the file has syntax errors',
      ],
    },
  });
}

