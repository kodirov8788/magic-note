# Magic Note

A full-stack note-taking platform built to demonstrate modern React and backend integration patterns around authentication, persistence, testing, and developer ergonomics.

**Live demo:** https://magic-note-gamma.vercel.app

## What This Project Shows
- Full-stack product thinking, not just UI assembly
- Typed database workflows with Prisma
- Auth and storage integration through Supabase
- Modern React patterns with test coverage

## Why This Stack / Tooling
- **Next.js 15 + React 19** were chosen for server-first rendering, modern App Router workflows, and a responsive UI architecture.
- **Supabase** handles hosted auth and storage so the app can focus on product behavior instead of rebuilding commodity platform features.
- **Prisma + PostgreSQL** give type-safe data access and a maintainable schema workflow.
- **Zustand** keeps client state lightweight instead of introducing heavier global state abstractions.
- **Jest + Testing Library** provide regression coverage for core note flows and UI behavior.

## Stack
- Next.js 15.5
- React 19
- TypeScript
- Supabase
- Prisma
- PostgreSQL
- Tailwind CSS
- Jest + Testing Library

## Key Features
- Authenticated note management flows
- Markdown-friendly content rendering
- Database migration and health-check scripts
- Sample-user and setup automation for local development

## Project Structure
- `src/app/`: route and server/client UI composition
- `src/components/`: shared interface building blocks
- `src/lib/`: infrastructure helpers and integrations
- `prisma/`: schema and migration workflow
- `scripts/`: operational scripts for setup and debugging

## Getting Started
```bash
npm install
npm run dev
npm test
```

Environment setup details are documented in `setup.md`.

## Why It Matters For Hiring
This repo is one of the strongest examples of end-to-end product engineering in the portfolio: UI, data modeling, tooling, testing, and operational scripts are all part of the story.
