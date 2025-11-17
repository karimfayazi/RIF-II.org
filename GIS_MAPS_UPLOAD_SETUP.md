# GIS Maps Upload Configuration Guide

## Problem
Files are being saved to the Next.js `public` folder, but they need to be accessible at:
**https://rif-ii.org/Content/GIS_Maps/Images/**

## Solution
Configure the upload path to save files directly to your web server's document root.

## Step 1: Find Your Web Server Document Root

The document root is the folder where your web server (IIS, Apache, etc.) serves files from `https://rif-ii.org`.

Common locations:
- **Windows IIS**: `C:\inetpub\wwwroot` or `C:\path\to\httpdocs`
- **XAMPP**: `C:\xampp\htdocs`
- **Linux Apache**: `/var/www/html` or `/var/www/rif-ii.org`

## Step 2: Create Environment Variable

**Target Location:** `httpdocs/Content/GIS_Maps/Images/`

1. Create a file named `.env.local` in your project root (same folder as `package.json`)

2. Add this line with your actual `httpdocs` path:
   ```env
   GIS_MAPS_UPLOAD_PATH=C:/path/to/httpdocs
   ```

   **Windows Examples (use the path that matches your server):**
   ```env
   # Example 1: If httpdocs is in C:\
   GIS_MAPS_UPLOAD_PATH=C:/httpdocs
   
   # Example 2: If httpdocs is in a subdirectory
   GIS_MAPS_UPLOAD_PATH=C:/xampp/htdocs
   
   # Example 3: If using IIS
   GIS_MAPS_UPLOAD_PATH=C:/inetpub/wwwroot
   ```
   
   **Linux Example:**
   ```env
   GIS_MAPS_UPLOAD_PATH=/var/www/httpdocs
   ```

   **Important Notes:**
   - Use forward slashes `/` even on Windows
   - No trailing slash
   - Use absolute path (full path from root)
   - Point to the `httpdocs` folder itself (the code will add `Content/GIS_Maps/Images/`)

3. Files will be saved to: `{GIS_MAPS_UPLOAD_PATH}/Content/GIS_Maps/Images/`

   **Example:** If you set `GIS_MAPS_UPLOAD_PATH=C:/httpdocs`, files will save to:
   `C:/httpdocs/Content/GIS_Maps/Images/`

## Step 3: Restart Your Server

Environment variables are only loaded when the server starts, so:
1. Stop your Next.js server
2. Start it again: `npm run dev` or `npm start`

## Step 4: Verify

1. Upload a test image
2. Check server console - it should show: `Using external upload path: ...`
3. Verify the file exists in: `{your_path}/Content/GIS_Maps/Images/`
4. Test the URL: `https://rif-ii.org/Content/GIS_Maps/Images/{filename}`

## Troubleshooting

### Files still not accessible?
- Check file permissions - web server needs read access
- Verify the path in server console logs
- Ensure directory structure exists: `Content/GIS_Maps/Images/`

### Permission Errors?
- Make sure the Next.js process has write permissions to the upload directory
- On Windows, run as Administrator if needed
- On Linux, check directory ownership: `chown -R www-data:www-data /path/to/directory`

## Current Configuration Status

If you see this in the console:
- `Using Next.js public folder: ...` → Environment variable NOT set
- `Using external upload path: ...` → Environment variable IS set correctly

