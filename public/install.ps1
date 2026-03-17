# DevPortal Tunnel CLI Installer for Windows
# Usage: iwr https://devportal.stylnode.in/install.ps1 -useb | iex

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║         DevPortal Tunnel CLI Installer            ║" -ForegroundColor Blue
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

function Test-NodeInstalled {
    try {
        $nodeVersion = node -v 2>$null
        if ($nodeVersion) {
            $version = $nodeVersion -replace 'v', ''
            $major = [int]($version.Split('.')[0])
            if ($major -ge 18) {
                Write-Host "✓ Node.js $nodeVersion detected" -ForegroundColor Green
                return $true
            } else {
                Write-Host "⚠ Node.js $nodeVersion found, but v18+ is required" -ForegroundColor Yellow
                return $false
            }
        }
    } catch {
        Write-Host "⚠ Node.js not found" -ForegroundColor Yellow
        return $false
    }
    return $false
}

function Install-NodeJS {
    Write-Host "→ Installing Node.js..." -ForegroundColor Blue

    # Check if winget is available
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        Write-Host "  Using winget to install Node.js..." -ForegroundColor Gray
        winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
    }
    # Check if choco is available
    elseif (Get-Command choco -ErrorAction SilentlyContinue) {
        Write-Host "  Using Chocolatey to install Node.js..." -ForegroundColor Gray
        choco install nodejs-lts -y
    }
    # Check if scoop is available
    elseif (Get-Command scoop -ErrorAction SilentlyContinue) {
        Write-Host "  Using Scoop to install Node.js..." -ForegroundColor Gray
        scoop install nodejs-lts
    }
    else {
        Write-Host "✗ No package manager found (winget, choco, or scoop)" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install Node.js manually from:" -ForegroundColor Yellow
        Write-Host "  https://nodejs.org/en/download/" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Or install a package manager:" -ForegroundColor Yellow
        Write-Host "  - winget: Built into Windows 11 / Windows 10 (App Installer)" -ForegroundColor Gray
        Write-Host "  - choco: https://chocolatey.org/install" -ForegroundColor Gray
        Write-Host "  - scoop: https://scoop.sh" -ForegroundColor Gray
        exit 1
    }

    # Refresh PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

    Write-Host "✓ Node.js installed successfully" -ForegroundColor Green
}

function Install-DevPortalCLI {
    Write-Host "→ Installing devportal-tunnel..." -ForegroundColor Blue
    npm install -g devportal-tunnel
    Write-Host "✓ devportal-tunnel installed successfully" -ForegroundColor Green
}

# Main installation
function Main {
    if (-not (Test-NodeInstalled)) {
        Install-NodeJS
    }

    Install-DevPortalCLI

    Write-Host ""
    Write-Host "Installation complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Get started with:" -ForegroundColor White
    Write-Host "  devportal-tunnel start 3000    " -NoNewline -ForegroundColor Cyan
    Write-Host "# Expose port 3000" -ForegroundColor Gray
    Write-Host "  devportal-tunnel ls            " -NoNewline -ForegroundColor Cyan
    Write-Host "# List active tunnels" -ForegroundColor Gray
    Write-Host "  devportal-tunnel --help        " -NoNewline -ForegroundColor Cyan
    Write-Host "# Show all commands" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Documentation: https://devportal.stylnode.in/docs" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Note: You may need to restart your terminal for the command to be available." -ForegroundColor Yellow
}

Main
