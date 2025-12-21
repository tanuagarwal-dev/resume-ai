# Quick Start Guide

## For New Developers

### 1. Clone and Setup (5 minutes)

```bash
# Clone the repository
git clone <repo-url>
cd ai-career-coach

# Install dependencies
npm install

# Copy environment template and fill in your secrets
cp .env.example .env.local
# Edit .env.local with your API keys:
# - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# - CLERK_SECRET_KEY
# - DATABASE_URL
# - GOOGLE_GENERATIVE_AI_API_KEY
```

### 2. Initialize Database (3 minutes)

```bash
# Push Prisma schema to database
npx prisma db push

# Optional: Seed demo data
npm run seed
```

### 3. Start Developing (1 minute)

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# In another terminal, run tests in watch mode
npm run test:watch
```

### 4. Make Changes

- Code changes auto-reload (Turbopack)
- Tests re-run on file changes
- Check [README.md](README.md) for architecture overview

---

## Common Commands

```bash
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm test                # Run all tests once
npm run test:watch     # Run tests in watch mode
npm run test:ui        # Open test UI dashboard
npm run lint            # Check code quality
npm run seed            # Populate demo data
```

---

## Testing Your Changes

### Unit Tests

```bash
# Run all tests
npm test

# Watch mode (auto-rerun on changes)
npm run test:watch

# Interactive UI
npm run test:ui
```

### Manual Testing

1. **Quiz Generation**: `/interview/mock` → Start Quiz
2. **Cover Letter**: `/ai-cover-letter/new` → Fill form → Generate
3. **Dashboard**: `/dashboard` → View insights
4. **Theme**: Click Sun/Moon icon in header → Should toggle dark/light mode
5. **Error Handling**: Disable internet → Try to generate → Should show error toast

---

## Understanding the Architecture

### AI Calls Flow

1. User triggers action (e.g., "Generate Quiz")
2. Rate limiter checks: Is user within limits? (3/min)
3. If blocked → Show error message
4. If allowed → Call `aiJson()` or `aiText()` helper
5. AI helper calls Gemini API with retry logic
6. Response validated against Zod schema
7. Data saved to database or returned to user
8. Success toast shown

### Key Files to Know

- `lib/ai.js` - AI infrastructure (model selection, helpers, retries)
- `lib/ai-schemas.js` - Zod validation schemas
- `lib/rateLimit.js` - Rate limiting logic
- `actions/` - Server actions (quiz, cover-letter, dashboard, resume)
- `app/(main)/` - Page components
- `components/` - Reusable UI components
- `prisma/schema.prisma` - Database schema

### Database Schema

- `User` - Clerk user profile
- `Quiz` - Generated quiz questions
- `QuizResult` - User quiz scores
- `CoverLetter` - Generated cover letters
- `Resume` - User resume data
- `IndustryInsight` - AI-generated industry insights (cached)

---

## Debugging Tips

### "Model not found" Error

- Check: `lib/ai.js` has `getModel()` with ListModels API
- This auto-detects available models
- If still failing: Check `GOOGLE_GENERATIVE_AI_API_KEY` in .env.local

### Rate Limit Exceeded

- Gemini API: Free tier limited to 2 requests/minute
- Quiz/Letter: Limited to 3 requests/minute to users
- Wait 1 minute before retrying
- Consider upgrading Gemini API plan

### Database Connection Errors

- Verify `DATABASE_URL` in .env.local
- Check database is running and accessible
- Run: `npx prisma db push --force-reset` to resync

### Test Failures

- Clear Vitest cache: `npm test -- --clearCache`
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node version: `node --version` (should be 18+)

---

## Before Committing

```bash
# 1. Format code
npm run lint

# 2. Run all tests
npm test

# 3. Build to check for errors
npm run build

# 4. Commit
git add .
git commit -m "Your change description"
git push
```

---

## Getting Help

1. **Test Guide**: See [TESTING.md](TESTING.md) for detailed test documentation
2. **Full README**: See [README.md](README.md) for architecture and troubleshooting
3. **Completion Summary**: See [COMPLETION_SUMMARY.md](COMPLETION_SUMMARY.md) for all improvements made
4. **Code Comments**: Many files have inline comments explaining logic

---

## Production Checklist

Before deploying to production:

- [ ] Run `npm test` - all tests pass
- [ ] Run `npm run build` - build succeeds
- [ ] Run `npm run lint` - no linting errors
- [ ] `.env.local` has all required variables (check `.env.example`)
- [ ] Database migrations are up to date: `npx prisma db push`
- [ ] GOOGLE_GENERATIVE_AI_API_KEY is valid
- [ ] Clerk authentication is configured
- [ ] Dark mode toggle works (test in browser)
- [ ] Rate limiting is active (try rapid requests)
- [ ] Error toasts display on failures (disconnect internet to test)

---

## Next Steps

1. **Understand the codebase**: Start with [README.md](README.md)
2. **Make a small change**: Modify a component, run tests
3. **Add a feature**: Follow existing patterns in `actions/` and `components/`
4. **Write tests**: Add test case in `__tests__/`
5. **Submit PR**: Run full test suite, create pull request

---

**Need help?** Check the README.md troubleshooting section or review test files for usage examples.
