# Dictation Manager Development Guide

This guide provides information for developers who want to contribute to or extend the Dictation Manager application.

## Development Environment Setup

### Prerequisites

- Node.js 18.x or higher
- Git
- Firebase account
- Visual Studio Code (recommended) or another IDE
- Basic knowledge of:
  - Next.js
  - React
  - TypeScript
  - Firebase
  - Tailwind CSS

### Setting Up Your Development Environment

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/dictation-manager.git
   cd dictation-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env.local` and fill in the variables.

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

## Project Structure

### Core Directories

- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components
- `src/lib/` - Utility functions and types
- `src/i18n/` - Internationalization configuration
- `messages/` - Translation files

### Key Files

- `src/app/layout.tsx` - Root layout component
- `src/lib/types.ts` - TypeScript type definitions
- `src/middleware.ts` - Next.js middleware for authentication and localization
- `firestore.rules` - Firestore security rules
- `storage.rules` - Firebase Storage security rules

## Component Development

### Component Design Principles

1. **Single Responsibility**: Components should have a single responsibility.
2. **Reusability**: Build components that can be reused in multiple contexts.
3. **Prop Typing**: Always define TypeScript interfaces for component props.
4. **Server vs Client Components**: Use server components when possible, add `'use client'` directive only when needed.

### Creating a New Component

1. Determine if the component should be a client or server component.
2. For client components, add the `'use client'` directive at the top of the file.
3. Define a TypeScript interface for the component props.
4. Implement the component using functional component syntax.
5. Add appropriate comments and documentation.

Example:

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface ExampleComponentProps {
  initialValue: number
  onChange?: (value: number) => void
}

export function ExampleComponent({ 
  initialValue, 
  onChange 
}: ExampleComponentProps) {
  const [value, setValue] = useState(initialValue)
  
  const handleClick = () => {
    const newValue = value + 1
    setValue(newValue)
    if (onChange) {
      onChange(newValue)
    }
  }
  
  return (
    <div className="p-4 border rounded">
      <p>Current value: {value}</p>
      <Button onClick={handleClick}>Increment</Button>
    </div>
  )
}
```

### UI Components

The project uses Shadcn UI components. To add new UI components:

```bash
npx shadcn-ui@latest add [component-name]
```

## State Management

### Local State

Use React's built-in state management:
- `useState` for simple state
- `useReducer` for complex state logic
- `useContext` for shared state across components

### Server-side State

For server-side state and data fetching, use:
- Next.js API routes
- Server components
- React Server Components data fetching

## API Development

### Creating a New API Endpoint

1. Create a new file in the appropriate directory under `src/app/api/`.
2. Implement the necessary HTTP method handlers (GET, POST, etc.).
3. Add proper validation and error handling.
4. Document the endpoint in the API reference.

Example:

```tsx
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET(req: NextRequest) {
  // Check authentication
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  
  try {
    // Process the request
    const data = { message: 'Example API response' }
    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
```

## Database Operations

### Firestore Access Patterns

Access Firestore using the Firebase Admin SDK on the server side:

```tsx
import { db } from '@/lib/firebase-admin'

// Get a document
const docRef = db.collection('dictation_games').doc('game-id')
const doc = await docRef.get()
const data = doc.data()

// Create a document
await db.collection('dictation_games').add({
  title: 'New Game',
  createdAt: new Date(),
  // ...other fields
})

// Update a document
await docRef.update({
  title: 'Updated Title'
})

// Delete a document
await docRef.delete()
```

### Security Rules

When modifying data structures, ensure you update the Firestore security rules in `firestore.rules`:

```
service cloud.firestore {
  match /databases/{database}/documents {
    match /dictation_games/{gameId} {
      allow read: if resource.data.isPublic == true || 
                  request.auth.uid == resource.data.userId;
      allow write: if request.auth.uid == resource.data.userId;
    }
  }
}
```

## Authentication

The application uses Firebase Authentication. When working with authenticated routes:

1. On the client side, use the authentication context:
   ```tsx
   'use client'
   import { useAuth } from '@/lib/auth'
   
   export function ProfileButton() {
     const { user, signOut } = useAuth()
     
     if (!user) return null
     
     return (
       <button onClick={signOut}>
         Logout {user.displayName}
       </button>
     )
   }
   ```

2. On the server side, check authentication in API routes:
   ```tsx
   import { auth } from '@/lib/firebase-admin'
   
   // Verify the session cookie
   const idToken = request.cookies.get('session')?.value || ''
   try {
     const decodedToken = await auth.verifyIdToken(idToken)
     const uid = decodedToken.uid
     // Process authenticated request
   } catch (error) {
     // Handle authentication error
   }
   ```

## Internationalization

### Adding New Translations

1. Add new keys to the message files in the `messages/` directory.
2. Use the translation keys in your components:
   ```tsx
   import { useTranslations } from 'next-intl'
   
   export function TranslatedComponent() {
     const t = useTranslations('Namespace')
     
     return <p>{t('key')}</p>
   }
   ```

### Adding a New Language

1. Create a new message file in the `messages/` directory.
2. Update the language configuration in `src/i18n/config.ts`.

## Testing

### Unit Testing

Use Jest and React Testing Library for unit tests:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ExampleComponent } from './ExampleComponent'

describe('ExampleComponent', () => {
  test('renders correctly', () => {
    render(<ExampleComponent initialValue={5} />)
    expect(screen.getByText('Current value: 5')).toBeInTheDocument()
  })
  
  test('increments value on button click', () => {
    render(<ExampleComponent initialValue={5} />)
    fireEvent.click(screen.getByText('Increment'))
    expect(screen.getByText('Current value: 6')).toBeInTheDocument()
  })
})
```

### Integration Testing

For integration tests, focus on user workflows and component interactions.

## Deployment

### Deploying to Vercel

1. Push your changes to your GitHub repository.
2. Connect your repository to Vercel.
3. Configure the environment variables in the Vercel dashboard.
4. Deploy the application.

### Deploying to Firebase Hosting

1. Build the application:
   ```bash
   npm run build
   ```

2. Initialize Firebase Hosting (if not already done):
   ```bash
   firebase init hosting
   ```

3. Deploy to Firebase:
   ```bash
   firebase deploy --only hosting
   ```

## Contributing

### Pull Request Process

1. Fork the repository and create a new branch for your feature or fix.
2. Implement your changes following the project's coding standards.
3. Add unit tests for new functionality.
4. Update documentation as necessary.
5. Submit a pull request with a clear description of your changes.

### Code Style

The project follows these conventions:

- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety

Run the linter and formatter before submitting pull requests:

```bash
npm run lint
npm run format
```

## Troubleshooting

### Common Issues

1. **Firebase Authentication Issues**:
   - Check Firebase console for any authentication restrictions.
   - Ensure your API keys and configuration are correct.

2. **API Route Errors**:
   - Check server logs for detailed error messages.
   - Verify authentication state and permissions.

3. **Styling Issues**:
   - Make sure Tailwind classes are correct.
   - Check for conflicts in CSS modules.

### Getting Help

If you're stuck, try:
1. Checking the issue tracker for similar problems
2. Creating a new issue with detailed information
3. Reaching out to other contributors

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com) 