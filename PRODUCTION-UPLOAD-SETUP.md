# Production Upload Setup Guide

## Current Issue
Your production server at `http://localhost:3001/about-consultancy-firm` cannot upload images to `https://rif-ii.org/test/` because the remote server doesn't have an upload endpoint configured.

## ✅ Solution: Set Up Upload Script on rif-ii.org

### Step 1: Upload the PHP Script
1. **Download** the file `rif-ii-org-upload-script.php` from your project
2. **Rename** it to `upload.php`
3. **Upload** it to the **root directory** of your rif-ii.org website
   - Final location: `https://rif-ii.org/upload.php`

### Step 2: Create and Configure Test Directory
```bash
# SSH into your rif-ii.org server and run:
mkdir -p /path/to/website/test
chmod 755 /path/to/website/test
chown www-data:www-data /path/to/website/test
```

Or via cPanel/File Manager:
1. Create folder named `test` in your website root
2. Set permissions to 755

### Step 3: Test the Setup
1. **Visit**: `https://rif-ii.org/upload.php`
2. **Should show**: JSON response with "Upload endpoint ready"
3. **Check**: Directory status and permissions

### Step 4: Test Upload from Your App
1. **Go to**: `http://localhost:3001/about-consultancy-firm`
2. **Select an image** and click "Upload Image"
3. **Should see**: "✅ Image uploaded successfully to rif-ii.org! 🌐 Direct upload successful!"

## 🔧 Alternative Solutions

### Option 1: Manual Upload (Current Workaround)
- Upload saves locally first
- Download from local URL
- Manually upload to rif-ii.org/test/
- Works immediately while setting up server

### Option 2: FTP Upload (Advanced)
Add to your `.env.local`:
```
RIF_FTP_HOST=ftp.rif-ii.org
RIF_FTP_USER=your_username
RIF_FTP_PASS=your_password
```

### Option 3: Use Different Upload Service
- Cloudinary
- AWS S3
- Google Cloud Storage
- Imgur API

## 🚨 Troubleshooting

### Common Issues:

**1. 404 Not Found on upload.php**
- File not uploaded to correct location
- Should be in website root, not in /test/ folder

**2. 403 Forbidden**
- Directory permissions issue
- Run: `chmod 755 /path/to/website/test`

**3. CORS Errors**
- Upload script includes CORS headers
- Check server configuration

**4. File Not Saving**
- Directory not writable
- Run: `chown www-data:www-data /path/to/website/test`

### Debug Steps:
1. **Test endpoint**: Visit `https://rif-ii.org/upload.php`
2. **Check logs**: Look at server error logs
3. **Test permissions**: Try creating a file in /test/ directory
4. **Verify PHP**: Ensure PHP is enabled and working

## 📋 Quick Setup Checklist

- [ ] Upload `upload.php` to rif-ii.org root directory
- [ ] Create `/test/` directory
- [ ] Set directory permissions (755)
- [ ] Test endpoint at `https://rif-ii.org/upload.php`
- [ ] Test upload from your app
- [ ] Verify image appears at `https://rif-ii.org/test/filename.jpg`

## 🎯 Expected Results

**Before Setup:**
- ❌ "All upload methods failed"
- 💾 Files save locally only
- 📝 Manual upload instructions

**After Setup:**
- ✅ "Image uploaded successfully to rif-ii.org!"
- 🌐 "Direct upload successful!"
- 🖼️ Image accessible at `https://rif-ii.org/test/filename.jpg`

## 📞 Support

If you need help with server access or setup:
1. Contact your hosting provider
2. Request PHP file upload permissions
3. Ask for directory creation assistance
4. Verify server supports file uploads

The updated code now includes:
- ✅ Better error logging
- ✅ Multiple upload methods
- ✅ Production URL detection
- ✅ Enhanced debugging
- ✅ Improved user feedback
