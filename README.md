# TXDPS ARB – Complete Package

This package contains a **fully interactive HTML5 responsive solution** for the **Texas Department of Public Safety (TXDPS) Architecture Review Board (ARB)**.

## What’s Included
- **index.html / styles.css / app.js** – Interactive, responsive ARB form with progress bar, breadcrumbs, branching, tooltips, dashboard, and exports.
- **assets/** – TXDPS logos for branding.
- **questions.json** – Schema that drives sections and questions (easily editable).
- **docs/** – Mocked full documentation, domain definitions, Microsoft Forms import document.
- **scripts/** – PowerShell scripts for SharePoint Online deployment and document tagging.
- **sharepoint/** – List & library metadata schema files.
- **flows/** – Power Automate flow templates for intake and lifecycle automation.
- **spfx/** – Minimal SPFx web part to host the form inside modern SharePoint pages.
- **powerbi/** – PBIDS connection and instructions for building a TXDPS ARB dashboard.
- **vendor/** – Place `xlsx.full.min.js` here to enable direct Excel (.xlsx) export from the browser (falls back to CSV if not present).

## Quick Start
1. Unzip to a working folder.
2. Deploy to SharePoint:
   ```powershell
   # Requires PnP.PowerShell
   ./scripts/Deploy-SP.ps1 -SiteUrl "https://<tenant>.sharepoint.com/sites/TXDPS" -Folder "<unzipped-folder>"
   ```
3. Open `/TXDPS-ARB/index.html` in the site to use the interactive form.
4. (Optional) Import Power Automate flows from `flows/` and fix connector references.
5. (Optional) Add the SPFx web part (`spfx/`) to host the form on a modern page.
6. (Optional) Open `powerbi/TXDPS_ARB.pbids` with Power BI Desktop and build visuals.

## Microsoft Forms
- Open **Microsoft Forms** → **Quick import** → upload `docs/Forms-Import.docx`.
- After import, configure **Branching** in Forms to skip sections based on answers (mirror the `branch` logic in `questions.json`).

## Exports
- **JSON** (always) – canonical export for Power Automate / SharePoint.
- **CSV** – compatible with Excel and flows.
- **XLSX** – enabled when `vendor/xlsx.full.min.js` is added.

## Notes
- All code is client-side and can be embedded in a SharePoint library.
- The design avoids external CDN dependencies for offline operation and security.
- Power Automate templates include onboarding/offboarding role-change automation placeholders.

© TXDPS Information Technology
