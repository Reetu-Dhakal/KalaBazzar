$ErrorActionPreference = 'Stop'
$repo = $PSScriptRoot
$mongod = 'C:\mongodb\MongoDB\Server\8.3\bin\mongod.exe'
$dbPath = 'C:\mongodb\realdata'

function Test-Port([int]$port) {
  (Test-NetConnection -ComputerName localhost -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue)
}

# 1. MongoDB
$svc = Get-Service -Name 'MongoDB' -ErrorAction SilentlyContinue
if ($svc -and $svc.Status -eq 'Running') {
  Write-Host '[ok] MongoDB service already running'
} elseif (Test-Port 27017) {
  Write-Host '[ok] MongoDB already listening on 27017'
} else {
  if ($svc) {
    Write-Host '[..] Starting MongoDB service...'
    Start-Service -Name 'MongoDB'
  } else {
    Write-Host '[..] Starting portable mongod...'
    $log = Join-Path $env:TEMP 'opencode\mongod_real.log'
    if (-not (Test-Path $log)) { New-Item -ItemType Directory -Path (Split-Path $log) -Force | Out-Null }
    Start-Process -FilePath $mongod -ArgumentList "--dbpath `"$dbPath`" --port 27017 --bind_ip 127.0.0.1 --logpath `"$log`"" -WindowStyle Hidden
  }
  $deadline = (Get-Date).AddSeconds(20)
  while (-not (Test-Port 27017) -and (Get-Date) -lt $deadline) { Start-Sleep -Seconds 1 }
  if (-not (Test-Port 27017)) { throw 'MongoDB did not start within 20s' }
  Write-Host '[ok] MongoDB up on 27017'
}

# 2. Backend
if (Test-Port 5000) {
  Write-Host '[ok] Backend already running on 5000'
} else {
  Write-Host '[..] Starting backend...'
  Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', "npm run dev > `"$env:TEMP\opencode\backend.log`" 2>&1" -WorkingDirectory (Join-Path $repo 'backend') -WindowStyle Hidden
  $deadline = (Get-Date).AddSeconds(25)
  while (-not (Test-Port 5000) -and (Get-Date) -lt $deadline) { Start-Sleep -Seconds 1 }
  if (-not (Test-Port 5000)) { throw 'Backend did not start within 25s' }
  Write-Host '[ok] Backend up on 5000'
}

# 3. Frontend
if (Test-Port 5173) {
  Write-Host '[ok] Frontend already running on 5173'
} else {
  Write-Host '[..] Starting frontend...'
  Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', "npm run dev > `"$env:TEMP\opencode\frontend.log`" 2>&1" -WorkingDirectory (Join-Path $repo 'frontend') -WindowStyle Hidden
  $deadline = (Get-Date).AddSeconds(25)
  while (-not (Test-Port 5173) -and (Get-Date) -lt $deadline) { Start-Sleep -Seconds 1 }
  if (-not (Test-Port 5173)) { throw 'Frontend did not start within 25s' }
  Write-Host '[ok] Frontend up on 5173'
}

Write-Host ''
Write-Host 'All services running: http://localhost:5173'