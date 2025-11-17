# Upload Path Setup - ASP.NET to Next.js Equivalence

## ASP.NET Code (Original)

```csharp
string virtualFolder = "~/Uploads/Pictures/";
string physicalFolder = Server.MapPath(virtualFolder);
```

## Next.js Equivalent

We use environment variables to map virtual paths to physical folders, just like ASP.NET's `Server.MapPath()`.

---

## How It Works

### ASP.NET
- `~/` = Application root (web server document root)
- `Server.MapPath()` = Converts virtual path to physical file system path
- Files are stored in the physical folder and accessible via virtual path

### Next.js
- Uses environment variable `GIS_MAPS_UPLOAD_PATH` (or `UPLOAD_PATH`)
- Maps virtual folder structure to physical server path
- Files accessible at the configured URL

---

## Configuration Steps

### Step 1: Set Environment Variable

Create `.env.local` in your project root:

```env
# Virtual folder mapping (like ASP.NET ~/Uploads/)
GIS_MAPS_UPLOAD_PATH=D:/Inetpub/rif-ii.org
```

This tells Next.js: "When uploading, save to this physical path"

### Step 2: Virtual Path Structure

Files are organized as:
```
Physical Path:
D:/Inetpub/rif-ii.org/
├── Content/
│   └── GIS_Maps/
│       └── Images/
│           └── [uploaded files]

Virtual Path (URL):
https://rif-ii.org/Content/GIS_Maps/Images/
```

---

## Example Comparison

### ASP.NET
```csharp
// Define virtual path
string virtualFolder = "~/Uploads/Pictures/";

// Convert to physical path
string physicalFolder = Server.MapPath(virtualFolder);
// Result: C:\inetpub\wwwroot\Uploads\Pictures\

// Save file
File.WriteAllBytes(physicalFolder + fileName, fileBytes);

// Access file
// URL: https://yoursite.com/Uploads/Pictures/filename.jpg
```

### Next.js
```typescript
// Define in .env.local
GIS_MAPS_UPLOAD_PATH=D:/Inetpub/rif-ii.org

// Next.js automatically maps paths
const uploadDir = path.join(process.env.GIS_MAPS_UPLOAD_PATH, 'Content', 'GIS_Maps', 'Images');
// Result: D:/Inetpub/rif-ii.org/Content/GIS_Maps/Images/

// Save file
await writeFile(filePath, fileBuffer);

// Access file
// URL: https://rif-ii.org/Content/GIS_Maps/Images/filename.jpg
```

---

## For Your Application

### Current Setup
- **Virtual Folder**: `~/Content/GIS_Maps/Images/`
- **Physical Path**: `D:/Inetpub/rif-ii.org/Content/GIS_Maps/Images/`
- **Web URL**: `https://rif-ii.org/Content/GIS_Maps/Images/`

### .env.local Configuration
```env
GIS_MAPS_UPLOAD_PATH=D:/Inetpub/rif-ii.org
```

This automatically handles:
- Creating `Content/GIS_Maps/Images/` subdirectories
- Saving files with proper path
- Making them accessible at `https://rif-ii.org/Content/GIS_Maps/Images/`

---

## For Test Uploads

If you want test uploads to go to a different location, update:

```env
# For GIS maps (maps management)
GIS_MAPS_UPLOAD_PATH=D:/Inetpub/rif-ii.org

# For test uploads (add if needed)
TEST_UPLOAD_PATH=D:/Inetpub/rif-ii.org/Uploads/Pictures
```

Then create a reusable utility function:

```typescript
// lib/uploadPath.ts
export function getUploadDir(type: string): string {
  const basePath = process.env[`${type}_UPLOAD_PATH`] || process.env.UPLOAD_PATH;
  
  if (!basePath) {
    // Fallback to Next.js public folder
    return path.join(process.cwd(), 'public', 'uploads', type.toLowerCase());
  }
  
  return basePath;
}

// Usage in API
const uploadDir = getUploadDir('GIS_MAPS');
// or
const uploadDir = getUploadDir('TEST_UPLOAD');
```

---

## Summary

**ASP.NET's `Server.MapPath(~/path/)`** = **Next.js's `process.env.UPLOAD_PATH`**

Both:
- Map virtual paths to physical server folders
- Allow files to be accessible via web URLs
- Keep uploaded files outside the application code
- Enable flexible deployment configurations

The Next.js implementation is already set up this way!
