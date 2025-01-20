# UI Design Guide

## Design System

### Colors

- Primary: Indigo-600 (#4F46E5)
- Secondary: Sky-500 (#0EA5E9)
- Accent: Amber-500 (#F59E0B)
- Background: White (#FFFFFF)
- Text: Slate-900 (#0F172A)
- Error: Red-500 (#EF4444)
- Success: Green-500 (#22C55E)
- Neutral: Gray-200 (#E5E7EB) to Gray-800 (#1F2937)

### Typography

- Primary Font: Inter (sans-serif)
- Headings:
  - H1: 2.5rem/40px, font-bold
  - H2: 2rem/32px, font-semibold
  - H3: 1.5rem/24px, font-semibold
- Body Text: 1rem/16px, font-normal
- Small Text: 0.875rem/14px, font-normal
- Button Text: 0.875rem/14px, font-medium

### Spacing

- Base unit: 4px
- Common spacing values: 16px, 24px, 32px, 48px
- Container padding: 24px on mobile, 48px on desktop
- Section margins: 48px between major sections

## Page Layouts

### Game Creation Page

#### Header Section

- Clean, minimal header with app logo
- Page title "Create Dictation Game" centered
- Navigation breadcrumbs (optional)

#### Form Layout

- Single column layout on mobile
- Two-column layout on desktop (form fields left, preview right)
- Maximum width of 1200px
- White background with subtle shadow
- 32px padding around form container

#### Form Sections

1. Basic Information

   - Title input (full width)
   - Language selection (two dropdowns side by side)
   - Quiz parameters in a card layout

2. Word Pairs Section

   - Table/grid layout for word pairs
   - Add/Remove buttons aligned right
   - Bulk upload option in a separate card
   - Error states clearly highlighted in red

3. Settings Panel

   - Collapsible accordion style
   - Toggle switches for options
   - Time/lives inputs with increment/decrement buttons

4. Action Buttons
   - Primary action (Create Game) - prominent, right-aligned
   - Secondary action (Save Draft) - outlined style
   - Cancel button - text style

### Game Player Page

#### Layout

- Full viewport width and height
- Minimal header with game title
- Player container centered with max-width 1024px
- 16:9 aspect ratio maintained

#### Game Interface

1. Introduction Slide

   - Title prominently displayed (40px)
   - Two-column layout for word pairs
   - Start button centered at bottom

2. Word Practice Slides

   - Word in first language (top, 32px)
   - Example sentence (middle, 24px)
   - Input field (bottom third of screen)
   - Progress indicator (top right)
   - Lives/timer (if enabled) top left

3. Outro Slide
   - Large congratulatory message
   - Final score display
   - Replay/Exit buttons

## Interactive Elements

### Buttons

- Rounded corners (8px)
- Consistent padding (16px horizontal, 12px vertical)
- Clear hover and active states
- Disabled state with reduced opacity
- Icons left-aligned when used

### Input Fields

- Full width with consistent height (48px)
- Label above input
- Placeholder text in gray
- Clear error and success states
- Helper text below input when needed

### Dropdowns

- Custom styled select elements
- Search functionality for long lists
- Clear selected option button
- Group options when applicable

### Cards

- White background
- Subtle shadow
- Rounded corners (12px)
- Consistent padding (24px)
- Optional hover state

## Responsive Design

### Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Mobile Adaptations

- Single column layouts
- Stacked form fields
- Larger touch targets (min 44px)
- Simplified navigation
- Collapsible sections

### Tablet Adaptations

- Optional two-column layouts
- Side-by-side form fields where appropriate
- Balanced white space
- Maintained touch targets

### Desktop Optimizations

- Multi-column layouts
- Side panels and previews
- Hover states
- Keyboard shortcuts
- Enhanced navigation

## Accessibility

### Visual

- Minimum contrast ratio 4.5:1
- Focus indicators
- Error states not relying on color alone
- Scalable text (up to 200%)

### Interactive

- Keyboard navigation support
- Skip links for navigation
- ARIA labels on interactive elements
- Clear focus order

### Content

- Clear headings hierarchy
- Descriptive link text
- Error messages read by screen readers
- Alternative text for visual elements

## Loading States

### Skeletons

- Used for initial page load
- Maintain layout structure
- Subtle animation
- Neutral colors

### Progress Indicators

- Spinner for short operations
- Progress bar for longer operations
- Clear loading messages
- Cancel option when applicable

## Feedback & Messaging

### Toast Notifications

- Position: top-right
- Auto-dismiss after 5 seconds
- Different styles for success/error/info
- Action buttons when needed

### Form Validation

- Inline validation messages
- Clear error indicators
- Success confirmation
- Helper text for requirements

### Confirmation Dialogs

- Centered modal design
- Clear action buttons
- Escape key dismissal
- Backdrop overlay
