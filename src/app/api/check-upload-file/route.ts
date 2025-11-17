import { NextRequest, NextResponse } from 'next/server';
import { existsSync, statSync } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    
    if (!filename) {
      return NextResponse.json({
        success: false,
        message: 'Please provide filename parameter',
        example: '/api/check-upload-file?filename=1762357731081_c3xkuu9nrxu.pdf'
      }, { status: 400 });
    }

    const externalUploadPath = process.env.DOCUMENTS_UPLOAD_PATH || process.env.UPLOAD_PATH;
    
    // Check both possible paths
    const possiblePaths = [];
    
    if (externalUploadPath) {
      const isHttpdocs = externalUploadPath.toLowerCase().endsWith('httpdocs');
      
      // Path 1: If httpdocs is the root
      if (isHttpdocs) {
        possiblePaths.push({
          path: join(externalUploadPath, 'Uploads', 'test', filename),
          url: `https://rif-ii.org/Uploads/test/${filename}`,
          description: 'If httpdocs is web root'
        });
      }
      
      // Path 2: httpdocs/Uploads/test/
      possiblePaths.push({
        path: isHttpdocs 
          ? join(externalUploadPath, 'Uploads', 'test', filename)
          : join(externalUploadPath, 'httpdocs', 'Uploads', 'test', filename),
        url: isHttpdocs
          ? `https://rif-ii.org/Uploads/test/${filename}`
          : `https://rif-ii.org/httpdocs/Uploads/test/${filename}`,
        description: 'Current configured path'
      });
      
      // Path 3: Just Uploads/test/ (if web root is parent of httpdocs)
      if (!isHttpdocs) {
        possiblePaths.push({
          path: join(externalUploadPath, 'Uploads', 'test', filename),
          url: `https://rif-ii.org/Uploads/test/${filename}`,
          description: 'If web root is parent directory'
        });
      }
    }
    
    // Check each path
    const results = possiblePaths.map((item, index) => {
      const exists = existsSync(item.path);
      let fileInfo = null;
      
      if (exists) {
        try {
          const stats = statSync(item.path);
          fileInfo = {
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          };
        } catch (err) {
          // File exists but can't read stats
        }
      }
      
      return {
        index: index + 1,
        path: item.path,
        url: item.url,
        description: item.description,
        exists: exists,
        fileInfo: fileInfo
      };
    });
    
    // Also check if directories exist
    const dirChecks = [];
    if (externalUploadPath) {
      const isHttpdocs = externalUploadPath.toLowerCase().endsWith('httpdocs');
      const dirsToCheck = [
        externalUploadPath,
        isHttpdocs ? join(externalUploadPath, 'Uploads') : join(externalUploadPath, 'httpdocs'),
        isHttpdocs ? join(externalUploadPath, 'Uploads', 'test') : join(externalUploadPath, 'httpdocs', 'Uploads', 'test')
      ];
      
      dirChecks.push(...dirsToCheck.map(dir => ({
        path: dir,
        exists: existsSync(dir),
        isDirectory: existsSync(dir) ? statSync(dir).isDirectory() : false
      })));
    }
    
    return NextResponse.json({
      success: true,
      filename: filename,
      configuration: {
        DOCUMENTS_UPLOAD_PATH: externalUploadPath || 'Not set',
        note: externalUploadPath 
          ? (externalUploadPath.toLowerCase().endsWith('httpdocs') 
              ? 'Points to httpdocs folder (web root)' 
              : 'Points to parent of httpdocs')
          : 'Using default Next.js public folder'
      },
      fileSearchResults: results,
      directoryCheck: dirChecks,
      recommendations: results.filter(r => r.exists).length > 0 
        ? results.filter(r => r.exists).map(r => ({
            message: `File found! Use this URL:`,
            url: r.url,
            filesystemPath: r.path
          }))
        : [
            'File not found in any expected location.',
            'Check server console logs to see where files are actually being saved.',
            'Verify the file was uploaded successfully.',
            'Check if DOCUMENTS_UPLOAD_PATH is correct.'
          ]
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error checking file',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

