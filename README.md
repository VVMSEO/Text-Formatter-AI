# Text Formatter AI

A production-ready AI service for improving the readability of long, unstructured text.

## Features
- **AI-Powered Formatting**: Intelligent structuring into semantic sections.
- **Multiple Modes**: Light, Standard, and Deep formatting depths.
- **Custom Styles**: Article, Blog, Product Page, FAQ, or Neutral.
- **Firebase Auth**: Google Sign-in for persistent history.
- **Firestore History**: Save and manage your formatting history.
- **Comparison Mode**: Side-by-side view of original vs. formatted text.
- **Markdown Support**: Beautifully rendered output.
- **Secure Processing**: Gemini API keys are handled server-side.

## Technical Stack
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Express (Development) / Firebase Cloud Functions (Production)
- **Database**: Firebase Cloud Firestore
- **Auth**: Firebase Authentication (Google)
- **AI**: Gemini 2.0 Flash via `@google/genai`

## Setup & Configuration

### Environment Variables
For the local development server (`server.ts`) to work, you must provide:
- `GEMINI_API_KEY`: Obtain from [Google AI Studio](https://aistudio.google.com/).

### Connecting Firebase
The project is configured to use Firebase for Authentication (Google) and Firestore (History).
1. Create a Firebase project at the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Google Auth** in the Authentication section.
3. Create a **Cloud Firestore** database (Enterprise edition recommended).
4. Update `firebase-applet-config.json` with your project's configuration (apiKey, appId, etc.).
5. Deploy security rules: `firebase deploy --only firestore:rules`.

## Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file from `.env.example`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Firebase Setup**:
   The `firebase-applet-config.json` should contain your Firebase project credentials.

4. **Run the App**:
   ```bash
   npm run dev
   ```

## GitHub Pages & Firebase Deployment

Since GitHub Pages only hosts static content, you need to separate the frontend from the AI logic.

### 1. Backend: Deploying to Firebase Cloud Functions
To keep your Gemini API key secure, move the logic from `server.ts` to a Cloud Function.

- Initialize Firebase Functions: `firebase init functions`
- Port the `/api/format` route to a Firebase HTTPS function.
- Set the `GEMINI_API_KEY` in Firebase config: `firebase functions:config:set gemini.key="YOUR_KEY"`

### 2. Frontend: Configure for GitHub Pages

- **Update API URL**: In `src/services/api.ts`, change the fetch URL to your deployed Cloud Function endpoint.
- **Vite Base Path**: Update `vite.config.ts` if your app is hosted at `username.github.io/repo-name/`:
  ```ts
  export default defineConfig({
    base: "/repo-name/",
    // ...
  });
  ```
- **Build and Deploy**:
  ```bash
  npm run build
  # Use the 'gh-pages' package or actions to deploy the 'dist' folder
  ```

## Firebase Security Rules
Ensure the `firestore.rules` file is deployed to your project to restrict access to user data.
```bash
firebase deploy --only firestore:rules
```

## Internal AI Prompt
The application uses a sophisticated prompt template:
> "You are a professional editor... Reformat the text to improve readability... Preserve meaning... Add headings, subheadings, bullet lists... maintain original language..."
