# SPFx Web Part – TXDPS ARB Host

This is a minimal SPFx web part that renders the static `index.html` (uploaded to a SharePoint library) in an iframe.

## How to use
1. Scaffold an SPFx project (Node LTS, Yeoman): `yo @microsoft/sharepoint` → **No framework**.
2. Replace the generated `src/` and `config/` files with the ones in this folder.
3. Run `gulp bundle --ship && gulp package-solution --ship`.
4. Upload the generated `.sppkg` in `sharepoint/solution/` to the App Catalog and **Install** on the site.
5. Edit a page and insert **TXDPS ARB Form** web part. Configure **Form URL** (point to `/TXDPS-ARB/index.html`).

> If SPFx is not desired, simply use the **File Viewer** web part to display the uploaded `index.html`.
