# Dictation Manager Architecture

This document provides an overview of the Dictation Manager application's technical architecture, explaining the design decisions, component structure, and data flow.

## Technology Stack

Dictation Manager is built using the following technologies:

- **Frontend Framework**: Next.js 14 with App Router
- **UI Library**: React 18
- **Type System**: TypeScript
- **Styling**: Tailwind CSS with Shadcn UI components
- **State Management**: React Context and custom hooks
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Storage**: Firebase Storage
- **API**: Next.js API Routes
- **Internationalization**: next-intl
- **Deployment**: Vercel (or Firebase Hosting)

## Application Architecture

### High-Level Architecture

The application follows a modern client-server architecture built on Next.js:

```
┌─────────────────────────────────────┐
│              Client                 │
│  ┌─────────────┐    ┌─────────────┐ │
│  │  Next.js    │    │  React      │ │
│  │  Pages      │◄───┤  Components │ │
│  └─────────────┘    └─────────────┘ │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│           Server/API                │
│  ┌─────────────┐    ┌─────────────┐ │
│  │  Next.js    │    │  Firebase   │ │
│  │  API Routes │◄───┤  Admin SDK  │ │
│  └─────────────┘    └─────────────┘ │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│           Data Storage              │
│  ┌─────────────┐    ┌─────────────┐ │
│  │  Firestore  │    │  Firebase   │ │
│  │  Database   │    │  Storage    │ │
│  └─────────────┘    └─────────────┘ │
└─────────────────────────────────────┘
```

### Directory Structure

The application follows a feature-based directory structure:

```
src/
├── app/                # Next.js App Router files
│   ├── api/            # API routes
│   │   ├── auth/       # Authentication API
│   │   └── dictation/  # Dictation game API
│   ├── dictation/      # Dictation game pages
│   │   ├── create/     # Create game page
│   │   ├── edit/       # Edit game page
│   │   └── play/       # Play game page
│   └── ...             # Other app pages
├── components/         # React components
│   ├── dictation/      # Dictation-specific components
│   │   ├── DictationForm.tsx
│   │   ├── GameCard.tsx
│   │   ├── GameContainer.tsx
│   │   ├── GameView.tsx
│   │   └── ...
│   ├── ui/             # UI components (shadcn)
│   └── ...             # Other components
├── lib/                # Utility functions and libraries
│   ├── firebase.ts     # Firebase configuration
│   ├── types.ts        # TypeScript types
│   └── ...
├── i18n/               # Internationalization config
└── ...
```

## Component Architecture

### Core Components

1. **GameContainer**: The main container for dictation games
   - Manages game state and lifecycle
   - Handles play count tracking
   - Toggles between pre-game and active game states

2. **GameView**: The active game play component
   - Implements game mechanics (time, lives, scoring)
   - Handles user input and validation
   - Displays game progress and results

3. **DictationForm**: Form for creating and editing dictation games
   - Manages form state and validation
   - Handles API interactions for saving, updating, and deleting games
   - Provides content generation functionality

4. **WordPairList**: Component for managing word pairs
   - Allows adding, editing, and removing word pairs
   - Supports file upload for bulk word pair creation

5. **GameCard**: Display card for dictation games in lists
   - Shows game metadata and statistics
   - Provides action buttons for play, edit, delete

## Data Flow

### Creating a Dictation Game

1. User fills out the DictationForm with game details
2. Form data is validated using client-side validation
3. On submission, data is sent to `/api/dictation/create` endpoint
4. Server validates the data and creates a new document in Firestore
5. User is redirected to their games list or the edit page

### Playing a Dictation Game

1. User selects a game to play, navigating to `/dictation/play/[id]`
2. Server fetches game data from Firestore and passes it to the client
3. GameContainer initializes the game state
4. When user starts the game, play count is incremented via API call
5. GameView handles the gameplay logic, tracking progress and score
6. On game completion, results are displayed to the user

## Database Schema

### Firestore Collections

- **users**: User profile information
  ```
  users/{userId}
  {
    displayName: string,
    email: string,
    photoURL?: string,
    createdAt: timestamp
  }
  ```

- **dictation_games**: Dictation game data
  ```
  dictation_games/{gameId}
  {
    userId: string,
    title: string,
    description?: string,
    sourceLanguage: string,
    targetLanguage: string,
    wordPairs: [
      {
        first: string,
        second: string,
        sentence?: string
      }
    ],
    quizParameters: {
      globalTimeLimit: number,
      globalLivesLimit: number,
      activityTimeLimit: number,
      quizModeEnabled: boolean
    },
    createdAt: timestamp,
    updatedAt: timestamp,
    isPublic: boolean,
    playCount: number
  }
  ```

## Authentication Flow

1. User signs in using Firebase Authentication (email/password or Google provider)
2. Upon successful authentication, a session cookie is set
3. Protected routes and API endpoints verify the authentication state
4. User-specific data is fetched based on the authenticated user's ID

## API Endpoints

### Dictation Game Endpoints

- **GET /api/dictation/play/{id}**
  - Retrieves a dictation game by ID
  - Returns game data or 404 if not found

- **POST /api/dictation/play/{id}**
  - Increments the play count for a dictation game
  - Returns success status

- **POST /api/dictation/create**
  - Creates a new dictation game
  - Requires authentication
  - Returns the created game ID

- **POST /api/dictation/generate-content**
  - Generates word pairs using AI (OpenAI integration)
  - Requires authentication
  - Returns generated content

## Performance Considerations

- Server-side rendering for initial page load
- Client-side navigation for subsequent page transitions
- Firebase SDK initialized only when needed
- React.memo() for performance-critical components
- Next.js image optimization for media assets

## Security Considerations

- Firebase Authentication for user management
- Firestore security rules to restrict data access
- API routes validated server-side
- Content sanitization for user-generated content
- Environment variables for sensitive configuration

## Internationalization

The application uses next-intl for internationalization:

- Translation files stored in the `messages/` directory
- Language selector for user preferences
- Server-side rendering respects user's language preference
- Date and number formatting adapted to locale

## Future Architecture Considerations

- Migration to Firebase v9 modular SDK
- Implementation of a service worker for offline support
- Server Components optimization
- Streaming SSR for improved performance
- Implementing WebSockets for real-time features 