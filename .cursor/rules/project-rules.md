# Project Rules - Note-Taking Application

## Architecture Patterns

### Next.js 14 App Router Conventions

- Use Server Components by default for data fetching and initial rendering
- Use Client Components only when interactivity is required ('use client')
- Implement proper loading.tsx and error.tsx files for route segments
- Use route groups for organization: (auth), (dashboard)

### Supabase Client Usage Patterns

- Server Components: Use `createClient()` from `@/lib/supabase/server`
- Client Components: Use `createClient()` from `@/lib/supabase/client`
- Middleware: Use `createServerClient` from `@supabase/ssr` for auth checks
- Always check user authentication before database operations

### Component Organization Standards

```
src/components/
├── ui/           # Shadcn/UI components
├── auth/         # Authentication components
├── folders/      # Folder management components
├── notes/        # Note-related components
└── layout/       # Layout components
```

### API Route Patterns

- All API routes must check authentication first
- Use proper HTTP status codes (200, 201, 400, 401, 404, 500)
- Validate input data before database operations
- Handle errors gracefully with appropriate error messages
- Use RLS policies for data security

## TypeScript Standards

### Strict Type Safety

- No `any` types without explicit justification in comments
- Use proper TypeScript interfaces for all data structures
- Generate Supabase types: `supabase gen types typescript`
- Use Database type from `@/types/database` for type safety

### Error Handling

- Use proper error types instead of generic Error
- Implement error boundaries for React components
- Log errors with structured logging (console.error with context)
- Show user-friendly error messages via toast notifications

## Security Guidelines

### Authentication & Authorization

- All routes protected by middleware
- RLS policies enforce user isolation
- Validate user ownership for all CRUD operations
- Use Supabase session management for auth state

### Input Validation

- Validate all user inputs on server-side
- Sanitize markdown content to prevent XSS
- Use proper TypeScript types for validation
- Implement rate limiting for API routes (future enhancement)

### Environment Variables

- Never expose sensitive keys in client-side code
- Use NEXT*PUBLIC* prefix only for safe public variables
- Store service role keys securely on server-side only

## Performance Guidelines

### Database Optimization

- Use proper indexes for frequently queried fields
- Implement pagination for large datasets
- Use select() to limit returned fields
- Optimize queries to avoid N+1 problems

### React Performance

- Use React.memo for expensive components
- Implement proper key props for lists
- Use useCallback and useMemo for expensive operations
- Lazy load components when appropriate

### UI/UX Performance

- Implement debounced auto-save (500ms)
- Show loading states for async operations
- Use optimistic updates where appropriate
- Implement proper error boundaries

## Code Quality Standards

### Naming Conventions

- Use PascalCase for components and types
- Use camelCase for functions and variables
- Use kebab-case for file names
- Use descriptive names that explain purpose

### File Organization

- One component per file
- Group related functionality together
- Use barrel exports (index.ts) for clean imports
- Keep files focused and single-purpose

### Documentation

- Add JSDoc comments for complex functions
- Explain business logic in comments
- Document API endpoints with proper descriptions
- Keep README updated with setup instructions

## Testing Standards

### Type Checking

- Run `tsc --noEmit` before every commit
- Fix all TypeScript errors immediately
- Use strict TypeScript configuration
- No type assertions without proper validation

### Manual Testing Checklist

- [ ] Authentication flows (signup, login, logout)
- [ ] Folder CRUD operations
- [ ] Note CRUD operations
- [ ] Copy functionality (all, selected, line)
- [ ] Markdown rendering and editing
- [ ] Responsive design on mobile/tablet
- [ ] Error handling and edge cases

## Deployment Guidelines

### Environment Setup

- Configure Supabase project with proper RLS policies
- Set up environment variables securely
- Configure domain and CORS settings
- Set up proper backup strategies

### Build Process

- Run type checking: `tsc --noEmit`
- Run linting: `npm run lint`
- Build production: `npm run build`
- Test production build locally before deployment

## Future Enhancements

### Planned Features

- Real-time collaboration
- Note sharing and permissions
- Advanced search functionality
- File attachments
- Note templates
- Export functionality (PDF, Markdown)

### Technical Debt

- Implement proper error monitoring
- Add comprehensive test suite
- Optimize bundle size
- Implement caching strategies
- Add accessibility improvements
