<# 
TXDPS ARB – SharePoint Online deployment script (requires PnP.PowerShell)
Steps:
1) Creates/ensures a document library `TXDPS-ARB`
2) Uploads static web files
3) Creates/ensures a SharePoint list `ARB Submissions` with required columns
4) Optionally provisions a modern page with the list and form webpart (SPFx)
#>

param(
  [Parameter(Mandatory=$true)][string]$SiteUrl,
  [string]$Folder = ".\TXDPS_ARB_Package"
)

Write-Host "Connecting to $SiteUrl ..." -ForegroundColor Cyan
Connect-PnPOnline -Url $SiteUrl -Interactive

# 1) Ensure library
$libTitle = "TXDPS-ARB"
try {
  $lib = Get-PnPList -Identity $libTitle -ErrorAction Stop
  Write-Host "Library $libTitle already exists."
} catch {
  Write-Host "Creating $libTitle library ..."
  Add-PnPList -Title $libTitle -Template DocumentLibrary | Out-Null
}

# 2) Upload files
$webRoot = Join-Path $Folder "."
$files = Get-ChildItem -Path $webRoot -Recurse -File | Where-Object { $_.FullName -notmatch "\\spfx\\" -and $_.FullName -notmatch "\\scripts\\" -and $_.FullName -notmatch "\\powerbi\\" -and $_.FullName -notmatch "\\flows\\" -and $_.FullName -notmatch "\\sharepoint\\" }
foreach($f in $files){
  $serverRel = $f.FullName.Replace($webRoot,"").Replace("\","/")
  $serverRelFolder = Split-Path $serverRel
  $folderServerRelUrl = "/$libTitle$serverRelFolder"
  Ensure-PnPFolder -SiteRelativePath $folderServerRelUrl | Out-Null
  Add-PnPFile -Path $f.FullName -Folder $folderServerRelUrl | Out-Null
  Write-Host "Uploaded $serverRel"
}

# 3) Create list and fields
$listTitle = "ARB Submissions"
try {
  $list = Get-PnPList -Identity $listTitle -ErrorAction Stop
  Write-Host "List $listTitle already exists."
} catch {
  Write-Host "Creating $listTitle list ..."
  Add-PnPList -Title $listTitle -Template GenericList | Out-Null
}

# Apply schema
$schemaPath = Join-Path $Folder "sharepoint\list-schema.json"
$schema = Get-Content $schemaPath | ConvertFrom-Json

foreach($field in $schema.Fields){
  $exists = Get-PnPField -List $listTitle -Identity $field.InternalName -ErrorAction SilentlyContinue
  if(-not $exists){
    switch ($field.Type) {
      "Text" { Add-PnPField -List $listTitle -DisplayName $field.DisplayName -InternalName $field.InternalName -Type Text | Out-Null }
      "Note" { Add-PnPField -List $listTitle -DisplayName $field.DisplayName -InternalName $field.InternalName -Type Note | Out-Null }
      "Boolean" { Add-PnPField -List $listTitle -DisplayName $field.DisplayName -InternalName $field.InternalName -Type Boolean | Out-Null }
      "User" { Add-PnPField -List $listTitle -DisplayName $field.DisplayName -InternalName $field.InternalName -Type User | Out-Null }
      "DateTime" { Add-PnPField -List $listTitle -DisplayName $field.DisplayName -InternalName $field.InternalName -Type DateTime | Out-Null }
      "Choice" { Add-PnPField -List $listTitle -DisplayName $field.DisplayName -InternalName $field.InternalName -Type Choice -AddToDefaultView -Choices $field.Choices | Out-Null }
    }
    Write-Host "Added field $($field.DisplayName)"
  }
}

Write-Host "Deployment complete. Upload location: $SiteUrl/$libTitle/index.html" -ForegroundColor Green
