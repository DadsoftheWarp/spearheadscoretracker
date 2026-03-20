# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start local dev server (Vite)
npm run build        # Production build → dist/
npm run lint         # Run ESLint
npm run preview      # Preview production build locally
npm run ship         # Build + deploy (Firebase) + commit + push in one step
```

Deploy manually:
```bash
firebase deploy      # Deploy dist/ to Firebase Hosting
```

## Architecture

React 19 + Vite PWA, deployed to Firebase Hosting. No server-side code — all logic runs in the browser.

**State management:** All core state lives in `App.jsx` (current screen, game data, player records, auth state, active group). State is passed down as props; there is no Context or Redux.

**Screens** (`src/components/`): `HomeScreen` → `GameSetupScreen` → `GameScreen` → `GameSummaryScreen`. `RecordsScreen` and `GroupScreen` are accessible from Home. Screen transitions are controlled by a `currentScreen` string in `App.jsx`.

**Persistence:**
- `localStorage`: Game history and player records (local, no auth required)
- Firestore (`src/firebase.js`): Group game history synced across members. Collection path: `groups/{groupId}/games`
- Firebase Auth: Google Sign-In only; persisted via `browserLocalPersistence`

**Game data** (`src/data/factions.js`): Static data for 4 alliances, 21+ factions, and 40+ Spearhead teams (each team has a general and unit roster). This file is large — search it before adding faction/team data.

**Key data shapes:**

Game object saved to storage:
```js
{ id, date, player1: { name, faction, spearhead, alliance }, player2: { ... },
  winner: 'player1'|'player2'|'draw', priorities: [{ winner, firstTurn }, ...],
  realmSet, realmLabel, map }
```

Group (Firestore document in `groups/`):
```js
{ name, inviteCode, createdBy, members: [uid], createdAt, games: [...] }
```

**Audio** (`src/utils/sounds.js`): Web Audio API only — no audio files. Generates tones procedurally. Call `playSound('scoreUp')`, `playSound('diceRoll')`, etc.

**Custom hooks** (`src/hooks/`):
- `useAuth()` — Firebase auth state + Google sign-in/out with popup-then-redirect fallback
- `useLocalStorage()` — Syncs React state to `localStorage`

## Deployment

The `ship.sh` script does: `npm run build` → `firebase deploy` → `git add/commit/push`. Run `npm run ship` for a full release.
