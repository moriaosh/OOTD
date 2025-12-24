# Installing mkcert on Windows (Without Admin Rights)

## Option 1: Direct Download (Recommended - No Admin Required)

1. **Download mkcert:**
   - Go to: https://github.com/FiloSottile/mkcert/releases/latest
   - Download: `mkcert-v1.4.4-windows-amd64.exe` (or latest version)
   - Rename it to `mkcert.exe`

2. **Add to PATH (Optional but Recommended):**
   - Create a folder like `C:\Users\YourName\bin` (or any folder you prefer)
   - Move `mkcert.exe` to that folder
   - Add that folder to your PATH:
     - Press `Win + X` → System → Advanced system settings
     - Click "Environment Variables"
     - Under "User variables", find "Path" and click "Edit"
     - Click "New" and add your folder path (e.g., `C:\Users\YourName\bin`)
     - Click OK on all dialogs

3. **Or use directly:**
   - Place `mkcert.exe` in your project folder
   - Use it with: `.\mkcert.exe` instead of `mkcert`

## Option 2: Using Chocolatey (Requires Admin)

If you have admin rights, open PowerShell as Administrator and run:
```powershell
choco install mkcert -y
```

## Option 3: Using Scoop (No Admin Required)

If you have Scoop installed:
```powershell
scoop install mkcert
```

## After Installation

1. **Install the root certificate:**
   ```powershell
   mkcert -install
   ```
   (This step requires admin rights, but only needs to be done once)

2. **Generate certificates for localhost:**
   ```powershell
   cd OOTD\backend
   mkcert localhost 127.0.0.1
   ```

   This creates:
   - `localhost.pem` (certificate)
   - `localhost-key.pem` (private key)

3. **You're done!** The certificates are ready to use.

## Quick Setup Script

If you downloaded mkcert.exe to your project folder:

```powershell
cd OOTD\backend
.\mkcert.exe -install
.\mkcert.exe localhost 127.0.0.1
```

Note: The `-install` step will prompt for admin rights. Click "Yes" when Windows asks.


