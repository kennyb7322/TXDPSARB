<# 
Uploads and tags supporting documents to the TXDPS-ARB library using a CSV mapping.
CSV columns: FilePath, Domain, Tags
#>
param(
  [Parameter(Mandatory=$true)][string]$SiteUrl,
  [Parameter(Mandatory=$true)][string]$CsvPath,
  [string]$Library = "TXDPS-ARB"
)
Connect-PnPOnline -Url $SiteUrl -Interactive

# Ensure metadata fields
$fields = Get-Content (Join-Path (Split-Path $MyInvocation.MyCommand.Path) "..\sharepoint\library-fields.json") | ConvertFrom-Json
foreach($field in $fields.Fields){
  $exists = Get-PnPField -List $Library -Identity $field.InternalName -ErrorAction SilentlyContinue
  if(-not $exists){
    if($field.Type -eq "Choice"){
      Add-PnPField -List $Library -DisplayName $field.DisplayName -InternalName $field.InternalName -Type Choice -Choices $field.Choices | Out-Null
    } elseif($field.Type -eq "Note"){
      Add-PnPField -List $Library -DisplayName $field.DisplayName -InternalName $field.InternalName -Type Note | Out-Null
    }
  }
}

$rows = Import-Csv $CsvPath
foreach($row in $rows){
  $serverRelUrl = "/$Library"
  $folderServerRelUrl = $serverRelUrl
  Ensure-PnPFolder -SiteRelativePath $folderServerRelUrl | Out-Null
  $file = Add-PnPFile -Path $row.FilePath -Folder $folderServerRelUrl
  if($file){
    Set-PnPListItem -List $Library -Identity $file.ListItemAllFields.Id -Values @{
      Domain = $row.Domain
      Tags = $row.Tags
    } | Out-Null
    Write-Host "Uploaded and tagged $($row.FilePath)"
  }
}
