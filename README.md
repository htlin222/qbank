# Oncoboard Quiz Application

A modern quiz application supporting both Study and Test modes for medical education.

## Features

### Study Mode
- Immediate feedback after answering each question
- Correct/incorrect answers highlighted in green/red
- Access to explanations after answering
- Real-time score display
- Full navigation and skip functionality

### Test Mode
- No immediate feedback on correctness
- Selected answers highlighted in blue
- All explanations and correct answers shown at completion
- Hidden score during test (displays "?")
- Full navigation and skip functionality
- Finish confirmation dialog showing:
  - Number of answered/unanswered questions
  - Preview of post-test results
  - Options to continue or view results

## Question Bank Structure

Questions are organized in the `public/qabank` directory. Each question follows the format `題號XXX` (where XXX is padded with leading zeros).

### Question Bank Directory Structure
```
public/qabank/
├── 069/                 # Question folder (題號069)
│   ├── question.txt     # Main question text
│   ├── option_A.txt     # Option A text
│   ├── option_B.txt     # Option B text
│   ├── option_C.txt     # Option C text
│   ├── option_D.txt     # Option D text
│   ├── option_E.txt     # Option E text
│   ├── correct_answer.txt # Correct answer (A, B, C, D, or E)
│   ├── explain.txt      # Explanation text
│   ├── question_figures/ # Optional question images
│   └── explain_figures/ # Optional explanation images
```

### Creating New Questions

1. Create a new folder in `public/qabank` with the question number (e.g., `069`)
2. Create the following text files:
   - `question.txt`: The main question text
   - `option_A.txt` through `option_E.txt`: The text for each option
   - `correct_answer.txt`: Single letter (A-E) indicating the correct answer
   - `explain.txt`: Detailed explanation of the answer

3. Optional: Add images
   - Place question-related images in `question_figures/`
   - Place explanation-related images in `explain_figures/`

### File Format Guidelines
- All text files should use UTF-8 encoding
- Text files can contain markdown formatting
- Images should be in web-friendly formats (PNG, JPG, WebP)

### Example Question Format

Here's an example of how to structure a question (題號069):

`question.txt`:
```
關於 BRCA1/2 mutation，以下敘述中，正確的有?
(1) 具有 germline mutation 的女性，有顯著較高罹患乳癌及卵巢癌風險。
(2) 預防性卵巢切除，可以減少罹患乳癌的機率。
(3) 轉移性乳癌，使用 PARP 抑制劑，除了有較佳的無疾病惡化存活期之外，其整體存活期(overall survival)也顯著高於單一化學治療，應優先使用。
(4) 化療藥品中，鉑金類(platinum)效果相對較佳。
```

`correct_answer.txt`:
```
E
```

## Development

### Prerequisites
- Node.js (Latest LTS version recommended)
- pnpm (Latest version)

### Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Start the development server:
```bash
pnpm dev
```

3. Build for production:
```bash
pnpm build
```

4. Preview production build:
```bash
pnpm preview
```

### Development Scripts
- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Compile questions and build for production
- `pnpm build:custom --title="Custom Title"` - Build with a custom application title
- `pnpm lint` - Run ESLint for TypeScript/TSX files
- `pnpm preview` - Preview the production build locally

### Configuration

The application uses environment variables for configuration. These can be set in the `.env` file or passed as command-line arguments during build.

#### Available Configuration Options

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `VITE_APP_TITLE` | The title displayed in the web application | `113年度腫專考古題` |
| `APP_TITLE` | The title used in the Marp document | `113年腫專考古題詳解` |

#### Customizing the Title

You can customize the application title in three ways:

1. **Edit the `.env` file**:
   ```
   VITE_APP_TITLE=114年度腫專考古題
   APP_TITLE=114年腫專考古題詳解
   ```

2. **Use the custom build command**:
   ```bash
   pnpm build:custom --title="114年度腫專考古題"
   ```

3. **Create environment-specific `.env` files** (e.g., `.env.production`, `.env.staging`)

### Tech Stack
- React 18
- TypeScript
- Vite
- Radix UI Components
- TailwindCSS
- Zod for validation
- React Hook Form

### Architecture Features

#### Content Synchronization
The application implements a robust content synchronization system using:
- Zustand store for shared editor content state
- Debounced updates (500ms delay) for:
  - Store updates
  - Cross-window communication
- Bidirectional sync between:
  - Local state
  - Props
  - Store
  - Cross-window communication

#### Editor Components
Two main editor components with synchronized content:
- `CodeEditor.jsx`: Main editor component
- `StandaloneEditor.jsx`: Standalone editor window

Both components implement:
- Local state for immediate UI updates
- Debounced store updates
- Debounced cross-window communication
- Proper cleanup for all debounced functions