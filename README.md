# ShortForm Content OS

Current source of truth for the ShortForm Content OS website and local-first product project. Agency is an advanced workspace mode, not the primary product identity.

## Public Website

The repository root is the GitHub Pages publish directory.

- Home: `index.html`
- Workspace: `workspace.html`
- Interactive demo: `demo-generator.html`
- Product page: `template.html`
- Cases: `cases.html`
- Brand Brain + Content Studio: `workspace.html`
- Product: `product.html`
- Agency mode: `agency.html`
- Pricing: `pricing.html`
- Method: `method.html`
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
- Supabase Auth + PostgreSQL can synchronize workspaces, Brands, Content Projects, content versions, Brand Memory, revision logs, performance entries, approvals, exports, and AI run history.
- A Cloudflare Worker keeps OpenAI and Supabase service-role secrets out of the browser.
- AI suggestions show the client memory used, reasoning, uncertainty, and proposed updates. Only `Approve and save` writes anything into long-term client memory.

See `DEPLOY_CLOUDFLARE_SUPABASE.md` for the one-time setup sequence.
