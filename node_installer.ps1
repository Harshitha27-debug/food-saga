$ErrorActionPreference = 'Stop'
$ToolsDir = "c:\Users\bhuva\OneDrive\desktop\Food saga\.tools"
$ZipFile = "$ToolsDir\node.zip"
$TargetDir = "$ToolsDir\node-v20.15.0-win-x64"

if (!(Test-Path $ToolsDir)) {
    Write-Host "Creating tools directory: $ToolsDir"
    New-Item -ItemType Directory -Path $ToolsDir | Out-Null
}

if (!(Test-Path "$TargetDir\node.exe")) {
    Write-Host "Downloading Node.js..."
    try {
        Start-BitsTransfer -Source "https://nodejs.org/dist/v20.15.0/node-v20.15.0-win-x64.zip" -Destination $ZipFile
    } catch {
        Write-Host "BitsTransfer failed, trying Invoke-WebRequest..."
        Invoke-WebRequest -Uri "https://nodejs.org/dist/v20.15.0/node-v20.15.0-win-x64.zip" -OutFile $ZipFile
    }

    Write-Host "Extracting Node.js..."
    Expand-Archive -Path $ZipFile -DestinationPath $ToolsDir

    Write-Host "Cleaning up zip file..."
    Remove-Item $ZipFile -Force
    Write-Host "Node.js successfully installed at $TargetDir"
} else {
    Write-Host "Node.js is already installed at $TargetDir"
}
