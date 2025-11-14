# SPFx Web Part for TXDPS ARB Form

This directory contains the SharePoint Framework (SPFx) web part that hosts the TXDPS ARB form in an iframe for embedded SharePoint page experience.

## Overview

The ARB Web Part provides a seamless way to embed the ARB submission form directly into SharePoint pages, allowing users to submit requests without navigating to a separate URL.

## Features

- **Iframe Embedding**: Hosts the ARB form in a secure iframe
- **Configurable**: Title and URL can be configured via web part properties
- **Responsive**: Adapts to different screen sizes
- **Themed**: Supports SharePoint themes
- **Teams Compatible**: Can be used in Microsoft Teams tabs

## Prerequisites

Before building and deploying the SPFx web part:

1. **Node.js** (v14 or v16 LTS)
   ```bash
   node --version
   ```

2. **SPFx Development Tools**
   ```bash
   npm install -g yo @microsoft/generator-sharepoint
   ```

3. **Gulp** (build tool)
   ```bash
   npm install -g gulp
   ```

## Project Structure

```
spfx/
├── src/
│   └── webparts/
│       └── arb/
│           ├── ArbWebPart.ts              # Main web part code
│           └── ArbWebPart.manifest.json   # Web part manifest
├── config/
│   └── package-solution.json              # Solution packaging config
└── README.md                              # This file
```

## Setup and Build

### Step 1: Initialize SPFx Project

If starting from scratch, initialize the project:

```bash
cd spfx
yo @microsoft/sharepoint
```

Answer prompts:
- Solution name: `txdps-arb-webpart`
- Target: SharePoint Online only
- Place files: Current folder
- Tenant admin: No
- Component type: Web Part
- Web part name: `ArbWebPart`
- Description: `TXDPS ARB Form`
- Framework: No framework

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Build the Solution

```bash
# Development build
gulp build

# Production build
gulp bundle --ship
gulp package-solution --ship
```

The `.sppkg` file will be created in `sharepoint/solution/` directory.

## Deployment

### Option 1: App Catalog Deployment (Recommended)

1. **Upload to App Catalog**
   ```
   1. Go to your SharePoint Admin Center
   2. Navigate to "More features" → "Apps" → "Open"
   3. Click "App Catalog"
   4. Select "Apps for SharePoint"
   5. Upload the .sppkg file from sharepoint/solution/
   6. Check "Make this solution available to all sites"
   7. Click "Deploy"
   ```

2. **Add to Site**
   ```
   1. Go to target SharePoint site
   2. Site Contents → New → App
   3. Find "TXDPS ARB Form"
   4. Click "Add"
   ```

3. **Add Web Part to Page**
   ```
   1. Edit a SharePoint page
   2. Click + to add a web part
   3. Search for "TXDPS ARB"
   4. Add the web part to the page
   5. Configure properties if needed
   6. Publish the page
   ```

### Option 2: Tenant-Wide Deployment

```bash
# Using PnP PowerShell
Connect-PnPOnline -Url https://tenant-admin.sharepoint.com -Interactive

# Deploy to tenant
Add-PnPApp -Path "./sharepoint/solution/txdps-arb-webpart.sppkg" -Scope Tenant -Publish -SkipFeatureDeployment

# Install on specific site
Install-PnPApp -Identity "txdps-arb-webpart" -Scope Tenant
```

## Configuration

### Web Part Properties

The web part exposes two configurable properties:

1. **Title** (String)
   - Display name for the web part header
   - Default: "TXDPS ARB Submission Form"

2. **Form URL** (String)
   - Full URL to the ARB form
   - Default: `{siteUrl}/SiteAssets/ARBForm/index.html`
   - Example: `https://tenant.sharepoint.com/sites/ARB/SiteAssets/ARBForm/index.html`

### To Configure:

1. Edit the page containing the web part
2. Click the edit icon on the web part
3. Configure properties in the property pane
4. Save and publish

## Development

### Local Testing (Workbench)

```bash
# Start local server
gulp serve

# Opens browser to https://localhost:4321/temp/workbench.html
```

Note: Local workbench has limited functionality. For full testing, use hosted workbench:
```
https://tenant.sharepoint.com/sites/ARB/_layouts/15/workbench.aspx
```

### Watch Mode for Development

```bash
gulp serve --nobrowser
```

Then navigate to your SharePoint workbench and append:
```
?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js
```

## Customization

### Modify Styling

Edit the inline styles in `ArbWebPart.ts`:

```typescript
this.domElement.innerHTML = `
  <style>
    .arb-webpart {
      /* Custom styles here */
    }
  </style>
  ...
`;
```

### Add More Properties

Update `IArbWebPartProps` interface and `getPropertyPaneConfiguration()`:

```typescript
export interface IArbWebPartProps {
  formUrl: string;
  title: string;
  height: number;  // New property
}

// Add to property pane
PropertyPaneTextField('height', {
  label: 'Frame Height (px)',
  value: '800'
})
```

### Handle Form Events

Add event listeners for iframe communication:

```typescript
window.addEventListener('message', (event) => {
  if (event.origin === this.properties.formUrl) {
    // Handle form submission, navigation, etc.
    console.log('Form event:', event.data);
  }
});
```

## Troubleshooting

### Issue: Web Part Not Appearing
**Solution**: 
- Verify .sppkg is deployed to App Catalog
- Check app is installed on the site
- Clear browser cache

### Issue: Form Not Loading in Iframe
**Solution**:
- Verify form URL is correct
- Check iframe sandbox permissions
- Review browser console for errors
- Ensure CORS headers allow iframe embedding

### Issue: Build Errors
**Solution**:
```bash
# Clean and rebuild
gulp clean
npm install
gulp build
```

### Issue: "Cannot find module" Error
**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Security Considerations

### Iframe Sandbox Attributes

Current settings:
```html
sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
```

- `allow-same-origin`: Required for accessing form content
- `allow-scripts`: Required for form functionality
- `allow-forms`: Required for form submission
- `allow-popups`: Required for export dialogs

### Content Security Policy

Ensure SharePoint CSP allows iframe sources:
```
Content-Security-Policy: frame-src 'self' https://tenant.sharepoint.com;
```

## Teams Integration

To use in Microsoft Teams:

1. **Deploy to Teams App Catalog**
   - Package includes Teams manifest
   - Upload to Teams admin center

2. **Add as Teams Tab**
   ```
   1. Go to a Teams channel
   2. Click + to add a tab
   3. Search for "TXDPS ARB"
   4. Configure and add
   ```

## Performance Optimization

### Lazy Loading
The iframe uses `loading="lazy"` for better performance.

### Caching
Consider adding:
```typescript
// Cache form data in session storage
sessionStorage.setItem('arbFormData', JSON.stringify(data));
```

## Versioning

Update version in `package-solution.json`:
```json
{
  "solution": {
    "version": "1.1.0.0"
  }
}
```

## Additional Resources

- **SPFx Documentation**: https://docs.microsoft.com/sharepoint/dev/spfx/sharepoint-framework-overview
- **SPFx Samples**: https://github.com/pnp/sp-dev-fx-webparts
- **PnP Community**: https://pnp.github.io/

## Support

For issues or questions:
- TXDPS IT Support: it-support@dps.texas.gov
- SharePoint Team: sharepoint-admins@dps.texas.gov

## License

Part of the TXDPS ARB system. Subject to TXDPS licensing policies.
