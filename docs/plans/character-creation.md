# Epic 2: Character Creation — Implementation Plan

## Overview

Epic 2 delivers stories **2.1–2.3**: name input, class selection, portrait selection, live summary preview, class-based starting stats, and saving the character to Firestore under the authenticated user. Campaign generation (Epic 3) is **out of scope** — "Begin Adventure" saves the character and routes to the existing game stub.

**Assets:** `public/img/heroes.png` (3 portraits in one image), `public/img/friends_box_merge.png` (fantasy frame).

---

## Proposed File Changes

### New Files — `src/features/character/`

| File | Purpose |
|------|---------|
| `characterTypes.ts` | Types: `CharacterClass`, `PortraitId`, `CharacterStats`, `Character`, `CharacterCreationInput`, `ClassDefinition` |
| `characterConfig.ts` | Static config for Warrior / Rogue / Mage: starting HP, attack/defense/magic/agility modifiers, gold, descriptions, highlights, portrait sprite positions from `heroes.png` |
| `characterService.ts` | `buildCharacterFromInput()`, `validateCharacterInput()`, `createCharacterGame(userId, input)` — writes `games/{gameId}` with character data and `userId` |
| `CharacterCreationPage.css` | Mobile-first layout; two-column summary on wider screens; matches auth page fantasy styling |
| `components/ClassCard.tsx` + `.css` | Selectable class card: icon, name, description, stat highlights, selected gold border |
| `components/PortraitPicker.tsx` + `.css` | Row of 3 portrait thumbnails from `heroes.png` via `background-position`; checkmark on selection |
| `components/CharacterSummary.tsx` + `.css` | Live preview: portrait, name, level/class, HP/Attack/Defense/Magic/Agility/Gold, class flavor text |

### Modified Files — `src/features/character/`

| File | Changes |
|------|---------|
| `CharacterCreationPage.tsx` | Full rewrite: fantasy header, scrollable form in `FantasyFrame`, name input, `ClassCard` grid, `PortraitPicker`, `CharacterSummary`, "Begin Adventure" via `FantasyButton`; validation errors; redirect if user already has an active game |

### New Files — `src/features/game/`

| File | Purpose |
|------|---------|
| `gameTypes.ts` | `GameStatus`, `GameCharacter`, `GameDocument` per `docs/architecture.md`; minimal placeholders for `campaign`, `currentScene`, `inventory`, `quests` (empty/null until Epic 3+) |

### Modified Files — `src/features/game/`

| File | Changes |
|------|---------|
| `gameService.ts` | Add `getActiveGame(userId)`, `createGameWithCharacter(userId, character)`; keep `hasActiveGame()` and `getPostAuthPath()` |

### New Files — `src/shared/`

| File | Purpose |
|------|---------|
| `hooks/useCharacterCreation.ts` | State for name, class, portrait; derived stats from `characterConfig`; `isValid`, `buildInput()`, `submit()` calling `characterService` |
| `utils/validators.ts` | `validateCharacterName()` — trimmed, 2–24 chars, allowed characters |

### Modified Files — `src/shared/` & App

| File | Changes |
|------|---------|
| `features/game/GamePage.tsx` | Light update: if active game exists, show character name/class/HP/gold from Firestore (story 2.3 on game screen); campaign placeholder remains |
| `app/routes.tsx` | No route changes — `/character/create` already exists |

---

## Firestore Document Shape

On "Begin Adventure":

```ts
games/{autoId} = {
  userId: string,
  status: "active",
  createdAt, updatedAt,
  character: { name, class, portraitId, level: 1, xp: 0, hp, maxHp, gold, stats },
  campaign: null,           // Epic 3
  currentScene: null,
  inventory: [],
  quests: []
}
```

Existing `firestore.rules` already allow create when `request.resource.data.userId == request.auth.uid` — no rule changes needed.

---

## Class Starting Stats

| Class | HP | Attack | Defense | Magic | Agility | Gold |
|-------|-----|--------|---------|-------|---------|------|
| **Warrior** | 20 | +3 | +2 | +0 | +1 | 10 |
| **Rogue** | 16 | +2 | +1 | +0 | +3 | 10 |
| **Mage** | 14 | +0 | +1 | +3 | +1 | 10 |

Each class gets flavor text and highlights (e.g. Warrior: "High HP", "High Defense").

---

## Portrait Handling

`heroes.png` is a 3-panel sprite. Config maps each `PortraitId` to a `background-position` slice — no separate image files needed.

Default: selecting a class auto-selects its matching portrait; user can override in the portrait picker.

---

## UI Layout (Mobile-First)

**Mobile (default):**
1. "Create Your Hero" — name, class cards (stacked), portraits
2. "Your Hero Summary" — live preview below
3. "Begin Adventure" button (disabled until name + class + portrait are valid)

**Tablet/desktop (`min-width: 48rem`):**
- Two-column layout like the mockup: creation left, summary right
- Shared fantasy frame / dark theme / Cinzel / gold accents (same as login)

---

## User Flow

1. Authenticated user lands on `/character/create` (no active game).
2. User fills form; summary updates live.
3. "Begin Adventure" → validate → `createGameWithCharacter()` → redirect to `/game`.
4. Returning user with active game → skip creation, go to `/game`.
5. Game page shows saved character summary; campaign message stays as stub.

---

## Out of Scope

- Gemini / campaign generation
- Turn processing, combat, inventory UI
- Splitting `heroes.png` into separate files (CSS sprite is sufficient for MVP)
- `users/{userId}` profile doc (optional later; character lives on `games`)

---

## File Count Summary

- **~12 new files** (types, config, service, hook, validator, page CSS, 3 component pairs)
- **~4 modified files** (`CharacterCreationPage.tsx`, `gameService.ts`, `GamePage.tsx`)
