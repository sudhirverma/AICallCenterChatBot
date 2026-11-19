# AI Call Center ChatBot

A call-center style AI chat interface built with React and TypeScript. Agents
pick a customer profile, attach supporting documents, and converse with an AI
assistant that has access to the customer's context.

## Features

- **Customer selection** — customer profiles are loaded from a remote
  customer-profile service and the active customer is remembered between
  visits (localStorage).
- **Prompt presets** — common quick-start prompts are available from a
  dropdown (`src/data/prompts.json`).
- **Document attachments** — attach `.txt` files to a message; the file's
  text is uploaded to the backend and the returned document context is
  passed along with the chat request. Only plain-text attachments are
  supported: the client reads files as UTF-8 text (`src/services/api.ts`)
  and does not parse binary document formats (`.pdf`, `.doc`, `.docx`).
  The file picker defaults to `.txt` files, but that filter is advisory
  only — browsers let users pick other files, and nothing client-side
  rejects them, so a binary file chosen this way would still be read as
  text and uploaded with mangled content.
- **Persistent conversations** — messages are stored per session in
  localStorage, so a page reload keeps the conversation.
- **Live feedback** — animated typing indicator while the assistant responds.
- **Optional authentication** — customer profiles may carry an auth token
  that is sent as HTTP Basic auth to the backend. This pattern is for local
  or demo use only: the token is part of the publicly fetched customer
  profile data, so anything in it is visible to end users. Treat the
  Basic-auth token as non-secret and grant it only demo-scope access to the
  backend. For production, issue tokens server-side instead of shipping
  them in the profile JSON.

## Tech stack

- [React 19](https://react.dev/) with TypeScript
- [Vite 7](https://vite.dev/) for development and builds
- [ESLint 9](https://eslint.org/) with typescript-eslint
- Docker + nginx for production deployment

## Getting started

Requires Node.js 20.19+ or 22.12+ (the minimum versions supported by
Vite 7).

```bash
npm install
npm run dev
```

The dev server starts on Vite's default port (5173).

### Available scripts

| Script           | Description                                   |
| ---------------- | --------------------------------------------- |
| `npm run dev`    | Start the Vite development server             |
| `npm run build`  | Type-check (`tsc -b`) and build for production |
| `npm run lint`   | Run ESLint                                    |
| `npm run preview`| Preview the production build locally          |

## Configuration

Copy the example environment file and adjust it:

```bash
cp .env.example .env
```

The app reads the following variable:

| Variable          | Description                                                                 |
| ----------------- | --------------------------------------------------------------------------- |
| `VITE_CHAT_API`   | Base URL of the chat backend. Defaults to `http://localhost:8000` if unset. |

The backend is expected to expose two endpoints:

- `POST /upload` — accepts `{ customer_id, document_text }` and returns the
  document context used for the conversation.
- `POST /chat` — accepts `{ customer_id, message, document_context, session_id }`
  and returns the assistant reply.

`.env.example` also contains credentials for the Fullsend agent tooling
(`GITHUB_PAT`, `ENMAAS_API_KEY`); these are not read by the app itself.

## Deployment

Build and serve the app with Docker:

```bash
docker compose up --build
```

The container builds the app with Vite, serves the `dist/` output with nginx,
and is exposed on <http://localhost:8080>. `VITE_CHAT_API` is baked in at
build time: set it in the repo-root `.env` (see [Configuration](#configuration))
before running `docker compose up --build`. The `environment:` entry in
`docker-compose.yml` only affects the runtime nginx container — it is not
visible to the build stage and does not reach the browser app.

## Project structure

```
src/
├── components/   # UI: ChatWindow, CustomerSelect, InputBar, Message, PromptSelect
├── data/         # Static prompt presets (prompts.json)
├── hooks/        # useChat (chat state + persistence), useDotsAnimation
├── services/     # api.ts — backend /chat and /upload calls
├── styles/       # Global CSS
├── types/        # Shared TypeScript types (chat, customer)
└── utils/        # Session id and customer-selection persistence helpers
```

## Fullsend (autonomous SDLC agents)

GitHub agent pipeline scaffold for [Fullsend](https://fullsend.sh/) is in
this repo. See [docs/FULLSEND.md](docs/FULLSEND.md) for enrolling
`sudhirverma/AICallCenterChatBot` and running agents on issues/PRs.
