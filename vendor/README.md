# Vendor Libraries

This directory is for third-party JavaScript libraries required for enhanced functionality.

## Required Library for Excel Export

To enable Excel export functionality, place the SheetJS library in this directory:

### SheetJS (xlsx.full.min.js)

**Purpose**: Enable client-side Excel file generation and export

**Download**: https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js

**License**: Apache 2.0

**Version**: Latest stable release (check https://sheetjs.com/)

### Installation Steps

1. Download `xlsx.full.min.js` from the SheetJS CDN or GitHub releases
2. Place the file in this `vendor/` directory
3. Update `index.html` to include the script:

```html
<script src="vendor/xlsx.full.min.js"></script>
```

4. The Excel export button will now function properly

### Alternative: CDN Usage

Instead of downloading the file, you can reference it from a CDN by adding this to `index.html`:

```html
<script src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"></script>
```

**Note**: Using a local copy is recommended for:
- Offline functionality
- Better performance
- Security (no external dependencies)
- Compliance with organizational policies

## Other Optional Libraries

### PDF Export Enhancement

For advanced PDF export (beyond browser print), consider:

**jsPDF**: https://github.com/parallax/jsPDF
- Client-side PDF generation
- Customizable layouts
- Chart and table support

### Form Validation

**Parsley.js**: https://parsleyjs.org/
- Advanced form validation
- Custom validators
- Better user feedback

## Security Considerations

When adding vendor libraries:

1. **Verify Source**: Only download from official sources
2. **Check Integrity**: Verify file hashes/signatures
3. **Review License**: Ensure compliance with usage terms
4. **Scan for Vulnerabilities**: Use tools like npm audit or Snyk
5. **Keep Updated**: Regularly update to latest secure versions

## Directory Structure

```
vendor/
├── README.md              (this file)
├── xlsx.full.min.js       (add this - SheetJS for Excel export)
└── [other libraries]      (optional additional libraries)
```

## Troubleshooting

### Excel Export Not Working

**Problem**: "Excel export requires SheetJS library" error

**Solution**: 
1. Verify `xlsx.full.min.js` exists in the `vendor/` directory
2. Check that the script tag is added to `index.html`
3. Clear browser cache and reload
4. Check browser console for loading errors

### Version Compatibility

**Current Tested Versions**:
- SheetJS: 0.18.0 or later

If using different versions, test thoroughly before deployment.

## License Information

This directory is for third-party libraries only. Each library maintains its own license.

**Important**: Review and comply with each library's license terms before use, especially for:
- Commercial use
- Modification
- Redistribution
- Attribution requirements

## Contact

For questions about vendor libraries:
- TXDPS IT Support
- Enterprise Architecture Team
- Email: it-support@dps.texas.gov
