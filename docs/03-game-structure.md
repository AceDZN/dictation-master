# Game Structure

## Overview

The dictation game consists of a structured JSON format that defines the game's
content, layout, and interactive elements. Each game is composed of multiple
slides that guide the user through the learning experience.

## Slide Types

### 1. Introduction Slide

```json
{
  "type": "intro",
  "layers": [
    {
      "id": "game_title",
      "info": "<p style=\"text-align:center;\"><span style=\"font-size: 40px;\">${title}</span></p>",
      "type": "txt"
    },
    {
      "id": "first_column",
      "info": "${wordPairsColumn1}",
      "type": "txt"
    },
    {
      "id": "second_column",
      "info": "${wordPairsColumn2}",
      "type": "txt"
    }
  ]
}
```

### 2. Word Practice Slide

```json
{
  "type": "dictation",
  "layers": [
    {
      "id": "word_in_first_language",
      "info": "<p style=\"text-align:center;\">${firstLanguageWord}</p>",
      "type": "txt"
    },
    {
      "id": "example_sentence",
      "info": "<p style=\"text-align:center;\">${sentence}</p>",
      "type": "txt"
    }
  ],
  "activities": [
    {
      "shapes": [
        {
          "id": "word_in_second_language",
          "settings": {
            "textAnswerArray": ["${secondLanguageWord}"],
            "isUsingSpeakingMode": false
          }
        }
      ]
    }
  ]
}
```

### 3. Outro Slide

```json
{
  "type": "outro",
  "layers": [
    {
      "type": "txt",
      "info": "<p style=\"text-align:center;\">${congratsMessage}</p>"
    }
  ]
}
```

## Layer Components

### 1. Text Layer

```typescript
interface TextLayer {
  id: string
  type: 'txt'
  info: string
  InteractiveLoopType: number
  InteractiveShowType: number
  transform: number[]
  height: number
  width: number
  interactiveLayerSound: string
  interactiveToggleShow: boolean
}
```

### 2. Background Layer

```typescript
interface BackgroundLayer {
  type: 'bg'
  transform: number[]
  height: number
  width: number
  filename: string
  InteractiveShowType: number
  interactiveToggleShow: boolean
}
```

### 3. Activity Shape

```typescript
interface ActivityShape {
  id: string
  filePathThumb: string
  settings: {
    textAnswerArray: string[]
    isUsingSpeakingMode: boolean
  }
  path: {
    x: number
    y: number
    type: number
  }[]
  order: number
}
```

## Game Settings

### 1. Quiz Parameters

```typescript
interface QuizParameters {
  globalTimeLimit: number // Overall time limit for the game
  globalLivesLimit: number // Number of attempts allowed
  activityTimeLimit: number // Time limit per activity
  quizModeEnabled: boolean // Enable/disable quiz features
}
```

### 2. Visual Settings

```typescript
interface VisualSettings {
  width: number // Slide width (default: 1024)
  height: number // Slide height (default: 768)
  backgroundColor: string
  fontFamily: string
  fontSize: {
    title: number
    content: number
  }
}
```

## Content Generation

### 1. Example Sentence Generation

```typescript
const ExampleSentenceSchema = z.object({
  sentence: z.string(),
})

const sentencePrompt = `Generate a simple example sentence in ${secondLanguage} using the word "${word}".`
```

### 2. Congratulatory Message Generation

```typescript
const OutroContentSchema = z.object({
  congratsMessage: z.string(),
})

const outroPrompt = `Generate a congratulatory message for completing the dictation game titled "${title}". The message should be Short and concise and written in ${secondLanguage}.`
```

## Layout Structure

### 1. Grid System

- Slide dimensions: 1024x768 pixels
- Column-based layout for word pairs
- Centered text alignment
- Responsive scaling

### 2. Element Positioning

```typescript
interface Transform {
  x: number
  y: number
  scaleX: number
  scaleY: number
}

// Example transform matrix
const transform = [
  1.6847796440124512, // scaleX
  0, // skewY
  0, // skewX
  1.6847796440124512, // scaleY
  -3.5936050415039062, // translateX
  -229.40528869628906, // translateY
]
```

## Interaction Flow

### 1. Navigation

1. Start with introduction slide
2. Progress through word practice slides
3. Complete with outro slide

### 2. Activity Progression

1. Display source language word
2. Show example sentence
3. Accept user input
4. Validate answer
5. Provide feedback
6. Move to next word

### 3. Completion Handling

1. Track completed words
2. Update progress
3. Show congratulations
4. Display final score
