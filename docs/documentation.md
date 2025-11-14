# TXDPS ARB – Product Documentation (Mocked)

This documentation explains how to use the **Texas Department of Public Safety (TXDPS) Architecture Review Board (ARB) Intake** tool.

## Purpose
- Collect solution intake details with **branching** so requestors only see relevant sections.
- Provide **progress tracking**, **tooltips**, **documentation**, and an **export** that feeds SharePoint, Microsoft Forms, Power Automate, and Power BI workflows.
- Enable **onboarding**, **offboarding**, and **existing user** change requests.

## Domains
The taxonomy is used to tag answers and documents:

- **D** – Design and Data Architecture  
- **E** – Engineering and Execution  
- **A** – Architecture and Application  
- **DD** – Development and DevOps  
- **O** – Operations Management  
- **N** – Network and Connectivity  
- **I** – Infrastructure Standards  
- **H** – Hardware and High Availability  
- **II** – Implementation and Integration  
- **G** – Governance and Compliance  
- **AI** – Administration and Identity Management  
- **R** – Reference Architecture and Documentation  
- **S** – Security (Cybersecurity)  
- **M** – Monitoring, Auditing, Metrics, and BI

## How it Works
1. Select the **Primary Solution Area** to tailor the form with relevant sections.
2. Use the **left Section list** or **breadcrumbs** to navigate. Progress updates as required fields are completed.
3. Add document names in **Attachments** to tag deliverables. Actual files live in SharePoint.
4. Use **Dashboard** to view completion and domain coverage.
5. Click **Submit & Export** to generate JSON/CSV/XLSX (if the local `vendor/xlsx.full.min.js` is provided). These exports can be captured by **Power Automate** or uploaded to SharePoint.

## Microsoft Forms Import
Use **docs/Forms-Import.docx** (included) with **Microsoft Forms → Quick import** to build an equivalent form. The document mirrors the question set and sections.

## SharePoint List & Library
Deployment scripts create:
- **List**: `ARB Submissions` (columns map to flattened question IDs)  
- **Library**: `TXDPS-ARB` for design docs.  
Power Automate moves exports and enriches items with taxonomy metadata.

## SPFx Web Part
An SPFx client-side web part is included under `spfx/` to host this form in modern SharePoint. Configure the **Form URL** property to the uploaded `index.html` of this package.

## Power BI
Open the provided `.pbids` file in Power BI Desktop. It points to the SharePoint list created by the scripts. A basic model and suggested measures are documented in `powerbi/PowerBI-Instructions.md`.

## Accessibility
- Semantic markup and ARIA roles.
- Keyboard focus maintained for documentation panel.
- High-contrast friendly palette.

## Security and Compliance
- No external network calls. All assets are local.
- Exports are generated client-side and can be routed through **Power Automate** for secure processing.
