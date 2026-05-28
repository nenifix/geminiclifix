# geminiclifix installer for Windows (PowerShell)
# Run as Administrator: .\install.ps1

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  GEMINICLIFIX INSTALLER" -ForegroundColor Cyan
Write-Host "  Google Gemini CLI on Telegram" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node --version 2>&1
    if ($nodeVersion -match 'v(\d+)\.') {
        $major = [int]$Matches[1]
        if ($major -ge 20) {
            Write-Host "[OK] Node.js $nodeVersion" -ForegroundColor Green
        } else {
            Write-Host "[ERROR] Node.js $nodeVersion found, but >= 20 is required." -ForegroundColor Red
            Update-Node
            return
        }
    }
} catch {
    Write-Host "[ERROR] Node.js not found." -ForegroundColor Red
    Write-Host "Install Node.js >= 20 from https://nodejs.org/"
    Read-Host "Press Enter to exit"
    exit 1
}

# Get script directory
$GEMINI_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path

# Clone or update
if (Test-Path "$GEMINI_DIR\.git") {
    Write-Host "[INFO] Updating existing repository..." -ForegroundColor Yellow
    Set-Location $GEMINI_DIR
    git pull 2>&1 | Out-Default
} else {
    Write-Host "[INFO] Cloning geminiclifix..." -ForegroundColor Yellow
    $PARENT_DIR = Split-Path -Parent $GEMINI_DIR
    Set-Location $PARENT_DIR
    git clone https://github.com/nenifix/geminiclifix.git 2>&1 | Out-Default
    if (-not (Test-Path "$GEMINI_DIR")) {
        Write-Host "[ERROR] Clone failed." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Set-Location $GEMINI_DIR
Write-Host "[INFO] Installing dependencies..." -ForegroundColor Yellow
npm install --production 2>&1 | Out-Default

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] npm install failed. Try: cd $GEMINI_DIR; npm install" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Build
Write-Host "[INFO] Building..." -ForegroundColor Yellow
npm run build 2>&1 | Out-Default

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Build failed. Try: cd $GEMINI_DIR; npm run build" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Create .env from .env.example if missing
if (-not (Test-Path "$GEMINI_DIR\.env")) {
    if (Test-Path "$GEMINI_DIR\.env.example") {
        Copy-Item "$GEMINI_DIR\.env.example" "$GEMINI_DIR\.env"
        Write-Host "[OK] Created .env from .env.example — please edit it with your credentials." -ForegroundColor Yellow
    } else {
        Write-Host "[WARN] No .env.example found. Create .env manually." -ForegroundColor Yellow
    }
} else {
    Write-Host "[OK] .env already exists." -ForegroundColor Green
}

# Make bin launcher executable (best effort on Windows)
$LAUNCHER = Join-Path $GEMINI_DIR "bin\geminiclifix"
if (Test-Path $LAUNCHER) {
    # On Windows/PowerShell, .sh launchers aren't directly executable,
    # but we note them for Git Bash users.
    Write-Host "[OK] Launcher found: $LAUNCHER" -ForegroundColor Green
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  INSTALLATION COMPLETE" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Run:"
Write-Host "  .\bin\geminiclifix    (Git Bash / MSYS)"
Write-Host "  npm start             (PowerShell / cmd)"
Write-Host "  node dist\index.js    (direct)"
Write-Host ""
Write-Host "Make sure your .env is configured with your credentials."
Write-Host ""
Write-Host "Developed by https://nenifix.com"
