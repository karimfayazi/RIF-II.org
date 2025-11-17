import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const document = formData.get('document') as File;

    if (!document) {
      return NextResponse.json(
        { success: false, message: 'No document file provided' },
        { status: 400 }
      );
    }

    // Validate file type (PDF and DOC formats)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(document.type)) {
      return NextResponse.json(
        { success: false, message: 'File must be PDF, DOC, or DOCX format' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (document.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = document.name;
    const extension = originalName.split('.').pop();
    const uniqueFilename = `${timestamp}_${Math.random().toString(36).substring(2)}.${extension}`;

    // Convert file to buffer
    const bytes = await document.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine upload directory
    // Option 1: Use external path if set (for direct server upload)
    // Option 2: Use Next.js public folder (for local development/production)
    const externalUploadPath = process.env.DOCUMENTS_UPLOAD_PATH || process.env.UPLOAD_PATH;
    let uploadDir: string;
    let fileUrl: string;
    let baseUrl: string;

    if (externalUploadPath) {
      // Use external path (directly on rif-ii.org server)
      // Same pattern as GIS_MAPS - save directly to Uploads/test/ from the base path
      uploadDir = join(externalUploadPath, 'Uploads', 'test');
      fileUrl = `https://rif-ii.org/Uploads/test/${uniqueFilename}`;
      baseUrl = 'https://rif-ii.org';
      console.log(`✓ Using external upload path: ${uploadDir}`);
      console.log(`  Base path: ${externalUploadPath}`);
      console.log(`  Files will be accessible at: ${fileUrl}`);
      console.log(`  Same pattern as GIS_MAPS (which works)`);
    } else {
      // Default to Next.js public folder (works immediately, no setup needed)
      uploadDir = join(process.cwd(), 'public', 'uploads', 'test');
      const host = request.headers.get('host') || 'localhost:3000';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
      fileUrl = `${baseUrl}/uploads/test/${uniqueFilename}`;
      console.log(`✓ Using Next.js public folder: ${uploadDir}`);
      console.log(`  Files will be accessible at: ${fileUrl}`);
      console.log(`  ⚠ To save directly to rif-ii.org server, set DOCUMENTS_UPLOAD_PATH in .env.local`);
    }

    try {
      // Create upload directory if it doesn't exist
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
        console.log(`✓ Created upload directory: ${uploadDir}`);
      }

      // Save file to disk
      const filePath = join(uploadDir, uniqueFilename);
      await writeFile(filePath, buffer);
      console.log(`✓ File saved successfully: ${filePath}`);

      // Verify file was saved
      let fileVerified = false;
      let fileSize = 0;
      try {
        const stats = await stat(filePath);
        fileVerified = true;
        fileSize = stats.size;
        console.log(`✓ File verified: ${uniqueFilename} exists, size: ${stats.size} bytes`);
      } catch (verifyError) {
        console.error(`✗ File verification failed:`, verifyError);
      }

      // Return success response
      return NextResponse.json({
        success: true,
        message: 'Document uploaded successfully!',
        url: fileUrl,
        filename: uniqueFilename,
        originalName: originalName,
        size: document.size,
        type: document.type,
        uploadMethod: externalUploadPath ? 'external-server' : 'local-server',
        filePath: filePath,
        fileVerified: fileVerified,
        fileSizeOnDisk: fileSize,
        baseUrl: baseUrl,
        uploadDirectory: uploadDir,
        note: externalUploadPath 
          ? `File saved to: ${filePath}. Verify the file exists and that the web server root matches the DOCUMENTS_UPLOAD_PATH.`
          : 'File saved to Next.js server. To save directly to rif-ii.org, set DOCUMENTS_UPLOAD_PATH environment variable.',
        troubleshooting: externalUploadPath ? [
          `If file is not accessible, verify:`,
          `1. File exists at: ${filePath}`,
          `2. Web server root is: ${externalUploadPath}`,
          `3. URL should match: ${fileUrl}`,
          `4. Check web server configuration if files aren't accessible`
        ] : []
      });

    } catch (saveError) {
      console.error('Error saving file:', saveError);
      const errorMessage = saveError instanceof Error ? saveError.message : 'Unknown error';
      
      return NextResponse.json({
        success: false,
        message: `Failed to save file: ${errorMessage}`,
        error: errorMessage,
        uploadDir: uploadDir,
        troubleshooting: [
          'Check if the directory exists and is writable',
          'Verify file permissions',
          'Check disk space',
          'If using external path, verify DOCUMENTS_UPLOAD_PATH is correct'
        ]
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Upload failed due to server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle GET requests for testing
export async function GET() {
  const externalUploadPath = process.env.DOCUMENTS_UPLOAD_PATH || process.env.UPLOAD_PATH;
  
  return NextResponse.json({
    success: true,
    message: 'Document upload endpoint ready',
    configuration: {
      uploadMethod: externalUploadPath ? 'external-server' : 'local-server',
      uploadPath: externalUploadPath 
        ? `${externalUploadPath}/Uploads/test`
        : 'public/uploads/test',
      fileUrl: externalUploadPath
        ? 'https://rif-ii.org/Uploads/test/'
        : '/uploads/test/',
      note: externalUploadPath 
        ? 'Files will be saved directly to rif-ii.org server at /Uploads/test/'
        : 'Files will be saved to Next.js public folder. Set DOCUMENTS_UPLOAD_PATH to save directly to rif-ii.org server.'
    },
    supportedTypes: ['PDF', 'DOC', 'DOCX'],
    maxFileSize: '10MB'
  });
}
