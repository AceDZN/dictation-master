# Form Specifications

## Game Creation Form

### Basic Information Section

#### Title Field

- Type: Text input
- Required: Yes
- Max length: 100 characters
- Validation:
  - Cannot be empty
  - Must be at least 3 characters
  - No special characters except spaces and hyphens
- Auto-generation: Optional AI-generated title based on word pairs

#### Language Selection

1. Source Language Dropdown

   - Type: Select input with search
   - Required: Yes
   - Options: List of 11+ supported languages
   - Default: User's last used language
   - Validation: Cannot be same as target language

2. Target Language Dropdown
   - Type: Select input with search
   - Required: Yes
   - Options: List of 11+ supported languages
   - Default: None
   - Validation: Cannot be same as source language

### Word Pairs Section

#### Manual Entry Interface

- Type: Dynamic form array
- Minimum pairs: 1
- Maximum pairs: 50
- Fields per pair:
  1. Source Word
     - Type: Text input
     - Required: Yes
     - Max length: 50 characters
  2. Target Word
     - Type: Text input
     - Required: Yes
     - Max length: 50 characters
  3. Example Sentence
     - Type: Text input
     - Required: No
     - Max length: 200 characters
     - Auto-generation: Optional AI-generated sentence
  4. Remove Button
     - Type: Button
     - Visible: When more than 1 pair exists

#### Bulk Upload Interface

- Type: File upload
- Accepted formats: CSV, TXT
- Maximum file size: 1MB
- Required columns:
  - source_word
  - target_word
  - example_sentence (optional)
- Validation:
  - File format check
  - Data structure validation
  - Duplicate check
  - Maximum rows check (50)

### Quiz Parameters Section

#### Time Settings

1. Global Time Limit

   - Type: Number input with increment/decrement
   - Required: No
   - Range: 0-3600 seconds (0 = unlimited)
   - Step: 30 seconds
   - Default: 0

2. Activity Time Limit
   - Type: Number input with increment/decrement
   - Required: No
   - Range: 0-300 seconds (0 = unlimited)
   - Step: 5 seconds
   - Default: 0

#### Lives Settings

- Type: Number input with increment/decrement
- Required: Yes
- Range: 1-10
- Step: 1
- Default: 3

#### Quiz Mode Toggle

- Type: Switch/Toggle
- Required: Yes
- Default: Off
- Dependencies: Enables/disables time and lives settings

### Advanced Settings Section

#### Difficulty Level

- Type: Radio group
- Required: Yes
- Options:
  - Easy (more forgiving validation)
  - Normal (standard validation)
  - Hard (strict validation)
- Default: Normal

#### Input Validation Settings

- Type: Checkbox group
- Options:
  - Case sensitive
  - Ignore punctuation
  - Allow partial matches
  - Strict spacing
- Default: All unchecked except "Ignore punctuation"

#### Content Generation

- Type: Toggle group
- Options:
  - Auto-generate example sentences
  - Auto-generate game title
  - Auto-generate feedback messages
- Default: All enabled

## Game Management Forms

### Game Search Form

- Type: Search input with filters
- Fields:
  1. Search Query
     - Type: Text input
     - Required: No
     - Searches across: title, languages, words
  2. Language Filter
     - Type: Multi-select dropdown
     - Required: No
  3. Date Range
     - Type: Date range picker
     - Required: No
  4. Status Filter
     - Type: Checkbox group
     - Options: Draft, Published, Archived

### Game Settings Form

#### Basic Settings

- Fields inherit from Game Creation Form
- Additional fields:
  1. Game Status
     - Type: Select
     - Options: Draft, Published, Archived
  2. Visibility
     - Type: Radio
     - Options: Public, Private, Shared
  3. Access Code
     - Type: Text input
     - Required: Only if Visibility is "Shared"
     - Format: 6-digit alphanumeric

#### Sharing Settings

- Type: Form group
- Fields:
  1. Share Link
     - Type: Text input (readonly)
     - Copy button included
  2. Allowed Domains
     - Type: Tag input
     - Format: Valid domain names
  3. Expiry Date
     - Type: Date picker
     - Optional

## Form Behaviors

### Auto-save

- Trigger: 3 seconds after last change
- Scope: All form sections
- Storage: Local storage
- Recovery: Prompt on form load if draft exists

### Validation

- Type: Real-time
- Trigger: On blur and submit
- Display: Inline errors below fields
- Submit button: Disabled when form invalid

### Navigation

- Warn on unsaved changes
- Section collapse state preserved
- Form scroll position maintained
- Tab navigation supported

### Error Handling

- Field-level validation messages
- Form-level error summary
- Network error recovery
- Conflict resolution for concurrent edits

### Accessibility

- All fields properly labeled
- Error messages linked to fields
- Keyboard navigation support
- Screen reader optimized
- High contrast support
