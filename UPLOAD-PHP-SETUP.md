# 🔧 Upload.php Setup Guide - Fix 404 Error

## Problem: Getting 404 Error

If you see **"404 - File or directory not found"** when trying to access `https://rif-ii.org/upload.php`, it means the file is either:
1. **Not uploaded to the server**
2. **In the wrong directory**
3. **Named incorrectly**

---

## ✅ Step-by-Step Solution

### Step 1: Find Your Website Root Directory

The `upload.php` file **MUST** be in your website's **ROOT directory**. This is typically:

**Common locations:**
- `public_html/` (most common)
- `www/`
- `htdocs/`
- `html/`
- Or the directory where your `index.html` or `index.php` file is located

**How to find it:**
1. Log into your **cPanel** or **FTP client**
2. Look for your main website files (index.html, index.php, etc.)
3. The `upload.php` file should be in the **same folder** as these files

---

### Step 2: Upload the File Correctly

1. **Download** the `upload.php` file from your project (it's in the root of this Next.js project)
2. **Upload** it to your website root directory using:
   - **cPanel File Manager**: Go to File Manager → Navigate to `public_html` → Upload the file
   - **FTP Client**: Connect to your server → Navigate to root → Upload the file

3. **Important**: The file must be named exactly `upload.php` (lowercase, no spaces)

---

### Step 3: Set File Permissions

After uploading, set the file permissions:

1. **In cPanel File Manager:**
   - Right-click `upload.php` → Change Permissions
   - Set to **644** (or **755**)

2. **Via FTP:**
   - Right-click file → File Permissions/CHMOD
   - Set to **644** (or **755**)

---

### Step 4: Create the Test Directory

The upload script needs a `test/` directory to save files:

1. **Create folder** named `test` in your website root (same level as upload.php)
2. **Set permissions** to **755** (readable and writable by web server)

**In cPanel:**
- Create folder: File Manager → Create Folder → Name it `test`
- Set permissions: Right-click `test` folder → Change Permissions → **755**

---

### Step 5: Test the Upload Endpoint

1. **Open your browser**
2. **Visit**: `https://rif-ii.org/upload.php`
3. **You should see** JSON like this:
   ```json
   {
     "success": true,
     "message": "Document upload endpoint ready",
     "server": "rif-ii.org",
     "timestamp": "2024-01-01 12:00:00",
     "supported_types": ["PDF", "DOC", "DOCX", "Images"]
   }
   ```

**If you still see 404:**
- The file is not in the root directory
- Check if you're in a subdirectory (like `/test/upload.php` - that's wrong!)
- It should be `/upload.php` (in root), not `/test/upload.php`

---

### Step 6: Test from Your Next.js App

1. **Test the endpoint**: Visit `http://localhost:3000/api/test-upload-endpoint` (or your dev URL)
   - This will show you which URLs are accessible

2. **Try uploading a file** from your app
   - Go to `/about-consultancy-firm`
   - Select a PDF/DOC file
   - Click "Upload Document"

---

## 🚨 Common Issues

### Issue 1: Still Getting 404

**Solution:**
- Double-check the file is in the **root directory** (where index.html is)
- Verify the filename is exactly `upload.php` (case-sensitive)
- Try accessing `http://rif-ii.org/upload.php` (without https) to rule out SSL issues

### Issue 2: 403 Forbidden

**Solution:**
- Check file permissions (should be 644 or 755)
- Check directory permissions
- Contact your hosting provider

### Issue 3: 500 Internal Server Error

**Solution:**
- Check PHP error logs
- Make sure PHP is enabled on your server
- Verify the file doesn't have syntax errors (you can test by viewing it)

### Issue 4: File Uploads but Can't Save

**Solution:**
- Check if `test/` directory exists
- Verify `test/` directory permissions (should be 755)
- Check PHP upload limits in php.ini

---

## 📋 Quick Checklist

- [ ] `upload.php` is in the website **root directory** (public_html, www, etc.)
- [ ] File is named exactly `upload.php` (lowercase)
- [ ] File permissions are set to **644** or **755**
- [ ] `test/` directory exists in the root
- [ ] `test/` directory permissions are **755**
- [ ] Visiting `https://rif-ii.org/upload.php` shows JSON (not 404)
- [ ] Test endpoint `/api/test-upload-endpoint` shows accessible URLs

---

## 🧪 Diagnostic Tools

### Test Endpoint
Visit: `http://localhost:3000/api/test-upload-endpoint`

This will show you:
- Which URLs are accessible
- What status codes they return
- Detailed error messages

### Manual Test
Visit in browser: `https://rif-ii.org/upload.php`

**Expected:** JSON response with success message
**If 404:** File is not in the correct location

---

## 📞 Need More Help?

If you're still having issues:

1. **Check server logs** (error logs in cPanel)
2. **Test with a simple PHP file**:
   ```php
   <?php
   echo "PHP is working!";
   ?>
   ```
   Upload this as `test.php` and visit `https://rif-ii.org/test.php`

3. **Contact your hosting provider** - they can help verify:
   - Website root directory location
   - File permissions
   - PHP configuration

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ `https://rif-ii.org/upload.php` shows JSON (not 404)
- ✅ File uploads succeed from your Next.js app
- ✅ Files appear in `https://rif-ii.org/test/` directory
- ✅ No error messages in browser console

