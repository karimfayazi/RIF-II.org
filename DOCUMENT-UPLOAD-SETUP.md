# 📄 Document Upload Setup Guide

## ✅ Simple Solution - Works Immediately (No PHP Needed!)

The upload system now saves files **directly to your Next.js server** - no PHP required!

---

## 🎯 Two Upload Options

### Option 1: Save to Next.js Server (Default - Works Now!)

**Status:** ✅ **READY TO USE** - No configuration needed!

Files are saved to: `public/uploads/test/`

**Access files at:**
- Development: `http://localhost:3000/uploads/test/filename.pdf`
- Production: `https://your-domain.com/uploads/test/filename.pdf`

**Advantages:**
- ✅ Works immediately
- ✅ No server setup required
- ✅ No PHP needed
- ✅ Files accessible via your Next.js app

**How it works:**
1. Upload a file from your app
2. File is saved to `public/uploads/test/`
3. File is immediately accessible via URL
4. That's it! 🎉

---

### Option 2: Save Directly to rif-ii.org Server (Advanced)

**Status:** Requires environment variable configuration

Files are saved directly to the rif-ii.org server filesystem.

**Setup Steps:**

1. **Find your rif-ii.org server document root** (where website files are stored)
   - Common locations: `C:\inetpub\wwwroot\`, `/var/www/html/`, `/home/user/public_html/`
   - Or wherever your `index.html` or `index.php` is located

2. **Create `.env.local` file** in your Next.js project root:

   ```env
   DOCUMENTS_UPLOAD_PATH=C:\path\to\rif-ii.org\public_html
   ```

   **Examples:**
   ```env
   # Windows
   DOCUMENTS_UPLOAD_PATH=C:\inetpub\wwwroot
   
   # Linux
   DOCUMENTS_UPLOAD_PATH=/var/www/html
   
   # Or if you want to use the same path as other uploads
   DOCUMENTS_UPLOAD_PATH=C:\path\to\httpdocs
   ```

3. **Restart your Next.js server** after adding the environment variable

4. **Create the `test` directory** on your server (if it doesn't exist):
   - The upload script will create it automatically, but you can create it manually:
   - Path: `[DOCUMENTS_UPLOAD_PATH]/test/`
   - Permissions: 755 (readable and writable)

**Advantages:**
- Files saved directly to rif-ii.org server
- Files accessible at `https://rif-ii.org/test/filename.pdf`
- No manual copying needed

**Requirements:**
- Next.js server must have write access to the rif-ii.org server directory
- Both servers must be on the same machine OR
- You must have network access/mount to the rif-ii.org server directory

---

## 🚀 Quick Start (Use Option 1)

**Just start uploading!** The system works immediately with Option 1.

1. Go to `/about-consultancy-firm`
2. Select a PDF, DOC, or DOCX file
3. Click "Upload Document"
4. File is saved and you'll get a URL immediately!

---

## 📋 Test the Upload

### Test Endpoint
Visit: `http://localhost:3000/api/upload-document` (GET request)

This will show you:
- Current configuration
- Upload method being used
- Where files are being saved

### Upload a File
1. Go to `/about-consultancy-firm` page
2. Select a document file
3. Click "Upload Document"
4. Check the success message for the file URL

---

## 🔍 Troubleshooting

### Issue: "Failed to save file" error

**Solution:**
- Check if the directory exists and is writable
- Check file permissions
- Verify disk space
- Check server logs for detailed error messages

### Issue: Files not accessible via URL

**For Option 1 (Next.js server):**
- Make sure the file is in `public/uploads/test/`
- Files in `public/` folder are automatically served by Next.js
- Check the URL format: `/uploads/test/filename.pdf`

**For Option 2 (External server):**
- Verify `DOCUMENTS_UPLOAD_PATH` is correct
- Check if the `test` directory exists
- Verify file permissions (should be readable by web server)
- Check if files are actually being saved to the directory

### Issue: Environment variable not working

**Solution:**
1. Make sure `.env.local` is in the project root (same level as `package.json`)
2. Restart your Next.js dev server after adding/changing `.env.local`
3. Check the format: `DOCUMENTS_UPLOAD_PATH=C:\path\to\folder` (no quotes, no spaces)
4. Verify the path exists and is accessible

---

## 📊 Comparison

| Feature | Option 1 (Next.js) | Option 2 (External Server) |
|---------|-------------------|---------------------------|
| **Setup Required** | ❌ None | ✅ Environment variable |
| **Works Immediately** | ✅ Yes | ⚠️ After setup |
| **File Location** | `public/uploads/test/` | `[server]/test/` |
| **File URL** | `your-domain.com/uploads/test/` | `rif-ii.org/test/` |
| **PHP Required** | ❌ No | ❌ No |
| **Server Access** | ✅ Always works | ⚠️ Needs access |

---

## ✅ Recommended Approach

**For most users:** Use **Option 1** (default) - it works immediately!

**Switch to Option 2** only if you need files to be directly accessible at `https://rif-ii.org/test/` and your Next.js server has access to the rif-ii.org server filesystem.

---

## 🎉 Success!

Once set up, you can:
- ✅ Upload PDF, DOC, DOCX files
- ✅ Files are automatically saved
- ✅ Get immediate access URLs
- ✅ No PHP or external server setup needed!

**Need help?** Check the error messages in the browser console or server logs for detailed information.

