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

### 4. Scaffold PR + GitHub settings

Merge **[PR #3](https://github.com/sudhirverma/AICallCenterChatBot/pull/3)** (`fullsend/scaffold-install`) so workflows and `.fullsend/config.yaml` land on `main`.

This repo is already enrolled on GitHub with:

| Setting | Value |
| --- | --- |
| `FULLSEND_MINT_URL` | `https://mint.fullsend.sh` (repo variable) |
| `FULLSEND_INFERENCE_GATEWAY_API_KEY` | EnMaaS key (`sk-oai-…`) — **Actions secret** (from local `ENMAAS_API_KEY`, not in git) |
| Inference | [EnMaaS](https://www.redhat.com/en/blog/EnMaaS-Red-Hat-pilot-for-open-source-inference) via `https://api.enmaas.devshift.net`, `auth: api-key`, `messages_auth_header: x-api-key`, model `rits/zai-org/glm-5-3` |
| Runtime | `pi` (see `.fullsend/config.yaml`) |

Re-converge after edits:

```bash
export GH_TOKEN="$GITHUB_PAT"   # fine-grained: Contents, Workflows, Secrets, Variables
fullsend github setup sudhirverma/AICallCenterChatBot --runtime pi \
  --inference-gateway-url https://api.enmaas.devshift.net \
  --inference-gateway-auth api-key \
  --inference-gateway-model 'rits/zai-org/glm-5-3=anthropic-messages'
fullsend github set sudhirverma/AICallCenterChatBot FULLSEND_INFERENCE_GATEWAY_API_KEY "$ENMAAS_API_KEY"
```

Add EnMaaS models under `inference.gateway.models` and use `gateway/<model-id>` in agent config when you customize harnesses. Upstream default harnesses may still name Vertex/OpenAI models until you override them under `.fullsend/customized/`.

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