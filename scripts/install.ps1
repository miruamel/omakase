#!/usr/bin/env bash
# Omakase PowerShell installer for Windows
# Usage: iwr -useb https://raw.githubusercontent.com/miruamel/omakase/main/scripts/install.ps1 | iex

$ErrorActionPreference = 'Stop'

$Repo = 'miruamel/omakase'
$BinaryName = 'omakase.exe'
$InstallDir = if ($env:OMAKASE_INSTALL_DIR) { $env:OMAKASE_INSTALL_DIR } else { "$env:LOCALAPPDATA\omakase\bin" }

Write-Host 'Fetching latest version...' -ForegroundColor Cyan
$Release = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/latest"
$Version = $Release.tag_name -replace '^v', ''

Write-Host "Latest version: v$Version" -ForegroundColor Green

$DownloadUrl = "https://github.com/$Repo/releases/download/v$Version/$BinaryName"

Write-Host "Downloading from $DownloadUrl..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
Invoke-WebRequest -Uri $DownloadUrl -OutFile "$InstallDir\$BinaryName"

Write-Host "Installed to $InstallDir\$BinaryName" -ForegroundColor Green

# Add to PATH if not already
$CurrentPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($CurrentPath -notlike "*$InstallDir*") {
    Write-Host "Adding $InstallDir to PATH..." -ForegroundColor Yellow
    [Environment]::SetEnvironmentVariable('Path', "$CurrentPath;$InstallDir", 'User')
    $env:Path = "$env:Path;$InstallDir"
}

Write-Host ''
Write-Host "Omakase v$Version installed successfully!" -ForegroundColor Green
Write-Host ''
Write-Host 'Next steps:'
Write-Host '  1. Set your API key: $env:ANTHROPIC_API_KEY="sk-ant-..."'
Write-Host '  2. Run: omakase'
