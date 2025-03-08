# Getting Started with Dictation Manager

This guide will help you set up the Dictation Manager application for development or personal use.

## Prerequisites

Before installing Dictation Manager, ensure you have the following:

- Node.js (version 18 or higher)
- npm, yarn, or pnpm package manager
- Git (for cloning the repository)
- Firebase account (for database and authentication)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/AceDZN/dictation-master.git
cd dictation-manager
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Using yarn:
```bash
yarn install
```

Using pnpm:
```bash
pnpm install
```

### 3. Configure Firebase

1. Create a new project in the [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password and Google provider)
3. Create a Firestore database
4. Set up Storage

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory of the project with the following variables:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (for server-side operations)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key

# Next Auth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret

# Optional: OpenAI API Key (for content generation)
OPENAI_API_KEY=your_openai_api_key
```

To obtain these values:

1. Firebase Web SDK config can be found in your Firebase project settings
2. For the Firebase Admin SDK, create a service account in the Firebase Console and download the JSON file

### 5. Security Rules

Configure Firebase security rules for Firestore and Storage. Sample rules are provided in:

- `firestore.rules` - For Firestore database rules
- `storage.rules` - For Firebase Storage rules

Deploy these rules using the Firebase CLI:

```bash
firebase deploy --only firestore:rules,storage
```

## Running the Application

### Development Mode

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
# or
yarn build
yarn start
# or
pnpm build
pnpm start
```

## Firebase Emulator (Optional)

For local development without affecting your production Firebase instance:

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Start the Firebase emulator:
```bash
firebase emulators:start
```

4. Update your `.env.local` to point to the emulator:
```
NEXT_PUBLIC_FIREBASE_EMULATOR_HOST=localhost
NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT=9099
NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT=8080
```

## Next Steps

After setting up the application:

1. Create an account through the application
2. Create your first dictation game
3. Explore the features and customize your experience

For detailed usage instructions, refer to the [User Guide](./user-guide.md). 