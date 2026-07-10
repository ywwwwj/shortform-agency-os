# ShortForm Agency OS

Current source of truth for the ShortForm Agency OS website and local product project.

## Public Website

The repository root is the GitHub Pages publish directory.

- Home: `index.html`
- Workspace: `workspace.html`
- Interactive demo: `demo-generator.html`
- Product page: `template.html`
- Cases: `cases.html`
- Public URL: https://ywwwwj.github.io/shortform-agency-os/

GitHub Pages publishes the `master` branch from `/`.

## Local Project Files

These folders are intentionally excluded from Git:

- `project-docs/`: project memory, research, launch plans, testing notes, and outreach documents
- `project-tools/`: local beta, pilot, and outreach utilities
- `demo-assets/`: screenshots, GIFs, and other large demo media

## Validation

```powershell
node --check .\script.js
node --check .\workspace.js
node --check .\demo-generator.js
```

Open `index.html` locally for a quick static preview. Use the GitHub Pages URL for the deployed customer view.
