# PowerShell Deployment Script for Windows Plesk
# Run this script to prepare files for deployment

Write-Host "Preparing Next.js application for deployment..." -ForegroundColor Green

# Step 1: Clean previous builds
Write-Host "Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
}

# Step 2: Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Step 3: Build the application
Write-Host "Building application..." -ForegroundColor Yellow
npm run build

# Step 4: Create deployment package
Write-Host "Creating deployment package..." -ForegroundColor Yellow
$deployFolder = "deploy"
if (Test-Path $deployFolder) {
    Remove-Item -Recurse -Force $deployFolder
}
New-Item -ItemType Directory -Path $deployFolder | Out-Null

# Copy necessary files
Write-Host "Copying files..." -ForegroundColor Yellow
Copy-Item -Recurse ".next" "$deployFolder\.next"
Copy-Item -Recurse "public" "$deployFolder\public"
Copy-Item "package.json" "$deployFolder\"
Copy-Item "package-lock.json" "$deployFolder\" -ErrorAction SilentlyContinue
Copy-Item "next.config.js" "$deployFolder\"
Copy-Item "server.js" "$deployFolder\"
Copy-Item "web.config" "$deployFolder\"
Copy-Item "tsconfig.json" "$deployFolder\" -ErrorAction SilentlyContinue
Copy-Item "tailwind.config.js" "$deployFolder\" -ErrorAction SilentlyContinue
Copy-Item "postcss.config.js" "$deployFolder\" -ErrorAction SilentlyContinue

# Create .gitignore for deploy folder
Set-Content "$deployFolder\.gitignore" "node_modules`n.env*"

Write-Host "`nDeployment package created in '$deployFolder' folder!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Upload contents of '$deployFolder' to your Plesk server" -ForegroundColor White
Write-Host "2. In Plesk, go to Node.js settings and configure:" -ForegroundColor White
Write-Host "   - Application startup file: server.js" -ForegroundColor White
Write-Host "   - Application root: httpdocs" -ForegroundColor White
Write-Host "3. Run 'npm install --production' on the server" -ForegroundColor White
Write-Host "4. Restart the Node.js application in Plesk" -ForegroundColor White

