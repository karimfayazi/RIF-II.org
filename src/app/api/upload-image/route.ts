import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { success: false, message: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (image.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = image.name;
    const extension = originalName.split('.').pop();
    const uniqueFilename = `${timestamp}_${Math.random().toString(36).substring(2)}.${extension}`;

    // Convert file to buffer for upload
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create FormData for remote upload
    const remoteFormData = new FormData();
    const blob = new Blob([buffer], { type: image.type });
    remoteFormData.append('file', blob, uniqueFilename);

    try {
      // Method 1: Try direct upload to rif-ii.org upload endpoint
      let uploadResponse;
      let uploadResult;
      
      console.log('Attempting to upload to rif-ii.org...');
      
      try {
        uploadResponse = await fetch('https://rif-ii.org/upload.php', {
          method: 'POST',
          body: remoteFormData,
          headers: {
            'User-Agent': 'RIF-MIS-Upload/1.0',
          },
        });

        console.log('Upload response status:', uploadResponse.status);
        
        if (uploadResponse.ok) {
          uploadResult = await uploadResponse.text();
          console.log('Upload result:', uploadResult);
        }
      } catch (directUploadError) {
        console.log('Direct upload failed:', directUploadError);
      }

      // Method 2: Try alternative upload endpoint if direct upload fails
      if (!uploadResponse || !uploadResponse.ok) {
        try {
          console.log('Trying alternative upload method...');
          uploadResponse = await fetch('https://rif-ii.org/test/upload.php', {
            method: 'POST',
            body: remoteFormData,
            headers: {
              'User-Agent': 'RIF-MIS-Upload/1.0',
            },
          });
          
          if (uploadResponse.ok) {
            uploadResult = await uploadResponse.text();
          }
        } catch (altUploadError) {
          console.log('Alternative upload also failed:', altUploadError);
        }
      }

      // Method 3: Try with different field names and endpoints
      if (!uploadResponse || !uploadResponse.ok) {
        const uploadMethods = [
          { url: 'https://rif-ii.org/upload/', field: 'file' },
          { url: 'https://rif-ii.org/test/', field: 'image' },
          { url: 'https://rif-ii.org/test/', field: 'upload' },
          { url: 'https://rif-ii.org/api/upload', field: 'file' }
        ];

        for (const method of uploadMethods) {
          try {
            console.log(`Trying ${method.url} with field ${method.field}...`);
            const methodFormData = new FormData();
            methodFormData.append(method.field, blob, uniqueFilename);
            
            uploadResponse = await fetch(method.url, {
              method: 'POST',
              body: methodFormData,
              headers: {
                'User-Agent': 'RIF-MIS-Upload/1.0',
              },
            });
            
            if (uploadResponse.ok) {
              uploadResult = await uploadResponse.text();
              console.log(`Success with ${method.url}:`, uploadResult);
              break;
            }
          } catch (methodError) {
            console.log(`Method ${method.url} failed:`, methodError);
            continue;
          }
        }
      }

      if (!uploadResponse || !uploadResponse.ok) {
        throw new Error(`All remote upload methods failed. Server response: ${uploadResponse?.status} ${uploadResponse?.statusText}`);
      }
      
      // Construct the final URL
      const finalUrl = `https://rif-ii.org/test/${uniqueFilename}`;

      return NextResponse.json({
        success: true,
        message: 'Image uploaded successfully to rif-ii.org',
        url: finalUrl,
        filename: uniqueFilename,
        originalName: originalName,
        size: image.size,
        type: image.type,
        serverResponse: uploadResult,
        uploadMethod: 'remote'
      });

    } catch (uploadError) {
      console.error('Remote upload error:', uploadError);
      
      // FALLBACK: Save locally and provide instructions for manual upload
      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        
        // Create local uploads directory
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        await fs.mkdir(uploadsDir, { recursive: true });
        
        // Save file locally as fallback
        const filePath = path.join(uploadsDir, uniqueFilename);
        await fs.writeFile(filePath, buffer);
        
        const localUrl = `/uploads/${uniqueFilename}`;
        // Detect the current server URL for production
        const host = request.headers.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
        const fullLocalUrl = `${baseUrl}${localUrl}`;
        
        return NextResponse.json({
          success: true,
          message: 'Remote upload failed, but file saved locally. See instructions below.',
          url: fullLocalUrl,
          filename: uniqueFilename,
          originalName: originalName,
          size: image.size,
          type: image.type,
          fallback: true,
          instructions: {
            message: 'File uploaded locally. To upload to rif-ii.org server:',
            steps: [
              '1. Download the file from the local URL above',
              '2. Manually upload it to https://rif-ii.org/test/ via FTP/cPanel',
              '3. Or set up the upload.php script on rif-ii.org server',
              '4. The final URL will be: https://rif-ii.org/test/' + uniqueFilename
            ],
            localPath: filePath,
            targetUrl: `https://rif-ii.org/test/${uniqueFilename}`
          }
        });
        
      } catch (fallbackError) {
        return NextResponse.json({
          success: false,
          message: `Failed to upload to rif-ii.org server: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`,
          details: 'The remote server may not accept file uploads or may require special authentication.',
          troubleshooting: [
            'Check if https://rif-ii.org accepts file uploads',
            'Verify if authentication is required',
            'Ensure the server has an upload endpoint configured',
            'Check server CORS settings',
            'Contact the server administrator'
          ]
        }, { status: 500 });
      }
    }

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Upload failed due to server error' },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 }
  );
}
