# Fullsend on this repository

[Fullsend](https://fullsend.sh/) runs autonomous SDLC agents (triage, code, review, fix, retro, prioritize) via GitHub Actions on this repo.

This repo mirrors the scaffold from [`fullsend github setup`](https://fullsend.sh/docs/guides/getting-started/configuring-github), same shape as [ansible/vscode-ansible `fullsend/scaffold-install`](https://github.com/ansible/vscode-ansible/compare/main...sudhirverma:vscode-ansible:fullsend/scaffold-install):

- `.github/workflows/fullsend.yaml`, `.github/workflows/prioritize.yml`
- `.fullsend/config.yaml` (roles, allowlist, `tracker.github` including this repo)
- `.fullsend/customized/*/.gitkeep` — optional local overrides (see ADR 0033)

## Finish enrollment on GitHub

Scaffold files alone do not run agents until GitHub is configured.

### 1. Install the CLI

```bash
curl -fsSL -o /tmp/fullsend.tgz \
  "https://github.com/fullsend-ai/fullsend/releases/latest/download/fullsend_$(uname -s | tr '[:upper:]' '[:lower:]')_$(uname -m | sed 's/x86_64/amd64/').tar.gz"
tar -xzf /tmp/fullsend.tgz -C ~/.local/bin fullsend
```

Or download from [GitHub Releases](https://github.com/fullsend-ai/fullsend/releases).

### 2. Authenticate `gh`

```bash
gh auth login
# If classic tokens are blocked, use a fine-grained PAT with repo + workflow scopes.
```

### 3. Install GitHub Apps (org or user)

Install each app on `sudhirverma/AICallCenterChatBot` (or your org):

| Role | Install |
| --- | --- |
| triage | https://github.com/apps/fullsend-ai-triage/installations/new |
| coder | https://github.com/apps/fullsend-ai-coder/installations/new |
| review | https://github.com/apps/fullsend-ai-review/installations/new |
| retro | https://github.com/apps/fullsend-ai-retro/installations/new |
| prioritize | https://github.com/apps/fullsend-ai-prioritize/installations/new |

Fix agent shares the **coder** app.

### 4. Push scaffold + sync repo settings

Either merge a PR from branch `fullsend/scaffold-install` (setup’s default), or push these files to `main`, then converge secrets and variables:

```bash
fullsend github setup sudhirverma/AICallCenterChatBot
# optional: --runtime codex|pi|claude
```

**OpenAI-only** (no Vertex): omit `--inference-project` and `--inference-wif-provider`. Configure OpenAI WIF per [docs](https://fullsend.sh/docs/guides/getting-started/configuring-github).

**Vertex**: pass `--inference-project` and `--inference-wif-provider` from [Getting Inference](https://fullsend.sh/docs/guides/getting-started/getting-inference).

Setup sets repository variables (for example `FULLSEND_MINT_URL`, `FULLSEND_APP_SET`) and inference secrets when required.

### 5. Trigger the pipeline

```bash
gh issue create --repo sudhirverma/AICallCenterChatBot --title "Example: add rate limiting"
```

Bots comment, open PRs, review, and fix per [fullsend.sh](https://fullsend.sh/).

## Local verification

```bash
fullsend lint
```

Run from the repo root after the CLI is installed.