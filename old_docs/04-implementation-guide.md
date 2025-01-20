# Implementation Guide

## Setup and Configuration

### 1. Environment Setup

```bash
# Required environment variables
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
LANGCHAIN_API_KEY=your_langchain_api_key
FIREBASE_CONFIG=your_firebase_config
```

### 2. Project Structure

```
/app
  /(pages)
    /dictation
      /[id]
        /play
          page.tsx      # Game player page
      page.tsx         # Game creation page
  /api
    /create-dictation
      route.ts        # Game creation endpoint
    /dictation
      /[id]
        route.ts      # Game retrieval endpoint
/components
  /DictationForm
    index.tsx        # Game creation form
/lib
  firestore.ts       # Firestore utilities
  types.ts          # Type definitions
/server-utils
  openai.ts         # OpenAI integration
  fileProcessing.ts # File processing utilities
```

## Core Components Implementation

### 1. Game Creation Form

```typescript
export function DictationForm() {
  const [title, setTitle] = useState('')
  const [firstLanguage, setFirstLanguage] = useState('')
  const [secondLanguage, setSecondLanguage] = useState('')
  const [wordPairs, setWordPairs] = useState<WordPair[]>([])
  const [quizParameters, setQuizParameters] = useState<QuizParameters>({
    globalTimeLimit: 0,
    globalLivesLimit: 3,
    activityTimeLimit: 0,
    quizModeEnabled: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Form submission logic
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

### 2. Game Player Integration

```typescript
export default function DictationPlayPage() {
  const params = useParams()
  const [iframeUrl, setIframeUrl] = useState('')

  useEffect(() => {
    const id = params?.id as string
    const structureJsonUrl = `${window.location.origin}/api/dictation/${id}`
    const webplayerUrl = `https://staging-static.tinytap.it/media/webplayer-react/index.html?structureJson=${encodeURIComponent(structureJsonUrl)}`
    setIframeUrl(webplayerUrl)
  }, [params?.id])

  return (
    <div className='flex min-h-[calc(100vh-64px)] items-center justify-center'>
      {iframeUrl && (
        <iframe
          src={iframeUrl}
          className='h-[80vh] max-h-[768px] w-full max-w-[1024px]'
          style={{ border: 'none' }}
          allowFullScreen
        />
      )}
    </div>
  )
}
```

## API Implementation

### 1. Create Dictation Endpoint

```typescript
export async function POST(req: NextRequest) {
  try {
    const { title, firstLanguage, secondLanguage, wordPairs, quizParameters } =
      await req.json()

    // Generate example sentences
    const wordPairsWithSentences = await Promise.all(
      wordPairs.map(async pair => {
        if (!pair.sentence) {
          const sentenceContent = await generateExampleSentence(
            pair.second,
            secondLanguage,
          )
          return { ...pair, sentence: sentenceContent.sentence }
        }
        return pair
      }),
    )

    // Create game structure
    const dictationStructure = generateGameStructure({
      title,
      wordPairs: wordPairsWithSentences,
      quizParameters,
    })

    // Save to Firestore
    const savedGame = await saveDictationGame({
      title,
      sourceLanguage: firstLanguage,
      targetLanguage: secondLanguage,
      wordPairs: wordPairsWithSentences,
      gameStructure: dictationStructure,
      quizParameters,
    })

    return NextResponse.json({
      success: true,
      dictationId: savedGame.id,
      game: savedGame,
    })
  } catch (error) {
    console.error('Error creating dictation:', error)
    return NextResponse.json(
      { error: 'Failed to create dictation' },
      { status: 500 },
    )
  }
}
```

### 2. Retrieve Dictation Endpoint

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const game = await getDictationGame(params.id)
    if (!game) {
      return NextResponse.json(
        { error: 'Dictation game not found' },
        { status: 404 },
      )
    }
    return NextResponse.json(game)
  } catch (error) {
    console.error('Error fetching dictation game:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dictation game' },
      { status: 500 },
    )
  }
}
```

## Database Integration

### 1. Firestore Setup

```typescript
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG || '{}')
const app = initializeApp(firebaseConfig)
export const firestore = getFirestore(app)
```

### 2. Data Operations

```typescript
export const saveDictationGame = async (game: DictationGame) => {
  const collection = firestore.collection(
    getFireBaseRoot(FirestoreRoot.DICTATION_GAMES),
  )
  const doc = await collection.add({
    ...game,
    createdAt: new Date(),
  })
  return { id: doc.id, ...game }
}

export const getDictationGame = async (id: string) => {
  const collection = firestore.collection(
    getFireBaseRoot(FirestoreRoot.DICTATION_GAMES),
  )
  const doc = await collection.doc(id).get()
  return { id: doc.id, ...doc.data() } as DictationGame
}
```

## Error Handling

### 1. API Error Handling

```typescript
try {
  // Operation logic
} catch (error) {
  console.error('Operation error:', error)
  return NextResponse.json(
    {
      error: 'Operation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    },
    { status: 500 },
  )
}
```

### 2. Component Error Handling

```typescript
const handleError = (error: unknown) => {
  console.error('Component error:', error)
  toast.error(error instanceof Error ? error.message : 'Operation failed')
}

try {
  // Component logic
} catch (error) {
  handleError(error)
}
```

## Testing and Validation

### 1. Input Validation

```typescript
const validateWordPairs = (pairs: WordPair[]) => {
  if (pairs.length === 0) {
    throw new Error('At least one word pair is required')
  }

  pairs.forEach(pair => {
    if (!pair.first || !pair.second) {
      throw new Error('Both words in pair must be provided')
    }
  })
}
```

### 2. Response Validation

```typescript
const validateGameResponse = (game: unknown): game is DictationGame => {
  return (
    typeof game === 'object' &&
    game !== null &&
    'title' in game &&
    'wordPairs' in game &&
    'gameStructure' in game
  )
}
```

## Performance Optimization

### 1. Caching Strategy

```typescript
const cache = new Map<string, DictationGame>()

export const getCachedGame = async (id: string) => {
  if (cache.has(id)) {
    return cache.get(id)
  }

  const game = await getDictationGame(id)
  cache.set(id, game)
  return game
}
```

### 2. Batch Processing

```typescript
const processBatch = async (pairs: WordPair[], batchSize: number) => {
  const results = []
  for (let i = 0; i < pairs.length; i += batchSize) {
    const batch = pairs.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map(pair => generateExampleSentence(pair.second)),
    )
    results.push(...batchResults)
  }
  return results
}
```
