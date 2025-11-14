# Upload-Docs.ps1
# Bulk upload and tag documents to ARB Documents library from CSV

<#
.SYNOPSIS
    Bulk uploads documents to the ARB Documents library with metadata tagging.

.DESCRIPTION
    This script reads a CSV file containing document information and uploads files
    to the SharePoint ARB Documents library, applying appropriate metadata tags
    for Domain, Document Type, and other fields.

.PARAMETER SiteUrl
    The URL of the SharePoint site

.PARAMETER CsvPath
    Path to the CSV file containing document information

.PARAMETER DocumentsFolder
    Local folder containing the documents to upload

.PARAMETER Credential
    PSCredential object for authentication (optional)

.EXAMPLE
    .\Upload-Docs.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/ARB" -CsvPath ".\documents.csv" -DocumentsFolder ".\docs"

.NOTES
    CSV Format:
    FileName,DocumentType,Domain,RelatedSubmissionID,Confidentiality,Tags
    "arch-diagram.pdf","Architecture Diagram","Technical Architecture","ARB-2024-001","Internal","Cloud,Architecture"
    "business-case.docx","Business Case","Business Value","ARB-2024-001","Confidential","High Priority"

    Requires PnP.PowerShell module
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$SiteUrl,

    [Parameter(Mandatory = $true)]
    [ValidateScript({ Test-Path $_ })]
    [string]$CsvPath,

    [Parameter(Mandatory = $true)]
    [ValidateScript({ Test-Path $_ })]
    [string]$DocumentsFolder,

    [Parameter(Mandatory = $false)]
    [PSCredential]$Credential
)

# Check for required module
if (-not (Get-Module -ListAvailable -Name PnP.PowerShell)) {
    Write-Error "PnP.PowerShell module is required. Install it with: Install-Module -Name PnP.PowerShell"
    exit 1
}

Import-Module PnP.PowerShell -ErrorAction Stop

try {
    Write-Host "Connecting to SharePoint site: $SiteUrl" -ForegroundColor Cyan
    
    if ($Credential) {
        Connect-PnPOnline -Url $SiteUrl -Credentials $Credential
    } else {
        Connect-PnPOnline -Url $SiteUrl -Interactive
    }

    Write-Host "Connected successfully!" -ForegroundColor Green

    # Read CSV
    Write-Host "`nReading document list from CSV..." -ForegroundColor Cyan
    $documents = Import-Csv -Path $CsvPath

    Write-Host "Found $($documents.Count) documents to upload`n" -ForegroundColor Green

    $libraryName = "ARB Documents"
    $successCount = 0
    $failCount = 0

    # Process each document
    foreach ($doc in $documents) {
        $fileName = $doc.FileName
        $filePath = Join-Path $DocumentsFolder $fileName

        Write-Host "Processing: $fileName" -ForegroundColor White

        if (-not (Test-Path $filePath)) {
            Write-Warning "  File not found: $filePath"
            $failCount++
            continue
        }

        try {
            # Upload file
            $uploadedFile = Add-PnPFile -Path $filePath -Folder $libraryName

            # Prepare metadata
            $metadata = @{}

            if ($doc.DocumentType) {
                $metadata["DocumentType"] = $doc.DocumentType
            }

            if ($doc.Domain) {
                # Handle multiple domains (semicolon separated)
                $domains = $doc.Domain -split ';' | ForEach-Object { $_.Trim() }
                $metadata["Domain"] = $domains
            }

            if ($doc.RelatedSubmissionID) {
                $metadata["RelatedSubmissionID"] = $doc.RelatedSubmissionID
            }

            if ($doc.Confidentiality) {
                $metadata["Confidentiality"] = $doc.Confidentiality
            }

            if ($doc.Tags) {
                $metadata["Keywords"] = $doc.Tags
            }

            if ($doc.ReviewStatus) {
                $metadata["ReviewStatus"] = $doc.ReviewStatus
            }

            if ($doc.Reviewer) {
                # Lookup user
                try {
                    $user = Get-PnPUser | Where-Object { $_.Title -eq $doc.Reviewer -or $_.Email -eq $doc.Reviewer } | Select-Object -First 1
                    if ($user) {
                        $metadata["Reviewer"] = $user.Id
                    }
                } catch {
                    Write-Warning "  Could not find user: $($doc.Reviewer)"
                }
            }

            if ($doc.Version) {
                $metadata["Version"] = $doc.Version
            }

            # Set metadata
            if ($metadata.Count -gt 0) {
                Set-PnPListItem -List $libraryName -Identity $uploadedFile.ListItemAllFields.Id -Values $metadata -ErrorAction Stop
                Write-Host "  Uploaded and tagged successfully" -ForegroundColor Green
            } else {
                Write-Host "  Uploaded (no metadata applied)" -ForegroundColor Yellow
            }

            $successCount++

        } catch {
            Write-Error "  Failed to upload $fileName : $_"
            $failCount++
        }
    }

    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Upload Summary:" -ForegroundColor Cyan
    Write-Host "  Total documents: $($documents.Count)" -ForegroundColor White
    Write-Host "  Successful: $successCount" -ForegroundColor Green
    Write-Host "  Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "White" })
    Write-Host "========================================`n" -ForegroundColor Cyan

} catch {
    Write-Error "Upload process failed: $_"
    Write-Error $_.Exception.Message
    exit 1
} finally {
    Disconnect-PnPOnline
}

# Sample CSV content for reference
$sampleCsv = @"
# Sample documents.csv format:
# FileName,DocumentType,Domain,RelatedSubmissionID,Confidentiality,Tags,ReviewStatus,Reviewer,Version
# architecture-diagram.pdf,Architecture Diagram,Technical Architecture,ARB-2024-001,Internal,Cloud;Architecture,Pending Review,john.doe@dps.texas.gov,1.0
# business-case.docx,Business Case,Business Value,ARB-2024-001,Confidential,High Priority;Strategic,Approved,jane.smith@dps.texas.gov,2.0
# security-analysis.pdf,Security Analysis,Security & Compliance,ARB-2024-002,Restricted,CJIS;Security,Under Review,bob.wilson@dps.texas.gov,1.1
"@

Write-Host "`nSample CSV format saved to: documents-sample.csv" -ForegroundColor Cyan
$sampleCsv | Out-File -FilePath (Join-Path $PSScriptRoot "documents-sample.csv") -Force
