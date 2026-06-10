# Deploy ShortForm Agency OS To GitHub Pages

This folder is the public deploy package. It intentionally excludes internal validation files such as `pilot.html`, `outreach.html`, beta logs, runbooks, project memory, and prospect lists.

## Public Folder

Deploy from:

```powershell
C:\Users\34054\Desktop\ai模板网站\public-site
```

## One-Time GitHub Login

Run:

```powershell
& 'C:\Program Files\GitHub CLI\gh.exe' auth login --hostname github.com --web --git-protocol https --clipboard
```

Finish the browser authorization. If GitHub shows a device code, paste the code that the CLI copied to your clipboard.

## Create Public Repo And Enable Pages

Recommended repo name:

```text
shortform-agency-os
```

Commands:

```powershell
cd "C:\Users\34054\Desktop\ai模板网站\public-site"
& 'C:\Program Files\GitHub CLI\gh.exe' repo create shortform-agency-os --public --source . --remote origin --push
& 'C:\Program Files\GitHub CLI\gh.exe' api repos/:owner/shortform-agency-os/pages -X POST -f source.branch=master -f source.path=/
```

Expected URL:

```text
https://YOUR_GITHUB_USERNAME.github.io/shortform-agency-os/
```

GitHub Pages can take 1-5 minutes to become available after enabling.

## After Deployment

Update these internal docs with the real public URL:

- `ASYNC_DEMO_PACKET_2026-06-09.md`
- `TODAY_SEND_QUEUE_2026-06-10.md`
- `FIRST_5_DM_SEND_PACK_2026-06-10.md`

Do not publish internal files or prospect lists.
