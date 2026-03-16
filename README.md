# Age of Sigmar: Spearhead Score Tracker

**Live app: https://spearheadscoretracker.web.app**

A mobile-first score tracking app for **Age of Sigmar: Spearhead**, presented by Dads of the Warp. Track Victory Points, Battle Tactics, and Twist Points across all four rounds, record player win/loss history, sign in with Google, and share game history with your gaming group.

---

## Features

- Round-by-round scoring (VP, Battle Tactics, Twist Points)
- Faction and named Spearhead team selection
- Priority roll tracker with double-turn detection
- Coin flip and D6 roller with sound effects
- Previous round recap with undo support
- Game summary with per-round score breakdown and priority history
- Player records with win streaks, team stats, head-to-head records, and priority/first-turn impact
- **Google Sign-In** to sync game history with your group
- **Groups** — create or join a group so everyone shares a game history
- Fully offline — works without an internet connection once installed

---

## Installing on Your Phone (Recommended)

The app is a Progressive Web App (PWA) — install it directly to your home screen for a full-screen, native app-like experience with no App Store required.

### iPhone / iPad (Safari)

1. Open **Safari** and go to https://spearheadscoretracker.web.app
2. Tap the **Share** button (box with an arrow pointing up) at the bottom of the screen
3. Scroll down and tap **Add to Home Screen**
4. Tap **Add** in the top right corner

> PWA installation requires Safari. Chrome and other browsers on iOS do not support "Add to Home Screen."
> iOS 16.4 or later is required for full PWA support.

### Android (Chrome)

1. Open **Chrome** and go to https://spearheadscoretracker.web.app
2. Tap the three-dot menu (⋮) in the top right corner
3. Tap **Add to Home screen** (or accept the install banner if it appears)
4. Tap **Add**

---

## Signing In & Groups

1. Open the app and tap **Sign In with Google** at the bottom of the home screen
2. Sign in with your Google account in the popup that opens
3. Once signed in, a **Groups** button will appear on the home screen
4. Tap **Groups** to either:
   - **Create** a new group — you'll receive a 6-character invite code to share with friends
   - **Join** an existing group — enter the invite code a friend shared with you
5. Once in a group, all games you record are automatically shared and visible in the **Records** screen for every group member

---

## Development

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Production build
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Build + deploy + git commit + push in one step
npm run ship "your commit message"

# Regenerate app icons from public/icon.svg
npm run generate-icons
```

## Tech Stack

- React 19 + Vite 7
- CSS Modules
- Firebase Authentication (Google Sign-In)
- Firebase Firestore (group game history)
- vite-plugin-pwa + Workbox (service worker, offline support)
- Web Audio API (sound effects)
- localStorage (local game history and records)
