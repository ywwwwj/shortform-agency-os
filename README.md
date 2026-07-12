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

## Cloud product upgrade

The workspace now supports a local-first cloud architecture:

- UI and exports work without a backend.
- Supabase Auth + PostgreSQL can synchronize clients, projects, approvals, revisions, learning logs, efficiency snapshots, exports, and AI run history.
- A Cloudflare Worker keeps OpenAI and Supabase service-role secrets out of the browser.
- AI suggestions show the client memory used, reasoning, uncertainty, and proposed updates. Only `Approve and save` writes anything into long-term client memory.

See `DEPLOY_CLOUDFLARE_SUPABASE.md` for the one-time setup sequence.
