# Jankhali Premier League — Auction App

A GitHub-ready React + Firebase real-time cricket auction app.

## Features
- 4 teams, default purse ৳2,000 each
- Admin creates/renames teams
- Add/edit/delete players
- Base price and player category
- Live bidding in ৳50 increments
- Automatic purse deduction on SOLD
- Team squad and auction status
- Responsive mobile UI

## 1. Install
```bash
npm install
npm run dev
```

## 2. Firebase
Create a Firebase project and enable:
- Authentication → Anonymous
- Firestore Database

Create a web app in Firebase and copy its config.

Create `.env.local` from `.env.example`:
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 3. Firestore
For a private tournament, start with Firebase Authentication and secure Firestore rules before publishing publicly. The demo app uses anonymous authentication.

## 4. Deploy to GitHub
Push the project to a GitHub repository. For deployment, Vercel is recommended because it handles Vite builds and environment variables easily.

Build:
```bash
npm run build
```

## Important
This is a functional V1 foundation. For a public tournament, add real admin authentication, role-based permissions, validated server-side bidding/transactions, and secure Firestore rules before relying on it for live money/prize decisions.
