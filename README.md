# Spearhead Score Tracker

A mobile-first score tracking app for **Age of Sigmar: Spearhead**. Track Victory Points, Battle Tactics, and Twist Points across all four rounds, record player win/loss history, and review game stats — all offline from your iPad or phone.

---

## Features

- Round-by-round scoring (VP, Battle Tactics, Twist Points)
- Faction and named Spearhead team selection
- Priority roll tracker with double-turn detection
- Coin flip and D6 roller with sound effects
- Previous round recap with undo support
- Game summary with per-round score breakdown and priority history
- Player records with win streaks, team stats, head-to-head records, and priority/first-turn impact
- Fully offline — works without an internet connection once installed

---

## Installing on iPad (PWA)

The app is a Progressive Web App (PWA) and can be installed directly to your iPad home screen — no App Store required.

### Step 1 — Open in Safari

Navigate to the app URL in **Safari** on your iPad. (PWA installation requires Safari; Chrome and other browsers on iOS do not support it.)

### Step 2 — Tap the Share button

Tap the **Share** icon (the box with an arrow pointing up) in the Safari toolbar.

### Step 3 — Add to Home Screen

Scroll down in the share sheet and tap **"Add to Home Screen"**.

### Step 4 — Confirm

Give it a name (it defaults to "Spearhead") and tap **Add**. The app icon will appear on your home screen.

### Step 5 — Open and use offline

Launch the app from your home screen. It runs in full-screen mode with no browser chrome and works completely offline once loaded.

> **iOS 16.4 or later** is required for full PWA support.

---

## Installing on Android

1. Open the app in **Chrome**.
2. Tap the three-dot menu → **"Add to Home screen"** (or accept the install banner if it appears).
3. Tap **Add**.

---

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Production build
npm run build

# Regenerate app icons from public/icon.svg
npm run generate-icons
```

## Tech Stack

- React 19 + Vite 7
- CSS Modules
- vite-plugin-pwa + Workbox (service worker, offline support)
- Web Audio API (sound effects)
- localStorage (game history and records)
