# ✨ Magic Note — Full-Stack Productivity Platform

A high-performance, feature-rich note-taking application built with the most modern web technologies of 2026. This project demonstrates a production-grade architecture combining **Next.js 15.5**, **React 19**, **Supabase**, and a strictly typed **Prisma** data layer.

![Next.js](https://img.shields.io/badge/Next.js%2015.5-000000?style=flat&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React%2019-61DAFB?style=flat&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%204-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)
![Jest](https://img.shields.io/badge/Tested%20with-Jest-99424F?style=flat&logo=jest&logoColor=white)

---

## 🚀 Key Engineering Features

- **Next.js 15.5 App Router**: Leveraging the latest Server Components and Streaming patterns for instant loading states.
- **React 19 Transitions**: Utilizing the new `useActionState` and `useOptimistic` hooks for a fluid, lag-free UI experience.
- **Tailwind v4 Engine**: Built with the revolutionary CSS-first configuration and high-performance JIT engine.
- **Real-time Persistence**: Bi-directional sync with **Supabase Auth & Storage** and **Prisma ORM** for PostgreSQL.
- **Advanced State Management**: Lightweight, high-performance global state using **Zustand**.
- **Markdown Excellence**: Full GFM support with `react-markdown` and `remark-gfm` for professional note formatting.
- **Strict Quality Assurance**: Automated unit and integration tests using **Jest** and **React Testing Library**.

---

## 🏗️ Technical Architecture

```bash
magic-note/
├── prisma/             # Schema definition & migrations for PostgreSQL
├── src/
│   ├── app/            # Next.js 15 App Router (Server Components)
│   ├── components/     # UI components with Tailwind 4 & Tw-animate
│   ├── hooks/          # Custom React 19 hooks for auth & notes
│   ├── store/          # Zustand store for global application state
│   ├── lib/            # Supabase & Prisma client configurations
│   └── tests/          # Jest & Testing Library suites
└── supabase/           # Edge Functions & Auth configuration
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL instance (or Supabase project)

### Installation
1. Clone & Install:
   ```bash
   git clone https://github.com/kodirov8788/magic-note.git
   cd magic-note
   npm install
   ```
2. Database Setup:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
3. Run Development:
   ```bash
   npm run dev
   ```

---

## 🧪 Testing

```bash
npm test          # Run Jest test suite
npm run lint      # Code quality check
```

---

## 📄 License
MIT — Developed by [Kodirov Dev](https://github.com/kodirov8788)
