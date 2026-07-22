# Cloudflare Pages + Supabase + AI Setup

This repository remains a static site until cloud configuration is enabled. GitHub Pages can keep serving the demo. Use Cloudflare Pages for the authenticated product workspace.

## 1. Create the Supabase project

1. Create a Supabase project.
2. In the SQL editor, run `supabase/migrations/20260712_initial_workspace.sql` once.
3. In Authentication, enable Email OTP / Magic Link.
4. Add the Cloudflare Pages production URL and local preview URL to the Auth redirect allow list.
5. Copy the project URL and anon key. The anon key may be placed in the public `cloud-config.js`; the service-role key must never be placed in the browser.

The migration enables Row Level Security on every user-data table. The cloud model is `workspace -> brands -> content projects -> versions / memory / learning`. Agency mode is simply a workspace with `mode = agency`; a client is represented by a Brand rather than a second data system.

## 2. Configure the browser

Copy `cloud-config.example.js` over `cloud-config.js` and fill only these public values:

```js
window.SHORTFORM_CLOUD_CONFIG = {
  enabled: true,
  supabaseUrl: "https://YOUR_PROJECT.supabase.co",
  supabaseAnonKey: "YOUR_SUPABASE_ANON_KEY",
  workerUrl: "https://shortform-ai-proxy.YOUR_ACCOUNT.workers.dev",
};
```

Do not put an OpenAI API key or `SUPABASE_SERVICE_ROLE_KEY` in this file.

## 3. Deploy the Cloudflare Worker

From `workers/ai-proxy/`:

```powershell
npx wrangler login
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_ANON_KEY
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put OPENAI_API_KEY
npx wrangler deploy
```

Set `OPENAI_MODEL` in `workers/ai-proxy/wrangler.toml` if a different model is required.

The Worker verifies the user's Supabase access token, reads only that user's project context, checks the monthly plan limit, calls OpenAI, and records the AI run. It never writes long-term client memory automatically.

## 4. Deploy Cloudflare Pages

1. Connect this GitHub repository to Cloudflare Pages.
2. Set the production branch to `master`.
3. Use no build command.
4. Set the build output directory to `/`.
5. Deploy.

After deployment, update `cloud-config.js` with the Worker URL and publish it with the Pages site.

## 5. First cloud login and offline behavior

1. Existing local users click `CLOUD`, sign in with their email link, then choose `Upload current local projects`.
2. The browser migrates legacy saved projects into Brands, then uploads Brand Brain modules, Content Projects, versions, approvals, revision reasons, and manually entered performance.
3. Local storage remains the offline source while no session or network is available.
4. A signed-in user can choose `Sync this device` to merge cloud Brands and Content Projects. The more recently updated record wins for matching local IDs.

## 6. AI quota policy

- `free`: 10 AI jobs per calendar month.
- `creator`: 100 AI jobs per calendar month.
- `studio`: 500 AI jobs per calendar month.
- `agency`: 1500 AI jobs per calendar month.

The Worker reads `profiles.plan` to enforce these limits. Add billing or admin tooling later to change plan values. A customer-provided API key should be implemented only after an encrypted per-user key design is reviewed; it is intentionally not stored in the current browser app.
