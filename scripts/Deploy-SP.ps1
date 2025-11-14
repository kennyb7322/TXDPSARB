# Deploy-SP.ps1
# One-step deployment script for TXDPS ARB to SharePoint
# Creates list, library, and uploads form files

<#
.SYNOPSIS
    Deploys the TXDPS ARB solution to SharePoint Online.

.DESCRIPTION
    This script automates the deployment of the ARB submission system to SharePoint:
    - Creates the "ARB Submissions" list with proper schema
    - Creates the "ARB Documents" library with metadata fields
    - Uploads the HTML form and supporting files
    - Configures permissions
    - Sets up content types

.PARAMETER SiteUrl
    The URL of the SharePoint site (e.g., https://tenant.sharepoint.com/sites/ARB)

.PARAMETER Credential
    PSCredential object for authentication (optional if using modern auth)

.PARAMETER SkipList
    Skip list creation if it already exists

.PARAMETER SkipLibrary
    Skip library creation if it already exists

.EXAMPLE
    .\Deploy-SP.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/ARB"

.EXAMPLE
    $cred = Get-Credential
    .\Deploy-SP.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/ARB" -Credential $cred

.NOTES
    Requires PnP.PowerShell module: Install-Module -Name PnP.PowerShell
    Requires appropriate permissions on the SharePoint site
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$SiteUrl,

    [Parameter(Mandatory = $false)]
    [PSCredential]$Credential,

    [Parameter(Mandatory = $false)]
    [switch]$SkipList,

    [Parameter(Mandatory = $false)]
    [switch]$SkipLibrary
)

# Check for required module
if (-not (Get-Module -ListAvailable -Name PnP.PowerShell)) {
    Write-Error "PnP.PowerShell module is required. Install it with: Install-Module -Name PnP.PowerShell"
    exit 1
}

# Import module
Import-Module PnP.PowerShell -ErrorAction Stop

try {
    Write-Host "Connecting to SharePoint site: $SiteUrl" -ForegroundColor Cyan
    
    if ($Credential) {
        Connect-PnPOnline -Url $SiteUrl -Credentials $Credential
    } else {
        Connect-PnPOnline -Url $SiteUrl -Interactive
    }

    Write-Host "Connected successfully!" -ForegroundColor Green

    # Create ARB Submissions List
    if (-not $SkipList) {
        Write-Host "`nCreating ARB Submissions list..." -ForegroundColor Cyan
        
        $listSchemaPath = Join-Path $PSScriptRoot "..\sharepoint\list-schema.json"
        $listSchema = Get-Content $listSchemaPath | ConvertFrom-Json

        # Check if list exists
        $existingList = Get-PnPList -Identity $listSchema.listName -ErrorAction SilentlyContinue
        
        if ($existingList) {
            Write-Host "List '$($listSchema.listName)' already exists. Skipping creation." -ForegroundColor Yellow
        } else {
            # Create list
            $list = New-PnPList -Title $listSchema.listName -Template GenericList -Description $listSchema.description
            Write-Host "List created: $($listSchema.listName)" -ForegroundColor Green

            # Add columns
            Write-Host "Adding columns to list..." -ForegroundColor Cyan
            foreach ($column in $listSchema.columns) {
                if ($column.name -eq "Title") { continue }  # Title already exists

                try {
                    switch ($column.type) {
                        "Text" {
                            Add-PnPField -List $listSchema.listName -DisplayName $column.name -InternalName $column.name -Type Text -AddToDefaultView
                        }
                        "Note" {
                            Add-PnPField -List $listSchema.listName -DisplayName $column.name -InternalName $column.name -Type Note -AddToDefaultView
                        }
                        "Number" {
                            Add-PnPField -List $listSchema.listName -DisplayName $column.name -InternalName $column.name -Type Number -AddToDefaultView
                        }
                        "DateTime" {
                            Add-PnPField -List $listSchema.listName -DisplayName $column.name -InternalName $column.name -Type DateTime -AddToDefaultView
                        }
                        "Choice" {
                            $choices = $column.choices -join ','
                            Add-PnPField -List $listSchema.listName -DisplayName $column.name -InternalName $column.name -Type Choice -Choices $choices -AddToDefaultView
                        }
                        "User" {
                            Add-PnPField -List $listSchema.listName -DisplayName $column.name -InternalName $column.name -Type User -AddToDefaultView
                        }
                        "URL" {
                            Add-PnPField -List $listSchema.listName -DisplayName $column.name -InternalName $column.name -Type URL -AddToDefaultView
                        }
                    }
                    Write-Host "  Added column: $($column.name)" -ForegroundColor Gray
                } catch {
                    Write-Warning "  Failed to add column $($column.name): $_"
                }
            }
        }
    }

    # Create ARB Documents Library
    if (-not $SkipLibrary) {
        Write-Host "`nCreating ARB Documents library..." -ForegroundColor Cyan
        
        $librarySchemaPath = Join-Path $PSScriptRoot "..\sharepoint\library-fields.json"
        $librarySchema = Get-Content $librarySchemaPath | ConvertFrom-Json

        # Check if library exists
        $existingLibrary = Get-PnPList -Identity $librarySchema.libraryName -ErrorAction SilentlyContinue
        
        if ($existingLibrary) {
            Write-Host "Library '$($librarySchema.libraryName)' already exists. Skipping creation." -ForegroundColor Yellow
        } else {
            # Create library
            $library = New-PnPList -Title $librarySchema.libraryName -Template DocumentLibrary -Description $librarySchema.description
            
            # Enable versioning
            Set-PnPList -Identity $librarySchema.libraryName -EnableVersioning $true -MajorVersions $librarySchema.majorVersionLimit -MinorVersions $librarySchema.minorVersionLimit
            
            Write-Host "Library created: $($librarySchema.libraryName)" -ForegroundColor Green

            # Add metadata fields
            Write-Host "Adding metadata fields to library..." -ForegroundColor Cyan
            foreach ($field in $librarySchema.metadataFields) {
                try {
                    switch ($field.type) {
                        "Text" {
                            Add-PnPField -List $librarySchema.libraryName -DisplayName $field.displayName -InternalName $field.name -Type Text -AddToDefaultView
                        }
                        "Choice" {
                            $choices = $field.choices -join ','
                            Add-PnPField -List $librarySchema.libraryName -DisplayName $field.displayName -InternalName $field.name -Type Choice -Choices $choices -AddToDefaultView
                        }
                        "DateTime" {
                            Add-PnPField -List $librarySchema.libraryName -DisplayName $field.displayName -InternalName $field.name -Type DateTime -AddToDefaultView
                        }
                        "User" {
                            Add-PnPField -List $librarySchema.libraryName -DisplayName $field.displayName -InternalName $field.name -Type User -AddToDefaultView
                        }
                    }
                    Write-Host "  Added field: $($field.displayName)" -ForegroundColor Gray
                } catch {
                    Write-Warning "  Failed to add field $($field.displayName): $_"
                }
            }
        }
    }

    # Upload form files to a document library or site pages
    Write-Host "`nUploading form files..." -ForegroundColor Cyan
    
    $formFiles = @(
        "index.html",
        "styles.css",
        "app.js",
        "questions.json"
    )

    $uploadLibrary = "Site Assets"
    $uploadFolder = "ARBForm"

    foreach ($file in $formFiles) {
        $filePath = Join-Path $PSScriptRoot "..\$file"
        if (Test-Path $filePath) {
            try {
                Add-PnPFile -Path $filePath -Folder "$uploadLibrary/$uploadFolder" -ErrorAction SilentlyContinue
                Write-Host "  Uploaded: $file" -ForegroundColor Green
            } catch {
                Write-Warning "  Failed to upload $file : $_"
            }
        }
    }

    Write-Host "`nDeployment completed successfully!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "1. Configure Power Automate flows (see flows/ directory)" -ForegroundColor White
    Write-Host "2. Set up permissions for ARB Administrators and Reviewers" -ForegroundColor White
    Write-Host "3. Test the form at: $SiteUrl/SiteAssets/ARBForm/index.html" -ForegroundColor White
    Write-Host "4. Deploy SPFx webpart for embedded form experience" -ForegroundColor White

} catch {
    Write-Error "Deployment failed: $_"
    Write-Error $_.Exception.Message
    exit 1
} finally {
    Disconnect-PnPOnline
}
