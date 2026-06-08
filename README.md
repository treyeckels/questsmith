# QuestSmith

QuestSmith is a mobile-first, single-player choose-your-own-adventure fantasy RPG. Gemini acts as the AI Dungeon Master—generating scenes, choices, dialogue, and flavor text—while the app controls deterministic game systems: HP, inventory, gold, XP, combat, quest status, and saved progress.

## Hybrid AI Architecture

This project separates **creative generation** from **deterministic game logic**:

| Layer | Responsibility |
|-------|----------------|
| **Gemini** | Scene narration, player choices, NPC dialogue, item descriptions, quest ideas |
| **App (game engine)** | Dice rolls, combat outcomes, stat changes, inventory updates, quest status, persistence |
| **Firebase** | Authentication, Firestore persistence, Hosting, Cloud Functions |

Gemini suggests narrative consequences; the app calculates and saves the actual game state. This keeps the experience dynamic while remaining fair, testable, and recoverable.

## Tech Stack

- **Frontend:** React 19, Ionic React, TypeScript, Vite
- **Backend:** Firebase Auth, Firestore, Cloud Functions, Hosting
- **AI:** Gemini API (planned via Cloud Functions)
- **Mobile:** Capacitor (optional native builds)

## Current Status

| Epic | Feature | Status |
|------|---------|--------|
| 1 | Authentication (email/password, Google, sign-out, protected routes) | Done |
| 2 | Character creation | Planned |
| 3 | Random campaign generation | Planned |
| 4+ | Gameplay loop, combat, inventory, quests, persistence | Planned |

## Getting Started

### Prerequisites

- Node.js 20+
- A Firebase project with Auth and Firestore enabled
- Firebase CLI (`npm install -g firebase-tools`)

### Installation

```bash
git clone https://github.com/treyeckels/questsmith.git
cd questsmith
npm install
npm install --prefix functions
```

### Environment Variables

Firebase config is loaded at build time through Vite `import.meta.env` in `src/firebase.ts`. Only variables prefixed with `VITE_` are exposed to the client.

| File | When it is used | Committed? |
|------|-----------------|------------|
| `.env.example` | Template with placeholder values | Yes |
| `.env.local` | Local development (`npm run dev`) | No — gitignored |
| `.env.production` | Production builds (`npm run build`) before Firebase Hosting deploys | No — gitignored |

**Local development**

```bash
cp .env.example .env.local
```

Fill in your Firebase web app config from the [Firebase Console](https://console.firebase.google.com/) → Project Settings → Your apps. Restart the dev server after changing env files.

**Production deploys**

Before building for Firebase Hosting, create a production env file with the same variables:

```bash
cp .env.example .env.production
```

Vite loads `.env.production` automatically when you run `npm run build`. Then deploy:

```bash
npm run build
firebase deploy --only hosting
```

**Important:** Never commit `.env.local`, `.env.production`, or any file containing real Firebase credentials. Only `.env.example` (placeholders) belongs in the repo.

Required variables:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

### Firebase Setup

In the Firebase Console under **Authentication → Sign-in method**, enable:

- **Email/Password**
- **Google**

Deploy Firestore rules and indexes:

```bash
firebase login
firebase deploy --only firestore:rules,firestore:indexes
```

### Cloud Functions secrets (Gemini)

Campaign generation calls Gemini from a Cloud Function. The API key is stored in **Google Cloud Secret Manager** via Firebase — never in the client app.

**Production (one-time setup)**

```bash
firebase functions:secrets:set GEMINI_API_KEY
```

Enter your [Gemini API key](https://aistudio.google.com/apikey) when prompted. Then deploy functions:

```bash
cd functions && npm run build
firebase deploy --only functions
```

**Local emulator**

Create `functions/.secret.local` (gitignored):

```
GEMINI_API_KEY=your-gemini-api-key
```

Run the emulator with secrets access:

```bash
firebase emulators:start --only functions
```

Do **not** add `VITE_GEMINI_*` to the client — the key must stay server-side.

### Run Locally

```bash
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

### Build & Deploy

Ensure `.env.production` exists with your Firebase config (see [Environment Variables](#environment-variables)), then:

```bash
npm run build
firebase deploy --only hosting
```

## Project Structure

```
src/
  app/              # App routing
  features/
    auth/           # Sign-in, sign-up, Google OAuth
    character/      # Character creation (stub)
    game/           # Game screen and game queries (stub)
  shared/
    components/     # Route guards, loading states
    context/        # AuthProvider
    hooks/          # useAuth
    firebase/       # Firestore path helpers
  firebase.ts       # Firebase client initialization

functions/          # Firebase Cloud Functions (TypeScript)
docs/               # SRS, user stories, architecture, prompts
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and production build |
| `npm run preview` | Preview production build locally |
| `npm run test.unit` | Run Vitest unit tests |
| `npm run test.e2e` | Run Cypress end-to-end tests |
| `npm run lint` | Run ESLint |

## Documentation

- [Software Requirements Specification](docs/srs.md)
- [User Stories & Acceptance Criteria](docs/user-stories.md)
- [Architecture](docs/architecture.md)
- [Gemini Prompt Strategy](docs/prompts.md)

## AI-Assisted Development Workflow

This project was intentionally developed using an AI-assisted workflow:

1. Generate requirements (SRS)
2. Define user stories
3. Create architecture
4. Create implementation plan
5. Generate scaffolding
6. Review and refine generated code
7. Write tests and documentation

## MVP Goal

The MVP is complete when a user can create an account, create a character, start a randomly generated campaign, play 10–15 turns, survive basic combat, gain or lose items, and resume their game later.

## License

Private project.
