# Implementation Automation Platform

Enterprise-grade cloud-based platform for automating telephony product onboarding and implementation. Built with Next.js, TypeScript, and shadcn/ui.

## 🚀 Features

- **Multi-role Support**: Implementation Leads and Customers
- **Complete Onboarding Flow**: 6-step wizard with validation
- **Approval Workflows**: Phone purchase and override approvals
- **Data Integrity**: Locking, audit trails, and validation
- **Provisioning Ready**: Clean JSON payload generation
- **Bulk Operations**: Support for hundreds of locations
- **Production Ready**: Security, logging, error tracking

## 📋 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix-based)
- **Validation**: Zod
- **Forms**: React Hook Form
- **Database**: Prisma ORM (MySQL)
- **Icons**: Lucide React

## Tech Stack

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4**
- **shadcn/ui** (Radix-based component system)
- **Zod** (validation)
- **React Context** (auth state management)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for complete structure.

Key directories:
- `/app` - Next.js routes and API endpoints
- `/components` - React components
- `/lib` - Business logic, services, utilities
- `/types` - TypeScript type definitions
- `/hooks` - Custom React hooks
- `/prisma` - Database schema
- `/docs` - Documentation

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- MySQL database (for production)

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   ```
   http://localhost:3000
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Type check without building
- `npm run format` - Format code with Prettier
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Prisma Studio

## 📚 Documentation

- [Project Structure](./PROJECT_STRUCTURE.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Domain Model](./docs/DOMAIN_MODEL.md)
- [API Documentation](./docs/API_DOCUMENTATION.md)
- [Testing Guide](./HOW_TO_TEST.md)
- [Production Readiness](./docs/PRODUCTION_READINESS.md)

## 🔐 Authentication

### Current Phase (Mock Auth)

- Users can log in with name and email
- No real authentication backend
- User data stored in localStorage
- Simulated network delay

### Future Phase

The architecture supports:
- JWT-based authentication
- OAuth integration (Google Sign-In)
- Session management
- Role-based access control
   - Update `getCurrentUser()` to fetch from OAuth provider
   - Keep the same interface (`User` type, function signatures)

2. No UI or routing changes required
3. The `AuthContext` will automatically work with the new implementation

## Available Routes

- `/` - Redirects to `/login`
- `/login` - Authentication page
- `/dashboard` - Protected dashboard (requires authentication)
- `/login-page-01` - Shadcn Studio demo login page

## Development

### Adding shadcn/ui Components

```bash
npx shadcn@latest add [component-name]
```

### Building for Production

```bash
npm run build
npm start
```

## Notes

- Authentication is currently mocked for development
- All auth logic is abstracted in `lib/auth.ts` for easy replacement
- The UI follows shadcn design system principles
- Supports light and dark mode via Tailwind CSS

