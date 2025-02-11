# Technical Architecture

## System Components

### 1. Frontend Architecture

#### Core Components

```typescript
// Main page component
export default function DictationPage() {
  return (
    <div className='min-h-screen px-4 py-8 sm:px-6 lg:px-8'>
      <DictationForm />
    </div>
  )
}

// Form component for game creation
export function DictationForm() {
  // State management for form data
  const [title, setTitle] = useState('')
  const [wordPairs, setWordPairs] = useState<WordPair[]>([])
  const [quizParameters, setQuizParameters] = useState<QuizParameters>({
    globalTimeLimit: 0,
    globalLivesLimit: 3,
    activityTimeLimit: 10,
    quizModeEnabled: true
  })
}
```

#### Game Player Integration

```typescript
// Game player page component
export default function DictationPlayPage() {
  const params = useParams()
  const [iframeUrl, setIframeUrl] = useState('')

  useEffect(() => {
    const id = params?.id as string
    const structureJsonUrl = `${window.location.origin}/api/dictation/${id}`
    const webplayerUrl = `https://staging-static.tinytap.it/media/webplayer-react/index.html?structureJson=${encodeURIComponent(structureJsonUrl)}`
    setIframeUrl(webplayerUrl)
  }, [params?.id])
}
```

### 2. Backend Services

#### API Routes

```typescript
// Create dictation game
export async function POST(req: NextRequest) {
  const { title, firstLanguage, secondLanguage, wordPairs, quizParameters } =
    await req.json()

  // Generate game structure
  const dictationStructure = generateGameStructure({
    title,
    wordPairs,
    quizParameters,
  })

  // Save to Firestore
  const savedGame = await saveDictationGame({
    title,
    sourceLanguage: firstLanguage,
    targetLanguage: secondLanguage,
    wordPairs,
    gameStructure: dictationStructure,
    quizParameters,
  })

  return NextResponse.json({
    success: true,
    dictationId: savedGame.id,
    game: savedGame,
  })
}

// Retrieve dictation game
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const game = await getDictationGame(params.id)
  return NextResponse.json(game)
}
```

### 3. Data Models

#### Game Structure

```typescript
interface DictationGame {
  title: string
  sourceLanguage: string
  targetLanguage: string
  wordPairs: WordPair[]
  gameStructure: GameStructure
  quizParameters: QuizParameters
}

interface WordPair {
  first: string
  second: string
  sentence?: string
}

interface QuizParameters {
  globalTimeLimit: number
  globalLivesLimit: number
  activityTimeLimit: number
  quizModeEnabled: boolean
}
```

### 4. External Integrations

#### OpenAI Integration

```typescript
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
})

// Generate example sentences
const sentenceResponse = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  response_format: zodResponseFormat(ExampleSentenceSchema, 'example_sentence'),
  messages: [{ role: 'user', content: sentencePrompt }],
  max_tokens: 100,
})
```

#### Firebase/Firestore Integration

```typescript
// Save game data
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

// Retrieve game data
export const getDictationGame = async (id: string) => {
  const collection = firestore.collection(
    getFireBaseRoot(FirestoreRoot.DICTATION_GAMES),
  )
  const doc = await collection.doc(id).get()
  return { id: doc.id, ...doc.data() } as DictationGame
}
```

## System Flow

### 1. Game Creation Flow

1. User inputs word pairs and settings
2. System generates example sentences using LLM
3. Game structure is created
4. Data is saved to Firestore
5. User is redirected to game player

### 2. Game Retrieval Flow

1. Game player requests game data
2. System retrieves data from Firestore
3. Game structure is loaded into web player
4. User interacts with game interface

### 3. Data Synchronization

1. Real-time updates during game play
2. Progress tracking and score updates
3. State management between components
4. Cache management for performance

## Security Considerations

### 1. API Security

- CORS configuration
- Origin validation
- API key management
- Rate limiting

### 2. Data Security

- Firestore security rules
- Data validation
- Input sanitization
- Error handling

### 3. User Data Protection

- Secure storage
- Access control
- Data encryption
- Privacy compliance

## Performance Optimization

### 1. Frontend Optimization

- Component memoization
- Lazy loading
- State management optimization
- Asset optimization

### 2. Backend Optimization

- Caching strategies
- Database indexing
- Request batching
- Error handling and recovery

### 3. Integration Optimization

- API response optimization
- Batch processing
- Connection pooling
- Resource management
