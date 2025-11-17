import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const testResults = {
    timestamp: new Date().toISOString(),
    tests: [] as any[]
  };

  // Test different endpoints
  const endpoints = [
    'https://rif-ii.org/upload.php',
    'http://rif-ii.org/upload.php',
    'https://rif-ii.org/',
    'http://rif-ii.org/'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing endpoint: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'User-Agent': 'RIF-MIS-Test/1.0',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      testResults.tests.push({
        endpoint,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        success: response.ok,
        responsePreview: response.ok ? await response.text().then(text => text.substring(0, 200)) : 'Failed to read response'
      });

    } catch (error) {
      testResults.tests.push({
        endpoint,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.name : 'Unknown'
      });
    }
  }

  return NextResponse.json(testResults);
}
