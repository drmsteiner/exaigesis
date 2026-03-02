# exAIgesis Deployment Guide

## Prerequisites

Before deploying, you need to complete these manual setup steps in the Firebase Console:

### 1. Upgrade to Blaze Plan
Cloud Functions and Firebase Hosting with Next.js require the Blaze (pay-as-you-go) plan.

1. Go to: https://console.firebase.google.com/project/exaigesis-seu/usage/details
2. Click "Upgrade" and add a billing account
3. Don't worry - Firebase has generous free tiers and you likely won't be charged anything for development/low traffic

### 2. Enable Firebase Authentication
1. Go to: https://console.firebase.google.com/project/exaigesis-seu/authentication
2. Click "Get Started"
3. Enable these sign-in methods:
   - **Email/Password**: Click > Enable > Save
   - **Google**: Click > Enable > Add your email as support email > Save

### 3. Set Up Firebase Storage
1. Go to: https://console.firebase.google.com/project/exaigesis-seu/storage
2. Click "Get Started"
3. Select "Start in production mode"
4. Choose location: us-east1 (or your preferred region)
5. Click "Done"

## Deployment Commands

Once the prerequisites are complete, run these commands:

```bash
# Deploy Firestore rules and indexes
firebase deploy --only firestore

# Deploy Storage rules
firebase deploy --only storage

# Deploy Cloud Functions
firebase deploy --only functions

# Deploy the full app (hosting + functions)
firebase deploy
```

## Local Development

### Running the App Locally
```bash
npm run dev
```

### Running with Firebase Emulators
```bash
# Start all emulators
firebase emulators:start

# The app will be available at:
# - Next.js App: http://localhost:3000
# - Emulator UI: http://localhost:4000
# - Auth Emulator: http://localhost:9099
# - Firestore Emulator: http://localhost:8080
# - Functions Emulator: http://localhost:5001
# - Storage Emulator: http://localhost:9199
```

### Connecting to Emulators
To use emulators instead of production Firebase, set these environment variables in `.env.local`:

```env
NEXT_PUBLIC_USE_EMULATORS=true
```

## Ollama Setup (for AI Chat)

The AI chat feature requires Ollama running locally with the MiniMax M2.5 model:

```bash
# Start Ollama (if not running)
ollama serve

# Pull the MiniMax model (one-time setup)
ollama pull minimax-m2.5:cloud
```

## Environment Variables

Create a `.env.local` file with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=exaigesis-seu.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=exaigesis-seu
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=exaigesis-seu.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Ollama configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=minimax-m2.5:cloud
```

## Troubleshooting

### "Firebase Storage has not been set up"
Follow step 3 in Prerequisites above.

### "Project must be on Blaze plan"
Follow step 1 in Prerequisites above.

### "Sign-in method not enabled"
Follow step 2 in Prerequisites above.

### AI Chat not working
1. Make sure Ollama is running: `ollama serve`
2. Check if the model is installed: `ollama list`
3. If not installed: `ollama pull minimax-m2.5:cloud`
