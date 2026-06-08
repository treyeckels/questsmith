# MVP User Stories & Acceptance Criteria

## AI Dungeon Master RPG

## Epic 1: Authentication & User Accounts

### Story 1.1: Sign up with an account

As a new player, I want to create an account so that my character and campaign progress can be saved.

**Acceptance Criteria**

* User can create an account with email/password.
* User receives a clear error message if sign-up fails.
* On successful sign-up, the user is redirected to character creation or the active game.
* A Firebase Auth user is created.
* No game state is created until the user starts character creation.

### Story 1.2: Sign in to an existing account

As a returning player, I want to sign in so that I can resume my saved adventure.

**Acceptance Criteria**

* User can sign in with email/password.
* User receives a clear error message if sign-in fails.
* If the user has an active saved game, they are redirected to the game screen.
* If the user does not have a saved game, they are redirected to character creation.

### Story 1.3: Sign out

As a player, I want to sign out so that my account is secure on shared devices.

**Acceptance Criteria**

* User can sign out from the app.
* After sign-out, protected game screens are inaccessible.
* User is redirected to the sign-in screen.

---

## Epic 2: Character Creation

### Story 2.1: Create a character

As a player, I want to create a fantasy hero so that I can begin my adventure.

**Acceptance Criteria**

* User can enter a character name.
* User can select one class: Warrior, Rogue, or Mage.
* User can select a character portrait.
* User cannot continue without a valid name, class, and portrait.
* Character is saved to Firestore under the authenticated user.

### Story 2.2: Apply class-based starting stats

As a player, I want each class to feel different so that my choice matters.

**Acceptance Criteria**

* Warrior, Rogue, and Mage have different starting stats.
* Each class includes starting HP, attack modifier, defense modifier, and flavor description.
* Selected class determines initial character stats.
* Stats are displayed before the player confirms the character.

### Story 2.3: View character summary

As a player, I want to see my character details so that I understand my hero’s current state.

**Acceptance Criteria**

* Game UI displays character name, class, level, HP, XP, and gold.
* Character portrait is visible in the main game UI or character panel.
* Values reflect the latest saved game state.

---

## Epic 3: Random Campaign Generation

### Story 3.1: Generate a new campaign

As a player, I want the game to generate a new fantasy campaign so that each adventure feels unique.

**Acceptance Criteria**

* After character creation, the app requests a campaign seed from Gemini.
* Campaign includes title, starting location, main quest hook, initial objective, NPCs, and map locations.
* Campaign tone matches cozy fantasy, funny D&D chaos, and YA adventure.
* Campaign data is saved to Firestore.
* Gemini output is validated before being stored.

### Story 3.2: Start at the opening scene

As a player, I want to begin with a clear opening scene so that I know what is happening and what I can do next.

**Acceptance Criteria**

* Gemini generates an opening scene for the campaign.
* Opening scene includes narrative text and 2–4 player choices.
* Choices are displayed as tappable buttons.
* Current location is set to the campaign starting location.
* Turn count starts at 1.

---

## Epic 4: Core Gameplay Loop

### Story 4.1: Choose an action

As a player, I want to choose what my character does next so that I can shape the story.

**Acceptance Criteria**

* Current scene displays 2–4 available choices.
* User can select one choice.
* Selected choice is stored in turn history.
* App prevents duplicate submissions while the next scene is loading.

### Story 4.2: Generate the next scene

As a player, I want Gemini to narrate what happens next so that the adventure feels dynamic.

**Acceptance Criteria**

* App sends current game state and selected choice to Gemini.
* Gemini returns scene narration, NPC dialogue when appropriate, and new choices.
* Gemini does not directly overwrite HP, XP, gold, inventory, level, or quest state.
* App displays the new scene after successful response.
* Updated scene is saved to Firestore.

### Story 4.3: Track turn history

As a player, I want my adventure history saved so that the game can maintain continuity.

**Acceptance Criteria**

* Each turn stores selected choice, resulting scene summary, timestamp, location, and relevant game events.
* Turn history is saved to Firestore.
* MVP supports at least 10–15 turns in a campaign.

---

## Epic 5: Deterministic Game Engine

### Story 5.1: Maintain game state

As a player, I want the app to consistently track my stats and progress so that the game rules feel fair.

**Acceptance Criteria**

* App stores HP, inventory, gold, XP, level, quest status, location, dice rolls, and combat state.
* Gemini can suggest narrative consequences, but the app determines actual state changes.
* State updates are saved after each turn.
* UI reflects the latest state after each update.

### Story 5.2: Apply rewards and penalties

As a player, I want choices to have consequences so that the game feels interactive.

**Acceptance Criteria**

* App can add or remove gold.
* App can add or remove inventory items.
* App can add XP.
* App can reduce or restore HP.
* All changes are shown to the user in the UI.

---

## Epic 6: Combat

### Story 6.1: Trigger a basic combat encounter

As a player, I want to encounter enemies so that the adventure has stakes.

**Acceptance Criteria**

* Gemini can suggest a combat encounter.
* App creates enemy state with name, HP, attack modifier, and reward values.
* Combat encounter is displayed clearly to the player.
* Player can choose to attack or attempt another available action.

### Story 6.2: Resolve combat with visible dice rolls

As a player, I want combat to use visible dice rolls so that outcomes feel fair and fun.

**Acceptance Criteria**

* App rolls a virtual d20 for attacks.
* Dice roll is displayed to the player.
* App applies class/stat modifiers.
* App determines hit, miss, damage, and enemy defeat.
* Gemini may narrate the result but does not determine the numerical outcome.

### Story 6.3: Complete combat

As a player, I want combat to end clearly so that I understand the result.

**Acceptance Criteria**

* Combat ends when enemy HP reaches 0 or player HP reaches 0.
* On victory, player may receive XP, gold, or item rewards.
* On defeat, MVP displays a simple defeat state or recovery option.
* Combat outcome is saved to Firestore.

---

## Epic 7: Inventory

### Story 7.1: View inventory

As a player, I want to view my items so that I know what I have collected.

**Acceptance Criteria**

* Inventory screen or panel lists all current items.
* Each item displays name, type, and description.
* Empty inventory state is handled gracefully.

### Story 7.2: Gain an item

As a player, I want to receive items from choices, quests, or combat so that my adventure feels rewarding.

**Acceptance Criteria**

* App can add an item to inventory.
* Item includes name, type, description, optional stat effect, and source.
* Gemini can generate item flavor text.
* App validates item structure before saving.

### Story 7.3: Lose or consume an item

As a player, I want items to be removable so that inventory reflects story consequences.

**Acceptance Criteria**

* App can remove an item from inventory.
* Removed items no longer appear in the inventory UI.
* Item removal is recorded in turn history.

---

## Epic 8: Quest Progression

### Story 8.1: Track current quest

As a player, I want to know my current objective so that I understand what I am trying to accomplish.

**Acceptance Criteria**

* Game displays current quest title and objective.
* Quest has status: not started, active, completed, or failed.
* Quest data is saved in Firestore.

### Story 8.2: Update quest status

As a player, I want my quest to progress based on choices and outcomes so that the story feels meaningful.

**Acceptance Criteria**

* App can update quest status based on deterministic game events.
* Gemini can suggest quest progression, but app validates and applies updates.
* Quest changes are shown to the player.
* Quest changes are stored in turn history.

---

## Epic 9: Persistence & Resume Game

### Story 9.1: Save game after each turn

As a player, I want my game to save automatically so that I do not lose progress.

**Acceptance Criteria**

* Game state is saved to Firestore after character creation.
* Game state is saved after campaign generation.
* Game state is saved after each completed turn.
* User receives a clear error if saving fails.

### Story 9.2: Resume saved game

As a returning player, I want to resume my game so that I can continue my adventure later.

**Acceptance Criteria**

* On sign-in, app checks for an active saved game.
* If saved game exists, app loads character, campaign, scene, choices, inventory, quest, and location state.
* User resumes at the most recent scene.
* User does not need to regenerate the campaign.

---

## Epic 10: Visual Design & Game Feel

### Story 10.1: Display fantasy-themed game UI

As a player, I want the app to feel like a fantasy adventure so that the experience is immersive.

**Acceptance Criteria**

* UI uses fantasy-inspired styling.
* Main game screen prioritizes story text and choices.
* UI is mobile-first and responsive.
* Text is readable on mobile devices.
* Loading states feel polished and thematic.

### Story 10.2: Display static fantasy assets

As a player, I want to see images that support the story so that the game feels more alive.

**Acceptance Criteria**

* App displays character portraits.
* App displays static location images.
* App displays a campaign map.
* Missing assets have graceful fallbacks.
* No AI-generated images are created during gameplay for MVP.

---

## Epic 11: Gemini Integration Safety & Reliability

### Story 11.1: Use structured Gemini responses

As a developer, I want Gemini responses to follow a predictable structure so that the app can safely parse and display them.

**Acceptance Criteria**

* Gemini prompts request structured JSON responses.
* App validates required fields before updating game state.
* Invalid responses show a retry or fallback state.
* Gemini narrative content is separated from deterministic state updates.

### Story 11.2: Handle Gemini failure

As a player, I want the app to recover gracefully if AI generation fails so that my game does not break.

**Acceptance Criteria**

* App shows a friendly error message if Gemini request fails.
* User can retry the request.
* Existing saved game state is not corrupted.
* Failed AI responses are not committed as completed turns.

---

## Epic 12: MVP Demo Readiness

### Story 12.1: Provide a playable interview demo

As a developer, I want the MVP to be demo-ready so that I can show my AI-assisted development workflow during interviews.

**Acceptance Criteria**

* User can complete the full MVP flow from sign-up to gameplay.
* Demo supports at least 10–15 turns.
* Demo includes character creation, campaign generation, choices, combat, inventory changes, and resume.
* README explains the hybrid AI architecture.
* Repo includes SRS, user stories, architecture notes, and prompt strategy.
