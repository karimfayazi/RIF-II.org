# Debug Upload Issues - Step by Step Guide

## 🚨 **Current Issue: Remote Upload Failed**

Based on my analysis, the issue is likely one of these:

### **1. SSL/TLS Certificate Problem**
- ✅ **Confirmed**: rif-ii.org has SSL certificate issues
- 🔧 **Solution**: Added HTTP fallback methods

### **2. Missing Upload Script**
- ❌ **Likely**: No upload.php file on server
- 🔧 **Solution**: Upload the PHP script via Plesk

### **3. Server Configuration Issues**
- ❓ **Possible**: CORS, PHP settings, or permissions
- 🔧 **Solution**: Check server logs and configuration

---

## 🔍 **Debug Steps**

### **Step 1: Test Server Connectivity**
1. **Go to**: `http://localhost:3001/api/test-server`
2. **This will test**:
   - HTTPS connection to rif-ii.org
   - HTTP fallback connection
   - Server response details
   - SSL certificate status

### **Step 2: Check Upload Endpoint**
1. **Visit**: `https://rif-ii.org/upload.php`
2. **Expected**: JSON response with "success": true
3. **If 404**: Upload script not uploaded
4. **If SSL error**: Use HTTP: `http://rif-ii.org/upload.php`

### **Step 3: Check Console Logs**
1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Try uploading** a document
4. **Look for detailed error logs** I added

### **Step 4: Check Network Tab**
1. **Open DevTools → Network tab**
2. **Try uploading** a document
3. **Look for failed requests** to rif-ii.org
4. **Check response details**

---

## 🛠️ **Enhanced Debugging Features**

### **Added to API:**
- ✅ **Detailed logging** for each upload attempt
- ✅ **HTTP fallback** methods (bypasses SSL issues)
- ✅ **Multiple endpoint testing**
- ✅ **Error details** with status codes
- ✅ **Response content** logging

### **Test Endpoint:**
- 🧪 **New endpoint**: `/api/test-server`
- 🔍 **Tests connectivity** to rif-ii.org
- 📊 **Shows detailed results**

---

## 📋 **Troubleshooting Checklist**

### **Server Issues:**
- [ ] Upload.php file exists on server
- [ ] File is in correct location (httpdocs/)
- [ ] Test directory exists and is writable
- [ ] PHP is enabled on server
- [ ] CORS headers are configured

### **SSL/Certificate Issues:**
- [ ] HTTPS connection works
- [ ] HTTP fallback works
- [ ] Certificate is valid
- [ ] Server accepts connections

### **File Upload Issues:**
- [ ] File size under 10MB
- [ ] File type is PDF/DOC/DOCX
- [ ] FormData is properly formatted
- [ ] Server accepts POST requests

---

## 🚀 **Quick Fixes**

### **Fix 1: Upload Script Missing**
```bash
# Upload simple-upload.php to rif-ii.org as upload.php
# Location: httpdocs/upload.php
```

### **Fix 2: SSL Certificate Issues**
```javascript
// API now tries HTTP fallback automatically
// Check: http://rif-ii.org/upload.php
```

### **Fix 3: CORS Issues**
```php
// Upload script includes CORS headers
header('Access-Control-Allow-Origin: *');
```

---

## 🔍 **Debugging Commands**

### **Test Server Connectivity:**
```
Visit: http://localhost:3001/api/test-server
```

### **Test Upload Endpoint:**
```
Visit: https://rif-ii.org/upload.php
Or: http://rif-ii.org/upload.php
```

### **Check Console Logs:**
```
1. Open DevTools (F12)
2. Go to Console tab
3. Try uploading document
4. Look for detailed error messages
```

---

## 📞 **Next Steps**

1. **Run the test endpoint** to check connectivity
2. **Check if upload.php exists** on your server
3. **Upload the PHP script** if missing
4. **Try the upload again** with enhanced debugging
5. **Share the console logs** if still failing

The enhanced debugging will show exactly what's failing! 🎯
