# QuestSmith Architecture

## 1. System Overview

QuestSmith is a mobile-first AI-powered fantasy RPG built with React, Firebase, Firestore, Firebase Auth, and Gemini.

The application uses a hybrid architecture:

* **Gemini acts as the Dungeon Master**, generating narrative content such as scenes, choices, NPC dialogue, quest ideas, and item descriptions.
* **The application acts as the game engine**, controlling deterministic systems such as HP, inventory, gold, XP, levels, quest status, location, dice rolls, combat outcomes, and persistence.

This separation keeps the experience creative and dynamic while ensuring the game remains consistent, fair, and recoverable.

## 2. Frontend Architecture

The frontend is built with React and structured around feature-based modules.

Core frontend responsibilities:

* Authenticate users
* Render character creation
* Display the current story scene
* Display available choices
* Resolve deterministic game events
* Call Gemini for narrative generation
* Save and load game state from Firestore
* Display character stats, inventory, quest state, and map

Primary screens:

* Auth
* Character Creation
* Game / Story
* Inventory
* Quest Log
* Map
* Settings

The main game screen should prioritize:

1. Location image
2. Scene narration
3. Choice buttons
4. Character summary
5. Current quest and inventory access

## 3. Firebase Architecture

Firebase provides authentication, persistence, hosting, and security rules.

MVP Firebase services:

* **Firebase Auth** for user accounts
* **Firestore** for saved game state
* **Firebase Hosting** for deployment

Future Firebase services may include:

* Cloud Functions for secure Gemini calls
* Firebase Storage for custom assets
* Analytics for demo usage tracking

## 4. Firestore Data Model

### users/{userId}

Stores basic user profile data.

```ts
{
  displayName: string;
  email: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### games/{gameId}

Stores the active campaign and game state.

```ts
{
  userId: string;
  status: "active" | "completed" | "defeated";
  createdAt: Timestamp;
  updatedAt: Timestamp;

  character: {
    name: string;
    class: "warrior" | "rogue" | "mage";
    portraitId: string;
    level: number;
    xp: number;
    hp: number;
    maxHp: number;
    gold: number;
    stats: {
      attackModifier: number;
      defenseModifier: number;
      magicModifier: number;
    };
  };

  campaign: {
    title: string;
    tone: string;
    mainQuestHook: string;
    currentObjective: string;
    currentLocationId: string;
    locations: Array<{
      id: string;
      name: string;
      description: string;
      imageId?: string;
      mapX?: number;
      mapY?: number;
      unlocked: boolean;
    }>;
    npcs: Array<{
      id: string;
      name: string;
      role: string;
      description: string;
    }>;
  };

  currentScene: {
    id: string;
    turnNumber: number;
    locationId: string;
    narrative: string;
    choices: Array<{
      id: string;
      label: string;
      intent: string;
      riskLevel?: "low" | "medium" | "high";
    }>;
  };

  inventory: Array<{
    id: string;
    name: string;
    type: "weapon" | "armor" | "potion" | "quest" | "misc";
    description: string;
    statEffect?: {
      stat: string;
      value: number;
    };
    source: string;
  }>;

  quests: Array<{
    id: string;
    title: string;
    objective: string;
    status: "not_started" | "active" | "completed" | "failed";
  }>;
}
```

### games/{gameId}/turns/{turnId}

Stores turn history.

```ts
{
  turnNumber: number;
  selectedChoiceId: string;
  selectedChoiceLabel: string;
  sceneSummary: string;
  locationId: string;
  events: Array<{
    type: "combat" | "item_gain" | "item_loss" | "gold_change" | "xp_gain" | "quest_update" | "location_change";
    description: string;
  }>;
  diceRolls?: Array<{
    type: "attack" | "defense" | "skill_check";
    roll: number;
    modifier: number;
    total: number;
    outcome: "success" | "failure";
  }>;
  createdAt: Timestamp;
}
```

## 5. Gemini Integration Strategy

Gemini is used for narrative generation, not game-state authority.

Gemini may generate:

* Campaign seed
* Scene narration
* NPC dialogue
* Player choices
* Item descriptions
* Quest ideas
* Flavor text
* Combat narration

Gemini must not directly control:

* HP
* XP
* Gold
* Level
* Inventory updates
* Quest status
* Dice rolls
* Combat results
* Saved game state

Gemini responses should use structured JSON so the app can validate output before rendering or saving it.

Example response shape:

```ts
{
  narrative: string;
  choices: Array<{
    label: string;
    intent: string;
    riskLevel?: "low" | "medium" | "high";
  }>;
  suggestedEvents?: Array<{
    type: string;
    description: string;
  }>;
}
```

The app may use Gemini suggestions as input, but final state changes are calculated by the deterministic game engine.

## 6. Deterministic Game Engine Boundaries

The game engine owns all rule-based outcomes.

Game engine responsibilities:

* Apply class stats
* Roll dice
* Resolve combat
* Apply damage
* Award XP
* Award gold
* Add/remove inventory items
* Update quest status
* Update location
* Determine level-ups
* Save valid game state

Gemini can narrate the result, but the app calculates the result.

Example:

1. Player chooses “Attack the goblin with my sword.”
2. App rolls d20.
3. App applies attack modifier.
4. App determines hit/miss and damage.
5. Gemini narrates the result.
6. App saves updated HP, enemy state, and turn history.

## 7. Turn Processing Flow

### Standard Turn

1. Player selects a choice.
2. App disables choice buttons to prevent duplicate submission.
3. App records the selected choice.
4. App evaluates whether deterministic events are needed.
5. App applies game engine updates.
6. App sends validated context to Gemini.
7. Gemini returns narration and choices.
8. App validates Gemini response.
9. App updates current scene.
10. App saves game state and turn history to Firestore.
11. UI renders the new scene.

### Combat Turn

1. Player selects combat action.
2. App rolls d20.
3. App applies class/stat modifiers.
4. App calculates hit/miss.
5. App applies damage to enemy or player.
6. App determines whether combat continues, victory occurs, or defeat occurs.
7. Gemini generates combat narration.
8. App saves updated combat state.
9. UI displays dice roll, combat result, and next choices.

## 8. Error Handling

### Gemini Errors

If Gemini fails:

* Show a friendly retry message.
* Do not save a failed turn.
* Preserve current game state.
* Allow the user to retry the same choice.

### Invalid Gemini Response

If Gemini returns invalid or incomplete JSON:

* Reject the response.
* Show a retry option.
* Log the validation failure.
* Do not update saved game state.

### Firestore Save Errors

If Firestore save fails:

* Notify the user that progress could not be saved.
* Keep local state temporarily.
* Allow retry.
* Avoid advancing the game if save is required for consistency.

### Auth Errors

If authentication fails:

* Display a clear message.
* Do not expose technical Firebase error details directly to the user.
* Keep the user on the auth screen.

## 9. Security Considerations

### Authentication

* All game state belongs to an authenticated user.
* Users may only read and write their own game documents.

### Firestore Rules

Rules should enforce:

* `request.auth != null`
* `resource.data.userId == request.auth.uid`
* Users cannot access another user’s games
* Users cannot write invalid ownership data

### Gemini API Key

The Gemini API key should not be exposed in client-side code for production.

MVP options:

* Early local prototype may use environment variables for development only.
* Production-ready version should call Gemini through a backend layer such as Firebase Cloud Functions.

Recommended production flow:

```txt
React Client → Firebase Cloud Function → Gemini API → Cloud Function → React Client
```

### Data Validation

The app should validate:

* Gemini JSON shape
* Firestore write payloads
* Character creation fields
* Inventory item shape
* Quest status values
* Combat result values

## 10. MVP Folder Structure

```txt
src/
  app/
    App.tsx
    routes.tsx

  features/
    auth/
      AuthPage.tsx
      authService.ts

    character/
      CharacterCreationPage.tsx
      characterTypes.ts
      characterConfig.ts

    game/
      GamePage.tsx
      gameTypes.ts
      gameService.ts
      turnProcessor.ts

    campaign/
      campaignService.ts
      campaignTypes.ts

    combat/
      combatEngine.ts
      combatTypes.ts

    inventory/
      InventoryPanel.tsx
      inventoryTypes.ts

    quests/
      QuestPanel.tsx
      questTypes.ts

    gemini/
      geminiService.ts
      geminiPrompts.ts
      geminiSchemas.ts

  shared/
    components/
      FantasyButton.tsx
      FantasyCard.tsx
      LoadingState.tsx

    hooks/
      useAuth.ts
      useGame.ts

    firebase/
      firebaseConfig.ts
      firestorePaths.ts

    utils/
      dice.ts
      validators.ts

public/
  assets/
    portraits/
    locations/
    icons/
    ui/
    maps/

docs/
  srs.md
  user-stories.md
  architecture.md
  prompts.md
```

## 11. Future Architecture Considerations

Future improvements may include:

* Firebase Cloud Functions for secure Gemini calls
* Streaming Gemini responses
* More advanced combat system
* Equipment system
* Multiple save slots
* Campaign selection
* Player-created campaign seeds
* Branching quest trees
* Dynamic map unlocking
* Generated recap summaries
* Accessibility improvements
* Offline-first local cache
* Analytics for gameplay events
* Test coverage for combat and turn processing
* End-to-end tests for the MVP flow

## 12. Architecture Summary

QuestSmith separates creative generation from deterministic game logic.

Gemini provides the imagination.

The app provides the rules.

Firebase provides persistence.

React provides the player experience.

This architecture allows QuestSmith to feel dynamic and magical while remaining testable, maintainable, and safe to demo.
