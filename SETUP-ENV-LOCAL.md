# 🔧 Setup .env.local for Document Upload to rif-ii.org

## Goal
Upload files directly to: `https://rif-ii.org/Uploads/test/`

---

## Step 1: Find Your httpdocs Folder Path

You need to find where your `httpdocs` folder is located on your server.

**Common locations:**

### Windows Server:
- `C:\inetpub\wwwroot\httpdocs`
- `D:\inetpub\wwwroot\httpdocs`
- `C:\httpdocs`
- `C:\wamp\www\httpdocs` (if using WAMP)
- `C:\xampp\htdocs\httpdocs` (if using XAMPP)

### Linux Server:
- `/var/www/html/httpdocs`
- `/home/user/public_html/httpdocs`
- `/usr/share/nginx/html/httpdocs`

---

## Step 2: Create .env.local File

1. **Create a file named `.env.local`** in your Next.js project root
   - Location: Same folder as `package.json`
   - File name: Exactly `.env.local` (with the dot at the start)

2. **Add this line** (replace with your actual path):

```env
DOCUMENTS_UPLOAD_PATH=C:\path\to\httpdocs
```

**Examples:**

**Windows:**
```env
# If httpdocs is at C:\inetpub\wwwroot\httpdocs
DOCUMENTS_UPLOAD_PATH=C:\inetpub\wwwroot\httpdocs

# OR if httpdocs is at C:\httpdocs
DOCUMENTS_UPLOAD_PATH=C:\httpdocs
```

**Linux:**
```env
# If httpdocs is at /var/www/html/httpdocs
DOCUMENTS_UPLOAD_PATH=/var/www/html/httpdocs

# OR if httpdocs is at /home/user/public_html/httpdocs
DOCUMENTS_UPLOAD_PATH=/home/user/public_html/httpdocs
```

---

## Step 3: Important Notes

1. **Path should point to the `httpdocs` folder itself**, not to `httpdocs/Uploads/test/`
   - ✅ Correct: `DOCUMENTS_UPLOAD_PATH=C:\inetpub\wwwroot\httpdocs`
   - ❌ Wrong: `DOCUMENTS_UPLOAD_PATH=C:\inetpub\wwwroot\httpdocs\Uploads\test`

2. **The code will automatically create** `Uploads/test/` folder inside httpdocs

3. **No trailing slashes** - don't add `/` or `\` at the end

4. **Use forward slashes on Linux**, backslashes on Windows

---

## Step 4: Restart Your Server

**After creating/updating `.env.local`:**

1. **Stop** your Next.js dev server (Ctrl+C)
2. **Start** it again: `npm run dev`
3. Environment variables are only loaded when the server starts

---

## Step 5: Verify Setup

1. **Test the endpoint:**
   - Visit: `http://localhost:3000/api/upload-document` (GET request)
   - You should see:
     ```json
     {
       "configuration": {
         "uploadMethod": "external-server",
         "uploadPath": "C:\\path\\to\\httpdocs\\Uploads\\test",
         "fileUrl": "https://rif-ii.org/Uploads/test/"
       }
     }
     ```

2. **Upload a file:**
   - Go to `/about-consultancy-firm`
   - Upload a document
   - Check the success message - it should show the rif-ii.org URL

3. **Verify the file:**
   - Check if the file was created at: `[your-path]\httpdocs\Uploads\test\`
   - Visit: `https://rif-ii.org/Uploads/test/[filename]` in your browser

---

## Troubleshooting

### Issue: "Files still saving to public/uploads/test/"

**Solution:**
- Check that `.env.local` is in the project root (same folder as `package.json`)
- Make sure the file is named exactly `.env.local` (with the dot)
- Restart your Next.js server after creating/updating the file
- Check the path is correct (no typos)

### Issue: "Failed to save file" error

**Solution:**
- Verify the path exists: Check if `[DOCUMENTS_UPLOAD_PATH]` folder exists
- Check permissions: The Next.js server needs write access to that folder
- Create the folders manually: Create `httpdocs/Uploads/test/` folders if they don't exist
- Check the path format:
  - Windows: Use backslashes `C:\path\to\httpdocs`
  - Linux: Use forward slashes `/path/to/httpdocs`

### Issue: "Permission denied"

**Solution:**
- On Windows: Run your terminal/IDE as Administrator
- On Linux: Check folder permissions (should be readable/writable)
- Verify the Next.js server user has access to the folder

### Issue: Can't find httpdocs folder

**Solution:**
1. Check your server configuration
2. Look for where your website files are stored
3. Check IIS/Apache/Nginx configuration files
4. The folder might be named differently (like `www`, `public_html`, `htdocs`)

---

## Example .env.local File

Here's a complete example:

```env
# Document Upload Path
# Path to your httpdocs folder (where website files are stored)
DOCUMENTS_UPLOAD_PATH=C:\inetpub\wwwroot\httpdocs

# Your Next.js app will save files to:
# C:\inetpub\wwwroot\httpdocs\Uploads\test\
# 
# Files will be accessible at:
# https://rif-ii.org/Uploads/test/[filename]
```

---

## ✅ Success Checklist

- [ ] `.env.local` file created in project root
- [ ] `DOCUMENTS_UPLOAD_PATH` set to your httpdocs folder path
- [ ] Next.js server restarted after adding the variable
- [ ] Test endpoint shows `uploadMethod: "external-server"`
- [ ] Files are being saved to the correct location
- [ ] Files are accessible at `https://rif-ii.org/Uploads/test/`

---

## Need Help?

If you're still having issues:

1. **Check server logs** - Look for error messages
2. **Verify the path** - Make sure the folder exists
3. **Test permissions** - Try creating a file manually in that folder
4. **Check the test endpoint** - Visit `/api/upload-document` to see current configuration

