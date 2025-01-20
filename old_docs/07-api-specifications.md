# API Specifications

## Upload Endpoint

**Endpoint:** `/api/upload` **Method:** POST

### Request Format

```typescript
interface UploadRequest {
  file: string // Base64 encoded file content
  fileName: string // Original file name
  fileType: string // MIME type of the file
  firstLanguage: string
  secondLanguage: string
}
```

### Supported File Types

1. **Text Files**

   - MIME Type: `text/plain`
   - Format: CSV-like text with comma-separated word pairs
   - Structure:
     ```
     source_word,target_word
     another_source,another_target
     ```

2. **Image Files**
   - MIME Types: Any image format (`image/*`)
   - Supported formats: JPEG, PNG, GIF
   - Content: Images containing word pairs or vocabulary lists

### Size Limits

- Maximum file size: 10MB
- Maximum response size: 10MB

### Response Format

#### Success Response

```typescript
interface UploadResponse {
  wordPairs: Array<{
    first: string // Word in source language
    second: string // Word in target language
    sentence?: string // Optional example sentence
    imagePrompt?: string // Optional image generation prompt
  }>
}
```

#### Error Response

```typescript
interface ErrorResponse {
  error: string // Error message
}
```

### Processing Behavior

1. **Text File Processing**

   - Splits file content by newlines
   - Parses comma-separated values
   - Creates word pairs from valid lines
   - Skips empty or malformed lines

2. **Image File Processing**
   - Uses Visual LLM to extract text from image
   - Identifies word pairs in both languages
   - Generates example sentences
   - Creates image prompts for visualization

### Error Handling

#### 400 Bad Request

- No file uploaded
- Invalid file format
- Malformed request body

#### 405 Method Not Allowed

- When using any HTTP method other than POST

#### 500 Internal Server Error

- File processing failure
- LLM processing errors
- Invalid response format

### Example Usage

```typescript
// Request
const formData = {
  file: "base64EncodedContent",
  fileName: "vocabulary.txt",
  fileType: "text/plain",
  firstLanguage: "English",
  secondLanguage: "Spanish"
};

// Success Response
{
  "wordPairs": [
    {
      "first": "hello",
      "second": "hola",
      "sentence": "¡Hola, buenos días!",
      "imagePrompt": "A friendly greeting between two people"
    }
  ]
}

// Error Response
{
  "error": "No file uploaded"
}
```

### Security Considerations

1. **File Validation**

   - File type verification
   - Size limit enforcement
   - Content sanitization

2. **Rate Limiting**

   - Requests per minute: TBD
   - Maximum concurrent uploads: TBD

3. **Authentication**
   - Required: TBD
   - Token validation: TBD

### Integration Notes

1. **Client-Side Preparation**

   - Convert file to Base64
   - Validate file size before upload
   - Check supported file types

2. **Error Handling**

   - Implement retry logic
   - Handle timeout scenarios
   - Display user-friendly error messages

3. **Response Processing**
   - Validate response format
   - Handle partial success scenarios
   - Cache successful responses
