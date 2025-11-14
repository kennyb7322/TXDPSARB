# TXDPS ARB Package

Complete Architecture Review Board (ARB) submission system for the Texas Department of Public Safety (TXDPS).

## Overview

The TXDPS ARB Package is a comprehensive solution for managing architecture review submissions. It includes a responsive web-based form, SharePoint integration, Power Automate workflows, SPFx web parts, and Power BI analytics.

## Features

- ✅ **Responsive Web Form**: Mobile-friendly, accessible ARB submission form
- ✅ **Dynamic Branching**: Smart question routing based on previous answers
- ✅ **Progress Tracking**: Visual progress bar and breadcrumb navigation
- ✅ **Multiple Export Formats**: PDF, Excel, and JSON exports
- ✅ **SharePoint Integration**: Automated list and library creation
- ✅ **Power Automate Workflows**: Intake, approval, and user lifecycle automation
- ✅ **SPFx Web Part**: Embeddable form for SharePoint pages
- ✅ **Power BI Dashboards**: Analytics and reporting capabilities
- ✅ **Accessibility**: WCAG 2.1 Level AA compliant
- ✅ **Security**: CJIS-compliant design with proper access controls

## Quick Start

### 1. Deploy to SharePoint

```powershell
# Navigate to scripts directory
cd scripts

# Run deployment script
.\Deploy-SP.ps1 -SiteUrl "https://yourtenant.sharepoint.com/sites/ARB"
```

This creates:
- "ARB Submissions" list with full schema
- "ARB Documents" library with metadata fields
- Uploads form files to Site Assets

### 2. Access the Form

After deployment, access the form at:
```
https://yourtenant.sharepoint.com/sites/ARB/SiteAssets/ARBForm/index.html
```

### 3. Configure Power Automate

1. Import flow definitions from `/flows/` directory
2. Configure connections (SharePoint, Office 365, Approvals)
3. Update tenant-specific URLs and email addresses
4. Test and activate flows

### 4. Set Up Power BI (Optional)

1. Open `powerbi/TXDPS_ARB.pbids` in Power BI Desktop
2. Connect to your SharePoint site
3. Create dashboards using provided templates
4. Publish to Power BI Service

## Project Structure

```
TXDPS_ARB_Package/
├── index.html                 # Main ARB form (responsive, accessible)
├── styles.css                 # Stylesheet with TXDPS branding
├── app.js                     # Form logic (branching, validation, exports)
├── questions.json             # Form schema with domains and branching rules
├── assets/
│   ├── LOGO.png              # TXDPS logo placeholder
│   └── LOGO2.png             # Secondary logo placeholder
├── docs/
│   ├── documentation.md      # Complete user documentation
│   ├── Domain-Definitions.md # Definitions for all TXDPS domains
│   ├── Metrics-Definitions.md # BI metrics and KPI definitions
│   └── Forms-Import.docx     # Microsoft Forms quick import template
├── vendor/
│   └── README.md             # Instructions for SheetJS library
├── sharepoint/
│   ├── list-schema.json      # "ARB Submissions" list columns
│   └── library-fields.json   # Document library metadata fields
├── scripts/
│   ├── Deploy-SP.ps1         # One-click SharePoint deployment
│   └── Upload-Docs.ps1       # Bulk document upload with tagging
├── flows/
│   ├── PowerAutomate_FlowDefinition.json    # Intake and approval workflow
│   ├── UserLifecycle_Automation.json        # Onboarding/offboarding automation
│   └── README.md                            # Flow documentation
├── spfx/
│   ├── src/webparts/arb/
│   │   ├── ArbWebPart.ts                    # SPFx web part code
│   │   └── ArbWebPart.manifest.json         # Web part manifest
│   ├── config/package-solution.json         # SPFx solution config
│   └── README.md                            # SPFx build instructions
├── powerbi/
│   ├── TXDPS_ARB.pbids                      # Power BI data source connection
│   └── PowerBI-Instructions.md              # Dashboard creation guide
└── README.md                                # This file
```

## Prerequisites

### Required
- SharePoint Online site
- Power Automate (included with M365)
- Modern web browser (Chrome, Edge, Firefox, Safari)

### Optional
- Power BI Desktop (for analytics)
- Node.js 14+ (for SPFx development)
- PowerShell 5.1+ with PnP.PowerShell module
- SheetJS library (for Excel export)

## Installation

### Option 1: Automated Deployment (Recommended)

```powershell
# Install PnP PowerShell (one-time)
Install-Module -Name PnP.PowerShell -Scope CurrentUser

# Run deployment
.\scripts\Deploy-SP.ps1 -SiteUrl "https://tenant.sharepoint.com/sites/ARB"
```

### Option 2: Manual Deployment

1. **Create SharePoint Lists**:
   - Use schemas in `/sharepoint/` directory
   - Manually create "ARB Submissions" list
   - Create "ARB Documents" library

2. **Upload Form Files**:
   - Upload `index.html`, `styles.css`, `app.js`, `questions.json`
   - Place in `SiteAssets/ARBForm/` folder

3. **Configure Permissions**:
   - Create security groups: ARB Administrators, ARB Reviewers
   - Set appropriate permissions on lists and libraries

4. **Import Flows**:
   - Use Power Automate portal
   - Import JSON definitions from `/flows/`
   - Configure all connections

## Configuration

### Customize Questions

Edit `questions.json` to modify form questions:

```json
{
  "id": "question_id",
  "type": "text|textarea|select|email|date",
  "label": "Question text",
  "help": "Help text",
  "required": true|false,
  "domain": "Domain Name",
  "options": [...],  // For select type
  "branches": [...]  // For conditional logic
}
```

### Customize Styling

Edit `styles.css` to match your branding:

```css
:root {
  --primary-color: #003f87;    /* TXDPS blue */
  --secondary-color: #c8102e;  /* TXDPS red */
  /* Adjust colors as needed */
}
```

### Configure Workflows

Update Power Automate flows:
1. Replace `[tenant]` with your tenant name
2. Update email addresses
3. Adjust approval routing
4. Customize notification templates

## Usage

### For Submitters

1. **Access Form**: Navigate to the ARB form URL
2. **Fill Information**: Complete all required fields
3. **Navigation**: Use Next/Previous buttons or breadcrumbs
4. **Review**: Check answers in the dashboard
5. **Submit**: Click Submit when ready
6. **Export**: Download your submission (PDF, Excel, JSON)

### For Reviewers

1. **Receive Notification**: Email alert for new submissions
2. **Review Submission**: Access via SharePoint list link
3. **Provide Feedback**: Use approval interface
4. **Approve/Reject**: Make decision with comments
5. **Track Status**: Monitor in SharePoint list views

### For Administrators

1. **Monitor Submissions**: Use SharePoint views
2. **Assign Reviewers**: Update "AssignedReviewer" field
3. **Generate Reports**: Use Power BI dashboards
4. **Manage Users**: Configure security groups
5. **Maintain System**: Update questions, workflows as needed

## Domains

The form organizes questions into these domains:

- **General Information**: Submitter details
- **Project Details**: Project scope and type
- **Technical Architecture**: Platform and technology
- **Security & Compliance**: Security requirements
- **Capacity Planning**: User load and performance
- **Financial**: Budget and funding
- **Timeline**: Schedule and milestones
- **Business Value**: Justification and benefits
- **Risk Management**: Risk identification and mitigation
- **Integration**: Dependencies and interfaces
- **Compliance**: Regulatory requirements
- **Data Management**: Data governance
- **Operations & Maintenance**: Support model
- **Testing & Quality Assurance**: Testing strategy

## Export Options

### PDF Export
- Uses browser print dialog
- Keyboard shortcut: Ctrl+P (Windows) or Cmd+P (Mac)
- Best for: Documentation, archival

### Excel Export
- Requires SheetJS library (`xlsx.full.min.js`)
- Place in `/vendor/` directory
- Best for: Data analysis, reporting

### JSON Export
- Native browser functionality
- No additional libraries required
- Best for: System integration, backup

## Security

### Authentication
- Integrated Windows Authentication
- Azure AD authentication
- Multi-factor authentication supported

### Authorization
- Role-based access control (RBAC)
- SharePoint security groups
- Item-level permissions

### Compliance
- CJIS compliance ready
- NIST framework alignment
- Data encryption (in transit and at rest)
- Audit logging

## Browser Support

### Fully Supported
- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+

### Limited Support
- IE 11 (basic functionality only)
- Older browser versions

## Accessibility

- WCAG 2.1 Level AA compliant
- Screen reader compatible (NVDA, JAWS)
- Keyboard navigation support
- High contrast mode
- Focus indicators
- ARIA labels and roles

## Troubleshooting

### Form Not Loading
```
1. Clear browser cache
2. Check JavaScript is enabled
3. Verify questions.json is valid
4. Review browser console for errors
```

### Submission Fails
```
1. Verify all required fields completed
2. Check SharePoint list permissions
3. Review Power Automate flow status
4. Check network connectivity
```

### Excel Export Not Working
```
1. Verify xlsx.full.min.js in vendor/ directory
2. Check browser console for errors
3. Try alternative export formats
```

## Development

### Prerequisites
```bash
# For SPFx development
npm install -g yo @microsoft/generator-sharepoint gulp

# For PowerShell scripts
Install-Module -Name PnP.PowerShell
```

### Build SPFx Web Part
```bash
cd spfx
npm install
gulp build
gulp bundle --ship
gulp package-solution --ship
```

### Test Locally
```bash
# Start local dev server
cd spfx
gulp serve
```

## Contributing

To contribute to this project:

1. Follow TXDPS coding standards
2. Test thoroughly before submitting
3. Document all changes
4. Submit pull requests for review

## Support

### Documentation
- User Guide: `/docs/documentation.md`
- Domain Definitions: `/docs/Domain-Definitions.md`
- Metrics Guide: `/docs/Metrics-Definitions.md`

### Contact
- IT Support: it-support@dps.texas.gov
- ARB Team: arb-support@dps.texas.gov
- Enterprise Architecture: enterprise-architecture@dps.texas.gov

## License

Copyright © 2024 Texas Department of Public Safety. All rights reserved.

This software is for internal TXDPS use only. Unauthorized distribution or use is prohibited.

## Version History

### Version 1.0 (2024)
- Initial release
- Core form functionality
- SharePoint integration
- Power Automate workflows
- SPFx web part
- Power BI integration
- Complete documentation

## Roadmap

### Planned Features
- [ ] Mobile app version
- [ ] Advanced analytics dashboard
- [ ] Integration with ITSM system
- [ ] Enhanced reporting capabilities
- [ ] AI-powered form assistance
- [ ] Multi-language support

## Acknowledgments

Developed by the TXDPS Enterprise Architecture Team in collaboration with:
- IT Infrastructure Team
- Security & Compliance Team
- Business Intelligence Team
- End users and stakeholders

---

**For the latest updates and information, visit the ARB SharePoint site.**