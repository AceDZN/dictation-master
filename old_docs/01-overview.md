# Dictation Service Overview

The Dictation Service is an interactive educational tool designed to create and
manage language learning games through dictation exercises. It enables educators
and parents to create custom dictation games that help students learn vocabulary
across different languages.

## Core Features

### 1. Custom Dictation Creation

- Create personalized dictation games with word pairs
- Support for multiple input methods (manual and file upload)
- Multi-language support with 11+ languages
- Automatic title generation using LLM
- Customizable quiz parameters

### 2. Game Structure

- Interactive slides with word presentations
- Example sentences for context
- Input validation and feedback
- Progress tracking
- Completion messages

### 3. Multi-language Support

Available languages include:

- Hebrew
- English
- Mandarin Chinese
- Hindi
- Spanish
- French
- Arabic
- Bengali
- Russian
- Portuguese
- Indonesian

### 4. Quiz Parameters

Customizable game settings:

- Global time limits
- Lives/attempts limits
- Activity-specific time limits
- Quiz mode toggle

## User Flow

1. **Game Creation**

   - Choose source and target languages
   - Input word pairs (manually or via file)
   - Configure quiz parameters
   - Generate or input game title

2. **Game Structure**

   - Introduction slide with word pairs overview
   - Individual word practice slides
   - Example sentences for context
   - Interactive input validation
   - Completion/congratulations slide

3. **Game Play**
   - Web-based player interface
   - Real-time feedback
   - Progress tracking
   - Score/achievement display

## Technical Integration

### 1. Frontend Components

- Next.js 14 pages and components
- React-based form handling
- Real-time validation
- Responsive design

### 2. Backend Services

- API routes for game creation and retrieval
- Firebase/Firestore integration
- LLM integration for content generation
- File processing utilities

### 3. External Services

- OpenAI integration for content generation
- TinyTap webplayer integration
- Cloud storage for game data
- Real-time data synchronization

## Benefits

1. **Educational Value**

   - Structured vocabulary learning
   - Immediate feedback
   - Progress tracking
   - Multi-sensory learning approach

2. **User Experience**

   - Intuitive interface
   - Flexible input methods
   - Customizable settings
   - Cross-platform compatibility

3. **Technical Advantages**
   - Scalable architecture
   - Real-time updates
   - Secure data storage
   - Easy integration capabilities
