# Linespedia Community MVP

Linespedia is a writing-first, typography-focused social community platform where users publish and read poems, stories, shayari, quotes, lyrics, and thoughts categorized and driven by core emotions.

---

## 🚀 Key Features

- **Emotion-Driven Cataloging**: Explore and publish writings categorized by emotions: *Love, Sad, Hope, Peace, Motivation, Anger, Fear, Humor, Nostalgia, Dream, Gratitude, and Mystery*.
- **Hexclave Authentication**: Seamless authentication using Stack Auth (Hexclave) Cloud Identity Provider.
- **TipTap Canvas Editor**: A distraction-free typography rich editor with local auto-saving draft recovery.
- **Interactive Disccussion Threads**: Nested comments and structured reaction systems (Love, Sad, Hope, Peace, etc.).
- **Search Palette**: Command-K search overlay for exploring writings, tags, and users instantly.
- **Premium UX Design**: Custom, clean typographic styling utilizing pure shadcn UI components.
- **High-fidelity SEO & JSON-LD**: Pure Server Component routing (`page.tsx`) with dynamic SEO tags, dynamic RSS feeds (`/feed.xml`), sitemaps, and rich metadata schemas.

---

## 🛠️ Technology Stack

- **Framework**: Next.js (App Router, Server Components)
- **API Routing**: Hono.js catch-all API handler
- **Database**: Neon DB (PostgreSQL) Serverless
- **ORM**: Drizzle ORM
- **Authentication**: `@hexclave/next`
- **UI Components**: Shadcn UI & Base UI
- **Rich Text Editor**: TipTap Editor
- **Global State**: Zustand

---

## 📂 Project Architecture

```
├── src
│   ├── app                 # Next.js App Router (Pure Server Components)
│   │   ├── api             # Hono catch-all endpoints
│   │   ├── explore         # Emotion categories browsing
│   │   ├── post            # Dynamic single reading pages
│   │   └── profile         # User bio & statistic tabs
│   ├── components          # Reusable UI & Client Containers
│   │   ├── common          # Navigation header, providers, search palette
│   │   ├── editor          # TipTap editor & drafts listing
│   │   ├── feed            # Post cards, comments, bookmarking, reactions
│   │   └── ui              # Primitive styled shadcn components
│   ├── db                  # Database configuration & schema declarations
│   └── hexclave            # Authentication clients (Client/Server)
```

---

## ⚙️ Setup and Installation

### 1. Environment Variables
Create a `.env.local` file at the root:

```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
NEXT_PUBLIC_HEXCLAVE_API_URL=https://api.stack-auth.com
NEXT_PUBLIC_HEXCLAVE_PROJECT_ID=8db5d0ee-b051-46b4-94db-494f90dd5927
```

### 2. Install Dependencies
```bash
bun install
```

### 3. Database Migrations
Deploy schema:
```bash
bunx drizzle-kit push
```

### 4. Running Locally
```bash
bun run dev
```

---

## 📄 License
This project is open source and available under the MIT License.
