# Contributing Guide

## Development Workflow

### 1. Setup
```bash
npm install
cp .env.example .env
# Configure .env with your settings
npm run dev
```

### 2. Code Standards

#### TypeScript
- Use strict TypeScript
- Define types in `/types/index.ts`
- Avoid `any` types
- Use interfaces for object shapes

#### Components
- Use functional components with hooks
- Keep components focused and small
- Extract reusable logic to hooks
- Use shadcn/ui components

#### Styling
- Use Tailwind CSS utilities
- Follow the simplified design system
- Maintain consistent spacing
- Use `cn()` for className composition

#### API Routes
- Use middleware from `/lib/api/middleware.ts`
- Handle errors with error handler wrapper
- Return consistent `ApiResponse` format
- Add validation using Zod schemas

### 3. File Naming

- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Types: `index.ts` (barrel export)
- Constants: `UPPER_SNAKE_CASE` or `camelCase` objects

### 4. Testing

- Test user flows manually
- Check error handling
- Verify responsive design
- Test with different user roles

### 5. Documentation

- Update relevant docs when adding features
- Add JSDoc comments for complex functions
- Document API changes
- Update type definitions

## Branch Strategy

- `main`: Production-ready code
- `develop`: Development branch
- `feature/*`: Feature branches
- `fix/*`: Bug fix branches

## Commit Messages

Use clear, descriptive commit messages:
- `feat: add bulk approval feature`
- `fix: resolve dropdown overlap issue`
- `refactor: simplify onboarding wizard`
- `docs: update API documentation`

## Pull Request Process

1. Create feature branch
2. Make changes following standards
3. Test thoroughly
4. Update documentation
5. Create pull request with description
6. Address review feedback
