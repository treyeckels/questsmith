# Epic 3: Random Campaign Generation — Implementation Plan

## Overview

Epic 3 delivers story **3.1** (generate and save campaign). Story **3.2** (opening scene with choices) is **out of scope** — `currentScene` stays `null` until Epic 4.

After character creation, the player is routed to a temporary campaign generation screen that calls Gemini via a Cloud Function, validates the response, saves campaign data to Firestore, and shows a preview before continuing to `/game`.

---

## Architecture

```
Character Creation → /campaign/generate → Cloud Function (Gemini) → validate → Firestore → preview → /game
```

Gemini API key stays server-side in Cloud Functions via Firebase Secrets (`GEMINI_API_KEY` in Google Cloud Secret Manager). The client never holds the key.

---

## Proposed File Changes

### New — `src/features/campaign/`

| File | Purpose |
|------|---------|
| `campaignTypes.ts` | `Campaign`, `CampaignLocation`, `CampaignNpc`, `CampaignGenerationInput` |
| `campaignService.ts` | Map Gemini response → Firestore shape; `saveCampaignToGame()`; `generateAndSaveCampaign()` |
| `CampaignGenerationPage.tsx` | Temp screen: loading, error/retry, campaign preview, Continue button |
| `CampaignGenerationPage.css` | Fantasy-themed mobile-first styling |

### New — `src/features/gemini/`

| File | Purpose |
|------|---------|
| `geminiTypes.ts` | `CampaignGenerationRequest`, `CampaignGenerationResponse` (prompt schema) |
| `geminiPrompts.ts` | Campaign generation prompt from `docs/prompts.md` |
| `geminiSchemas.ts` | `validateCampaignGenerationResponse()` |
| `geminiService.ts` | `requestCampaignGeneration()` via `functions.httpsCallable` |

### New — `src/shared/hooks/`

| File | Purpose |
|------|---------|
| `useCampaignGeneration.ts` | Auto-generate on mount; loading/error/retry; redirect when done |

### New — `functions/src/`

| File | Purpose |
|------|---------|
| `generateCampaign.ts` | Callable function: build prompt, call Gemini, return JSON |
| Update `index.ts` | Export `generateCampaign` |

### Modified

| File | Changes |
|------|---------|
| `gameTypes.ts` | Replace `campaign: null` with proper `Campaign \| null` type |
| `gameService.ts` | `getActiveGame()` returns campaign; `needsCampaignGeneration()`; routing helpers |
| `GamePage.tsx` | Redirect to `/campaign/generate` if no campaign; show campaign title when present |
| `CharacterCreationPage.tsx` | Redirect to `/campaign/generate` after save |
| `routes.tsx` | Add `/campaign/generate` protected route |
| `RootRedirect.tsx` | Route users with game-but-no-campaign to generation screen |
| `functions/package.json` | Add `@google/generative-ai` |
| `.env.example` | Document `GEMINI_API_KEY` for functions |

---

## Firestore Updates

On successful generation, update `games/{gameId}`:

```ts
campaign: {
  title, tone, mainQuestHook, currentObjective, currentLocationId,
  locations: [{ id, name, description, unlocked }],
  npcs: [{ id, name, role, description }]
}
// currentScene remains null (Epic 4)
```

---

## User Flow

1. User completes character creation → `/campaign/generate`
2. Screen shows thematic loading state while Gemini generates
3. On success: campaign saved, preview shown (title, hook, objective, locations, NPCs)
4. User taps Continue → `/game`
5. On error: friendly message + Retry
6. Returning user with campaign → skip generation, go to `/game`

---

## Out of Scope

- Opening scene generation (Story 3.2)
- Choice buttons / gameplay loop (Epic 4)
- Turn history
