# Software Requirements Specification

## Project: AI Dungeon Master RPG

### 1. Product Summary

AI Dungeon Master RPG is a mobile-first, single-player choose-your-own-adventure fantasy game where the player is the hero of a cozy, funny, YA-style fantasy campaign. Gemini acts as the AI Dungeon Master, generating scenes, choices, dialogue, quest ideas, and item descriptions, while the application controls deterministic game systems including HP, inventory, gold, XP, levels, quest status, location, dice rolls, combat, and saved progress.

### 2. MVP Goal

The MVP is complete when a user can create an account, create a character, start a randomly generated campaign, play 10–15 turns, make choices, gain or lose items, survive basic roll-based combat, and resume their game later.

### 3. Target Platform

The application will be mobile-first and responsive for desktop.

### 4. Core Technologies

* React
* Firebase Authentication
* Firestore
* Firebase Hosting
* Gemini API
* Static fantasy image assets

### 5. MVP Features

#### 5.1 Authentication

Users must be able to create an account and sign in so their game state can persist across sessions.

#### 5.2 Character Creation

Users must be able to create a character with:

* Name
* Class: Warrior, Rogue, or Mage
* Starting stats
* Character portrait

Each class should have different starting stats and flavor.

#### 5.3 Random Campaign Generation

The game should generate a new cozy fantasy adventure campaign for each player. The campaign should have:

* Starting location
* Main quest hook
* Tone: cozy fantasy, funny D&D chaos, YA adventure
* Initial NPCs
* Initial objective
* Map/location structure

#### 5.4 Core Gameplay Loop

The core gameplay loop is:

1. Player reads the current scene.
2. Player selects one of several choices.
3. The app resolves deterministic effects such as dice rolls, combat, inventory updates, HP changes, XP, gold, quest progression, or location changes.
4. Gemini generates the next scene, dialogue, item descriptions, and possible choices.
5. Updated game state is saved to Firebase.

#### 5.5 Gemini Dungeon Master

Gemini should generate:

* Scene narration
* Player choices
* NPC dialogue
* Item descriptions
* Quest ideas
* Flavor text

Gemini should not be the source of truth for deterministic game state.

#### 5.6 Deterministic Game Engine

The app must control:

* HP
* Inventory
* Gold
* XP
* Level
* Quest status
* Current location
* Dice rolls
* Combat outcomes
* Saved game state

#### 5.7 Combat

MVP combat should be simple and roll-based.

Combat should include:

* Enemy encounter
* Visible dice roll
* Attack result
* HP changes
* Win/loss outcome
* Basic rewards such as XP, gold, or item drops

#### 5.8 Inventory

Users should be able to gain, lose, and view inventory items.

Items should include:

* Name
* Type
* Description
* Optional stat effect
* Source scene or quest

#### 5.9 Quest Progression

The game should track the player’s current quest status.

Quest status may include:

* Not started
* Active
* Completed
* Failed

#### 5.10 Game Persistence

Game state must persist in Firebase so users can resume later.

Saved state should include:

* User ID
* Character data
* Campaign data
* Current scene
* Current choices
* Inventory
* HP
* Gold
* XP
* Level
* Quest status
* Location
* Turn history

#### 5.11 Visual Design

The game should use static fantasy assets, including:

* Location images
* Character portraits
* Campaign map
* Fantasy-inspired UI styling

The initial UI should prioritize a polished story experience over complex RPG systems.

### 6. Non-Goals for MVP

The MVP will not include:

* Multiplayer
* Real-time co-op
* Complex tactical combat
* Full equipment system
* Player-created campaigns
* AI-generated images during gameplay
* Marketplace or monetization
* Voice narration
* Advanced animation system

### 7. MVP Success Criteria

The MVP is successful if:

* A user can sign up or log in.
* A user can create a character.
* A user can start a randomized campaign.
* Gemini generates coherent scenes and choices.
* The app preserves deterministic game state.
* A user can play 10–15 turns.
* A user can encounter and survive basic combat.
* A user can gain or lose inventory items.
* A user can resume their game after closing the app.
* The app feels polished enough to demo in an interview.

### 8. Interview Talking Point

This project demonstrates a hybrid AI architecture where an LLM generates narrative content while a deterministic game engine controls rules, state, combat, inventory, progression, and persistence.
