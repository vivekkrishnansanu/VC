# Setup Instructions

## Initial Setup

This project is configured with:
- Next.js 15 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui components

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- Next.js, React, TypeScript
- Tailwind CSS and PostCSS
- shadcn/ui dependencies (Radix UI, class-variance-authority, etc.)
- Zod for validation
- Lucide React for icons

## Step 2: Verify shadcn/ui Configuration

The project includes a `components.json` file that configures shadcn/ui. The following components are already set up:

- `button`
- `card`
- `checkbox`
- `input`
- `label`
- `separator`

All components are located in `components/ui/`.

## Step 3: Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

### Authentication System

- **Mock Auth**: `lib/auth.ts` - Contains mock authentication logic
- **Auth Context**: `context/AuthContext.tsx` - React context for auth state
- **Login Page**: `app/(auth)/login/page.tsx` - Main login page
- **Auth Components**: `components/auth/` - Reusable auth components

### Shadcn Studio Block

- **Demo Login**: `app/login-page-01/page.tsx` - Shadcn Studio login block demo
- **Components**: `components/shadcn-studio/` - Shadcn Studio components

## Adding More shadcn/ui Components

To add additional shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

The component will be automatically added to `components/ui/` based on your `components.json` configuration.

## Notes

- All imports use the `@/` alias configured in `tsconfig.json`
- Tailwind CSS variables are defined in `app/globals.css`
- The project supports both light and dark modes
- Authentication is currently mocked and will be replaced with Google OAuth in a future phase

