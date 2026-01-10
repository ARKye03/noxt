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
- `@radix-ui/react-slot` - Used by shadcn/ui components for polymorphic behavior
- `class-variance-authority` - Component variant management
- `tw-animate-css` - Additional Tailwind animations

## Development Notes

### Verify errors and linting
Always run `bunx --bun tsc --noEmit` to verify there are no type errors before committing, and `bun lint` to verify there are no linting errors before committing.

### Adding shadcn/ui Components
Components are in `components/ui/` and use the `cn()` utility from `lib/utils.ts`. They follow the shadcn/ui pattern with CVA variants and Radix UI primitives.

### Working with Fonts
The project uses Geist Sans and Geist Mono from Google Fonts, loaded via `next/font/google` in the root layout.

### Dark Mode
Dark mode uses a class-based approach with the custom `.dark` class. The variant is defined in globals.css with `@custom-variant dark (&:is(.dark *))`. The `ThemeProvider` component (in `components/theme-provider.tsx`) automatically detects the system color scheme preference and applies the dark class to the document element.

### Authentication
The app uses Lucia Auth with Prisma adapter for session-based authentication:
- `lib/auth.ts` - Lucia configuration and `validateRequest()` helper
- `lib/db.ts` - Prisma client singleton
- `lib/actions/auth.ts` - Server actions for signup, login, and logout
- `middleware.ts` - Route protection (redirects unauthenticated users to /login)
- Password hashing uses Argon2id via the `oslo` library

**Database Models**:
- `User` - email, name, hashedPassword, sessions[], notes[]
- `Session` - id, userId, expiresAt (managed by Lucia)
- `Note` - id, title, content, userId

**Protected Routes**: All routes except `/login` and `/signup` require authentication.
