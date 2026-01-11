# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 16 application using the App Router with TypeScript, React 19, Bun, Tailwind CSS 4, and Prisma with SQLite. The project follows a modern stack with shadcn/ui components and server-side rendering patterns.

## Common Commands

### Development

```bash
bun dev          # Start development server at http://localhost:3000
bun build        # Build for production
bun start        # Start production server
bun lint         # Run ESLint (uses flat config format)
bun test         # Run tests in watch mode
bun test:run     # Run tests once
```

### Database (Prisma)

```bash
bunx --bun prisma generate        # Generate Prisma Client to lib/generated/prisma
bunx --bun prisma migrate dev     # Run migrations
bunx --bun prisma studio          # Open Prisma Studio
```

**Important**: Always use `bunx --bun` for Prisma commands to use Bun's runtime.

**Prisma 7 Configuration**:

- This project uses Prisma 7 which requires different setup than Prisma 5
- Prisma client generates to `lib/generated/prisma/client` (import from `/client`)
- Database file is located at `prisma/dev.db` and is gitignored
- Connection uses `@prisma/adapter-libsql` adapter (required in Prisma 7)
- Database configuration is in `prisma.config.ts` and `lib/db.ts`

## Architecture

### Directory Structure

- `app/` - Next.js App Router pages and layouts
  - `layout.tsx` - Root layout with Geist fonts
  - `page.tsx` - Home page
  - `globals.css` - Global styles with Tailwind v4 inline theme config
- `components/ui/` - shadcn/ui components
- `lib/` - Utility functions
  - `utils.ts` - Contains `cn()` helper for className merging
  - `generated/prisma/` - Prisma Client output directory
- `prisma/` - Database schema and migrations

### Styling System

- Uses Tailwind CSS v4 with `@theme inline` configuration in `globals.css`
- Includes `@tailwindcss/typography` plugin for markdown prose styling
- Custom dark mode variant: `@custom-variant dark (&:is(.dark *))`
- Theme uses OKLCH color space for improved color perception
- CSS variables define a comprehensive design system (colors, shadows, spacing, radii)
- shadcn/ui components use `class-variance-authority` for variant handling

### Path Aliases

- `@/*` - Maps to project root (configured in tsconfig.json)

### TypeScript Configuration

- Strict mode enabled
- Target: ES2017
- JSX mode: `react-jsx` (no need to import React in TSX files)
- Includes Next.js TypeScript plugin for enhanced IDE support

### ESLint

- Uses Next.js flat config format (eslint.config.mjs)
- Combines `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Custom ignores for build directories

### Database

- SQLite as datasource (configured in prisma/schema.prisma)
- Use prisma.config.ts for configuration (non-standard setup)
- DATABASE_URL environment variable required (uses dotenv)

## Key Dependencies

- `next` 16.1.1 - Framework
- `react` 19.2.3 - UI library (latest version)
- `tailwindcss` 4 - Styling (v4 uses different config approach)
- `@tailwindcss/typography` - Typography plugin for prose styling in markdown preview
- `@radix-ui/react-slot` - Used by shadcn/ui components for polymorphic behavior
- `@radix-ui/react-dialog` - Dialog component for modals
- `class-variance-authority` - Component variant management
- `tw-animate-css` - Additional Tailwind animations
- `react-markdown` - Markdown rendering with `remark-gfm` and `rehype-highlight` plugins
- `next-themes` - Theme management with system preference detection
- `sonner` - Toast notifications
- `vitest` - Testing framework
- `fuse.js` - Fuzzy search functionality

## Development Notes

### Testing

The project uses Vitest for testing:

- Test files: `**/__tests__/*.test.ts`
- Configuration: `vitest.config.ts`
- Run tests: `bun test` (watch mode) or `bun test:run` (single run)
- All server actions have test coverage

### Verify errors after a long set of changes

Always run `bunx --bun tsc --noEmit` to verify there are no type errors before committing.

#### Use linting after a huge set of changes only

Always run `bun lint` after a huge set of changes only.

### Adding shadcn/ui Components

Components are in `components/ui/` and use the `cn()` utility from `lib/utils.ts`. They follow the shadcn/ui pattern with CVA variants and Radix UI primitives.

### Working with Fonts

The project uses Geist Sans and Geist Mono from Google Fonts, loaded via `next/font/google` in the root layout.

### Dark Mode

Dark mode uses a class-based approach with the custom `.dark` class. The variant is defined in globals.css with `@custom-variant dark (&:is(.dark *))`. The `ThemeProvider` component (in `components/theme-provider.tsx`) uses `next-themes` for theme management with system preference detection and manual toggling.

**Theme Toggle**:
- Theme toggle button available on home page
- Shows Sun icon in dark mode, Moon icon in light mode
- Supports system, light, and dark themes
- Preference persisted in localStorage

### Authentication

The app uses Lucia Auth with Prisma adapter for session-based authentication:

- `lib/auth.ts` - Lucia configuration and `validateRequest()` helper
- `lib/db.ts` - Prisma client singleton
- `lib/actions/auth.ts` - Server actions for signup, login, and logout
- `lib/oauth.ts` - Arctic Google OAuth configuration
- `middleware.ts` - Route protection (redirects unauthenticated users to /login)
- Password hashing uses Argon2id via the `oslo` library

**OAuth Integration**:

- Google OAuth is configured using Arctic
- OAuth routes: `/login/google` (initiates OAuth flow) and `/login/google/callback` (handles callback)
- Users can sign up/login with Google or email/password
- OAuth accounts are linked to users via the `OAuthAccount` model
- Environment variables required: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

**Database Models**:

- `User` - email, name, hashedPassword (optional), sessions[], oauthAccounts[], notes[], tags[]
- `Session` - id, userId, expiresAt (managed by Lucia)
- `OAuthAccount` - providerId, providerUserId, userId (links OAuth accounts to users)
- `Note` - id, title, content, userId, noteTags[]
- `Tag` - id, name, userId, noteTags[] (user-scoped, unique per user)
- `NoteTag` - noteId, tagId (junction table for many-to-many relationship)

**Protected Routes**: All routes except `/login`, `/signup`, and `/login/google/*` require authentication.

### Notes Feature

The core feature of the app is a simple note-taking system:

**Routes**:
- `/` - Home page displaying all user's notes in a grid
- `/notes/new` - Create a new note
- `/notes/[id]` - View a single note with edit/delete actions
- `/notes/[id]/edit` - Edit an existing note

**Server Actions** (`lib/actions/notes.ts`):
- `createNote(formData)` - Creates a new note with tags
- `getNotes(userId)` - Fetches all notes for a user with tags
- `getNote(id, userId)` - Fetches a single note with tags
- `updateNote(id, formData)` - Updates an existing note and tags
- `deleteNote(id)` - Deletes a note (with user verification)
- `autosaveNote(data)` - Autosaves note with title, content, and tags
- `getUserTags(userId)` - Fetches all tags for a user

**Components**:
- `DeleteNoteButton` - Client component with confirmation dialog before deletion
- `NotesList` - Client component with fuzzy search and tag filtering using fuse.js
- `MarkdownPreview` - Client component for rendering markdown with syntax highlighting
- `NoteEditor` - Client component with live markdown preview and autosave
- `TagInput` - Client component for adding/removing tags
- `NewNoteForm` - Client component for creating notes with tags
- `EditNoteForm` - Client component for editing notes with tags
- `ThemeToggle` - Client component for toggling theme
- `KeyboardShortcutsHelp` - Modal component showing all keyboard shortcuts

**Search and Filtering**:
- Fuzzy search powered by fuse.js
- Searches both note titles and content
- Real-time filtering as you type
- Tag-based filtering (click tags to filter)
- Combine search query with tag filters
- Shows result count with active filters
- "Clear All" button to reset search and tag filters
- Empty state when no results found
- Keyboard shortcut: Press `S` to focus search input

**Markdown Support**:
- Full GitHub Flavored Markdown (GFM) support via `remark-gfm`
- Syntax highlighting for code blocks via `rehype-highlight` and `highlight.js`
- Styled with `@tailwindcss/typography` prose classes (prose-neutral theme)
- Live preview while editing with three view modes:
  - Editor only (⌘+1)
  - Split view - editor and preview side-by-side (⌘+2, default)
  - Preview only (⌘+3)
- Supports: headings, lists, tables, task lists, code blocks, links, images, etc.
- External links open in new tab
- Uses `github-dark` theme for code highlighting

**Keyboard Shortcuts**:
- **Global**:
  - `?` - Show keyboard shortcuts help modal
  - `⌘+H` - Go to home
- **Home Page (My Notes)**:
  - `N` - Create new note (when not typing)
  - `S` - Focus search input
- **Note Editor**:
  - `⌘+1` - Editor only view
  - `⌘+2` - Split view
  - `⌘+3` - Preview only view
  - `⌘+S` - Save changes
- **Note View**:
  - `⌘+E` - Edit note
  - `⌘+⌫` - Delete note (with confirmation)
  - `⌘+H` - Go to home
- **Tag Input**:
  - `Enter` or `,` - Add tag
  - `Backspace` (when empty) - Remove last tag

**Autosave**:
- Automatic saving after 750ms of inactivity
- Debounced for optimal performance
- Works for both title and content changes
- Toast notifications:
  - "Saving note..." with loading spinner
  - "Note saved" on success
  - Error messages on failure
- Creates new notes on first autosave
- No data loss while editing

**Tagging System**:
- Add multiple tags to notes
- Tags are user-scoped (not shared between users)
- Auto-converted to lowercase
- Duplicate prevention
- Tag input with keyboard shortcuts (Enter/comma to add, Backspace to remove)
- Tag filtering on home page (click to filter)
- Tags displayed as badges on note cards and detail pages
- Tags autosaved along with note content

**Toast Notifications**:
- Uses `sonner` component
- Displays autosave status
- Clean, themed notifications that match dark/light mode
- Custom icons for different states (loading, success, error)

**Flow**:
1. User logs in
2. Sees list of their notes (or empty state)
3. Can search notes using the search bar (press S to focus)
4. Can filter notes by clicking tags
5. Creates a new note with title, content, and tags
6. Note autosaves as you type (750ms debounce)
7. Note appears in the list with tags
8. Can click to view full note with tags
9. Can edit note (pre-filled form with tags) or delete note (with confirmation)
10. Can toggle between light and dark themes
